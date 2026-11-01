# Admin / lưu học thật — kết quả 23/10/2026

Phạm vi triển khai và hướng dẫn chạy: [admin-and-learning.md](../../admin-and-learning.md).

| Kiểm tra | Phương pháp | Kết quả |
| --- | --- | --- |
| Frontend lint | ESLint toàn bộ frontend | Đạt, exit 0 |
| Frontend typecheck | `tsc --noEmit` và kiểm tra TypeScript trong build | Đạt |
| Frontend production build | Next.js build, có mạng tải font hiện có | Đạt, exit 0; 44 page route template và API proxy |
| Backend build | .NET 9 / SqlClient | Đạt, 0 warning/error |
| API tích hợp | `dotnet run --project backend/tests/Xueyan.Smoke.csproj` | Đạt trên SQL Server thật; không mock DB |
| SQL regression | Initializer `-RunTests` | Đạt permissions/integrity/admin cuối; đủ 7 migration |
| Bản nháp cũ | `scripts/test-device-drafts.mjs` | 7/7 đạt |
| Admin tạo/sửa từ | Đã bấm trình duyệt, reload rồi mở editor | Dữ liệu chữ Hán/Pinyin/nghĩa giữ đúng, thông báo sau SQL commit |
| Form validation | Đã submit form trống | 4 lỗi gắn với trường, focus Chữ Hán |
| Admin xem tiến độ | Đã tìm learner và mở Từ đã học | Thấy từ và số lượt thực |
| Tạo bài học/giáo viên | Đã bấm mobile | Bài học chọn cấp độ từ DB; giáo viên chỉ là profile |
| Lưu học qua UI | Đã học hai từ, chọn mức ghi nhớ và reload | Hai từ còn trong `/my-learning`, đúng số lượt; ảnh chụp được lưu |
| Người học mở admin | Đã mở route trong browser; API test riêng | UI từ chối; API trả 403 ngay cả khi gọi trực tiếp |
| Mobile | 375×812 | Không tràn ngang toàn trang; admin table xếp dọc, nút edit/delete không bị khuất; rating Quên/Khó/Nhớ/Dễ nằm y≈700–746 trong viewport |
| Desktop | 1440×900 | Sidebar/table/form dùng palette và primitives hiện có |
| Bàn phím | Đã thử Tab/Shift+Tab/Escape trong form admin | Han→Pinyin, trở lại Han, Escape đóng và trả focus nút thêm |
| Console | Công cụ browser ghi warn/error | `[]` trong kiểm tra cuối; không suy ra mọi trạng thái đều không lỗi |
| Cleanup | Test runner cleanup theo ID/email/slug fixture | Không còn user hoặc word/teacher/lesson tiền tố smoke; không xóa dữ liệu ngoài fixture |

## Các tình huống API được kiểm chứng

- Anonymous nhận 401; learner nhận 403 khi đọc/ghi admin.
- Login thật, logout thu hồi phiên, đăng nhập lại vẫn còn từ đã học.
- CRUD Words, Teachers, Lessons; Users create/read/update/đóng tài khoản.
- Đăng ký có `roleCode=admin` vẫn tạo learner; tài khoản không tồn tại đăng nhập bị từ chối.
- Slug trùng và rowversion cũ trả 409, không ghi đè im lặng ở Words.
- Một eventId gửi lại không tăng repetitions hai lần; dùng cùng eventId nhưng đổi rating bị conflict.
- Learner B không thấy dữ liệu học của A; admin đọc theo user hợp lệ.
- Word đã được học không thể hard-delete do FK; word chưa dùng xóa được.

## Bằng chứng

- [Desktop admin](words-desktop.png)
- [Mobile admin](words-mobile.png)
- [Tiến độ người học sau reload](learner-progress-desktop.png)
- [Luồng học mobile](learning-mobile.png)
- [Nhật ký bấm thử](browser-checks.json)

Ảnh là dữ liệu thử đã dọn sau khi kiểm tra, không phải dữ liệu người dùng thật. Chưa bấm thử mọi tổ hợp CRUD của bốn module trên mọi viewport: API tests kiểm tra đủ CRUD; browser tập trung word create/update, lesson/teacher create, xem học tập, auth và các trạng thái chính. Xóa và cấp quyền admin được kiểm tra qua API bằng tài khoản thử, không tác động tài khoản thật.

Chưa kiểm tra trình đọc màn hình, zoom 200%, nhiều tab cập nhật đồng thời, nhiều thiết bị thật, nhiều server hoặc deployment production. Chưa có backend cho các trang mẫu còn lại; không tính chúng là đã kết nối SQL Server.
