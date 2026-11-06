(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoDashboard);

  function khoiTaoDashboard() {
    const ngayThamChieu = ngayThamChieuDemo();
    const kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: NHAN_VIEN, dsPhongBan: PHONG_BAN, dsHopDong: HOP_DONG_LAO_DONG };
    const dsNV = kho.dsNhanVien || NHAN_VIEN;
    const dsPB = kho.dsPhongBan || PHONG_BAN;
    const dsHD = kho.dsHopDong || HOP_DONG_LAO_DONG;

    const thangLuong = ngayThamChieu.slice(0, 7);
    const bangLuong = taoBangLuong(
      thangLuong, dsNV, dsPB, LUONG_NHAN_VIEN, MUC_LUONG, CHAM_CONG, CAU_HINH,
      kho.dsChamCongNgay, kho.dsKhenThuong, dsHD, kho.dsNghiPhep
    );
    const thongKe = thongKeDashboard(dsNV, dsPB, bangLuong);
    const soNgayCanhBao = CAU_HINH.SO_NGAY_CANH_BAO_HOP_DONG;
    const sapHetHan = hopDongSapHetHan(dsHD, dsNV, ngayThamChieu, soNgayCanhBao);
    const tkGioiTinh = thongKeGioiTinh(dsNV);
    const tkLoaiNV = thongKeLoaiNhanVien(dsNV);
    const tkBacLuong = thongKeBacLuong(dsNV, LUONG_NHAN_VIEN, MUC_LUONG, ngayThamChieu);

    const capNhat = (id, value) => {
      const node = document.querySelector(`#${id}`);
      if (node) node.textContent = value;
    };

    /* KPI đếm tăng dần bằng CountUp.js (fallback: gán trực tiếp qua demLen). */
    const dem = window.HRMThuVien ? window.HRMThuVien.demLen : (node, giaTri, tuyChon) => {
      if (node) node.textContent = tuyChon && tuyChon.dinhDang ? tuyChon.dinhDang(giaTri) : String(giaTri);
    };
    dem(document.querySelector("#kpi-tong"), thongKe.quanSo.tong);
    dem(document.querySelector("#kpi-dang-lam"), thongKe.quanSo.dangLam);
    dem(document.querySelector("#kpi-quy-luong"), thongKe.quyLuong.tongQuyLuong, { dinhDang: dinhDangTien, thoiLuong: 1.2 });
    dem(document.querySelector("#kpi-luong-trung-binh"), thongKe.quyLuong.luongTrungBinh, { dinhDang: dinhDangTien, thoiLuong: 1.2 });

    const [nam, thang] = thangLuong.split("-");
    const kyLuong = document.querySelector("#dashboard-ky-luong");
    if (kyLuong) kyLuong.dateTime = thangLuong;
    capNhat("dashboard-ky-luong", `${thang}/${nam}`);
    capNhat("dashboard-khoang-canh-bao", `Trong ${soNgayCanhBao} ngày tới`);
    capNhat("dashboard-so-hop-dong", `${sapHetHan.length} hợp đồng`);
    const soHopDong = document.querySelector("#dashboard-so-hop-dong");
    if (soHopDong) soHopDong.dataset.rong = String(sapHetHan.length === 0);

    // Tooltip tương tác cho biểu đồ Dashboard
    let tooltip = document.querySelector(".chart-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "chart-tooltip";
      tooltip.style.opacity = "0";
      document.body.appendChild(tooltip);
    }

    const ganTooltip = (el, text) => {
      if (!el) return;
      el.style.cursor = "pointer";
      el.addEventListener("mouseenter", () => {
        tooltip.textContent = text;
        tooltip.style.opacity = "1";
      });
      el.addEventListener("mousemove", (e) => {
        tooltip.style.left = e.pageX + "px";
        tooltip.style.top = (e.pageY - 10) + "px";
      });
      el.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
      });
    };

    /* --- Bộ màu biểu đồ theo theme (đồng bộ token design system) --- */
    const mauBieuDo = () => {
      const theme = window.HRMThuVien ? window.HRMThuVien.docTheme() : document.documentElement.dataset.theme;
      const toi = theme === "dark";
      return {
        chu: toi ? "#C3C9D4" : "#3D4350",
        luoi: toi ? "rgb(255 255 255 / 8%)" : "rgb(27 31 39 / 8%)",
        quanSo: toi ? "#7FA8EF" : "#1F509E",
        quanSoNhat: toi ? "#4A76C9" : "#3D7BD9",
        nu: toi ? "#F0BD4A" : "#E6A811",
        nam: toi ? "#7FA8EF" : "#1F509E",
        the: toi ? "#1E232B" : "#FFFFFF",
        tooltipBg: toi ? "#1E232B" : "#163C77"
      };
    };
    /* Chart.js có thể vắng mặt khi offline — lúc đó rơi về biểu đồ CSS/SVG thuần. */
    const coChart = typeof Chart !== "undefined";
    let bieuDoQuanSo = null;
    let bieuDoGioiTinh = null;

    // --- CHART 1: Phân bổ quân số theo phòng ban (Chart.js bar / fallback CSS) ---
    const theoQuanSo = [...thongKe.theoPhong].sort((a, b) => b.SoLuong - a.SoLuong);
    const maxQuanSo = theoQuanSo[0]?.SoLuong || 1;
    capNhat("dashboard-mo-ta-phong-ban", theoQuanSo.length
      ? `${theoQuanSo.length} phòng ban · Sắp xếp theo quân số`
      : "Chưa có phòng ban để hiển thị.");

    function taiBieuDoQuanSo() {
      const khungQuanSo = document.querySelector("#dashboard-bieu-do");
      if (!khungQuanSo) return;
      if (bieuDoQuanSo) { bieuDoQuanSo.destroy(); bieuDoQuanSo = null; }

      if (coChart && theoQuanSo.length) {
        const mau = mauBieuDo();
        khungQuanSo.innerHTML = '<canvas id="chart-quan-so" role="img" aria-label="Biểu đồ thanh quân số nhân viên theo phòng ban"></canvas>';
        const duLieuTangDan = [...theoQuanSo].sort((a, b) => a.SoLuong - b.SoLuong);
        bieuDoQuanSo = new Chart(document.querySelector("#chart-quan-so"), {
          type: "bar",
          data: {
            labels: duLieuTangDan.map((dong) => dong.TenPB),
            datasets: [{
              label: "Quân số",
              data: duLieuTangDan.map((dong) => dong.SoLuong),
              backgroundColor: mau.quanSo,
              hoverBackgroundColor: mau.quanSoNhat,
              borderRadius: 6,
              maxBarThickness: 24
            }]
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            animation: window.HRMThuVien && window.HRMThuVien.giamChuyenDong() ? false : { duration: 700 },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: mau.tooltipBg,
                titleColor: "#FFFFFF",
                bodyColor: "#FFFFFF",
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (nguCanh) => {
                    const tyLe = Math.round((nguCanh.parsed.x / (thongKe.quanSo.tong || 1)) * 100);
                    return ` ${nguCanh.parsed.x} nhân sự (${tyLe}%)`;
                  }
                }
              }
            },
            scales: {
              x: { beginAtZero: true, grid: { color: mau.luoi }, ticks: { color: mau.chu, precision: 0 } },
              y: { grid: { display: false }, ticks: { color: mau.chu } }
            }
          }
        });
        return;
      }

      /* Fallback: biểu đồ thanh CSS thuần (cách vẽ gốc của dự án). */
      const danhSach = document.createElement("ul");
      danhSach.setAttribute("aria-label", "Quân số theo phòng ban");
      danhSach.replaceChildren(...theoQuanSo.map((dong) => {
        const muc = document.createElement("li");
        const ten = document.createElement("span");
        const thanh = document.createElement("span");
        const soLuong = document.createElement("strong");
        ten.textContent = dong.TenPB;
        thanh.className = "thanh";
        thanh.setAttribute("aria-hidden", "true");
        thanh.style.setProperty("--ty-le", `${(dong.SoLuong / maxQuanSo) * 100}%`);
        soLuong.textContent = String(dong.SoLuong);
        muc.append(ten, thanh, soLuong);
        ganTooltip(muc, `${dong.TenPB}: ${dong.SoLuong} nhân sự (${Math.round((dong.SoLuong / (thongKe.quanSo.tong || 1)) * 100)}%)`);
        return muc;
      }));
      khungQuanSo.replaceChildren(danhSach);
    }

    // --- CHART 2: Cơ cấu Giới tính (Chart.js doughnut / fallback SVG donut) ---
    const tyLeNu = tkGioiTinh.tyLeNu;
    const tyLeNam = tkGioiTinh.tyLeNam;

    function taiBieuDoGioiTinh() {
      const bieuDoGT = document.querySelector("#dashboard-bieu-do-gioi-tinh");
      if (!bieuDoGT) return;
      if (bieuDoGioiTinh) { bieuDoGioiTinh.destroy(); bieuDoGioiTinh = null; }

      if (coChart) {
        const mau = mauBieuDo();
        bieuDoGT.innerHTML = '<div class="khung-chart khung-chart-donut"><canvas id="chart-gioi-tinh" role="img" aria-label="Biểu đồ tròn cơ cấu giới tính nhân viên"></canvas></div>';
        bieuDoGioiTinh = new Chart(document.querySelector("#chart-gioi-tinh"), {
          type: "doughnut",
          data: {
            labels: [`Nữ (${tkGioiTinh.nu})`, `Nam (${tkGioiTinh.nam})`],
            datasets: [{
              data: [tkGioiTinh.nu, tkGioiTinh.nam],
              backgroundColor: [mau.nu, mau.nam],
              borderColor: mau.the,
              borderWidth: 3,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            animation: window.HRMThuVien && window.HRMThuVien.giamChuyenDong() ? false : { animateRotate: true, duration: 800 },
            plugins: {
              legend: { position: "bottom", labels: { color: mau.chu, usePointStyle: true, padding: 16 } },
              tooltip: {
                backgroundColor: mau.tooltipBg,
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (nguCanh) => {
                    const laNu = nguCanh.label.startsWith("Nữ");
                    return ` ${nguCanh.label}: ${nguCanh.parsed} người (${laNu ? tyLeNu : tyLeNam}%)`;
                  }
                }
              }
            }
          },
          plugins: [{
            id: "chuGiuaDonut",
            afterDraw(bieuDo) {
              const { ctx, chartArea } = bieuDo;
              if (!chartArea) return;
              const tamX = (chartArea.left + chartArea.right) / 2;
              const tamY = (chartArea.top + chartArea.bottom) / 2;
              ctx.save();
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.font = "700 1.25rem 'Be Vietnam Pro', sans-serif";
              ctx.fillStyle = mauBieuDo().chu;
              ctx.fillText(`${tyLeNu}%`, tamX, tamY - 8);
              ctx.font = "500 0.7rem 'Be Vietnam Pro', sans-serif";
              ctx.fillText(`Nữ (${tkGioiTinh.nu})`, tamX, tamY + 12);
              ctx.restore();
            }
          }]
        });
        return;
      }

      /* Fallback: donut SVG thuần (cách vẽ gốc của dự án). */
      bieuDoGT.innerHTML = `
        <div class="bieu-do-donut-wrap">
          <div class="donut-svg-container">
            <svg class="donut-svg" viewBox="0 0 36 36" aria-hidden="true">
              <circle class="donut-bg" cx="18" cy="18" r="15.915" />
              <circle class="donut-segment-nu" cx="18" cy="18" r="15.915" stroke-dasharray="${tyLeNu} ${100 - tyLeNu}" stroke-dashoffset="0" />
              <circle class="donut-segment-nam" cx="18" cy="18" r="15.915" stroke-dasharray="${tyLeNam} ${100 - tyLeNam}" stroke-dashoffset="-${tyLeNu}" />
            </svg>
            <div class="donut-center-text">
              <span class="donut-center-number">${tyLeNu}%</span>
              <span class="donut-center-label">Nữ (${tkGioiTinh.nu})</span>
            </div>
          </div>
          <ul class="donut-legend">
            <li class="donut-legend-item">
              <span class="donut-dot dot-nu" aria-hidden="true"></span>
              <span>Nữ: <strong>${tkGioiTinh.nu}</strong> người (${tyLeNu}%)</span>
            </li>
            <li class="donut-legend-item">
              <span class="donut-dot dot-nam" aria-hidden="true"></span>
              <span>Nam: <strong>${tkGioiTinh.nam}</strong> người (${tyLeNam}%)</span>
            </li>
          </ul>
        </div>
      `;
      const segNu = bieuDoGT.querySelector(".donut-segment-nu");
      const segNam = bieuDoGT.querySelector(".donut-segment-nam");
      if (segNu) ganTooltip(segNu, `Nữ: ${tkGioiTinh.nu} người (${tyLeNu}%)`);
      if (segNam) ganTooltip(segNam, `Nam: ${tkGioiTinh.nam} người (${tyLeNam}%)`);
    }

    taiBieuDoQuanSo();
    taiBieuDoGioiTinh();

    /* Đổi theme sáng/tối → dựng lại 2 biểu đồ với bộ màu mới. */
    window.addEventListener("hrm:themechange", () => {
      if (!coChart) return;
      taiBieuDoQuanSo();
      taiBieuDoGioiTinh();
    });

    // --- CHART 3: Phân loại nhân viên & Trạng thái làm việc (Phân đoạn) ---
    const bieuDoLoai = document.querySelector("#dashboard-bieu-do-loai-nv");
    if (bieuDoLoai) {
      const tongNV = thongKe.quanSo.tong || 1;
      const tyLeDangLam = Math.round((thongKe.quanSo.dangLam / tongNV) * 100);
      const tyLeDaNghi = Math.round((thongKe.quanSo.daNghi / tongNV) * 100);

      bieuDoLoai.innerHTML = `
        <div class="muc-phan-doan">
          <div class="nhan-phan-doan">
            <span>Loại hợp đồng lao động</span>
            <span>Chính thức: ${tkLoaiNV.tyLeChinhThuc}% · Thời vụ: ${tkLoaiNV.tyLeThoiVu}%</span>
          </div>
          <div class="thanh-phan-doan" aria-hidden="true">
            <span class="phan-doan-segment segment-chinh-thuc" style="width: ${tkLoaiNV.tyLeChinhThuc}%"></span>
            <span class="phan-doan-segment segment-thoi-vu" style="width: ${tkLoaiNV.tyLeThoiVu}%"></span>
          </div>
          <div class="chu-thich-hang">
            <span class="donut-legend-item"><span class="donut-dot dot-chinh-thuc" aria-hidden="true"></span>Chính thức: ${tkLoaiNV.chinhThuc} người</span>
            <span class="donut-legend-item"><span class="donut-dot dot-thoi-vu" aria-hidden="true"></span>Thời vụ: ${tkLoaiNV.thoiVu} người</span>
          </div>
        </div>
        <div class="muc-phan-doan">
          <div class="nhan-phan-doan">
            <span>Trạng thái công tác</span>
            <span>Đang làm: ${tyLeDangLam}% · Không làm việc: ${tyLeDaNghi}%</span>
          </div>
          <div class="thanh-phan-doan" aria-hidden="true">
            <span class="phan-doan-segment segment-dang-lam" style="width: ${tyLeDangLam}%"></span>
            <span class="phan-doan-segment segment-da-nghi" style="width: ${tyLeDaNghi}%"></span>
          </div>
          <div class="chu-thich-hang">
            <span class="donut-legend-item"><span class="donut-dot dot-dang-lam" aria-hidden="true"></span>Đang làm: ${thongKe.quanSo.dangLam} người</span>
            <span class="donut-legend-item"><span class="donut-dot dot-da-nghi" aria-hidden="true"></span>Không làm việc: ${thongKe.quanSo.daNghi} người</span>
          </div>
        </div>
      `;

      const segCT = bieuDoLoai.querySelector(".segment-chinh-thuc");
      const segTV = bieuDoLoai.querySelector(".segment-thoi-vu");
      const segDL = bieuDoLoai.querySelector(".segment-dang-lam");
      const segDN = bieuDoLoai.querySelector(".segment-da-nghi");
      if (segCT) ganTooltip(segCT, `Chính thức: ${tkLoaiNV.chinhThuc} nhân viên (${tkLoaiNV.tyLeChinhThuc}%)`);
      if (segTV) ganTooltip(segTV, `Thời vụ: ${tkLoaiNV.thoiVu} nhân viên (${tkLoaiNV.tyLeThoiVu}%)`);
      if (segDL) ganTooltip(segDL, `Đang làm: ${thongKe.quanSo.dangLam} nhân viên (${tyLeDangLam}%)`);
      if (segDN) ganTooltip(segDN, `Không làm việc: ${thongKe.quanSo.daNghi} nhân viên (${tyLeDaNghi}%)`);
    }

    // --- CHART 4: Phân bổ nhân sự theo Bậc lương ---
    const bieuDoLuong = document.querySelector("#dashboard-bieu-do-bac-luong");
    if (bieuDoLuong) {
      const maxNguoiBac = Math.max(...tkBacLuong.map((b) => b.SoLuong), 1);
      bieuDoLuong.innerHTML = `
        <ul class="danh-sach-bac-luong" aria-label="Phân bổ bậc lương">
          ${tkBacLuong.map((bac) => {
            const tyLeThanh = Math.round((bac.SoLuong / maxNguoiBac) * 100);
            return `
              <li class="dong-bac-luong">
                <div class="bac-luong-head">
                  <span class="ten-bac-luong">${escapeHTML(bac.TenMucLuong)} (${Math.round(bac.SoTien / 1000000)}tr)</span>
                  <span class="so-luong-bac-luong">${bac.SoLuong} (${bac.TyLe}%)</span>
                </div>
                <span class="thanh-bac-luong" aria-hidden="true">
                  <span class="tien-do-bac-luong" style="width: ${tyLeThanh}%"></span>
                </span>
              </li>
            `;
          }).join("")}
        </ul>
      `;

      bieuDoLuong.querySelectorAll(".dong-bac-luong").forEach((item, idx) => {
        const bac = tkBacLuong[idx];
        if (bac) ganTooltip(item, `${bac.TenMucLuong}: ${bac.SoLuong} nhân sự (${bac.TyLe}%) - Mức lương: ${dinhDangTien(bac.SoTien)}`);
      });
    }

    // --- Hợp đồng sắp hết hạn ---
    const hopDongNode = document.querySelector("#dashboard-hop-dong");
    if (hopDongNode) {
      hopDongNode.innerHTML = sapHetHan.length
        ? sapHetHan.map((hopDong) => `
            <li>
              <a class="lien-ket-hop-dong" href="nhan-vien.html?q=${encodeURIComponent(hopDong.MaNV)}">
                <span class="hop-dong-info">
                  <strong>${escapeHTML(hopDong.HoTen)}</strong>
                  <time datetime="${escapeHTML(hopDong.DenNgay)}">${escapeHTML(dinhDangNgay(hopDong.DenNgay))}</time>
                </span>
                <span class="han-hop-dong">${hopDong.SoNgayConLai === 0
                  ? "Hết hạn hôm nay"
                  : `Còn ${escapeHTML(hopDong.SoNgayConLai)} ngày`}</span>
              </a>
            </li>
          `).join("")
        : '<li class="hop-dong-rong">Không có hợp đồng sắp hết hạn.</li>';
    }
  }
})();
