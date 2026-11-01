using System.Net.Mail;
using System.Text.Json;
using System.Text.RegularExpressions;

public static class RequestValidation
{
    public static void Auth(string? email, string? password, string? name = null, bool register = false)
    {
        var errors = new Dictionary<string, string[]>();
        void Error(string key, string message) => errors[key] = [message];
        if (string.IsNullOrWhiteSpace(email) || email.Trim().Length > 254 || !MailAddress.TryCreate(email?.Trim(), out var parsed) || parsed.Address != email.Trim() || !parsed.Host.Contains('.')) Error("email", "Nhập địa chỉ email hợp lệ, tối đa 254 ký tự.");
        if (string.IsNullOrWhiteSpace(password) || password.Length < (register ? 8 : 1) || password.Length > 128 || password.Any(char.IsControl)) Error("password", register ? "Mật khẩu cần 8–128 ký tự, không chỉ gồm khoảng trắng hoặc ký tự điều khiển." : "Mật khẩu cần 1–128 ký tự hợp lệ.");
        if (register && (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 80 || name.Any(char.IsControl))) Error("name", "Họ tên cần 1–80 ký tự, không chỉ gồm khoảng trắng.");
        Throw(errors);
    }
    public static void Review(ReviewRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (request.WordId < 1) errors["wordId"] = ["ID từ phải là số nguyên dương."];
        if (request.Rating is < 1 or > 4) errors["rating"] = ["Mức đánh giá phải từ 1 đến 4."];
        if (request.EventId == Guid.Empty) errors["eventId"] = ["Mã thao tác phải là UUID khác rỗng."];
        if (request.DurationMs is < 0 or > 3600000) errors["durationMs"] = ["Thời gian học phải từ 0 đến 3.600.000 ms."];
        Throw(errors);
    }
    public static void Admin(string resource, JsonElement body, bool update)
    {
        if (!new[] { "words", "lessons", "teachers", "users" }.Contains(resource)) throw new ApiError(404, "Không có mục quản lý này.");
        var errors = new Dictionary<string, string[]>();
        if (body.ValueKind != JsonValueKind.Object) { errors["body"] = ["Nội dung yêu cầu phải là một JSON object."]; Throw(errors); }
        string Text(string key, int max, bool required = true, bool multiline = false, bool trim = true)
        {
            if (!body.TryGetProperty(key, out var p) || p.ValueKind == JsonValueKind.Null) { if (required) errors[key] = ["Vui lòng nhập trường này."]; return ""; }
            if (p.ValueKind != JsonValueKind.String) { errors[key] = ["Giá trị phải là chuỗi văn bản."]; return ""; }
            var value = p.GetString()!; if (trim) value = value.Trim().Normalize(System.Text.NormalizationForm.FormC);
            if ((required && string.IsNullOrWhiteSpace(value)) || value.Length > max || value.Any(c => char.IsControl(c) && !(multiline && c is '\n' or '\r' or '\t')))
                errors[key] = [$"Trường này cần {(required ? "1" : "0")}–{max} ký tự hợp lệ{(multiline ? "." : ", không xuống dòng.")}"];
            return value;
        }
        void Choice(string key, params string[] allowed) { var value = Text(key, 30); if (value.Length > 0 && !allowed.Contains(value)) errors[key] = ["Giá trị không nằm trong danh sách được hỗ trợ."]; }
        void Number(string key) { if (!body.TryGetProperty(key, out var p) || p.ValueKind is not (JsonValueKind.String or JsonValueKind.Number) || !long.TryParse(p.ToString(), out var value) || value < 1 || value > int.MaxValue) errors[key] = ["Giá trị phải là số nguyên từ 1 đến 2.147.483.647."]; }
        if (resource == "users")
        {
            Text("displayName", 80);
            if (update) { Choice("roleCode", "learner", "teacher", "admin"); Choice("status", "pending", "active", "suspended", "closed"); }
            else
            {
                var email = Text("email", 254); var password = Text("password", 128, trim: false);
                try { Auth(email, password, "Admin-created learner", true); } catch (ApiError e) { foreach (var pair in e.Fields!) errors[pair.Key] = pair.Value; }
            }
        }
        else
        {
            var slug = Text("slug", 100);
            if (slug.Length > 0 && !Regex.IsMatch(slug, "^[a-z0-9]+(?:-[a-z0-9]+)*$")) errors["slug"] = ["Slug chỉ dùng chữ thường, số và dấu gạch nối giữa các nhóm."];
            Choice("status", "draft", "published", "archived");
            if (resource == "words")
            {
                var han = Text("simplified", 100); var pinyin = Text("pinyin", 200);
                Text("hanViet", 200, false); Text("meaningVi", 2000, multiline: true);
                if (han.Length > 0 && !han.EnumerateRunes().Any(r => r.Value is >= 0x3400 and <= 0x9fff or >= 0xf900 and <= 0xfaff or >= 0x20000 and <= 0x323af)) errors["simplified"] = ["Chữ Hán phải chứa ít nhất một ký tự Hán."];
                if (pinyin.Length > 0 && (!Regex.IsMatch(pinyin, "^[a-zA-Z\\u00c0-\\u024f\\u1e00-\\u1eff0-5 '’·:,-]+$") || !pinyin.Any(char.IsLetter))) errors["pinyin"] = ["Pinyin cần chữ Latin, dấu thanh hoặc số thanh 0–5; không dùng chữ Hán/emoji."];
            }
            if (resource == "lessons") { Text("title", 200); Text("description", 2000, false, true); Number("levelId"); Number("sortOrder"); }
            if (resource == "teachers") { Text("displayName", 100); Text("headline", 200, false); Text("bio", 4000, false, true); Text("consultationSchedule", 1000, false, true); }
            if (update && resource != "lessons")
            {
                var version = Text("version", 30);
                try { if (Convert.FromBase64String(version).Length != 8) throw new FormatException(); } catch (FormatException) { errors["version"] = ["Version phải là rowversion 8 byte mã hóa Base64 từ bản ghi vừa đọc."]; }
            }
        }
        Throw(errors);
    }
    private static void Throw(Dictionary<string, string[]> errors) { if (errors.Count > 0) throw new ApiError(400, "Dữ liệu nhập chưa hợp lệ.", errors); }
}
