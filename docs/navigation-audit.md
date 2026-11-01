# XUEYAN — kiểm tra luồng điều hướng (2026-10-02)

## Phạm vi và cách đọc kết quả

38 route template đã triển khai. Dùng Next Link/useRouter, không đổi framework hoặc thiết kế. Đọc AGENTS.md và tài liệu Next hiện cài trước khi sửa. Backend/auth/phân quyền hiện chưa có; không tạo phiên đăng nhập hoặc bỏ qua một guard nào. Chế độ giáo viên hiện chỉ là giao diện mẫu công khai, chưa có kiểm soát quyền thật.

- **Đã bấm thử**: đã xác nhận URL và màn hình bằng trình duyệt localhost.
- **Code/HTTP**: đã đọc xử lý và kiểm tra route; chưa bấm toàn bộ biến thể của điều khiển đó.
- **Bị chặn**: thiếu nội dung/màn hình/API; bấm nhận phản hồi rõ ràng, không giả báo thành công.

## Route đã triển khai

- `/`
- `/about`
- `/assignments/4`
- `/classes`
- `/classes/hsk2-k24`
- `/collection`
- `/collection/[id]`
- `/contact`
- `/dashboard`
- `/dictionary`
- `/forgot-password`
- `/help`
- `/lessons/1`
- `/lessons/1/learn`
- `/lessons/1/practice`
- `/login`
- `/notifications`
- `/onboarding`
- `/profile`
- `/profile/edit`
- `/progress`
- `/register`
- `/reset-password`
- `/resources`
- `/resources/remember-vocabulary`
- `/review`
- `/review/study`
- `/review/summary`
- `/settings`
- `/teacher`
- `/teacher/assignments/4`
- `/teacher/classes/hsk2-k24`
- `/teacher/profile`
- `/teachers`
- `/teachers/[id]`
- `/teachers/[id]/consultation`
- `/vocabulary`
- `/vocabulary/[level]`

Dynamic ID hợp lệ: HSK `hsk-1` … `hsk-6`, `hsk-7-9`; giáo viên `lan-anh`, `minh-duc`, `cam-tu`, `vuong-tuan`, `mai-phuong`, `quoc-bao`; từ `xuexi`, `pengyou`, `xiexie`, `gongzuo`, `shijian`, `nihao`. Nội dung bài học chỉ có bài `1`; lớp chỉ có `hsk2-k24`; bài tập chỉ có `4`, bản chấm mẫu Nguyễn Minh Khang.

## Bảng kiểm tra

| Màn hình | Nút/liên kết | Đích hoặc hành động | Trạng thái |
|---|---|---|---|
| Dashboard | Lộ trình HSK | /vocabulary | Đã bấm thử |
| HSK 1 | Tiếp tục học, Xem bài học | /vocabulary/hsk-1 → /lessons/1 | Đã bấm thử |
| Bài 01 | Học từ vựng | /lessons/1/learn | Đã bấm thử |
| Học từ mới | Từ tiếp theo, luyện tập từ này | Tiến thẻ; /lessons/1/practice?word=pengyou | Đã bấm thử, đúng từ sau reload |
| Luyện tập | Chọn nghĩa, tiếp tục, thoát | Đáp án/điểm trong phiên; câu tiếp theo; /lessons/1 | Đã bấm thử, bắt đầu câu 1/6 |
| Học 6 từ | Hoàn thành, Về bài học 01 | /review/summary?source=lesson-1&count=6 → /lessons/1 | Đã bấm thử |
| Dashboard/Ôn tập | Ôn đến hạn, chọn 3 từ, bắt đầu | /review → /review/study?limit=3 | Đã bấm thử |
| Flashcard ôn | Hiện đáp án, Nhớ | Lật thẻ, tiến qua 3 từ, /review/summary?source=review&count=3 | Đã bấm thử |
| Tổng kết ôn | Về Dashboard, ôn lại | /dashboard; giữ limit của bộ phiên mẫu | Dashboard đã bấm; link ôn lại kiểm tra code/HTTP |
| Từ điển/Sổ từ | 朋友, Ôn tập từ này | /collection/pengyou → /review/study?word=pengyou | Đã bấm thử, đúng 朋友 và phiên 1 từ |
| Phiên ôn từ đơn | Thoát phiên học | Dialog; thoát dự phòng /collection/pengyou | Đã bấm thử sau reload |
| Header | Từ điển | /dictionary, aria-current=page | Đã bấm thử; sửa đích HSK sai |
| Logo | Trang chủ | / | Đã bấm thử header; logo sidebar/footer kiểm tra code/HTTP |
| Avatar/Hồ sơ | Hồ sơ, chỉnh sửa, quay lại | /profile → /profile/edit → /profile | Đã bấm thử |
| Menu mobile học viên | Hồ sơ, trang chỉnh sửa | Đóng sidebar; active Hồ sơ ở /profile/edit | Đã bấm thử 375px |
| Menu mobile công khai | Giáo viên | /teachers, đóng menu | Đã bấm thử 375px |
| Danh bạ giáo viên | Xem hồ sơ | /teachers/{đúng ID} | Đã bấm thử cả 6 giáo viên |
| Hồ sơ giáo viên | Đăng ký tư vấn, quay lại | /teachers/{ID}/consultation → đúng hồ sơ → danh bạ | Đã bấm thử cả 6 |
| Tư vấn | Submit form | Kiểm tra form, dialog chưa gửi | Code/HTTP; đặt lịch bị chặn API |
| Login/Register/Forgot | Đăng ký, quay lại, quên mật khẩu | /register → /login → /forgot-password | Đã bấm thử |
| Quên mật khẩu | Yêu cầu khôi phục | Báo dịch vụ xác thực chưa kết nối | Đã bấm thử submit; bị chặn API |
| Login/Register/Reset | Submit, Google, hiện mật khẩu | Validation; chưa có phiên/email/đổi mật khẩu | Code/HTTP; bị chặn API/tài khoản |
| Không gian giáo viên | Quản lý lớp K24 | /teacher/classes/hsk2-k24 | Đã bấm thử |
| Quản lý K24 | Bài tập & Chấm bài | Đổi tab; mở đúng bài 04 của Minh Khang | Đã bấm thử |
| Chấm bài | Ghi âm, Kiểm tra & Gửi | Đổi tab thiếu file; báo chưa gửi do thiếu API | Đã bấm thử |
| Hồ sơ giáo viên | Avatar, quay lại | /teacher/profile → /teacher | Đã bấm thử |
| HSK 2+ / Chuyên đề 2+ | Bắt đầu/Xem bài | Dialog báo thiếu nội dung; không mở bài HSK 1 | HSK 2 đã bấm; các biến thể kiểm tra code |
| Dashboard mua sắm HSK 2 | Tiếp tục bài học | Dialog thiếu trang bài mua sắm | Đã bấm thử; bị chặn màn hình/nội dung |
| Lớp K18, lớp K12/K09, bài của Yến/Khoa | Xem/Quản lý/Chấm | Dialog nêu đúng đối tượng thiếu | Code/HTTP; bị chặn màn hình/dữ liệu |
| Giáo viên Minh Quân/Chen Wei trên trang chủ | Xem hồ sơ | Dialog hồ sơ chưa có; không tráo sang giáo viên khác | Code; bị chặn dữ liệu |
| HSK trên trang chủ | Xem chi tiết từng nhóm | HSK 1, 3, 4, 6 tương ứng | Code/HTTP |
| Lớp học viên | Tabs, bài tập, vào lớp | Đổi tab; /assignments/4; dialog thiếu phòng học | Code/HTTP |
| Sổ từ / Hồ sơ / Cài đặt | Tạo bộ, preview, lưu nháp | Dialog, state phiên, localStorage có thông báo | Code; không đồng bộ server |
| Thông báo | Chi tiết, đánh dấu đã đọc, filter | Đúng review/assignment/class/progress/settings; state phiên | Code/HTTP |
| Tài nguyên / Bài viết | Đọc, PDF/audio, mục lục, đánh dấu | Đúng route; dialog thiếu file; anchor có đích; state phiên | Code/HTTP |
| Help / Contact / About | Topic, FAQ, form, reset, CTA | Route có thật, mở details, validation chưa gửi, reset form | Code/HTTP |
| Onboarding | Tiếp tục, quay lại, lưu nháp, bỏ qua | Đổi bước; local draft; /dashboard?demo=new | Code/HTTP |

