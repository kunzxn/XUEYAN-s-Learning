# Hồ sơ, từ điển, Login — kiểm chứng 24/10/2026

Frontend production dùng cổng thử 3110, API cổng 5112. Không dừng ứng dụng của người dùng ở 3000/5108. Tài khoản, ảnh PNG/JPEG và từ kiểm thử là fixture riêng; không xóa localStorage hoặc bản nháp người dùng.

| Màn hình / thao tác | Desktop | Mobile 375 | Cách xác minh |
| --- | --- | --- | --- |
| Login có logo XUEYAN | Đã xem và chụp ảnh | Đã xem và chụp ảnh | Logo thật, Google/email, form, chữ Hán; không tràn ngang |
| Login quay lại từ điển | Đã đọc routing | Đã bấm thành công | `/login?next=%2Fdictionary` → nhập fixture → `/dictionary` |
| Form sai nhiều trường | Code và API | Đã bấm thành công | Email/password trống focus Email; hồ sơ tên trống và goal=2 focus Tên hiển thị; aria-invalid/describedby đúng hai trường |
| Lưu từ `朋友` khi có phiên | API | Đã bấm thành công | Nút chuyển Đã lưu, không mở dialog đăng nhập; sổ từ có 朋友 và reload vẫn còn |
| Tự làm mới access hết hạn | HTTP qua BFF | Cùng cơ chế | PUT lưu từ với access cookie hết hạn + refresh hợp lệ trả 200 và cookie phiên mới |
| Avatar → `/profile` | Đã xem | Đã bấm thành công | Tên/ảnh/email/mục tiêu của fixture; không dùng hồ sơ Hùng mẫu |
| Sửa hồ sơ | Đã xem form và lưu Pinyin | Đã bấm thành công | Sửa tên, tên tiếng Trung, giới thiệu, goal=30, HSK 3; chọn PNG, lưu; header cập nhật tên ngay |
| Ảnh và reload | Đã xem | Đã bấm thành công | PNG được chuyển JPEG 256×256; hai ảnh header/hồ sơ naturalWidth=256; reload giữ tên, ảnh và dữ liệu |
| Pinyin sau cập nhật hồ sơ | Đã bấm thành công | Cùng cơ chế | Bỏ chọn, lưu, mở phiên HSK 1: từ 爱 không hiện dòng ài |
| Xuất thông tin JSON | Chỉ đọc code | Chưa bấm tải file | Blob JSON thông tin cá nhân, không chứa mật khẩu/token; không coi là backup toàn database |
| Phân quyền | API | UI badge Học viên | Giữ learner/admin, không tự cấp admin khi gửi role giả; giáo viên là hồ sơ nội dung |

- Backend smoke mới kiểm tra profile save/reload, avatar bytes và bỏ ảnh, stale conflict 409, dữ liệu nhập sai, UserId/role giả không thay đổi chủ sở hữu/quyền; người khác không nhìn thấy ảnh/sổ từ.
- Sổ từ lưu idempotent; lưu không tạo lượt học; bỏ lưu không xóa tiến độ học. Chỉ dùng bộ mặc định, giữ các bộ khác.
- Lint/typecheck/build frontend và build/unit tests backend qua. NuGet audit có cảnh báo NU1900 do không kết nối được dịch vụ kiểm tra lỗ hổng; không ghi nhận lỗi compile/test.
- Console có cảnh báo Google “origin is not allowed” cho cổng thử 3110 chưa đăng ký; không có lỗi JS ứng dụng khác được ghi nhận trong tab.
- Chưa đăng nhập bằng tài khoản Google thật trong đợt này. Nút Google dùng cấu hình hiện có; origin cổng thử 3110 không dùng để kết luận cấu hình Google Cloud của frontend 3000.
- Các route còn lại của website không được tuyên bố là đã audit lại trong đợt này.

Ảnh: login-desktop.png, login-mobile.png, dictionary-saved-mobile.png, profile-desktop.png, profile-mobile.png, profile-editor-desktop.png.

Chi tiết triển khai: [account-profile-and-dictionary.md](../../account-profile-and-dictionary.md).

Fixture đã được dọn bằng runner sau kiểm thử; chỉ giữ ảnh minh chứng và dữ liệu HSK thật.
