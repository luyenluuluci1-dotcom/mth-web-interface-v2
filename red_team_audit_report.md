# Báo cáo Red Team Audit

## 1. Danh sách file thay đổi & Bán kính sát thương (Blast Radius)

**File đã thay đổi:**

- `admin/config.yml` (Thay đổi tại đoạn thiết lập `backend` cho CMS).

**Bán kính sát thương:**
Các thay đổi này ảnh hưởng trực tiếp đến quy trình đăng nhập (Authentication Flow) của hệ thống quản trị nội dung Sveltia/Decap CMS. Không tác động đến frontend của người dùng (end-users), nhưng là cánh cổng duy nhất để các nhân viên truy cập hệ thống CMS.
Thay đổi từ `auth_endpoint: auth` sang `auth_endpoint: /auth` quyết định đường dẫn gọi API xác thực đến proxy Vercel (`mth-cms-auth.vercel.app`).

## 2. Danh sách lỗi tiềm ẩn & Đánh giá

- **[P1] - Rủi ro đứt gãy luồng xác thực (Authentication Routing Flow):**
  - Việc cấu hình `auth_endpoint: /auth` khi kết hợp với `base_url: https://mth-cms-auth.vercel.app` có thể dẫn đến việc gọi API theo đường dẫn `https://mth-cms-auth.vercel.app//auth` (có 2 dấu gạch chéo phụ thuộc vào hành vi nối chuỗi của thư viện Sveltia/Decap CMS). Điều này dẫn đến nguy cơ Vercel Router trả về lỗi 404 (Not Found), chặn đứng khả năng nhân viên đăng nhập.
  
- **[P2] - Điểm mù về Single Point of Failure (An toàn hệ thống Proxy):**
  - Với Data Flow hiện trường thông báo giao tiếp thẳng tới Proxy Vercel cho việc chứng thực. Tuy code proxy không nằm trong repo này nhưng nếu ứng dụng Vercel chưa được cập nhật CORS headers cho domain Git/GitHub pages của dự án (hoặc ngược lại proxy gặp cold-start request quá trễ), token authentication có nguy cơ timeout.

- **[P2] - Tiềm ẩn thiếu cơ chế phân quyền (Authorization Edge Case):**
  - Mặc định cơ chế custom OAuth app Vercel sẽ mở cho tất cả người dùng GitHub nào có tài khoản chứng thực hợp lệ. Nếu tại proxy server không cấu hình giới hạn chỉ cho phép các Github username/email là nhân sự bên trong (Authorized Staff) mới được phát cấp access token vào repo `luyenluuluci1-dotcom/mth-web-interface-v2`, có nguy cơ người ngoài cũng có thể login và làm giả CMS data. (Chaos Testing: Bất kỳ Github ID null/random nào khi chứng thực xong cũng có thể pass qua CMS nếu proxy chỉ làm mỗi tác vụ hoán đổi Token mà không check role).

## 3. Đề xuất sửa đổi (Ý tưởng kiến trúc)

1. **Tinh chỉnh Integration Config:**
   - Test chắc chắn hành vi nối `base_url` và `auth_endpoint` của CMS framework. Khuyến nghị cấu hình thiết lập tĩnh chính xác (Ví dụ xóa Slash đi nếu base_url là chuẩn, hoặc khai báo Full URL).
2. **Cơ chế phòng vệ tại OAuth Proxy (Vercel Boundary):**
   - Đảm bảo tại mã nguồn của dự án proxy trên Vercel phải có cấu trúc Whitelist hoặc phân quyền tổ chức (Organization Permissions) chỉ mở cấp phát Auth Token cho tài khoản của nhân viên đã được duyệt.
3. **Giám sát đứt gãy mạng:**
   - Khi frontend giao tiếp nhận Access Token, nên có cơ chế fallback hoặc thông báo rõ nếu Proxy gặp sự cố 500 hoặc 404 nhằm tránh "ảo giác" màn hình bị treo lúc bấm nút Login.
