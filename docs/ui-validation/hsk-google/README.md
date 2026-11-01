# Kiểm chứng 24/10/2026

Frontend production localhost:3108, API localhost:5108, SQL Server local. Dùng account fixture sinh bởi smoke runner, không dùng tài khoản/bản nháp của người dùng. Các fixture đã dọn bằng runner; giữ 10.939 mục từ HSK đã import.

| Màn hình / luồng | Desktop 1440 | Mobile 375 | Thao tác / kết quả |
| --- | --- | --- | --- |
| `/vocabulary` | Đã xem, ảnh catalog-desktop.png | Responsive qua cùng layout; chưa chụp riêng danh mục mobile | Mở danh mục, 7 nhóm và số lượng SQL đúng; bấm HSK 1 |
| `/vocabulary/hsk-1` | Đã xem | Đã xem, ảnh hsk-mobile.png | Bấm trang sau, tìm 爱 bằng Enter → 2 kết quả và về trang 1; link học có level=1 |
| `/account/login` | Đã xem và đăng nhập fixture | Đã xem; chưa submit ở mobile | Google thông báo chưa cấu hình; email/password đăng nhập thành công |
| `/learn?level=1` | Chưa đối chiếu ảnh desktop riêng | Đã bấm | Chữ 爱, Pinyin ài, lật thẻ có nghĩa EN; chọn Nhớ → từ 爱好; thông báo lưu thật |
| `/my-learning` | Đã xem sau login | Đã xem, ảnh progress-mobile.png | Từ 爱 có 1 lượt học; reload vẫn còn cùng nghĩa EN và số lượt |

- Mobile DOM: scrollWidth bằng clientWidth (360px phần nội dung trong viewport 375px có thanh cuộn); các nút tìm/nghe có chiều cao 46px.
- Menu mobile mở/đóng được; Escape đóng menu, aria-expanded về false. Nút Google mobile disabled và ghi rõ chưa cấu hình, không tràn ngang.
- Đã quan sát ảnh desktop và mobile. Chữ Hán danh sách tăng lên 28px trong lần hoàn thiện cuối; giữ Pinyin và màu hiện có.
- Console của tab sau luồng học/reload: không ghi nhận error. Không kiểm thử giọng đọc bằng tai.
- Google thật **chưa bấm thành công** vì workspace chưa có OAuth Client ID. Đã test crypto bằng RSA fixture riêng và mapping repository local; không coi fixture là xác thực Google thật.
- API: đủ 7 nhóm, số lượng trùng nguồn TSV; tìm chữ Hán/empty, phân trang và validation lỗi. Import chạy lại không nhân đôi; giữ thứ tự nguồn. HTTP smoke auth/CRUD/ownership/JWT/refresh/SRS/cache và Google subject/email conflict đều qua.
- Frontend lint/typecheck/build và backend build/unit tests qua. Không kết luận đã kiểm tra lại toàn bộ các trang ngoài phạm vi thay đổi.

Chi tiết triển khai, số lượng và cấu hình: [hsk-and-google.md](../../hsk-and-google.md).
