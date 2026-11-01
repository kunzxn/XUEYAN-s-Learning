using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController,Route("access"),ResponseCache(NoStore=true,Location=ResponseCacheLocation.None)]
public sealed class AccessController(ICurrentActor current):ControllerBase {
 private async Task<AccountResult> Account(){var actor=await current.Require();return new(actor.UserId,actor.Role,actor.Name);}
 [HttpGet("learner"),Authorize(Policy="Learner")] public Task<AccountResult> Learner()=>Account();
 [HttpGet("teacher"),Authorize(Policy="Teacher")] public Task<AccountResult> Teacher()=>Account();
 [HttpGet("admin"),Authorize(Policy="Admin")] public Task<AccountResult> Admin()=>Account();
}
