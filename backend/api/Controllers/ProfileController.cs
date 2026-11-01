using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
[ApiController,Authorize,Route("profile"),ResponseCache(NoStore=true,Location=ResponseCacheLocation.None)]
public sealed class ProfileController(IProfileService service,ICurrentActor current):ControllerBase {
 [HttpGet] public async Task<UserProfile> Get()=>await service.Get(await current.Require());
 [HttpPut] public async Task<UserProfile> Update(ProfileUpdateRequest request)=>await service.Update(await current.Require(),request);
 [HttpGet("avatar")] public async Task<IActionResult> Avatar(){var bytes=await service.Avatar(await current.Require());Response.Headers.CacheControl="private, no-store";Response.Headers.XContentTypeOptions="nosniff";return bytes==null?NotFound():File(bytes,"image/jpeg");}
}
