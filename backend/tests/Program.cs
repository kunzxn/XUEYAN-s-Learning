using System.Net;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

var root=Path.GetFullPath("backend/.local");Directory.CreateDirectory(root);
var fixtureFile=Path.Combine(root,"smoke-fixtures.json");
await using var db=new SqlConnection("Server=localhost;Database=XUEYAN_Development;Integrated Security=true;Encrypt=true;TrustServerCertificate=true;Pooling=false");await db.OpenAsync();
await Exec("SET QUOTED_IDENTIFIER ON; SET ARITHABORT ON;");
if(args.Contains("--cleanup")) {
 if(!File.Exists(fixtureFile))return;
 var fixture=JsonSerializer.Deserialize<Fixture>(await File.ReadAllTextAsync(fixtureFile))!;
 var cleanupIds=new List<Guid>{fixture.AdminId,fixture.LearnerId,fixture.OtherId};
 using(var lookup=db.CreateCommand()){lookup.CommandText="SELECT UserId FROM auth.Users WHERE NormalizedEmail IN (@one,@two,@browser,@google)";lookup.Parameters.AddWithValue("@one",fixture.Prefix+"-created@example.invalid");lookup.Parameters.AddWithValue("@two",fixture.Prefix+"-registered@example.invalid");lookup.Parameters.AddWithValue("@browser",fixture.Prefix+"-browser@example.invalid");lookup.Parameters.AddWithValue("@google",fixture.Prefix+"-google@example.invalid");using var reader=await lookup.ExecuteReaderAsync();while(await reader.ReadAsync())cleanupIds.Add(reader.GetGuid(0));}
 foreach(var id in cleanupIds) await Exec("""
 DELETE learning.AvatarImages WHERE UserId=@id; DELETE learning.CollectionWords WHERE UserId=@id; DELETE learning.Collections WHERE UserId=@id;
 DELETE learning.ReviewEvents WHERE UserId=@id; DELETE learning.StudySessions WHERE UserId=@id;
 DELETE learning.WordProgress WHERE UserId=@id; DELETE auth.AuditEvents WHERE ActorId=@id;
 DELETE auth.PasswordResets WHERE UserId=@id; DELETE auth.ExternalIdentities WHERE UserId=@id; DELETE auth.Sessions WHERE UserId=@id; DELETE auth.PasswordCredentials WHERE UserId=@id;
 DELETE learning.Preferences WHERE UserId=@id; DELETE learning.Profiles WHERE UserId=@id;
 DELETE auth.Users WHERE UserId=@id;
 """,("id",id));
 await Exec("DELETE catalog.Lessons WHERE Slug LIKE @prefix; DELETE classroom.Teachers WHERE Slug LIKE @prefix; DELETE catalog.Words WHERE Slug LIKE @prefix;",("prefix",fixture.Prefix+"%"));
 var outbox=Path.Combine(root,"mail-outbox");if(Directory.Exists(outbox))foreach(var file in Directory.GetFiles(outbox,"*.txt")){if((await File.ReadAllTextAsync(file)).StartsWith("To: "+fixture.Prefix+"-",StringComparison.Ordinal))File.Delete(file);}
 File.Delete(fixtureFile);Console.WriteLine("PASS temporary fixtures removed; no existing user records were targeted.");return;
}
if(File.Exists(fixtureFile))throw new Exception("Previous test fixture exists. Run --cleanup before a new run.");
var prefix="smoke-"+Guid.NewGuid().ToString("N")[..10];var password="Test!"+Guid.NewGuid().ToString("N");
var adminId=Guid.NewGuid();var learnerId=Guid.NewGuid();var otherId=Guid.NewGuid();
var fixtureData=new Fixture(prefix,adminId,learnerId,otherId,prefix+"-admin@example.invalid",prefix+"-learner@example.invalid",prefix+"-other@example.invalid",password);
await File.WriteAllTextAsync(fixtureFile,JsonSerializer.Serialize(fixtureData));
var hasher=new PasswordHasher<string>();
foreach(var (id,email,role) in new[]{(adminId,fixtureData.AdminEmail,"admin"),(learnerId,fixtureData.LearnerEmail,"learner"),(otherId,fixtureData.OtherEmail,"learner")})
 await Exec("INSERT auth.Users(UserId,Email,RoleCode,Status) VALUES (@id,@email,@role,'active'); INSERT auth.PasswordCredentials(UserId,PasswordHash) VALUES (@id,@hash); INSERT learning.Profiles(UserId,DisplayName) VALUES (@id,@name); INSERT learning.Preferences(UserId) VALUES (@id);",("id",id),("email",email),("role",role),("hash",hasher.HashPassword(email,password)),("name","Kiểm thử "+role));
