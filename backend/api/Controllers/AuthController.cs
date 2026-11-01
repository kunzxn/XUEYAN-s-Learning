using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

[ApiController,Route("auth")]
public sealed class AuthController(IAuthService service,ICurrentActor current,IHostEnvironment environment,GoogleLoginService google,IProfileService? profiles=null):ControllerBase
{
    [AllowAnonymous,HttpGet("session"),ResponseCache(NoStore=true,Location=ResponseCacheLocation.None)]
    public async Task<IActionResult> Session(){
        if(HttpContext.Items[JwtAuthentication.ActorKey] is not Actor actor){
            if(Request.Cookies.ContainsKey("xueyan_session")||Request.Cookies.ContainsKey("xueyan_refresh")||Request.Headers.ContainsKey("Authorization"))return Unauthorized(new{error="Phiên đăng nhập cần được làm mới."});
            return new JsonResult(null);
        }
        var profile=await profiles!.Get(actor);return Ok(new{actor.UserId,actor.Role,Name=profile.DisplayName,profile.AvatarVersion,profile.ShowPinyin,profile.TargetLevelCode});
    }
    [AllowAnonymous,HttpGet("google/config"),EnableRateLimiting("auth")]
    public IActionResult GoogleConfig(){
        if(string.IsNullOrWhiteSpace(google.ClientId))return Ok(new{enabled=false});
        // React development mode and multiple tabs can request config concurrently.
        // Reuse this browser's challenge instead of invalidating an already rendered button.
        var existing=Request.Cookies["xueyan_google_nonce"];
        var nonce=existing is {Length:64} && existing.All(Uri.IsHexDigit)
            ? existing : Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        Response.Cookies.Append("xueyan_google_nonce",nonce,new CookieOptions{HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment(),Path="/",MaxAge=TimeSpan.FromMinutes(10)});
        Response.Headers.CacheControl="no-store";
        return Ok(new{enabled=true,clientId=google.ClientId,nonce});
    }
    [AllowAnonymous,HttpPost("google"),EnableRateLimiting("auth")]
    public async Task<IActionResult> Google(GoogleLoginRequest request){
        var result=await google.Login(request.Credential,Request.Cookies["xueyan_google_nonce"]);
        Response.Cookies.Delete("xueyan_google_nonce",new CookieOptions{Path="/",Secure=!environment.IsDevelopment(),SameSite=SameSiteMode.Strict,HttpOnly=true});
        WriteCookies(result);return Ok(new{result.Role,result.Name});
    }
    private void WriteCookies(LoginResult result){
        Response.Cookies.Append("xueyan_session",result.Token,new CookieOptions{HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment(),Path="/",MaxAge=TimeSpan.FromMinutes(JwtSettings.AccessMinutes)});
        Response.Cookies.Append("xueyan_refresh",result.RefreshToken!,new CookieOptions{HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment(),Path="/",MaxAge=TimeSpan.FromHours(12)});
    }
    [AllowAnonymous,HttpPost("register"),EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(RegisterRequest request) {await service.Register(request);return StatusCode(201,new {message="Đã tạo tài khoản người học. Bạn có thể đăng nhập; email chưa được xác minh."});}
    [AllowAnonymous,HttpPost("login"),EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(LoginRequest request) {
        var result=await service.Login(request);
        Response.Cookies.Append("xueyan_session",result.Token,new CookieOptions{HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment(),Path="/",MaxAge=TimeSpan.FromMinutes(JwtSettings.AccessMinutes)});
        Response.Cookies.Append("xueyan_refresh",result.RefreshToken!,new CookieOptions{HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment(),Path="/",MaxAge=TimeSpan.FromHours(12)});
        return Ok(new {result.Role,result.Name});
    }
    [AllowAnonymous,HttpPost("refresh"),EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh(){var result=await service.Refresh(Request.Cookies["xueyan_refresh"]);Response.Cookies.Append("xueyan_session",result.Token,new CookieOptions{HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment(),Path="/",MaxAge=TimeSpan.FromMinutes(JwtSettings.AccessMinutes)});return Ok(new{message="Đã làm mới phiên."});}
    [HttpGet("me")]
    public async Task<AccountResult> Me(){var a=await current.Require();return new(a.UserId,a.Role,a.Name);}
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(){await service.Logout(await current.Require());Response.Cookies.Delete("xueyan_session",new CookieOptions{Path="/",HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment()});Response.Cookies.Delete("xueyan_refresh",new CookieOptions{Path="/",HttpOnly=true,SameSite=SameSiteMode.Strict,Secure=!environment.IsDevelopment()});return NoContent();}
}
