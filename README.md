# GS.studio – App quản lý nội bộ

Web app quản lý booking, lịch chụp, công việc, tài chính và báo cáo cho GS.studio.
Chạy trên điện thoại và máy tính, có thể "Thêm vào màn hình chính" như một app.

**Các file**

| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ app (giao diện + CONFIG + code) |
| `manifest.webmanifest`, `sw.js` | Cho phép cài lên màn hình chính và mở khi mất mạng |
| `images/` | Logo và icon app |

Mở lần đầu, app tự tạo **10 booking mẫu** để xem thử. Xoá chúng trong **Cài đặt → Dữ liệu & sao lưu → Xoá dữ liệu mẫu**.

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

## 2. Bật Firebase để cả team dùng chung

Mặc định app lưu trên **trình duyệt từng máy**: mỗi người một dữ liệu riêng, xoá lịch sử duyệt web là mất. Chỉ dùng để thử. Làm việc nhóm thì bật Firebase (gói miễn phí Spark là đủ cho studio nhỏ).

1. Vào <https://console.firebase.google.com> → **Add project** → đặt tên (vd `gsstudio-quanly`) → có thể tắt Google Analytics.
2. **Build → Firestore Database → Create database** → chọn vị trí `asia-southeast1` (Singapore) → chọn **Production mode**.
3. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
4. Tab **Users → Add user**: tạo tài khoản cho team. Có thể dùng 1 tài khoản chung cho cả team, hoặc mỗi người 1 email.
   Mỗi máy chỉ cần đăng nhập email/mật khẩu này **một lần**, sau đó mọi người vẫn chọn tên + PIN như bình thường.
5. **⚙ Project settings → General → Your apps → biểu tượng `</>` (Web)** → đặt tên → **Register app** → copy đoạn `firebaseConfig`.
6. Dán các giá trị vào `CONFIG.firebaseConfig` trong `index.html`, rồi đổi `useFirebase: true`.
7. **Firestore → Rules**, dán quy tắc sau (thay email bằng email ở bước 4) → **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null
           && request.auth.token.email in ['team.gsstudio@gmail.com'];
       }
     }
   }
   ```

   Chỉ tài khoản đã đăng nhập **và** nằm trong danh sách email mới đọc/ghi được dữ liệu.
8. **Authentication → Settings → Authorized domains → Add domain**: thêm tên miền web, ví dụ `gsstudiovn.github.io` (và tên miền Netlify nếu dùng).
9. **Chuyển dữ liệu cũ sang:**
   - Trên máy đang có dữ liệu (bản cũ): Cài đặt → **Xuất JSON**.
   - Sau khi bật Firebase, đăng nhập Quản lý → Cài đặt → **Nhập JSON**.

> Mã PIN chỉ để phân biệt ai đang thao tác và tránh bấm nhầm. Lớp bảo vệ dữ liệu thật sự là **Firebase Auth + Rules** ở bước 4 và 7.

---

## 3. Đưa lên web và giới hạn truy cập

### Cách đang dùng: GitHub Pages

Repo `gsstudiovn/quanly`. Mỗi lần sửa file trên GitHub, web tự cập nhật sau 1–2 phút.

GitHub Pages miễn phí yêu cầu repo **công khai** và **không có mật khẩu**. Vì vậy:
- **Không ghi dữ liệu khách hay mật khẩu vào file**. Dữ liệu chỉ nằm trong trình duyệt hoặc Firebase.
- App đã có thẻ `noindex` để Google không đưa lên kết quả tìm kiếm.
- Khi làm việc thật, **bật Firebase** (mục 2) để chỉ tài khoản trong danh sách mới xem được dữ liệu.

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
