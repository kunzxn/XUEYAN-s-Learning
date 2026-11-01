# Đánh giá UI/UX toàn website XUEYAN — 04/10/2026

> Đây là báo cáo tại thời điểm audit. Tiến độ sửa và xác minh lại ngày 23/10/2026 được ghi riêng tại [remediation.md](./remediation.md); các kết luận lịch sử bên dưới không đại diện nguyên trạng code mới.

## Phạm vi và cách xác minh

Đây là đợt **kiểm tra và viết báo cáo**, không sửa source frontend. Các thay đổi code có sẵn trong working tree thuộc các công việc trước đó. Đợt này chỉ thêm báo cáo, ảnh và nhật ký kiểm tra vào thư mục này.

Đã đọc `frontend/AGENTS.md`, README, App Router, các screen TSX, layout, primitives, CSS Modules, globals, tokens, dữ liệu mẫu và các tài liệu migration/design system. Kiểm kê độc lập từ `frontend/app/**/page.tsx` xác nhận **38 route template**, không phải 38 file thiết kế và không phải 38 bản desktop/mobile riêng biệt.

Ứng dụng chạy bằng `npm run dev -- --hostname 127.0.0.1 --port 3101`. Quan sát bằng trình duyệt thật ở **1440×1000** và **375×812**. Đã lưu 76 bản ghi cho trạng thái mặc định của 38 route, thêm 16 biến thể ở mobile, hai kiểm tra tablet 768px và một trường hợp ID không tồn tại. Một số trang lớp học không chụp được full-page: đã bổ sung ảnh phần đầu, giữa/cuối và đọc DOM; không suy ra độ phủ toàn trang từ một ảnh viewport.

Đối chiếu màu/font với `frontend/dashboard.html` và `docs/design-system.md`; đọc hai `DESIGN.md` của Stitch. Xem trực tiếp các ảnh mẫu Dashboard desktop, đăng nhập mobile, học từ mobile, Flashcard mobile, tiến độ mobile và chấm bài mobile. **Không tuyên bố đối chiếu pixel từng trang với toàn bộ 81 ảnh Stitch.** Một số ảnh mẫu có kích thước xuất khác viewport chạy ứng dụng; đối chiếu bố cục và tương quan kích thước, không coi sai khác pixel là lỗi.

Bằng chứng: [coverage.json](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/docs/ui-ux-audit/2026-10-04/coverage.json), [interactions.json](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/docs/ui-ux-audit/2026-10-04/interactions.json), [console.json](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/docs/ui-ux-audit/2026-10-04/console.json), ảnh PNG và DOM `.txt` cùng tên. Các ảnh `overview-*` dùng để rà soát nhóm; `check-fallback-*` ghi nhận thêm phần giữa các trang lớp học. Biểu tượng N ở góc ảnh là Next Dev Tools, không phải lỗi thiết kế XUEYAN.

Giới hạn:

- Đã xem trạng thái mặc định của cả 38 template và bấm thao tác đại diện; **chưa bấm mọi nút trên mọi trang hoặc mọi ID**.
- ID lấy từ fixtures: `hsk-1`, `hsk-2`, `xuexi`, `gongzuo`, `lan-anh`, `minh-duc`; lớp `hsk2-k24`, bài tập `4`, bài học `1`. Các ID còn lại chủ yếu kiểm tra bằng code.
- Các biến thể bổ sung chủ yếu xem ở mobile; chưa đối chiếu mọi trạng thái ở cả hai kích thước.
- Chưa kiểm tra bằng NVDA/VoiceOver, thiết bị cảm ứng thật, zoom 200% hoặc trình duyệt khác. Reduced motion mới kiểm tra CSS.
- Đã bấm phát âm, không thấy lỗi UI trong lần quan sát; **chưa xác minh nghe được âm thanh, giọng đọc hay thanh điệu thực tế**.
- Không tạo tài khoản, gửi email, tải tệp cá nhân lên, lưu/xóa dữ liệu người dùng hoặc gửi điểm thật. Khả năng phục hồi bản nháp được xác minh bằng code, chưa thử ghi rồi tải lại.

## A. Nhận xét tổng thể

**Điểm đang làm tốt:** màu xanh mực `#004563`, nền xanh rất nhạt, surface trắng và các màu trạng thái được dùng khá nhất quán. Be Vietnam Pro/Noto Sans SC phù hợp nội dung Việt–Hán; trong các màn hình đã xem không thấy dấu tiếng Việt hoặc dấu thanh Pinyin bị cắt. Hanzi lớn ở màn hình học, Pinyin và nghĩa đặt gần nhau giúp người học liên hệ âm–chữ–nghĩa. Các icon Lucide, radius và shadow tương đối đồng bộ. Màu chữ chính/nút chính có tương phản tốt; trắng trên xanh chính khoảng **10,34:1**.

