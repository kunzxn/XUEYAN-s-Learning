# XUEYAN UI migration

## Source and implementation contract

- Canonical tokens: `frontend/dashboard.html` (copy of retained `frontend/dasboard.html`).
- Original exports preserved under `design-reference/stitch/stitch_learn_china_time_ui_ux_design_system/`; never copied wholesale into public.
- Complete inventory: [stitch-inventory.md](stitch-inventory.md).
- Desktop/mobile merged per route. Alternate designs and states merged in the same component. Latest XUEYAN layout takes precedence over older Learn China Time branding.
- Framework remains Next.js 16 + React 19 + CSS Modules. No Impeccable skill/tool is installed in this session.
- Existing app has only mock data; backend/ is empty. No API or authentication service exists to preserve. Forms must report local preview only, never server success.

## Checkpoint

- [x] Read project instructions, framework docs, full export file inventory and screen headings; inspect screen source and assets.
- [x] 1. Shared tokens, public/learner/teacher/focus layouts, shared controls.
- [x] 2. Learner Dashboard; retain public home design on /.
- [x] 3. HSK, lesson, practice, collection, review and flashcard.
- [x] 4. Learner profile, editor, progress, settings.
- [x] 5. Teacher directory/profile/consultation and teacher workspace.
- [x] 6. Authentication, onboarding, classes, assignments, dictionary, notifications, resources, about, help/contact.
- [x] Final route/link, responsive, multilingual and lint/typecheck/build validation.

## Design → route → component