if(args.Contains("--prepare-ui")){Console.WriteLine("PASS isolated browser-test accounts prepared; no real account was modified.");return;}
using var anonymous=Client();using var admin=Client();using var learner=Client();using var other=Client();
await Expect(anonymous,HttpMethod.Get,"admin/words",null,401);
await Expect(admin,HttpMethod.Post,"auth/login",new {email=fixtureData.AdminEmail,password},200);
await Expect(learner,HttpMethod.Post,"auth/login",new {email=fixtureData.LearnerEmail,password},200);
await Expect(other,HttpMethod.Post,"auth/login",new {email=fixtureData.OtherEmail,password},200);
await Expect(learner,HttpMethod.Get,"admin/words",null,403);
await Expect(learner,HttpMethod.Post,"admin/words",new {},403);
Console.WriteLine("PASS anonymous 401 and learner 403 on admin reads/writes; real session login");
foreach(var resource in new[]{"words","lessons","teachers","users"}) foreach(var invalid in new object[]{new{},new[]{"not-an-object"},new{slug="Bad Slug",status="unsupported",simplified="abc",pinyin="学习",meaningVi=" "}}){
 var validation=await Expect(admin,HttpMethod.Post,"admin/"+resource,invalid,400);
 if(!validation.TryGetProperty("fields",out var fields)||fields.ValueKind!=JsonValueKind.Object||!fields.EnumerateObject().Any())throw new Exception("Missing field validation errors.");
}
await Expect(learner,HttpMethod.Post,"learning/reviews",new{wordId=0,rating=8,eventId=Guid.Empty,durationMs=-1},400);
await Expect(learner,HttpMethod.Post,"learning/reviews",new{wordId=1,rating=3,eventId=Guid.Empty,durationMs=0},400);
using(var invalidJson=new HttpRequestMessage(HttpMethod.Post,"admin/words"){Content=new StringContent("{broken",Encoding.UTF8,"application/json")}){
 using var result=await admin.SendAsync(invalidJson);if(result.StatusCode!=HttpStatusCode.BadRequest)throw new Exception("Malformed JSON was not rejected.");
}
await Expect(admin,HttpMethod.Put,"admin/words/-1",new{slug="valid",status="draft",simplified="学习",pinyin="xuéxí",meaningVi="Học tập",version="AAAAAAAAAAA="},400);
await Expect(admin,HttpMethod.Post,"admin/lessons",new{slug=prefix+"-bad-level",levelId=int.MaxValue,title="Bài thử",sortOrder=1,status="draft"},400);
await Expect(admin,HttpMethod.Get,$"admin/users/{Guid.NewGuid()}/learning",null,404);
Console.WriteLine("PASS aggregate field errors for all admin resources, invalid review/UUID, malformed JSON, bad IDs and nonexistent HSK/user");

