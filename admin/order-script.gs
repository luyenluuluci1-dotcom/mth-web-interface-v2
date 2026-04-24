// =============================================================================
// MTH Beauty - Order System Submissions via Google Apps Script
// =============================================================================
// HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT GUIDE):
// 1. Truy cập https://script.google.com/ và tạo một dự án mới (New Project).
// 2. Xóa sạch code cũ và dán toàn bộ đoạn code ở dưới vào.
// 3. Tạo một file Google Sheet mới tại https://sheets.google.com/.
//    Lấy chuỗi ID từ URL của Sheet. View the URL:
//    https://docs.google.com/spreadsheets/d/[ĐÂY LÀ ID]/edit
// 4. Thay thế biến SHEET_ID bên dưới bằng ID vừa copy.
// 5. [Tuỳ chọn] Thiết lập tên 2 tab (sheets) trong file Google Sheet: "DonHang" và "ClickTracking" (hoặc tự động đổi tên trong Sheet).
// 6. Nhấn nút "Deploy" -> "New deployment" ở góc phải phía trên.
// 7. Chọn Type là "Web app".
// 8. Security/Who has access: Chọn "Anyone" (Tất cả mọi người).
// 9. Deploy và COPY địa chỉ URL của Web app (chạy dưới dạng https://script.google.com/macros/s/.../exec).
// 10. Quay lại file `js/main.js` trên website và dán URL vào hằng số `ORDER_SCRIPT_URL`.
// =============================================================================

const SHEET_ID = 'THAY_BẰNG_GOOGLE_SHEET_ID_CỦA_BẠN'; 
const ORDER_SHEET_NAME = 'DonHang';
const CLICK_SHEET_NAME = 'ClickTracking';

// Hàm xử lý POST request từ Website
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    
    // Parse data từ string JSON hoặc fallback sang post data dạng payload
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    // Log click từ shopee_link
    if (data.type === 'shopee_click') {
      let clickSheet = sheet.getSheetByName(CLICK_SHEET_NAME);
      if (!clickSheet) {
        clickSheet = sheet.insertSheet(CLICK_SHEET_NAME);
        clickSheet.appendRow(['Thời gian', 'Tên sản phẩm', 'Mã SP (Slug)', 'Giá hiện tại', 'Shopee Link']);
      }
      clickSheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.product_name || '',
        data.product_slug || '',
        data.price || '',
        data.shopee_link || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Click recorded' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Log Order (Modal Form)
    let orderSheet = sheet.getSheetByName(ORDER_SHEET_NAME);
    if (!orderSheet) {
      orderSheet = sheet.insertSheet(ORDER_SHEET_NAME);
      orderSheet.appendRow(['Thời gian (Timestamp)', 'Họ Tên', 'Số điện thoại', 'Ngày Sinh', 'Địa chỉ giao hàng', 'Sản phẩm', 'Giá trị', 'Số lượng', 'Tổng tiền', 'Ghi chú']);
    }
    
    const quantity = parseInt(data.quantity) || 1;
    const price = parseInt(data.product_price) || 0;
    const total = quantity * price;
    
    orderSheet.appendRow([
      new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.birthday || '',
      data.address || '',
      data.product_name || '',
      price,
      quantity,
      total,
      data.note || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Xử lý CROS (Cross-Origin Resource Sharing) cho Option Request
function doOptions(e) { 
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
