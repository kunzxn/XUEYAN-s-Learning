public sealed class PreferencesService(PreferencesRepository repository){
 public Task<object> Get(Actor actor)=>repository.Get(actor);
 public async Task<object> Save(Actor actor,PreferencesRequest r){
  var errors=new Dictionary<string,string[]>();
  if(r.DailyWordGoal is <5 or >100)errors["dailyWordGoal"]=["Chọn từ 5 đến 100 từ/ngày."];
  if(!string.IsNullOrEmpty(r.TargetLevelCode)&&!new[]{"1","2","3","4","5","6","7-9"}.Contains(r.TargetLevelCode))errors["targetLevelCode"]=["Chọn cấp HSK hợp lệ."];
  if((r.Purpose?.Length??0)>200||r.Purpose?.Any(char.IsControl)==true)errors["purpose"]=["Mục đích tối đa 200 ký tự hợp lệ."];
  if(!TimeOnly.TryParseExact(r.StudyTime,"HH:mm",out var time))errors["studyTime"]=["Giờ học cần có dạng HH:mm."];
  byte[] version=[];try{version=Convert.FromBase64String(r.Version??"");if(version.Length!=8)throw new FormatException();}catch(FormatException){errors["version"]=["Hãy tải lại tùy chọn trước khi lưu."];}
  if(errors.Count>0)throw new ApiError(400,"Kiểm tra các trường cài đặt.",errors);
  return await repository.Save(actor,r,version,time);
 }
}