var word=new {slug=prefix+"-word",simplified="学习",pinyin="xuéxí",hanViet="HỌC TẬP",meaningVi="Học tập kiểm thử",status="published"};
await Expect(admin,HttpMethod.Post,"admin/words",word,201);
await Expect(admin,HttpMethod.Post,"admin/words",word,409);
var words=await Expect(admin,HttpMethod.Get,"admin/words",null,200);var row=words.EnumerateArray().Single(r=>r.GetProperty("slug").GetString()==word.slug);var wordId=row.GetProperty("id").GetInt64();var version=row.GetProperty("version").GetString();
await Expect(admin,HttpMethod.Put,$"admin/words/{wordId}",new {word.slug,word.simplified,word.pinyin,word.hanViet,meaningVi="Học tập đã sửa",word.status,version},200);
await Expect(admin,HttpMethod.Put,$"admin/words/{wordId}",new {word.slug,word.simplified,word.pinyin,word.hanViet,word.meaningVi,word.status,version},409);
Console.WriteLine("PASS words create/read/update; Unicode; duplicate and stale-version conflicts");
var eventId=Guid.NewGuid();var review=new {wordId,rating=3,durationMs=2500,eventId};
await Expect(learner,HttpMethod.Post,"learning/reviews",review,200);await Expect(learner,HttpMethod.Post,"learning/reviews",review,200);
await Expect(learner,HttpMethod.Post,"learning/reviews",new {wordId,rating=1,durationMs=2500,eventId},409);
var progress=await Expect(learner,HttpMethod.Get,"learning/progress",null,200);
var overview=await Expect(learner,HttpMethod.Get,"learning/overview",null,200);
if(overview.GetProperty("learned").GetInt32()!=1||overview.GetProperty("firstReviewsToday").GetInt32()!=1)throw new Exception("Overview does not reflect saved learning");
var results=await Expect(learner,HttpMethod.Get,$"learning/results?events={eventId}",null,200);
if(results.GetArrayLength()!=1||results[0].GetProperty("rating").GetInt32()!=3)throw new Exception("Saved result mismatch");
await Expect(other,HttpMethod.Get,$"learning/results?events={eventId}",null,404);
await Expect(learner,HttpMethod.Get,"learning/results?events=invalid",null,400);
await Expect(learner,HttpMethod.Get,$"learning/results?events={eventId},{eventId}",null,400);
Console.WriteLine("PASS account overview, persisted results, ownership and event validation");
if(progress.GetArrayLength()!=1||progress[0].GetProperty("repetitions").GetInt32()!=1)throw new Exception("Progress/retry mismatch");
if((await Expect(other,HttpMethod.Get,"learning/progress",null,200)).GetArrayLength()!=0)throw new Exception("Cross-user leak");
if((await Expect(admin,HttpMethod.Get,$"admin/users/{learnerId}/learning",null,200)).GetArrayLength()!=1)throw new Exception("Admin progress missing");
await Expect(admin,HttpMethod.Delete,$"admin/words/{wordId}",null,409);
Console.WriteLine("PASS persisted progress, idempotent retry, learner isolation, admin progress and referenced-word deletion blocked");
await Expect(admin,HttpMethod.Post,"admin/words",new {slug=prefix+"-delete",simplified="朋友",pinyin="péngyou",hanViet="",meaningVi="Bạn bè",status="draft"},201);
var deletion=(await Expect(admin,HttpMethod.Get,"admin/words",null,200)).EnumerateArray().Single(r=>r.GetProperty("slug").GetString()==prefix+"-delete").GetProperty("id").GetInt64();
await Expect(admin,HttpMethod.Delete,$"admin/words/{deletion}",null,200);
var teacher=new {slug=prefix+"-teacher",displayName="Giáo viên kiểm thử",headline="Phát âm",bio="Nội dung thử riêng",consultationSchedule="Thứ 7",status="draft"};
await Expect(admin,HttpMethod.Post,"admin/teachers",teacher,201);
var tr=(await Expect(admin,HttpMethod.Get,"admin/teachers",null,200)).EnumerateArray().Single(r=>r.GetProperty("slug").GetString()==teacher.slug);
await Expect(admin,HttpMethod.Put,$"admin/teachers/{tr.GetProperty("id")}",new {teacher.slug,displayName="Giáo viên đã sửa",teacher.headline,teacher.bio,teacher.consultationSchedule,status="published",version=tr.GetProperty("version").GetString()},200);
await Expect(admin,HttpMethod.Delete,$"admin/teachers/{tr.GetProperty("id")}",null,200);
using var levelCommand=db.CreateCommand();levelCommand.CommandText="SELECT TOP(1) LevelId FROM catalog.Levels ORDER BY LevelId";var levelId=Convert.ToInt32(await levelCommand.ExecuteScalarAsync());
var lesson=new {slug=prefix+"-lesson",levelId,title="Bài thử",description="Mô tả",sortOrder=999998,status="draft"};
await Expect(admin,HttpMethod.Post,"admin/lessons",lesson,201);var lr=(await Expect(admin,HttpMethod.Get,"admin/lessons",null,200)).EnumerateArray().Single(r=>r.GetProperty("slug").GetString()==lesson.slug);
await Expect(admin,HttpMethod.Put,$"admin/lessons/{lr.GetProperty("id")}",new {lesson.slug,lesson.levelId,title="Bài đã sửa",lesson.description,lesson.sortOrder,status="published"},200);
await Expect(admin,HttpMethod.Delete,$"admin/lessons/{lr.GetProperty("id")}",null,200);
Console.WriteLine("PASS unused-word deletion; teachers and lessons CRUD");
await Expect(anonymous,HttpMethod.Post,"auth/login",new {email=prefix+"-missing@example.invalid",password="not-a-valid-password"},401);
await Expect(admin,HttpMethod.Post,"admin/users",new {email=prefix+"-created@example.invalid",password,displayName="Người dùng mới"},201);
var created=(await Expect(admin,HttpMethod.Get,"admin/users",null,200)).EnumerateArray().Single(r=>r.GetProperty("email").GetString()==prefix+"-created@example.invalid");
var createdId=created.GetProperty("id").GetString();
await Expect(admin,HttpMethod.Put,$"admin/users/{createdId}",new {displayName="Đã sửa người dùng",roleCode="learner",status="suspended"},200);
await Expect(admin,HttpMethod.Delete,$"admin/users/{createdId}",null,200);
await Expect(anonymous,HttpMethod.Post,"auth/register",new {name="Đăng ký kiểm thử",email=prefix+"-registered@example.invalid",password,roleCode="admin"},201);
using var registered=Client();await Expect(registered,HttpMethod.Post,"auth/login",new {email=prefix+"-registered@example.invalid",password},200);
if((await Expect(registered,HttpMethod.Get,"auth/me",null,200)).GetProperty("role").GetString()!="learner")throw new Exception("Register accepted forged admin role");
await Expect(registered,HttpMethod.Get,"admin/users",null,403);
Console.WriteLine("PASS users create/read/update/soft-delete; registration cannot self-assign admin; unknown login rejects");
await Expect(learner,HttpMethod.Post,"auth/logout",null,204);await Expect(learner,HttpMethod.Get,"learning/progress",null,401);
await Expect(learner,HttpMethod.Post,"auth/login",new {email=fixtureData.LearnerEmail,password},200);
if((await Expect(learner,HttpMethod.Get,"learning/progress",null,200)).GetArrayLength()!=1)throw new Exception("Progress lost after new session");
Console.WriteLine("PASS logout revokes session; progress survives new login. Fixtures retained temporarily for browser UI checks.");
// JWT-specific tests use only generated fixture accounts and the local development test key.
using var raw=Client();
using var loginRequest=new HttpRequestMessage(HttpMethod.Post,"auth/login"){Content=JsonContent.Create(new{email=fixtureData.LearnerEmail,password})};
using var loginResponse=await raw.SendAsync(loginRequest);
if(loginResponse.StatusCode!=HttpStatusCode.OK)throw new Exception("JWT test login failed.");
var cookies=loginResponse.Headers.GetValues("Set-Cookie").ToArray();
var access=cookies.Single(c=>c.StartsWith("xueyan_session=")).Split(';')[0].Split('=',2)[1];
var refresh=cookies.Single(c=>c.StartsWith("xueyan_refresh=")).Split(';')[0].Split('=',2)[1];
if(access.Split('.').Length!=3||!cookies.All(c=>c.Contains("httponly",StringComparison.OrdinalIgnoreCase)))throw new Exception("JWT/HttpOnly cookies missing.");
var handler=new JwtSecurityTokenHandler();var decoded=handler.ReadJwtToken(access);
using var bearer=new HttpClient(new HttpClientHandler{UseCookies=false}){BaseAddress=new Uri(Environment.GetEnvironmentVariable("XUEYAN_TEST_API_URL")??"http://127.0.0.1:5108/")};
bearer.DefaultRequestHeaders.Authorization=new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer",access);
await Expect(bearer,HttpMethod.Get,"auth/me",null,200);await Expect(bearer,HttpMethod.Get,"admin/users",null,403);
var key=await File.ReadAllTextAsync(Path.Combine(root,"jwt-signing-key"));
string Signed(string issuer="Xueyan.Api",string audience="Xueyan.Web",string? role=null,Guid? subject=null,bool expired=false,string? signingKey=null){
 var claims=decoded.Claims.Where(c=>new[]{"sub","sid","role","jti"}.Contains(c.Type)).Select(c=>new Claim(c.Type,c.Type=="role"?role??c.Value:c.Type=="sub"?subject?.ToString()??c.Value:c.Value));
 return handler.WriteToken(new JwtSecurityToken(issuer,audience,claims,DateTime.UtcNow.AddHours(-1),expired?DateTime.UtcNow.AddMinutes(-5):DateTime.UtcNow.AddMinutes(5),new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey??key)),SecurityAlgorithms.HmacSha256)));
}
foreach(var invalid in new[]{"not-a-jwt",Signed(issuer:"wrong-issuer"),Signed(audience:"wrong-audience"),Signed(expired:true),Signed(signingKey:new string('X',64)),Signed(role:"admin"),Signed(subject:otherId)}){
 bearer.DefaultRequestHeaders.Authorization=new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer",invalid);await Expect(bearer,HttpMethod.Get,"auth/me",null,401);
}
using var refresher=new HttpClient(new HttpClientHandler{UseCookies=false}){BaseAddress=new Uri(Environment.GetEnvironmentVariable("XUEYAN_TEST_API_URL")??"http://127.0.0.1:5108/")};refresher.DefaultRequestHeaders.Add("X-Xueyan-Client","web");refresher.DefaultRequestHeaders.Add("Cookie","xueyan_refresh="+refresh);
await Expect(refresher,HttpMethod.Post,"auth/refresh",null,200);
bearer.DefaultRequestHeaders.Authorization=new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer",access);
if(Environment.GetEnvironmentVariable("XUEYAN_TEST_FRONTEND_URL") is string frontendUrl){
 using var proxy=new HttpClient(new HttpClientHandler{UseCookies=false}){BaseAddress=new Uri(frontendUrl.TrimEnd('/')+"/api/backend/")};
 proxy.DefaultRequestHeaders.Add("Cookie","xueyan_session="+Signed(expired:true)+"; xueyan_refresh="+refresh);
 using var renewed=await proxy.GetAsync("auth/me");
 if(renewed.StatusCode!=HttpStatusCode.OK||!renewed.Headers.TryGetValues("Set-Cookie",out var renewedCookies)||!renewedCookies.Any(c=>c.StartsWith("xueyan_session=")))throw new Exception("Next proxy did not renew expired access JWT.");
 proxy.DefaultRequestHeaders.Authorization=new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer","invalid-explicit-token");
 await Expect(proxy,HttpMethod.Get,"auth/me",null,401);
 Console.WriteLine("PASS Next proxy refreshes expired cookie once and rejects explicit invalid bearer");
}
await Exec("UPDATE auth.Users SET Status='suspended' WHERE UserId=@id",("id",learnerId));
await Expect(bearer,HttpMethod.Get,"auth/me",null,401);
await Exec("UPDATE auth.Users SET Status='active' WHERE UserId=@id",("id",learnerId));
await Expect(bearer,HttpMethod.Post,"auth/logout",null,204);await Expect(bearer,HttpMethod.Get,"auth/me",null,401);await Expect(refresher,HttpMethod.Post,"auth/refresh",null,401);
Console.WriteLine("PASS JWT bearer/cookie, wrong issuer/audience/signature/expiry/role/subject, refresh, immediate suspension and revocation");

