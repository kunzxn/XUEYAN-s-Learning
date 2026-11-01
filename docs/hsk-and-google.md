# HSK thật, giao diện gọn và đăng nhập Google

## Thay đổi ngày 24/10/2026

- Rút gọn nội dung trang chủ, Dashboard mẫu và màn hình đăng nhập/học thật; dùng icon có tên truy cập cho nghe phát âm, chọn HSK, từ đã học và đăng xuất. Hướng dẫn ôn tập, nguồn dữ liệu và nghĩa dài có thể mở rộng.
- `/vocabulary` đọc số từ từ SQL Server; `/vocabulary/hsk-{level}` tìm kiếm và phân trang 30 từ. `/learn?level={level}` học đúng cấp, chuyển sang nhóm 30 từ tiếp theo khi hoàn tất nhóm hiện tại; đánh giá vẫn lưu vào tài khoản qua API hiện có.
- Không tự tạo bài học/chuyên đề từ danh sách từ. Các màn hình bài học, từ điển và Dashboard mẫu khác vẫn giữ phạm vi hiện có.

## Dữ liệu đã nhập

Nguồn: `data/HSK-3.0-words-list-main/HSK list with meaning/HSK *.tsv`. 11.036 dòng nguồn → 10.939 mục từ phân biệt theo chữ giản thể + Pinyin, 11.036 liên kết cấp độ. Một từ có thể thuộc nhiều cấp. Chạy lại không nhân đôi, không cập nhật nội dung từ đã có hay tiến độ học. Thứ tự hiển thị theo TSV nguồn; không phụ thuộc thứ tự identity khi bulk insert.

| Nhóm | Từ trong TSV đã nhập |
| --- | ---: |
| HSK 1 | 497 |
| HSK 2 | 763 |
| HSK 3 | 966 |
| HSK 4 | 994 |
| HSK 5 | 1.067 |
| HSK 6 | 1.134 |
| HSK 7–9 | 5.615 |

Đây là số mục trong file có nghĩa, không phải số từ tích lũy/định mức thi HSK. Các file danh sách chữ thuần có mục lặp và 6 chữ chưa có trong bộ TSV (HSK 2: 1, HSK 4: 1, HSK 7–9: 4); chưa tự bịa Pinyin/nghĩa cho các mục thiếu.

Nguồn nghĩa là **tiếng Anh, chưa hiệu đính**; dữ liệu có thể có nghĩa nhiễu. Lưu riêng `MeaningEn`, giữ `MeaningVi`/Hán–Việt trống khi chưa biên soạn; UI đánh dấu EN. Không gắn nhãn tiếng Việt cho nghĩa tiếng Anh. Cần biên tập bản dịch và chất lượng nguồn trong đợt nội dung tiếp theo.

