# Phân quyền không gian — 24/10/2026

Yêu cầu mới bổ sung tài khoản **giảng viên**. Tài liệu này thay thế quyết định hai vai trò của đợt hồ sơ trước đó; không tự chuyển vai trò của tài khoản hiện có.

| Vai trò | Không gian riêng | Không được vào |
| --- | --- | --- |
| learner — Học viên | `/dashboard`, `/learn`, `/my-learning`, bài học/ôn tập, sổ từ, lớp học viên, bài tập học viên, tiến độ, onboarding, thông báo/cài đặt học viên | `/teacher/**`, `/admin/**` |
| teacher — Giảng viên | `/teacher` và các trang con hồ sơ/lớp/bài chấm mẫu | Không gian học viên và `/admin/**` |
| admin — Quản trị viên | `/admin/**` | Không tự đổi chế độ sang học viên/giảng viên |
| Chưa đăng nhập | Trang chủ, HSK công khai, từ điển tra cứu, danh bạ/hồ sơ giáo viên công khai và tài nguyên | Các không gian riêng |

`/profile` và `/profile/edit` là hồ sơ tài khoản dùng chung, lấy dữ liệu của người đăng nhập. Giáo viên có tài khoản riêng **không đồng nghĩa** đã được liên kết với một hồ sơ `classroom.Teachers` hoặc lớp học riêng. Các lớp/chấm bài giảng viên hiện vẫn là bản mẫu, chưa mở quyền sửa dữ liệu thật hoặc dạy mọi lớp.

## Kiểm tra quyền

- Migration 010 mở rộng constraint RoleCode, thêm principal giảng viên chỉ có quyền guest đọc dữ liệu công khai. Không cấp quyền SQL learner/admin cho giảng viên; không thay đổi RLS hiện có.
- Admin chọn Giảng viên tại `/admin/users` → Chỉnh sửa → Vai trò → Lưu. Thay đổi quyền thu hồi phiên cũ; người dùng đăng nhập lại để nhận quyền mới. Đóng tài khoản giữ vai trò lịch sử, không tự hạ giảng viên thành học viên.
- Đăng ký thường/Google vẫn tạo learner. Vai trò không được tin từ URL, body đăng ký, localStorage hoặc JWT tự giải mã ở frontend. JWT phải khớp phiên/user/role còn hiệu lực trong SQL Server.
- API `access/learner`, `access/teacher`, `access/admin` dùng policy riêng, kiểm tra chính xác vai trò; không có ngoại lệ admin xem tất cả các không gian. API learning/library là learner; API quản trị vẫn admin.
- Từng page riêng tư và layout gọi `requireWorkspace` trên server. React cache chỉ khử trùng kiểm tra trong cùng lượt render; fetch quyền không dùng cache công khai. Client gate xử lý thay đổi phiên và tránh hiện thoáng nội dung sai vai trò.
- Proxy chỉ truyền đường dẫn quay lại tin cậy, ghi đè header do client cung cấp. `demo` chỉ đổi trạng thái giao diện **sau** kiểm tra quyền; không mở đường bỏ qua xác thực.
- Chưa đăng nhập → Login, giữ đường dẫn và query. Sai vai trò → `/access-denied` với vai trò thực và nút về không gian của mình. Phiên access hết hạn → route handler làm mới cookie rồi kiểm tra lại; không ghi cookie trong Server Component.
- Bỏ nút chuyển chế độ tự do ở sidebar; menu/CTA công khai dùng không gian tương ứng vai trò. Không biến đổi giao diện Stitch ngoài các điều chỉnh điều hướng và trạng thái quyền.

## Kiểm chứng

- Backend build, smoke auth/CRUD/profile/library/JWT/SRS và ma trận ba vai trò qua. Kiểm tra cấp teacher qua admin, phiên cũ bị thu hồi, teacher không tự nâng quyền admin, teacher không đọc learning/library, common profile vẫn đúng chủ sở hữu, đóng teacher giữ RoleCode.
- Script `backend/tests/Check-WorkspaceRoutes.ps1`: guest vào Dashboard/teacher/các trang con/admin/review demo đều 307 tới Login; `/teachers` công khai vẫn 200. Vai trò đúng 200; sai vai trò 307 tới trang báo quyền. Query `demo`/`role`, header quay lại giả, cookie không hợp lệ không vượt qua guard.
- Access fixture hết hạn + refresh hợp lệ: redirect tới continuation → cookie mới → 200, giữ `?demo=new`.
- Trình duyệt: guest tới Dashboard demo được đưa Login; đăng nhập teacher đi `/teacher` dù next là Dashboard; teacher vào Dashboard bị chặn. Logout rồi login learner vào Dashboard được; learner vào `/teacher` bị chặn; nút quay về đưa đúng Dashboard. Đã xem trạng thái chặn ở desktop/mobile 375px, không tràn ngang.
- Dùng tài khoản thử riêng; không tự cấp teacher cho tài khoản thật. Các fixture được dọn sau kiểm tra, không xóa localStorage/bản nháp.
- Lint/typecheck/build frontend qua. NuGet audit có cảnh báo mạng NU1900; không coi đó là kết quả đã quét lỗ hổng thành công. Không thử đăng nhập Google thật trong đợt này.

Chạy test sau khi smoke đã chuẩn bị fixture và cấp vai trò teacher cho OtherId:

Nếu vừa chạy toàn bộ smoke API, đợi hết cửa sổ giới hạn đăng nhập một phút trước khi chạy script web. Lần chạy liên tiếp gặp 429; chạy riêng sau khi hết cửa sổ đã qua cả kiểm tra refresh. Không thay đổi giới hạn bảo vệ API.

```powershell
.\backend\tests\Check-WorkspaceRoutes.ps1 -Web http://localhost:3000 -Api http://127.0.0.1:5108
```

Máy này đã áp dụng migration 010; máy khác dùng runner migration. Cần khởi động lại cả backend và frontend để có policy/route guard mới. Ảnh minh chứng trong `docs/ui-validation/workspace-roles/`.
