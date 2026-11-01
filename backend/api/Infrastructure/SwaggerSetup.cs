using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public static class SwaggerSetup
{
    public static void AddApiExplorer(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options => {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "XUEYAN API", Version = "v1", Description = "API học tiếng Trung • SQL Server. Để thử: POST /auth/login → Try it out → Execute bằng tài khoản của bạn. Cookie HttpOnly được gửi tự động trên cùng origin; sau đó gọi /auth/me và API theo quyền. Login không trả token trong JSON. Logout thu hồi phiên. Validation trả error + fields; 401 cần đăng nhập, 403 thiếu quyền, 404 không tồn tại, 409 xung đột, 429 quá nhiều yêu cầu. Không có tài khoản mặc định." });
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT", Description = "Tùy chọn cho JWT hợp lệ từ client riêng. Thử trực tiếp bằng cookie: chỉ cần Execute /auth/login, không cần Authorize." });
            options.OperationFilter<ApiOperationDocumentation>();
            options.SchemaFilter<ApiRequestSchema>();
        });
    }
}
public sealed class ApiOperationDocumentation : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.ApiDescription.HttpMethod == "POST" && context.MethodInfo.Name is "Create" or "Register") { operation.Responses.Remove("200"); operation.Responses["201"] = new() { Description = "Đã tạo bản ghi." }; }
        if (context.MethodInfo.Name == "Logout") { operation.Responses.Remove("200"); operation.Responses["204"] = new() { Description = "Đã thu hồi phiên." }; }
        var anonymous = context.MethodInfo.GetCustomAttributes(true).OfType<AllowAnonymousAttribute>().Any();
        if (!anonymous && context.ApiDescription.RelativePath != "health") operation.Security = [new OpenApiSecurityRequirement { [new OpenApiSecurityScheme { Reference = new() { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }] = [] }];
        foreach (var code in new[] { "400", "401", "403", "404", "409", "429", "503" }) operation.Responses.TryAdd(code, new OpenApiResponse { Description = code switch { "400" => "Dữ liệu sai: error và fields (tên trường → danh sách lỗi).", "401" => "Phiên thiếu, sai, hết hạn hoặc bị thu hồi.", "403" => "Không có quyền.", "404" => "Tài nguyên không tồn tại.", "409" => "Trùng dữ liệu, version cũ hoặc dữ liệu đang được sử dụng.", "429" => "Đợi một phút trước khi thử lại.", _ => "Dịch vụ chưa khả dụng; không xác nhận đã lưu." } });
        var resource = operation.Parameters?.FirstOrDefault(p => p.Name == "resource");
        if (resource == null) return;
        var get = context.ApiDescription.HttpMethod == "GET";
        resource.Schema.Enum = (get ? new[] { "words", "lessons", "teachers", "users", "levels" } : new[] { "words", "lessons", "teachers", "users" }).Select(v => (IOpenApiAny)new OpenApiString(v)).ToList();
        if (context.ApiDescription.HttpMethod is not ("POST" or "PUT")) return;
        var update = context.ApiDescription.HttpMethod == "PUT";
        var samples = new Dictionary<string, string> {
            ["words"] = """{"slug":"xue-xi","simplified":"学习","pinyin":"xuéxí","hanViet":"HỌC TẬP","meaningVi":"Học tập","status":"published"}""",
            ["lessons"] = """{"slug":"chao-hoi","levelId":1,"title":"Chào hỏi","description":"Bài giới thiệu","sortOrder":1,"status":"draft"}""",
            ["teachers"] = """{"slug":"giao-vien-thu","displayName":"Giáo viên thử","headline":"Hán ngữ","bio":"Giới thiệu","consultationSchedule":"Thứ 7","status":"draft"}""",
            ["users"] = update ? """{"displayName":"Người học","roleCode":"learner","status":"active"}""" : """{"displayName":"Người học","email":"learner@example.com","password":"ThayBangMatKhauCuaBan123!"}"""
        };
        if (update) foreach (var key in new[] { "words", "teachers" }) samples[key] = samples[key][..^1] + ",\"version\":\"THAY_VERSION_TU_GET\"}";
        operation.Description = "Chọn resource rồi chọn example trùng tên resource. PUT là cập nhật đủ form; words/teachers cần version Base64 8 byte từ GET. levelId lấy từ GET /admin/levels. Không dùng thông tin ví dụ làm tài khoản mặc định.";
        operation.RequestBody = new OpenApiRequestBody { Required = true, Content = new Dictionary<string, OpenApiMediaType> { ["application/json"] = new() { Schema = new OpenApiSchema { Type = "object", AdditionalPropertiesAllowed = true }, Examples = samples.ToDictionary(p => p.Key, p => new OpenApiExample { Summary = p.Key, Value = OpenApiAnyFactory.CreateFromJson(p.Value) }) } } };
    }
}

public sealed class ApiRequestSchema : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(RegisterRequest) || context.Type == typeof(LoginRequest))
        {
            schema.Required = new HashSet<string> { "email", "password" };
            schema.Properties["email"].MaxLength = 254; schema.Properties["email"].Format = "email";
            var password = schema.Properties["password"]; password.MinLength = context.Type == typeof(RegisterRequest) ? 8 : 1; password.MaxLength = 128; password.Format = "password"; password.WriteOnly = true;
            if (context.Type == typeof(RegisterRequest)) { schema.Required.Add("name"); schema.Properties["name"].MinLength = 1; schema.Properties["name"].MaxLength = 80; }
        }
        if (context.Type == typeof(ReviewRequest))
        {
            schema.Required = new HashSet<string> { "wordId", "rating", "eventId" };
            schema.Properties["wordId"].Minimum = 1; schema.Properties["rating"].Minimum = 1; schema.Properties["rating"].Maximum = 4;
            schema.Properties["durationMs"].Minimum = 0; schema.Properties["durationMs"].Maximum = 3600000;
            schema.Properties["eventId"].Description = "UUID khác rỗng, giữ nguyên khi retry cùng lượt học. UUID mới cho lượt học mới.";
        }
    }
}
