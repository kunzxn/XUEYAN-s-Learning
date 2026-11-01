# Swagger và validation — 23/10/2026

## Chạy và thử API

Từ thư mục gốc:

```powershell
.\backend\Start-Api.ps1
```

Mở **http://127.0.0.1:5108/swagger**. OpenAPI JSON: http://127.0.0.1:5108/swagger/v1/swagger.json.

1. Mở `POST /auth/login`, nhập email/mật khẩu tài khoản của bạn, **Execute** (nếu chưa có ô nhập thì chọn **Try it out**).
2. Login trả 200 và cookie HttpOnly. Gọi `GET /auth/me` để kiểm tra phiên. Không cần lấy token từ localStorage hoặc copy cookie vào ô Authorize.
3. Admin thử `/admin/{resource}`: chọn `resource`, chọn **example cùng tên** (`words`, `lessons`, `teachers`, `users`). PUT words/teachers dùng `version` lấy từ GET; `THAY_VERSION_TU_GET` chỉ là lời nhắc, không phải version hợp lệ. Bài học chọn `levelId` từ `/admin/levels`, không giả định ID 1 tồn tại trên mọi database.
4. Người học thử `/learning/words`, `/learning/reviews`, `/learning/progress`, `/learning/due`. `eventId` là UUID mới cho mỗi lượt học; giữ nguyên khi retry cùng lượt, không tái dùng cho từ/đánh giá khác.
5. `POST /auth/logout` thu hồi phiên. JWT Bearer qua **Authorize** vẫn được hỗ trợ nếu client riêng đã có token hợp lệ; không có endpoint lấy khóa ký hay token mẫu.

Swagger chỉ bật trong **Development**; không mở tài liệu thử ghi API công khai trong production. Tài khoản admin đầu tiên tạo bằng `Start-Api.ps1 -CreateAdmin` và thông tin bạn tự nhập. Không có admin/password mặc định. Cookie phụ thuộc hostname: dùng nhất quán `127.0.0.1` hoặc `localhost` khi thử.

Swagger request interceptor gửi `X-Xueyan-Client: web` và credentials cùng origin. Các policy JWT/admin/ownership vẫn giữ nguyên. Swagger không bỏ qua auth, RLS hoặc giới hạn tần suất. Tài liệu theo [Swashbuckle chính thức](https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle).

## Hợp đồng lỗi

```json
{
  "error": "Dữ liệu nhập chưa hợp lệ.",
  "fields": {
    "slug": ["Slug chỉ dùng chữ thường, số và dấu gạch nối giữa các nhóm."],
    "pinyin": ["Pinyin cần chữ Latin, dấu thanh hoặc số thanh 0–5; không dùng chữ Hán/emoji."]
  }
}
```

`fields` dùng tên JSON; lỗi nhập có thể trả nhiều trường trong cùng response. Lỗi phiên, quyền, dịch vụ hoặc xung đột không sửa được bằng ô nhập dùng thông báo chung (`fields` có thể null/không có). API không gửi SQL exception hoặc stack trace ra client.

| HTTP | Ý nghĩa |
| --- | --- |
| 400 | Thiếu trường, sai kiểu, rỗng sau trim, quá dài, enum/range/version/UUID sai, JSON hỏng; cấp HSK không có |
| 401 / 403 | Thiếu/sai/hết hạn/thu hồi phiên hoặc thiếu quyền; không tự gán quyền theo body |
| 404 | Không có tài nguyên/đối tượng; route GUID sai định dạng có thể 404 theo route constraint |
| 409 | Email/slug trùng, rowversion cũ, bản ghi đang được dùng, xung đột eventId; không vô hiệu hóa admin cuối |
| 413 | Body vượt 65.536 byte (64 KiB) |
| 429 | Auth vượt 15 yêu cầu/phút/IP trong process |
| 503 | SQL/dịch vụ chưa khả dụng, không xác nhận đã lưu |