var concurrentEvent=Guid.NewGuid();
await Task.WhenAll(Enumerable.Range(0,2).Select(_=>Expect(learner,HttpMethod.Post,"learning/reviews",new{wordId,rating=3,durationMs=1000,eventId=concurrentEvent},200)));
var concurrentProgress=await Expect(learner,HttpMethod.Get,"learning/progress",null,200);
if(concurrentProgress[0].GetProperty("repetitions").GetInt32()!=2)throw new Exception("Concurrent retry counted twice.");
Console.WriteLine("PASS concurrent retry writes exactly one event/progress increment");

// Due time is derived from indexed NextReviewAt, without a background state-flipping job.
if((await Expect(learner,HttpMethod.Get,"learning/due",null,200)).GetArrayLength()!=0)throw new Exception("Future review unexpectedly due.");
await Exec("UPDATE learning.WordProgress SET NextReviewAt=DATEADD(minute,-1,SYSUTCDATETIME()) WHERE UserId=@id AND WordId=@word",("id",learnerId),("word",wordId));
if((await Expect(learner,HttpMethod.Get,"learning/due",null,200)).GetArrayLength()!=1)throw new Exception("Due review missing.");
if((await Expect(other,HttpMethod.Get,"learning/due",null,200)).GetArrayLength()!=0)throw new Exception("Due review owner leaked.");
Console.WriteLine("PASS scheduler persisted and due queries isolate users");

