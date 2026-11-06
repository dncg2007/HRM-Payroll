(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoQuanLyChucVu);

  function khoiTaoQuanLyChucVu() {
    const thanBang = document.querySelector("#than-bang-chuc-vu");
    const thongBao = document.querySelector("#chuc-vu-thong-bao");
    const nutThem = document.querySelector("#nut-them-chuc-vu");
    const dialogCV = document.querySelector("#dialog-chuc-vu");
    const formCV = document.querySelector("#form-chuc-vu");
    const nutDongCV = document.querySelector("#nut-dong-dialog-cv");
    const tieuDeDialog = document.querySelector("#tieu-de-dialog-cv");
    const maInput = document.querySelector("#cv-ma");
    const tenInput = document.querySelector("#cv-ten");
    const moTaInput = document.querySelector("#cv-mo-ta");
    const loiDialogCV = document.querySelector("#loi-dialog-cv");

    const dialogXoa = document.querySelector("#dialog-xoa-chuc-vu");
    const formXoa = document.querySelector("#form-xoa-chuc-vu");
    const nutDongXoa = document.querySelector("#nut-dong-dialog-xoa-cv");
    const moTaXoa = document.querySelector("#mo-ta-xoa-cv");
    const loiDialogXoa = document.querySelector("#loi-dialog-xoa-cv");

    let kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: [...NHAN_VIEN], dsChucVu: [] };
    let dangSuaMaCV = null;
    let dangXoaMaCV = null;

    function capNhatGiaoDien() {
      kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : kho;
      const dsCV = kho.dsChucVu || [];
      const dsNV = kho.dsNhanVien || [];
      const danhSachDem = demChucVu(dsNV, dsCV);

      // Cập nhật thống kê
      const tongCV = document.querySelector("#thong-ke-tong-cv");
      const tongNV = document.querySelector("#thong-ke-tong-nv-cv");
      const phoBien = document.querySelector("#thong-ke-cv-pho-bien");

      const maxCV = danhSachDem.length ? [...danhSachDem].sort((a, b) => b.SoLuong - a.SoLuong)[0] : null;

      if (tongCV) tongCV.textContent = String(dsCV.length);
      if (tongNV) tongNV.textContent = String(danhSachDem.reduce((t, x) => t + x.SoLuong, 0));
      if (phoBien) phoBien.textContent = maxCV ? `${maxCV.TenChucVu} (${maxCV.SoLuong})` : "—";
      if (thongBao) thongBao.textContent = `Có ${dsCV.length} chức vụ trong hệ thống.`;

      if (!thanBang) return;
      if (!dsCV.length) {
        thanBang.innerHTML = '<tr><td colspan="5" data-cot="Kết quả" class="khong-co-du-lieu">Chưa có chức vụ nào trong danh mục.</td></tr>';
        return;
      }

      thanBang.innerHTML = danhSachDem.map((cv) => {
        const goc = dsCV.find((x) => x.MaChucVu === cv.MaChucVu) || {};
        return `<tr>
          <td data-cot="Mã CV">${escapeHTML(cv.MaChucVu)}</td>
          <td data-cot="Tên chức vụ"><strong>${escapeHTML(cv.TenChucVu)}</strong></td>
          <td data-cot="Mô tả">${escapeHTML(goc.MoTa || "Chưa có mô tả.")}</td>
          <td data-cot="Số lượng nhân viên">${escapeHTML(cv.SoLuong)} người</td>
          <td data-cot="Thao tác">
            <button class="nut nut-nho nut-sua-cv" type="button" data-ma-cv="${escapeHTML(cv.MaChucVu)}" aria-label="Sửa chức vụ ${escapeHTML(cv.TenChucVu)}">Sửa</button>
            <button class="nut nut-nho nut-nguy-hiem nut-xoa-cv" type="button" data-ma-cv="${escapeHTML(cv.MaChucVu)}" aria-label="Xóa chức vụ ${escapeHTML(cv.TenChucVu)}">Xóa</button>
          </td>
        </tr>`;
      }).join("");
    }

    function moThemCV() {
      dangSuaMaCV = null;
      if (tieuDeDialog) tieuDeDialog.textContent = "Thêm chức vụ mới";
      if (maInput) maInput.value = sinhMaChucVu(kho.dsChucVu || []);
      if (tenInput) tenInput.value = "";
      if (moTaInput) moTaInput.value = "";
      if (loiDialogCV) loiDialogCV.textContent = "";
      moDialog(dialogCV);
    }

    function moSuaCV(maCV) {
      const cv = (kho.dsChucVu || []).find((x) => x.MaChucVu === maCV);
      if (!cv) return;
      dangSuaMaCV = maCV;
      if (tieuDeDialog) tieuDeDialog.textContent = `Sửa chức vụ ${cv.TenChucVu}`;
      if (maInput) maInput.value = cv.MaChucVu;
      if (tenInput) tenInput.value = cv.TenChucVu;
      if (moTaInput) moTaInput.value = cv.MoTa || "";
      if (loiDialogCV) loiDialogCV.textContent = "";
      moDialog(dialogCV);
    }

    if (nutThem) nutThem.addEventListener("click", moThemCV);
    if (nutDongCV) nutDongCV.addEventListener("click", () => dongDialog(dialogCV));
    if (nutDongXoa) nutDongXoa.addEventListener("click", () => dongDialog(dialogXoa));

    if (formCV) {
      formCV.addEventListener("submit", async (suKien) => {
        suKien.preventDefault();
        const maCV = maInput.value.trim();
        const tenCV = tenInput.value.trim();
        const moTa = moTaInput.value.trim();
        const duLieu = { MaChucVu: maCV, TenChucVu: tenCV, MoTa: moTa };

        const cacLoi = kiemTraChucVu(duLieu, kho.dsChucVu || []);
        if (cacLoi.length) {
          if (loiDialogCV) loiDialogCV.textContent = cacLoi[0].thongBao;
          return;
        }

        const thayDoi = dangSuaMaCV
          ? suaChucVu(kho.dsChucVu, kho.dsNhanVien, dangSuaMaCV, duLieu)
          : { danhSach: themChucVu(kho.dsChucVu, duLieu), nhanVien: kho.dsNhanVien };
        if (!await luuThayDoi({ ...kho, dsChucVu: thayDoi.danhSach, dsNhanVien: thayDoi.nhanVien })) return;
        dongDialog(dialogCV);
        capNhatGiaoDien();
      });
    }

    if (thanBang) {
      thanBang.addEventListener("click", (suKien) => {
        const nut = suKien.target.closest("button");
        if (!nut) return;
        const maCV = nut.dataset.maCv;
        if (nut.classList.contains("nut-sua-cv")) moSuaCV(maCV);
        if (nut.classList.contains("nut-xoa-cv")) {
          const kiemTra = xoaChucVu(kho.dsChucVu, kho.dsNhanVien, maCV);
          if (kiemTra.loi) {
            if (thongBao) thongBao.textContent = `Không thể xóa: ${kiemTra.loi}. Vui lòng chuyển vị trí công tác của nhân viên trước.`;
            return;
          }
          dangXoaMaCV = maCV;
          const cv = kho.dsChucVu.find((x) => x.MaChucVu === maCV);
          if (moTaXoa) moTaXoa.textContent = `Bạn có chắc chắn muốn xóa chức vụ "${cv ? cv.TenChucVu : maCV}"?`;
          if (loiDialogXoa) loiDialogXoa.textContent = "";
          moDialog(dialogXoa);
        }
      });
    }

    if (formXoa) {
      formXoa.addEventListener("submit", async (suKien) => {
        suKien.preventDefault();
        const result = xoaChucVu(kho.dsChucVu, kho.dsNhanVien, dangXoaMaCV);
        if (result.loi) {
          if (loiDialogXoa) loiDialogXoa.textContent = result.loi;
          return;
        }
        if (!await luuThayDoi({ ...kho, dsChucVu: result.ketQua })) return;
        dongDialog(dialogXoa);
        capNhatGiaoDien();
      });
    }

    capNhatGiaoDien();
  }
})();