| Stitch screen(s) | Route | Component | Detected states | Progress |
|---|---|---|---|---|
| `a01_login_desktop_ng_nh_p_h_c_vi_n_xueyan`<br>`a01_login_mobile_ng_nh_p_di_ng_xueyan` | `/login` | `AuthScreen` | Đang tải, Chưa có, Thành công | UI implemented; responsive checked |
| `a04_reset_password_desktop_t_l_i_m_t_kh_u_xueyan`<br>`a04_reset_password_mobile_t_l_i_m_t_kh_u_di_ng_xueyan` | `/reset-password` | `AuthScreen` | Thành công, hết hạn, Xác nhận | UI implemented; responsive checked |
| `c_ch_h_c_t_v_ng_ti_ng_trung_nh_l_u_di_ng_xueyan`<br>`c_ch_h_c_t_v_ng_ti_ng_trung_nh_l_u_xueyan` | `/resources/remember-vocabulary` | `ArticleScreen` | Default | UI implemented; responsive checked |
| `d01_dictionary_search_desktop_tra_c_u_t_i_n_h_n_vi_t_xueyan`<br>`d01_dictionary_search_mobile_tra_c_u_t_i_n_h_n_vi_t_di_ng_xueyan` | `/dictionary` | `DictionaryScreen` | Đang tải, Không tìm thấy | UI implemented; responsive checked |
| `l01_today_dashboard_b_ng_i_u_khi_n_h_c_t_p`<br>`l01_today_dashboard_b_ng_i_u_khi_n_h_c_t_p_xueyan`<br>`l01_today_dashboard_mobile_b_ng_i_u_khi_n_h_c_t_p_di_ng_xueyan` | `/dashboard` | `LearnerDashboard` | Thành công, Chưa có | UI implemented; responsive checked |
| `l02_lesson_overview_mobile_t_ng_quan_b_i_h_c_di_ng_xueyan`<br>`l02_lesson_overview_t_ng_quan_b_i_h_c_ch_o_h_i_l_m_quen` | `/lessons/1` | `LessonOverview` | Default | UI implemented; responsive checked |
| `l03_learn_vocabulary_desktop_h_c_t_v_ng_m_i_xueyan`<br>`l03_learn_vocabulary_mobile_h_c_t_v_ng_m_i_di_ng_xueyan` | `/lessons/1/learn` | `StudySession` | Default | UI implemented; responsive checked |
| `l04_vocabulary_practice_desktop_luy_n_t_p_t_v_ng_xueyan`<br>`l04_vocabulary_practice_mobile_luy_n_t_p_t_v_ng_di_ng_xueyan` | `/lessons/1/practice` | `PracticeScreen` | Default | UI implemented; responsive checked |
| `l05_personal_vocabulary_collection_desktop_s_t_v_ng_c_nh_n_xueyan`<br>`l05_personal_vocabulary_collection_mobile_s_t_v_ng_di_ng_xueyan` | `/collection` | `CollectionScreen` | Chưa có, Xác nhận | UI implemented; responsive checked |
| `l05_vocabulary_detail_desktop_chi_ti_t_t_v_ng_xu_x_xueyan`<br>`l05_vocabulary_detail_mobile_chi_ti_t_t_v_ng_xu_x_di_ng_xueyan` | `/collection/xuexi` | `WordDetail` | Default | UI implemented; responsive checked |
| `l06_class_detail_desktop_chi_ti_t_l_p_h_c_hsk_2_k24_xueyan`<br>`l06_class_detail_mobile_chi_ti_t_l_p_h_c_hsk_2_k24_di_ng_xueyan` | `/classes/hsk2-k24` | `ClassDetail` | Lỗi | UI implemented; responsive checked |
| `l06_my_classes_desktop_l_p_h_c_c_a_t_i_xueyan`<br>`l06_my_classes_mobile_l_p_h_c_c_a_t_i_di_ng_xueyan` | `/classes` | `ClassList` | Default | UI implemented; responsive checked |
| `l08_review_overview_mobile_n_t_p_nh_l_u_h_n`<br>`l08_review_overview_n_t_p_nh_l_u_h_n` | `/review` | `ReviewOverview` | Default | UI implemented; responsive checked |
| `l09_flashcard_study_desktop_th_ghi_nh_flashcard_srs_xueyan`<br>`l09_flashcard_study_mobile_th_ghi_nh_flashcard_srs_di_ng_xueyan`<br>`l09_flashcard_study_th_h_c_ghi_nh_srs` | `/review/study` | `StudySession` | Lỗi, Mặt trước, Mặt sau | UI implemented; responsive checked |
| `l10_session_summary_desktop_t_ng_k_t_bu_i_h_c_xueyan`<br>`l10_session_summary_mobile_t_ng_k_t_bu_i_h_c_di_ng_xueyan` | `/review/summary` | `SessionSummary` | Thành công | UI implemented; responsive checked |
| `l11_edit_profile_desktop_ch_nh_s_a_h_s_h_c_vi_n_xueyan`<br>`l11_edit_profile_mobile_ch_nh_s_a_h_s_h_c_vi_n_di_ng_xueyan` | `/profile/edit` | `ProfileEditor` | Thành công, chưa lưu | UI implemented; responsive checked |
| `l11_learning_progress_desktop_ti_n_h_c_t_p_c_nh_n_xueyan`<br>`l11_learning_progress_mobile_ti_n_h_c_t_p_di_ng_xueyan` | `/progress` | `ProgressScreen` | Lỗi | UI implemented; responsive checked |
| `l12_learner_settings_desktop_c_i_t_t_i_kho_n_h_c_t_p_xueyan`<br>`l12_learner_settings_mobile_c_i_t_t_i_kho_n_h_c_t_p_di_ng_xueyan` | `/settings` | `SettingsScreen` | Thành công, Xác nhận, Mặt sau | UI implemented; responsive checked |
| `l13_notification_center_desktop_trung_t_m_th_ng_b_o_xueyan`<br>`l13_notification_center_mobile_trung_t_m_th_ng_b_o_di_ng_xueyan` | `/notifications` | `NotificationsScreen` | Thành công | UI implemented; responsive checked |
| `l15_assignment_detail_desktop_chi_ti_t_n_p_b_i_t_p_xueyan`<br>`l15_assignment_detail_mobile_chi_ti_t_n_p_b_i_t_p_di_ng_xueyan` | `/assignments/4` | `AssignmentScreen` | Lỗi, Thành công, Xác nhận, Lưu nháp | UI implemented; responsive checked |
| `learn_china_time_brand_logo` | `— (asset)` | `Brand logo` | Default | UI implemented; responsive checked |
| `o01_onboarding_desktop_thi_t_l_p_l_tr_nh_h_c_vi_n_xueyan`<br>`o01_onboarding_mobile_thi_t_l_p_l_tr_nh_di_ng_xueyan` | `/onboarding` | `OnboardingScreen` | Default | UI implemented; responsive checked |
| `p01_home_desktop_trang_ch_learn_china_time`<br>`p01_home_desktop_trang_ch_xueyan`<br>`p01_home_mobile_trang_ch_xueyan_di_ng` | `/` | `PublicHome` | Default | UI implemented; responsive checked |
| `p02_hsk_catalog_desktop_danh_m_c_l_tr_nh_hsk_xueyan`<br>`p02_hsk_catalog_mobile_danh_m_c_l_tr_nh_hsk_di_ng_xueyan` | `/vocabulary` | `HskCatalog` | Default | UI implemented; responsive checked |
| `p03_hsk1_level_detail_desktop_chi_ti_t_l_tr_nh_hsk_1_xueyan`<br>`p03_hsk1_level_detail_mobile_chi_ti_t_l_tr_nh_hsk_1_di_ng_xueyan` | `/vocabulary/hsk-1` | `HskDetail` | Default | UI implemented; responsive checked |
| `p04_forgot_password_desktop_qu_n_m_t_kh_u_xueyan`<br>`p04_forgot_password_mobile_qu_n_m_t_kh_u_di_ng_xueyan` | `/forgot-password` | `AuthScreen` | Default | UI implemented; responsive checked |
| `p04_register_desktop_ng_k_t_i_kho_n_h_c_vi_n_xueyan`<br>`p04_register_mobile_ng_k_t_i_kho_n_h_c_vi_n_di_ng_xueyan` | `/register` | `AuthScreen` | Thành công, Xác nhận | UI implemented; responsive checked |
| `p05_teacher_directory_desktop_t_m_ng_i_ng_h_nh_c_ng_b_n_xueyan`<br>`p05_teacher_directory_mobile_t_m_ng_i_ng_h_nh_c_ng_b_n_di_ng_xueyan` | `/teachers` | `TeacherDirectory` | Không tìm thấy, Lỗi | UI implemented; responsive checked |
| `p05_teacher_profile_desktop_h_s_gi_o_vi_n_c_lan_anh_xueyan`<br>`p05_teacher_profile_h_s_gi_o_vi_n_c_lan_anh`<br>`p05_teacher_profile_mobile_h_s_gi_o_vi_n_c_lan_anh_di_ng_xueyan` | `/teachers/lan-anh` | `TeacherProfile` | Lỗi, Thành công, Xác nhận | UI implemented; responsive checked |
| `p06_student_profile_desktop_h_s_h_c_vi_n_c_nh_n_xueyan`<br>`p06_student_profile_mobile_h_s_h_c_vi_n_di_ng_xueyan` | `/profile` | `StudentProfile` | Default | UI implemented; responsive checked |
| `p06_teacher_consultation_desktop_ng_k_t_v_n_gi_o_vi_n_xueyan`<br>`p06_teacher_consultation_mobile_ng_k_t_v_n_gi_o_vi_n_di_ng_xueyan` | `/teachers/lan-anh/consultation` | `ConsultationScreen` | Lỗi, Thành công, Xác nhận | UI implemented; responsive checked |
| `p07_about_desktop_gi_i_thi_u_n_n_t_ng_h_c_ti_ng_trung_xueyan`<br>`p07_about_mobile_gi_i_thi_u_n_n_t_ng_xueyan_di_ng` | `/about` | `AboutScreen` | Default | UI implemented; responsive checked |
| `p07_resource_library_desktop_th_vi_n_t_i_nguy_n_h_c_thu_t_xueyan`<br>`p07_resource_library_mobile_th_vi_n_t_i_nguy_n_h_c_thu_t_di_ng_xueyan` | `/resources` | `ResourceLibrary` | Đang tải, Không tìm thấy, Lỗi | UI implemented; responsive checked |
| `p08_help_center_desktop_trung_t_m_tr_gi_p_xueyan`<br>`p08_help_center_mobile_trung_t_m_tr_gi_p_di_ng_xueyan` | `/help` | `HelpScreen` | Không tìm thấy, Lỗi, Xác nhận | UI implemented; responsive checked |
| `p08_support_contact_desktop_li_n_h_h_tr_xueyan`<br>`p08_support_contact_mobile_li_n_h_h_tr_di_ng_xueyan` | `/contact` | `ContactScreen` | Lỗi, Thành công, Xác nhận | UI implemented; responsive checked |
| `t01_teacher_dashboard_desktop_b_ng_i_u_khi_n_gi_ng_vi_n_xueyan`<br>`t01_teacher_dashboard_mobile_b_ng_i_u_khi_n_gi_ng_vi_n_di_ng_xueyan` | `/teacher` | `TeacherDashboard` | Chưa có, Xác nhận | UI implemented; responsive checked |
| `t02_class_detail_desktop_chi_ti_t_qu_n_l_l_p_h_c_hsk_2_k24_xueyan`<br>`t02_class_detail_mobile_chi_ti_t_qu_n_l_l_p_h_c_hsk_2_k24_di_ng_xueyan` | `/teacher/classes/hsk2-k24` | `TeacherClassDetail` | Default | UI implemented; responsive checked |
| `t04_teacher_assignment_review_desktop_ch_m_b_i_nh_n_x_t_s_ph_m_xueyan`<br>`t04_teacher_assignment_review_mobile_ch_m_b_i_nh_n_x_t_di_ng_xueyan` | `/teacher/assignments/4` | `AssignmentReview` | Lỗi, Thành công, Lưu nháp | UI implemented; responsive checked |
| `t05_teacher_profile_editor_desktop_ch_nh_s_a_h_s_gi_o_vi_n_xueyan`<br>`t05_teacher_profile_editor_mobile_ch_nh_s_a_h_s_gi_o_vi_n_di_ng_xueyan` | `/teacher/profile` | `TeacherProfileEditor` | Thành công, chưa lưu, Lưu nháp | UI implemented; responsive checked |

