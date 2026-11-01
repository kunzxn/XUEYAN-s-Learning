using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder=WebApplication.CreateBuilder(args.Where(arg=>arg!="--bootstrap-admin"&&arg!="--import-hsk").ToArray());
builder.WebHost.ConfigureKestrel(options=>options.Limits.MaxRequestBodySize=65536);
builder.Services.AddSingleton<Database>();
builder.Services.AddScoped<GoogleLoginService>();
builder.Services.AddScoped<IProfileRepository,ProfileRepository>();
builder.Services.AddScoped<IProfileService,ProfileService>();
builder.Services.AddScoped<ILibraryRepository,LibraryRepository>();
builder.Services.AddApiExplorer();
builder.Services.AddXueyanAuthentication(JwtSettings.Load(builder.Configuration,builder.Environment));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ISpacedRepetitionScheduler,SpacedRepetitionScheduler>();
builder.Services.AddSingleton<IPublishedWordCache,PublishedWordCache>();
builder.Services.AddSingleton<PasswordHasher<string>>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IEfReadRepository,EfReadRepository>();
builder.Services.AddScoped<IAuthRepository,AuthRepository>();
builder.Services.AddScoped<IAdminRepository,AdminRepository>();
builder.Services.AddScoped<ILearningRepository,LearningRepository>();
builder.Services.AddScoped<IAuthService,AuthService>();
builder.Services.AddScoped<IAdminService,AdminService>();
builder.Services.AddScoped<ILearningService,LearningService>();
builder.Services.AddScoped<ICurrentActor,CurrentActor>();
builder.Services.AddControllers().ConfigureApiBehaviorOptions(options=>options.InvalidModelStateResponseFactory=context=>new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new {error="Dữ liệu nhập chưa hợp lệ.",fields=context.ModelState.Where(pair=>pair.Value?.Errors.Count>0).ToDictionary(pair=>string.IsNullOrEmpty(pair.Key.TrimStart('$','.'))?"body":System.Text.Json.JsonNamingPolicy.CamelCase.ConvertName(pair.Key.TrimStart('$','.')),pair=>pair.Value!.Errors.Select(error=>string.IsNullOrEmpty(error.ErrorMessage)||error.Exception!=null?"Nội dung thiếu hoặc sai định dạng JSON/kiểu dữ liệu.":error.ErrorMessage))}));
builder.Services.AddRateLimiter(options=>{
 options.RejectionStatusCode=429;
 options.OnRejected=async(context,token)=>await context.HttpContext.Response.WriteAsJsonAsync(new{error="Bạn đã thử quá nhiều lần. Vui lòng đợi một phút rồi thử lại."},token);
 options.AddPolicy("auth",context=>RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString()??"local",_=>new FixedWindowRateLimiterOptions{PermitLimit=15,Window=TimeSpan.FromMinutes(1),QueueLimit=0}));
});
var app=builder.Build();
if(args.Contains("--import-hsk")){
 await HskImporter.Run(app.Services.GetRequiredService<Database>(),Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath,"../../data/HSK-3.0-words-list-main/HSK list with meaning")));
 return;
}
app.UseMiddleware<ApiErrorsMiddleware>();
if(app.Environment.IsDevelopment()){app.UseSwagger();app.UseSwaggerUI(options=>{options.SwaggerEndpoint("/swagger/v1/swagger.json","XUEYAN API v1");options.EnableTryItOutByDefault();options.UseRequestInterceptor("(request) => { request.headers['X-Xueyan-Client'] = 'web'; request.credentials = 'same-origin'; return request; }");});}
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.Use(async(context,next)=>{if(context.Request.Method is not("GET" or "HEAD" or "OPTIONS")&&context.Request.Headers["X-Xueyan-Client"]!="web"&&!context.Request.Headers.Authorization.ToString().StartsWith("Bearer ",StringComparison.OrdinalIgnoreCase))throw new ApiError(403,"Yêu cầu không hợp lệ.");await next(context);});
app.MapGet("/health",()=>new{status="ok"}).AllowAnonymous();
app.MapControllers();
if(args.Contains("--bootstrap-admin")){
 using var scope=app.Services.CreateScope();
 await scope.ServiceProvider.GetRequiredService<IAuthService>().Bootstrap(Environment.GetEnvironmentVariable("XUEYAN_ADMIN_EMAIL")??throw new Exception("Set XUEYAN_ADMIN_EMAIL."),Environment.GetEnvironmentVariable("XUEYAN_ADMIN_PASSWORD")??throw new Exception("Set XUEYAN_ADMIN_PASSWORD."));
 Console.WriteLine("Admin created. No password was printed.");return;
}
app.Run();
public partial class Program;
