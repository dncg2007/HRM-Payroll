/* ==========================================================================
   Bộ điều phối thư viện bên ngoài (Bootstrap 5.3, AOS, Animate.css,
   CountUp.js, Chart.js).
   Nguyên tắc: MỌI thư viện đều phải có lớp bảo vệ — nếu CDN thất bại
   (offline), hệ thống vẫn chạy đầy đủ, chỉ mất hiệu ứng.
   Được nạp defer sau bootstrap.bundle.min.js và trước js/trang/*.js.
   ========================================================================== */

(function () {
  "use strict";

  const giamChuyenDong = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. AOS — hiệu ứng xuất hiện khi cuộn trang (scroll-reveal)
     ------------------------------------------------------------------ */
  function khoiTaoAOS() {
    if (typeof AOS === "undefined" || giamChuyenDong) return;
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      offset: 60,
      once: true /* Chỉ chạy 1 lần, không ẩn lại khi cuộn ngược */
    });
  }

  /* ------------------------------------------------------------------
     2. Bootstrap Tooltip — chú thích nổi cho nút thao tác trong bảng
     Gọi lại sau mỗi lần render bảng vì các nút được tạo động.
     ------------------------------------------------------------------ */
  function khoiTaoTooltip(khuVuc) {
    if (typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;
    const goc = khuVuc || document;
    goc.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((nut) => {
      const tooltipDaCo = bootstrap.Tooltip.getInstance(nut);
      if (tooltipDaCo) tooltipDaCo.dispose();
      bootstrap.Tooltip.getOrCreateInstance(nut, { trigger: "hover focus" });
    });
  }

  /* ------------------------------------------------------------------
     3. CountUp.js — số đếm tăng dần cho KPI và thống kê
     demLen(node, giaTri, tuyChon)
       - node: phần tử hiển thị
       - giaTri: số đích (number)
       - tuyChon.dinhDang: hàm format (mặc định giữ nguyên số)
       - tuyChon.thoiLuong: ms (mặc định 900)
     Fallback: lib thiếu hoặc người dùng bật giảm chuyển động → gán thẳng.
     ------------------------------------------------------------------ */
  function demLen(node, giaTri, tuyChon) {
    if (!node) return;
    const tuyChinh = tuyChon || {};
    const dinhDang = tuyChinh.dinhDang || ((so) => String(so));
    const giaTriSo = Number(giaTri) || 0;

    if (typeof CountUp === "undefined" || giamChuyenDong || giaTriSo === 0) {
      node.textContent = dinhDang(giaTriSo);
      return;
    }

    /* CountUp hỗ trợ hàm formatting riêng cho từng khung hình. */
    const boDem = new CountUp(node, giaTriSo, {
      startVal: 0,
      duration: tuyChinh.thoiLuong || 0.9,
      separator: " ",
      decimal: ",",
      formattingFn: (so) => dinhDang(Math.round(so))
    });
    if (!boDem.error) boDem.start();
    else node.textContent = dinhDang(giaTriSo);
  }

  /* ------------------------------------------------------------------
     4. Đọc theme hiện tại — dùng cho Chart.js lấy màu ban đầu
     ------------------------------------------------------------------ */
  function docThemeHienTai() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  /* Khởi tạo khi DOM sẵn sàng — chạy trước js/trang/*.js nhờ thứ tự defer. */
  document.addEventListener("DOMContentLoaded", () => {
    khoiTaoAOS();
    khoiTaoTooltip(document);
  });

  /* Xuất API dùng chung cho các trang. */
  window.HRMThuVien = {
    khoiTaoTooltip,
    demLen,
    docTheme: docThemeHienTai,
    giamChuyenDong: () => giamChuyenDong
  };
})();
