# 🚀 VIBECODE PROJECT KICKSTART PROTOCOL

> [!IMPORTANT]
> **DÀNH CHO AI:** Đọc kỹ và thực thi các bước bên dưới ngay sau khi nhận được yêu cầu khởi đầu dự án. CÁC BƯỚC NÀY LÀ BẮT BUỘC.

## 📂 TỔNG HỢP CÁC REPO/CÔNG CỤ CÓ SẴN (SUMMARY)

Dưới đây là các nguồn dữ liệu chuyên dụng đã được cài đặt trên máy này để hỗ trợ các dự án khác nhau:

1. **GitNexus:** Công cụ phân tích mã nguồn và đánh giá tác động (luôn dùng cho code).
2. **Karpathy-Inspired Guidelines:** Quy chuẩn hành vi giúp AI lập trình đơn giản, chính xác.
3. **UI-UX-PRO-MAX-SKILL:** (`scratch/ui-ux-pro-max-skill`) Thư viện tiêu chuẩn thiết kế Website/App cao cấp.
4. **LLaMA-Factory:** (`VibeCode/LLaMA-Factory`) Công cụ dùng để training văn phong/nội dung.
5. **Content-SGCB Context:** (`VibeCode/content-sgcb`) Bao gồm quy tắc văn phong và phong cách viết cá nhân.
6. **Red Team Audit Workflow:** (`scratch/.agents/workflows/red-team-audit.md`) Quy trình kiểm định bảo mật, rà soát lỗi logic và tối ưu hiệu suất.

---

## 1. MANDATORY SETUP (Bắt buộc cho mọi dự án)

### Bước 1: Kích hoạt GitNexus (Code Intelligence)

AI phải chạy ngay lệnh phân tích mã nguồn để hiểu cấu trúc dự án:

- Lệnh: `npx gitnexus analyze` (nếu dự án đã có code).
- Sau đó, luôn chạy `impact analysis` trước khi sửa bất kỳ hàm hay symbol nào.

### Bước 2: Cài đặt và tuân thủ Karpathy Coding Rules

AI KHÔNG ĐƯỢC tự tóm tắt quy tắc theo ý mình. Phải dùng file nguyên bản:

- **Hành động:** Copy nguyên thư mục gốc: `C:\Users\thanh\VibeCode\scratch\andrej-karpathy-skills` vào thư mục dự án mới.
- **Hành động:** tuân thủ karpathy bắt đầu bằng việc đọc file cursor.md trong folder để điều chỉnh hành vi lập trình.

---

## 2. CONDITIONAL MODULES (Kích hoạt theo dự án)

### 🎨 Module: Thiết kế Giao diện (Web/UI/UX Design)

**Trường hợp:** Khi yêu cầu liên quan đến thiết kế Frontend, Website, hoặc Landing Page.

- **Hành động:** Copy toàn bộ nội dung/tiêu chuẩn từ thư mục gốc: `C:\Users\thanh\VibeCode\scratch\ui-ux-pro-max-skill` vào thư mục dự án mới.
- **Yêu cầu:** Sử dụng chính xác các guidelines trong thư mục này để thực hiện thiết kế.

### ✍️ Module: Sáng tạo nội dung (Content Strategy)

**Trường hợp:** Khi yêu cầu liên quan đến viết bài, kịch bản hoặc training văn phong.

- **Hành động:** Truy cập và đọc các file sau làm tài liệu tham khảo bắt buộc:
  - `C:\Users\thanh\VibeCode\content-sgcb\quy-tac-van-phong.md`
  - `C:\Users\thanh\VibeCode\content-sgcb\van-phong-ca-nhan.md`

### 🛡️ Module: Kiểm định (Red Team Audit)

**Điều kiện:** Chỉ chạy bước này KHI NGƯỜI DÙNG YÊU CẦU trực tiếp bằng lệnh `/red-team-audit`.
**Hành động:** Kích hoạt Workflow tại `C:\Users\thanh\VibeCode\scratch\.agents\workflows\red-team-audit.md`

---

## 3. HOW TO START

Copy file này vào thư mục dự án mới và đưa ra yêu cầu:
*"Bắt đầu dự án [Tên dự án] theo chuẩn VIBECODE KICKSTART. Mục tiêu là [Mô tả mục tiêu]."*
