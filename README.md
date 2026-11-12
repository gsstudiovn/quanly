# GS.studio – App quản lý nội bộ

Web app quản lý booking, lịch chụp, công việc, tài chính và báo cáo cho GS.studio.
Chạy trên điện thoại và máy tính, có thể "Thêm vào màn hình chính" như một app.

**Các file**

| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ app (giao diện + CONFIG + code) |
| `manifest.webmanifest`, `sw.js` | Cho phép cài lên màn hình chính và mở khi mất mạng |
| `images/` | Logo và icon app |

Bản đang chạy dùng **dữ liệu chung trên Firebase** (mục 2), bắt đầu trống – không có dữ liệu mẫu.

---

## 1. Sửa CONFIG

Mở `index.html`, phần `const CONFIG = { … }` nằm ngay đầu file, có chú thích tiếng Việt cho từng mục.

| Muốn đổi | Sửa ở đâu |
|---|---|
| Thành viên, vai trò, kỹ năng | `team` (hoặc trong app: Cài đặt → Thành viên) |
| Mã PIN | Trong app: Cài đặt → Thành viên → **Đặt PIN mới** (CONFIG chỉ lưu PIN đã mã hoá) |
| Giá gói, extra, % cọc, số ngày trả ảnh | `pricing`, `extraHourPrice`, `extraRetouchPrice`, `depositPct`, `deliveryDays` (hoặc Cài đặt) |
| Nguồn khách, địa điểm, chiến dịch, loại chi phí | `sources`, `locations`, `campaigns`, `expenseCategories` (hoặc Cài đặt) |
| Tên trạng thái | `statuses` → chỉ đổi `name`/`color`, **không đổi `id`** |
| Nơi lưu dữ liệu | `useFirebase`, `firebaseConfig` (xem mục 2) |

Lưu ý:
- Những gì Quản lý chỉnh trong tab **Cài đặt** được lưu cùng dữ liệu và **ưu tiên hơn** CONFIG.
- Giá ghi số nguyên, không dấu chấm: `599000`.
- Sau khi sửa `index.html`, nên tăng `VERSION` trong `sw.js` (vd `gsql-v2`) để điện thoại tải bản mới.

**Phân quyền**

| Vai trò | Được làm gì |
|---|---|
| `manager` (Quản lý) | Sửa tất cả, đổi cài đặt, đặt PIN, xoá booking |
| `member` (Thành viên) | Tạo booking; chỉ sửa booking mình tạo hoặc được phân công; chỉ sửa việc của mình |
| `viewer` (Chỉ xem) | Chỉ thấy Tổng quan + Báo cáo, không sửa được gì |

---

## 2. Dữ liệu chung (Firebase) – ĐÃ BẬT

App đang dùng project Firebase **gsstudio-quanly** (tài khoản Google của Vân Lam), dữ liệu đặt ở máy chủ Singapore.
Mọi máy đăng nhập đều thấy cùng một dữ liệu, cập nhật tức thì. Mất mạng vẫn xem và ghi được; khi có mạng lại, app tự đồng bộ
(góc trên hiện “Ngoại tuyến” / “Đang đồng bộ…” / “Đã đồng bộ”).

**Cách vào app (mỗi máy làm 1 lần):**
1. Mở web → bấm **Đăng nhập bằng Google** → chọn tài khoản Google đã được cấp quyền.
2. Chọn tên mình + nhập PIN. Những lần sau chỉ cần PIN.

**Thêm / bớt người dùng:** chủ project (Vân Lam) vào **Cài đặt → Truy cập dữ liệu chung**,
nhập email Google của từng người (mỗi dòng một email) → **Lưu danh sách**. Gỡ email ra là người đó mất quyền ngay.
Người chưa được cấp quyền đăng nhập sẽ thấy màn hình “chưa được cấp quyền” kèm nút sao chép email để gửi cho Quản lý.

**Bảo mật:** luật bảo mật trên Firebase chỉ cho tài khoản trong danh sách đọc/ghi. `firebaseConfig` trong `index.html`
là thông tin nhận diện công khai, không phải mật khẩu. PIN chỉ để biết ai đang thao tác – hãy đổi PIN mặc định.

**Xem dữ liệu gốc:** <https://console.firebase.google.com/project/gsstudio-quanly/firestore> (đăng nhập tài khoản chủ project).
**Sao lưu:** Cài đặt → **Xuất JSON** mỗi tuần (gói miễn phí không có sao lưu tự động).

**Dữ liệu cũ nhập ở bản thử:** mở app trên đúng máy/trình duyệt đã nhập → Cài đặt → **Đưa lên dữ liệu chung**.

**Giới hạn gói miễn phí (Spark):** 50.000 lượt đọc, 20.000 lượt ghi mỗi ngày, 1 GB dữ liệu – dư sức cho studio 4–5 người.

---

## 3. Đưa lên web và giới hạn truy cập

### Cách đang dùng: GitHub Pages

Repo `gsstudiovn/quanly` → <https://gsstudiovn.github.io/quanly/>. Mỗi lần sửa file trên GitHub, web tự cập nhật sau 1–2 phút.

GitHub Pages miễn phí yêu cầu repo **công khai** và **không có mật khẩu**. Vì vậy:
- **Không ghi dữ liệu khách hay mật khẩu vào file**. Dữ liệu chỉ nằm trong trình duyệt hoặc Firebase.
- App đã có thẻ `noindex` để Google không đưa lên kết quả tìm kiếm.
- Dữ liệu thật nằm trên Firebase và chỉ tài khoản trong danh sách mới xem được (mục 2).

### Cách khác: Netlify

1. Vào <https://app.netlify.com/drop>, kéo cả thư mục (chứa `index.html`, `sw.js`, `manifest.webmanifest`, `images/`) vào. Không cần build command; publish directory là thư mục gốc.
2. **Site configuration → Change site name** để đặt tên dễ nhớ.
3. Muốn có mật khẩu cho cả trang: dùng **Site configuration → Access & security → Password protection**. Đây là tính năng của gói trả phí Netlify.
   Gói miễn phí thì dựa vào Firebase Auth + Rules như trên.

### Cài lên điện thoại

- **iPhone:** mở bằng Safari → nút Chia sẻ → **Thêm vào MH chính**.
- **Android:** mở bằng Chrome → menu ⋮ → **Thêm vào màn hình chính**.

---

## Sao lưu

Cài đặt → **Xuất JSON** (sao lưu toàn bộ) hoặc **Xuất CSV** (mở bằng Excel).
Nên xuất JSON mỗi tuần, nhất là khi còn dùng chế độ lưu trên trình duyệt.
