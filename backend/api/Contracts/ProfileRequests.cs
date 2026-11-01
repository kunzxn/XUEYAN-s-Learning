using System.ComponentModel.DataAnnotations;
public sealed record ProfileUpdateRequest(
 [Required(ErrorMessage="Vui lòng nhập tên hiển thị."),StringLength(80,ErrorMessage="Tên hiển thị tối đa 80 ký tự.")] string DisplayName,
 [StringLength(100,ErrorMessage="Tên tiếng Trung tối đa 100 ký tự.")] string? ChineseName,
 [StringLength(2000,ErrorMessage="Giới thiệu tối đa 2.000 ký tự.")] string? Bio,
 [StringLength(200,ErrorMessage="Mục đích học tối đa 200 ký tự.")] string? Purpose,
 [StringLength(3,ErrorMessage="Cấp HSK không hợp lệ.")] string? TargetLevelCode,
 [Range(5,100,ErrorMessage="Mục tiêu cần từ 5 đến 100 từ/ngày.")] int DailyWordGoal,
 bool ShowPinyin,
 [Required,StringLength(12,MinimumLength=12,ErrorMessage="Phiên bản hồ sơ không hợp lệ.")] string Version,
 [Required,StringLength(12,MinimumLength=12,ErrorMessage="Phiên bản tùy chọn không hợp lệ.")] string PreferencesVersion,
 [StringLength(32791,ErrorMessage="Ảnh sau xử lý cần nhỏ hơn 24 KiB.")] string? AvatarDataUrl=null,
 bool RemoveAvatar=false);
public sealed record UserProfile(Guid UserId,string Role,string Email,string DisplayName,string? ChineseName,string? Bio,string? Purpose,string? TargetLevelCode,int DailyWordGoal,bool ShowPinyin,string Version,string PreferencesVersion,string? AvatarVersion,int LearnedWords);
