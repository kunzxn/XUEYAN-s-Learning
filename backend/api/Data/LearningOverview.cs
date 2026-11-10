public sealed partial class LearningRepository {
 public async Task<object> Queue(Actor actor,string ids){
  var values=(ids??"").Split(',');if(values.Length is <1 or >20||values.Any(v=>!long.TryParse(v,out var id)||id<=0)||values.Distinct().Count()!=values.Length)throw new ApiError(400,"Danh sách thẻ không hợp lệ.");
  await using var c=await db.Open(actor);var rows=await Database.Query(c,"SELECT WordId Id,Simplified,Pinyin,HanViet,MeaningVi,MeaningEn FROM catalog.PublishedWords WHERE WordId IN (SELECT TRY_CONVERT(bigint,value) FROM STRING_SPLIT(@ids,','))",("ids",ids));
  if(rows.Count!=values.Length)throw new ApiError(409,"Có từ không còn khả dụng. Hãy bắt đầu phiên mới.");return rows;
 }
 public async Task<object> Overview(Actor actor){
  await using var connection=await db.Open();
  // Same owner restriction as Save; no identity is accepted from the request.
  var rows=await Database.Query(connection,"""
   DECLARE @today date=CONVERT(date,DATEADD(hour,7,SYSUTCDATETIME()));
   SELECT
    (SELECT COUNT(*) FROM learning.WordProgress WHERE UserId=@user) AS Learned,
    (SELECT COUNT(*) FROM learning.WordProgress p JOIN catalog.Words w ON w.WordId=p.WordId WHERE p.UserId=@user AND p.NextReviewAt<=SYSUTCDATETIME() AND w.Status='published') AS Due,
    (SELECT COUNT(DISTINCT WordId) FROM learning.ReviewEvents WHERE UserId=@user AND CONVERT(date,DATEADD(hour,7,ReviewedAt))=@today) AS ReviewedToday,
    (SELECT COUNT(*) FROM (SELECT WordId FROM learning.ReviewEvents WHERE UserId=@user GROUP BY WordId HAVING CONVERT(date,DATEADD(hour,7,MIN(ReviewedAt)))=@today) firsts) AS FirstReviewsToday,
    COALESCE((SELECT DailyWordGoal FROM learning.Preferences WHERE UserId=@user),20) AS Goal;
   """,("user",actor.UserId));
  var days=await Database.Query(connection,"SELECT DISTINCT CONVERT(varchar(10),DATEADD(hour,7,ReviewedAt),23) AS Day FROM learning.ReviewEvents WHERE UserId=@user ORDER BY Day DESC",("user",actor.UserId));
  var today=DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime.AddHours(7));
  var dates=days.Select(row=>DateOnly.Parse((string)row["day"]!)).ToHashSet();
  var cursor=dates.Contains(today)?today:today.AddDays(-1);var streak=0;
  while(dates.Contains(cursor)){streak++;cursor=cursor.AddDays(-1);}
  rows[0]["streak"]=streak;rows[0]["timezone"]="Asia/Ho_Chi_Minh";
  return rows[0];
 }
 public async Task<object> Results(Actor actor,string events){
  var parts=(events??"").Split(',');
  if(parts.Length is <1 or >20||parts.Any(id=>!Guid.TryParse(id,out var parsed)||parsed==Guid.Empty)||parts.Distinct().Count()!=parts.Length)throw new ApiError(400,"Danh sách lượt học không hợp lệ (tối đa 20).");
  await using var connection=await db.Open();
  var rows=await Database.Query(connection,"""
   SELECT e.ClientEventId AS EventId,e.WordId,w.Simplified,w.Pinyin,w.MeaningVi,w.MeaningEn,e.Rating,e.DurationMs,e.ReviewedAt
   FROM learning.ReviewEvents e JOIN catalog.Words w ON w.WordId=e.WordId
   WHERE e.UserId=@user AND e.ClientEventId IN (SELECT TRY_CONVERT(uniqueidentifier,value) FROM STRING_SPLIT(@events,','))
   ORDER BY e.ReviewedAt,e.ReviewEventId
   """,("user",actor.UserId),("events",events));
  if(rows.Count!=parts.Length)throw new ApiError(404,"Không tìm thấy đầy đủ kết quả trong tài khoản của bạn.");
  return rows;
 }
}
