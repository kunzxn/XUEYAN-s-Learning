public sealed class PreferencesRepository(Database db){
 public async Task<object> Get(Actor actor){await using var c=await db.Open();var rows=await Database.Query(c,"SELECT DailyWordGoal,TargetLevelCode,Purpose,ShowPinyin,ShowHanViet,Autoplay,CONVERT(varchar(5),StudyTime,108) StudyTime,TimeZoneId,OnboardingCompletedAt,Version FROM learning.Preferences WHERE UserId=@id",("id",actor.UserId));if(rows.Count!=1)throw new ApiError(404,"Không tìm thấy tùy chọn.");var r=rows[0];r["version"]=Convert.ToBase64String((byte[])r["version"]!);return r;}
 public async Task<object> Save(Actor actor,PreferencesRequest r,byte[] version,TimeOnly time){
  await using var c=await db.Open();var changed=await Database.Execute(c,"""
   UPDATE learning.Preferences SET DailyWordGoal=@goal,TargetLevelCode=@level,Purpose=@purpose,ShowPinyin=@pinyin,ShowHanViet=@han,Autoplay=@auto,StudyTime=@time,
   OnboardingCompletedAt=CASE WHEN @complete=1 THEN COALESCE(OnboardingCompletedAt,SYSUTCDATETIME()) ELSE OnboardingCompletedAt END
   WHERE UserId=@id AND Version=@version AND EXISTS(SELECT 1 FROM auth.Sessions WHERE UserId=@id AND TokenHash=@hash AND RevokedAt IS NULL AND ExpiresAt>SYSUTCDATETIME());
   """,("goal",r.DailyWordGoal),("level",string.IsNullOrEmpty(r.TargetLevelCode)?null:r.TargetLevelCode),("purpose",r.Purpose?.Trim()),("pinyin",r.ShowPinyin),("han",r.ShowHanViet),("auto",r.Autoplay),("time",time.ToTimeSpan()),("complete",r.CompleteOnboarding),("id",actor.UserId),("version",version),("hash",actor.Hash));
  if(changed!=1)throw new ApiError(409,"Cài đặt đã thay đổi ở nơi khác. Nội dung đang nhập vẫn được giữ; tải lại bản trên server trước khi lưu.");return await Get(actor);
 }
}
