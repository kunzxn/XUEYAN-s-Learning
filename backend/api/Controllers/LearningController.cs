using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController,Authorize(Policy="Learner"),Route("learning")]
public sealed class LearningController(ILearningService service,ICurrentActor current):ControllerBase
{
    [HttpGet("words")] public async Task<object> Words()=>await service.Words(await current.Require());
    [HttpGet("progress")] public async Task<object> Progress()=>await service.Progress(await current.Require());
    [HttpGet("due")] public async Task<object> Due()=>await service.Due(await current.Require());
    [HttpPost("reviews")] public async Task<object> Review(ReviewRequest request){await service.Review(await current.Require(),request);return new{message="Đã lưu kết quả học vào SQL Server."};}
}
