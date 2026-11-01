using System.Text;

public interface IProfileService {
 Task<UserProfile> Get(Actor actor);
 Task<UserProfile> Update(Actor actor,ProfileUpdateRequest request);
 Task<byte[]?> Avatar(Actor actor);
}
public sealed class ProfileService(IProfileRepository repository):IProfileService {
 public Task<UserProfile> Get(Actor actor)=>repository.Get(actor);
 public Task<byte[]?> Avatar(Actor actor)=>repository.Avatar(actor);
 public async Task<UserProfile> Update(Actor actor,ProfileUpdateRequest request){
  var errors=new Dictionary<string,string[]>();
  void Text(string key,string? value,int limit,bool required=false,bool multiline=false){if((required&&string.IsNullOrWhiteSpace(value))||(value?.Length??0)>limit||value?.Any(c=>char.IsControl(c)&&!(multiline&&c is '\r' or '\n' or '\t'))==true)errors[key]=[$"Thông tin cần {(required?"1":"0")}–{limit} ký tự hợp lệ."];}
  Text("displayName",request.DisplayName,80,true);Text("chineseName",request.ChineseName,100);Text("bio",request.Bio,2000,multiline:true);Text("purpose",request.Purpose,200);
  if(request.DailyWordGoal is <5 or >100)errors["dailyWordGoal"]=["Mục tiêu cần từ 5 đến 100 từ/ngày."];
  if(!string.IsNullOrEmpty(request.TargetLevelCode)&&!new[]{"1","2","3","4","5","6","7-9"}.Contains(request.TargetLevelCode))errors["targetLevelCode"]=["Chọn cấp HSK hợp lệ."];
  byte[] ParseVersion(string? value,string key){try{var bytes=Convert.FromBase64String(value??"");if(bytes.Length!=8)throw new FormatException();return bytes;}catch(FormatException){errors[key]=["Phiên bản hồ sơ không hợp lệ. Hãy tải lại hồ sơ."];return [];}}
  var version=ParseVersion(request.Version,"version");var preferencesVersion=ParseVersion(request.PreferencesVersion,"preferencesVersion");byte[]? avatar=null;
  if(request.AvatarDataUrl!=null){try{avatar=AvatarValidation.Decode(request.AvatarDataUrl);}catch(ApiError error){errors["avatarDataUrl"]=[error.Message];}}
  if(request.RemoveAvatar&&avatar!=null)errors["avatarDataUrl"]=["Chỉ chọn ảnh mới hoặc xóa ảnh hiện tại."];
  if(errors.Count>0)throw new ApiError(400,"Vui lòng kiểm tra thông tin hồ sơ.",errors);
  string? Normalize(string? value)=>string.IsNullOrWhiteSpace(value)?null:value.Trim().Normalize(NormalizationForm.FormC);
  var normalized=request with{DisplayName=Normalize(request.DisplayName)!,ChineseName=Normalize(request.ChineseName),Bio=Normalize(request.Bio),Purpose=Normalize(request.Purpose)};
  await repository.Update(actor,normalized,version,preferencesVersion,avatar);return await repository.Get(actor);
 }
}
public static class AvatarValidation {
 public static byte[] Decode(string dataUrl){
  if(!dataUrl.StartsWith("data:image/jpeg;base64,",StringComparison.Ordinal)||dataUrl.Length>32800)throw new ApiError(400,"Ảnh đại diện cần là JPEG được thu nhỏ, tối đa 24 KiB.");
  byte[] bytes;try{bytes=Convert.FromBase64String(dataUrl[23..]);}catch(FormatException){throw new ApiError(400,"Dữ liệu ảnh không hợp lệ.");}
  if(bytes.Length is <4 or >24576||bytes[0]!=0xff||bytes[1]!=0xd8||bytes[^2]!=0xff||bytes[^1]!=0xd9)throw new ApiError(400,"Dữ liệu JPEG không hợp lệ.");
  // Read dimensions without decoding untrusted compressed pixels.
  for(var offset=2;offset+4<bytes.Length;){
   if(bytes[offset++]!=0xff)break;while(offset<bytes.Length&&bytes[offset]==0xff)offset++;if(offset>=bytes.Length)break;
   var marker=bytes[offset++];if(marker is 0xd9 or 0xda)break;if(marker is 0x01 or >=0xd0 and <=0xd7)continue;
   if(offset+2>bytes.Length)break;var size=(bytes[offset]<<8)|bytes[offset+1];if(size<2||offset+size>bytes.Length)break;
   if(marker is 0xc0 or 0xc1 or 0xc2){if(size<8)break;var height=(bytes[offset+3]<<8)|bytes[offset+4];var width=(bytes[offset+5]<<8)|bytes[offset+6];if(width is >0 and <=512&&height is >0 and <=512)return bytes;break;}offset+=size;
  }
  throw new ApiError(400,"Ảnh cần là JPEG kích thước tối đa 512×512 pixel.");
 }
}
