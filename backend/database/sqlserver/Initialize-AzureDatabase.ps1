<#
  Apply the XUEYAN migrations to an Azure SQL database that already exists (created in the portal).
  - Uses SQL authentication. Passwords are typed into hidden prompts: they are never passed as
    arguments, never printed and never stored in the repository.
  - Skips 00-create-database.sql (the portal already created the database).
  - Re-runnable: migrations already recorded in dbo.SchemaMigrations are skipped.

  Example:
    ./Initialize-AzureDatabase.ps1 -Server xueyan-sql-lqh.database.windows.net -User xueyanadmin
  Add -CreateApiUser to also create the contained SQL user the API connects with.
#>
param(
    [Parameter(Mandatory)][string]$Server,
    [Parameter(Mandatory)][string]$User,
    [string]$Database = 'XUEYAN_Development',
    [switch]$UseEntra,
    [switch]$CreateApiUser,
    [string]$ApiUser = 'xueyan_api_app'
)
$ErrorActionPreference = 'Stop'
$sqlcmd = (Get-Command sqlcmd -ErrorAction Stop).Source

function Read-Secret([string]$Prompt) {
    $secure = Read-Host -Prompt $Prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

# -UseEntra: sign in with Microsoft Entra (browser window, no password in the script). -User is then the Entra account.
# Otherwise sqlcmd reads the SQL password from SQLCMDPASSWORD; it only lives in this process.
if ($UseEntra) { $auth = @('-G', '-U', $User) }
else { $env:SQLCMDPASSWORD = Read-Secret "Password for $User"; $auth = @('-U', $User) }

function Invoke-Sql([string[]]$Arguments) {
    & $sqlcmd -S $Server -d $Database @auth -C -I -l 30 -b -f 65001 @Arguments
    if ($LASTEXITCODE -ne 0) { throw "sqlcmd failed (exit $LASTEXITCODE)." }
}

try {
    Write-Host "Checking connection to $Server / $Database ..."
    # Serverless databases auto-pause: the first connection can fail with "not currently available" while it resumes.
    $ready = $false
    for ($try = 1; $try -le 8 -and -not $ready; $try++) {
        try {
            Invoke-Sql @('-Q', 'SELECT DB_NAME() AS CurrentDatabase, CAST(DATABASEPROPERTYEX(DB_NAME(),''Collation'') AS nvarchar(128)) AS Collation;')
            $ready = $true
        } catch {
            Write-Host "Database is resuming, retry $try/8 in 30s ..."
            Start-Sleep -Seconds 30
        }
    }
    if (-not $ready) { throw 'Database did not become available.' }

    $migrations = @(
        @('001-schema','01-schema.sql'),
        @('002-permissions','02-permissions.sql'),
        @('003-reference-data','03-reference-data.sql'),
        @('004-access-management','04-access-management.sql'),
        @('005-integrity','05-integrity.sql'),
        @('006-api-principals','06-api-principals.sql'),
        @('007-learned-history','07-learned-history.sql'),
        @('008-hsk-google','08-hsk-google.sql'),
        @('009-user-profile','09-user-profile.sql'),
        @('010-workspace-roles','10-workspace-roles.sql'),
        @('011-password-recovery','11-password-recovery.sql')
    )
    # One sqlcmd session applies every pending migration, so Entra sign-in happens only once.
    $applied = @()
    $out = & $sqlcmd -S $Server -d $Database @auth -C -I -l 30 -b -h -1 -W -Q "SET NOCOUNT ON; IF OBJECT_ID(N'dbo.SchemaMigrations',N'U') IS NOT NULL SELECT Version FROM dbo.SchemaMigrations;"
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read migration state.' }
    $applied = @($out | ForEach-Object { $_.ToString().Trim() } | Where-Object { $_ })
    $batch = New-Object System.Collections.Generic.List[string]
    $batch.Add(':on error exit')
    foreach ($migration in $migrations) {
        if ($applied -contains $migration[0]) { Write-Host "Already applied: $($migration[0])"; continue }
        Write-Host "Queued: $($migration[1])"
        $batch.Add('PRINT N''Applying ' + $migration[1] + ' ...'';')
        $batch.Add(':r "' + (Join-Path $PSScriptRoot $migration[1]) + '"')
        $batch.Add('GO')
    }
    if ($batch.Count -gt 1) {
        $runner = [IO.Path]::GetTempFileName()
        try {
            Set-Content -Path $runner -Value $batch -Encoding UTF8
            Invoke-Sql @('-i', $runner)
        } finally { Remove-Item $runner -Force -ErrorAction SilentlyContinue }
    }

    if ($CreateApiUser) {
        $apiPassword = Read-Secret "New password for API user $ApiUser (will go into the App Service setting)"
        if ($apiPassword.Length -lt 16) { throw 'Use at least 16 characters for the API password.' }
        $escaped = $apiPassword.Replace("'", "''")
        $temp = [IO.Path]::GetTempFileName()
        try {
            # Temporary file is deleted in finally; it never reaches the repository or the console.
            @"
IF NOT EXISTS(SELECT 1 FROM sys.database_principals WHERE name='$ApiUser')
    CREATE USER [$ApiUser] WITH PASSWORD='$escaped';
ELSE
    ALTER USER [$ApiUser] WITH PASSWORD='$escaped';
ALTER ROLE db_owner ADD MEMBER [$ApiUser];
"@ | Set-Content -Path $temp -Encoding UTF8
            Invoke-Sql @('-i', $temp)
        } finally { Remove-Item $temp -Force -ErrorAction SilentlyContinue; $apiPassword = $null; $escaped = $null }
        Write-Host "API user $ApiUser is ready."
    }
    Write-Host "Done: $Server / $Database"
} finally {
    Remove-Item Env:\SQLCMDPASSWORD -ErrorAction SilentlyContinue
}
