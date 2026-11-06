# Thư viện bên ngoài — Tích hợp Giai đoạn 3

Tài liệu này mô tả các thư viện bên ngoài mà dự án sử dụng, lý do tích hợp và cách chúng phối hợp với design system riêng của dự án (CSS thuần, tên class tiếng Việt).

## Danh mục thư viện

| Thư viện | Bản | Vai trò trong dự án | Nơi sử dụng |
|---|---|---|---|
| [Bootstrap](https://getbootstrap.com) | 5.3.3 | CSS framework + JS bundle: Dropdown, Tabs, Accordion, Carousel, Tooltip | Cả 8 trang |
| [Bootstrap Icons](https://icons.getbootstrap.com) | 1.11.3 | Icon font thay thế hệ SVG sprite thủ công (~2000 icon) | Nav, header, KPI, nút thao tác |
| [Google Fonts — Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) | 400–800 | Font thương hiệu hỗ trợ đầy đủ tiếng Việt | Toàn hệ thống qua token `--font` |
| [AOS](https://michalsnik.github.io/aos/) | 2.3.4 | Scroll-reveal: thẻ/section xuất hiện khi cuộn | `data-aos="fade-up"` trên các `.the` |
| [Animate.css](https://animate.style) | 4.1.1 | Micro-animation: dialog trượt lên (fadeInUp), ô lỗi rung (shakeX) | `moDialog()`, `rungLoi()` trong giao-dien.js |
| [CountUp.js](https://inorganik.github.io/countUp.js/) | 2.8.0 | Số KPI/thống kê đếm tăng dần | Tổng quan, Nhân viên, Khen thưởng |
| [Chart.js](https://www.chartjs.org) | 4.4.1 | Biểu đồ bar/doughnut/line thay biểu đồ CSS/SVG thủ công | Tổng quan, Bảng lương |
| Adobe Color | (công cụ web) | Tạo palette theo quy tắc harmony → token gradient | `--gradient-chinh`, `--gradient-navy` |

## Nguyên tắc tích hợp chống xung đột

Dự án có design system riêng (~3.000 dòng CSS, token tiếng Việt). Nạp Bootstrap nguyên xi sẽ gây xung đột (class `.toast` trùng tên, reset table/form, hai hệ dark mode song song). Chiến lược:

```text
Thứ tự <head> trên mọi trang:
  1. Google Fonts (preconnect + stylesheet)
  2. bootstrap.min.css        ← thư viện trước
  3. bootstrap-icons.css
  4. animate.min.css
  5. aos.css
  6. css/styles.css           ← design system dự án SAU → thắng cascade
  7. css/navy.css
  8. css/tong-quan.css        (chỉ index.html)
  9. css/thu-vien.css         ← lớp cầu nối: map Bootstrap component sang token
```

- **Bootstrap JS bundle** cung cấp hành vi (mở/đóng/Escape/click ngoài) còn **ngoại hình do token dự án quyết định** qua `css/thu-vien.css`.
- Dark mode: `js/theme.js` gán cả `data-theme` và `data-bs-theme` trên `<html>`, đồng thời phát sự kiện `hrm:themechange` để Chart.js dựng lại biểu đồ với bộ màu mới.
- Dialog vẫn dùng `<dialog>` gốc của HTML (không dùng Bootstrap Modal) vì toàn bộ trang đã xây trên `moDialog()/dongDialog()`.

## Lớp bảo vệ khi offline (CDN thất bại)

Mọi thư viện đều có phương án dự phòng — trang vẫn dùng được 100%, chỉ mất hiệu ứng:

| Thư viện mất | Hành vi dự phòng |
|---|---|
| Google Fonts | Tự hạ về system font stack trong `--font` |
| Bootstrap Icons | Icon biến mất, chữ nhãn vẫn hiển thị đầy đủ |
| AOS | Guard `html:not(.aos-init) [data-aos]` ép mọi phần tử hiển thị (css/thu-vien.css) |
| Animate.css | Dialog mở đóng bình thường không animation (`rungLoi`/`moDialog` kiểm tra trước) |
| CountUp.js | `demLen()` gán số trực tiếp |
| Chart.js | Tổng quan vẽ lại biểu đồ thanh CSS + donut SVG thuần; Bảng lương hiện thông báo thay thế |

Ngoài ra: `@media print` ép hiện mọi phần tử `data-aos` (in không bị mất nội dung), `prefers-reduced-motion` tắt toàn bộ animation của thư viện.

## Helper dùng chung — `js/thu-vien.js`

Toàn bộ trang tương tác qua biến toàn cục `window.HRMThuVien`:

| Hàm | Ý nghĩa |
|---|---|
| `khoiTaoTooltip(khuVuc)` | Khởi tạo Bootstrap Tooltip cho `[data-bs-toggle="tooltip"]` — gọi lại sau mỗi lần render bảng |
| `demLen(node, giaTri, tuyChon)` | Đếm tăng với CountUp.js; `tuyChon.dinhDang` là hàm format (vd `dinhDangTien`) |
| `docTheme()` | Trả về `"dark"` / `"light"` hiện tại |
| `giamChuyenDong()` | `true` nếu người dùng bật giảm chuyển động |

## Quy ước khi bổ sung thư viện mới

1. Ghim phiên bản (`@x.y.z`) trong URL CDN — không dùng `@latest`.
2. CSS thư viện nạp **trước** `styles.css`; nếu cần map sang token, viết vào `css/thu-vien.css`.
3. JS thư viện nạp defer **trước** `js/thu-vien.js` và `js/trang/*.js`.
4. Mọi lời gọi thư viện phải kiểm tra tồn tại (`typeof X !== "undefined"`) và có nhánh fallback.
5. Ghi bổ sung vào bảng danh mục trong tài liệu này.
