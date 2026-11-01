# Backend — cải thiện tuần tự

Phạm vi: giữ nguyên route/response frontend đang dùng; cải thiện kiến trúc, lịch ôn, truy vấn, JWT/phân quyền và cache. Không sửa dữ liệu người dùng để làm test chạy qua, không commit/push.

- [x] 1. Tách MVC API Controller → Service → Repository/Data; giữ hành vi cũ và kiểm thử hồi quy.
- [x] 2. Scheduler service độc lập; transaction/idempotency/concurrency; truy vấn đến hạn theo thời gian thay vì quét đổi trạng thái.
- [x] 3. EF Core read model, AsNoTracking/projections, truy vấn số lượng cố định; không Include toàn graph không cần thiết.
- [x] 4. JWT bearer, issuer/audience/signature/lifetime, session revocation, role/ownership; giữ token ngoài localStorage.
- [x] 5. Cache từ published có giới hạn/TTL, chống nhiều request tải cùng lúc và invalidation sau CRUD; không cache dữ liệu học cá nhân.
- [x] Kiểm thử SQL/API, build backend/frontend, cập nhật cấu hình và giới hạn triển khai.

Ban đầu xác minh: backend dùng Minimal API, logic nghiệp vụ/SQL/auth tập trung trong Program.cs; chưa dùng EF/JWT/cache. Không có N+1 từ Include vì chưa có ORM. Không thêm background worker chỉ để cập nhật một trạng thái có thể tính bằng NextReviewAt.

Bước 1: build đạt; smoke SQL/API CRUD, role, ownership, duplicate, retry và đăng nhập lại đều đạt. Lỗi metadata validation record DTO đã được phát hiện và sửa trước khi chuyển bước.

Bước 2: scheduler unit tests và SQL/API smoke đạt. Scheduler O(1) chạy trong transaction để event/lịch ôn không lệch nhau; không thêm job quét cập nhật cờ due.

Bước 3: EF Core read model trên schema/view SQL hiện có; smoke CRUD/ownership/progress đạt. Không EnsureCreated/Migrate hoặc sinh lại schema.

Bước 4: JWT giữ tương thích cookie/frontend. Đã kiểm thử bearer/cookie; JWT sai chữ ký, issuer, audience, hạn dùng, role hoặc subject đều trả 401; learner gọi admin trả 403. Refresh, khóa tài khoản và thu hồi phiên đều đạt.

Bước 5: cache published vocabulary trong process, TTL 5 phút, giới hạn 500 đơn vị (API hiện lấy tối đa 200 từ). Các request miss dùng semaphore để chỉ tải một lần; snapshot bất biến; generation chống truy vấn đang chạy nạp lại cache cũ sau invalidation. CRUD words chỉ invalidation sau khi ghi thành công. Không cache lịch sử học, phiên, người dùng hoặc draft.

## Kiến trúc và quyết định

`Controllers/` nhận DTO, kiểm tra policy và trả HTTP; `Services/` xử lý validation/nghiệp vụ, scheduler, cache; `Data/` truy vấn và transaction. `Infrastructure/` chứa JWT, middleware lỗi và actor hiện tại. `Program.cs` chỉ đăng ký dependency/middleware/route/bootstrap. Interface cho phép thay repository khi test.

EF Core 9.0.21 phục vụ truy vấn đọc trên schema/view hiện có; không tự tạo database hoặc chạy EF migration. `AsNoTracking`, `Select`, join và giới hạn kết quả trước materialize; không lazy loading hoặc vòng lặp truy vấn theo từng dòng. Các lệnh ghi SQL có tham số và stored procedure hiện có được giữ để bảo toàn RLS, rowversion, transaction và kiểm soát admin cuối. Đây là mô hình đọc EF / ghi SQL, chưa chuyển toàn bộ persistence sang EF.

Scheduler `sm2-inspired-v1` lưu ease/interval/số lần nhớ liên tiếp trong SchedulerState. Quên: 10 phút; nhớ lần đầu: 1 ngày; lần thứ hai: 6 ngày; tiếp theo phụ thuộc khoảng cũ và ease. Có giới hạn khoảng/ease, phục hồi state hỏng hoặc version cũ mà không xóa lịch sử. Không tuyên bố đây là FSRS hoặc thuật toán đã được đánh giá hiệu quả giáo dục.

Tính lịch là O(1), nằm cùng transaction serializable với ReviewEvent/WordProgress. Retry cùng eventId không tăng lượt hai lần, kể cả gửi đồng thời. Không đưa phần ghi lịch này ra job vì có thể tạo trạng thái lưu event nhưng chưa lưu lịch. `GET /learning/due` lọc NextReviewAt theo UTC và chủ sở hữu; không cần job cập nhật cờ đến hạn. Chưa có yêu cầu email/push hay công việc nặng để thêm Hangfire/IHostedService.

