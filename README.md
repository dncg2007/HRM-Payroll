# Website Quản lý Nhân sự & Tiền lương (HRM & Payroll)

Dự án front-end cho môn Thiết kế Web lớp 25CT114. Hệ thống mô phỏng quản lý nhân viên, hồ sơ nhanh, thống kê quân số và bảng lương theo dữ liệu mẫu front-end.

Xem [ghi chú cập nhật](CHANGELOG.md) để đối chiếu với bản trước.

## Công nghệ

- HTML5 Semantic
- CSS3 Design System, Mobile First, Grid/Flexbox
- JavaScript ES6 thuần
- Thư viện bên ngoài (CDN, chi tiết tại [docs/thu-vien.md](docs/thu-vien.md)):
  - Bootstrap 5.3 + Bootstrap Icons 1.11 — Dropdown, Tabs, Accordion, Carousel, Tooltip, icon font
  - Google Fonts — Be Vietnam Pro (font thương hiệu hỗ trợ tiếng Việt)
  - AOS 2.3 — hiệu ứng xuất hiện khi cuộn; Animate.css 4.1 — animation dialog/form
  - CountUp.js 2.8 — số KPI đếm tăng; Chart.js 4.4 — biểu đồ bar/doughnut/line
  - Bảng màu gradient tinh chỉnh theo quy tắc harmony của Adobe Color
- Không backend trong phạm vi front-end

## Cấu trúc thư mục

```text
.
├── *.html                  # 8 trang, bắt đầu tại index.html
├── css/
│   ├── styles.css          # Design system chính (token, component)
│   ├── navy.css            # Theme navy của hệ thống
│   ├── tong-quan.css       # CSS riêng trang Tổng quan
│   └── thu-vien.css        # Lớp cầu nối thư viện ↔ design system
├── js/
│   ├── data.js            # Dữ liệu mẫu và cấu hình demo
│   ├── kho-du-lieu.js     # Đọc và lưu dữ liệu trong trình duyệt
│   ├── logic.js           # Xử lý dữ liệu và nghiệp vụ
│   ├── csv-nhan-vien.js   # Định dạng nhập và xuất hồ sơ CSV
│   ├── giao-dien.js       # Tiện ích giao diện dùng chung
│   ├── theme.js           # Chế độ sáng/tối (đồng bộ data-bs-theme)
│   ├── thu-vien.js        # Bộ điều phối thư viện (AOS, tooltip, CountUp)
│   └── trang/            # Mỗi trang HTML tải một tệp xử lý riêng
├── assets/images/
├── docs/
└── prompt_log.md
```

## Cách chạy

Mở trực tiếp `index.html` bằng trình duyệt. Không cần cài package hay chạy backend.

## Link demo

https://dncg2007.github.io/web-qlns-tl/

<!-- TODO: Cập nhật sau khi bật GitHub Pages trên repository. -->

## Chức năng đã thực hiện

### Tổng quan — `index.html`

- Chỉ số tổng nhân viên, số người đang làm, quỹ lương và lương trung bình.
- Quỹ lương và lương trung bình từ Data Contract.
- Quân số theo phòng ban.
- Biểu đồ quân số theo phòng ban và phân bố giới tính bằng Chart.js.
- Danh sách hợp đồng sắp hết hạn.
- Lối tắt đến trang Nhân viên và Bảng lương.
- Chuyển giao diện Sáng/Tối, lưu lựa chọn bằng `localStorage` và tôn trọng thiết lập hệ điều hành.

### Nhân viên — `nhan-vien.html`

- Tìm kiếm không dấu theo họ tên, mã và điện thoại.
- Lọc theo phòng ban và trạng thái.
- Thống kê quân số toàn bộ danh sách.
- Form thêm nhân viên có validation thuần JavaScript.
- Hồ sơ nhanh và nút Xem hồ sơ.
- Ngày nghỉ việc phải nằm trong thời gian hiệu lực của một hợp đồng. Nếu đặt ngày nghỉ trong tương lai, hồ sơ vẫn hiển thị theo trạng thái tại ngày tham chiếu của bản demo.
- Trạng thái làm việc được xác định theo thời hạn hợp đồng tại ngày tham chiếu. Ngày kết thúc được tính là ngày cuối cùng hợp đồng còn hiệu lực.
- Nhập và xuất CSV UTF-8 theo tên cột. Dùng tiêu đề trong tệp xuất làm mẫu và có thể đổi thứ tự cột. Cột phòng ban nhận mã hoặc tên đã có trong hệ thống.
- Khi nhập CSV, hệ thống chỉ thêm hồ sơ hợp lệ. Các dòng lỗi hoặc trùng mã, giấy tờ hay số điện thoại được liệt kê theo số dòng. CSV chỉ chứa hồ sơ nhân viên. Dùng sao lưu JSON để lưu cả hợp đồng và dữ liệu nghiệp vụ.
- Khi xuất CSV, các ô văn bản có tiền tố công thức được đánh dấu để Excel đọc dưới dạng văn bản.
- Bảng responsive mobile card.

