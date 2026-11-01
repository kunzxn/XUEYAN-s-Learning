param([string]$Web='http://localhost:3000',[string]$Api='http://127.0.0.1:5108')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Net.Http
$fixture=Get-Content -LiteralPath (Join-Path $PSScriptRoot '../.local/smoke-fixtures.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$handler=[Net.Http.HttpClientHandler]::new();$handler.AllowAutoRedirect=$false;$handler.UseCookies=$false
$client=[Net.Http.HttpClient]::new($handler)
function Login-Cookies([string]$Email){
 $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::Post,"$Api/auth/login")
 [void]$request.Headers.TryAddWithoutValidation('X-Xueyan-Client','web')
 $request.Content=[Net.Http.StringContent]::new((@{email=$Email;password=$fixture.Password}|ConvertTo-Json),[Text.Encoding]::UTF8,'application/json')
 $response=$client.SendAsync($request).GetAwaiter().GetResult()
 try{if([int]$response.StatusCode -ne 200){throw "Fixture login failed: $([int]$response.StatusCode)"};return (($response.Headers.GetValues('Set-Cookie')|ForEach-Object {($_ -split ';')[0]}) -join '; ')}finally{$response.Dispose();$request.Dispose()}
}
function Check([string]$Path,[string]$Cookies,[int]$Status,[string]$Location=''){
 $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::Get,"$Web$Path")
 if($Cookies){[void]$request.Headers.TryAddWithoutValidation('Cookie',$Cookies)}
 [void]$request.Headers.TryAddWithoutValidation('x-xueyan-return-to','/admin')
 $response=$client.SendAsync($request,[Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
 try{if([int]$response.StatusCode -ne $Status){throw "$Path expected $Status got $([int]$response.StatusCode)"};if($Location -and !$response.Headers.Location.ToString().Contains($Location)){throw "$Path redirect mismatch"};if($Status -eq 307 -and $response.Headers.Location.ToString().Contains("next=")){$match=[regex]::Match($response.Headers.Location.ToString(),"[?&]next=([^&]+)");if([Uri]::UnescapeDataString($match.Groups[1].Value) -ne $Path){throw "Untrusted or lost return path"}};Write-Output "PASS $Path -> $Status"}finally{$response.Dispose();$request.Dispose()}
}
foreach($path in @('/dashboard?demo=new','/teacher','/teacher/profile','/teacher/classes/hsk2-k24','/teacher/assignments/4','/admin','/review/study?demo=1')){Check $path '' 307 '/login?next='}
Check '/teachers' '' 200
$learner=Login-Cookies $fixture.LearnerEmail
$teacher=Login-Cookies $fixture.OtherEmail
$admin=Login-Cookies $fixture.AdminEmail
Check '/dashboard?demo=new' $learner 200
Check '/teacher' $learner 307 '/access-denied?space=teacher'
Check '/teacher/profile' $learner 307 '/access-denied?space=teacher'
Check '/admin' $learner 307 '/access-denied?space=admin'
Check '/teacher' $teacher 200
Check '/teacher/assignments/4' $teacher 200
Check '/dashboard?demo=new' $teacher 307 '/access-denied?space=learner'
Check '/learn' $teacher 307 '/access-denied?space=learner'
Check '/admin' $teacher 307 '/access-denied?space=admin'
Check '/admin' $admin 200
Check '/teacher' $admin 307 '/access-denied?space=teacher'
Check '/dashboard' $admin 307 '/access-denied?space=learner'
Check '/teacher?demo=1&role=teacher' $learner 307 '/access-denied?space=teacher'
Check '/teacher' 'xueyan_session=invalid' 307 '/login?next='

# Expire only a locally generated fixture access token; keep its real refresh cookie.
function Encode-UrlBase64([byte[]]$Bytes){return [Convert]::ToBase64String($Bytes).TrimEnd('=').Replace('+','-').Replace('/','_')}
$access=([regex]::Match($learner,'xueyan_session=([^;]+)')).Groups[1].Value
$refresh=([regex]::Match($learner,'xueyan_refresh=([^;]+)')).Groups[1].Value
$parts=$access.Split('.');$encoded=$parts[1].Replace('-','+').Replace('_','/');$encoded=$encoded.PadRight([int]([Math]::Ceiling($encoded.Length/4.0)*4),'=')
$payload=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))|ConvertFrom-Json
$payload.exp=[DateTimeOffset]::UtcNow.AddMinutes(-5).ToUnixTimeSeconds();$payload.nbf=[DateTimeOffset]::UtcNow.AddMinutes(-10).ToUnixTimeSeconds()
$unsigned=$parts[0]+'.'+(Encode-UrlBase64 ([Text.Encoding]::UTF8.GetBytes(($payload|ConvertTo-Json -Compress))))
$key=[IO.File]::ReadAllText((Join-Path $PSScriptRoot '../.local/jwt-signing-key')).Trim();$hmac=[Security.Cryptography.HMACSHA256]::new([Text.Encoding]::UTF8.GetBytes($key))
$expired=$unsigned+'.'+(Encode-UrlBase64 ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($unsigned))))
$oldCookie="xueyan_session=$expired; xueyan_refresh=$refresh"
Check '/dashboard?demo=new' $oldCookie 307 '/api/session/continue?next='
$request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::Get,"$Web/api/session/continue?next=%2Fdashboard%3Fdemo%3Dnew")
[void]$request.Headers.TryAddWithoutValidation('Cookie',$oldCookie)
$response=$client.SendAsync($request).GetAwaiter().GetResult()
try{
 if([int]$response.StatusCode -ne 303 -or !$response.Headers.Location.ToString().Contains('/dashboard?demo=new')){throw 'Refresh redirect failed'}
 $newAccess=(($response.Headers.GetValues('Set-Cookie')|Where-Object {$_ -like 'xueyan_session=*'}|Select-Object -First 1) -split ';')[0]
 Check '/dashboard?demo=new' "$newAccess; xueyan_refresh=$refresh" 200
 Write-Output 'PASS expired workspace cookie renews without login; query preserved'
}finally{$response.Dispose();$request.Dispose();$client.Dispose();$handler.Dispose();$hmac.Dispose()}
