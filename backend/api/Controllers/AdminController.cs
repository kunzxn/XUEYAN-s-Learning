using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

[ApiController,Authorize(Policy="Admin"),Route("admin")]
public sealed class AdminController(IAdminService service,ICurrentActor current):ControllerBase
{
    [HttpGet("{resource}")] public async Task<object> List(string resource)=>await service.List(await current.Require(true),resource);
    [HttpGet("overview/stats")] public async Task<object> Stats()=>await service.Stats(await current.Require(true));
    [HttpGet("users/{id:guid}/learning")] public async Task<object> Learned(Guid id)=>await service.Learned(await current.Require(true),id);
    [HttpPost("{resource}")] public async Task<IActionResult> Create(string resource,JsonElement body)=>StatusCode(201,await service.Create(await current.Require(true),resource,body));
    [HttpPut("{resource}/{id}")] public async Task<object> Update(string resource,string id,JsonElement body)=>await service.Update(await current.Require(true),resource,id,body);
    [HttpDelete("{resource}/{id}")] public async Task<object> Delete(string resource,string id)=>await service.Delete(await current.Require(true),resource,id);
}
