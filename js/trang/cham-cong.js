(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoTrangChamCong);

  function khoiTaoTrangChamCong() {
    const inputThang = document.querySelector("#cham-cong-thang");
    const selectPhongBan = document.querySelector("#cham-cong-phong-ban");
    const dauBang = document.querySelector("#dau-bang-cham-cong");
    const thanBang = document.querySelector("#than-bang-cham-cong");
    const nutChamDuCong = document.querySelector("#nut-cham-du-cong");
    const nutLuu = document.querySelector("#nut-luu-cham-cong");
    const nutXuatExcel = document.querySelector("#nut-xuat-excel-cc");

    if (!inputThang || !thanBang) return;

    const kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: NHAN_VIEN, dsPhongBan: PHONG_BAN, dsChamCongNgay: {} };
    const dsPB = kho.dsPhongBan || PHONG_BAN;
    const dsNV = kho.dsNhanVien || NHAN_VIEN;
    const dsHopDong = kho.dsHopDong || HOP_DONG_LAO_DONG;
    const chamCongNgay = kho.dsChamCongNgay || {};

    if (selectPhongBan) {
      selectPhongBan.innerHTML = '<option value="">Tất cả phòng ban</option>';
      dsPB.forEach((pb) => {
        selectPhongBan.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(pb.MaPB)}">${escapeHTML(pb.TenPB)}</option>`);
      });
    }

    function layThang() {
      return inputThang.value || inputThang.defaultValue;
    }

    function layNhanVienLoc(thang) {
      const maPB = selectPhongBan?.value;
      return dsNV.filter((nv) => !maPB || nv.MaPB === maPB)
        .map((nv) => ({ nv, ky: layKyLamViecTrongThang(nv, thang, dsHopDong) }))
        .filter(({ ky }) => ky);
    }

    function luuCongNhanVien(thang, maNV, bangNgay) {
      if (!chamCongNgay[thang]) chamCongNgay[thang] = {};
      chamCongNgay[thang][maNV] = bangNgay;
    }

    function layNghiTrongThang(thang) {
      return layNghiDaDuyet(thang, kho.dsNghiPhep, chamCongNgay);
    }

    function layCongMau(thang, maNV) {
      const banGhi = CHAM_CONG.find((cc) => cc.Thang === thang && cc.MaNV === maNV);
      return banGhi?.NgayCong;
    }

    function layDongChamCong(thang) {
      const nghiDaDuyet = layNghiTrongThang(thang);
      return layNhanVienLoc(thang).map(({ nv, ky }) => {
        const ngayNghi = nghiDaDuyet.get(nv.MaNV) || {};
        const congDaLuu = { ...chamCongNgay[thang]?.[nv.MaNV], ...ngayNghi };
        const bangNgay = lapBangCongTheoNgay(thang, congDaLuu, ky.cacNgayHopLe, layCongMau(thang, nv.MaNV));
        const kyHieu = Object.values(bangNgay);
        return {
          nv,
          cacNgayHopLe: ky.cacNgayHopLe,
          ngayNghi,
          kyHieu,
          cong: tinhTongNgayCongTuBang(bangNgay),
          phep: kyHieu.filter((gt) => gt === "P").length,
          ot: kyHieu.filter((gt) => gt === "OT").length
        };
      });
    }

    function capNhatThongKe(cacDong) {
      document.querySelector("#thong-ke-cc-tong-nv").textContent = String(cacDong.length);
      for (const [id, truong] of [
        ["thong-ke-cc-tong-cong", "cong"],
        ["thong-ke-cc-phep", "phep"],
        ["thong-ke-cc-ot", "ot"]
      ]) {
        const tong = cacDong.reduce((tong, dong) => tong + dong[truong], 0);
        document.getElementById(id).textContent = String(tong);
      }
    }

    function render() {
      const thang = layThang();
      const soNgay = soNgayTrongThang(thang);
      const [nam, thangSo] = thang.split("-").map(Number);
      const cacDong = layDongChamCong(thang);

      const tieuDeBang = document.querySelector("#matrix-heading");
      if (tieuDeBang) tieuDeBang.textContent = `Bảng chấm công tháng ${thangSo}/${nam}`;

      let cotNgayHtml = "";
      for (let d = 1; d <= soNgay; d++) {
        const thu = layThuTrongTuan(nam, thangSo, d);
        const laCuoiTuan = thu === "T7" || thu === "CN";
        cotNgayHtml += `<th scope="col" class="th-ngay ${laCuoiTuan ? "ngay-nghi-cuoi-tuan" : ""}">
          <span>${d}</span>
          <span class="ten-thu">${thu}</span>
        </th>`;
      }

      dauBang.innerHTML = `<tr>
        <th scope="col" class="cot-co-dinh">Mã NV</th>
        <th scope="col" class="cot-co-dinh-2">Họ và tên</th>
        ${cotNgayHtml}
        <th scope="col" title="Tổng ngày công thực tế">Công</th>
        <th scope="col" title="Nghỉ phép">P</th>
        <th scope="col" title="Tăng ca">OT</th>
      </tr>`;

      if (!cacDong.length) {
        thanBang.innerHTML = `<tr><td colspan="${soNgay + 5}" class="khong-co-du-lieu">Không có nhân viên trong phòng ban này</td></tr>`;
        capNhatThongKe(cacDong);
        return;
      }

      thanBang.innerHTML = cacDong.map(({ nv, cacNgayHopLe, ngayNghi, kyHieu, cong, phep, ot }) => {
        const maNV = escapeHTML(nv.MaNV);
        const hoTen = escapeHTML(nv.HoTen);
        const oNgayHtml = kyHieu.map((giaTri, index) => {
          const ngay = index + 1;
          const thu = layThuTrongTuan(nam, thangSo, ngay);
          const lopCuoiTuan = thu === "T7" || thu === "CN" ? " ngay-nghi-cuoi-tuan" : "";
          if (cacNgayHopLe && !cacNgayHopLe.has(ngay)) {
            return `<td class="o-cham-cong cong-V${lopCuoiTuan}" title="Ngoài thời gian hợp đồng">—</td>`;
          }
          if (ngayNghi[ngay]) {
            return `<td class="o-cham-cong cong-${giaTri}${lopCuoiTuan}" title="Nghỉ đã duyệt">${giaTri}</td>`;
          }
          return `
            <td class="o-cham-cong cong-${giaTri}${lopCuoiTuan}">
              <button type="button" class="nut-cham-cong" data-ma-nv="${maNV}" data-ngay="${ngay}"
                aria-label="${hoTen}, ngày ${ngay}, ký hiệu ${giaTri}">${giaTri}</button>
            </td>`;
        }).join("");

        return `<tr>
          <td class="cot-co-dinh"><strong>${maNV}</strong></td>
          <td class="cot-co-dinh-2"><span>${hoTen}</span></td>
          ${oNgayHtml}
          <td class="o-tong-cong"><strong>${cong}</strong></td>
          <td class="o-tong-cong">${phep}</td>
          <td class="o-tong-cong chu-canh-bao">${ot}</td>
        </tr>`;
      }).join("");

      capNhatThongKe(cacDong);
    }

    thanBang.addEventListener("click", (e) => {
      const nut = e.target.closest(".nut-cham-cong");
      if (!nut) return;
      const { maNv: maNV, ngay } = nut.dataset;
      const thang = layThang();
      const nv = dsNV.find((nhanVien) => nhanVien.MaNV === maNV);
      const ky = layKyLamViecTrongThang(nv, thang, dsHopDong);
      if (!ky || (ky.cacNgayHopLe && !ky.cacNgayHopLe.has(Number(ngay)))) return;
      const ngayNghi = layNghiTrongThang(thang).get(maNV);
      if (ngayNghi?.[ngay]) return;
      const congDaLuu = { ...chamCongNgay[thang]?.[maNV], ...ngayNghi };
      const bangNgay = lapBangCongTheoNgay(thang, congDaLuu, ky.cacNgayHopLe, layCongMau(thang, nv.MaNV));
      const vong = { X: "P", P: "KP", KP: "OT", OT: "V", V: "X" };
      bangNgay[ngay] = vong[bangNgay[ngay]] || "X";
      luuCongNhanVien(thang, maNV, bangNgay);

      const giuFocus = document.activeElement === nut;
      render();
      if (giuFocus) {
        const nutMoi = thanBang.querySelector(`.nut-cham-cong[data-ma-nv="${CSS.escape(maNV)}"][data-ngay="${ngay}"]`);
        nutMoi?.focus({ preventScroll: true });
      }
    });

    if (nutChamDuCong) {
      nutChamDuCong.addEventListener("click", () => {
        const thang = layThang();
        const nghiDaDuyet = layNghiTrongThang(thang);
        layNhanVienLoc(thang).forEach(({ nv, ky }) => {
          const bangNgay = lapBangCongTheoNgay(thang, nghiDaDuyet.get(nv.MaNV), ky.cacNgayHopLe);
          luuCongNhanVien(thang, nv.MaNV, bangNgay);
        });
        render();
        hienThiToast("Đã chấm đủ công (T2-T6) cho danh sách đang hiển thị!", "thanh-cong");
      });
    }

    if (nutLuu) {
      nutLuu.addEventListener("click", async () => {
        if (!await luuThayDoi({ ...kho, dsChamCongNgay: chamCongNgay })) return;
        hienThiToast("Đã lưu bảng chấm công vào hệ thống thành công!", "thanh-cong");
      });
    }

    if (nutXuatExcel) {
      nutXuatExcel.addEventListener("click", () => {
        const thang = layThang();
        const soNgay = soNgayTrongThang(thang);
        const tieuDe = ["Mã NV", "Họ và tên", "Phòng ban"];
        for (let d = 1; d <= soNgay; d++) tieuDe.push(`Ngày ${d}`);
        tieuDe.push("Tổng công", "Nghỉ phép", "Tăng ca");

        const cacDong = layDongChamCong(thang).map(({ nv, kyHieu, cong, phep, ot }) => [
          nv.MaNV, nv.HoTen, layTenPhongBan(dsPB, nv.MaPB), ...kyHieu, cong, phep, ot
        ]);

        const csv = taoChuoiCSV(tieuDe, cacDong);
        taiTapTinVeMay(csv, `cham-cong-${thang}.csv`);
        hienThiToast(`Đã xuất bảng chấm công tháng ${thang} ra Excel/CSV!`, "thanh-cong");
      });
    }

    inputThang.addEventListener("change", render);
    if (selectPhongBan) selectPhongBan.addEventListener("change", render);
    render();
  }
})();