## Ma trận API hiện có

Giới hạn chuỗi tính theo ký tự UTF-16 như NVARCHAR. Text nội dung được trim/NFC, mật khẩu giữ nguyên, không tự normalize hoặc trim. Các trường optional có thể bỏ qua/null và được lưu chuỗi rỗng. Không suy rằng server kiểm chứng nội dung ngôn ngữ hoặc danh tính thật chỉ từ validation cú pháp.

| API / trường | Quy tắc |
| --- | --- |
| Register `name` | Bắt buộc, 1–80, không chỉ khoảng trắng, không ký tự điều khiển |
| Auth `email` | Bắt buộc, tối đa 254, địa chỉ hợp lệ, domain có dấu chấm; chưa xác minh email tồn tại/thuộc người nhập |
| Register `password` | 8–128, không chỉ khoảng trắng, không ký tự điều khiển; không ép đổi mật khẩu đã có khi login |
| Login `password` | 1–128, không chỉ khoảng trắng/ký tự điều khiển; credential sai trả thông báo chung |
| Admin `slug` | Bắt buộc, tối đa 100, chữ thường ASCII/số/gạch nối giữa nhóm; trùng trả 409 + lỗi slug |
| Content `status` | `draft`, `published`, `archived` |
| Words `simplified` | Bắt buộc 1–100, ít nhất một ký tự Hán (có hỗ trợ vùng mở rộng); không control/newline |
| Words `pinyin` | Bắt buộc 1–200; chữ Latin/dấu thanh/số thanh 0–5 và dấu phân cách hỗ trợ; hỗ trợ Unicode NFD qua NFC. Không kiểm chứng từng âm tiết hay âm đọc đúng với chữ Hán |
| Words `hanViet` / `meaningVi` | Hán–Việt optional ≤200; nghĩa bắt buộc ≤2000, cho xuống dòng |
| Lessons `title`, `description` | Title bắt buộc ≤200; description optional ≤2000, cho xuống dòng |
| Lessons `levelId`, `sortOrder` | Số nguyên 1..2.147.483.647; nhận JSON number hoặc chuỗi số từ form. levelId phải tồn tại; chặn boolean/array/số thập phân |
| Teachers `displayName`, `headline` | Tên bắt buộc ≤100; chuyên môn optional ≤200 |
| Teachers `bio`, `consultationSchedule` | Optional ≤4000 / ≤1000, cho xuống dòng |
| Users create | displayName 1–80, email/password như đăng ký; tạo learner. Không lấy quyền admin từ đăng ký client |
| Users update | displayName 1–80; role `learner/admin`; status `pending/active/suspended/closed`; chặn tự sửa/đóng tài khoản đang dùng, bảo vệ admin hoạt động cuối |
| Words/Teachers PUT `version` | Bắt buộc Base64 giải mã đúng 8 byte; version cũ 409, ID không còn tồn tại 404 |
| CRUD `id` | ID nội dung là số nguyên dương; user là GUID khác rỗng. Admin xem học của user không tồn tại trả 404 |
| Review `wordId`, `rating` | ID dương của từ published; rating 1..4 |
| Review `eventId`, `durationMs` | UUID khác rỗng; 0..3.600.000 ms. Transaction/idempotency theo user + eventId; retry khác nội dung trả 409 |
| GET / auth session | Role/ownership từ phiên được kiểm chứng, không nhận UserId chủ sở hữu từ body; khóa tài khoản/đổi quyền/logout thu hồi phiên |

Unknown properties không được ghi tự do vào database: lệnh ghi dùng allowlist, role đăng ký luôn learner. Các API đọc hiện có giới hạn kết quả; không thêm API tìm kiếm/phân trang mới trong đợt này.

## Form website