// Warm public data, mutate it, and ensure every CRUD invalidates immediately.
await Expect(learner,HttpMethod.Get,"learning/words",null,200);
var current=(await Expect(admin,HttpMethod.Get,"admin/words",null,200)).EnumerateArray().Single(r=>r.GetProperty("id").GetInt64()==wordId);
await Expect(admin,HttpMethod.Put,$"admin/words/{wordId}",new{word.slug,word.simplified,word.pinyin,word.hanViet,meaningVi="Nghĩa sau invalidation",word.status,version=current.GetProperty("version").GetString()},200);
if(!(await Expect(learner,HttpMethod.Get,"learning/words",null,200)).EnumerateArray().Any(w=>w.GetProperty("id").GetInt64()==wordId&&w.GetProperty("meaningVi").GetString()=="Nghĩa sau invalidation"))throw new Exception("Cache remained stale after update.");
current=(await Expect(admin,HttpMethod.Get,"admin/words",null,200)).EnumerateArray().Single(r=>r.GetProperty("id").GetInt64()==wordId);
await Expect(admin,HttpMethod.Put,$"admin/words/{wordId}",new{word.slug,word.simplified,word.pinyin,word.hanViet,word.meaningVi,status="archived",version=current.GetProperty("version").GetString()},200);
if((await Expect(learner,HttpMethod.Get,"learning/words",null,200)).EnumerateArray().Any(w=>w.GetProperty("id").GetInt64()==wordId))throw new Exception("Archived word stayed cached.");
if((await Expect(learner,HttpMethod.Get,"learning/progress",null,200)).GetArrayLength()!=1)throw new Exception("Archive removed learner history.");
Console.WriteLine("PASS static cache invalidation and archived-word learning history remains private/persistent");

