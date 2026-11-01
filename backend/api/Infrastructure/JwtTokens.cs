using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public sealed record JwtSettings(string Issuer,string Audience,string SigningKey)
{
    public const int AccessMinutes=15;
    public static JwtSettings Load(IConfiguration configuration,IHostEnvironment environment){
        var key=configuration["Jwt:SigningKey"];
        if(string.IsNullOrEmpty(key)&&environment.IsDevelopment()){
            var folder=Path.GetFullPath(Path.Combine(environment.ContentRootPath,"..",".local"));Directory.CreateDirectory(folder);
            var path=Path.Combine(folder,"jwt-signing-key");
            if(!File.Exists(path)){
                try{using var file=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.None);var bytes=Encoding.UTF8.GetBytes(Convert.ToHexString(RandomNumberGenerator.GetBytes(64)));file.Write(bytes);}
                catch(IOException)when(File.Exists(path)){/* Another development instance created it. */}
            }
            key=File.ReadAllText(path).Trim();
        }
        if(string.IsNullOrEmpty(key)||Encoding.UTF8.GetByteCount(key)<64)throw new InvalidOperationException("Configure Jwt__SigningKey with at least 64 random bytes. No production default key is provided.");
        return new(configuration["Jwt:Issuer"]??"Xueyan.Api",configuration["Jwt:Audience"]??"Xueyan.Web",key);
    }
    public TokenValidationParameters Validation()=>new(){
        ValidateIssuerSigningKey=true,IssuerSigningKey=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
        ValidAlgorithms=[SecurityAlgorithms.HmacSha256],ValidateIssuer=true,ValidIssuer=Issuer,
        ValidateAudience=true,ValidAudience=Audience,ValidateLifetime=true,RequireExpirationTime=true,RequireSignedTokens=true,
        ClockSkew=TimeSpan.FromSeconds(30),NameClaimType=JwtRegisteredClaimNames.Sub,RoleClaimType="role"
    };
}
public interface IJwtTokens {string Issue(SessionRecord session);}
public sealed class JwtTokens(JwtSettings settings,TimeProvider clock):IJwtTokens
{
    public string Issue(SessionRecord session){
        var now=clock.GetUtcNow().UtcDateTime;
        var expiry=new[]{now.AddMinutes(JwtSettings.AccessMinutes),DateTime.SpecifyKind(session.ExpiresAt,DateTimeKind.Utc)}.Min();
        if(expiry<=now)throw new ApiError(401,"Phiên đăng nhập đã hết hạn.");
        var claims=new[]{new Claim(JwtRegisteredClaimNames.Sub,session.Actor.UserId.ToString()),new Claim("role",session.Actor.Role),new Claim("sid",session.SessionId.ToString()),new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString("N"))};
        var token=new JwtSecurityToken(settings.Issuer,settings.Audience,claims,now,expiry,new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SigningKey)),SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
