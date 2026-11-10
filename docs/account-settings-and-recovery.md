# Cài đặt, phiên học và khôi phục mật khẩu — 02/11/2026

## Phần đã triển khai

- `/onboarding` và `/settings` dùng `GET/PUT learning/preferences`: mục tiêu 5–100 từ, HSK, mục đích, Pinyin, Hán–Việt, tự phát âm, giờ học và dấu hoàn thành onboarding được lưu SQL. Có optimistic version, lỗi đúng trường, giữ nội dung khi lỗi, tải lại bản server chủ động.
- Không chuyển nháp dùng chung `demo-student` cũ vào tài khoản thật vì không xác định được chủ sở hữu. Không xóa nháp cũ.
- Flashcard tải tùy chọn từ SQL. Pinyin/Hán–Việt theo cài đặt; tự phát âm dùng speechSynthesis khi trình duyệt cho phép, vẫn có nút phát âm tay. Thẻ dùng nút native và focus khi lật/chuyển. Đã bấm Enter/Tab/Shift+Tab và xác minh focus khi lật; chưa xác minh âm thanh phát ra.
- Bản nháp Flashcard theo UserId + learn-level/review. Giữ ID hàng đợi, trang HSK, vị trí, mặt thẻ, event đã lưu và eventId/rating đang retry. Khi khôi phục, lấy lại nội dung từ SQL qua `learning/queue`, xác minh event thuộc tài khoản qua `learning/results`. JSON/schema lỗi hoặc storage không khả dụng không làm trang crash, không báo đã lưu nháp nếu ghi thất bại.
- Phiên hoàn thành vẫn có nút xem kết quả/bắt đầu mới. Phiên trống có hướng chọn HSK/nhóm tiếp theo. Tối đa 20 thẻ để giới hạn phiên và URL tổng kết.
- Thêm migration 011 `auth.PasswordResets`. Token random 256 bit, database chỉ giữ SHA-256, hết hạn 30 phút, tiêu thụ trong transaction serializable, vô hiệu toàn bộ token reset khác và phiên đăng nhập của tài khoản khi đổi mật khẩu. Không tự tạo mật khẩu cho tài khoản Google-only; phản hồi yêu cầu dùng nội dung chung tránh lộ tài khoản tồn tại.
- `/forgot-password` và `/reset-password?token=...` dùng API thật, không nhận demo-success. Validation mật khẩu/xác nhận/link hết hạn, giữ input khi lỗi, chỉ báo đổi xong sau API thành công. Trang token đặt referrer no-referrer.

## Chạy local không có dịch vụ email

Chỉ trong `Development`, khi chưa có `Mail:Host`, backend ghi thư vào `backend/.local/mail-outbox/*.txt`. Sau khi yêu cầu khôi phục tài khoản mật khẩu đang hoạt động, mở thư đúng email trên máy chạy API rồi mở liên kết trong trình duyệt. API không trả token; giao diện ghi rõ đây là thư local, chưa gửi vào hộp thư thật. Thư chứa liên kết bí mật; không đưa thư lên Git hoặc gửi cho người khác. `.local/` đã được ignore.

## Gửi thư thật trên server

Nếu dùng Gmail và tên miền miễn phí Vercel, xem [Gmail hệ thống](gmail-system-email.md) và trình khởi chạy `backend/Start-ApiWithGmail.ps1` nhập App Password ẩn. Sender đã chuẩn hóa tên XUEYAN, xác minh cấu hình TLS/origin và giới hạn gửi lại theo tài khoản.

Đã có SMTP sender trong code. Cần tạo hộp thư/dịch vụ SMTP và cấu hình riêng trên server:

```text
Mail__Host=<SMTP host của nhà cung cấp>
Mail__Port=587
Mail__From=<email gửi đã được nhà cung cấp chấp nhận>
Mail__Username=<SMTP username>
Mail__Password=<SMTP password/API credential theo nhà cung cấp>
Recovery__WebOrigin=https://<tên miền frontend>
```

Sender dùng STARTTLS. Không dùng cổng 465 kiểu implicit TLS. Không lưu credential thật vào source/Git; đặt biến môi trường hoặc secret store. `Production` không có fallback outbox; thiếu cấu hình trả 503. Chưa có tài khoản SMTP nên chưa gửi thư thật/kiểm tra hộp thư bên ngoài, cũng chưa tạo dịch vụ email bên thứ ba.

Máy khác cần chạy runner migration đến 011 trước khi dùng recovery. Máy workspace đã áp dụng 011; không đổi dữ liệu người dùng hiện có.

## Kiểm chứng

- Backend build và smoke hiện có qua (gồm role/JWT/library/profile/SRS).
- `backend/tests/Check-AccountFeatures.ps1`: preferences save/reload, giờ học, hoàn thành onboarding, version conflict, validation, Dashboard goal, SQL queue; mail local, phản hồi chung, token hết hạn/giả/dùng lại, mật khẩu yếu/xác nhận sai, thu hồi phiên cũ và đăng nhập bằng mật khẩu mới: qua.
- `frontend/scripts/test-account-study.mjs`: 3 nhóm test qua; khôi phục vị trí/mặt thẻ/pending event, cách ly người dùng/mode, JSON/schema sai và storage bị chặn. Dùng bộ nhớ riêng, không chạm localStorage người dùng.
- Lint/typecheck/build frontend qua. Browser hoạt động lại: đã bấm lưu cài đặt/reload, onboarding ba bước bằng Enter, học một từ SQL, khôi phục mặt thẻ/vị trí 2/20 sau reload, tổng kết reload và Dashboard 1/40 theo mục tiêu đã lưu. Đã quan sát settings/Flashcard mobile 375×812 và Dashboard desktop 1440×900; Flashcard scrollWidth 360 ≤ viewport 375. Form email trống focus đúng trường; yêu cầu mail local hiển thị đúng trạng thái; link reset sai bị chặn. Không nhập mật khẩu mới qua UI; đổi mật khẩu kiểm thử bằng API. Chưa test screen reader/âm thanh hoặc mọi trạng thái responsive.
- NuGet cảnh báo NU1900 vì mạng audit không truy cập được; không xem là đã kiểm tra lỗ hổng thành công.
- Tài khoản và thư fixture được dọn đúng phạm vi; không xóa dữ liệu thật hoặc toàn bộ localStorage.

## Giới hạn còn lại

Chưa bật nhắc học theo lịch hoặc công khai hồ sơ; UI ghi rõ. Thống kê ngày vẫn theo Việt Nam UTC+7, nên không đưa lựa chọn múi giờ khác lên form này. Bản nháp phiên chỉ tiếp tục được trên cùng thiết bị; dữ liệu kết quả và cài đặt được lưu server. Chưa commit/push các thay đổi.

Ảnh minh chứng: ui-validation/account-settings-recovery/study-resumed-mobile.png và dashboard-synced-desktop.png. Console chỉ ghi cảnh báo GSI origin cổng thử 3113 chưa được cấp trong Google; không thử Google login trong lượt này.
