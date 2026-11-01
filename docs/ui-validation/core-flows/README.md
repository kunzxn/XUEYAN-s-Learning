# Kiểm thử luồng chính bằng website — 23/10/2026

Ưu tiên theo yêu cầu: đăng ký, đăng nhập, học thử, học theo tài khoản, tiến độ và quản trị cơ bản. Bấm trên **production frontend `http://localhost:3106`**, API local `127.0.0.1:5108`, SQL Server `XUEYAN_Development`. Desktop 1440×1000 và mobile 375×812. Không coi đây là chứng nhận mọi trang đã hoàn thiện.

## Kết quả bấm thử

| Luồng | Thao tác / đích | Kết quả |
| --- | --- | --- |
| Đăng ký thật | `/register`: tên, email thử riêng, mật khẩu + xác nhận | Tạo tài khoản learner, thông báo đúng; password được xóa khỏi form sau thành công |
| Đăng nhập sai | `/account/login`: email vừa tạo, mật khẩu sai | Bị từ chối, thông báo email/mật khẩu hoặc trạng thái không hợp lệ |
| Đăng nhập đúng | Tài khoản vừa đăng ký → `/my-learning` | Hiển thị đúng tên và 0 từ ban đầu |
| Admin tạo nội dung | `/admin/words`: tạo 学习/xuéxí và 朋友/péngyou, xuất bản | Hai bản ghi thật; chữ Hán/Pinyin/nghĩa đúng |
| Admin sửa nội dung | Sửa nghĩa 学习, lưu rồi reload | Bản sửa vẫn giữ; người học nhận đúng nghĩa mới |
| Học theo tài khoản | `/learn`: mở nghĩa, đánh giá Nhớ/Khó hai từ | Có phản hồi đã lưu; `/my-learning` có hai từ, mỗi từ một lượt |
| Dữ liệu bền vững | Reload, đăng xuất rồi đăng nhập lại | Vẫn hai từ đã học; tìm `学习` chỉ ra đúng một từ |
| Cách ly tài khoản | Đăng nhập người học thứ hai | 0 từ, không thấy hai từ của tài khoản mới |
| Phân quyền màn hình | Người học mở `/admin` | Thông báo không có quyền, không hiển thị bảng quản trị |
| Admin xem tiến độ | `/admin/users`: tìm tài khoản mới → Từ đã học | Đúng hai từ và số lượt tương ứng; ảnh `admin-learner-progress.png` |
| Mobile học thật | Login ở 375px, `/learn`, mở nghĩa và đánh giá thêm 学习 | Nút rating cao 46px, nằm khoảng y=692–738 trong viewport 812px; không tràn ngang. Sau reload 学习 có 2 lượt, 朋友 có 1 lượt |
| Đăng xuất | Logout rồi mở lại `/my-learning` | Không hiển thị dữ liệu tài khoản; yêu cầu đăng nhập lại |
| Khách học thử | Trang chủ → Học thử Bài 01 → học từ → Ẩn Pinyin → Luyện từ này → trả lời đúng → tổng kết | Đúng route và dữ liệu: 1/1, 10 điểm, không có từ sai. Đây là phiên mẫu trong tab, không phải tiến độ SQL |
| Từ điển mẫu | `/dictionary`, tìm `xue2xi2` | Một kết quả 学习/xuéxí, link chi tiết `/collection/xuexi` |
| Phát âm | Bấm Nghe phát âm 学习 | Đã bấm, không thấy lỗi UI ngay lúc thử; chưa xác minh âm thanh nghe được hoặc thanh điệu thực tế |

## Đối chiếu SQL và dữ liệu thử

`sql-verification.txt` xác nhận **1 tài khoản đăng ký, 2 WordProgress và 3 ReviewEvent** sau lần học thêm trên mobile. Đây là truy vấn read-only giới hạn đúng email fixture, không suy kết quả từ UI/mock.

Chuẩn bị tài khoản admin/learner thử riêng bằng `backend/tests --prepare-ui`; tài khoản người học chính được **tạo bằng form website**, không seed thay bước đăng ký. Các record đều có prefix ngẫu nhiên của smoke fixture. Hai từ được tạo và sửa bằng UI, không chèn SQL thay thao tác giao diện. Không sửa tài khoản hoặc nháp localStorage của người dùng.

Sau kiểm thử, cleanup chỉ xóa các ID/email/slug thuộc fixture; không clear database hoặc localStorage. Bộ fixture hỗ trợ thêm chế độ chuẩn bị UI và cleanup email `-browser@example.invalid`; không thay đổi source sản phẩm trong đợt chỉ kiểm thử này. Build bộ hỗ trợ kiểm thử đạt, 0 warning/error.

Cleanup đã chạy thành công. `console.json` không có warn/error được công cụ ghi nhận trong phiên browser này; không suy rằng mọi trạng thái hoặc mọi API đều đã được kiểm thử.

## Giới hạn

- Học lưu thật đang ở `/learn` và `/my-learning`. Dashboard, HSK/Bài 01, từ điển/sổ từ mẫu vẫn chưa nối toàn bộ với tài khoản; được ghi rõ trên giao diện. Website chưa hoàn thiện toàn bộ nghiệp vụ chỉ vì các luồng trên đạt.
- Chưa bấm xóa vĩnh viễn, đổi quyền/đóng tài khoản, quản lý bài học/giáo viên trong vòng browser này; kết quả CRUD/API đợt trước nằm ở `docs/admin-and-learning.md` và `docs/backend-improvements.md`, không gộp thành thao tác đã bấm hôm nay.
- Chưa thử email xác minh/khôi phục mật khẩu, Google login, upload, thanh toán, bài nộp/chấm bài hoặc lớp học thật; các dịch vụ này chưa triển khai đầy đủ.
- Chưa kiểm thử tải lớn, thiết bị cảm ứng thật, screen reader hoặc nghe/đánh giá giọng đọc. Console có thể có HTTP 401 dự kiến từ ca mật khẩu sai và mở trang sau logout; ghi riêng trong `console.json`.
- Đã hoàn thành các luồng chính nêu trên, không phát hiện lỗi chặn thao tác trong phạm vi thử. Không commit/push.