## Validation and remaining integrations

Final lint (zero warnings), typecheck and production build pass. Route audit: 54 routes/internal links pass; three invalid dynamic IDs return 404. Browser: all 38 screens measured at 375, 768 and 1440px (114 checks), no horizontal overflow or clipped content detected. Dashboard/flashcard/catalog/profile/teacher layouts compared with reference screenshots; Dashboard additionally checked at source desktop/mobile sizes. Vietnamese/Pinyin use Be Vietnam Pro; Chinese language content uses Noto Sans SC. This is layout verification, not pixel-perfect approval. Authentication, persistence, SRS scheduling, uploads, classroom conferencing, consultation booking, assignment submission and grading require backend integrations. Demo UI can validate input and provide local drafts/session state only.


Interaction checks passed: mobile menu Tab/Shift+Tab trap, Escape and focus restoration; native dialog Escape; flashcard Space flip and numeric rating; dictionary numbered Pinyin search and empty results; teacher HSK range filter; collection creation in session; notification read filter; profile preview; auth form validation without false login success; Dashboard loading/error/retry and expired reset preview.

Artifacts: `ui-validation/routes.json`, `ui-validation/responsive.json`, Dashboard desktop/mobile PNGs. The detected-state column describes source text, not a promise of functioning server states. Server-success designs are represented as explicitly marked previews or unavailable service messages.