// Profile updates and dictionary saves are tested with disposable accounts only.
using var profileClient=Client();await Expect(profileClient,HttpMethod.Post,"auth/login",new{email=fixtureData.LearnerEmail,password},200);
await Expect(anonymous,HttpMethod.Get,"profile",null,401);await Expect(anonymous,HttpMethod.Get,"library/words",null,401);
var originalProfile=await Expect(profileClient,HttpMethod.Get,"profile",null,200);
var untouched=await Expect(other,HttpMethod.Get,"profile",null,200);
var photo="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDjaKKK9Q+dCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//Z";
object ProfilePayload(JsonElement source,string name,string? avatar=null,bool removeAvatar=false)=>new{removeAvatar,displayName=name,chineseName="学习者",bio="Hồ sơ kiểm thử riêng",purpose="Giao tiếp",targetLevelCode="2",dailyWordGoal=25,showPinyin=true,version=source.GetProperty("version").GetString(),preferencesVersion=source.GetProperty("preferencesVersion").GetString(),avatarDataUrl=avatar,userId=otherId,role="admin"};
var changedProfile=await Expect(profileClient,HttpMethod.Put,"profile",ProfilePayload(originalProfile,"Học viên cập nhật",photo),200);
if(changedProfile.GetProperty("role").GetString()!="learner"||changedProfile.GetProperty("userId").GetGuid()!=learnerId||changedProfile.GetProperty("avatarVersion").ValueKind!=JsonValueKind.String)throw new Exception("Profile ownership/role/avatar mismatch");
var accountSession=await Expect(profileClient,HttpMethod.Get,"auth/session",null,200);
if(accountSession.GetProperty("name").GetString()!="Học viên cập nhật")throw new Exception("Updated name missing from session");
var reloadedProfile=await Expect(profileClient,HttpMethod.Get,"profile",null,200);
if(reloadedProfile.GetProperty("displayName").GetString()!="Học viên cập nhật"||reloadedProfile.GetProperty("dailyWordGoal").GetInt32()!=25)throw new Exception("Profile did not persist");
if((await Expect(other,HttpMethod.Get,"profile",null,200)).GetProperty("displayName").GetString()!=untouched.GetProperty("displayName").GetString())throw new Exception("Another profile was overwritten");
await Expect(profileClient,HttpMethod.Put,"profile",ProfilePayload(originalProfile,"Stale update"),409);
await Expect(profileClient,HttpMethod.Put,"profile",ProfilePayload(reloadedProfile,"   "),400);
await Expect(profileClient,HttpMethod.Put,"profile",ProfilePayload(reloadedProfile,"Avatar invalid","data:image/svg+xml;base64,PHN2Zy8+"),400);
using(var avatarResponse=await profileClient.GetAsync("profile/avatar")){
 if(!avatarResponse.IsSuccessStatusCode||avatarResponse.Content.Headers.ContentType?.MediaType!="image/jpeg"||!(await avatarResponse.Content.ReadAsByteArrayAsync()).SequenceEqual(Convert.FromBase64String(photo[23..])))throw new Exception("Avatar bytes mismatch");
}
using(var otherAvatar=await other.GetAsync("profile/avatar")){if(otherAvatar.StatusCode!=HttpStatusCode.NotFound)throw new Exception("Avatar leaked to another user");}
var removedPhoto=await Expect(profileClient,HttpMethod.Put,"profile",ProfilePayload(reloadedProfile,"Học viên cập nhật",removeAvatar:true),200);
using(var removedAvatar=await profileClient.GetAsync("profile/avatar")){if(removedAvatar.StatusCode!=HttpStatusCode.NotFound)throw new Exception("Avatar removal failed");}
await Expect(profileClient,HttpMethod.Put,"profile",ProfilePayload(removedPhoto,"Học viên cập nhật",photo),200);
Console.WriteLine("PASS profile save/reload/name in session, photo bytes, stale conflict, validation, ownership and forged role ignored");
var dictionary=await Expect(anonymous,HttpMethod.Get,"catalog/words?query=xue2xi2",null,200);
if(dictionary.GetProperty("total").GetInt32()==0)throw new Exception("Numeric Pinyin lookup failed");
var dictionaryId=dictionary.GetProperty("items")[0].GetProperty("id").GetInt64();
await Expect(profileClient,HttpMethod.Put,$"library/words/{dictionaryId}",null,200);
await Expect(profileClient,HttpMethod.Put,$"library/words/{dictionaryId}",null,200);
var savedWords=await Expect(profileClient,HttpMethod.Get,"library/words",null,200);
if(savedWords.GetArrayLength()!=1||savedWords[0].GetProperty("id").GetInt64()!=dictionaryId)throw new Exception("Saved dictionary word missing/duplicated");
if((await Expect(other,HttpMethod.Get,"library/words",null,200)).GetArrayLength()!=0)throw new Exception("Saved words leaked to another user");
await Expect(profileClient,HttpMethod.Delete,$"library/words/{dictionaryId}",null,200);
if((await Expect(profileClient,HttpMethod.Get,"library/words",null,200)).GetArrayLength()!=0)throw new Exception("Remove saved word failed");
Console.WriteLine("PASS dictionary numeric Pinyin, real save/reload, idempotence, isolation and removal without losing login");

