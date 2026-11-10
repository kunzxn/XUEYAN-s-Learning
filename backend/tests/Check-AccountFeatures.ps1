param([string]$Api='http://127.0.0.1:5115')
$ErrorActionPreference='Stop';Add-Type -AssemblyName System.Net.Http
$fixture=Get-Content (Join-Path $PSScriptRoot '../.local/smoke-fixtures.json') -Raw -Encoding UTF8|ConvertFrom-Json
$handler=[Net.Http.HttpClientHandler]::new();$handler.CookieContainer=[Net.CookieContainer]::new();$client=[Net.Http.HttpClient]::new($handler)
function Call($Method,$Path,$Body=$null,$Status=200){
 $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Method),"$Api/$Path");[void]$request.Headers.TryAddWithoutValidation('X-Xueyan-Client','web')
 if($null -ne $Body){$request.Content=[Net.Http.StringContent]::new(($Body|ConvertTo-Json -Compress),[Text.Encoding]::UTF8,'application/json')}
 $response=$client.SendAsync($request).GetAwaiter().GetResult()
 try{if([int]$response.StatusCode -ne $Status){throw "$Path expected $Status got $([int]$response.StatusCode)"};$text=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult();if($text){return $text|ConvertFrom-Json}}finally{$response.Dispose();$request.Dispose()}
}
function Read-MailToken(){
 $files=Get-ChildItem (Join-Path $PSScriptRoot '../.local/mail-outbox') -Filter '*.txt'|Where-Object {(Get-Content $_.FullName -Raw -Encoding UTF8).Contains("To: $($fixture.LearnerEmail)`n")}|Sort-Object LastWriteTime -Descending
 if(!$files){throw 'Missing local recovery mail'}
 return [regex]::Match((Get-Content $files[0].FullName -Raw -Encoding UTF8),'token=([A-F0-9]{64})').Groups[1].Value
}
try{
 $null=Call POST 'auth/login' @{email=$fixture.LearnerEmail;password=$fixture.Password}
 $prefs=Call GET 'learning/preferences';$oldVersion=$prefs.version;$prefs.dailyWordGoal=35;$prefs.studyTime='07:45';$prefs.showPinyin=$false;$prefs.showHanViet=$false;$prefs.autoplay=$true;$prefs.purpose='Fixture Unicode học tiếng Trung';$prefs.targetLevelCode='2';$prefs|Add-Member completeOnboarding $true
 $saved=Call PUT 'learning/preferences' $prefs
 $null=Call PUT 'learning/preferences' $prefs 409
 $again=Call GET 'learning/preferences'
 if($again.dailyWordGoal -ne 35 -or $again.studyTime -ne '07:45' -or $again.showPinyin -or !$again.onboardingCompletedAt){throw 'Preferences did not persist'}
 $overview=Call GET 'learning/overview';if($overview.goal -ne 35){throw 'Dashboard goal not synchronized'}
 $saved.studyTime='99:99';$null=Call PUT 'learning/preferences' $saved 400
 $queue=Call GET 'catalog/levels/1/words?page=1';$id=$queue.items[0].id;$canonical=Call GET "learning/queue?ids=$id";if($canonical[0].id -ne $id){throw 'Queue does not read SQL words'}
 $null=Call GET 'learning/queue?ids=bad' $null 400
 Write-Output 'PASS preferences save/reload, time, onboarding, conflict, field validation, Dashboard goal and canonical queue'
 $one=Call POST 'auth/forgot-password' @{email=$fixture.LearnerEmail};$expired=Read-MailToken
 $hash=[Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($expired))
 $db=[Data.SqlClient.SqlConnection]::new('Server=localhost;Database=XUEYAN_Development;Integrated Security=true;Encrypt=true;TrustServerCertificate=true');$db.Open()
 try{$q=$db.CreateCommand();$q.CommandText='UPDATE auth.PasswordResets SET ExpiresAt=DATEADD(minute,-1,SYSUTCDATETIME()) WHERE TokenHash=@hash AND UserId=@id';[void]$q.Parameters.AddWithValue('@hash',$hash);[void]$q.Parameters.AddWithValue('@id',[guid]$fixture.LearnerId);[void]$q.ExecuteNonQuery()}finally{$db.Dispose()}
 $new='Recovery!'+[guid]::NewGuid().ToString('N')
 $null=Call POST 'auth/reset-password' @{token=$expired;password=$new;confirmPassword=$new} 400
 $two=Call POST 'auth/forgot-password' @{email=$fixture.LearnerEmail};$token=Read-MailToken
 $repeat=Call POST 'auth/forgot-password' @{email=$fixture.LearnerEmail}
 if((Read-MailToken) -ne $token -or $repeat.retryAfterSeconds -ne 60){throw 'Per-account resend cooldown failed'}
 $unknown=Call POST 'auth/forgot-password' @{email=($fixture.Prefix+'-unknown@example.invalid')}
 if($two.message -ne $unknown.message){throw 'Account enumeration response'}
 $null=Call POST 'auth/reset-password' @{token=$token;password=$new;confirmPassword='mismatch'} 400
 $null=Call POST 'auth/reset-password' @{token=$token;password='short';confirmPassword='short'} 400
 $null=Call POST 'auth/reset-password' @{token=('0'*64);password=$new;confirmPassword=$new} 400
 $null=Call POST 'auth/reset-password' @{token=$token;password=$new;confirmPassword=$new}
 $null=Call GET 'auth/me' $null 401
 $null=Call POST 'auth/reset-password' @{token=$token;password=$new;confirmPassword=$new} 400
 $null=Call POST 'auth/login' @{email=$fixture.LearnerEmail;password=$fixture.Password} 401
 $null=Call POST 'auth/login' @{email=$fixture.LearnerEmail;password=$new}
 $db=[Data.SqlClient.SqlConnection]::new('Server=localhost;Database=XUEYAN_Development;Integrated Security=true;Encrypt=true;TrustServerCertificate=true');$db.Open()
 try{
  $q=$db.CreateCommand();$q.CommandText="DECLARE @n int=(SELECT COUNT(*) FROM auth.PasswordResets WHERE UserId=@id AND CreatedAt>DATEADD(hour,-1,SYSUTCDATETIME())); WHILE @n<5 BEGIN INSERT auth.PasswordResets(TokenHash,UserId,ExpiresAt,UsedAt) VALUES(HASHBYTES('SHA2_256',CONVERT(varchar(36),NEWID())),@id,SYSUTCDATETIME(),SYSUTCDATETIME());SET @n=@n+1;END;"
  [void]$q.Parameters.AddWithValue('@id',[guid]$fixture.LearnerId);[void]$q.ExecuteNonQuery()
  $beforeLimitToken=Read-MailToken;$null=Call POST 'auth/forgot-password' @{email=$fixture.LearnerEmail}
  $q=$db.CreateCommand();$q.CommandText='SELECT COUNT(*) FROM auth.PasswordResets WHERE UserId=@id AND CreatedAt>DATEADD(hour,-1,SYSUTCDATETIME())';[void]$q.Parameters.AddWithValue('@id',[guid]$fixture.LearnerId)
  if([int]$q.ExecuteScalar() -ne 5 -or (Read-MailToken) -ne $beforeLimitToken){throw 'Hourly recovery cap failed'}
 }finally{$db.Dispose()}
 Write-Output 'PASS 60-second resend cooldown and five-per-hour recovery cap without exposing account existence'
 Write-Output 'PASS local recovery mail, generic response, expiry, invalid/mismatched/weak input, one-time token, old session revocation and new-password login'
}finally{
 $client.Dispose();$handler.Dispose()
 Get-ChildItem (Join-Path $PSScriptRoot '../.local/mail-outbox') -Filter '*.txt' -ErrorAction SilentlyContinue|Where-Object {(Get-Content $_.FullName -Raw -Encoding UTF8).Contains("To: $($fixture.LearnerEmail)`n")}|ForEach-Object {Remove-Item -LiteralPath $_.FullName}
}
