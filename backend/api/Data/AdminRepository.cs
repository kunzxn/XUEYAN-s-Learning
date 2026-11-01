public interface IAdminRepository
{
    Task<object> List(Actor actor,string resource);
    Task<object> Stats(Actor actor);
    Task<object> Learned(Actor actor,Guid userId);
    Task Write(Actor actor,ContentMutation change,long? id);
    Task Delete(Actor actor,string resource,long id);
    Task UpdateUser(Actor actor,Guid id,string name,string role,string status);
    Task CloseUser(Actor actor,Guid id);
}
public sealed class AdminRepository(Database db,IEfReadRepository reads):IAdminRepository
{
    public Task<object> List(Actor actor,string resource)=>reads.AdminList(actor,resource);
    public async Task<object> Stats(Actor actor){await using var c=await db.Open(actor);return (await Database.Query(c,"SELECT (SELECT COUNT(*) FROM auth.AdminAccounts WHERE RoleCode='learner') AS Learners,(SELECT COUNT(*) FROM catalog.Words) AS Words,(SELECT COUNT(*) FROM catalog.Lessons) AS Lessons,(SELECT COUNT(*) FROM learning.ReviewEvents) AS Reviews"))[0];}
    public Task<object> Learned(Actor actor,Guid userId)=>reads.AdminLearned(actor,userId);
    public async Task Write(Actor actor,ContentMutation change,long? id) {
        var (table,key,columns)=Metadata(change.Resource);
        var values=change.Fields.Select(pair=>(pair.Key,pair.Value)).ToList();values.Add(("slug",change.Slug));values.Add(("status",change.Status));
        string sql;
        if(id.HasValue){values.Add(("id",id));var where=$"{key}=@id";if(change.Version!=null){values.Add(("version",change.Version));where+=" AND Version=@version";}sql=$"UPDATE {table} SET {columns} WHERE {where}";}
        else {var parts=columns.Split(',').Select(s=>s.Split('=')).ToArray();sql=$"INSERT {table}({string.Join(',',parts.Select(p=>p[0]))}) VALUES ({string.Join(',',parts.Select(p=>p[1]))})";}
        await using var c=await db.Open(actor);
        if(change.Resource=="lessons" && (await Database.Query(c,"SELECT LevelId FROM catalog.Levels WHERE LevelId=@id",("id",change.Fields["levelId"]))).Count==0)throw new ApiError(400,"Cấp HSK không tồn tại.",new(){["levelId"]=["Chọn cấp HSK có trong danh sách hiện tại."]});
        if(await Database.Execute(c,sql,values.ToArray())==0){
            if(id.HasValue && (await Database.Query(c,$"SELECT {key} FROM {table} WHERE {key}=@id",("id",id))).Count==0)throw new ApiError(404,"Bản ghi không còn tồn tại.");
            throw new ApiError(409,"Bản ghi đã thay đổi. Hãy tải lại trước khi sửa.");
        }
    }
    public async Task Delete(Actor actor,string resource,long id){var(table,key,_)=Metadata(resource);await using var c=await db.Open(actor);if(await Database.Execute(c,$"DELETE FROM {table} WHERE {key}=@id",("id",id))==0)throw new ApiError(404,"Bản ghi không còn tồn tại.");}
    public async Task UpdateUser(Actor actor,Guid id,string name,string role,string status){
        await using var c=await db.Open(actor);
        // Outer transaction makes access/profile updates atomic. Procedure checks final-admin invariant.
        using var transaction=c.BeginTransaction();
        try{using var command=Database.Command(c,"EXEC auth.SetUserAccess @TargetUserId=@id,@RoleCode=@role,@Status=@status; UPDATE learning.Profiles SET DisplayName=@name,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@id;",("id",id),("role",role),("status",status),("name",name));command.Transaction=transaction;await command.ExecuteNonQueryAsync();transaction.Commit();}
        catch{if(c.State==System.Data.ConnectionState.Open&&transaction.Connection!=null)transaction.Rollback();throw;}
    }
    public async Task CloseUser(Actor actor,Guid id){await using var c=await db.Open(actor);await Database.Execute(c,"DECLARE @role varchar(10)=(SELECT RoleCode FROM auth.AdminAccounts WHERE UserId=@id); IF @role IS NULL THROW 51012,'User not found.',1; EXEC auth.SetUserAccess @TargetUserId=@id,@RoleCode=@role,@Status='closed'",("id",id));}
    private static (string,string,string) Metadata(string resource)=>resource switch {
        "words"=>("catalog.Words","WordId","Slug=@slug,Simplified=@simplified,Pinyin=@pinyin,HanViet=@hanViet,MeaningVi=@meaningVi,Status=@status"),
        "lessons"=>("catalog.Lessons","LessonId","Slug=@slug,LevelId=@levelId,Title=@title,Description=@description,SortOrder=@sortOrder,Status=@status"),
        "teachers"=>("classroom.Teachers","TeacherId","Slug=@slug,DisplayName=@displayName,Headline=@headline,Bio=@bio,ConsultationSchedule=@consultationSchedule,Status=@status"),
        _=>throw new ApiError(404,"Không có mục quản lý này.")};
}
