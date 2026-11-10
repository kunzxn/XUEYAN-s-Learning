using System.Net.Mail;
public sealed record RecoveryMailSettings(bool Local,string WebOrigin,string? Host,int Port,MailAddress? From,string? Username,string? Password){
 public static RecoveryMailSettings Load(IConfiguration config,IHostEnvironment environment){
  var host=config["Mail:Host"]?.Trim();var local=environment.IsDevelopment()&&string.IsNullOrEmpty(host);
  var origin=config["Recovery:WebOrigin"]??(local?"http://localhost:3000":"");
  if(!Uri.TryCreate(origin,UriKind.Absolute,out var uri)||uri.UserInfo!=""||uri.AbsolutePath!="/"||uri.Query!=""||uri.Fragment!=""||!(uri.Scheme=="https"||(environment.IsDevelopment()&&uri.Scheme=="http"&&uri.IsLoopback)))throw Invalid();
  if(local)return new(true,uri.GetLeftPart(UriPartial.Authority),null,587,null,null,null);
  var from=config["Mail:From"]?.Trim();var username=config["Mail:Username"]?.Trim();var password=config["Mail:Password"];
  if(string.IsNullOrEmpty(host)||Uri.CheckHostName(host)==UriHostNameType.Unknown||!MailAddress.TryCreate(from,out var address)||address.Address!=from||!address.Host.Contains('.')||string.IsNullOrWhiteSpace(username)||string.IsNullOrWhiteSpace(password))throw Invalid();
  var port=587;if(config["Mail:Port"] is string configured&&(!int.TryParse(configured,out port)||port is not(25 or 587)))throw Invalid();
  // Gmail must send as the authenticated mailbox; a display name is not a domain alias.
  if(host.Equals("smtp.gmail.com",StringComparison.OrdinalIgnoreCase)&&(!address.Address.Equals(username,StringComparison.OrdinalIgnoreCase)||port!=587))throw Invalid();
  return new(false,uri.GetLeftPart(UriPartial.Authority),host,port,new MailAddress(address.Address,"XUEYAN",System.Text.Encoding.UTF8),username,password);
 }
 private static ApiError Invalid()=>new(503,"Email khôi phục chưa được cấu hình hợp lệ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.");
}
