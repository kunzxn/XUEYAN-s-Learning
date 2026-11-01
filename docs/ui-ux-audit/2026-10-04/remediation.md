# Khắc phục audit UI/UX — 23/10/2026

Báo cáo gốc được giữ nguyên như bằng chứng tại thời điểm audit. Đối chiếu lại code trước mỗi nhóm; không reset các thay đổi sẵn có, không đổi brand/Stitch, không commit/push.

| Nhóm | Mã | Tiến độ |
| --- | --- | --- |
| 1. Nháp và form | UX01/03/10 | Giữ triển khai đợt 1; 7 test nháp và hồi quy dialog/form đạt |
| 2. Học/ôn | UX02/05/06/07/20 | Đã sửa; thử phiên 1/3 từ, thoát sớm, sai/đúng, bàn phím và mobile |
| 3. Điều hướng/a11y | UX04/08/15/16/21/22 | Đã sửa; menu/keyboard/DOM/404/title đạt; chưa thử NVDA |
| 4. Số liệu/nội dung mẫu | UX09/11/12/17 | Đã sửa; số liệu không tách dòng, nhãn và filter đúng phạm vi mẫu |
| 5. Công khai/mật độ | UX13/14/18/19 | Đã sửa; mục lục đứng trước bài ở mobile, icon ổn định, nội dung gọn hơn |

## Kiểm thử

Không coi việc đọc code là đã bấm thử. Dữ liệu thử dùng tên `UX-audit-23-10`, email `example.invalid`, phiên mẫu tách ID. Không clear localStorage hoặc ghi đè bản nháp đang có; không tạo tài khoản, gửi email hoặc ghi SQL trong đợt này.

| Mã | Thay đổi / file chính | Xác minh đợt này | Kết quả / giới hạn |
| --- | --- | --- | --- |
| UX01 | Giữ `draft-storage.ts`, `use-device-draft.ts` và sáu screen đã sửa trong đợt 1 | 7 test nháp bằng bộ nhớ thử riêng; đọc lại hook và bằng chứng đợt 1 | Đạt hồi quy; không nhập/ghi lại nháp thật trên sáu trang lần nữa |
| UX02 | `StudyScreens.tsx`: Pinyin từ và câu cùng phụ thuộc toggle, độc lập mặt thẻ | Bấm Ẩn Pinyin ở `/lessons/1/learn`, đọc DOM/AX: âm đọc biến mất, nghĩa vẫn mở | Đạt |
| UX03 | Giữ validation tạo bộ từ hiện có | Bấm `  tẤt   CẢ  `, khoảng trắng, rồi `UX-audit-23-10`; Enter submit | Đạt: báo lỗi dưới input, giữ nội dung; tên hợp lệ tạo/chọn trong phiên |
| UX04 | `DashboardHeader.tsx`: Đăng nhập trong menu mobile; desktop giữ link riêng | Mở menu trang chủ 375px, xác nhận `/login` | Đạt |
| UX05 | `StudyScreens.tsx`, `study-session.ts`: kết quả theo run ID, số đã làm/tổng, điểm và từ sai/Quên/Khó | Thoát sau 1/3: 33%; reload vẫn 1/3. Làm sai 工作: 0 điểm, củng cố đúng 工作. Phiên 3 từ: 3/3, củng cố 朋友 sau rating 1 | Đạt; chỉ trong tab, không giả tiến độ SQL |
| UX06 | Phím số hoạt động cả khi focus button; bỏ qua ô nhập, modifier, repeat và dialog; Space trên nút dùng hành vi native | Bấm/phím 3 khi focus Nhớ; hoàn thành bằng 3/1/4; Space mở đáp án đúng một lần ở tablet | Đạt |
| UX07 | `ui.module.css`: controls fixed mobile có safe-area, padding cuối nội dung; thẻ gọn hơn | 375×812: vùng nút học top≈740, bottom≈812; so ảnh; 768×1024 không tràn | Đạt; nội dung ví dụ vẫn cuộn được |
| UX08 | `tokens.css`, `ui.module.css`: border-control `#7b8790`, chữ nút mobile text-soft/12px | Code/CSS; đối chiếu input khi thử dialog/form và ảnh mobile | Border trên trắng ≈3,68:1; không chứng nhận toàn app WCAG |
| UX09 | Số/đơn vị nowrap, font linh hoạt, line-height metric không bị card ghi đè | Đo DOM 375/1440: `89,2%`, `7 ngày` đều một dòng; ảnh progress | Đạt |
| UX10 | Giữ `ValidatedForm`/Input/Dialog đã có | Contact submit rỗng: 5 lỗi, focus họ tên; sửa đủ rồi submit lại; bộ từ có ARIA trỏ mô tả lỗi | Đạt; form hợp lệ vẫn nói chưa gửi dịch vụ, giữ dữ liệu |
| UX11 | `FeaturedTeachers.tsx` dùng `demoTeachers` theo ID; homepage gắn nhãn sát card; bỏ cấp HSK gán tùy tiện cho từ spotlight | DOM trang chủ: tên/link trùng danh bạ, nhãn minh họa; đọc code | Đạt; không tự xác minh bằng cấp/ảnh thật |
| UX12 | `LearnerDashboard.tsx`, `ActivityHeatmap.tsx`, CSS: tiêu đề số từ, cột một màu; heatmap có ngày/count/legend và bảng văn bản | DOM dashboard/progress, đọc cấu trúc 112 ngày và bảng disclosure | Đạt; vẫn fixtures ghi rõ, không suy thành lịch sử tài khoản |
| UX13 | `DiscoveryScreens.tsx`: Help dùng nhãn đúng chức năng đích, như Mở cài đặt | DOM/route checker và code | Đạt; không tạo route hướng dẫn giả |
| UX14 | Article TOC xuất hiện trước article trong DOM, sang cột phải desktop; details thu gọn được | Đo mobile: TOC top≈507 trước article≈1098; desktop cùng hàng hai cột | Đạt |
| UX15 | `Layouts.tsx`: drawer role dialog/aria-modal, inert nền, quản lý focus; `globals.css` giới hạn transition để visibility không bị trễ | Bấm menu: focus nút đóng; Shift+Tab tới mục cuối, Tab về đầu, Escape trả nút mở; nền bỏ inert khi đóng | Đạt DOM/bàn phím; chưa thử NVDA/VoiceOver |
| UX16 | Header “Thiết lập lộ trình”; hero/cuối trang “Học thử Bài 01” | DOM/handler/route checker | Đạt, đích cũ giữ nguyên |
| UX17 | Collection củng cố lọc từ kết quả phiên gần nhất và ghi rõ phạm vi tab | Sau làm sai 工作: tab chỉ có 1 từ 工作 | Đạt; chưa cá nhân hóa từ SQL |
| UX18 | Chữ resource dựa category cố định, artwork nhỏ hơn | Lọc Pinyin vẫn là 声, không đổi thành 学; DOM/CSS | Đạt |
| UX19 | About copy từng nhóm khác nhau; dictionary bỏ ví dụ lặp và mở chi tiết; profile thống kê/huy hiệu hai cột gọn | DOM ở 375/1440, code; số profile một dòng | Đạt phạm vi cải thiện nhẹ, giữ khung Stitch |
| UX20 | FocusLayout dùng ghost-button chung cho thoát; bỏ nút Kết thúc trùng trên thẻ | Quan sát study/practice/summary, thử dialog thoát | Đạt |
| UX21 | `app/not-found.tsx`: 404 tiếng Việt, sổ từ/trang chủ | Mở ID sai thực tế; 8 ca URL sai đều HTTP 404 | Đạt; không thay guard bằng dữ liệu fallback |
| UX22 | Metadata trong 44 page wrapper; mô tả root phù hợp toàn website | Đọc code, build; quan sát document.title tại các route trong coverage | Đạt theo màn hình/template; chưa kiểm mọi tổ hợp ID riêng |

