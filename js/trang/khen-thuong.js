(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoTrangKhenThuong);

  function khoiTaoTrangKhenThuong() {
    const thanBang = document.querySelector("#than-bang-khen-thuong");
    const nutThem = document.querySelector("#nut-them-quyet-dinh");
    const dialogThem = document.querySelector("#dialog-them-kt");
    const formThem = document.querySelector("#form-them-kt");
    const nutHuy = document.querySelector("#nut-huy-kt");
    const nutXuatExcel = document.querySelector("#nut-xuat-excel-kt");
    const oTimKiem = document.querySelector("#loc-kt-tu-khoa");
    const locLoai = document.querySelector("#loc-kt-loai");
    const dongKetQua = document.querySelector("#kt-dong-ket-qua");

    if (!thanBang) return;

    const kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: NHAN_VIEN, dsPhongBan: PHONG_BAN, dsKhenThuong: [] };
    const dsNV = kho.dsNhanVien || NHAN_VIEN;
    const dsPB = kho.dsPhongBan || PHONG_BAN;
    let dsKT = kho.dsKhenThuong || [];

    function capNhatThongKe() {
      const khen = dsKT.filter((x) => x.Loai === "KhenThuong");
      const phat = dsKT.filter((x) => x.Loai === "KyLuat");
      const tongTienThuong = khen.reduce((t, x) => t + (Number(x.SoTien) || 0), 0);
      const dem = window.HRMThuVien ? window.HRMThuVien.demLen : (node, giaTri, tuyChon) => { node.textContent = tuyChon && tuyChon.dinhDang ? tuyChon.dinhDang(giaTri) : String(giaTri); };

      dem(document.querySelector("#thong-ke-kt-tong"), dsKT.length);
      dem(document.querySelector("#thong-ke-kt-khen"), khen.length);
      dem(document.querySelector("#thong-ke-kt-phat"), phat.length);
      dem(document.querySelector("#thong-ke-kt-tien-thuong"), tongTienThuong, { dinhDang: dinhDangTien });
    }

    function render() {
      const tuKhoa = boDauTiengViet(oTimKiem ? oTimKiem.value : "").trim();
      const loaiChon = locLoai ? locLoai.value : "";

      const danhSachLoc = dsKT.filter((item) => {
        const nv = dsNV.find((n) => n.MaNV === item.MaNV);
        const hoTen = nv ? nv.HoTen : "";
        const text = boDauTiengViet(`${item.MaQD} ${item.MaNV} ${hoTen} ${item.LyDo}`);
        const khopTuKhoa = !tuKhoa || text.includes(tuKhoa);
        const khopLoai = !loaiChon || item.Loai === loaiChon;
        return khopTuKhoa && khopLoai;
      });

      if (dongKetQua) {
        dongKetQua.textContent = `Hiển thị ${danhSachLoc.length} / ${dsKT.length} quyết định`;
      }

      if (!danhSachLoc.length) {
        thanBang.innerHTML = '<tr><td colspan="9" class="khong-co-du-lieu">Chưa có quyết định khen thưởng hoặc kỷ luật nào</td></tr>';
        capNhatThongKe();
        return;
      }

      thanBang.innerHTML = danhSachLoc.map((item) => {
        const nv = dsNV.find((n) => n.MaNV === item.MaNV);
        const tenPB = nv ? layTenPhongBan(dsPB, nv.MaPB) : "—";
        const hoTen = nv ? nv.HoTen : item.MaNV;
        const laKhen = item.Loai === "KhenThuong";

        return `<tr>
          <td data-cot="Mã quyết định"><strong>${escapeHTML(item.MaQD)}</strong></td>
          <td data-cot="Mã NV">${escapeHTML(item.MaNV)}</td>
          <td data-cot="Họ và tên"><strong>${escapeHTML(hoTen)}</strong></td>
          <td data-cot="Phòng ban">${escapeHTML(tenPB)}</td>
          <td data-cot="Loại"><span class="${laKhen ? "badge-khen-thuong" : "badge-ky-luat"}">${laKhen ? "Khen thưởng" : "Kỷ luật"}</span></td>
          <td data-cot="Số tiền" class="so-tien tien-quyet-dinh ${laKhen ? "chu-thanh-cong" : "chu-loi"}">${laKhen ? "+" : "-"}${escapeHTML(dinhDangTien(item.SoTien))}</td>
          <td data-cot="Ngày quyết định">${escapeHTML(dinhDangNgay(item.NgayQD))}</td>
          <td data-cot="Lý do">${escapeHTML(item.LyDo)}</td>
          <td data-cot="Thao tác">
            <button type="button" class="nut nut-nho nut-nguy-hiem nut-xoa-kt" data-ma-qd="${escapeHTML(item.MaQD)}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Xóa quyết định ${escapeHTML(item.MaQD)}"><i class="bi bi-trash3" aria-hidden="true"></i> Xóa</button>
          </td>
        </tr>`;
      }).join("");
      if (window.HRMThuVien) window.HRMThuVien.khoiTaoTooltip(thanBang);

      capNhatThongKe();
    }

    thanBang.addEventListener("click", async (e) => {
      const nutXoa = e.target.closest(".nut-xoa-kt");
      if (!nutXoa) return;
      const maQD = nutXoa.getAttribute("data-ma-qd");
      if (confirm(`Bạn có chắc chắn muốn xóa quyết định ${maQD}?`)) {
        const dsMoi = dsKT.filter((x) => x.MaQD !== maQD);
        if (!await luuThayDoi({ ...kho, dsKhenThuong: dsMoi })) return;
        dsKT = dsMoi;
        render();
        hienThiToast(`Đã xóa quyết định ${maQD}!`, "thong-tin");
      }
    });

    /* ==========================================================================
       QUẢN LÝ BẢNG QUY ĐỊNH ĐỊNH MỨC KHEN THƯỞNG & XỬ PHẠT (500k - 15M, TĂNG 10%/CẤP LỖI)
       ========================================================================== */
    const thanBangQuyDinh = document.querySelector("#than-bang-quy-dinh");
    const nutSapXepQuyDinh = document.querySelector("#nut-sap-xep-quy-dinh");
    const oTimKiemQuyDinh = document.querySelector("#loc-quy-dinh-tu-khoa");
    const locLoaiQuyDinh = document.querySelector("#loc-quy-dinh-loai");
    const dongKetQuaQuyDinh = document.querySelector("#dong-ket-qua-quy-dinh");

    let huongSapXepQuyDinh = "tang"; // "tang" hoặc "giam"

    function renderBangQuyDinh() {
      if (!thanBangQuyDinh) return;
      const danhSachGoc = typeof QUY_DINH_KT_KL !== "undefined" ? QUY_DINH_KT_KL : [];
      const tuKhoa = boDauTiengViet(oTimKiemQuyDinh ? oTimKiemQuyDinh.value : "").trim();
      const loaiChon = locLoaiQuyDinh ? locLoaiQuyDinh.value : "";

      let dsLoc = danhSachGoc.filter((item) => {
        const text = boDauTiengViet(`${item.MaQC} ${item.TenHanhVi} ${item.MoTa}`);
        const khopTuKhoa = !tuKhoa || text.includes(tuKhoa);
        const khopLoai = !loaiChon || item.Loai === loaiChon;
        return khopTuKhoa && khopLoai;
      });

      dsLoc = sapXepQuyDinh(dsLoc, huongSapXepQuyDinh);

      if (dongKetQuaQuyDinh) {
        dongKetQuaQuyDinh.textContent = `Hiển thị ${dsLoc.length} / ${danhSachGoc.length} quy định chuẩn (Min 500.000 đ – Max 15.000.000 đ, tăng 10%/cấp lỗi)`;
      }

      if (!dsLoc.length) {
        thanBangQuyDinh.innerHTML = '<tr><td colspan="7" class="khong-co-du-lieu">Không tìm thấy quy định phù hợp với bộ lọc</td></tr>';
        return;
      }

      thanBangQuyDinh.innerHTML = dsLoc.map((item) => {
        const laKhen = item.Loai === "KhenThuong";
        const muc2 = tinhTienTheoCapDoLoi(item.MucCoSo, 2);
        const muc3 = tinhTienTheoCapDoLoi(item.MucCoSo, 3);
        const muc4 = tinhTienTheoCapDoLoi(item.MucCoSo, 4);

        return `<tr>
          <td data-cot="Mã quy định"><strong>${escapeHTML(item.MaQC)}</strong></td>
          <td data-cot="Hành vi / Thành tích">
            <strong>${escapeHTML(item.TenHanhVi)}</strong>
            <small class="chu-3 mo-ta-quy-dinh">${escapeHTML(item.MoTa)}</small>
          </td>
          <td data-cot="Phân loại">
            <span class="${laKhen ? "badge-khen-thuong" : "badge-ky-luat"}">${laKhen ? "Khen thưởng" : "Xử phạt"}</span>
          </td>
          <td data-cot="Mức cơ sở" class="so-tien tien-quy-dinh ${laKhen ? "chu-thanh-cong" : "chu-loi"}">
            ${escapeHTML(dinhDangTien(item.MucCoSo))}
          </td>
          <td data-cot="Quy tắc tăng">
            <span class="muc-tang-tai-pham">+10% mỗi cấp lỗi</span>
          </td>
          <td data-cot="Mức khi tái phạm" class="muc-tien-tai-pham">
            <div>
              <div>Cấp 2 (+10%): <strong>${escapeHTML(dinhDangTien(muc2))}</strong></div>
              <div>Cấp 3 (+20%): <strong>${escapeHTML(dinhDangTien(muc3))}</strong></div>
              <div>Cấp 4 (+30%): <strong>${escapeHTML(dinhDangTien(muc4))}</strong></div>
            </div>
          </td>
          <td data-cot="Thao tác">
            <button type="button" class="nut nut-nho nut-ap-dung-qc" data-ma-qc="${escapeHTML(item.MaQC)}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Tạo quyết định mới theo quy định này"><i class="bi bi-clipboard2-check" aria-hidden="true"></i> Áp dụng</button>
          </td>
        </tr>`;
      }).join("");
      if (window.HRMThuVien) window.HRMThuVien.khoiTaoTooltip(thanBangQuyDinh);
    }

    // Sắp xếp quy định tăng dần / giảm dần
    if (nutSapXepQuyDinh) {
      nutSapXepQuyDinh.addEventListener("click", () => {
        huongSapXepQuyDinh = huongSapXepQuyDinh === "tang" ? "giam" : "tang";
        nutSapXepQuyDinh.setAttribute("data-huong", huongSapXepQuyDinh);
        nutSapXepQuyDinh.textContent = huongSapXepQuyDinh === "tang"
          ? "Sắp xếp: Tăng dần (500k ➔ 15M) ⬆"
          : "Sắp xếp: Giảm dần (15M ➔ 500k) ⬇";
        renderBangQuyDinh();
      });
    }

    if (oTimKiemQuyDinh) oTimKiemQuyDinh.addEventListener("input", renderBangQuyDinh);
    if (locLoaiQuyDinh) locLoaiQuyDinh.addEventListener("change", renderBangQuyDinh);

    // Bấm nút "Áp dụng" trên bảng quy định
    if (thanBangQuyDinh) {
      thanBangQuyDinh.addEventListener("click", (e) => {
        const nutApDung = e.target.closest(".nut-ap-dung-qc");
        if (!nutApDung) return;
        const maQC = nutApDung.getAttribute("data-ma-qc");
        const quyDinh = (typeof QUY_DINH_KT_KL !== "undefined" ? QUY_DINH_KT_KL : []).find((x) => x.MaQC === maQC);
        if (!quyDinh) return;

        moFormThemQuyetDinh(quyDinh);
      });
    }

    function moFormThemQuyetDinh(quyDinhChon = null) {
      const selectNV = document.querySelector("#kt-nhan-vien");
      if (selectNV) {
        selectNV.innerHTML = '<option value="">Chọn nhân viên</option>' +
          dsNV.map((nv) => `<option value="${escapeHTML(nv.MaNV)}">${escapeHTML(nv.MaNV)} - ${escapeHTML(nv.HoTen)}</option>`).join("");
      }
      const selectQC = document.querySelector("#kt-chon-quy-dinh");
      if (selectQC) {
        selectQC.innerHTML = '<option value="">-- Tự nhập hoặc chọn quy định chuẩn --</option>' +
          (typeof QUY_DINH_KT_KL !== "undefined" ? QUY_DINH_KT_KL : []).map((qc) => `
            <option value="${escapeHTML(qc.MaQC)}" ${quyDinhChon && quyDinhChon.MaQC === qc.MaQC ? "selected" : ""}>
              [${qc.Loai === "KhenThuong" ? "Thưởng" : "Phạt"}] ${escapeHTML(qc.TenHanhVi)} (${dinhDangTien(qc.MucCoSo)})
            </option>
          `).join("");
      }
      document.querySelector("#kt-ma-qd").value = sinhMaQuyetDinh(dsKT);
      document.querySelector("#kt-ngay").value = new Date().toISOString().slice(0, 10);
      const capDoInput = document.querySelector("#kt-cap-do-loi");
      if (capDoInput) capDoInput.value = "1";

      mucCoSoTuNhap = 500000;
      selectLoai.value = quyDinhChon?.Loai || "KhenThuong";
      inputLyDo.value = "";
      capNhatTienTheoForm();
      moDialog(dialogThem);
    }

    // Tương tác thay đổi quy định và cấp lỗi trong form
    const selectChonQC = document.querySelector("#kt-chon-quy-dinh");
    const selectCapDo = document.querySelector("#kt-cap-do-loi");
    const inputSoTien = document.querySelector("#kt-so-tien");
    const inputMucCoSo = document.querySelector("#kt-muc-co-so");
    let mucCoSoTuNhap = 500000;
    const inputLyDo = document.querySelector("#kt-ly-do");
    const selectLoai = document.querySelector("#kt-loai");

    function capNhatTienTheoForm() {
      const maQC = selectChonQC ? selectChonQC.value : "";
      const cap = selectCapDo ? Number(selectCapDo.value) || 1 : 1;
      const quyDinh = (typeof QUY_DINH_KT_KL !== "undefined" ? QUY_DINH_KT_KL : []).find((x) => x.MaQC === maQC);

      inputMucCoSo.readOnly = Boolean(quyDinh);
      const giaTriGoc = String(quyDinh?.MucCoSo ?? mucCoSoTuNhap);
      if (inputMucCoSo.value !== giaTriGoc) inputMucCoSo.value = giaTriGoc;
      const mucCoSo = inputMucCoSo.valueAsNumber;
      inputSoTien.value = Number.isSafeInteger(mucCoSo) && mucCoSo >= 500000 && mucCoSo <= 15000000
        ? tinhTienTheoCapDoLoi(mucCoSo, cap)
        : "";

      if (quyDinh) {
        selectLoai.value = quyDinh.Loai;
        const phanCap = cap > 1 ? ` (Tái phạm cấp ${cap} - tăng ${(cap - 1) * 10}%)` : "";
        inputLyDo.value = `${quyDinh.TenHanhVi}${phanCap} - ${quyDinh.MoTa}`;
      }
    }

    selectChonQC.addEventListener("change", capNhatTienTheoForm);
    selectCapDo.addEventListener("change", capNhatTienTheoForm);
    inputMucCoSo.addEventListener("input", () => {
      mucCoSoTuNhap = inputMucCoSo.value;
      capNhatTienTheoForm();
    });

    if (nutThem && dialogThem) {
      nutThem.addEventListener("click", () => moFormThemQuyetDinh(null));
    }

    if (nutHuy && dialogThem) {
      nutHuy.addEventListener("click", () => dongDialog(dialogThem));
    }

    if (formThem) {
      formThem.addEventListener("submit", async (e) => {
        e.preventDefault();
        const maQD = document.querySelector("#kt-ma-qd").value;
        const maNV = document.querySelector("#kt-nhan-vien").value;
        const loai = document.querySelector("#kt-loai").value;
        const soTien = Number(document.querySelector("#kt-so-tien").value) || 0;
        const ngayQD = document.querySelector("#kt-ngay").value;
        const lyDo = document.querySelector("#kt-ly-do").value.trim();

        if (!maNV || !lyDo) {
          hienThiToast("Vui lòng điền đầy đủ thông tin quyết định.", "canh-bao");
          return;
        }

        if (!Number.isSafeInteger(soTien) || soTien < 500000 || soTien > 15000000) {
          hienThiToast("Số tiền quyết định phải nằm trong khoảng từ 500.000 đ đến 15.000.000 đ (tùy theo lỗi tăng 10%)!", "canh-bao");
          return;
        }

        const qdMoi = { MaQD: maQD, MaNV: maNV, Loai: loai, SoTien: soTien, NgayQD: ngayQD, LyDo: lyDo };
        const dsMoi = [qdMoi, ...dsKT];
        if (!await luuThayDoi({ ...kho, dsKhenThuong: dsMoi })) return;
        dsKT = dsMoi;

        dongDialog(dialogThem);
        formThem.reset();
        render();
        hienThiToast(`Đã ban hành quyết định ${maQD} thành công!`, "thanh-cong");
      });
    }

    if (nutXuatExcel) {
      nutXuatExcel.addEventListener("click", () => {
        const tieuDe = ["Mã QĐ", "Mã NV", "Họ và tên", "Phòng ban", "Loại", "Số tiền (đ)", "Ngày quyết định", "Lý do"];
        const cacDong = dsKT.map((item) => {
          const nv = dsNV.find((n) => n.MaNV === item.MaNV);
          return [
            item.MaQD,
            item.MaNV,
            nv ? nv.HoTen : item.MaNV,
            nv ? layTenPhongBan(dsPB, nv.MaPB) : "",
            item.Loai === "KhenThuong" ? "Khen thưởng" : "Kỷ luật",
            item.SoTien,
            item.NgayQD,
            item.LyDo
          ];
        });
        const csv = taoChuoiCSV(tieuDe, cacDong);
        taiTapTinVeMay(csv, `danh-sach-khen-thuong-ky-luat-${new Date().toISOString().slice(0, 10)}.csv`);
        hienThiToast("Đã xuất danh sách khen thưởng & kỷ luật ra Excel/CSV!", "thanh-cong");
      });
    }

    if (oTimKiem) oTimKiem.addEventListener("input", render);
    if (locLoai) locLoai.addEventListener("change", render);
    render();
    renderBangQuyDinh();
  }
})();
