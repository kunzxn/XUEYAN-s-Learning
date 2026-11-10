using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController,Authorize(Policy="Learner"),Route("learning")]
public sealed class LearningController(ILearningService service,ICurrentActor current):ControllerBase
{
    [HttpGet("words")] public async Task<object> Words()=>await service.Words(await current.Require());
    [HttpGet("progress")] public async Task<object> Progress()=>await service.Progress(await current.Require());
    [HttpGet("due")] public async Task<object> Due()=>await service.Due(await current.Require());
    [HttpGet("overview")] public async Task<object> Overview()=>await service.Overview(await current.Require());
    [HttpGet("queue")] public async Task<object> Queue([FromQuery]string ids)=>await service.Queue(await current.Require(),ids);
    [HttpGet("results")] public async Task<object> Results([FromQuery]string events)=>await service.Results(await current.Require(),events);
    [HttpPost("reviews")] public async Task<object> Review(ReviewRequest request){await service.Review(await current.Require(),request);return new{message="Đã lưu kết quả học vào SQL Server."};}
}
