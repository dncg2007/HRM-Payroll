# Design System — Giai đoạn 2A (cập nhật khi tích hợp thư viện)

Design System của HRM & Payroll dùng CSS custom properties theo **vai trò sử dụng**, không đặt tên theo màu cụ thể. Chế độ Tối được điều khiển bằng thuộc tính `data-theme="dark"` trên `<html>` (js/theme.js), đồng bộ cả dark mode của Bootstrap 5.3 qua `data-bs-theme`.

## Nguồn palette (Adobe Color)

Bảng màu gốc dùng navy `#1F509E` làm màu chủ đạo. Khi tích hợp thư viện, bộ màu được tinh chỉnh theo quy tắc **harmony của Adobe Color** (color.adobe.com):

| Vai trò | Mã màu | Quy tắc harmony |
|---|---|---|
| Primary (nền navy) | `#1F509E` | Màu gốc |
| Analogous sáng | `#3D7BD9` | Kề bên màu gốc trên vòng màu |
| Complementary (accent) | `#E6A811` (`--mau-phu`) | Đối bổ trên vòng màu |
| Nền sidebar navy đậm | `#112D50` | Shade của màu gốc |

Cặp màu này được đóng gói thành token gradient:

| Token | Giá trị Sáng | Giá trị Tối | Dùng cho |
|---|---|---|---|
| `--gradient-chinh` | `linear-gradient(135deg, #1F509E, #3D7BD9)` | `linear-gradient(135deg, #7FA8EF, #4A76C9)` | `.logo-mark`, hover nút `.nut`, icon slide carousel |
| `--gradient-navy` | `linear-gradient(160deg, #112D50, #1F509E)` | `linear-gradient(160deg, #0E1726, #1C4270)` | Dự phòng cho nền navy lớn |

## Bảng token

| Token | Giá trị Sáng | Giá trị Tối | Dùng cho việc gì |
|---|---|---|---|
| `--mau-chinh` | `#1F509E` | `#7FA8EF` | Màu hành động chính, liên kết và focus |
| `--mau-chinh-dam` | `#163C77` | `#A9C4F5` | Trạng thái hover hoặc nhấn của màu chính |
| `--mau-chinh-nhat` | `#EAF0FB` | `#22303F` | Nền phụ cho tiêu đề bảng và vùng nhấn nhẹ |
| `--mau-phu` | `#E6A811` | `#F0BD4A` | Điểm nhấn phụ và thông tin cần chú ý |
| `--mau-tren-chinh` | `#FFFFFF` | `#0F1520` | Chữ đặt trên nền màu chính |
| `--mau-thanh-cong` | `#187A33` | `#6FCF8B` | Trạng thái hoàn tất hoặc tích cực |
| `--mau-thanh-cong-nhat` | `#E6F4EA` | `#1B3A28` | Nền nhạt cho badge thành công |
| `--mau-canh-bao` | `#9A5B00` | `#F0BD4A` | Cảnh báo cần theo dõi |
| `--mau-canh-bao-nhat` | `#FFF3D6` | `#3D3010` | Nền nhạt cho cảnh báo |
| `--mau-loi` | `#C5221F` | `#FF8A80` | Lỗi hoặc trạng thái không hợp lệ |
| `--mau-loi-nhat` | `#FDECEA` | `#44201F` | Nền nhạt cho badge lỗi |
| `--chu-1` | `#1B1F27` | `#E8EBF0` | Nội dung chính và tiêu đề |
| `--chu-2` | `#3D4350` | `#C3C9D4` | Nội dung phụ, mô tả và dữ liệu |
| `--chu-3` | `#5C626E` | `#A4ACBA` | Placeholder và thông tin ít ưu tiên |
| `--mau-nen` | `#F6F7F9` | `#14171C` | Nền tổng thể của trang |
| `--mau-the` | `#FFFFFF` | `#1E232B` | Nền thẻ, bảng và form control |
| `--mau-vien` | `#E1E7F0` | `#2E3540` | Viền, phân cách và đường kẻ bảng |
| `--cach-1` | `4px` | `4px` | Khoảng cách rất nhỏ |
| `--cach-2` | `8px` | `8px` | Khoảng cách trong control |
| `--cach-3` | `16px` | `16px` | Khoảng cách nội dung cơ bản |
| `--cach-4` | `24px` | `24px` | Khoảng cách giữa nhóm nội dung |
| `--cach-5` | `32px` | `32px` | Khoảng cách khu vực |
| `--cach-6` | `48px` | `48px` | Khoảng cách lớn giữa vùng chính |
| `--font` | `"Be Vietnam Pro", system font stack` | `"Be Vietnam Pro", system font stack` | Font thương hiệu tải từ Google Fonts, tự hạ về font hệ thống khi offline |
| `--co-nho` | `0.875rem` | `0.875rem` | Chú thích và nội dung phụ |
| `--co-thuong` | `1rem` | `1rem` | Kích thước văn bản mặc định |
| `--co-to` | `1.25rem` | `1.25rem` | Heading cấp 2 hoặc nội dung nổi bật |
| `--co-tieu-de` | `clamp(1.5rem, 1.2rem + 1.5vw, 2rem)` | `clamp(1.5rem, 1.2rem + 1.5vw, 2rem)` | Heading chính của trang |
| `--dong-cao` | `1.6` | `1.6` | Nhịp dòng dễ đọc |
| `--bo-goc` | `10px` | `10px` | Bo góc control và thành phần |
| `--bo-goc-tron` | `999px` | `999px` | Bo góc dạng viên thuốc hoặc tròn |
| `--bong` | `0 1px 2px rgb(27 31 39 / 8%), 0 4px 12px rgb(27 31 39 / 6%)` | `0 2px 4px rgb(0 0 0 / 28%), 0 8px 20px rgb(0 0 0 / 24%)` | Tạo cấp độ nổi cho thành phần |
| `--bong-noi` | `0 8px 20px rgb(27 31 39 / 16%)` | `0 10px 24px rgb(0 0 0 / 34%)` | Bóng nổi khi hover component tương tác |
| `--chuyen-dong` | `0.25s ease-out` | `0.25s ease-out` | Thời gian chuyển trạng thái nhẹ |
| `--tg-nhanh` | `0.2s` | `0.2s` | Thời lượng chuyển động nhỏ |
| `--tg-vua` | `0.3s` | `0.3s` | Thời lượng chuyển động chính |
| `--duong-cong` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Easing cho tương tác component |
| `--animate-duration` | `0.5s` | `0.5s` | Token thời lượng Animate.css |
| `--animate-delay` | `0.12s` | `0.12s` | Token độ trễ Animate.css |

## Quy tắc sử dụng token

1. Chọn token theo vai trò giao diện, ví dụ dùng `--mau-chinh` cho hành động chính thay vì đặt tên như một màu cụ thể.
2. Không đặt mã màu trực tiếp trong selector thành phần; màu phải đi qua token để chế độ Sáng/Tối đồng bộ.
3. Dùng `--chu-1`, `--chu-2`, `--chu-3` theo thứ tự ưu tiên nội dung, không dùng chữ mức thấp cho nội dung quan trọng.
4. Dùng các token `--cach-*`, `--bo-goc` và `--bong` thống nhất thay vì tạo giá trị khoảng cách, bo góc hoặc bóng tùy ý.
5. Khi thêm chế độ màu mới, chỉ ghi đè token trong scope chế độ đó; không nhân đôi toàn bộ bộ chọn Base.
