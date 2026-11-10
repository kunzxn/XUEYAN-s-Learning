using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
[ApiController,Authorize(Policy="Learner"),Route("learning/preferences")]
public sealed class PreferencesController(PreferencesService service,ICurrentActor current):ControllerBase{
 [HttpGet]public async Task<object> Get()=>await service.Get(await current.Require());
 [HttpPut]public async Task<object> Save(PreferencesRequest request)=>await service.Save(await current.Require(),request);
}
