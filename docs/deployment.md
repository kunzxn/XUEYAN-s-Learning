# Deploy XUEYAN: Vercel (frontend) + Azure (API + SQL)

Thứ tự bắt buộc: **database → API → frontend**. Frontend cần địa chỉ API công khai trước khi chạy thật.

## 1. Azure SQL (database)

1. Azure Portal → tạo **SQL Database** (server mới, bật SQL authentication, đặt admin riêng).
2. Firewall: bật *Allow Azure services*, thêm IP máy bạn để chạy migration.
3. Chạy migration `backend/database/sqlserver/00…07` **theo thứ tự**, bằng SSMS hoặc `sqlcmd` với tài khoản admin.
   - Script 00 tạo database: trên Azure SQL hãy bỏ qua 00 vì database đã tạo ở bước 1.
   - Script `Initialize-Database.ps1` dùng Windows auth cho SQL local, không dùng trực tiếp cho Azure.
4. Script 06 tạo SQL principal cho API (không có quyền DDL). Dùng chính tài khoản này làm chuỗi kết nối runtime, **không** dùng admin.
5. Nhập dữ liệu HSK: `dotnet run --project backend/api -- --import-hsk` với chuỗi kết nối trỏ tới Azure SQL (chạy một lần từ máy bạn).
6. Tạo admin đầu tiên: đặt `XUEYAN_ADMIN_EMAIL`, `XUEYAN_ADMIN_PASSWORD` rồi `dotnet run --project backend/api -- --bootstrap-admin`.

> Chưa kiểm chứng trên Azure SQL: script 02 (row-level security, role) và 06 được viết cho SQL Server 2022. Hãy chạy thử và đọc lỗi từng script trước khi mở cho người dùng.

## 2. Azure App Service (API .NET 9)

1. Tạo **App Service**: Runtime *.NET 9*, Linux, gói B1 trở lên.
2. Vào *Settings → Environment variables*, thêm (kiểu *App setting*; tên có dấu `__` thay cho `:`):

| Tên | Giá trị |
| --- | --- |
| `ConnectionStrings__Database` | `Server=tcp:<server>.database.windows.net,1433;Database=<db>;User ID=<api-user>;Password=<mật-khẩu>;Encrypt=true;TrustServerCertificate=false` |
| `Jwt__SigningKey` | chuỗi ngẫu nhiên dài ≥ 64 ký tự (tạo mới, không dùng lại khóa local) |
| `Jwt__Issuer`, `Jwt__Audience` | ví dụ `xueyan-api`, `xueyan-web` |
| `Google__ClientId` | Client ID của Google OAuth |
| `Recovery__WebOrigin` | URL frontend, ví dụ `https://xueyan.vercel.app` |
| `Mail__Host`, `Mail__Port`, `Mail__From`, `Mail__Username`, `Mail__Password` | SMTP/Gmail App Password (xem `docs/gmail-system-email.md`) |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

3. Kiểm tra `https://<app>.azurewebsites.net/health` trả `{"status":"ok"}`.

### Deploy tự động bằng GitHub Actions

1. App Service → *Download publish profile*.
2. GitHub repo → *Settings → Secrets and variables → Actions*:
   - Secret `AZURE_WEBAPP_PUBLISH_PROFILE` = nội dung file publish profile.
   - Variable `AZURE_WEBAPP_NAME` = tên App Service.
3. Chạy workflow **Deploy API (Azure App Service)** (`.github/workflows/deploy-api.yml`), hoặc push vào `main` khi `backend/api/**` thay đổi.

Cách thủ công không cần Actions: `dotnet publish backend/api -c Release -o publish` rồi *Publish* bằng Visual Studio hoặc `az webapp deploy`.

## 3. Vercel (frontend)

1. Vercel → *Add New Project* → chọn repo GitHub, **Root Directory = `frontend`**, Framework = Next.js.
2. Environment variable: `XUEYAN_API_URL` = `https://<app>.azurewebsites.net` (không có dấu `/` cuối).
3. Nhánh production: chọn `main` (hoặc `dev` nếu muốn thử trước).
4. Sau khi có domain Vercel, quay lại Azure đặt `Recovery__WebOrigin` đúng domain đó.
5. Google Cloud Console: thêm domain Vercel vào *Authorized JavaScript origins* của OAuth Client.

## 4. Kiểm tra sau deploy

- `/health` của API trả ok; đăng ký/đăng nhập được; học một thẻ và thấy tiến độ lưu.
- Quên mật khẩu gửi được email.
- Cookie phiên được đặt đúng (frontend và API qua proxy `/api/backend`, nên không cần mở CORS).

## Cần cân nhắc

- Không đưa chuỗi kết nối, `Jwt__SigningKey`, App Password vào Git.
- Azure SQL và App Service tính phí theo gói; chọn gói thấp khi thử.
- Chưa có migration rollback tự động: sao lưu database trước khi chạy script mới.
