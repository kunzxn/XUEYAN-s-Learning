public interface ICurrentActor {Task<Actor> Require(bool admin=false);}
public sealed class CurrentActor(IHttpContextAccessor accessor):ICurrentActor {
 public Task<Actor> Require(bool admin=false){
  var actor=accessor.HttpContext?.Items[JwtAuthentication.ActorKey] as Actor??throw new ApiError(401,"Vui lòng đăng nhập.");
  if(admin&&actor.Role!="admin")throw new ApiError(403,"Bạn không có quyền quản trị.");return Task.FromResult(actor);
 }
}
