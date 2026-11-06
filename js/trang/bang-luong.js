(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoTrangBangLuong);

  function khoiTaoTrangBangLuong() {
    const form = document.querySelector("#form-bang-luong");
    const inputThang = document.querySelector("#salary-month");
    const locPhongBan = document.querySelector("#salary-department");
    const thanBang = document.querySelector("#than-bang-luong");
    const tongDong = document.querySelector("#tong-bang-luong");
    const ketQua = document.querySelector("#salary-result");
    const nutInBangLuong = document.querySelector("#nut-in-bang-luong");
    const nutInPhieu = document.querySelector("#nut-in-phieu");

    const kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: NHAN_VIEN, dsPhongBan: PHONG_BAN };
    const dsPB = kho.dsPhongBan || PHONG_BAN;
    const dsNV = kho.dsNhanVien || NHAN_VIEN;

    locPhongBan.innerHTML = '<option value="">Tất cả phòng ban</option>';
    dsPB.forEach((pb) => {
      locPhongBan.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(pb.MaPB)}">${escapeHTML(pb.TenPB)}</option>`);
    });

    let bangLuongHienTai = [];
    let maNVDangChon = null;

    function renderPhieuLuong(dongLuong, thang) {
      if (!dongLuong) {
        document.querySelector("#phieu-ho-ten").textContent = "Chưa chọn nhân viên";
        document.querySelector("#phieu-ma-nv").textContent = "—";
        document.querySelector("#phieu-phong-ban").textContent = "—";
        document.querySelector("#phieu-chuc-vu").textContent = "—";
        document.querySelector("#phieu-ngay-cong").textContent = "—";
        document.querySelector("#phieu-luong-cb").textContent = "—";
        document.querySelector("#phieu-luong-cong").textContent = "—";
        document.querySelector("#phieu-phu-cap").textContent = "—";
        const elTP = document.querySelector("#phieu-thuong-phat");
        if (elTP) { elTP.textContent = "—"; elTP.style.color = ""; }
        document.querySelector("#phieu-bao-hiem").textContent = "—";
        document.querySelector("#phieu-thuc-linh").textContent = "—";
        document.querySelector("#phieu-chu-so").textContent = "Không đồng chẵn.";
        return;
      }

      const ct = tinhChiTietPhieuLuong(dongLuong, CAU_HINH);
      const [nam, thangSo] = (thang || "").split("-");
      const tieuDeKy = thangSo && nam ? `Phiếu lương tháng ${thangSo}/${nam}` : "Phiếu lương cá nhân";

      document.querySelector("#phieu-tieu-de").textContent = tieuDeKy;
      document.querySelector("#phieu-ho-ten").textContent = ct.HoTen;
      document.querySelector("#phieu-ma-nv").textContent = ct.MaNV;
      document.querySelector("#phieu-phong-ban").textContent = ct.TenPB;
      document.querySelector("#phieu-chuc-vu").textContent = ct.ChucVu;
      document.querySelector("#phieu-ngay-cong").textContent = `${ct.NgayCong} / ${ct.NgayCongChuan} ngày`;
      const elLuongCB = document.querySelector("#phieu-luong-cb");
      if (elLuongCB) {
        let chuThich = "";
        if (ct.LaThucTap) {
          chuThich = ` <span class="badge-thuc-tap" title="Thực tập 6 tháng hưởng 70% lương (giảm 30% so với lương chính thức ${escapeHTML(dinhDangTien(ct.MucLuongGoc))})">Thực tập (-30%)</span>`;
        } else if (ct.LaChinhThucMoi) {
          chuThich = ' <span class="badge-chinh-thuc" title="Đã qua 6 tháng thực tập, hưởng 100% lương theo quy định">Chính thức (100%)</span>';
        } else if (ct.LaLuongDeXuat) {
          chuThich = ' <span class="badge-de-xuat" title="Mức lương đề xuất ban đầu do người dùng tự nhập">Đề xuất</span>';
        }
        elLuongCB.innerHTML = `${escapeHTML(dinhDangTien(ct.MucLuong))}${chuThich}`;
      }
      document.querySelector("#phieu-luong-cong").textContent = dinhDangTien(ct.LuongNgayCong);
      document.querySelector("#phieu-phu-cap").textContent = `+ ${dinhDangTien(ct.PhuCap)}`;
      const elThuongPhat = document.querySelector("#phieu-thuong-phat");
      if (elThuongPhat) {
        const parts = [];
        if (ct.Thuong > 0) parts.push(`+ ${dinhDangTien(ct.Thuong)} (Thưởng)`);
        if (ct.Phat > 0) parts.push(`- ${dinhDangTien(ct.Phat)} (Kỷ luật)`);
        elThuongPhat.textContent = parts.length ? parts.join(" · ") : "0 đ";
        if (ct.Thuong > 0 && ct.Phat === 0) elThuongPhat.style.color = "var(--mau-thanh-cong)";
        else if (ct.Phat > 0 && ct.Thuong === 0) elThuongPhat.style.color = "var(--mau-loi)";
        else elThuongPhat.style.color = "";
      }
      document.querySelector("#phieu-bao-hiem").textContent = `- ${dinhDangTien(ct.BaoHiem)}`;
      document.querySelector("#phieu-thuc-linh").innerHTML = `<strong>${dinhDangTien(ct.ThucLinh)}</strong>`;
      document.querySelector("#phieu-chu-so").textContent = ct.BangChu;
    }

    function render() {
      const dsCCNgay = kho.dsChamCongNgay || {};
      const dsKT = kho.dsKhenThuong || [];
      const dsHD = kho.dsHopDong || HOP_DONG_LAO_DONG;
      bangLuongHienTai = taoBangLuong(
        inputThang.value,
        dsNV.filter((nv) => !locPhongBan.value || nv.MaPB === locPhongBan.value),
        dsPB,
        LUONG_NHAN_VIEN,
        MUC_LUONG,
        CHAM_CONG,
        CAU_HINH,
        dsCCNgay,
        dsKT,
        dsHD,
        kho.dsNghiPhep
      );
      const tong = tongQuyLuong(bangLuongHienTai);
      const oTongThucLinh = document.querySelector("#tong-thuc-linh-ky");
      if (oTongThucLinh) oTongThucLinh.textContent = dinhDangTien(tong.tongQuyLuong);

      // Cập nhật tiêu đề bảng theo tháng
      const [nam, thangSo] = (inputThang.value || "").split("-");
      const tieuDeBang = document.querySelector("#salary-table-heading");
      if (tieuDeBang && thangSo && nam) {
        tieuDeBang.textContent = `Bảng chấm công và lương tháng ${thangSo}/${nam}`;
      }

      if (!bangLuongHienTai.length) {
        thanBang.innerHTML = '<tr><td colspan="8" data-cot="Kết quả" class="khong-co-du-lieu">Chưa có dữ liệu chấm công tháng này</td></tr>';
        ketQua.textContent = "Chưa có dữ liệu chấm công tháng này";
        renderPhieuLuong(null, inputThang.value);
      } else {
        // Đảm bảo luôn có nhân viên được chọn
        if (!maNVDangChon || !bangLuongHienTai.some((d) => d.MaNV === maNVDangChon)) {
          maNVDangChon = bangLuongHienTai[0].MaNV;
        }

        thanBang.innerHTML = bangLuongHienTai.map((dong) => `
          <tr class="hang-bang-luong ${dong.MaNV === maNVDangChon ? "hang-duoc-chon" : ""}" data-ma-nv="${escapeHTML(dong.MaNV)}">
            <td data-cot="Mã NV">${escapeHTML(dong.MaNV)}</td>
            <td data-cot="Họ và tên">${escapeHTML(dong.HoTen)}</td>
            <td data-cot="Phòng ban">${escapeHTML(dong.TenPB)}</td>
            <td data-cot="Ngày công">${escapeHTML(dong.NgayCong)}</td>
            <td class="so-tien" data-cot="Mức lương">
              ${escapeHTML(dinhDangTien(dong.MucLuong))}
              ${dong.LaThucTap ? '<span class="badge-thuc-tap" title="Đang thực tập: Lương giảm 30% so với lương chính thức">Thực tập (-30%)</span>' : (dong.LaChinhThucMoi ? '<span class="badge-chinh-thuc" title="Đã qua 6 tháng thực tập, hưởng 100% lương">Chính thức</span>' : (dong.LaLuongDeXuat ? '<span class="badge-de-xuat" title="Mức lương thỏa thuận đề xuất">Đề xuất</span>' : ''))}
            </td>
            <td class="so-tien" data-cot="Phụ cấp">${escapeHTML(dinhDangTien(dong.PhuCap))}</td>
            <td class="so-tien" data-cot="Thực lĩnh">${escapeHTML(dinhDangTien(dong.LuongThucNhan))}</td>
            <td data-cot="Thao tác" class="cot-thao-tac">
              <button type="button" class="nut nut-nho nut-vien nut-xem-phieu" data-ma-nv="${escapeHTML(dong.MaNV)}">Xem phiếu</button>
            </td>
          </tr>
        `).join("");
        ketQua.textContent = `Có ${tong.tongNhanVien} nhân viên trong bảng lương.`;

        const dongDangChon = bangLuongHienTai.find((d) => d.MaNV === maNVDangChon);
        renderPhieuLuong(dongDangChon, inputThang.value);
      }

      const oTong = tongDong.querySelector("td.so-tien");
      if (oTong) oTong.textContent = dinhDangTien(tong.tongQuyLuong);
    }

    // Bấm vào hàng hoặc nút Xem & In để đổi phiếu lương
    thanBang.addEventListener("click", (e) => {
      const row = e.target.closest("tr[data-ma-nv]");
      if (!row) return;
      const maNV = row.getAttribute("data-ma-nv");
      if (!maNV) return;

      maNVDangChon = maNV;
      thanBang.querySelectorAll("tr").forEach((r) => r.classList.remove("hang-duoc-chon"));
      row.classList.add("hang-duoc-chon");

      const dong = bangLuongHienTai.find((d) => d.MaNV === maNV);
      renderPhieuLuong(dong, inputThang.value);

      const phieuLuong = document.querySelector("#phieu-luong-ca-nhan");
      /* Bố cục ≥1360px: thẻ .the bên trong aside mới là phần tử sticky,
         nên kiểm tra trên thẻ đó thay vì aside. */
      const khungPhieu = document.querySelector("#khung-phieu-luong");
      const phieuDaNeo = khungPhieu && getComputedStyle(khungPhieu).position === "sticky";
      if (e.target.closest(".nut-xem-phieu") && phieuLuong && !phieuDaNeo) {
        const giamChuyenDong = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        phieuLuong.focus({ preventScroll: true });
        phieuLuong.scrollIntoView({ behavior: giamChuyenDong ? "auto" : "smooth" });
      }
    });

    // Sự kiện in phiếu lương cá nhân
    if (nutInPhieu) {
      nutInPhieu.addEventListener("click", () => {
        document.body.classList.add("che-do-in-phieu");
        window.print();
        setTimeout(() => document.body.classList.remove("che-do-in-phieu"), 500);
      });
    }

    // Sự kiện in toàn bộ bảng lương tổng hợp
    if (nutInBangLuong) {
      nutInBangLuong.addEventListener("click", () => {
        document.body.classList.add("che-do-in-bang-luong");
        window.print();
        setTimeout(() => document.body.classList.remove("che-do-in-bang-luong"), 500);
      });
    }

    // Sự kiện xuất Excel / CSV bảng lương
    const nutXuatExcelBL = document.querySelector("#nut-xuat-excel-bl");
    if (nutXuatExcelBL) {
      nutXuatExcelBL.addEventListener("click", () => {
        const tieuDe = ["Mã NV", "Họ và tên", "Phòng ban", "Ngày công", "Lương cơ bản (đ)", "Chế độ lương", "Phụ cấp (đ)", "Thực lĩnh (đ)"];
        const cacDong = bangLuongHienTai.map((d) => [
          d.MaNV,
          d.HoTen,
          d.TenPB,
          d.NgayCong,
          d.MucLuong,
          d.LaThucTap ? "Thực tập (70% - giảm 30%)" : (d.LaChinhThucMoi ? "Chính thức (100%)" : "Chính thức"),
          d.PhuCap,
          d.LuongThucNhan
        ]);
        const csv = taoChuoiCSV(tieuDe, cacDong);
        taiTapTinVeMay(csv, `bang-luong-${inputThang.value || "thang"}.csv`);
        hienThiToast(`Đã xuất bảng lương tháng ${inputThang.value} ra file Excel/CSV thành công!`, "thanh-cong");
      });
    }

    form.addEventListener("submit", (suKien) => { suKien.preventDefault(); render(); });
    inputThang.addEventListener("change", render);
    locPhongBan.addEventListener("change", render);

    /* --- Line Chart: xu hướng quỹ lương 6 tháng (Chart.js, có fallback chữ) --- */
    let chartQuyLuong = null;
    const coChart = typeof Chart !== "undefined";
    const dsNVTatCa = kho.dsNhanVien || NHAN_VIEN;
    const dsHDTatCa = kho.dsHopDong || HOP_DONG_LAO_DONG;

    function veChartQuyLuong() {
      const khung = document.querySelector("#khung-chart-quy-luong");
      if (!khung) return;
      if (chartQuyLuong) { chartQuyLuong.destroy(); chartQuyLuong = null; }

      if (!coChart) {
        khung.innerHTML = '<p class="thong-bao-chart-fallback">Biểu đồ cần kết nối mạng để tải Chart.js. Tổng quỹ lương của kỳ đang chọn xem ở khung "Tổng thực lĩnh" phía trên.</p>';
        return;
      }

      const theme = window.HRMThuVien ? window.HRMThuVien.docTheme() : document.documentElement.dataset.theme;
      const toi = theme === "dark";
      const mau = {
        chu: toi ? "#C3C9D4" : "#3D4350",
        luoi: toi ? "rgb(255 255 255 / 8%)" : "rgb(27 31 39 / 8%)",
        duong: toi ? "#7FA8EF" : "#1F509E",
        dien: toi ? "rgb(127 168 239 / 22%)" : "rgb(31 80 158 / 16%)"
      };

      /* Dựng dữ liệu 6 kỳ lương, tính lùi từ tháng đang chọn. */
      const [namChon, thangChon] = (inputThang.value || ngayThamChieuDemo().slice(0, 7)).split("-").map(Number);
      const nhan = [];
      const duLieu = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(namChon, thangChon - 1 - i, 1);
        const thang = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const bangLuongKy = taoBangLuong(
          thang, dsNVTatCa, dsPB, LUONG_NHAN_VIEN, MUC_LUONG, CHAM_CONG, CAU_HINH,
          kho.dsChamCongNgay, kho.dsKhenThuong, dsHDTatCa, kho.dsNghiPhep
        );
        nhan.push(`${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`);
        duLieu.push(Math.round(tongQuyLuong(bangLuongKy).tongQuyLuong));
      }

      khung.innerHTML = '<canvas id="chart-quy-luong" role="img" aria-label="Biểu đồ đường tổng quỹ lương 6 tháng gần nhất"></canvas>';
      chartQuyLuong = new Chart(document.querySelector("#chart-quy-luong"), {
        type: "line",
        data: {
          labels: nhan,
          datasets: [{
            label: "Tổng thực lĩnh (đ)",
            data: duLieu,
            borderColor: mau.duong,
            backgroundColor: mau.dien,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: mau.duong
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: window.HRMThuVien && window.HRMThuVien.giamChuyenDong() ? false : { duration: 700 },
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { labels: { color: mau.chu, usePointStyle: true } },
            tooltip: {
              backgroundColor: toi ? "#1E232B" : "#163C77",
              padding: 10,
              cornerRadius: 8,
              callbacks: { label: (nc) => ` ${dinhDangTien(nc.parsed.y)}` }
            }
          },
          scales: {
            y: {
              grid: { color: mau.luoi },
              ticks: {
                color: mau.chu,
                callback: (giaTri) => `${Math.round(giaTri / 1000000)}tr`
              }
            },
            x: { grid: { display: false }, ticks: { color: mau.chu } }
          }
        }
      });
    }

    /* Vẽ bảng lương lần đầu, rồi vẽ chart; dựng lại chart khi đổi theme / kỳ lương. */
    render();
    veChartQuyLuong();
    window.addEventListener("hrm:themechange", veChartQuyLuong);
    inputThang.addEventListener("change", veChartQuyLuong);
  }
})();