Ba chế độ public/workspace/focus đã hình thành; focus bỏ sidebar giúp tập trung. Các luồng HSK 1 → Bài 01 → học từ, chọn giáo viên theo ID, hồ sơ → chỉnh sửa → quay lại, lớp → bài tập có đích đúng trong mẫu. Tab thông báo/lớp học, dialog xem trước và trạng thái thiếu tài liệu có phản hồi rõ. Menu workspace có vòng Tab/Shift+Tab và Escape trả focus về nút mở. Nhiều tính năng chưa có server đã ghi rõ “mẫu”, “chưa kết nối”, thay vì báo gửi thành công.

**Vấn đề lớn nhất:** giao diện đã thống nhất bề ngoài nhưng hành vi học và phản hồi chưa theo kịp. Có nút hoạt động sai (ẩn Pinyin), biểu mẫu im lặng khi tên trùng, phím tắt phụ thuộc focus, tổng kết không dựa vào phiên vừa học. Các thao tác lưu nháp chỉ ghi localStorage mà không có đường đọc lại ở những screen tương ứng. Những điểm này ảnh hưởng sự tin cậy và khả năng học tiếp nhiều hơn việc đổi màu hay trang trí.

**Responsive:** chưa phát hiện tràn ngang toàn trang trong các trạng thái có đo hình học; bảng học viên có vùng cuộn ngang riêng. Tuy nhiên, “không tràn” chưa đồng nghĩa “thuận tiện”: nút đánh giá Flashcard nằm ở y≈956–1064 trên viewport cao 812px; số `89,2%` bị tách dấu `%` xuống dòng; màn hình dài khiến tác vụ chính phải cuộn nhiều. Tablet 768px đã kiểm tra ở tiến độ và Flashcard lỗi, không phát hiện tràn ngang tại hai mẫu này.

**Về dấu hiệu thiết kế rập khuôn:** không coi card hoặc nền ô chữ Hán là lỗi tự thân. Chúng phù hợp ngữ cảnh học tập. Điểm cần chỉnh là những nơi card không tạo thêm thông tin: bốn nhóm người học ở About có cùng đoạn mô tả, card từ điển lặp cả ví dụ khiến việc tra nhanh dài, và ảnh chữ trang trí tài nguyên chiếm nhiều diện tích hơn nội dung phân loại. Gradient trong biểu đồ đáng sửa vì không giải thích dữ liệu, không phải vì sở thích thẩm mỹ.

## B. Bảng độ phủ

**Xem** = đã mở, quan sát ảnh/DOM ở kích thước ghi trong cột. **Bấm** = chỉ thao tác nêu trong dòng, không chứng nhận toàn trang. **Code** = chưa thử thao tác đó bằng UI. “Chặn” là phần chưa có dịch vụ/tệp thực, không phải lỗi 404.

