using Microsoft.Extensions.Configuration;
using System.Text.Json;

var scheduler=new SpacedRepetitionScheduler();
var now=new DateTime(2026,10,23,0,0,0,DateTimeKind.Utc);
var first=scheduler.Next(3,null,null,now);
Assert(first.NextReviewAt==now.AddDays(1),"first successful recall: 1 day");
var second=scheduler.Next(3,first.State,first.Version,now);
Assert(second.NextReviewAt==now.AddDays(6),"second consecutive recall: 6 days");
var third=scheduler.Next(3,second.State,second.Version,now);
Assert(third.NextReviewAt==now.AddDays(15),"later recall uses prior interval and ease");
var failed=scheduler.Next(1,third.State,third.Version,now);
Assert(failed.NextReviewAt==now.AddMinutes(10),"forget: relearn in 10 minutes");
var reset=scheduler.Next(3,failed.State,failed.Version,now);
Assert(reset.NextReviewAt==now.AddDays(1),"forget resets consecutive recall count");
foreach(var bad in new[]{"{bad","{}","{\"ease\":0,\"intervalDays\":-1}","{\"ease\":2.5,\"intervalDays\":999999}"})
 Assert(scheduler.Next(3,bad,first.Version,now).NextReviewAt==now.AddDays(1),"invalid state is recovered");
Assert(scheduler.Next(3,"{\"rating\":3}","simple-interval-v1",now).NextReviewAt==now.AddDays(1),"legacy migration initializes algorithm without losing DB history");
var state=first;
for(var i=0;i<100;i++)state=scheduler.Next(4,state.State,state.Version,now);
Assert(state.NextReviewAt<=now.AddDays(3650),"interval is capped");
state=first;
for(var i=0;i<100;i++)state=scheduler.Next(1,state.State,state.Version,now);
Assert(JsonDocument.Parse(state.State).RootElement.GetProperty("ease").GetDouble()>=1.3,"ease floor");
try{scheduler.Next(0,null,null,now);throw new Exception("invalid rating accepted");}catch(ArgumentOutOfRangeException){Console.WriteLine("PASS invalid rating rejected");}
Console.WriteLine("All scheduler tests passed.");
static void Assert(bool value,string name){if(!value)throw new Exception(name);Console.WriteLine("PASS "+name);}

using(var cache=new PublishedWordCache()){
 int loads=0;var entered=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);var release=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
 async Task<IReadOnlyList<WordDto>> Load(){Interlocked.Increment(ref loads);entered.TrySetResult();await release.Task;return new[]{new WordDto(1,"xuexi","学习","xuéxí",null,"Học tập")};}
 var tasks=Enumerable.Range(0,20).Select(_=>cache.Get(Load)).ToArray();await entered.Task;release.SetResult();await Task.WhenAll(tasks);
 Assert(loads==1,"20 concurrent cache misses load once");
 await cache.Get(Load);Assert(loads==1,"cache hit avoids repository");
 cache.Invalidate();await cache.Get(Load);Assert(loads==2,"invalidation reloads static data");
}
using(var cache=new PublishedWordCache()){
 int calls=0;var entered=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);var release=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
 async Task<IReadOnlyList<WordDto>> Load(){var call=Interlocked.Increment(ref calls);if(call==1){entered.SetResult();await release.Task;}return new[]{new WordDto(call,"word","字","zì",null,"Từ")};}
 var read=cache.Get(Load);await entered.Task;cache.Invalidate();release.SetResult();var rows=await read;
 Assert(calls==2&&rows[0].Id==2,"invalidation during query cannot repopulate stale cache");
}
using(var cache=new PublishedWordCache(TimeSpan.FromMilliseconds(50))){
 var calls=0;Task<IReadOnlyList<WordDto>> Load(){calls++;return Task.FromResult<IReadOnlyList<WordDto>>(Array.Empty<WordDto>());}
 await cache.Get(Load);await Task.Delay(100);await cache.Get(Load);Assert(calls==2,"absolute TTL expires even for an empty catalog");
}
using(var cache=new PublishedWordCache()){
 try{await cache.Get(()=>Task.FromException<IReadOnlyList<WordDto>>(new InvalidOperationException("db failure")));}catch(InvalidOperationException){}
 var rows=await cache.Get(()=>Task.FromResult<IReadOnlyList<WordDto>>(new[]{new WordDto(1,"ok","字","zì",null,"Từ")}));Assert(rows.Count==1,"loader errors are not cached");
}
Console.WriteLine("All cache tests passed.");

