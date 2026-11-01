# SQL Server — kết quả kiểm tra 23/10/2026

## Môi trường thực tế

- Server: `localhost`, SQL Server `16.0.1000.6`, Developer Edition (64-bit).
- Database đã tạo: `XUEYAN_Development`.
- Collation: `Latin1_General_100_CI_AS_SC`.
- 33 user tables (bao gồm bảng migration), 16 security policies đang bật.
- 5 migration: `001-schema`, `002-permissions`, `003-reference-data`, `004-access-management`, `005-integrity`.
- Dữ liệu giữ lại: framework HSK 3.0 và 7 nhóm cấp độ. Không seed từ/tiến độ/tài khoản demo. Sau test: `auth.Users=0`, SQL principal `xueyan_test_*=0`.

Không phải kiểm tra bằng mô phỏng SQLite hoặc chỉ đọc SQL: migration và test đã chạy bằng `sqlcmd` trên SQL Server thật. Lần kết nối trong sandbox bị từ chối; đã chạy được bằng Windows integrated authentication với quyền ngoài sandbox theo phạm vi tạo database được yêu cầu. Không thay password, cấu hình SQL Server, firewall, service hoặc database khác.

## Kết quả

| Kiểm tra | Bằng chứng | Kết quả |
| --- | --- | --- |
| Tạo database/schema/FK/CHECK/unique/views/functions/RLS | Chạy script 00–05 qua SQL Server | Đạt, không có lỗi compile T-SQL |
| Chạy lại initializer | Báo `Already applied` đủ 5 migration, không tạo lại bảng | Đạt |
| Public chỉ đọc nội dung published | Guest thấy một word published, không thấy word draft, không đọc bảng hồ sơ | Đạt |
| Hai người học cách ly dữ liệu | A chỉ thấy/sửa hồ sơ/ghi chú A; update B trả 0 dòng | Đạt |
| Chặn đổi owner và insert giả owner | Update ghi chú A sang admin ID chưa có note; insert note B ở word chưa có note | Đạt; không dựa vào lỗi trùng PK để coi là RLS pass |
| Không tin role/user trong context | Chỉ set role=admin/user_id=B mà không có phiên hợp lệ không thấy dữ liệu | Đạt |
| Role DB phải khớp phiên | Token admin đặt trên kết nối chỉ có learner role không thấy dữ liệu cá nhân | Đạt |
| Bảo vệ secrets và quyền | Learner không đọc TokenHash, không update role, không ghi grade | Đạt |
| Phiên hết hạn/thu hồi | Không thấy dữ liệu cá nhân dù context có hash đúng | Đạt |
| Enrollment | A thấy lớp/bài tập đã ghi danh; B không thấy; public view không chứa MeetingUrl | Đạt (view/SQL) |
| Grade draft/published | Người học chỉ thấy grade đã publish, không thấy draft grade | Đạt |
| Admin quản lý | Đọc AdminAccounts không chứa password/token, quản lý hồ sơ giáo viên, đổi trạng thái người học | Đạt |
| Audit đổi quyền | Tạo event có actor admin, thu hồi phiên tài khoản mục tiêu | Đạt |
| Admin hoạt động cuối | Thử hạ quyền admin duy nhất bị lỗi 51013, fixtures rollback | Đạt |
| Unicode | Tên/ghi chú có tiếng Việt, chữ Hán và Pinyin ghi/đọc đúng | Đạt |
| Bộ từ | Tên trắng bị CHECK chặn, trùng hoa/thường cùng chủ bị unique chặn | Đạt; API sau này còn phải gộp mọi Unicode whitespace trước ghi |
| Quan hệ học tập | Từ resume phải ở trong bài; CollectionWords và ReviewEvents phải khớp owner của parent | Đạt |
| Retry event | Cùng UserId+ClientEventId ghi lần hai bị unique chặn | Đạt; API xử lý trả lại kết quả cũ chưa có |
| Dữ liệu thử | Các test transaction rollback, test users WITHOUT LOGIN không còn | Đạt |

Script:

- `backend/database/sqlserver/tests/permissions.sql`
- `backend/database/sqlserver/tests/integrity.sql`
- `backend/database/sqlserver/tests/last-admin.sql`

Chạy:

```powershell
./backend/database/sqlserver/Initialize-Database.ps1 -Server localhost -RunTests
```

Đã gặp và sửa trong lúc triển khai: sqlcmd mặc định thiếu `QUOTED_IDENTIFIER` cho index computed column; bổ sung SET options vào runner/test/procedure. Không bỏ ràng buộc để test chạy qua.

## Giới hạn xác minh

- Không sửa frontend ở đợt này, nên không chạy lại lint/typecheck/build hoặc bấm thử UI. Các kiểm thử UI đợt 1 trước đó không được tính lại thành kết quả của lần DB này.
- Không có API/auth/route guard nên chưa kiểm thử cookie/login/logout/reset thật, CSRF/rate limit, connection pooling/clear context, object-storage và UI admin.
- Chưa có runtime login, admin thật, SRS, nộp bài, chấm bài, kiểm tra hạn nộp hoặc gửi thông báo/email hoạt động. Các role SQL chỉ là nền tảng cho backend.
- Chưa load test, test concurrency/deadlock, backup/restore, failover hoặc import toàn bộ dữ liệu HSK. Tính duy nhất của event/lock admin cuối đã kiểm tra chức năng, chưa mô phỏng nhiều kết nối cạnh tranh.
- Chưa triển khai audit mọi DML; audit đã kiểm tra chỉ cho thủ tục đổi quyền/trạng thái. Khóa retention/privacy và operational access cần chốt trước production.
- SQL Server cục bộ là bản Developer cũ, dùng để kiểm tra phát triển; không được coi là cấu hình production đã hoàn tất.