| Route | Desktop 1440px | Mobile 375px | Tương tác | Cách xác minh |
| --- | --- | --- | --- | --- |
| `/` | Xem | Xem | Bấm menu, Escape; CTA khác nhau mới đọc code | PNG/DOM; header mobile không có Đăng nhập |
| `/about` | Xem | Xem | Bấm Tìm hiểu giáo viên → `/teachers` | Ảnh + URL đích |
| `/contact` | Xem | Xem | Bấm submit rỗng; gửi hợp lệ chưa thử, chặn API | DOM required + code handler |
| `/help` | Xem | Xem | Bấm tìm mật khẩu, FAQ, hướng dẫn tài khoản | Bộ lọc + URL `/settings` |
| `/resources` | Xem | Xem | Bấm lọc Pinyin và xem audio | DOM/ảnh; dialog thiếu tệp |
| `/resources/remember-vocabulary` | Xem | Xem | Bấm đánh dấu và mục lục | Status trong phiên; hash `#section-3`, top≈96px |
| `/login` | Xem | Xem | Bấm Google, hiện mật khẩu, link đăng ký | Status chưa cấu hình; type input; URL; auth thật chặn |
| `/register` | Xem | Xem | Bấm quay lại login; submit/mismatch Code | URL + TSX; xem biến thể success mẫu |
| `/forgot-password` | Xem | Xem | Bấm đường đến từ login; gửi email Code/chặn | URL + biến thể success mẫu |
| `/reset-password` | Xem | Xem | Bấm expired → yêu cầu liên kết mới | URL `/forgot-password`; không đổi mật khẩu |
| `/onboarding` | Xem | Xem | Bấm chọn 30 từ, bước 1→2→3 | Mục tiêu/heading đúng; chưa bấm lưu |
| `/dashboard` | Xem | Xem | Bấm HSK, menu Tab/Shift+Tab/Escape | URL + DOM focus; xem new/empty/loading/error |
| `/vocabulary` | Xem | Xem | Bấm tiếp tục HSK 1 | URL `/vocabulary/hsk-1`; lọc cấp độ Code |
| `/vocabulary/[level]` (`hsk-1`) | Xem | Xem | Bấm bài đầu → `/lessons/1` | URL; xem thêm `hsk-2` mobile, nội dung còn thiếu |
| `/lessons/1` | Xem | Xem | Bấm học từ; browser Back và reload | URL, tiêu đề Bài 01 vẫn đúng |
| `/lessons/1/learn` | Xem | Xem | Bấm Pinyin; thử phím 3 khi nút focus | Pinyin vẫn hiện; vẫn 1/6; đã đi vào từ HSK |
| `/lessons/1/practice` | Xem | Xem | Bấm đáp án sai cho `word=gongzuo`, tiếp tục | Feedback sai; URL tổng kết đúng source/count/word |
| `/review` | Xem | Xem | Bấm chọn 3 từ → phiên ôn | `limit=3`, 1/3; xem empty mobile |
| `/review/study` | Xem | Xem | Bấm lật/đánh giá/thoát sớm, thử phím 3 | Đổi 1/3→2/3; phím khi button focus không đổi; xem lỗi, phiên một từ |
| `/review/summary` | Xem | Xem | Bấm từ phiên thoát sớm/luyện sai, về Dashboard | URL đúng; nội dung tổng kết cố định; chưa kiểm phiên SRS thật |
| `/dictionary` | Xem | Xem | Bấm/gõ tìm `xue2xi2` | Một kết quả 学习; xem loading/empty; lưu/bộ thủ Code/chặn |
| `/collection` | Xem | Xem | Bấm tạo tên trùng, tìm `xuexi` | Dialog không lỗi; empty sai với Pinyin không dấu |
| `/collection/[id]` (`xuexi`) | Xem | Xem | Bấm ôn từ này; bấm phát âm; lưu ghi chú Code | `word=xuexi`, 1/1; không xác minh âm thanh nghe được |
| `/progress` | Xem | Xem | Bấm tab tháng ở tablet | Cảnh báo vẫn dùng tuần; 768px thêm; `%` xuống dòng mobile |
| `/profile` | Xem | Xem | Bấm chia sẻ, chỉnh sửa, quay lại | Dialog mẫu + URL đúng |
| `/profile/edit` | Xem | Xem | Bấm xem trước; lưu/khôi phục Code | Dialog tên đúng, không xuất bản |
| `/settings` | Xem | Xem | Bấm xem xóa tài khoản; lưu mục tiêu Code | Dialog không xóa; không lưu tùy chọn trong audit |
| `/notifications` | Xem | Xem | Bấm đọc tất cả, lọc chưa đọc | Empty state đúng; chỉ trạng thái phiên |
| `/teachers` | Xem | Xem | Bấm lọc Minh Đức → hồ sơ | Đúng `/teachers/minh-duc` |
| `/teachers/[id]` (`lan-anh`) | Xem | Xem | Bấm luồng cùng template với `minh-duc` | Đúng tên Minh Đức; xem thêm mobile không có card lớp Lan Anh |
| `/teachers/[id]/consultation` (`lan-anh`) | Xem | Xem | Đi tới mẫu `minh-duc`; submit Code/chặn API | Sidebar đúng giáo viên; chưa gửi biểu mẫu |
| `/teacher` | Xem | Xem | Bấm giảng viên mới → hoàn thiện hồ sơ | Empty state và `/teacher/profile` đúng |
| `/teacher/profile` | Xem | Xem | Bấm xem trước; lưu/khôi phục Code | Dialog Cô Lan Anh; chưa lưu |
| `/classes` | Xem | Xem đầu/giữa/cuối | Bấm tab hoàn thành/chưa tham gia | K18/empty đúng; chi tiết K18 chưa có |
| `/classes/hsk2-k24` | Xem đầu/cuối | Xem đầu/giữa/cuối | Bấm tab bài tập → bài 4 | Đúng route; phòng học/materials chưa kết nối |
| `/teacher/classes/hsk2-k24` | Xem | Xem đầu/giữa/cuối | Bấm học viên, kho tài liệu | Bảng cuộn riêng; thiếu tệp được giải thích |
| `/assignments/4` | Xem đầu/cuối | Xem đầu/giữa/cuối | Bấm chèn mẫu, kiểm tra bài ngắn | Báo 80–120 chữ; lưu/khôi phục Code; nộp thật chặn |
| `/teacher/assignments/4` | Xem | Xem đầu/giữa/cuối | Bấm audio/ảnh, nhận xét nhanh, gửi mẫu | Báo thiếu tệp/chưa gửi; lưu/khôi phục Code |

Phân nhóm thực tế: **6 công khai + 5 tài khoản + 17 học viên + 10 giáo viên/lớp học = 38**. Danh bạ giáo viên công khai được đặt trong nhóm giáo viên để theo dõi cùng luồng tư vấn. Không có trang login có phiên thật, onboarding có tài khoản thật hoặc route quản lý tư vấn riêng trong code hiện tại.

