# Admin CRUD và dữ liệu học thật — 23/10/2026

## Phần đã triển khai

Frontend vẫn là Next.js hiện có, dùng màu/font/tokens và Input/Button/Dialog/validation chung. API ASP.NET Core mới nằm riêng ở `backend/api/`, dùng EF Core cho truy vấn đọc và Microsoft.Data.SqlClient cho command/transaction truy cập SQL Server `XUEYAN_Development`. Không đặt UI hoặc code backend vào `data/`.

| Route | Hành vi |
| --- | --- |
| `/login`, `/account/login` | Đăng nhập thật bằng email/mật khẩu; admin tới `/admin`, learner tới `/my-learning` |
| `/register`, `/account/register` | Tạo tài khoản learner thật; role gửi kèm từ client bị bỏ qua |
| `/admin` | Kiểm tra quyền, thống kê thật từ SQL Server |
| `/admin/users` | Tạo tài khoản learner, xem/sửa tên + quyền/trạng thái, đóng tài khoản và xem từ đã học theo user |
| `/admin/words` | Tạo/đọc/sửa/xóa từ Hán, Pinyin, Hán–Việt, nghĩa; draft/published/archived |
| `/admin/lessons` | CRUD thông tin bài học, chọn cấp HSK từ database, thứ tự và trạng thái |
| `/admin/teachers` | CRUD hồ sơ giáo viên; không sinh tài khoản giáo viên |
| `/learn` | Học từ đã xuất bản trên SQL Server, mở nghĩa và đánh giá Quên/Khó/Nhớ/Dễ |
| `/my-learning` | Danh sách từ đã có lượt học, số lượt, lần học gần nhất; chỉ tài khoản hiện tại |

Các màn hình Dashboard/HSK/flashcard cũ vẫn là giao diện mẫu, giữ DemoNotice và các bản nháp local. Không tự map fixture `xuexi` thành một ID SQL hoặc báo các lượt học cũ đã lưu server. Header có lối vào “Việc học của tôi”; login/register mặc định đã nối thật, các trạng thái Stitch vẫn xem được khi truyền `?demo=...`.

## Chạy trên máy hiện tại

1. Áp dụng các migration còn thiếu:

```powershell
./backend/database/sqlserver/Initialize-Database.ps1 -RunTests
```

2. Tạo admin đầu tiên bằng email và mật khẩu **do bạn nhập** (không có mật khẩu mặc định):

```powershell
./backend/Start-Api.ps1 -CreateAdmin
```

Script hỏi mật khẩu bằng input ẩn, dùng biến môi trường tạm và xóa chúng sau bootstrap. Nếu đã có admin hoạt động, bootstrap từ chối tạo admin khác. Các lần chạy API tiếp theo chỉ cần:

```powershell
./backend/Start-Api.ps1
```

3. Trong terminal khác:

```powershell
cd frontend
npm run dev
```

Mở `/login` hoặc `/admin`. API mặc định ở `http://127.0.0.1:5108`; Next proxy cùng origin `/api/backend/*`. Nếu đổi cổng API, đặt biến môi trường **server-only** `XUEYAN_API_URL`, không dùng `NEXT_PUBLIC_*` cho thông tin SQL. Cấu hình kết nối phát triển là Windows Integrated Security trong `backend/api/appsettings.Development.json`, không có SQL password được commit.

## Dữ liệu và quyền

- User/profile/preferences/password hash ghi trong transaction; đăng ký không nhận quyền admin. Admin mới chỉ có thể được bootstrap hoặc cấp bởi admin đã đăng nhập.
- Dùng PasswordHasher của ASP.NET Core; access JWT 15 phút và refresh token ngẫu nhiên 32 byte, chỉ lưu SHA-256 refresh hash trong `auth.Sessions`. Cookie HttpOnly/SameSite Strict; Secure khi không ở Development. Không lưu password/token trong localStorage. Next proxy tự gia hạn access cookie qua phiên còn hiệu lực.
- API xác minh session từ DB cho mọi endpoint có dữ liệu riêng/quản trị; learner gọi API admin nhận 403, anonymous nhận 401. Client shell chỉ là phản hồi UI, không phải lớp bảo vệ duy nhất.
- Truy vấn quản trị/đọc cá nhân dùng SQL principal WITHOUT LOGIN theo role và session context đã kiểm chứng. Kết nối không pool để tránh rò context giữa request. Auth và command lưu học dùng kết nối server tin cậy, câu SQL có tham số; không nhận UserId chủ sở hữu từ client.
- Next proxy kiểm tra Origin cho POST/PUT/DELETE và dùng upstream allowlist; API không bật CORS tùy ý. Các endpoint đăng nhập/đăng ký có giới hạn tần suất trong process.
- Một lượt học ghi StudySession + ReviewEvent + WordProgress trong transaction serializable. Unique UserId+ClientEventId chống gửi lại trùng. Không tăng số lượt nếu retry cùng eventId.
- “Từ đã học” nghĩa là đã có lượt học được ghi, **không phải đã thành thạo**. Repetitions và Lapses được giữ theo từng UserId/WordId. Lịch ôn hiện dùng service `sm2-inspired-v1`, điều chỉnh khoảng/ease theo lịch sử nhớ; state/version cũ được khởi tạo lại an toàn mà không mất lịch sử. `GET /learning/due` lấy thẻ đến hạn theo UTC. Chưa phải FSRS.
- View `learning.MyLearnedWords` giữ lịch sử khi từ bị archive. Từ có lịch sử học không thể bị hard-delete do FK; UI thông báo để dùng archive. Tài khoản xóa theo nghĩa đóng/thu hồi phiên, không xóa lịch sử học.
- Words/Teachers có optimistic concurrency bằng rowversion; form giữ nội dung khi trùng slug, dữ liệu đang dùng, phiên bản cũ hoặc dịch vụ lỗi. Lessons/Users chưa có kiểm tra version cho mọi thao tác, xem giới hạn bên dưới.