## Kiểm tra tổng hợp và bằng chứng

- `node scripts/test-device-drafts.mjs`: 7/7 đạt (bộ nhớ riêng, không chạm storage trình duyệt).
- `node scripts/test-study-session.mjs`: 6/6 đạt: sai từ/rating, reload, ID độc lập, storage bị chặn, JSON/schema hỏng, dữ liệu không hợp lệ.
- ESLint, TypeScript noEmit và production build cuối cùng: đạt, exit 0.
- Navigation inventory: 44 route template, 245 khai báo control, 0 lỗi tĩnh.
- Route checker: 65 lượt route/link nội bộ đạt, 8 URL sai trả 404. Lần gọi đầu nhầm cổng mặc định 3100 trong sandbox bị chặn kết nối; đã chạy lại đúng cổng 3105 và có quyền localhost, đạt. Không phải lỗi app.
- `docs/ui-validation/audit-fixes/coverage.json`: đo DOM 375/1440 và một mẫu tablet 768. Riêng bản ghi 404 mobile trong vòng đo nhanh lấy trạng thái chuyển trang chưa xong (h1 trống); đã mở lại riêng và xác nhận heading/link tiếng Việt bằng AX. Không coi bản ghi chuyển trang đó là lỗi trang 404.
- Ảnh: `summary-wrong-word-mobile.png`, `study-mobile-controls.png`, `progress-mobile.png` trong cùng thư mục. Ảnh chụp nút học ngay sau toggle có thể bắt frame trước khi Pinyin ẩn; xác minh ẩn Pinyin dựa AX/DOM sau cập nhật, không dùng frame này để kết luận toggle.

Đã xem ảnh và thao tác đại diện, không audit lại toàn bộ 44 route ở mọi kích thước hoặc bấm mọi control. Chưa dùng NVDA/VoiceOver, thiết bị cảm ứng thật, zoom 200%, trình duyệt khác, hoặc xác minh âm thanh phát ra. Chưa nối thêm backend, reset mật khẩu/email, nội dung HSK ngoài mẫu, file tài nguyên, bài nộp/chấm bài thật. Những phần thiếu dịch vụ vẫn được thể hiện rõ; không báo lưu/gửi thành công giả.

## Xác nhận bản production

Chạy `next start -p 3106` từ build cuối; trình duyệt mới thử ôn một từ → thoát sớm → tổng kết 1/3 = 33%, mở drawer tự focus nút đóng, Escape trả focus, rồi đọc tiến độ mobile. `console-production.json` không ghi nhận warn/error trong phạm vi đó. `console.json` của phiên dev giữ nguyên một lỗi Turbopack reload CSS chunk xảy ra khi vừa build vừa HMR; không che log cũ và không xem lỗi đó là đã tái hiện ở production.

Đã giới hạn transition toàn cục vào màu/nền/viền/shadow/transform, tránh animate visibility làm focus drawer bị trễ. Bản production đã xác minh focus lúc mở, không chỉ trường hợp nhấn Tab sau mở.

Không commit/push. Các giới hạn dịch vụ/tài nguyên và thử nghiệm AT/thiết bị thật nêu trên vẫn còn.