Remaining: real HSK datasets/SRS results, API/auth/authorization, draft restoration and server persistence, assignment uploads/submission/grading, classroom meetings, booking/contact delivery, actual teacher portraits and downloadable documents/audio, legal content. Current fixtures live in `frontend/lib/ui-demo-data.ts`; local/session changes are explicitly labelled. Speech playback uses browser speech synthesis and depends on installed Chinese voices.

Brand asset: retained the existing XUEYAN logo to honor the canonical Dashboard; the Stitch logo concept remains reference-only. Original `frontend/dasboard.html` and canonical `frontend/dashboard.html` both remain intact. No migration commit or push was made.

## Navigation follow-up — 2026-10-02

[x] Inventory 38 route templates and controls; correct mismatched targets; preserve word/session context; browser main-flow/mobile/Back/reload checks. See [navigation-audit.md](navigation-audit.md) for clicked vs code-only vs blocked results. Latest route audit: 66 valid paths, eight intentional invalid IDs/queries return 404. No auth or role bypass introduced.


## 2026-10-24 — Hồ sơ tài khoản và sổ từ thật

- [x] Avatar dùng tài khoản hiện tại, mở `/profile`; chỉnh sửa `/profile/edit` lưu SQL và ảnh riêng; tên/ảnh header cập nhật, reload giữ dữ liệu.
- [x] `/dictionary` mặc định dùng SQL; lưu từ không còn mở dialog đăng nhập cố định. `/collection` hiển thị từ đã lưu theo tài khoản.
- [x] Login/Register có logo XUEYAN và giao diện responsive mới; hỗ trợ quay lại trang yêu cầu đăng nhập.
- [x] Giữ learner/admin; giáo viên tiếp tục là hồ sơ nội dung, theo xác nhận của người dùng.
- [x] Kiểm thử API/ownership/refresh và thao tác desktop/mobile; dọn fixture riêng, không xóa bản nháp/localStorage.