Nguồn tác giả: [krmanik/HSK-3.0-words-list](https://github.com/krmanik/HSK-3.0-words-list), tham chiếu CC-CEDICT/Wiktionary và nguồn khác theo README gốc. Xem `data/HSK-3.0-words-list-main/License.md`, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Giữ toàn bộ nguồn trong `data/`, không sao chép vào public.

Máy khác cần SQL Server và chạy từ gốc repository:

```powershell
.\backend\database\sqlserver\Initialize-Database.ps1
cd backend/api
dotnet run -- --import-hsk
dotnet run
```

Import là lệnh bảo trì tường minh, không chạy mỗi lần khởi động web. API danh sách chung cũ vẫn giới hạn 200 từ, ưu tiên từ xuất bản gần nhất; danh mục HSK dùng API phân trang riêng.

## Bật Google thật

Đã triển khai Google Identity Services → backend xác minh chữ ký RS256 bằng khóa công khai Google qua OIDC discovery, issuer/audience/expiry/nonce/email_verified → liên kết bằng `sub` → session JWT/refresh cookie HttpOnly hiện có. Không lưu token Google trong localStorage. Tài khoản mới luôn là learner; quyền admin chỉ đọc từ SQL. Không tự ghép tài khoản cũ theo email: email trùng tài khoản mật khẩu trả 409, cần đăng nhập mật khẩu; UI liên kết tài khoản chưa triển khai.

Chưa có OAuth Client ID trong cấu hình workspace nên Google hiện **chưa được bật**, không có đăng nhập Google thành công giả. Không cần Client Secret cho luồng GIS nhận ID token này.

1. Tạo OAuth client loại **Web application** trong Google Cloud; cấu hình consent screen/test users khi ứng dụng ở Testing.
2. Authorized JavaScript origins: địa chỉ frontend thực tế, ví dụ `http://localhost:3000`. Thêm đúng origin khác nếu dùng host/cổng khác; kiểm thử ở đây dùng `http://localhost:3108`.
3. Trong PowerShell tại `backend/api`:

```powershell
$env:Google__ClientId = "CLIENT_ID_CUA_BAN.apps.googleusercontent.com"
dotnet run
```

4. Reload trang đăng nhập. Frontend tự nhận Client ID công khai qua `/auth/google/config`, không cần thêm secret vào frontend hoặc build lại. Khi chưa cấu hình, nút Google bị vô hiệu hóa kèm lý do.

Tham khảo [Google: xác minh ID token phía server](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token). Không dùng endpoint tokeninfo thử nghiệm để xác thực production.

## Kiểm chứng

- Migration 008 áp dụng SQL Server local; import hai lần không tăng số từ; thêm thứ tự nguồn không sửa nội dung từ.
- Unit tests lịch ôn/cache/validation và token Google dùng RSA fixture: đúng chữ ký, sai issuer/audience/nonce, email chưa xác minh, hết hạn, sai khóa.
- Smoke HTTP: auth, CRUD, RLS/ownership, JWT/refresh, idempotence, lịch ôn và cache; repository Google kiểm tra subject ổn định, tài khoản mới learner không có mật khẩu, email trùng không tự liên kết; tài khoản thử riêng, dọn bằng runner sau kiểm tra.
- Catalog HTTP: đủ 7 nhóm, số lượng khớp, 30 từ/trang, tìm chữ Hán; page=0/pageSize=101 trả 400, cấp không tồn tại trả 404. Google chưa cấu hình trả enabled=false và POST trả 503.
- Chưa kiểm chứng đăng nhập bằng tài khoản Google thật vì thiếu OAuth Client ID. Chưa có UI liên kết Google cho tài khoản mật khẩu cũ.

Ảnh và kết quả thao tác trình duyệt: `docs/ui-validation/hsk-google/`.

## Sửa lỗi phiên Google khi tải trang nhiều lần

Client ID đã được cung cấp và cấu hình Development. Chưa khẳng định đăng nhập Google thật đã thành công.

Đã sửa khả năng nonce của nút bị lệch cookie: endpoint config giữ mã hợp lệ của cùng trình duyệt; frontend xếp tuần tự yêu cầu config, kể cả effect bị hủy trong React development. Không tắt kiểm tra nonce/chữ ký/audience/email. Thông báo phân biệt phiên bị thay đổi, email chưa xác minh và định danh không hợp lệ; bỏ kiểm tra trùng lặp trong service.

Kiểm chứng: unit RSA dùng email_verified kiểu boolean JSON, sai nonce/issuer/audience/signature/expiry vẫn bị từ chối; unit endpoint config kiểm tra tạo/giữ/thay mã hỏng. HTTP cổng thử 5111: gọi config nhiều lần giữ nonce, cookie jar khác nhận nonce khác. Lint component Google và typecheck frontend qua. NuGet audit có cảnh báo NU1900 do không truy cập được dịch vụ kiểm tra lỗ hổng; build/unit vẫn chạy thành công. Người dùng cần khởi động lại backend và reload frontend để dùng bản sửa.
