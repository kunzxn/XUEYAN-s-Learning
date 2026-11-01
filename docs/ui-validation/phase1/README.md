# Đợt 1 — UX01, UX03, UX10

Hoàn thành ngày 05/10/2026. Đã đọc `frontend/AGENTS.md`, hướng dẫn Next.js cài trong dự án và xác minh lại code trước khi sửa. Giữ nguyên màu, CSS, layout Stitch, routing và các phần việc có sẵn. Không commit/push, không thêm API hoặc thay đổi cơ chế xác thực.

## Tiến độ

- [x] Xác minh lại UX01/03/10.
- [x] Khôi phục sáu loại bản nháp sau hydration, không tự ghi state mặc định.
- [x] Lưu đủ trường văn bản/lựa chọn, bao gồm giờ học; tách loại dữ liệu và ID.
- [x] Đọc bản nháp cũ; cảnh báo dữ liệu lỗi/phiên bản không hỗ trợ/quyền lưu trữ.
- [x] Lỗi tại trường, quan hệ ARIA và focus sau khi mô tả lỗi được render.
- [x] Tên bộ từ trống/trùng/hợp lệ; vòng Tab và Escape trong dialog.
- [x] Kiểm tra trình duyệt desktop/mobile bằng dữ liệu thử riêng.
- [x] Gỡ route/fixture thử tạm trước build; vẫn 38 route template.
- [x] Lint, typecheck, build và 7 kiểm thử dữ liệu nháp đạt.

## Thay đổi và kết quả

| Mã UX | File đã sửa | Cách kiểm tra | Kết quả | Phần còn thiếu |
| --- | --- | --- | --- | --- |
| UX01 | [draft-storage.ts](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/lib/draft-storage.ts), [use-device-draft.ts](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/lib/use-device-draft.ts); [LearningScreens.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx), [ClassScreens.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/ClassScreens.tsx), [TeacherScreens.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/TeacherScreens.tsx), [ProfileScreens.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/ProfileScreens.tsx), [AuthScreens.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/AuthScreens.tsx); [test-device-drafts.mjs](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/scripts/test-device-drafts.mjs) | Trình duyệt: nhập → lưu → reload/mở lại; hai ID từ/bài tập/bản chấm/hồ sơ; JSON lỗi, schema không hỗ trợ, getter localStorage bị chặn. Kiểm thử bộ nhớ riêng: schema cũ, đọc không ghi, lỗi quota, các kiểu dữ liệu. | Đạt. Khôi phục ghi chú, văn bản bài làm, điểm/nhận xét kể cả điểm đang để trống, mọi lựa chọn hồ sơ/cài đặt và giờ onboarding. Không báo thành công nếu ghi thất bại. | Chỉ bản nháp thiết bị. Chưa đồng bộ server, gửi bài/chấm bài, tải ảnh/tệp hoặc áp dụng các tùy chọn xem trước vào phiên học/nhắc học. |
| UX03 | [LearningScreens.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx), [ValidatedForm.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/ValidatedForm.tsx) | Đã bấm tên `  tẤt   CẢ  `, tên toàn khoảng trắng; tên hợp lệ `  Bộ  thử   Đợt 1  `. Thử Enter, sửa nội dung sau lỗi. | Đạt. Trim và gộp khoảng trắng, so sánh không phân biệt hoa/thường tiếng Việt; lỗi dưới input, giữ nội dung, focus đúng trường; tên hợp lệ được tạo và chọn. | Bộ từ vẫn chỉ tồn tại trong phiên xem trước như trước; không thêm persistence/backend cho bộ từ. |
| UX10 | [ValidatedForm.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/ValidatedForm.tsx), [Primitives.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/Primitives.tsx); sáu file screen nêu trên, thêm [DiscoveryScreens.tsx](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/DiscoveryScreens.tsx) | Đã bấm đăng ký: tên trắng/email sai/mật khẩu xác nhận sai; chấm bài: điểm >100/nhận xét ngắn; bài làm <80 chữ Hán; contact/tư vấn thiếu nhiều trường. Sửa lỗi và submit lại ở đăng ký/chấm bài/bài làm/contact. Tab, Shift+Tab, Enter, Escape và đầu/cuối vòng focus của dialog ở 375px. | Đạt. `aria-invalid`, `aria-describedby` trỏ mô tả hiện có; focus trường lỗi đầu sau render; lỗi tiếng Việt tách khỏi nhãn; giá trị được giữ. Dữ liệu hợp lệ chỉ mở xem trước hoặc thông báo thiếu dịch vụ, không giả thành công server. | Chưa thử NVDA/VoiceOver hoặc mọi trạng thái auth trên mọi trình duyệt. Các form auth còn lại dùng cùng validation và đã qua kiểm tra code/typecheck/build. |

