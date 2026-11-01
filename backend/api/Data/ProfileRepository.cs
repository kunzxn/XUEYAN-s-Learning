using System.Data;
public interface IProfileRepository {
 Task<UserProfile> Get(Actor actor);
 Task Update(Actor actor,ProfileUpdateRequest request,byte[] version,byte[] preferencesVersion,byte[]? avatar);
 Task<byte[]?> Avatar(Actor actor);
}
public sealed class ProfileRepository(Database database):IProfileRepository {
 public async Task<UserProfile> Get(Actor actor){
  await using var c=await database.Open();var rows=await Database.Query(c,"""
   SELECT u.UserId,u.RoleCode,u.Email,p.DisplayName,p.ChineseName,p.Bio,p.Version,v.Purpose,v.TargetLevelCode,v.DailyWordGoal,v.ShowPinyin,v.Version PreferencesVersion,a.Version AvatarVersion,
   (SELECT COUNT(*) FROM learning.WordProgress wp WHERE wp.UserId=u.UserId) LearnedWords
   FROM auth.Users u JOIN learning.Profiles p ON p.UserId=u.UserId JOIN learning.Preferences v ON v.UserId=u.UserId
   LEFT JOIN learning.AvatarImages a ON a.UserId=u.UserId WHERE u.UserId=@id
   """,("id",actor.UserId));
  if(rows.Count!=1)throw new ApiError(404,"Không tìm thấy hồ sơ.");var r=rows[0];
  return new((Guid)r["userId"]!,(string)r["roleCode"]!,(string)r["email"]!,(string)r["displayName"]!,(string?)r["chineseName"],(string?)r["bio"],(string?)r["purpose"],(string?)r["targetLevelCode"],Convert.ToInt32(r["dailyWordGoal"]),(bool)r["showPinyin"]!,Convert.ToBase64String((byte[])r["version"]!),Convert.ToBase64String((byte[])r["preferencesVersion"]!),r["avatarVersion"] is byte[] av?Convert.ToBase64String(av):null,(int)r["learnedWords"]!);
 }
 public async Task<byte[]?> Avatar(Actor actor){await using var c=await database.Open();using var query=Database.Command(c,"SELECT Content FROM learning.AvatarImages WHERE UserId=@id",("id",actor.UserId));return await query.ExecuteScalarAsync() as byte[];}
 public async Task Update(Actor actor,ProfileUpdateRequest r,byte[] version,byte[] preferencesVersion,byte[]? avatar){
  await using var c=await database.Open();using var tx=c.BeginTransaction(IsolationLevel.Serializable);
  try {
   using var command=Database.Command(c,"""
    IF NOT EXISTS(SELECT 1 FROM auth.Sessions s JOIN auth.Users u ON u.UserId=s.UserId WHERE s.TokenHash=@hash AND s.UserId=@id AND s.RevokedAt IS NULL AND s.ExpiresAt>SYSUTCDATETIME() AND u.Status='active') THROW 51041,'Session no longer active.',1;
    UPDATE learning.Profiles SET DisplayName=@name,ChineseName=@chinese,Bio=@bio,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@id AND Version=@version;
    IF @@ROWCOUNT<>1 THROW 51042,'Profile version changed.',1;
    UPDATE learning.Preferences SET Purpose=@purpose,TargetLevelCode=@level,DailyWordGoal=@goal,ShowPinyin=@pinyin WHERE UserId=@id AND Version=@preferencesVersion;
    IF @@ROWCOUNT<>1 THROW 51042,'Preferences version changed.',1;
    IF @remove=1 DELETE learning.AvatarImages WHERE UserId=@id;
    IF @avatar IS NOT NULL BEGIN
      UPDATE learning.AvatarImages SET Content=@avatar WHERE UserId=@id;
      IF @@ROWCOUNT=0 INSERT learning.AvatarImages(UserId,Content) VALUES(@id,@avatar);
    END;
    """,("id",actor.UserId),("hash",actor.Hash),("name",r.DisplayName),("chinese",r.ChineseName),("bio",r.Bio),("purpose",r.Purpose),("level",string.IsNullOrEmpty(r.TargetLevelCode)?null:r.TargetLevelCode),("goal",r.DailyWordGoal),("pinyin",r.ShowPinyin),("version",version),("preferencesVersion",preferencesVersion),("remove",r.RemoveAvatar));
   var parameter=command.Parameters.Add("@avatar",SqlDbType.VarBinary,-1);parameter.Value=(object?)avatar??DBNull.Value;
   command.Transaction=tx;await command.ExecuteNonQueryAsync();tx.Commit();
  }catch(Microsoft.Data.SqlClient.SqlException error)when(error.Number is 51041 or 51042){tx.Rollback();throw new ApiError(error.Number==51041?401:409,error.Number==51041?"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.":"Hồ sơ đã được cập nhật ở nơi khác. Thông tin đang nhập vẫn được giữ; hãy tải lại hồ sơ trước khi lưu.");}
   catch{tx.Rollback();throw;}
 }
}
