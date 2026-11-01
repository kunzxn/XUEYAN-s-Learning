# Hồ sơ tài khoản, lưu từ điển và Login — 24/10/2026

> Cập nhật sau yêu cầu mới 24/10/2026: thêm tài khoản giảng viên và chặn đúng vai trò tại các không gian. Xem [phân quyền không gian](workspace-role-access.md); quyết định hai vai trò trong phần lịch sử dưới đây đã được thay thế.

## Phạm vi đã chốt

- Giữ hai vai trò tài khoản: **learner / admin**. Giáo viên là hồ sơ nội dung do admin quản lý; không thêm vai trò giáo viên hoặc cho người dùng tự chọn quyền khi đăng ký.
- Avatar dẫn tới `/profile`. Hồ sơ và ảnh là dữ liệu thật của tài khoản, không dùng hồ sơ Nguyễn Văn Hùng mẫu nữa.
- Lỗi “lưu trữ bắt đăng nhập” ở `/dictionary` là do nút cũ mở dialog mẫu có link đăng nhập cố định, chưa thực hiện lưu từ.

## Các màn hình

| Route | Kết quả |
| --- | --- |
| `/profile` | Xem tên, tên tiếng Trung, ảnh, email, giới thiệu, mục tiêu và số từ có lượt học; xuất thông tin JSON |
| `/profile/edit` | Cập nhật thông tin và ảnh, báo lỗi tại trường; lưu thành công mới hiện thông báo; giữ giá trị khi lỗi |
| `/dictionary` | Tra từ SQL Server theo chữ Hán, Pinyin có số/không dấu và nghĩa có sẵn; lưu vào sổ từ khi có phiên hợp lệ |
| `/collection` | Sổ từ đã lưu thật, tải lại vẫn còn; bỏ lưu được; không coi từ đã lưu là từ đã học |
| `/login`, `/account/login` | Logo XUEYAN thật, bố cục minh họa chữ Hán, Google/email, ẩn/hiện mật khẩu; quay lại route yêu cầu đăng nhập |
| `/register`, `/account/register` | Chung giao diện thương hiệu; đăng ký vẫn tạo learner, không tự cấp quyền |

Các bản từ điển/sổ từ cũ vẫn có thể xem bằng query `?demo=1`; không dùng bản xem trước để báo đã lưu lên tài khoản. Các trang bài học/lớp/giáo viên mẫu không được tự biến thành chức năng backend thật trong đợt này.

## Lưu trữ và bảo vệ dữ liệu

- Migration `009-user-profile`: bảng ảnh `learning.AvatarImages`, view `learning.MySavedWords`. Không xóa dữ liệu hay thay đổi vai trò tài khoản hiện có.
- Ảnh JPG/PNG/WebP đầu vào tối đa 2 MB được trình duyệt cắt vuông và mã hóa lại thành JPEG 256×256. Backend kiểm tra JPEG, kích thước tối đa 512×512 và dung lượng 24 KiB. Lưu binary trong SQL, không lưu ảnh vào localStorage, không chép vào public/data.
- API ảnh chỉ trả ảnh của người đang đăng nhập, `image/jpeg` + `nosniff` + `private/no-store`. Proxy chuyển binary đúng kiểu và giữ cookie HttpOnly.
- Hồ sơ cập nhật qua Controller → Service → Repository, phiên/ID lấy từ backend. Các trường role/email/userId gửi thêm không làm thay đổi quyền hay hồ sơ người khác. Kiểm tra rowversion của hồ sơ và tùy chọn trong cùng transaction; xung đột trả 409.
- Nút Xuất thông tin tải JSON thông tin cá nhân và mục tiêu hiện có. Đây không phải bản sao đầy đủ ảnh, lịch sử học hoặc bản backup database; chưa có chức năng import/khôi phục JSON.
- Từ điển lưu idempotent vào bộ mặc định “Từ đã lưu”, không đụng các bộ khác. API lấy UserId từ phiên, áp dụng RLS khi đọc/ghi sổ từ; không ghi tiến độ học giả khi lưu từ.
- `auth/session` cho header dùng chung. Cập nhật hồ sơ làm mới tên/ảnh ở header và lời chào Dashboard; Pinyin khi học từ dùng tùy chọn đã lưu. Access token hết hạn được BFF refresh rồi thử lại một lần; lỗi dịch vụ không bị biến thành thao tác đăng xuất.

## Kiểm chứng

- Backend build và smoke auth/CRUD/JWT/ownership/SRS/cache qua với fixture riêng trên cổng 5112. Kiểm tra thêm hồ sơ lưu/reload, tên cập nhật trong session, ảnh trả đúng binary, hồ sơ khác không đổi, input sai và stale version bị từ chối; payload giả role/admin và UserId khác bị bỏ qua.
- Sổ từ: tìm `xue2xi2`, lưu hai lần chỉ một từ, reload còn từ, tài khoản khác không thấy, bỏ lưu được.
- HTTP qua BFF: access cookie hết hạn + refresh hợp lệ → PUT lưu từ trả 200 và cookie phiên mới; không yêu cầu nhập mật khẩu lại.
- Trình duyệt: Login quay lại `/dictionary`; bấm lưu `朋友` hiện Đã lưu, mở sổ thấy từ; avatar mở hồ sơ đúng; sửa tên/giới thiệu/mục tiêu/chọn ảnh PNG, lưu xong header đổi tên; mở lại và reload hồ sơ còn dữ liệu.
- Mobile 375px: logo hiển thị; form sai hai trường focus tên đầu tiên, lỗi có aria-invalid/aria-describedby; ảnh riêng trong header/hồ sơ tải thành công, không tràn ngang ở màn hình đã đo.
- Kiểm tra build/lint/typecheck và các ảnh minh chứng: `docs/ui-validation/profile-dictionary-login/`.
- Google UI vẫn dùng Client ID hiện có. Không tuyên bố đã đăng nhập bằng tài khoản Google thật; các lần bấm đăng nhập trong kiểm thử này dùng fixture email/password riêng.

Máy này đã áp dụng migration. Máy khác chạy runner migration, rồi khởi động lại backend/frontend để nhận API và UI mới. Không tự commit/push.