### Bảng lương — `bang-luong.html`

- Chọn tháng và phòng ban.
- Xét hợp đồng có hiệu lực trong tháng đã chọn. Hồ sơ chưa có hợp đồng dùng trạng thái nhân viên để xác định có đưa vào bảng lương hay không.
- Ưu tiên mức lương có hiệu lực trong kỳ. Lương đề xuất được dùng khi chưa có mức lương có hiệu lực.
- Ngày công chuẩn là số ngày từ thứ Hai đến thứ Sáu trong tháng. Ngày công được tính trong thời gian hợp đồng có hiệu lực, ưu tiên chấm công đã lưu rồi đến dữ liệu công mẫu. Nếu cả hai đều trống, dùng lịch làm việc trong thời gian hợp đồng.
- Dữ liệu mẫu chỉ có tổng công tháng được phân bổ vào những ngày làm việc đầu tiên. Khi chỉ sửa một vài ngày, hệ thống giữ mốc công mẫu cho các ngày còn lại.
- Tính thực lĩnh theo lương ngày công, phụ cấp, thưởng, phạt và khấu trừ bảo hiểm mô phỏng.
- Tổng hợp quỹ lương, in phiếu lương và xuất CSV.

### Các trang quản lý khác

- `phong-ban.html` và `chuc-vu.html` quản lý danh mục tổ chức.
- `cham-cong.html` ghi và xuất bảng công theo ngày.
- `nghi-phep.html` tạo, duyệt và từ chối đơn. Mỗi ngày làm việc trong đơn phải có hợp đồng hiệu lực. Khi duyệt, hệ thống ghi ký hiệu vào bảng chấm công và khóa xóa đơn. Đơn trùng ngày đã duyệt sẽ bị chặn. Thao tác chấm đủ công giữ các ngày nghỉ đã duyệt.
- `khen-thuong.html` quản lý quyết định khen thưởng, kỷ luật và đưa các khoản tương ứng vào bảng lương theo tháng.

## Data Contract v1.1

| Thực thể | Khóa chính / liên kết | Ghi chú |
|---|---|---|
| `PhongBan` | `MaPB`, `MaTruongPhong` | Phòng ban và trưởng phòng |
| `NhanVien` | `MaNV`, `MaPB` | Mã nhân viên, ví dụ `NV0001` |
| `MucLuong` | `MaMucLuong` | Mức tiền lương |
| `LuongNhanVien` | `MaLuongNhanVien`, `MaNV`, `MaMucLuong` | `NgayKetThuc = NULL` là dòng hiện hành |
| `HopDongLaoDong` | `MaHD`, `MaNV` | `LoaiHD` thuộc 1, 2, 3 |
| `ChamCong` | `MaChamCong`, `MaNV`, `Thang` | Một dòng cho mỗi nhân viên/tháng |

`TrangThai` (`DangLam`/`DaNghi`) được tính dựa trên thời hạn hợp đồng tại ngày tham chiếu.

## Giới hạn đã biết

- Dữ liệu thay đổi được lưu cục bộ trong trình duyệt bằng `localStorage`. Có thể sao lưu và khôi phục bằng tệp JSON.
- Tệp khôi phục phải có danh sách nhân viên, phòng ban, hợp đồng và chức vụ. Hệ thống kiểm tra kiểu dữ liệu, khoảng ngày và liên kết mã trước khi khôi phục. Nếu dữ liệu đã thay đổi ở tab khác, hệ thống yêu cầu tải lại trước khi lưu.
- Sao lưu lấy bản đã ghi mới nhất trong trình duyệt. Khi khôi phục thành công, trang tải lại để hiển thị dữ liệu mới.
- Bảng lương dùng dữ liệu và công thức mô phỏng của đề tài.

## Thành viên nhóm

| STT | Họ tên | MSSV | Vai trò |
|---|---|---|
| 1 | Ngô Sỹ Nhân | 12500xxxx | ____________________ |
| 2 | Nguyễn Minh Nhật | 12500xxxx | ____________________ |
| 3 | Nguyễn Võ Gia Huy | 12500xxxx | ____________________ |
| 4 | Võ Quỳnh Tuấn Anh | 12500xxxx | ____________________ |
| 5 | Đặng Nguyễn Công Gianh | 12500xxxx | ____________________ |

## Quy ước Git

- Nhánh tính năng: `feature/*`.
- Commit: `[Loại]: mô tả`.
- Loại đề xuất: `[Feat]`, `[Fix]`, `[Style]`, `[Docs]`, `[Refactor]`.
- Mỗi tính năng mở Pull Request về `main`.
