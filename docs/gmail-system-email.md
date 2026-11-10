# Email XUEYAN qua Gmail

Không cần mua tên miền để dùng Gmail gửi email hệ thống. Website có thể dùng `*.vercel.app`. Người nhận thấy **XUEYAN <địa-chỉ-Gmail-thật>**; tên hiển thị XUEYAN không biến Gmail thành địa chỉ `no-reply@xueyan...`.

## Chạy local và gửi thư thật

1. Bật 2-Step Verification cho Gmail, tạo App Password dành riêng cho XUEYAN. Nếu tài khoản không cho tạo App Password, kiểm tra hạn chế tài khoản/Workspace hoặc dùng nhà cung cấp SMTP khác.
2. Dừng API cũ nếu đang chiếm cổng 5108. Trong thư mục gốc dự án chạy:

```powershell
.\backend\Start-ApiWithGmail.ps1
```

Script hỏi Gmail và App Password bằng input ẩn. Không nhập mật khẩu đăng nhập Google, không gửi App Password qua chat. Không lưu credential vào source hoặc file cấu hình. Chúng chỉ tồn tại trong process đang chạy; khi dừng, script khôi phục biến môi trường cũ.

3. Chạy frontend, mở `/forgot-password`, nhập email của một tài khoản mật khẩu đang hoạt động do bạn quản lý. Kiểm tra hộp thư và thư rác, mở liên kết, đặt mật khẩu mới, đăng nhập lại. Thư không được gửi cho tài khoản Google-only hoặc email không tồn tại; thông báo luôn chung.

Nếu frontend local dùng cổng khác, truyền đúng origin:

```powershell
.\backend\Start-ApiWithGmail.ps1 -WebOrigin http://localhost:3001
```

## Khi triển khai

Backend .NET vẫn chạy riêng Vercel. Đặt các biến dưới đây trên **backend host**, không đặt vào NEXT_PUBLIC hoặc frontend:

```text
Mail__Host=smtp.gmail.com
Mail__Port=587
Mail__From=<Gmail gửi thư>
Mail__Username=<cùng Gmail đó>
Mail__Password=<App Password>
Recovery__WebOrigin=https://<project>.vercel.app
```

Liên kết lấy từ origin được cấu hình, không lấy từ request của người dùng. SMTP dùng STARTTLS, kiểm tra chứng chỉ mặc định và hủy sau 15 giây. Thiếu cấu hình, email gửi không hợp lệ, giả địa chỉ Gmail, origin có userinfo/path/query hoặc cổng không hỗ trợ đều bị từ chối. Thất bại gửi thư thu hồi token vừa tạo; không báo đã gửi thành công.

Mỗi tài khoản nhận tối đa một yêu cầu mới trong 60 giây và tối đa 5 yêu cầu/giờ, có transaction khóa theo tài khoản để chống gửi đồng thời; vẫn giữ giới hạn theo IP của auth. UI có thời gian chờ gửi lại. Token đã hết hạn không chặn lần gửi mới trong giới hạn theo giờ.

## Trạng thái xác minh

Code SMTP, cấu hình, cooldown và toàn bộ reset local có thể kiểm tra độc lập với Gmail thật. Chưa có Gmail/App Password trong môi trường workspace nên chưa xác minh gửi/nhận thư thật. Không dùng connector Gmail của tài khoản cá nhân thay cho SMTP ứng dụng.

Đã chạy unit tests cấu hình, smoke API và Check-AccountFeatures: cooldown 60 giây, hạn mức 5/giờ, phản hồi chung, token hết hạn/giả/dùng lại, đổi mật khẩu và thu hồi phiên: qua. Lần chạy ngay sau smoke bị 429 theo IP; chạy lại sau cửa sổ giới hạn đã qua, không bỏ rate limit. Script Gmail đã qua PowerShell parser; không chạy tương tác khi chưa có credential. Frontend lint/typecheck/build qua. Thư và tài khoản fixture đã dọn; chưa commit/push.

Nguồn: [Google App Passwords](https://support.google.com/accounts/answer/185833), [Gmail SMTP](https://support.google.com/mail/answer/7104828), [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