## JWT và cấu hình

- Access JWT HS256: 15 phút, kiểm tra issuer/audience/chữ ký/lifetime, clock skew 30 giây; chứa sub, role, sid, jti. Cookie `xueyan_session` HttpOnly, SameSite Strict, Secure ngoài Development.
- Refresh token ngẫu nhiên: phiên tối đa 12 giờ, cookie `xueyan_refresh` HttpOnly; database chỉ giữ SHA-256. Refresh hiện dùng cùng token đến khi phiên hết hạn, chưa có rotation/reuse detection.
- Mỗi JWT còn được đối chiếu phiên/user trong SQL Server: logout, khóa tài khoản và đổi quyền có hiệu lực mà không phải đợi access token hết hạn. Dữ liệu học lấy UserId từ actor đã xác thực, không từ request body.
- Next proxy chỉ chuyển hai cookie của ứng dụng, chuyển access token thành Bearer ở server, tự refresh và retry tối đa một lần khi access hết hạn. Không fallback khi caller gửi explicit Bearer không hợp lệ. Không đưa token vào JSON hoặc localStorage.
- Development tự tạo khóa ngẫu nhiên tại `backend/.local/jwt-signing-key` (gitignored), giữ qua restart. Không chia sẻ/commit file này. Production bắt buộc cấu hình secret `Jwt__SigningKey` (tối thiểu 64 byte UTF-8, tạo ngẫu nhiên), tùy chọn `Jwt__Issuer`, `Jwt__Audience`; không có khóa production mặc định. Đổi khóa làm JWT hiện có mất hiệu lực.
- Windows connection runtime hiện vẫn có quyền cao cho auth/command; cần service identity/quyền tối thiểu trước production. Không coi API local này là hệ thống định danh/OIDC hoàn chỉnh. Rate limit hiện trong process; proxy IP/đa instance cần cấu hình riêng.

## Kiểm thử ngày 23/10/2026

| Phần | Cách kiểm tra | Kết quả |
| --- | --- | --- |
| Build backend | `dotnet build backend/api/Xueyan.Api.csproj` | Đạt, 0 warning/error |
| Scheduler/cache | `dotnet run --project backend/unit-tests/Xueyan.UnitTests.csproj` | 13 assertion scheduler + 6 cache đạt; gồm 20 cache miss đồng thời, TTL, invalidation đang đọc và loader lỗi |
| SQL/API | `dotnet run --project backend/tests/Xueyan.Smoke.csproj --no-build` | CRUD bốn nhóm, Unicode, conflict, role/ownership, đăng nhập lại, JWT giả, refresh/revoke, due và cache invalidation đạt |
| Đồng thời | Hai request cùng eventId trên SQL Server thật | Hai HTTP 200, chỉ tăng một lượt |
| Next proxy | Đặt `XUEYAN_TEST_FRONTEND_URL=http://localhost:3104` khi chạy smoke | JWT cookie hết hạn được refresh, retry thành công và Set-Cookie mới; explicit Bearer sai vẫn 401 |
| Frontend | ESLint, TypeScript noEmit, production build | Đạt |
| Trình duyệt | Login learner → `/my-learning` → reload; learner mở `/admin` | Đã bấm thử thành công, dữ liệu vẫn có sau reload; admin bị chặn. Ảnh: `docs/ui-validation/backend/jwt-learning-reload.png`. Không kiểm tra lại toàn bộ 44 template |

Smoke sử dụng user/email/slug/ID có prefix ngẫu nhiên trong database local, không thao tác bản nháp localStorage. Cleanup chỉ xóa fixture được lưu trong `backend/.local/smoke-fixtures.json`, không reset database hoặc xóa dữ liệu người dùng khác. Build test trước khi chạy server, hoặc dùng `-p:BuildProjectReferences=false` để tránh khóa apphost khi API đang chạy.

Cache này dành cho một API instance; thay dữ liệu trực tiếp bằng SQL có thể chậm cập nhật đến 5 phút. Chưa có Redis/invalidation đa node, phân trang toàn kho, benchmark tải lớn hoặc job thông báo. Các giới hạn backend/UI cũ trong `docs/admin-and-learning.md` vẫn còn hiệu lực.

Tham chiếu chính thức: [JWT bearer validation](https://learn.microsoft.com/aspnet/core/security/authentication/configure-jwt-bearer-authentication), [EF Core efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying).
