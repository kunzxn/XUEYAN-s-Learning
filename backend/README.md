# XUEYAN backend — SQL Server foundation

Swagger local: **http://127.0.0.1:5108/swagger** sau khi chạy `./backend/Start-Api.ps1`. Đăng nhập ngay bằng Execute `/auth/login`, cookie được gửi tự động cho API cùng origin. Xem [hướng dẫn Swagger và ma trận validation](../docs/api-validation.md).

Database nghiệp vụ đặt tại `database/sqlserver/`; frontend vẫn nằm riêng trong `../frontend/`, dữ liệu HSK nguồn trong `../data/`.

Đã tạo trên SQL Server local: **`localhost / XUEYAN_Development`**. Không có login/mật khẩu mặc định. Đã bổ sung API đăng nhập, admin CRUD và lưu học thật; xem tài liệu cập nhật bên dưới. Hai role tài khoản: learner/admin; giáo viên là hồ sơ quản lý nội dung. Xem [phân tích nghiệp vụ và ma trận quyền](../docs/business-and-database.md).

## Chạy API trực tiếp

Từ thư mục gốc repository:

```powershell
cd backend/api
dotnet run
```

Project chạy qua Program.cs; launch profile bật Development và địa chỉ http://127.0.0.1:5108. Mở http://127.0.0.1:5108/swagger để thử API. Cần SQL Server đang chạy. Dừng bằng Ctrl+C.

## Tạo / áp dụng migration

Yêu cầu SQL Server 2022, `sqlcmd`, Windows account có quyền tạo database/schema. Dùng SSMS hoặc PowerShell từ gốc repository:

```powershell
./backend/database/sqlserver/Initialize-Database.ps1 -Server localhost -RunTests
```

Runner tạo `XUEYAN_Development` nếu chưa có, đọc `SchemaMigrations`, chỉ chạy migration chưa áp dụng và dừng khi có lỗi. Không drop database, không sửa database khác. Script 01 cố ý từ chối chạy lại; schema đã có phải thêm migration mới, không sửa/xóa dữ liệu để chạy lại.

`-C` chỉ chấp nhận certificate cho **local development**; kết nối production phải dùng TLS/certificate được xác minh, tài khoản migration riêng và runtime không có quyền DDL/db_owner. Không dùng thông tin kết nối production trong script thử.

| Thứ tự | Script | Nội dung |
| --- | --- | --- |
| 00 | `00-create-database.sql` | Database Unicode, giữ nguyên nếu đã tồn tại |
| 01 | `01-schema.sql` | Identity, HSK/content, học tập, lớp học và bài tập |
| 02 | `02-permissions.sql` | Role, published views, RLS filter/block, quyền từng nhóm |
| 03 | `03-reference-data.sql` | HSK 3.0 và 7 nhóm cấp độ; không seed user/progress/word giả |
| 04 | `04-access-management.sql` | Thủ tục quản lý vai trò/trạng thái; audit và bảo vệ admin cuối |
| 05 | `05-integrity.sql` | Ràng buộc từ đang học thuộc đúng bài |

Nếu 02 bị ngắt giữa batch, dừng và kiểm tra các object đã tạo trước khi chạy tiếp; runner không tự sửa migration một phần. Chưa có cơ chế checksum migration hoặc rollback production tự động.

## Kiểm thử

```powershell
sqlcmd -S localhost -d XUEYAN_Development -E -C -I -b -f 65001 -i backend/database/sqlserver/tests/permissions.sql
sqlcmd -S localhost -d XUEYAN_Development -E -C -I -b -f 65001 -i backend/database/sqlserver/tests/integrity.sql
sqlcmd -S localhost -d XUEYAN_Development -E -C -I -b -f 65001 -i backend/database/sqlserver/tests/last-admin.sql
```

Các test tạo user `WITHOUT LOGIN`, dữ liệu riêng và rollback cả transaction. Không xóa database hoặc dữ liệu đang có. Identity counters có thể tăng dù transaction rollback — không giả định ID liên tục. Không chạy fixture test trong production; admin cuối skip nếu DB đã có admin thật.

Kết quả chạy thực tế và giới hạn: [validation](../docs/database-validation.md).

## Cập nhật Admin CRUD và lưu học thật

Xem [hướng dẫn khởi chạy và phạm vi hiện tại](../docs/admin-and-learning.md). Có thêm migration 06 (SQL principal cho API) và 07 (view lịch sử từ đã học). Chạy `./backend/Start-Api.ps1 -CreateAdmin` để tạo admin đầu tiên bằng thông tin do bạn nhập, sau đó chạy frontend. Không có tài khoản admin mặc định.

## Phạm vi trước đợt API (lịch sử)

Backend/API/auth/session issuance; login SQL runtime; tài khoản admin thật; route guard web; UI admin; import toàn bộ HSK; SRS; upload/storage; gửi email; phòng học; lớp/bài tập workflow commands; backup/retention. DB schema không làm các nút demo thành thao tác server. Không lưu mật khẩu rõ hoặc token gốc vào database/localStorage.

## Kiến trúc API hiện tại

Controller → Service → Repository/Data; EF Core cho read model, SQL command cho transaction/RLS. JWT access + refresh cookie HttpOnly; SM2-inspired scheduler và cache published vocabulary. Xem [cấu hình và kiểm thử](../docs/backend-improvements.md). Production cần secret `Jwt__SigningKey`; Development tự tạo khóa trong `.local/` được gitignore. Không có khóa production mặc định.

```powershell
dotnet build backend/api/Xueyan.Api.csproj
dotnet run --project backend/unit-tests/Xueyan.UnitTests.csproj
# Build smoke trước khi chạy API để tránh file apphost bị khóa
dotnet build backend/tests/Xueyan.Smoke.csproj
# Trong terminal khác khởi chạy API bằng Start-Api.ps1, sau đó:
dotnet run --project backend/tests/Xueyan.Smoke.csproj --no-build
dotnet run --project backend/tests/Xueyan.Smoke.csproj --no-build -- --cleanup
```

## Từ vựng HSK và Google

Xem [dữ liệu HSK, cách import và cấu hình Google](../docs/hsk-and-google.md). Chạy API trực tiếp tại `backend/api` bằng `dotnet run`; không cần script khởi động.

## Hồ sơ và lưu từ điển

Migration 009 bổ sung avatar riêng và sổ từ tài khoản. Xem [hồ sơ, lưu từ và giao diện Login](../docs/account-profile-and-dictionary.md). Cần khởi động lại API/frontend sau cập nhật.

## Phân quyền không gian cập nhật

Migration 010 và [ma trận quyền mới](../docs/workspace-role-access.md) bổ sung teacher. Admin cấp quyền tại quản lý người dùng; không có tài khoản/mật khẩu giảng viên mặc định. Các không gian được chặn đúng vai trò, kể cả bản mẫu.
