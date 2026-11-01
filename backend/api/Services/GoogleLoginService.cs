using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

public sealed class GoogleLoginService(IAuthRepository repository,IJwtTokens tokens,IConfiguration configuration)
{
 private static readonly ConfigurationManager<OpenIdConnectConfiguration> Discovery=new("https://accounts.google.com/.well-known/openid-configuration",new OpenIdConnectConfigurationRetriever());
 public string? ClientId=>configuration["Google:ClientId"];
 public async Task<LoginResult> Login(string credential,string? nonce){
  if(string.IsNullOrWhiteSpace(ClientId))throw new ApiError(503,"Đăng nhập Google chưa được cấu hình.");
  if(string.IsNullOrEmpty(nonce)||string.IsNullOrEmpty(credential)||credential.Length>16000)throw new ApiError(400,"Phiên đăng nhập Google không hợp lệ. Vui lòng tải lại trang.");
  if(!new JwtSecurityTokenHandler().CanReadToken(credential))throw new ApiError(401,"Thông tin đăng nhập Google không hợp lệ.");
  System.Security.Claims.ClaimsPrincipal claims;
  try {
   var config=await Discovery.GetConfigurationAsync(CancellationToken.None);
   claims=GoogleIdentityValidation.Verify(credential,nonce,ClientId,config.SigningKeys);
  }catch(SecurityTokenSignatureKeyNotFoundException){Discovery.RequestRefresh();throw new ApiError(401,"Vui lòng thử đăng nhập Google lại.");}
   catch(SecurityTokenException){throw new ApiError(401,"Thông tin đăng nhập Google không hợp lệ hoặc đã hết hạn.");}
   catch(InvalidOperationException){throw new ApiError(503,"Chưa tải được cấu hình xác minh Google. Vui lòng thử lại.");}
   catch(HttpRequestException){throw new ApiError(503,"Chưa kết nối được Google. Vui lòng thử lại.");}
  var sub=claims.FindFirst("sub")?.Value;var email=claims.FindFirst("email")?.Value;
  var name=(claims.FindFirst("name")?.Value??"Người học").Trim();name=new string(name.Where(ch=>!char.IsControl(ch)).ToArray());if(name.Length==0)name="Người học";if(name.Length>80)name=name[..80];
  var userId=await repository.GoogleIdentity(sub!,email!,name);
  var refresh=Convert.ToHexString(RandomNumberGenerator.GetBytes(32));var session=await repository.AddSession(userId,SHA256.HashData(Encoding.UTF8.GetBytes(refresh)));
  return new(userId,session.Actor.Role,session.Actor.Name,tokens.Issue(session),refresh);
 }
}
