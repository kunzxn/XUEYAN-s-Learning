param([string]$Web='http://localhost:3112')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Net.Http
$fixture=Get-Content -LiteralPath (Join-Path $PSScriptRoot '../.local/smoke-fixtures.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$handler=[Net.Http.HttpClientHandler]::new();$handler.AllowAutoRedirect=$false;$handler.UseCookies=$false
$client=[Net.Http.HttpClient]::new($handler);$script:cookie=''
function Call([string]$Method,[string]$Path,$Body=$null,[int]$Status=200){
 $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Method),"$Web$Path")
 [void]$request.Headers.TryAddWithoutValidation('Origin',$Web)
 if($script:cookie){[void]$request.Headers.TryAddWithoutValidation('Cookie',$script:cookie)}
 if($null -ne $Body){$request.Content=[Net.Http.StringContent]::new(($Body|ConvertTo-Json -Compress),[Text.Encoding]::UTF8,'application/json')}
 $response=$client.SendAsync($request).GetAwaiter().GetResult()
 try{
  if($Status -eq 307 -and [int]$response.StatusCode -eq 200){
   $html=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
   if(!$html.Contains('/learn?level=1') -or !$html.Contains('NEXT_REDIRECT')){throw 'Missing streamed legacy redirect'}
   return
  }
  if([int]$response.StatusCode -ne $Status){throw "$Method $Path expected $Status got $([int]$response.StatusCode)"}
  if($Path -eq '/api/backend/auth/login'){$script:cookie=($response.Headers.GetValues('Set-Cookie')|ForEach-Object {($_ -split ';')[0]}) -join '; '}
  $text=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
  if($Status -eq 307){if(!$response.Headers.Location.ToString().Contains('/learn?level=1')){throw 'Legacy lesson redirect mismatch'};return}
  if($Path.StartsWith('/api/')){return ($text|ConvertFrom-Json)}
 }finally{$response.Dispose();$request.Dispose()}
}
try{
 $null=Call POST '/api/backend/auth/login' @{email=$fixture.LearnerEmail;password=$fixture.Password}
 $before=Call GET '/api/backend/learning/overview'
 $words=Call GET '/api/backend/catalog/levels/1/words?page=1'
 $existing=Call GET '/api/backend/learning/progress'
 $word=$words.items|Where-Object {$_.id -notin @($existing|ForEach-Object {$_.id})}|Select-Object -First 1
 if(!$word){throw 'Fixture has already learned the first HSK page'}
 $event=[guid]::NewGuid().ToString()
 $body=@{wordId=$word.id;rating=3;eventId=$event;durationMs=2500}
 $null=Call POST '/api/backend/learning/reviews' $body
 $null=Call POST '/api/backend/learning/reviews' $body
 $after=Call GET '/api/backend/learning/overview'
 if($after.learned -ne $before.learned+1){throw 'Dashboard total mismatch or duplicate event'}
 for($i=0;$i -lt 2;$i++){
  $result=Call GET "/api/backend/learning/results?events=$event"
  if(@($result).Count -ne 1 -or $result.wordId -ne $word.id -or $result.rating -ne 3){throw 'Persisted result mismatch'}
 }
 foreach($path in @('/dashboard?demo=new','/learn?level=1','/review','/review/study','/progress','/my-learning',"/review/summary?events=$event")){$null=Call GET $path;Write-Output "PASS authenticated production route $path"}
 foreach($path in @('/lessons/1','/lessons/1/learn','/lessons/1/practice')){$null=Call GET $path $null 307;Write-Output "PASS legacy lesson redirects to real HSK $path"}
 $progress=Call GET '/api/backend/learning/progress'
 if(!(@($progress)|Where-Object {$_.id -eq $word.id})){throw 'Progress does not include saved word'}
 Write-Output 'PASS real HSK -> proxy save -> idempotent retry -> SQL overview -> result reload -> progress'
}finally{$client.Dispose();$handler.Dispose()}
