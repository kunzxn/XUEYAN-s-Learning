using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
[ApiController,Authorize(Policy="Learner"),Route("library/words"),ResponseCache(NoStore=true,Location=ResponseCacheLocation.None)]
public sealed class LibraryController(ILibraryRepository repository,ICurrentActor current):ControllerBase {
 [HttpGet] public async Task<object> Get()=>await repository.Words(await current.Require());
 [HttpPut("{id:long}")] public async Task<object> Save(long id){if(id<=0)throw new ApiError(400,"ID từ không hợp lệ.");await repository.Save(await current.Require(),id);return new{message="Đã lưu từ vào sổ từ của bạn."};}
 [HttpDelete("{id:long}")] public async Task<object> Remove(long id){if(id<=0)throw new ApiError(400,"ID từ không hợp lệ.");await repository.Remove(await current.Require(),id);return new{message="Đã bỏ lưu từ."};}
}
