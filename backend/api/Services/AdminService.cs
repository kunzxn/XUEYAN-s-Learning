using System.Text.Json;
using static RequestFields;

public interface IAdminService
{
    Task<object> List(Actor actor,string resource);
    Task<object> Stats(Actor actor);
    Task<object> Learned(Actor actor,Guid id);
    Task<object> Create(Actor actor,string resource,JsonElement body);
    Task<object> Update(Actor actor,string resource,string id,JsonElement body);
    Task<object> Delete(Actor actor,string resource,string id);
}
public sealed class AdminService(IAdminRepository repository,IAuthService auth,IPublishedWordCache cache):IAdminService
{
    public Task<object> List(Actor actor,string resource)=>repository.List(actor,resource);
    public Task<object> Stats(Actor actor)=>repository.Stats(actor);
    public Task<object> Learned(Actor actor,Guid id)=>repository.Learned(actor,id);
    public async Task<object> Create(Actor actor,string resource,JsonElement body){
        RequestValidation.Admin(resource,body,false);
        if(resource=="users"){var id=await auth.Register(new(Text(body,"displayName",80),Email(body),Text(body,"password",128,8,false)));return new{id};}
        await repository.Write(actor,Validate(resource,body,false),null);if(resource=="words")cache.Invalidate();return new{message="Đã tạo trên SQL Server."};
    }
    public async Task<object> Update(Actor actor,string resource,string id,JsonElement body){
        RequestValidation.Admin(resource,body,true);
        if(resource=="users"){
            if(!Guid.TryParse(id,out var userId)||userId==Guid.Empty)throw new ApiError(400,"ID không hợp lệ.");
            if(userId==actor.UserId)throw new ApiError(409,"Hãy nhờ admin khác thay đổi tài khoản đang dùng để tránh tự thu hồi phiên quản trị.");
            await repository.UpdateUser(actor,userId,Text(body,"displayName",80),Choice(body,"roleCode","learner","teacher","admin"),Choice(body,"status","pending","active","suspended","closed"));
            return new{message="Đã cập nhật tài khoản; các phiên của tài khoản này đã được thu hồi."};
        }
        await repository.Write(actor,Validate(resource,body,true),Id(id));if(resource=="words")cache.Invalidate();return new{message="Đã lưu trên SQL Server."};
    }
    public async Task<object> Delete(Actor actor,string resource,string id){
        if(resource=="users"){
            if(!Guid.TryParse(id,out var userId)||userId==Guid.Empty)throw new ApiError(400,"ID không hợp lệ.");
            if(userId==actor.UserId)throw new ApiError(409,"Không thể đóng tài khoản đang đăng nhập.");
            await repository.CloseUser(actor,userId);return new{message="Đã đóng tài khoản và thu hồi phiên. Lịch sử học được giữ lại."};
        }
        await repository.Delete(actor,resource,Id(id));if(resource=="words")cache.Invalidate();return new{message="Đã xóa trên SQL Server."};
    }
    private static long Id(string value){if(!long.TryParse(value,out var id)||id<1)throw new ApiError(400,"ID không hợp lệ.");return id;}
    private static ContentMutation Validate(string resource,JsonElement body,bool update){
        var slug=Text(body,"slug",100);if(!System.Text.RegularExpressions.Regex.IsMatch(slug,"^[a-z0-9]+(?:-[a-z0-9]+)*$"))throw new ApiError(400,"Slug chỉ dùng chữ thường, số và dấu gạch nối.");
        var status=Choice(body,"status","draft","published","archived");
        Dictionary<string,object?> fields=resource switch {
            "words"=>new(){["simplified"]=Text(body,"simplified",100),["pinyin"]=Text(body,"pinyin",200),["hanViet"]=Text(body,"hanViet",200,0),["meaningVi"]=Text(body,"meaningVi",2000)},
            "lessons"=>new(){["levelId"]=Number(body,"levelId",1,int.MaxValue),["title"]=Text(body,"title",200),["description"]=Text(body,"description",2000,0),["sortOrder"]=Number(body,"sortOrder",1,int.MaxValue)},
            "teachers"=>new(){["displayName"]=Text(body,"displayName",100),["headline"]=Text(body,"headline",200,0),["bio"]=Text(body,"bio",4000,0),["consultationSchedule"]=Text(body,"consultationSchedule",1000,0)},
            _=>throw new ApiError(404,"Không có mục quản lý này.")};
        byte[]? version=null;if(update&&resource!="lessons"){try{version=Convert.FromBase64String(Text(body,"version",30));if(version.Length!=8)throw new FormatException();}catch(FormatException){throw new ApiError(400,"Phiên bản dữ liệu không hợp lệ.");}}
        return new(resource,slug,status,fields,version);
    }
}
