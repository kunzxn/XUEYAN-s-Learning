param([switch]$CreateAdmin)
$ErrorActionPreference='Stop'
$env:ASPNETCORE_ENVIRONMENT='Development'
$project=Join-Path $PSScriptRoot 'api/Xueyan.Api.csproj'
if ($CreateAdmin) {
    $env:XUEYAN_ADMIN_EMAIL=Read-Host 'Email admin đầu tiên'
    $secure=Read-Host 'Mật khẩu admin (ít nhất 12 ký tự)' -AsSecureString
    $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $env:XUEYAN_ADMIN_PASSWORD=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
        dotnet run --project $project --no-launch-profile -- --bootstrap-admin
        if ($LASTEXITCODE -ne 0) { throw 'Không thể tạo admin. Nếu đã có admin, đăng nhập bằng tài khoản hiện có.' }
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        Remove-Item Env:XUEYAN_ADMIN_PASSWORD -ErrorAction SilentlyContinue
        Remove-Item Env:XUEYAN_ADMIN_EMAIL -ErrorAction SilentlyContinue
    }
}
dotnet run --project $project --no-launch-profile --urls http://127.0.0.1:5108