var badBodies = new[]{"[]","null","{}","{\"slug\":\"Bad Slug\",\"status\":\"wrong\",\"simplified\":\"abc\",\"pinyin\":\"学习\",\"meaningVi\":\" \"}"};
foreach(var resource in new[]{"words","lessons","teachers","users"}) foreach(var body in badBodies){
 try{RequestValidation.Admin(resource,JsonDocument.Parse(body).RootElement,false);throw new Exception("Invalid admin input accepted");}
 catch(ApiError e){Assert(e.Status==400&&e.Fields?.Count>0,"admin "+resource+" invalid payload has field errors");}
}
foreach(var email in new[]{"", "bad", "x@localhost", new string('x',255)+"@example.com"}){
 try{RequestValidation.Auth(email,"        "," ",true);throw new Exception("Invalid account accepted");}catch(ApiError e){Assert(e.Fields?.Count==3,"account validation aggregates name/email/password");}
}
try{RequestValidation.Review(new(0,9,Guid.Empty,-1));throw new Exception("Invalid review accepted");}catch(ApiError e){Assert(e.Fields?.Count==4,"review validates all four fields");}
RequestValidation.Auth("learner@example.com","Long test password!","Học viên 学言",true);
RequestValidation.Admin("words",JsonDocument.Parse("{\"slug\":\"xue-xi\",\"status\":\"published\",\"simplified\":\"学习\",\"pinyin\":\"xuéxí\",\"meaningVi\":\"Học tập\"}").RootElement,false);
Assert(true,"valid Unicode and optional fields accepted");
Console.WriteLine("All request validation tests passed.");

RequestValidation.Admin("words",JsonDocument.Parse("{\"slug\":\"pinyin-nfd\",\"status\":\"draft\",\"simplified\":\"学习\",\"pinyin\":\"xue\\u0301xi\\u0301\",\"meaningVi\":\"Học tập\"}").RootElement,false);
Assert(true,"decomposed Unicode Pinyin is normalized before validation");

var payloads = new Dictionary<string,Dictionary<string,object?>>{
 ["words"]=new(){["slug"]="unit-word",["status"]="draft",["simplified"]="学习",["pinyin"]="xuéxí",["meaningVi"]="Học tập",["hanViet"]=""},
 ["lessons"]=new(){["slug"]="unit-lesson",["status"]="draft",["title"]="Bài thử",["levelId"]=1,["sortOrder"]=1,["description"]=""},
 ["teachers"]=new(){["slug"]="unit-teacher",["status"]="draft",["displayName"]="Giáo viên",["headline"]="",["bio"]="",["consultationSchedule"]=""},
 ["users"]=new(){["displayName"]="Người học",["email"]="unit@example.com",["password"]="ValidPassword!123"}
};
var lengths=new Dictionary<string,int>{["slug"]=100,["simplified"]=100,["pinyin"]=200,["meaningVi"]=2000,["hanViet"]=200,["title"]=200,["description"]=2000,["headline"]=200,["bio"]=4000,["consultationSchedule"]=1000,["email"]=254,["password"]=128};
foreach(var (resource,payload) in payloads){
 RequestValidation.Admin(resource,JsonSerializer.SerializeToElement(payload),false);
 foreach(var key in payload.Where(p=>p.Value is string).Select(p=>p.Key)){
  var changed=new Dictionary<string,object?>(payload){[key]=new string('x',(key=="displayName"?(resource=="users"?80:100):key=="status"?30:lengths[key])+1)};
  try{RequestValidation.Admin(resource,JsonSerializer.SerializeToElement(changed),false);throw new Exception("Oversized "+key+" accepted");}catch(ApiError e){Assert(e.Fields?.ContainsKey(key)==true,resource+" rejects oversized "+key);}
 }
}
foreach(var key in new[]{"levelId","sortOrder"})foreach(var bad in new object[]{0,-1,1.5,"abc",true,new[]{1}}){
 var payload=new Dictionary<string,object?>(payloads["lessons"]){[key]=bad};
 try{RequestValidation.Admin("lessons",JsonSerializer.SerializeToElement(payload),false);throw new Exception("Invalid number accepted");}catch(ApiError e){Assert(e.Fields?.ContainsKey(key)==true,"integer validation "+key);}
}
foreach(var resource in new[]{"words","teachers"})foreach(var bad in new[]{"", "not-base64", "AA=="}){
 var payload=new Dictionary<string,object?>(payloads[resource]){["version"]=bad};
 try{RequestValidation.Admin(resource,JsonSerializer.SerializeToElement(payload),true);throw new Exception("Invalid version accepted");}catch(ApiError e){Assert(e.Fields?.ContainsKey("version")==true,"rowversion validation "+resource);}
}

