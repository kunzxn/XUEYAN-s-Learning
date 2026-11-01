using System.ComponentModel.DataAnnotations;
public sealed record GoogleLoginRequest([Required,StringLength(16000)] string Credential);

public sealed record RegisterRequest(
    [Required(ErrorMessage="Vui lòng nhập họ tên."),StringLength(80,MinimumLength=1,ErrorMessage="Họ tên cần 1–80 ký tự.")] string Name,
    [Required(ErrorMessage="Vui lòng nhập email."),EmailAddress(ErrorMessage="Email chưa hợp lệ."),StringLength(254,ErrorMessage="Email không vượt quá 254 ký tự.")] string Email,
    [Required(ErrorMessage="Vui lòng nhập mật khẩu."),StringLength(128,MinimumLength=8,ErrorMessage="Mật khẩu cần 8–128 ký tự.")] string Password);
public sealed record LoginRequest(
    [Required(ErrorMessage="Vui lòng nhập email."),EmailAddress(ErrorMessage="Email chưa hợp lệ."),StringLength(254,ErrorMessage="Email không vượt quá 254 ký tự.")] string Email,
    [Required(ErrorMessage="Vui lòng nhập mật khẩu."),StringLength(128,MinimumLength=1,ErrorMessage="Mật khẩu cần 1–128 ký tự.")] string Password);
public sealed record ReviewRequest(
    [Range(1,long.MaxValue,ErrorMessage="ID từ phải là số nguyên dương.")] long WordId,
    [Range(1,4,ErrorMessage="Mức đánh giá phải từ 1 đến 4.")] int Rating,
    Guid EventId,
    [Range(0,3600000,ErrorMessage="Thời gian học phải từ 0 đến 3.600.000 ms.")] int DurationMs);
public sealed record LoginResult(Guid UserId,string Role,string Name,string Token,string? RefreshToken=null);
public sealed record SessionRecord(Guid SessionId,Actor Actor,DateTime ExpiresAt);
public sealed record AccountResult(Guid UserId,string Role,string Name);
public sealed record Registration(Guid UserId,string Email,string PasswordHash,string Name,string Role);

