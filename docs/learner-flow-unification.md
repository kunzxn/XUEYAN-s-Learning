# Hợp nhất dữ liệu học viên — 02/11/2026

## Đã triển khai

| Route | Nguồn dữ liệu / hành vi |
| --- | --- |
| `/dashboard`, `/review` | `learning/overview`: tổng từ có lượt học, từ published đến hạn, từ ôn hôm nay, từ học lần đầu hôm nay, mục tiêu Preferences, chuỗi ngày thực |
| `/vocabulary`, `/vocabulary/hsk-{level}` | Danh sách HSK từ SQL hiện có, CTA sang `/learn?level=...` |
| `/learn?level=...` | Từ published theo HSK, bỏ từ đã có lượt học, tối đa 20 thẻ/phiên; nhóm tiếp theo khi trang catalog hết từ mới |
| `/review/study` | `learning/due`, tối đa 20 thẻ đến hạn; không dùng demoWords |
| `/review/summary?events=...` | Đọc lại tối đa 20 lượt thực từ SQL, kiểm tra chủ sở hữu; reload URL giữ kết quả |
| `/progress`, `/my-learning` | Cùng component và API `learning/progress` |
| `/lessons/1`, `/lessons/1/learn`, `/lessons/1/practice` | Redirect có kiểm tra learner sang học HSK 1 thật; không giả là bài học SQL đã có nội dung |

Query demo không đổi dữ liệu của các route trên. Các imports ConnectedLearning/LearnerDashboard cũ cũng trỏ về màn hình thật. Giữ primitives, layout, màu sắc chung và guard learner. Bỏ nhãn streak 7 ngày cố định ở header; màn hình thật không có banner bản xem trước. Các trang lớp học/cài đặt và demo ngoài phạm vi vẫn giữ nhãn tương ứng.

## Lưu và thống kê

- Lưu từng thẻ qua API reviews hiện có. Chỉ chuyển thẻ khi API thành công; chống nhấn đồng thời. Lỗi mạng giữ nguyên eventId/rating/duration để retry idempotent, không phát sinh lượt thứ hai nếu server đã ghi nhưng mất response.
- Kết quả hiển thị mức tự đánh giá Quên/Khó/Nhớ/Dễ, không gọi đó là điểm chính xác. SRS dùng scheduler hiện có.
- Kết quả lấy theo event UUID, không nhận UserId từ client. Endpoint bắt buộc learner; UUID sai/thiếu/thuộc tài khoản khác bị từ chối. Không lưu token hoặc kết quả giả trong localStorage.
- Ngày và chuỗi học tính theo UTC+7. Từ mới hôm nay dựa vào MIN ReviewedAt của từng từ, không dựa Repetitions=1. Từ đã lưu không đồng nghĩa đã thành thạo.
- Reload giữa phiên dựng lại hàng đợi từ SQL; lượt đã lưu không mất. Chưa khôi phục thứ tự/vị trí chính xác của phiên đang dang dở. Mỗi lượt hiện vẫn có StudySession riêng theo mô hình Save hiện có; trang tổng kết nhóm các event đã lưu, không thay đổi schema để giả lập session nhóm.

## Kiểm tra

- Backend build qua; NuGet có cảnh báo NU1900 vì không truy cập dịch vụ audit, chưa xác minh lỗ hổng qua NuGet.
- Smoke API qua: overview sau lưu, result đọc lại đúng, input sai/UUID trùng, cách ly người học, retry không tăng lặp; giữ các test JWT/role/profile/SRS có sẵn.
- `backend/tests/Check-LearningFlow.ps1` chạy trên next start: HSK thật → proxy lưu → retry → overview tăng một → đọc lại result hai lần → progress; route chính trả 200 và URL bài cũ redirect về HSK thật. Next có thể trả redirect streaming trong body HTTP 200.
- Frontend lint/typecheck/build qua. Công cụ trình duyệt không khởi tạo được (`failed to write kernel assets`), chưa bấm thử, chưa xác minh desktop/mobile hoặc bàn phím trong lượt này. HTTP không được tính là bấm UI.
- Dùng tài khoản fixture riêng; dọn đúng fixture sau kiểm tra, không xóa localStorage hoặc dữ liệu người dùng thật.

Không hoàn thiện lớp học, bài tập, onboarding/cài đặt đồng bộ, reset email hay các trang mẫu khác trong đợt này. Chưa commit/push.