// Repository fixtures exercise mapping; these are not real Google sign-ins.
var googleConfig=new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?>{{"ConnectionStrings:Database",db.ConnectionString}}).Build();
var googleRepo=new AuthRepository(new Database(googleConfig));
var googleId=await googleRepo.GoogleIdentity(prefix+"-google-sub",prefix+"-google@example.invalid","Google fixture");
if(await googleRepo.GoogleIdentity(prefix+"-google-sub",prefix+"-changed@example.invalid","Changed name")!=googleId)throw new Exception("Google subject mapping changed");
try{await googleRepo.GoogleIdentity(prefix+"-different-sub",prefix+"-google@example.invalid","Other subject");throw new Exception("Google email silently linked");}catch(ApiError error)when(error.Status==409){}
using(var identityCheck=db.CreateCommand()){
 identityCheck.CommandText="SELECT COUNT(*) FROM auth.Users u WHERE u.UserId=@id AND u.RoleCode='learner' AND u.EmailVerifiedAt IS NOT NULL AND NOT EXISTS(SELECT 1 FROM auth.PasswordCredentials p WHERE p.UserId=u.UserId)";
 identityCheck.Parameters.AddWithValue("@id",googleId);if(Convert.ToInt32(await identityCheck.ExecuteScalarAsync())!=1)throw new Exception("Google fixture role or credentials mismatch");
}
Console.WriteLine("PASS Google repository stable subject, learner role, no password, and no automatic email linking (local fixtures only)");