// Locally signed fixtures verify Google's token rules without any real Google account.
using(var rsa=System.Security.Cryptography.RSA.Create(2048)){
 var key=new Microsoft.IdentityModel.Tokens.RsaSecurityKey(rsa){KeyId="test-google-key"};
 string GoogleToken(string issuer="https://accounts.google.com",string audience="test-client",string nonce="test-nonce",bool verified=true,bool expired=false){
  var claims=new[]{new System.Security.Claims.Claim("sub","test-subject"),new System.Security.Claims.Claim("email","fixture@example.invalid"),new System.Security.Claims.Claim("email_verified",verified?"true":"false",System.Security.Claims.ClaimValueTypes.Boolean),new System.Security.Claims.Claim("nonce",nonce)};
  return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(issuer,audience,claims,DateTime.UtcNow.AddHours(-1),expired?DateTime.UtcNow.AddMinutes(-5):DateTime.UtcNow.AddMinutes(5),new Microsoft.IdentityModel.Tokens.SigningCredentials(key,Microsoft.IdentityModel.Tokens.SecurityAlgorithms.RsaSha256)));
 }
 Assert(GoogleIdentityValidation.Verify(GoogleToken(),"test-nonce","test-client",new[]{key}).FindFirst("sub")?.Value=="test-subject","Google valid signature and claims");
 foreach(var token in new[]{GoogleToken(issuer:"wrong"),GoogleToken(audience:"wrong"),GoogleToken(nonce:"wrong"),GoogleToken(verified:false),GoogleToken(expired:true)}){
  try{GoogleIdentityValidation.Verify(token,"test-nonce","test-client",new[]{key});throw new Exception("Invalid Google identity accepted");}catch(ApiError error){Assert(error.Status==401,"Google rejects issuer/audience/nonce/unverified email/expiry");}
 }
 using var otherRsa=System.Security.Cryptography.RSA.Create(2048);var otherKey=new Microsoft.IdentityModel.Tokens.RsaSecurityKey(otherRsa){KeyId="test-google-key"};
 try{GoogleIdentityValidation.Verify(GoogleToken(),"test-nonce","test-client",new[]{otherKey});throw new Exception("Wrong Google signature accepted");}catch(ApiError error){Assert(error.Status==401,"Google rejects wrong signing key");}
}

// Configuration responses must not invalidate a button rendered by a previous effect/tab.
var googleConfiguration=new Microsoft.Extensions.Configuration.ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?>{{"Google:ClientId","unit-client"}}).Build();
var googleLogin=new GoogleLoginService(null!,null!,googleConfiguration);
string ConfigNonce(string? cookie){
 var controller=new AuthController(null!,null!,new Microsoft.Extensions.Hosting.Internal.HostingEnvironment{EnvironmentName="Development"},googleLogin){ControllerContext=new Microsoft.AspNetCore.Mvc.ControllerContext{HttpContext=new Microsoft.AspNetCore.Http.DefaultHttpContext()}};
 if(cookie!=null)controller.Request.Headers.Cookie="xueyan_google_nonce="+cookie;
 var result=(Microsoft.AspNetCore.Mvc.OkObjectResult)controller.GoogleConfig();
 return (string)result.Value!.GetType().GetProperty("nonce")!.GetValue(result.Value)!;
}
var firstNonce=ConfigNonce(null);
Assert(firstNonce.Length==64&&firstNonce.All(Uri.IsHexDigit),"Google config issues random challenge");
Assert(ConfigNonce(firstNonce)==firstNonce,"Google config reuses browser challenge across repeated loads");
Assert(ConfigNonce("bad-cookie")!="bad-cookie","Google config replaces malformed challenge");
