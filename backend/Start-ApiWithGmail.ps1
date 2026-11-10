param([string]$WebOrigin='http://localhost:3000')
$ErrorActionPreference='Stop'
# ASCII messages keep this launcher compatible with Windows PowerShell 5.1.
$mailbox=(Read-Host 'Gmail address used by XUEYAN').Trim()
try {$parsed=[Net.Mail.MailAddress]::new($mailbox)} catch {throw 'Enter a valid Gmail mailbox.'}
if($parsed.Address -ne $mailbox -or $parsed.Host -notin @('gmail.com','googlemail.com')){throw 'This launcher is for Gmail. Use Mail__* settings for another provider.'}
$origin=$null
if(![Uri]::TryCreate($WebOrigin,[UriKind]::Absolute,[ref]$origin) -or $origin.UserInfo -or $origin.AbsolutePath -ne '/' -or $origin.Query -or $origin.Fragment -or !($origin.Scheme -eq 'https' -or ($origin.Scheme -eq 'http' -and $origin.IsLoopback))){throw 'WebOrigin must be an HTTPS origin, or localhost for local development.'}
$secret=Read-Host 'Google App Password (NOT your Google login password)' -AsSecureString
$pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
$names=@('Mail__Host','Mail__Port','Mail__From','Mail__Username','Mail__Password','Recovery__WebOrigin','ASPNETCORE_ENVIRONMENT')
$previous=@{}
foreach($name in $names){$previous[$name]=[Environment]::GetEnvironmentVariable($name,'Process')}
try {
 $appPassword=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) -replace '\s',''
 if($appPassword.Length -ne 16){throw 'A Google App Password must contain 16 characters.'}
 $env:Mail__Host='smtp.gmail.com';$env:Mail__Port='587';$env:Mail__From=$mailbox;$env:Mail__Username=$mailbox;$env:Mail__Password=$appPassword
 $env:Recovery__WebOrigin=$origin.GetLeftPart([UriPartial]::Authority)
 if(!$env:ASPNETCORE_ENVIRONMENT){$env:ASPNETCORE_ENVIRONMENT='Development'}
 Write-Host 'Sender: XUEYAN (the Gmail address remains visible). TLS is enabled.'
 Write-Host 'Credentials are used only by this process/API and are not written to source files.'
 Write-Host 'Use the website Forgot password form with your own test account to verify delivery.'
 dotnet run --project (Join-Path $PSScriptRoot 'api/Xueyan.Api.csproj') --no-launch-profile --urls http://127.0.0.1:5108
 if($LASTEXITCODE -ne 0){throw 'API exited with an error.'}
} finally {
 $appPassword=$null
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
 $secret.Dispose()
 foreach($name in $names){[Environment]::SetEnvironmentVariable($name,$previous[$name],'Process')}
}