## Kiểm tra đã thực hiện

Kiểm thử API bằng `backend/tests/Xueyan.Smoke.csproj` trên SQL Server thật:

- Login/Logout thật; anonymous 401, learner 403 khi đọc/ghi admin.
- Words create/read/update/delete; duplicate slug và version cũ trả conflict.
- Teachers và Lessons CRUD.
- Users create/read/update/đóng; đăng ký có roleCode=admin vẫn nhận learner.
- Hai người học không thấy dữ liệu nhau; admin xem được từ của từng user.
- Lưu tiến độ, retry không ghi hai lần, đăng nhập lại vẫn còn dữ liệu.
- Không xóa được từ đã có lịch sử học; xóa được từ chưa được dùng.

Trình duyệt đã bấm thử:

- Admin đăng nhập → tạo từ Hán/Pinyin → reload → sửa nghĩa → dữ liệu được giữ.
- Form trống gắn lỗi 4 trường, focus đúng Chữ Hán.
- Admin tìm người học và xem từ đã học; tạo bài học chọn HSK từ DB, tạo hồ sơ giáo viên.
- Người học đăng nhập → học hai từ SQL → tự đánh giá → `/my-learning` → reload còn đủ hai từ.
- Learner mở `/admin` thấy thông báo không có quyền; API chặn độc lập.
- Quan sát admin desktop 1440px/mobile 375px. Mobile đổi bảng sang hàng xếp dọc để thao tác không bị khuất bên phải.

Ảnh và nhật ký thao tác: `docs/ui-validation/admin/`. Các ảnh chứa **dữ liệu thử riêng**, không phải dữ liệu sản xuất. API tests tạo fixture có tiền tố ngẫu nhiên; cleanup chỉ nhắm các ID/email/slug fixture, không clear dữ liệu người dùng khác. Không giữ lại mật khẩu mẫu trong source hoặc báo cáo.

## Giới hạn cần biết

- Chưa nối các Dashboard/HSK/lớp học/ghi chú local cũ vào API. Lưu học thật hiện qua `/learn` và `/my-learning`; không suy ra mọi nút Flashcard cũ đều lưu SQL.
- CRUD hiện là bốn nhóm nêu trên; chưa có UI gán từ vào bài học, quản lý lớp/enrollment, chấm bài, tài nguyên, upload hoặc hỗ trợ. Bài học ở admin mới lưu metadata, không báo đã tạo được nội dung học đầy đủ.
- Email chưa xác minh; chưa có email reset, MFA, cơ chế đổi mật khẩu, audit mọi CRUD, trang hồ sơ server hoặc khả năng chống mất cập nhật đồng thời cho mọi bảng. Quyền thay đổi trên user thu hồi phiên của user đó; UI chặn sửa/đóng tài khoản admin đang dùng để tránh tự khóa.
- Danh sách admin tải 500 bản ghi gần nhất, tìm trong danh sách đã tải; học từ tải 200 từ published đầu tiên. Chưa phân trang toàn bộ kho HSK/import nguồn HSK.
- Runtime hiện là nền phát triển local, Windows connection của operator có quyền cao để xác thực và command server. Trước production phải tách service identity/quyền execute tối thiểu, TLS/certificate, secret store, proxy origin/forwarded IP/rate limit, audit/backup, runtime .NET và driver được cập nhật. Không dùng cấu hình Developer này như cấu hình production hoàn tất.
- Không sửa hệ thống thiết kế; các component mới tái sử dụng primitives. Không commit/push.

## Cập nhật kiến trúc backend

Đã tách Controller → Service → Data, thêm EF Core projections, JWT/session refresh và cache danh sách từ published. Cấu hình, quyết định không thêm job quét cờ đến hạn và kết quả kiểm thử mới: [backend improvements](backend-improvements.md).
