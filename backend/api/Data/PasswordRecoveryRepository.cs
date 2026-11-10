public sealed class PasswordRecoveryRepository(Database db){
 public async Task<bool> Issue(string email,byte[] hash){
  await using var c=await db.Open();using var tx=c.BeginTransaction(System.Data.IsolationLevel.Serializable);
  try{using var command=Database.Command(c,"""
   DECLARE @id uniqueidentifier;
   SELECT @id=u.UserId FROM auth.Users u WITH(UPDLOCK,HOLDLOCK) JOIN auth.PasswordCredentials p ON p.UserId=u.UserId
   WHERE u.NormalizedEmail=LOWER(@email) AND u.Status='active';
   IF @id IS NULL RETURN;
   IF EXISTS(SELECT 1 FROM auth.PasswordResets WHERE UserId=@id AND UsedAt IS NULL AND ExpiresAt>SYSUTCDATETIME() AND CreatedAt>DATEADD(second,-60,SYSUTCDATETIME())) RETURN;
   IF (SELECT COUNT(*) FROM auth.PasswordResets WHERE UserId=@id AND CreatedAt>DATEADD(hour,-1,SYSUTCDATETIME()))>=5 RETURN;
   INSERT auth.PasswordResets(TokenHash,UserId,ExpiresAt)
   VALUES(@hash,@id,DATEADD(minute,30,SYSUTCDATETIME()));
   """,("email",email),("hash",hash));command.Transaction=tx;var issued=await command.ExecuteNonQueryAsync()==1;tx.Commit();return issued;}catch{tx.Rollback();throw;}
 }
 public async Task Revoke(byte[] hash){await using var c=await db.Open();await Database.Execute(c,"UPDATE auth.PasswordResets SET UsedAt=SYSUTCDATETIME() WHERE TokenHash=@hash",("hash",hash));}
 public async Task<string?> Email(byte[] hash){await using var c=await db.Open();using var q=Database.Command(c,"SELECT u.Email FROM auth.PasswordResets r JOIN auth.Users u ON u.UserId=r.UserId WHERE r.TokenHash=@hash AND r.UsedAt IS NULL AND r.ExpiresAt>SYSUTCDATETIME() AND u.Status='active'",("hash",hash));return await q.ExecuteScalarAsync() as string;}
 public async Task Consume(byte[] hash,string password){
  await using var c=await db.Open();using var tx=c.BeginTransaction(System.Data.IsolationLevel.Serializable);
  try{using var cmd=Database.Command(c,"""
   DECLARE @user uniqueidentifier;
   SELECT @user=r.UserId FROM auth.PasswordResets r WITH(UPDLOCK,HOLDLOCK) JOIN auth.Users u ON u.UserId=r.UserId
   WHERE r.TokenHash=@hash AND r.UsedAt IS NULL AND r.ExpiresAt>SYSUTCDATETIME() AND u.Status='active';
   IF @user IS NULL THROW 51050,'Invalid reset link.',1;
   UPDATE auth.PasswordCredentials SET PasswordHash=@password,ChangedAt=SYSUTCDATETIME() WHERE UserId=@user;
   IF @@ROWCOUNT<>1 THROW 51050,'Invalid reset link.',1;
   UPDATE auth.PasswordResets SET UsedAt=SYSUTCDATETIME() WHERE UserId=@user AND UsedAt IS NULL;
   UPDATE auth.Sessions SET RevokedAt=SYSUTCDATETIME() WHERE UserId=@user AND RevokedAt IS NULL;
   """,("hash",hash),("password",password));cmd.Transaction=tx;await cmd.ExecuteNonQueryAsync();tx.Commit();}
  catch(Microsoft.Data.SqlClient.SqlException e)when(e.Number==51050){tx.Rollback();throw new ApiError(400,"Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới.");}catch{tx.Rollback();throw;}
 }
}
