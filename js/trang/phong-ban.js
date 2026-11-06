(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoQuanLyPhongBan);

  function khoiTaoQuanLyPhongBan() {
    const container = document.querySelector("#danh-sach-phong-ban");
    const thongBao = document.querySelector("#phong-ban-thong-bao");
    const nutThem = document.querySelector("#nut-them-phong-ban");
    const dialogPB = document.querySelector("#dialog-phong-ban");
    const formPB = document.querySelector("#form-phong-ban");
    const nutDongPB = document.querySelector("#nut-dong-dialog-pb");
    const tieuDeDialog = document.querySelector("#tieu-de-dialog-pb");
    const maInput = document.querySelector("#pb-ma");
    const tenInput = document.querySelector("#pb-ten");
    const moTaInput = document.querySelector("#pb-mo-ta");
    const truongPhongSelect = document.querySelector("#pb-truong-phong");
    const loiDialogPB = document.querySelector("#loi-dialog-pb");

    const dialogXoa = document.querySelector("#dialog-xoa-phong-ban");
    const formXoa = document.querySelector("#form-xoa-phong-ban");
    const nutDongXoa = document.querySelector("#nut-dong-dialog-xoa-pb");
    const moTaXoa = document.querySelector("#mo-ta-xoa-pb");
    const loiDialogXoa = document.querySelector("#loi-dialog-xoa-pb");

    let kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: [...NHAN_VIEN], dsPhongBan: [...PHONG_BAN] };
    let dangSuaMaPB = null;
    let dangXoaMaPB = null;

    function capNhatGiaoDien() {
      kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : kho;
      const dsPB = kho.dsPhongBan || [];
      const dsNV = kho.dsNhanVien || [];

      // Cập nhật thống kê
      const tongPB = document.querySelector("#thong-ke-tong-pb");
      const tongNV = document.querySelector("#thong-ke-tong-nv-pb");
      const lonNhat = document.querySelector("#thong-ke-pb-lon-nhat");

      const demNV = demNhanVienTheoPhong(dsNV, dsPB);
      const pbMax = demNV.length ? [...demNV].sort((a, b) => b.SoLuong - a.SoLuong)[0] : null;

      if (tongPB) tongPB.textContent = String(dsPB.length);
      if (tongNV) tongNV.textContent = String(dsNV.filter((x) => x.MaPB).length);
      if (lonNhat) lonNhat.textContent = pbMax ? `${pbMax.TenPB} (${pbMax.SoLuong})` : "—";
      if (thongBao) thongBao.textContent = `Có ${dsPB.length} phòng ban trong hệ thống.`;

      // Render danh sách thẻ
      if (!container) return;
      if (!dsPB.length) {
        container.innerHTML = '<p class="khong-co-du-lieu">Chưa có phòng ban nào trong danh mục.</p>';
        return;
      }

      container.innerHTML = dsPB.map((pb) => {
        const soNV = dsNV.filter((nv) => nv.MaPB === pb.MaPB).length;
        const truongPhong = dsNV.find((nv) => nv.MaNV === pb.MaTruongPhong);
        const tenTruongPhong = truongPhong ? truongPhong.HoTen : "Chưa phân công";

        return `<article class="the the-phong-ban" data-ma-pb="${escapeHTML(pb.MaPB)}">
          <header>
            <h3>${escapeHTML(pb.TenPB)}</h3>
            <span class="nhan">${escapeHTML(pb.MaPB)}</span>
          </header>
          <p>${escapeHTML(pb.MoTa || "Chưa có mô tả.")}</p>
          <p><strong>Quân số:</strong> ${soNV} nhân viên</p>
          <p><strong>Trưởng phòng:</strong> ${escapeHTML(tenTruongPhong)}</p>
          <div class="thao-tac">
            <button class="nut nut-nho nut-sua-pb" type="button" data-ma-pb="${escapeHTML(pb.MaPB)}" aria-label="Sửa phòng ban ${escapeHTML(pb.TenPB)}">Sửa</button>
            <button class="nut nut-nho nut-nguy-hiem nut-xoa-pb" type="button" data-ma-pb="${escapeHTML(pb.MaPB)}" aria-label="Xóa phòng ban ${escapeHTML(pb.TenPB)}">Xóa</button>
          </div>
        </article>`;
      }).join("");
    }

    function napSelectTruongPhong(maPB) {
      if (!truongPhongSelect) return;
      const dsNV = (kho.dsNhanVien || []).filter((nv) => !maPB || nv.MaPB === maPB);
      truongPhongSelect.innerHTML = '<option value="">Chưa phân công</option>' +
        dsNV.map((nv) => `<option value="${escapeHTML(nv.MaNV)}">${escapeHTML(nv.HoTen)} (${escapeHTML(nv.MaNV)})</option>`).join("");
    }

    function moThemPB() {
      dangSuaMaPB = null;
      if (tieuDeDialog) tieuDeDialog.textContent = "Thêm phòng ban mới";
      if (maInput) maInput.value = sinhMaPhongBan(kho.dsPhongBan || []);
      if (tenInput) tenInput.value = "";
      if (moTaInput) moTaInput.value = "";
      if (loiDialogPB) loiDialogPB.textContent = "";
      napSelectTruongPhong("");
      moDialog(dialogPB);
    }

    function moSuaPB(maPB) {
      const pb = (kho.dsPhongBan || []).find((x) => x.MaPB === maPB);
      if (!pb) return;
      dangSuaMaPB = maPB;
      if (tieuDeDialog) tieuDeDialog.textContent = `Sửa phòng ban ${pb.TenPB}`;
      if (maInput) maInput.value = pb.MaPB;
      if (tenInput) tenInput.value = pb.TenPB;
      if (moTaInput) moTaInput.value = pb.MoTa || "";
      if (loiDialogPB) loiDialogPB.textContent = "";
      napSelectTruongPhong(pb.MaPB);
      if (truongPhongSelect) truongPhongSelect.value = pb.MaTruongPhong || "";
      moDialog(dialogPB);
    }

    if (nutThem) nutThem.addEventListener("click", moThemPB);
    if (nutDongPB) nutDongPB.addEventListener("click", () => dongDialog(dialogPB));
    if (nutDongXoa) nutDongXoa.addEventListener("click", () => dongDialog(dialogXoa));

    if (formPB) {
      formPB.addEventListener("submit", async (suKien) => {
        suKien.preventDefault();
        const maPB = maInput.value.trim();
        const tenPB = tenInput.value.trim();
        const moTa = moTaInput.value.trim();
        const maTruongPhong = truongPhongSelect.value;
        const duLieu = { MaPB: maPB, TenPB: tenPB, MoTa: moTa, MaTruongPhong: maTruongPhong };

        const cacLoi = kiemTraPhongBan(duLieu, kho.dsPhongBan || [], kho.dsNhanVien || []);
        if (cacLoi.length) {
          if (loiDialogPB) loiDialogPB.textContent = cacLoi[0].thongBao;
          return;
        }

        let dsMoi;
        if (dangSuaMaPB) {
          dsMoi = suaPhongBan(kho.dsPhongBan, dangSuaMaPB, duLieu);
        } else {
          dsMoi = themPhongBan(kho.dsPhongBan, duLieu);
        }

        if (!await luuThayDoi({ ...kho, dsPhongBan: dsMoi })) return;
        dongDialog(dialogPB);
        capNhatGiaoDien();
      });
    }

    // Xóa phòng ban
    if (container) {
      container.addEventListener("click", (suKien) => {
        const nut = suKien.target.closest("button");
        if (!nut) return;
        const maPB = nut.dataset.maPb;
        if (nut.classList.contains("nut-sua-pb")) moSuaPB(maPB);
        if (nut.classList.contains("nut-xoa-pb")) {
          const kiemTra = xoaPhongBan(kho.dsPhongBan, kho.dsNhanVien, maPB);
          if (kiemTra.loi) {
            if (thongBao) thongBao.textContent = `Không thể xóa: ${kiemTra.loi}. Vui lòng chuyển nhân viên sang phòng khác trước.`;
            return;
          }
          dangXoaMaPB = maPB;
          const pb = kho.dsPhongBan.find((x) => x.MaPB === maPB);
          if (moTaXoa) moTaXoa.textContent = `Bạn có chắc chắn muốn xóa phòng ban "${pb ? pb.TenPB : maPB}"?`;
          if (loiDialogXoa) loiDialogXoa.textContent = "";
          moDialog(dialogXoa);
        }
      });
    }

    if (formXoa) {
      formXoa.addEventListener("submit", async (suKien) => {
        suKien.preventDefault();
        const result = xoaPhongBan(kho.dsPhongBan, kho.dsNhanVien, dangXoaMaPB);
        if (result.loi) {
          if (loiDialogXoa) loiDialogXoa.textContent = result.loi;
          return;
        }
        if (!await luuThayDoi({ ...kho, dsPhongBan: result.ketQua })) return;
        dongDialog(dialogXoa);
        capNhatGiaoDien();
      });
    }

    capNhatGiaoDien();
  }
})();