Biến thể đã xem thêm: Dashboard new/empty/loading/error; Review empty; Study error, limit=3 và một từ; Login loading/error; Register success; Forgot success; Reset expired; Dictionary loading/empty; HSK 2; hồ sơ Minh Đức; Practice một từ sai; lớp completed/empty; giáo viên mới; tab học viên/kho tài liệu/chấm audio/ảnh; thông báo empty; onboarding bước 2/3; các dialog nêu ở bảng. ID không hợp lệ `/collection/khong-ton-tai` trả 404 mặc định, nằm ngoài 38 template dùng nội dung hợp lệ.

## C. Bảng vấn đề

P1: cản trở thao tác hoặc làm mất sự tin cậy của tác vụ cốt lõi. P2: ảnh hưởng đáng kể hiệu quả học/đọc/khả năng tiếp cận. P3: cải thiện trình bày, chưa chặn tác vụ. Không ghi P0 vì chưa thấy sự cố UI làm toàn website không sử dụng được.

| Mã / ưu tiên | Trang/component | Vấn đề cụ thể | Bằng chứng | Ảnh hưởng | Đề xuất sửa |
| --- | --- | --- | --- | --- | --- |
| UX01 · P1 | WordDetail, ProfileEditor, SettingsScreen, AssignmentScreen, AssignmentReview, OnboardingScreen | Có `localStorage.setItem` và thông báo đã lưu thiết bị nhưng screen không đọc lại bản nháp khi mở/reload. ProfileEditor chỉ lưu `name,bio`, bỏ các trường khác của cùng form; onboarding bỏ giờ học. | **Code**, chưa ghi/reload: [LearningScreens.tsx:47–48](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx:47); [ProfileScreens.tsx:15,23](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/ProfileScreens.tsx:15); [ClassScreens.tsx:18](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/ClassScreens.tsx:18); [TeacherScreens.tsx:32](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/TeacherScreens.tsx:32); [AuthScreens.tsx:17](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/AuthScreens.tsx:17). `getItem` chỉ thấy ở InteractiveVocabulary khác. | Người học/giáo viên không khôi phục được bài, ghi chú, điểm nháp; dễ nghĩ công sức đã được bảo toàn. Đây là lỗi frontend, không phải thiếu đồng bộ server. | Đọc/khôi phục nháp, kiểm tra schema, thông báo rõ phạm vi lưu; lưu đủ các trường được hứa hoặc đánh dấu từng trường chỉ xem trước. |
| UX02 · P1 | StudySession — học từ/ôn tập | Ẩn Pinyin không ẩn trên mặt đáp án: render bằng `pinyin || flipped`. | **Đã bấm**: `aria-pressed=false` nhưng `xuéxí` vẫn visible; `learn-pinyin-toggle.txt/png`; [LearningScreens.tsx:34](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx:34). | Không thể chủ động luyện nhận diện Hanzi mà không nhìn âm đọc; trạng thái nút không khớp nội dung. | Điều khiển Pinyin độc lập với mặt thẻ; nêu rõ bật/tắt thay cho nhãn hai chiều mơ hồ. |
| UX03 · P1 | CollectionScreen / Dialog tạo bộ từ | Tên trùng `Tất cả` hoặc chuỗi toàn khoảng trắng bị bỏ qua, dialog không có lỗi hoặc hướng dẫn. | **Đã bấm** tên trùng: `collection-duplicate-no-error.txt`; [LearningScreens.tsx:44](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx:44). Nhánh trim rỗng mới đọc code. | Người dùng bấm Tạo nhưng không biết vì sao không có kết quả. | Lỗi ngay dưới input, `aria-invalid`, gợi ý tên khác; giữ giá trị để sửa. |
| UX04 · P1 | DashboardHeader trên các trang public | Ở 375px ẩn link Đăng nhập nhưng menu mở cũng không có link này; avatar dẫn hồ sơ mẫu. | **Đã mở/bấm menu**: `home-mobile-menu.txt/png`; [DashboardHeader.tsx:46–64,](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/dashboard/DashboardHeader.tsx:46) CSS `.loginLink` breakpoint. | Người quay lại khó tìm điểm vào login; dễ nhầm đang đăng nhập. API auth thiếu là giới hạn riêng. | Đưa Đăng nhập vào menu mobile/điểm tài khoản có nhãn rõ; giữ trạng thái tài khoản mẫu minh bạch. |
| UX05 · P2 — giới hạn phiên mẫu | PracticeScreen, StudySession, SessionSummary | Tổng kết không nhận đáp án/điểm/từ sai. Sau câu sai 工作, danh sách củng cố vẫn 学习/朋友/谢谢. Thoát sau một từ đã đánh giá vẫn hiển thị progress 100%. | **Đã bấm**: `summary-wrong-word.txt`, `review-summary-partial.txt`; [LearningScreens.tsx:31–34,38,50](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx:31). | Người học không biết cần học lại từ nào; check hoàn thành và số liệu không thể hiện phiên thực. Có nhãn mẫu nhưng phản hồi sư phạm vẫn thiếu. | Dùng kết quả trong phiên ở client; phân biệt đã làm/tổng bộ và đã hoàn tất/thoát sớm. Chưa cần thuật toán SRS/server để làm việc này. |
| UX06 · P2 | StudySession bàn phím | Handler bỏ qua BUTTON/A. Phím 3 khi focus `Nhớ · 3` hoặc `Từ tiếp theo` không đổi thẻ, dù hướng dẫn nói 1–4 đánh giá. | **Đã thử phím**: vẫn 1/3; `review-keyboard-focus.txt`; [LearningScreens.tsx:33](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx:33). | Người học bàn phím phải rời focus/đổi cách thao tác, nhịp ôn bị gián đoạn. Tab/Enter cơ bản vẫn có, không phải toàn trang không dùng bàn phím được. | Chỉ bỏ qua ô đang nhập; định nghĩa phím tắt theo chế độ, xử lý Space tránh kích hoạt kép. |
| UX07 · P2 | StudySession / FocusLayout mobile | Sau lật thẻ, rating ở y≈956–1064, ngoài viewport 812px. Học từ có CTA cuối nội dung, khác footer điều khiển trong Stitch mobile. | **Đã đo/quan sát**: `review-flipped-mobile`, `review-keyboard-focus`; ảnh `/lessons/1/learn` mobile; CSS flashcard min-height 440/600. | Cuộn lặp lại cho từng từ, thao tác chính xa ngón cái; người mới dễ không thấy nút tiếp tục/đánh giá. | Ưu tiên phần học chính, điều chỉnh chiều cao/spacing; vùng hành động dưới cố định hoặc sticky có chừa chỗ, giữ ví dụ đọc được. |
| UX08 · P2 | `.field`, `.mobileUnavailable`, tokens | Border input `#c0c7ce` trên trắng chỉ 1,71:1; nút tư vấn mobile còn bấm được dùng chữ 10px `#71787e` trên `#e9f5ff` ≈4,04:1. | **CSS + computed style thực**: [ui.module.css:49,137](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/ui.module.css:49); tokens.css. Nút tư vấn không disabled vì còn mở dialog. | Biên ô nhập khó nhận diện; nhãn nhỏ khó đọc. Không đánh đồng mọi border card trang trí với lỗi tương phản. | Tách token border-control đủ rõ; dùng text-soft cho nút đang hoạt động, tăng cỡ chữ/nhãn ngắn. |
| UX09 · P2 | ProgressScreen / `.four`, `.metric` | Mobile tách `89,2` và `%` thành hai dòng, `7 ngày` bị giãn; font 40px trong vùng rộng ≈114px. `.card p` ghi đè line-height lên 1,65. | **Đã xem/đo**: `progress-metric-wrap.png`; cao 132px so với 66px cho số ngắn. Tablet 768px không bị tách. | Khó quét nhanh số liệu, card cao bất thường và thiếu cân bằng. | Giữ số và đơn vị cùng dòng, giảm font theo container, cân padding và line-height metric. |
| UX10 · P2 | AuthScreen, AssignmentScreen và validation form | Lỗi được đặt ở status tổng, chưa gắn `aria-invalid`/`aria-describedby` vào trường. Input primitive có hỗ trợ nhưng nơi dùng chưa truyền error. Lỗi mismatch auth không đổi state sang error. | Assignment ngắn **đã bấm**: `assignment-short-validation.txt`; Auth mismatch **Code**: [AuthScreens.tsx:13](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/AuthScreens.tsx:13); [Primitives.tsx:13](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/Primitives.tsx:13). | Khó biết cần sửa ô nào; assistive technology không nhận được quan hệ lỗi–trường. | Lỗi tại trường, mô tả phục hồi cụ thể, focus trường lỗi đầu; giữ status chung cho lỗi dịch vụ. |
| UX11 · P2 | PublicHome, FeaturedTeachers và nội dung demo | Homepage có 24 từ đến hạn, HSK của thẻ và bằng cấp/tên giáo viên minh họa nhưng không có DemoNotice như các screen khác. Minh Quân/Chen Wei chưa có hồ sơ trong danh bạ mẫu. | **Ảnh/DOM + code**: `home-1440`, `home-375`; [PublicHome.tsx:12,](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/PublicHome.tsx:12) [FeaturedTeachers.tsx:7–40](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/dashboard/FeaturedTeachers.tsx:7). | Khách có thể hiểu là tiến độ/tư cách giảng viên thật; nội dung public và danh bạ thiếu đồng nhất. | Gắn nhãn minh họa gần module liên quan, dùng cùng fixtures/ID; xác minh trước phát hành, không tự bổ sung bằng cấp thật. |
| UX12 · P2 | `.bars`, LearnerDashboard, ProgressScreen | Dashboard gọi “Thời gian học” nhưng cột ghi số từ. Gradient chia 50/50 không có legend/dữ liệu hai nhóm. Heatmap có 112 ô tô bằng nth-child, thiếu ngày, thang màu và giá trị. | **Ảnh + Code**: [LearnerDashboard.tsx:15](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearnerDashboard.tsx:15); [ProfileScreens.tsx:18–19](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/ProfileScreens.tsx:18); [ui.module.css:74–75,102–105](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/ui.module.css:74). | Người học không hiểu biểu đồ đo gì; màu có vẻ mang dữ liệu nhưng chỉ là trang trí mẫu. | Khớp tiêu đề–đơn vị; một màu nếu một chuỗi; legend nếu có hai chuỗi thật; heatmap có ngày/legend và bảng/mô tả văn bản tương đương. |
| UX13 · P2 | HelpScreen | “Xem hướng dẫn” tài khoản đi tới `/settings`, các chủ đề khác cũng mở trang chức năng thay vì hướng dẫn. | **Đã bấm**: URL `/settings`; `help-search.txt`; [DiscoveryScreens.tsx:53](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/DiscoveryScreens.tsx:53). | Người cần trợ giúp bị đưa vào thao tác chưa hiểu; phải quay lại FAQ. | Nhãn “Mở cài đặt” nếu chuyển công cụ, hoặc mở đúng phần hướng dẫn hiện có; không tạo route giả. |
| UX14 · P2 | ArticleScreen mobile | Mục lục nằm sau cả sáu phần bài khi split gộp một cột. Anchor hoạt động đúng nhưng xuất hiện quá muộn. | **Đã xem/bấm**: `resources_remember-vocabulary-375.png`, `article-toc-mobile`; [DiscoveryScreens.tsx:43](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/DiscoveryScreens.tsx:43). | Không dùng được để định hướng trước khi đọc bài. | Đưa mục lục có thể thu gọn lên trước nội dung ở mobile, giữ aside trên desktop. |
| UX15 · P2 — khoảng trống a11y | WorkspaceLayout mobile drawer | Có backdrop/khóa scroll và vòng Tab, nhưng main không inert/ẩn với AT; aside không thể hiện modal. | **DOM/code**, chưa thử NVDA: `main.inert=false`, aside thiếu role/aria-modal; [Layouts.tsx:24–44](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/Layouts.tsx:24). | Có nguy cơ screen reader vẫn đọc nội dung nền trong khi drawer đang mở. Không kết luận đã quan sát lỗi screen reader thật. | Xác định drawer modal hay disclosure; nếu modal, ngữ nghĩa và inert nhất quán; thử đọc/focus nền bằng NVDA. |
| UX16 · P2 | CTA `Bắt đầu học` ở PublicHome/header | Cùng nhãn nhưng header đưa onboarding, hero/CTA cuối đưa thẳng Bài 01. | **Code**, chưa bấm cả ba CTA: [PublicHome.tsx:12](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/PublicHome.tsx:12); [DashboardHeader.tsx:47](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/dashboard/DashboardHeader.tsx:47). | Kỳ vọng bước tiếp theo khác nhau tùy vị trí bấm, nhất là người mới. | Tên hành động cụ thể “Thiết lập lộ trình” và “Học thử Bài 01”; giữ các route thật. |
| UX17 · P2 — giới hạn mẫu | CollectionScreen tab `Từ cần củng cố` | Tab này đổi tên/active nhưng vẫn trả cùng sáu từ như Tất cả; không dùng đánh giá trong phiên. | **Code**: [LearningScreens.tsx:43](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx:43). | Bộ lọc có vẻ cá nhân hóa nhưng không chọn ra từ yếu; khó quyết định ưu tiên ôn. | Dùng fixture khác rõ ràng hoặc ghi “bộ mẫu minh họa”; sau đợt học có kết quả phiên thì lọc theo kết quả đó. |
| UX18 · P3 | ResourceLibrary | Chữ trang trí được chọn theo index của danh sách đã lọc: tài nguyên Pinyin ban đầu 声, sau lọc thành 学. Ô chữ rất lớn so với metadata. | **Đã lọc**: `resources-pinyin-filter.txt/png` so với baseline; [DiscoveryScreens.tsx:31](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/DiscoveryScreens.tsx:31). | Mất nhận diện ổn định; mobile cuộn nhiều để tìm đúng loại tài liệu. | Gắn chữ/icon vào resource ID/category; giảm khối trang trí và ưu tiên loại tệp/chủ đề. |
| UX19 · P3 | About, Dictionary, Profile | About có bốn card người học dùng cùng copy; dictionary lặp ví dụ/âm đọc ở cả sáu kết quả; profile biến thống kê/huy hiệu thành nhiều khối cao ở mobile. | **Ảnh**: About mobile 3357px, Dictionary 3556px, Profile 3329px; overview-public/learner. Chiều dài tự thân không phải lỗi. | Quét nội dung chậm trong tác vụ tra cứu/so sánh; nhiều card ít thêm giá trị. | Copy từng nhóm rõ lợi ích; kết quả tra cứu gọn và mở sâu vào chi tiết; thống kê/huy hiệu compact. Giữ bố cục/brand, không thiết kế lại toàn bộ. |
| UX20 · P3 | FocusLayout | Nút Thoát phiên học ở học/ôn dùng `.row` nên nhìn như nút browser mặc định; practice/summary dùng link khác kiểu. Trong study còn thêm Kết thúc phiên cùng mở một dialog. | **Ảnh + Code**: overview-learner-3/4; [Layouts.tsx:50](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/ui/Layouts.tsx:50); [LearningScreens.tsx:34](D:/AI/XUEYAN-s-Learning/XUEYAN-s-Learning/frontend/components/screens/LearningScreens.tsx:34). | Giảm đồng bộ control; hai nhãn thoát khác nhau nhưng cùng tác dụng. | Dùng primitive/ghost-button chung; làm rõ hoặc gộp hành động kết thúc, giữ xác nhận thoát. |
| UX21 · P2 | Fallback route động | ID không hợp lệ cho trang từ trả 404 tiếng Anh, không có đường trở lại sổ từ/trang chủ. | **Đã mở**: `collection_khong-ton-tai-375.txt/png`; app không có not-found tùy chỉnh. | Người học mở link cũ/sai bị cụt luồng. | Trang lỗi tiếng Việt theo layout gọn, link đích dự phòng; không đổi guard để hiện sai dữ liệu. |
| UX22 · P3 | Metadata toàn app | Các trang mặc định dùng cùng title `XUEYAN | Học tiếng Trung`, description nói Dashboard kể cả trang khác. | **DOM + Code**: Progress document.title; app/layout.tsx:18–21, không có metadata riêng trong page wrappers đã đọc. | Khó phân biệt tab/lịch sử và nhận diện trang đang mở. | Title theo màn hình, description đúng phạm vi. |

