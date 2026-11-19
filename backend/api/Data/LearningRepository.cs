using System.Text.Json;
public interface ILearningRepository {
 Task<object> Words(Actor actor);
 Task<object> Due(Actor actor);
 Task<object> Progress(Actor actor);
 Task<object> Overview(Actor actor);
 Task<object> NewWords(Actor actor,int limit);
 Task<object> Unseen(Actor actor,string ids);
 Task<object> Queue(Actor actor,string ids);
 Task<object> Results(Actor actor,string events);
 Task Save(Actor actor,ReviewRequest review);
}
public sealed partial class LearningRepository(Database db,ISpacedRepetitionScheduler scheduler,TimeProvider clock,IEfReadRepository reads):ILearningRepository {
 public async Task<object> Words(Actor actor)=>await reads.Words(actor);
 public async Task<object> Progress(Actor actor)=>await reads.Progress(actor);
 public async Task<object> Due(Actor actor)=>await reads.Due(actor);
 public async Task Save(Actor actor,ReviewRequest review){
  for(var attempt=0;;attempt++){
   try{await SaveOnce(actor,review);return;}
   catch(Microsoft.Data.SqlClient.SqlException error) when(error.Number==1205&&attempt<2){await Task.Delay(30*(attempt+1));}
  }
 }
 private async Task SaveOnce(Actor actor,ReviewRequest review){
  await using var connection=await db.Open();using var transaction=connection.BeginTransaction(System.Data.IsolationLevel.Serializable);
  try {
   string? previousState=null,previousVersion=null;
   using(var check=Database.Command(connection,"""
    SELECT
     (SELECT COUNT(*) FROM auth.Sessions s JOIN auth.Users u ON u.UserId=s.UserId WHERE s.TokenHash=@hash AND s.UserId=@user AND s.RevokedAt IS NULL AND s.ExpiresAt>SYSUTCDATETIME() AND u.Status='active') AS ValidSession,
     (SELECT TOP(1) WordId FROM learning.ReviewEvents WITH(UPDLOCK,HOLDLOCK) WHERE UserId=@user AND ClientEventId=@event) AS DupWordId,
     (SELECT TOP(1) Rating FROM learning.ReviewEvents WITH(UPDLOCK,HOLDLOCK) WHERE UserId=@user AND ClientEventId=@event) AS DupRating,
     (SELECT TOP(1) SchedulerState FROM learning.WordProgress WITH(UPDLOCK,HOLDLOCK) WHERE UserId=@user AND WordId=@word) AS PrevState,
     (SELECT TOP(1) SchedulerVersion FROM learning.WordProgress WITH(UPDLOCK,HOLDLOCK) WHERE UserId=@user AND WordId=@word) AS PrevVersion;
    """,("hash",actor.Hash),("user",actor.UserId),("event",review.EventId),("word",review.WordId))){
    check.Transaction=transaction;using var reader=await check.ExecuteReaderAsync();
    if(!await reader.ReadAsync()||reader.GetInt32(0)!=1)throw new ApiError(401,"Phiên đăng nhập không còn hợp lệ.");
    if(!reader.IsDBNull(1)){
     if(reader.GetInt64(1)!=review.WordId||reader.GetByte(2)!=review.Rating)throw new ApiError(409,"Lượt học này đã được lưu với kết quả khác.");
     await reader.DisposeAsync();transaction.Commit();return;
    }
    if(!reader.IsDBNull(3)){previousState=reader.GetString(3);previousVersion=reader.GetString(4);}
   }
   var now=clock.GetUtcNow().UtcDateTime;
   var schedule=scheduler.Next(review.Rating,previousState,previousVersion,now);
   using var command=Database.Command(connection,"""
    IF NOT EXISTS(SELECT 1 FROM catalog.Words WHERE WordId=@word AND Status='published') THROW 51021,'Word unavailable.',1;
    DECLARE @session uniqueidentifier=NEWID();
    INSERT learning.StudySessions(StudySessionId,UserId,Mode,Status,StartedAt,EndedAt) VALUES (@session,@user,'review','completed',@now,@now);
    INSERT learning.ReviewEvents(UserId,StudySessionId,WordId,ClientEventId,Rating,DurationMs,ReviewedAt) VALUES (@user,@session,@word,@event,@rating,@duration,@now);
    UPDATE learning.WordProgress SET LastReviewedAt=@now,NextReviewAt=@next,Repetitions=Repetitions+1,Lapses=Lapses+CASE WHEN @rating=1 THEN 1 ELSE 0 END,SchedulerVersion=@version,SchedulerState=@state WHERE UserId=@user AND WordId=@word;
    IF @@ROWCOUNT=0 INSERT learning.WordProgress(UserId,WordId,LastReviewedAt,NextReviewAt,Repetitions,Lapses,SchedulerVersion,SchedulerState) VALUES (@user,@word,@now,@next,1,CASE WHEN @rating=1 THEN 1 ELSE 0 END,@version,@state);
    """,("word",review.WordId),("user",actor.UserId),("event",review.EventId),("rating",review.Rating),("duration",review.DurationMs),("now",now),("next",schedule.NextReviewAt),("version",schedule.Version),("state",schedule.State));
   command.Transaction=transaction;await command.ExecuteNonQueryAsync();transaction.Commit();
  }catch{transaction.Rollback();throw;}
 }
}