Chi tiết và giới hạn: [hồ sơ và từ điển](account-profile-and-dictionary.md), [minh chứng](ui-validation/profile-dictionary-login/README.md).


## 2026-10-24 — Quyền riêng từng không gian

- [x] Theo yêu cầu mới: learner/teacher/admin, admin cấp teacher; không tự chuyển tài khoản hiện có.
- [x] Chặn tại server/page/layout và API, bỏ chuyển chế độ tự do, query demo không bỏ qua quyền.
- [x] Kiểm tra URL trực tiếp, sai vai trò, refresh và thao tác trình duyệt bằng fixture.

Xem [quyền không gian](workspace-role-access.md).

## 2026-11-02 — Hợp nhất luồng học viên

- [x] Dashboard/ôn tập/tiến độ dùng dữ liệu tài khoản SQL, bỏ số cố định và demo query trên các route chính.
- [x] HSK → học từ mới → lưu reviews → kết quả SQL → Dashboard/tiến độ; ôn tập chỉ lấy từ đến hạn thật.
- [x] Các URL bài học mẫu cũ redirect về học HSK 1; implementation ConnectedLearning/LearnerDashboard cũ tái sử dụng component thật.
- [x] Lint/typecheck/build và smoke API/HTTP production qua; fixture đã dọn.
- [ ] Bấm thử desktop/mobile/bàn phím: công cụ trình duyệt chưa khởi tạo được trong lượt này.

Chi tiết và giới hạn: [hợp nhất học viên](learner-flow-unification.md).

## 2026-11-02 — Tiếp tục hoàn thiện học viên

- [x] Khôi phục phiên Flashcard theo tài khoản/mode, đúng vị trí/mặt thẻ, xác minh lại hàng đợi và lượt học từ SQL.
- [x] Onboarding/cài đặt lưu SQL, gồm mục tiêu/giờ học/Pinyin; Dashboard nhận mục tiêu mới.
- [x] Khôi phục mật khẩu bằng token một lần và thu hồi phiên cũ; SMTP sender có cấu hình, thư local riêng khi Development chưa có SMTP.
- [x] API/draft tests, lint/typecheck/build qua; browser hoạt động lại và đã bấm các thao tác chính mobile/desktop. Các mục chưa bấm ở đợt trước vẫn là lịch sử kiểm tra đợt trước.
- [ ] Gửi email ra hộp thư thật: chờ có tài khoản SMTP và cấu hình trên server.

Chi tiết: [cài đặt và khôi phục](account-settings-and-recovery.md).
