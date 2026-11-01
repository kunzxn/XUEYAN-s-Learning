param(
    [string]$Server = 'localhost',
    [switch]$RunTests
)
$ErrorActionPreference = 'Stop'
$database = 'XUEYAN_Development'
$sqlcmd = (Get-Command sqlcmd -ErrorAction Stop).Source
function Invoke-Script([string]$Path, [string]$Target = $database) {
    & $sqlcmd -S $Server -d $Target -E -C -I -l 10 -b -f 65001 -i $Path
    if ($LASTEXITCODE -ne 0) { throw "SQL script failed: $Path" }
}
Invoke-Script (Join-Path $PSScriptRoot '00-create-database.sql') 'master'
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
    @('010-workspace-roles','10-workspace-roles.sql')
)
foreach ($migration in $migrations) {
    $version = $migration[0]
    $query = "SET NOCOUNT ON; IF OBJECT_ID(N'dbo.SchemaMigrations',N'U') IS NULL SELECT 0; ELSE SELECT COUNT(*) FROM dbo.SchemaMigrations WHERE Version='$version';"
    $result = & $sqlcmd -S $Server -d $database -E -C -I -l 10 -b -h -1 -W -Q $query
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read migration state.' }
    if (($result -join '').Trim() -eq '0') {
        Invoke-Script (Join-Path $PSScriptRoot $migration[1])
    } else { Write-Host "Already applied: $version" }
}
if ($RunTests) {
    foreach ($test in @('permissions.sql','integrity.sql','last-admin.sql')) {
        Invoke-Script (Join-Path $PSScriptRoot "tests/$test")
    }
}
Write-Host "Ready: $Server / $database"
