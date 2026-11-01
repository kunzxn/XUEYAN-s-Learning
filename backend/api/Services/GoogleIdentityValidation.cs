using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

public static class GoogleIdentityValidation
{
 public static ClaimsPrincipal Verify(string credential,string nonce,string clientId,IEnumerable<SecurityKey> signingKeys){
  ClaimsPrincipal claims;
  try{claims=new JwtSecurityTokenHandler{MapInboundClaims=false}.ValidateToken(credential,new TokenValidationParameters{
   ValidateIssuer=true,ValidIssuers=["accounts.google.com","https://accounts.google.com"],ValidateAudience=true,ValidAudience=clientId,
   ValidateLifetime=true,RequireExpirationTime=true,RequireSignedTokens=true,ValidateIssuerSigningKey=true,IssuerSigningKeys=signingKeys,ValidAlgorithms=[SecurityAlgorithms.RsaSha256],ClockSkew=TimeSpan.FromSeconds(30)
  },out _);}catch(SecurityTokenSignatureKeyNotFoundException){throw;}
   catch(SecurityTokenException){throw new ApiError(401,"Thông tin đăng nhập Google không hợp lệ hoặc đã hết hạn.");}
  var subject=claims.FindFirst("sub")?.Value;var email=claims.FindFirst("email")?.Value;
  if(string.IsNullOrWhiteSpace(nonce)||claims.FindFirst("nonce")?.Value!=nonce)throw new ApiError(401,"Phiên Google đã thay đổi hoặc hết hạn. Nhấn Thử lại Google rồi đăng nhập lại.");
  if(string.IsNullOrWhiteSpace(subject)||subject.Length>255||string.IsNullOrWhiteSpace(email)||email.Length>254||!System.Net.Mail.MailAddress.TryCreate(email,out _))throw new ApiError(401,"Google chưa cung cấp định danh hoặc email hợp lệ.");
  if(!string.Equals(claims.FindFirst("email_verified")?.Value,"true",StringComparison.OrdinalIgnoreCase))throw new ApiError(401,"Email của tài khoản Google chưa được xác minh.");
  return claims;
 }
}