- `ValidatedForm` và primitives tiếp tục kiểm tra required/trim, email, min/max length, min/max/step số, select bắt buộc, lỗi pattern/định dạng và focus trường lỗi đầu.
- Các Input/FormField chưa có giới hạn riêng dùng text/search 200, email 254, password 128, URL 2048, tel 30, textarea 4000; giới hạn riêng trên screen được ưu tiên. Điện thoại cần 7–15 chữ số và chỉ các dấu phân cách thông thường; URL cần HTTP/HTTPS.
- Hồ sơ giữ tên tối đa 80, headline 200, bio học viên 2000/giáo viên 4000, lịch tư vấn 1000; không tự cắt hoặc ghi đè bản nháp cũ.
- Bộ từ giữ tên ≤60, chuẩn hóa khoảng trắng/hoa thường, chặn tên rỗng/trùng. Bài tập giữ 80–120 chữ Hán; chấm bài giữ điểm/range và độ dài nhận xét; auth giữ xác nhận mật khẩu. Settings/onboarding dùng lựa chọn/range có sẵn. Các quy tắc này đã có từ đợt UI và tiếp tục dùng form chung.
- Form đăng nhập/đăng ký và bốn form quản trị nhận `fields` từ API, hiện dưới Input/textarea/select với `aria-invalid`/`aria-describedby`. Giữ giá trị khi lỗi, focus trường đầu; sửa một trường không xóa lỗi server của trường khác; submit lại kiểm tra lại server.
- Đã xử lý trường hợp response về lúc control còn disabled vì đang lưu: không bỏ qua lỗi server và focus sau render. Lỗi trùng slug/email từ SQL cũng được gắn đúng trường.
- Contact/tư vấn/bài tập/chấm bài/hồ sơ nháp/reset email/upload chưa có API đầy đủ: validation chỉ phía client, không giả thành công server. Chọn file/accept extension không thay thế kiểm tra MIME/nội dung/kích thước server khi triển khai upload sau này.

## Xác minh

| Kiểm tra | Kết quả |
| --- | --- |
| Backend build | Đạt, 0 warning/error |
| Unit tests | 79 ca/assertion đạt: scheduler/cache + thiếu/sai kiểu/độ dài từng trường, số, version, Unicode NFD, review/auth |
| HTTP/SQL smoke | Đạt: validation cả 4 tài nguyên, JSON lỗi, review/UUID/ID/cấp HSK sai, user không tồn tại; CRUD, Unicode, duplicate/stale version, FK, quyền/ownership/JWT/refresh/revocation và concurrency/cache hồi quy đạt |
| Swagger HTTP | UI/JSON HTTP 200, đủ endpoint; schema password min 8, POST create 201; body lớn trả 413 |
| Swagger browser | Login 200 → auth/me 200 bằng cookie → request words sai 5 trường trả 400 + fields. Interceptor CSRF hoạt động, không tắt bảo vệ |
| Website browser | Admin gửi Chữ Hán/Pinyin/slug sai: 3 lỗi tại trường, focus simplified, đủ ARIA. Sửa 1 trường giữ 2 lỗi còn lại; sửa đủ lưu thành công. Trùng slug: lỗi ngay ô slug, focus slug |
| Form mẫu browser | Điện thoại abc123 bị chặn/focus đúng; sửa +84 912 345 678 mở preview, không gửi lịch hẹn |
| Frontend | Lint, typecheck trong build, production build đạt; 7 test nháp + 6 test kết quả phiên đạt |

Ảnh trong `docs/ui-validation/api-validation/`. Dữ liệu thử dùng fixture prefix ngẫu nhiên và được cleanup riêng, không clear localStorage hoặc chạm nháp/tài khoản thật. Không claim đã bấm mọi form/mọi tổ hợp đầu vào, kiểm thử tải lớn, screen reader hoặc mọi lỗi hạ tầng. Đây là ma trận các endpoint và form đang có, không phải lời bảo đảm mọi tình huống tương lai đều được bao phủ. Không commit/push.
