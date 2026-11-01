public sealed record Credential(Guid UserId,string Role,string Status,string Name,string PasswordHash);
public interface IAuthRepository
{
    Task Create(Registration registration,bool firstAdmin=false);
    Task<Guid> GoogleIdentity(string sub,string email,string name);
    Task<Credential?> FindCredential(string email);
    Task<SessionRecord> AddSession(Guid userId,byte[] hash);
    Task<SessionRecord?> FindSession(byte[] hash);
    Task<SessionRecord?> FindSessionById(Guid id);
    Task Revoke(byte[] hash);
}
public sealed class AuthRepository(Database db):IAuthRepository
{
    public async Task Create(Registration registration,bool firstAdmin=false) {
        await using var connection=await db.Open();
        using var transaction=connection.BeginTransaction(System.Data.IsolationLevel.Serializable);
        try {
            using var command=Database.Command(connection,"""
                IF @first=1 AND EXISTS(SELECT 1 FROM auth.Users WITH(UPDLOCK,HOLDLOCK) WHERE RoleCode='admin' AND Status='active') THROW 51030,'An active admin already exists.',1;
                INSERT auth.Users(UserId,Email,RoleCode,Status) VALUES (@id,@email,@role,'active');
                INSERT auth.PasswordCredentials(UserId,PasswordHash) VALUES (@id,@hash);
                INSERT learning.Profiles(UserId,DisplayName) VALUES (@id,@name);
                INSERT learning.Preferences(UserId) VALUES (@id);
                """,("first",firstAdmin),("id",registration.UserId),("email",registration.Email),("role",registration.Role),("hash",registration.PasswordHash),("name",registration.Name));
            command.Transaction=transaction;await command.ExecuteNonQueryAsync();transaction.Commit();
        }catch{transaction.Rollback();throw;}
    }
    public async Task<Guid> GoogleIdentity(string sub,string email,string name){
  Guid userId;
  await using(var c=await db.Open())using(var tx=c.BeginTransaction(System.Data.IsolationLevel.Serializable)){
   try{
    using var find=Database.Command(c,"SELECT UserId FROM auth.ExternalIdentities WITH(UPDLOCK,HOLDLOCK) WHERE Provider='google' AND Subject=@sub",("sub",sub));find.Transaction=tx;
    var existing=await find.ExecuteScalarAsync();
    if(existing is Guid id)userId=id;
    else {
     using var duplicate=Database.Command(c,"SELECT COUNT(*) FROM auth.Users WITH(UPDLOCK,HOLDLOCK) WHERE NormalizedEmail=LOWER(@email)",("email",email));duplicate.Transaction=tx;
     if(Convert.ToInt32(await duplicate.ExecuteScalarAsync())>0)throw new ApiError(409,"Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu; liên kết Google cho tài khoản cũ chưa khả dụng.");
     userId=Guid.NewGuid();using var create=Database.Command(c,"""
      INSERT auth.Users(UserId,Email,RoleCode,Status,EmailVerifiedAt) VALUES(@id,@email,'learner','active',SYSUTCDATETIME());
      INSERT learning.Profiles(UserId,DisplayName) VALUES(@id,@name);
      INSERT learning.Preferences(UserId) VALUES(@id);
      INSERT auth.ExternalIdentities(Provider,Subject,UserId) VALUES('google',@sub,@id);
      """,("id",userId),("email",email),("name",name),("sub",sub));create.Transaction=tx;await create.ExecuteNonQueryAsync();
    }tx.Commit();
   }catch{tx.Rollback();throw;}
  }
  return userId;
    }
    public async Task<Credential?> FindCredential(string email) {
        await using var connection=await db.Open();
        var rows=await Database.Query(connection,"SELECT u.UserId,u.RoleCode,u.Status,c.PasswordHash,p.DisplayName FROM auth.Users u JOIN auth.PasswordCredentials c ON c.UserId=u.UserId JOIN learning.Profiles p ON p.UserId=u.UserId WHERE u.NormalizedEmail=LOWER(@email)",("email",email));
        if(rows.Count!=1)return null;var r=rows[0];return new((Guid)r["userId"]!,(string)r["roleCode"]!,(string)r["status"]!,(string)r["displayName"]!,(string)r["passwordHash"]!);
    }
    public async Task<SessionRecord> AddSession(Guid userId,byte[] hash) {
        await using var c=await db.Open();await Database.Execute(c,"INSERT auth.Sessions(UserId,TokenHash,ExpiresAt) VALUES (@id,@hash,DATEADD(hour,12,SYSUTCDATETIME()))",("id",userId),("hash",hash));
        return await FindSession(hash)??throw new ApiError(401,"Tài khoản không còn khả dụng.");
    }
    public Task<SessionRecord?> FindSession(byte[] hash)=>Find("s.TokenHash=@value",hash);
    public Task<SessionRecord?> FindSessionById(Guid id)=>Find("s.SessionId=@value",id);
    private async Task<SessionRecord?> Find(string predicate,object value) {
        await using var c=await db.Open();
        var rows=await Database.Query(c,"SELECT s.SessionId,s.TokenHash,s.ExpiresAt,u.UserId,u.RoleCode,p.DisplayName FROM auth.Sessions s JOIN auth.Users u ON u.UserId=s.UserId JOIN learning.Profiles p ON p.UserId=u.UserId WHERE "+predicate+" AND s.ExpiresAt>SYSUTCDATETIME() AND s.RevokedAt IS NULL AND u.Status='active'",("value",value));
        if(rows.Count!=1)return null;var r=rows[0];return new((Guid)r["sessionId"]!,new((Guid)r["userId"]!,(string)r["roleCode"]!,(string)r["displayName"]!,(byte[])r["tokenHash"]!),(DateTime)r["expiresAt"]!);
    }
    public async Task Revoke(byte[] hash){await using var c=await db.Open();await Database.Execute(c,"UPDATE auth.Sessions SET RevokedAt=SYSUTCDATETIME() WHERE TokenHash=@hash",("hash",hash));}
}
