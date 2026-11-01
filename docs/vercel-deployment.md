# Đưa frontend XUEYAN lên Vercel

Repository gồm frontend Next.js, backend ASP.NET Core và dữ liệu HSK. Vercel project dùng thư mục `frontend`; không đưa backend .NET hoặc SQL Server vào build Next.js.

## Import repository

1. Trên Vercel, Add New → Project → import `kunzxn/XUEYAN-s-Learning`.
2. Chọn nhánh chứa code mới. Bản chuẩn bị lần này ở `codex/prepare-vercel`; không chọn `main` cũ nếu chưa merge. Có thể đặt Production Branch trong Settings → Git.
3. Root Directory: `frontend`. Framework Preset: Next.js.
4. Install Command: `npm ci`. Build Command: `npm run build`. Output Directory để mặc định Next.js.
5. Environment Variables: đặt `XUEYAN_API_URL` thành URL HTTPS của backend đã triển khai, không có dấu `/` ở cuối, cho đúng môi trường Preview/Production cần dùng. Không dùng localhost: địa chỉ đó trên Vercel không trỏ về máy cá nhân.
6. Deploy rồi kiểm tra trang công khai, tải lại trang con và ảnh logo. Sau khi API hoạt động, kiểm tra đăng nhập, vai trò, lưu từ, tiến độ và hồ sơ.

`XUEYAN_API_URL` chỉ dùng phía server. Không đưa khóa JWT, mật khẩu SQL hoặc thông tin admin vào biến `NEXT_PUBLIC_*`. Khi sửa biến môi trường, redeploy để áp dụng.

## Backend cần triển khai riêng

Frontend gọi API qua `/api/backend/*` và kiểm tra quyền từ server. Backend chưa truy cập được từ Vercel thì đăng nhập/lưu dữ liệu không hoạt động; upload giao diện không làm API cục bộ trở thành API online.

Backend production cần cấu hình kết nối SQL Server, khóa `Jwt__SigningKey` riêng theo yêu cầu trong code, `Google__ClientId`, tài khoản runtime với quyền phù hợp, migration và dữ liệu HSK. Cập nhật Authorized JavaScript origins Google theo origin HTTPS thật của frontend. Không chạy môi trường Development để mở Swagger trên Internet; nếu cần Swagger production, triển khai bảo vệ riêng.

Các trang riêng tư vẫn bắt buộc đúng vai trò; không bỏ guard hoặc biến query demo thành cách vượt đăng nhập khi deploy. Nội dung giảng viên chưa có backend vẫn là bản mẫu.

## File không đưa lên Git

`.env*` (trừ mẫu), khóa riêng, chứng chỉ chứa private key, `.vs/`, `.vercel/`, `node_modules/`, `.next/`, output .NET và `backend/.local/` đã được ignore. Database người dùng và tài khoản thử không nằm trong source; schema/migration được giữ trong `backend/database/sqlserver/`. Giữ `frontend/dashboard.html` và thiết kế gốc trong `design-reference/`.

Tài liệu: https://vercel.com/docs/monorepos và https://vercel.com/docs/environment-variables.