## Phạm vi lưu nháp

Khóa mới: `xueyan:draft:v1:<loại>:<ID đã encode>`. JSON gồm `version: 1` và `data`; đọc có kiểm tra kiểu trường, dữ liệu số hữu hạn và giới hạn độ dài. Sai schema/version hoặc lỗi truy cập trả về mặc định kèm cảnh báo, **không tự xóa/ghi lại bản cũ**.

| Loại | ID | Trường lưu |
| --- | --- | --- |
| word-note | hồ sơ + ID từ | note |
| assignment | học viên + ID bài tập | text |
| grading | ID bài tập + ID bản nộp | grade, comment |
| student-profile / teacher-profile | ID hồ sơ; hai loại tách biệt | name, bio, headline, purpose, level, pinyin, video, schedule |
| settings | ID hồ sơ | goal, pinyin, autoplay, hanViet, time, timezone, privacy |
| onboarding | ID hồ sơ | goal, purpose, time |

ID mặc định vẫn là đối tượng demo hiện có; chưa bổ sung tài khoản thật. Các khóa cũ chỉ được đọc cho đúng đối tượng mặc định. Không xóa khóa cũ khi chuyển sang khóa mới. Trường chưa có trong nháp cũ dùng mặc định và có thông báo. Điểm chấm cũ dạng số được đọc sang chuỗi để cho phép lưu bản nháp còn bỏ trống điểm.

Không lưu mật khẩu, token, nội dung nhị phân hay file đính kèm. Giao diện nêu rõ cần chọn lại file sau reload. Chỉ nút lưu thủ công mới ghi dữ liệu; nút/ô nhập bị khóa trong lúc đọc bản nháp.

## Bằng chứng và kiểm tra

- [Nhật ký 27 bản ghi thao tác](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/docs/ui-validation/phase1/browser-checks.json): có ghi cả lỗi phát hiện trong lúc triển khai và lần thử lại sau sửa, không coi lần lỗi ban đầu là pass.
- [Dialog lỗi bộ từ trên mobile](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/docs/ui-validation/phase1/collection-mobile-validation.png).
- [Hồ sơ khôi phục trên desktop](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/docs/ui-validation/phase1/profile-restored-desktop.png).
- [Console](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/docs/ui-validation/phase1/console.json): không có warn/error được công cụ ghi nhận trong phiên.
- `npm run lint`: đạt, exit 0.
- `npm run typecheck`: đạt, exit 0.
- `node scripts/test-device-drafts.mjs`: 7/7 đạt. Không chạm localStorage thật.
- `npm run build`: đạt, exit 0. Lần đầu trong sandbox thất bại vì không tải được Be Vietnam Pro/Noto Sans SC; chạy lại có quyền mạng thành công, không thay font hoặc framework.

Kiểm thử dùng localhost:3102 và ID `phase1-test-*`/`phase1-fault-*` riêng trong fixture tạm. Không clear toàn bộ localStorage, không xóa/ghi đè nháp người dùng. Fixture thử và route `draft-test` đã gỡ khỏi source trước build. Không biến kết quả fixture thành tuyên bố đã có backend.

Hai lỗi được phát hiện thêm khi kiểm thử đúng phạm vi: ô giờ chưa nhận đủ sự kiện input và focus Tab ở biên dialog. Đã sửa và thử lại thành công. `FormField` dùng cùng styling với Input, giữ nhãn tách khỏi mô tả lỗi; không sửa CSS/tokens hoặc thiết kế.