// New teacher role is granted only through admin, with revocation of prior sessions.
await Expect(admin,HttpMethod.Put,$"admin/users/{otherId}",new{displayName="Giảng viên kiểm thử",roleCode="teacher",status="active"},200);
await Expect(other,HttpMethod.Get,"auth/me",null,401);
await Expect(other,HttpMethod.Post,"auth/login",new{email=fixtureData.OtherEmail,password},200);
if((await Expect(other,HttpMethod.Get,"auth/me",null,200)).GetProperty("role").GetString()!="teacher")throw new Exception("Teacher role not persisted");
await Expect(profileClient,HttpMethod.Get,"access/learner",null,200);
await Expect(profileClient,HttpMethod.Get,"access/teacher",null,403);
await Expect(profileClient,HttpMethod.Get,"access/admin",null,403);
await Expect(other,HttpMethod.Get,"access/teacher",null,200);
await Expect(other,HttpMethod.Get,"access/learner",null,403);
await Expect(other,HttpMethod.Get,"admin/users",null,403);
await Expect(other,HttpMethod.Put,$"admin/users/{otherId}",new{displayName="Forged admin",roleCode="admin",status="active"},403);
await Expect(other,HttpMethod.Get,"learning/progress",null,403);
await Expect(other,HttpMethod.Get,"library/words",null,403);
await Expect(admin,HttpMethod.Get,"access/admin",null,200);
await Expect(admin,HttpMethod.Get,"access/teacher",null,403);
await Expect(admin,HttpMethod.Get,"access/learner",null,403);
await Expect(anonymous,HttpMethod.Get,"access/teacher",null,401);
await Expect(other,HttpMethod.Get,"profile",null,200);
await Expect(admin,HttpMethod.Put,$"admin/users/{createdId}",new{displayName="Teacher close fixture",roleCode="teacher",status="active"},200);
await Expect(admin,HttpMethod.Delete,$"admin/users/{createdId}",null,200);
var closedTeacher=(await Expect(admin,HttpMethod.Get,"admin/users",null,200)).EnumerateArray().Single(row=>row.GetProperty("id").GetString()==createdId);
if(closedTeacher.GetProperty("roleCode").GetString()!="teacher"||closedTeacher.GetProperty("status").GetString()!="closed")throw new Exception("Closing a teacher changed its historical role");
Console.WriteLine("PASS learner/teacher/admin exact workspace policies, teacher profile access and role-change session revocation");


async Task Exec(string sql,params (string,object)[] values){using var cmd=db.CreateCommand();cmd.CommandText=sql;foreach(var(k,v) in values)cmd.Parameters.AddWithValue("@"+k,v);await cmd.ExecuteNonQueryAsync();}
static HttpClient Client(){var c=new HttpClient(new HttpClientHandler{CookieContainer=new CookieContainer()}){BaseAddress=new Uri(Environment.GetEnvironmentVariable("XUEYAN_TEST_API_URL")??"http://127.0.0.1:5108/")};c.DefaultRequestHeaders.Add("X-Xueyan-Client","web");return c;}
static async Task<JsonElement> Expect(HttpClient client,HttpMethod method,string path,object? data,int status){using var request=new HttpRequestMessage(method,path);if(data!=null)request.Content=JsonContent.Create(data);using var response=await client.SendAsync(request);var body=await response.Content.ReadAsStringAsync();if((int)response.StatusCode!=status)throw new Exception($"{method} {path}: expected {status}, got {(int)response.StatusCode}: {body}");return string.IsNullOrWhiteSpace(body)?default:JsonDocument.Parse(body).RootElement.Clone();}
record Fixture(string Prefix,Guid AdminId,Guid LearnerId,Guid OtherId,string AdminEmail,string LearnerEmail,string OtherEmail,string Password);
