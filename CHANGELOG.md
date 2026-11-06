# Ghi chú cập nhật

## Dọn mã nguồn website

- Gỡ các script SQL của đề tài khác. Website lưu dữ liệu trên trình duyệt bằng `localStorage`.

## Sửa bản in hồ sơ nhân viên

- Dành đủ chiều rộng cho cột nội dung và bỏ khung cuộn khi in để hiển thị đầy đủ các nhóm thông tin.

## Hoàn thiện website Quản lý Nhân sự và Tiền lương

Các thay đổi dưới đây được đối chiếu với nhánh `main` tại commit `ab77cc4`.

### Tổng quan và giao diện

- Mở rộng điều hướng từ 5 lên 8 trang. Thêm tìm kiếm nhanh nhân viên, phòng ban và chức vụ từ thanh đầu trang.
- Cập nhật giao diện màu navy và đồng bộ chế độ sáng/tối với Bootstrap. Bổ sung ảnh đại diện minh họa cho hồ sơ mẫu.
- Nâng cấp biểu đồ tổng quan với Chart.js và hiệu ứng KPI với CountUp. Dùng AOS và Animate.css cho hiệu ứng giao diện.

### Nhân viên, phòng ban và chức vụ

- Bổ sung nhập/xuất hồ sơ bằng CSV UTF-8. Báo lỗi theo dòng và bỏ qua hồ sơ không hợp lệ hoặc trùng dữ liệu.
- Xác định trạng thái làm việc theo hợp đồng tại ngày tham chiếu và kiểm tra ngày nghỉ việc theo thời hạn hợp đồng.
- Cập nhật giao diện và hộp thoại quản lý phòng ban, chức vụ và hồ sơ nhân viên.

### Chấm công, nghỉ phép và khen thưởng

- Thêm trang Chấm công để ghi nhận ngày công và xuất bảng công.
- Thêm trang Nghỉ phép để lập, duyệt hoặc từ chối đơn. Đơn được duyệt cập nhật bảng công và hệ thống chặn các đơn trùng ngày đã duyệt.
- Thêm trang Khen thưởng và Kỷ luật để quản lý quyết định và chuyển các khoản thưởng, phạt vào kỳ lương tương ứng.

### Bảng lương

- Xác định kỳ làm việc và mức lương theo hợp đồng, ngày hiệu lực và tháng được chọn.
- Tính lương theo ngày công, phụ cấp, thưởng, phạt và khấu trừ bảo hiểm mô phỏng.
- Bổ sung chi tiết phiếu lương, chức năng in phiếu và xuất CSV.

### Dữ liệu và mã nguồn

- Mở rộng kho dữ liệu trình duyệt với sao lưu và khôi phục JSON, kiểm tra dữ liệu nhập và phát hiện bản ghi đã thay đổi ở tab khác.
- Thay `js/features.js` bằng các tệp xử lý riêng trong `js/trang/` và tiện ích giao diện dùng chung. Cập nhật sơ đồ trang, tài liệu thiết kế và hướng dẫn tích hợp thư viện.
- Website chạy độc lập ở phía trình duyệt.