## Sửa cụ thể

- Không còn chuyển các chuyên đề/cấp HSK/lớp/bản nộp khác nhau sang cùng một nội dung không khớp.
- Số từ ôn thực sự điều khiển phiên và danh sách xem trước (3 hoặc 6 từ mẫu).
- Truyền ID từ đến luyện tập/ôn từ đơn; tổng kết giữ nguồn bài học/ôn tập, số từ và ID cho ôn lại.
- Thoát học mở dialog; luyện tập quay lại bài 01; các breadcrumb/back dùng đích cụ thể nên mở trực tiếp vẫn có đường quay lại.
- Luyện tập bắt đầu ở câu đầu tiên, không bỏ qua từ 1.
- Sidebar/mobile active cho trang con, bài học thuộc HSK và bài tập thuộc lớp; header Từ điển đúng route.
- Sidebar logo/help/settings/chuyển chế độ đều đóng menu. Dialog trong menu không bị focus trap của sidebar tranh focus.
- Button native đều khai báo type, tab và quick phrase không vô tình submit form.
- Thông báo đánh dấu từ trang chủ nói rõ lưu trên thiết bị, không tuyên bố sổ từ server đã cập nhật.

## Kiểm tra

- Static inventory: 220 khai báo điều khiển, 0 lỗi placeholder href/nút không handler/type. Bao gồm component cũ còn nằm trong repo; không coi chúng là route. Phân loại chi tiết trong `ui-validation/navigation-inventory.json` (phân loại AST là sơ bộ, bảng trên là kết luận đã đọc handler).
- HTTP route audit: 66 route/liên kết/query hợp lệ; 8 ID/query không hợp lệ trả 404 chủ động. Không có 404 ngoài các negative test.
- Browser Back đã trở lại trang bài 01; reload practice giữ word ID, reload ôn từ đơn giữ từ; trạng thái tiến thẻ trong phiên có thể bắt đầu lại vì chưa có persistence.
- Console ở các luồng bấm thử: không ghi nhận error/warn liên quan điều hướng.
- Lint, typecheck và production build: PASS.
- Không khẳng định mọi điều khiển đều đã bấm: các hàng Code/HTTP vẫn cần QA thao tác toàn bộ biến thể. Backend thực, auth/phân quyền, giáo trình còn thiếu, nhiều lớp/bản nộp, quản lý tư vấn, PDF/audio và hồ sơ giáo viên cũ vẫn là các blocker có thật.

Chạy lại: `npm run check:navigation`, `npm run check:routes -- http://127.0.0.1:3101`, `npm run lint`, `npm run typecheck`, `npm run build` trong frontend.
