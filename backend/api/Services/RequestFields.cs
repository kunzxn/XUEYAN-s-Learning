using System.Text.Json;

public static class RequestFields
{
    public static string Text(JsonElement body,string field,int max,int min=1,bool trim=true) {
        if(min==0 && body.ValueKind==JsonValueKind.Object && (!body.TryGetProperty(field,out var optional)||optional.ValueKind==JsonValueKind.Null))return "";
        if(body.ValueKind!=JsonValueKind.Object||!body.TryGetProperty(field,out var property)||property.ValueKind!=JsonValueKind.String)throw new ApiError(400,$"Thiếu trường {field}.");
        var value=property.GetString()??"";if(trim)value=value.Trim().Normalize(System.Text.NormalizationForm.FormC);if(value.Length<min||value.Length>max)throw new ApiError(400,$"Trường {field} cần {min}–{max} ký tự.");return value;
    }
    public static string Email(JsonElement body) {var email=Text(body,"email",254);if(!System.Net.Mail.MailAddress.TryCreate(email,out var parsed)||parsed.Address!=email)throw new ApiError(400,"Email chưa hợp lệ.");return email;}
    public static string Choice(JsonElement body,string field,params string[] options) {var value=Text(body,field,30);if(!options.Contains(value))throw new ApiError(400,$"Trường {field} không hợp lệ.");return value;}
    public static long Number(JsonElement body,string field,long min,long max) {if(body.ValueKind!=JsonValueKind.Object||!body.TryGetProperty(field,out var p)||!long.TryParse(p.ToString(),out var n)||n<min||n>max)throw new ApiError(400,$"Trường {field} không hợp lệ.");return n;}
}
