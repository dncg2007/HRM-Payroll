# Quản lý Nhân sự & Tiền lương

Website mô phỏng quy trình quản lý nhân sự cho môn **Thiết kế Web**, lớp **25CT114**. Từ hồ sơ và hợp đồng, người dùng có thể theo dõi ngày công, duyệt nghỉ phép, ghi nhận thưởng hoặc phạt và lập bảng lương theo tháng.

**[Mở bản demo](https://dncg2007.github.io/HRM-Payroll/)** · [Ghi chú cập nhật](CHANGELOG.md)

## Chạy trên máy

```bash
git clone https://github.com/dncg2007/HRM-Payroll.git
cd HRM-Payroll
```

Mở `index.html` bằng trình duyệt. Dự án dùng HTML, CSS và JavaScript thuần, có thể chạy trực tiếp mà không cần cài package. Kết nối Internet để tải thư viện và phông chữ từ CDN.

Để thử lưu dữ liệu ổn định trên cả tám trang, có thể dùng địa chỉ demo hoặc phục vụ thư mục dự án qua HTTP. Nếu máy đã có Python, chạy `python -m http.server 8000` trong thư mục dự án rồi mở `http://localhost:8000`.

## Các trang chức năng

- [Tổng quan](index.html) hiển thị chỉ số nhân sự, quỹ lương, biểu đồ và hợp đồng sắp hết hạn.
- [Nhân viên](nhan-vien.html) hỗ trợ tìm kiếm, lọc, thêm, sửa và in hồ sơ. Có thể nhập hoặc xuất hồ sơ bằng CSV UTF-8.
- [Phòng ban](phong-ban.html) và [Chức vụ](chuc-vu.html) quản lý danh mục tổ chức.
- [Chấm công](cham-cong.html) ghi nhận công theo ngày, hỗ trợ chấm đủ công và xuất CSV.
- [Nghỉ phép](nghi-phep.html) cho phép tạo, duyệt hoặc từ chối đơn. Đơn đã duyệt cập nhật bảng công.
- [Khen thưởng và kỷ luật](khen-thuong.html) ghi nhận quyết định và đưa khoản thưởng, phạt vào kỳ lương tương ứng.
- [Bảng lương](bang-luong.html) tính lương theo kỳ hợp đồng, mức lương có hiệu lực, ngày công, phụ cấp, thưởng, phạt và khấu trừ mô phỏng. Có thể in phiếu lương và xuất CSV.

## Thử một kỳ lương

1. Mở trang **Nhân viên**, chọn một hồ sơ mẫu và xem thông tin hợp đồng.
2. Sang **Chấm công**, chọn tháng **10/2026**, cập nhật một ô ngày công rồi bấm **Lưu bảng công**. Có thể tạo và duyệt đơn tại **Nghỉ phép** để thử cập nhật bảng công từ đơn đã duyệt.
3. Mở **Bảng lương** và chọn cùng tháng để xem kết quả. Các quyết định thưởng, phạt có hiệu lực trong tháng cũng được đưa vào kỳ này.

## Lưu dữ liệu và sao lưu

Website nạp dữ liệu mẫu khi chưa có bản ghi đã lưu. Các thay đổi được lưu bằng `localStorage` theo trình duyệt và địa chỉ truy cập. Bản demo và bản chạy trên máy có kho dữ liệu riêng. Xóa dữ liệu trang trong trình duyệt sẽ xóa bản ghi cục bộ.

- **Sao lưu JSON** và **Khôi phục JSON** nằm trong thanh công cụ. Dùng JSON để chuyển hồ sơ, hợp đồng và dữ liệu nghiệp vụ giữa hai môi trường.
- **CSV hồ sơ** dùng để trao đổi danh sách nhân viên. Dùng tệp xuất làm mẫu nhập. Hệ thống báo số dòng lỗi hoặc trùng và chỉ thêm các dòng hợp lệ.

Dữ liệu và công thức lương phục vụ mô phỏng trong phạm vi môn học.

## Cấu trúc mã nguồn

```text
.
├── *.html                # Tám trang, bắt đầu tại index.html
├── css/                  # Design system, giao diện navy và CSS từng trang
├── js/
│   ├── data.js           # Dữ liệu mẫu và cấu hình demo
│   ├── kho-du-lieu.js    # Lưu cục bộ, sao lưu và khôi phục
│   ├── logic.js          # Quy tắc nghiệp vụ dùng chung
│   ├── csv-nhan-vien.js  # Đọc và ghi CSV hồ sơ
│   └── trang/            # Xử lý giao diện từng trang
├── assets/images/        # Ảnh đại diện minh họa
└── docs/                 # Tài liệu giao diện và thư viện
```

Giao diện hỗ trợ sáng/tối và dùng Bootstrap, Bootstrap Icons, Chart.js, CountUp, AOS, Animate.css và phông Be Vietnam Pro. Xem thêm [sơ đồ trang](docs/sitemap.md), [hệ thống thiết kế](docs/design-system.md) và [cách tích hợp thư viện](docs/thu-vien.md).

## Thành viên nhóm

- Ngô Sỹ Nhân
- Nguyễn Minh Nhật
- Nguyễn Võ Gia Huy
- Võ Quỳnh Tuấn Anh
- Đặng Nguyễn Công Gianh

## Quy ước Git

Tạo nhánh `feature/*` và mở Pull Request về `main`. Ghi commit theo mẫu `[Loại]: mô tả`, ví dụ `[Docs]: Cập nhật hướng dẫn chạy website`.