Ngưỡng đối chiếu tương phản: chữ thường cần ít nhất 4,5:1 theo [W3C SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); thành phần thị giác cần thiết để nhận biết control dùng ngưỡng 3:1 theo [W3C SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Nút disabled và đường viền trang trí không được tự động áp cùng kết luận. Đây là các kiểm tra cụ thể, **không phải chứng nhận toàn website đạt/không đạt WCAG**.

### Phần chưa có backend/tài nguyên — không gộp vào lỗi UI

| Phần | Hiện trạng được xác minh | Kết luận |
| --- | --- | --- |
| Đăng nhập/Google/đăng ký/khôi phục | Form và trạng thái mô phỏng; không có phiên tài khoản hay dịch vụ xác thực | Chặn kiểm thử tài khoản thật/phân quyền thật; không nên coi đi vào Dashboard mẫu là login thành công |
| Lịch SRS, số từ đến hạn, tiến độ/huy hiệu | Fixtures; rating chưa lưu lịch lên server | Chưa đánh giá độ đúng thuật toán SRS; UX05/12 là phản hồi/diễn đạt trong UI hiện có |
| HSK khác, chuyên đề ngoài Bài 01 | Có shell lộ trình, nhiều nội dung chưa triển khai; UnavailableAction giải thích | Thiếu nội dung, không nên nối mọi nút về Bài 01 |
| Tư vấn, hỗ trợ, phòng học, điểm danh, gửi thông báo | Dialog/status báo chưa kết nối | Chưa đặt lịch/gửi thư/tạo buổi học thực |
| Tài liệu, audio/ảnh bài nộp | Thiếu file thực; UI báo rõ | Không kết luận player/upload hỏng khi chưa có tài nguyên |
| Nộp/chấm bài/hồ sơ công khai | Kiểm tra local và xem trước; không gửi/cập nhật server | Có thể sửa UX nháp và validation riêng; triển khai API là công việc khác |

## D. 10 cải tiến đáng làm nhất, theo thứ tự

1. **Khôi phục đúng bản nháp và phạm vi lưu (UX01):** ưu tiên bài làm, chấm bài và ghi chú; kiểm tra tiếp hồ sơ/cài đặt/onboarding. Bảo vệ công sức học tập trước.
2. **Báo lỗi tạo bộ từ rõ ràng (UX03):** tên trùng/trống sau trim phải cho người dùng cách sửa.
3. **Sửa nút Pinyin đúng trạng thái (UX02):** tác động trực tiếp đến phương pháp nhận diện chữ và tự nhớ âm đọc.
4. **Tổng kết theo phiên vừa học (UX05):** đúng từ sai, điểm/đã làm/tổng, thoát sớm; giới hạn client rõ ràng, không giả SRS server.
5. **Khôi phục điểm vào đăng nhập mobile (UX04):** sửa shared header để tất cả trang public dễ tìm tài khoản.
6. **Gắn validation với trường (UX10):** form auth, bộ từ, bài tập dùng error/hint/focus thống nhất.
7. **Làm phím tắt ổn định theo focus/chế độ (UX06):** thử Space, 1–4, Tab, Enter và dialog.
8. **Tăng tương phản control và nhãn mobile (UX08):** sửa tokens/component dùng chung, không đổi palette thương hiệu.
9. **Giữ hành động học trong vùng dễ thao tác mobile (UX07):** gọn thẻ và vùng rating/Next; đối chiếu footer học từ Stitch.
10. **Sửa nhịp chữ/số và card mobile (UX09, phần nhỏ UX19):** số–đơn vị không tách; giảm chiều cao không cần thiết, giữ phân cấp nội dung. Ưu tiên tiến độ rồi mới làm gọn trang tra cứu/hồ sơ.

Mục lục, Help, biểu đồ và demo-label cũng đáng làm ở đợt tiếp theo. Không ưu tiên thêm gradient/animation hoặc đổi phong cách trước những lỗi hành vi trên.

## E. Đề xuất các đợt sửa nhỏ

| Đợt | Trang/component liên quan | Phạm vi | Kiểm tra để kết thúc đợt |
| --- | --- | --- | --- |
| 1 · Dữ liệu nháp và lỗi form | WordDetail, AssignmentScreen, AssignmentReview, ProfileEditor; Settings/Onboarding; Input/Dialog | UX01/03/10. Tách phần lưu thật trên thiết bị và phần chỉ xem trước; phục hồi an toàn. Không thêm API. | Nhập → lưu → reload → mở lại đúng dữ liệu; tên trùng/khoảng trắng; lỗi trường; bàn phím dialog |
| 2 · Học và ôn | StudySession, PracticeScreen, SessionSummary, FocusLayout | UX02/05/06/07/20. Kết quả trong phiên, Pinyin, phím tắt, hành động mobile. | Học/ôn 1 và 3 từ, đúng/sai/thoát sớm; 375/768/1440; không mất nút khi câu ví dụ dài |
| 3 · Điều hướng và accessibility chung | DashboardHeader, WorkspaceLayout, Primitives, tokens, metadata/not-found | UX04/08/15/21/22, nhãn CTA UX16. Giữ các guard/route thật. | Menu mobile, login dễ tìm, Tab/Shift+Tab/Escape, NVDA, contrast, route lỗi có đường quay lại |
| 4 · Tiến độ và nội dung đáng tin | LearnerDashboard, ProgressScreen, CollectionScreen, PublicHome/FeaturedTeachers, fixtures | UX09/11/12/17. Đơn vị/legend, dữ liệu mẫu đồng nhất và gần vị trí số liệu. | Số/đơn vị một dòng; chart đúng nhãn; tab không giả dữ liệu khác; demo không bị hiểu là tiến độ thật |
| 5 · Trang công khai và mật độ | HelpScreen, ArticleScreen, ResourceLibrary, About, Dictionary, StudentProfile | UX13/14/18/19. Sửa nhãn/đích, mục lục mobile, resource ổn định; giảm lặp card có bằng chứng. | Tìm hướng dẫn đúng; mục lục trước bài; lọc không đổi icon; so sánh ảnh với Stitch/brand ở 375/1440 |

Từng đợt nên giữ phần thay đổi nhỏ, chạy lint/typecheck và kiểm tra các route chịu ảnh hưởng; build khi triển khai thay đổi. Backend/auth, nội dung HSK hoàn chỉnh, room/tệp bài nộp và SRS thật cần phạm vi riêng sau khi chọn đợt frontend.

## Kết quả kiểm tra và trạng thái công việc

- `npm run lint`: **đạt**, exit 0.
- `npm run typecheck`: **đạt**, exit 0.
- Không thấy warn/error trong console được công cụ ghi nhận trong phiên kiểm tra; nhật ký hiện tại là `[]`. Không suy ra API hoặc mọi trạng thái đều không lỗi.
- Không chạy build lại trong đợt chỉ đọc này; không chạy các script audit ghi đè báo cáo cũ. Kiểm kê route và thao tác của đợt này được lưu riêng.
- **Không sửa source ứng dụng. Không commit/push.** Báo cáo và bằng chứng đã hoàn thành; chờ người dùng chọn phạm vi sửa.
