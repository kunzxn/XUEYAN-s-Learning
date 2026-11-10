using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
[ApiController,AllowAnonymous,Route("auth"),EnableRateLimiting("auth")]
public sealed class PasswordRecoveryController(PasswordRecoveryService service):ControllerBase{
 [HttpPost("forgot-password")]public async Task<object> Forgot(ForgotPasswordRequest request)=>await service.Request(request.Email);
 [HttpPost("reset-password")]public async Task<object> Reset(ResetPasswordRequest request){await service.Reset(request);return new{message="Đã đổi mật khẩu. Hãy đăng nhập lại; các phiên cũ đã được thu hồi."};}
}
