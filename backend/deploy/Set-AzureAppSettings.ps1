<#
  Set the App Service settings for the XUEYAN API (Azure CLI must be signed in: az login).
  - The API database password is typed into a hidden prompt; it is never echoed or stored in the repo.
  - A new random JWT signing key is generated unless -KeepJwtKey is passed (existing sessions end when it changes).
  - Settings are written through a temporary JSON file that is deleted afterwards.

  Example:
    ./Set-AzureAppSettings.ps1 -WebOrigin https://xueyan.vercel.app
  Optional: -GoogleClientId <id>, and -MailHost/-MailPort/-MailFrom/-MailUser to enable password-recovery email (asks for the mail password).
#>
param(
    [string]$ResourceGroup = 'xueyan-rg',
    [string]$WebApp = 'xueyan-api-lqh',
    [string]$SqlServer = 'xueyan-sql-lqh.database.windows.net',
    [string]$Database = 'XUEYAN_Development',
    [string]$ApiUser = 'xueyan_api_app',
    [Parameter(Mandatory)][string]$WebOrigin,
    [string]$GoogleClientId,
    [string]$MailHost, [int]$MailPort = 587, [string]$MailFrom, [string]$MailUser,
    [switch]$KeepJwtKey
)
$ErrorActionPreference = 'Stop'
function Read-Secret([string]$Prompt) {
    $secure = Read-Host -Prompt $Prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
if ($WebOrigin -notmatch '^https://[^/]+$') { throw 'WebOrigin must look like https://your-site.vercel.app (no trailing slash).' }

$apiPassword = Read-Secret "Password of SQL user $ApiUser"
if ($apiPassword -match '[;''"{}=]') { throw 'The password contains characters that break a connection string (; '' " { } =).' }
$settings = New-Object System.Collections.Generic.List[object]
function Add-Setting($name, $value) { $settings.Add([ordered]@{ name = $name; value = [string]$value; slotSetting = $false }) }

Add-Setting 'ConnectionStrings__Database' "Server=tcp:$SqlServer,1433;Database=$Database;User ID=$ApiUser;Password=$apiPassword;Encrypt=true;TrustServerCertificate=false;Pooling=false"
if (-not $KeepJwtKey) {
    $jwtBytes = New-Object byte[] 64
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwtBytes)
    Add-Setting 'Jwt__SigningKey' ([Convert]::ToBase64String($jwtBytes))
}
Add-Setting 'Jwt__Issuer' 'xueyan-api'
Add-Setting 'Jwt__Audience' 'xueyan-web'
Add-Setting 'Recovery__WebOrigin' $WebOrigin
Add-Setting 'ASPNETCORE_ENVIRONMENT' 'Production'
Add-Setting 'DOTNET_ROLL_FORWARD' 'Major'
if ($GoogleClientId) { Add-Setting 'Google__ClientId' $GoogleClientId }
if ($MailHost) {
    Add-Setting 'Mail__Host' $MailHost; Add-Setting 'Mail__Port' $MailPort; Add-Setting 'Mail__From' $MailFrom; Add-Setting 'Mail__Username' $MailUser
    Add-Setting 'Mail__Password' (Read-Secret "Mail password for $MailUser")
}

$temp = [IO.Path]::GetTempFileName()
try {
    $settings | ConvertTo-Json -Depth 4 | Set-Content -Path $temp -Encoding UTF8
    az webapp config appsettings set -g $ResourceGroup -n $WebApp --settings "@$temp" --only-show-errors -o none
    if ($LASTEXITCODE -ne 0) { throw 'az failed to set app settings.' }
} finally { Remove-Item $temp -Force -ErrorAction SilentlyContinue; $apiPassword = $null }
Write-Host "App settings updated for $WebApp. Setting names: $(($settings | ForEach-Object { $_.name }) -join ', ')"
