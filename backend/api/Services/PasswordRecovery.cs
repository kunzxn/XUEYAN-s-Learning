using System.Security.Cryptography;
using System.Text;
using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
public sealed record ForgotPasswordRequest([Required,EmailAddress,StringLength(254)] string Email);
public sealed record ResetPasswordRequest([Required,StringLength(64,MinimumLength=64)] string Token,[Required,StringLength(128,MinimumLength=8)] string Password,[Required] string ConfirmPassword);
public sealed class RecoveryMailer(IConfiguration config,IHostEnvironment environment){
 public bool Local=>RecoveryMailSettings.Load(config,environment).Local;
 public void EnsureConfigured()=>_ = RecoveryMailSettings.Load(config,environment);
 public async Task Send(string email,string token){
  var settings=RecoveryMailSettings.Load(config,environment);var origin=settings.WebOrigin;
  var text=$"Bạn đã yêu cầu khôi phục mật khẩu XUEYAN. Liên kết dùng một lần, hết hạn sau 30 phút:\n{origin}/reset-password?token={Uri.EscapeDataString(token)}\nNếu bạn không yêu cầu, hãy bỏ qua email này.";
  if(Local){var folder=Path.GetFullPath(Path.Combine(environment.ContentRootPath,"../.local/mail-outbox"));Directory.CreateDirectory(folder);await File.WriteAllTextAsync(Path.Combine(folder,Guid.NewGuid()+".txt"),$"To: {email}\nSubject: Khoi phuc mat khau XUEYAN\n\n{text}");return;}
  try{using var client=new SmtpClient(settings.Host,settings.Port){EnableSsl=true,UseDefaultCredentials=false,Credentials=new NetworkCredential(settings.Username,settings.Password)};using var message=new MailMessage{From=settings.From!,Subject="Khôi phục mật khẩu XUEYAN",Body=text,SubjectEncoding=Encoding.UTF8,BodyEncoding=Encoding.UTF8};message.To.Add(email);using var timeout=new CancellationTokenSource(TimeSpan.FromSeconds(15));await client.SendMailAsync(message,timeout.Token);}
  catch(Exception e)when(e is SmtpException or FormatException or InvalidOperationException or OperationCanceledException){throw new ApiError(503,"Chưa gửi được email. Vui lòng thử lại sau.");}
 }
}
public sealed class PasswordRecoveryService(PasswordRecoveryRepository repository,RecoveryMailer mailer,PasswordHasher<string> hasher){
 public async Task<object> Request(string email){
  RequestValidation.Auth(email,"validation-placeholder");mailer.EnsureConfigured();
  var token=Convert.ToHexString(RandomNumberGenerator.GetBytes(32));var hash=SHA256.HashData(Encoding.UTF8.GetBytes(token));
  if(await repository.Issue(email.Trim(),hash)){
   try{await mailer.Send(email.Trim(),token);}catch{await repository.Revoke(hash);throw;}
  }
  return new{message=mailer.Local?"Nếu email có tài khoản mật khẩu đang hoạt động, thư thử được ghi tại backend/.local/mail-outbox trên máy chạy API; chưa gửi ra hộp thư thật.":"Nếu email có tài khoản mật khẩu đang hoạt động và chưa vượt giới hạn gửi thư, bạn sẽ nhận được liên kết khôi phục. Vui lòng kiểm tra cả mục thư rác.",delivery=mailer.Local?"local-outbox":"smtp",retryAfterSeconds=60};
 }
 public async Task Reset(ResetPasswordRequest r){
  var errors=new Dictionary<string,string[]>();
  if(r.Token==null||r.Token.Length!=64||!r.Token.All(Uri.IsHexDigit))errors["token"]=["Liên kết không hợp lệ. Hãy yêu cầu liên kết mới."];
  if(string.IsNullOrWhiteSpace(r.Password)||r.Password.Length is <8 or >128||r.Password.Any(char.IsControl))errors["password"]=["Mật khẩu cần 8–128 ký tự hợp lệ."];
  if(r.Password!=r.ConfirmPassword)errors["confirmPassword"]=["Mật khẩu xác nhận chưa trùng khớp."];
  if(errors.Count>0)throw new ApiError(400,"Kiểm tra thông tin mật khẩu.",errors);
  var tokenHash=SHA256.HashData(Encoding.UTF8.GetBytes(r.Token!));var email=await repository.Email(tokenHash)??throw new ApiError(400,"Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới.");
  await repository.Consume(tokenHash,hasher.HashPassword(email,r.Password!));
 }
}
