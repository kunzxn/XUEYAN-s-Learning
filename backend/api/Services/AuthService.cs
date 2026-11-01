using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;
using System.Text;

public interface IAuthService
{
    Task<Guid> Register(RegisterRequest request);
    Task<LoginResult> Login(LoginRequest request);
    Task Logout(Actor actor);
    Task<LoginResult> Refresh(string? refreshToken);
    Task Bootstrap(string email,string password);
}
public sealed class AuthService(IAuthRepository repository,PasswordHasher<string> hasher,IJwtTokens tokens):IAuthService
{
    private static readonly string DummyHash=new PasswordHasher<string>().HashPassword("dummy",Convert.ToHexString(RandomNumberGenerator.GetBytes(32)));
    public async Task<Guid> Register(RegisterRequest request) {
        RequestValidation.Auth(request.Email,request.Password,request.Name,true);
        var id=Guid.NewGuid();var email=request.Email.Trim();
        await repository.Create(new(id,email,hasher.HashPassword(email,request.Password),request.Name.Trim(),"learner"));return id;
    }
    public async Task<LoginResult> Login(LoginRequest request) {
        RequestValidation.Auth(request.Email,request.Password);
        var email=request.Email.Trim();var credential=await repository.FindCredential(email);
        var verified=hasher.VerifyHashedPassword(email,credential?.PasswordHash??DummyHash,request.Password);
        if(credential==null||verified==PasswordVerificationResult.Failed||credential.Status!="active")throw new ApiError(401,"Email hoặc mật khẩu chưa đúng, hoặc tài khoản không khả dụng.");
        var token=Convert.ToHexString(RandomNumberGenerator.GetBytes(32));var hash=SHA256.HashData(Encoding.UTF8.GetBytes(token));
        var session=await repository.AddSession(credential.UserId,hash);return new(credential.UserId,credential.Role,credential.Name,tokens.Issue(session),token);
    }
    public Task Logout(Actor actor)=>repository.Revoke(actor.Hash);
    public async Task<LoginResult> Refresh(string? refreshToken){
        if(refreshToken==null||refreshToken.Length!=64)throw new ApiError(401,"Phiên làm mới không hợp lệ.");
        var session=await repository.FindSession(SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken)))??throw new ApiError(401,"Phiên làm mới đã hết hạn hoặc bị thu hồi.");
        return new(session.Actor.UserId,session.Actor.Role,session.Actor.Name,tokens.Issue(session));
    }

    public async Task Bootstrap(string email,string password) {
        if(!System.Net.Mail.MailAddress.TryCreate(email,out var parsed)||parsed.Address!=email||password.Length<12||password.Length>128)throw new InvalidOperationException("Use a valid email and a 12–128 character admin password.");
        await repository.Create(new(Guid.NewGuid(),email,hasher.HashPassword(email,password),"Quản trị viên","admin"),true);
    }
}
