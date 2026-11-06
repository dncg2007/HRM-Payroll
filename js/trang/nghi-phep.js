(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoTrangNghiPhep);

  function khoiTaoTrangNghiPhep() {
    const kho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: NHAN_VIEN, dsPhongBan: PHONG_BAN, dsNghiPhep: [], dsChamCongNgay: {} };
    const dsNV = kho.dsNhanVien || [];
    const dsPB = kho.dsPhongBan || [];
    const dsHopDong = kho.dsHopDong || [];
    let dsNP = Array.isArray(kho.dsNghiPhep) ? kho.dsNghiPhep : [];

    const thanBang = document.querySelector("#than-bang-nghi-phep");
    const thongKeTong = document.querySelector("#thong-ke-np-tong");
    const thongKeCho = document.querySelector("#thong-ke-np-cho");
    const thongKeDuyet = document.querySelector("#thong-ke-np-duyet");
    const thongKeTuChoi = document.querySelector("#thong-ke-np-tu-choi");
    const dongKetQua = document.querySelector("#np-dong-ket-qua");

    const oTimKiem = document.querySelector("#loc-np-tu-khoa");
    const locTrangThai = document.querySelector("#loc-np-trang-thai");
    const locLoai = document.querySelector("#loc-np-loai");
    const nutTaoDon = document.querySelector("#nut-tao-don-np");
    const nutXuatExcel = document.querySelector("#nut-xuat-excel-np");

    const dialogTao = document.querySelector("#dialog-tao-don-np");
    const formTao = document.querySelector("#form-tao-don-np");
    const nutHuyTao = document.querySelector("#nut-huy-don-np");
    const inputMaDon = document.querySelector("#np-ma-don");
    const selectNV = document.querySelector("#np-nhan-vien");
    const selectLoaiNghi = document.querySelector("#np-loai-nghi");
    const inputTuNgay = document.querySelector("#np-tu-ngay");
    const inputDenNgay = document.querySelector("#np-den-ngay");
    const pSoNgayTinh = document.querySelector("#np-so-ngay-tinh");
    const textareaLyDo = document.querySelector("#np-ly-do");

    // Đổ danh sách nhân viên vào dropdown
    if (selectNV) {
      selectNV.innerHTML = '<option value="">Chọn nhân viên</option>' +
        dsNV.filter((nv) => nv.TrangThai === "DangLam")
            .map((nv) => `<option value="${escapeHTML(nv.MaNV)}">${escapeHTML(nv.HoTen)} (${escapeHTML(nv.MaNV)}) - ${escapeHTML(layTenPhongBan(dsPB, nv.MaPB))}</option>`)
            .join("");
    }

    function capNhatSoNgay() {
      if (!inputTuNgay || !inputDenNgay || !pSoNgayTinh) return;
      const tuNgay = inputTuNgay.value;
      const denNgay = inputDenNgay.value;
      if (!tuNgay || !denNgay) return;
      const soNgay = tinhSoNgayNghi(tuNgay, denNgay);
      if (soNgay <= 0) {
        pSoNgayTinh.textContent = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!";
        pSoNgayTinh.style.color = "var(--mau-loi)";
      } else {
        pSoNgayTinh.textContent = `Số ngày tính công: ${soNgay} ngày (trừ Thứ 7, Chủ nhật)`;
        pSoNgayTinh.style.color = "var(--mau-chinh)";
      }
    }

    if (inputTuNgay) inputTuNgay.addEventListener("change", capNhatSoNgay);
    if (inputDenNgay) inputDenNgay.addEventListener("change", capNhatSoNgay);

    function nhanLoaiNghi(loai) {
      switch (loai) {
        case "PhepNam": return "Phép năm (hưởng lương)";
        case "NghiOm": return "Nghỉ ốm / Khám bệnh";
        case "ViecRieng": return "Việc riêng (không lương)";
        default: return loai;
      }
    }

    function nhanTrangThaiDon(trangThai) {
      switch (trangThai) {
        case "ChoDuyet": return '<span class="badge-cho-duyet">Chờ duyệt</span>';
        case "DaDuyet": return '<span class="badge-da-duyet">Đã duyệt</span>';
        case "TuChoi": return '<span class="badge-tu-choi">Từ chối</span>';
        default: return escapeHTML(trangThai);
      }
    }

    function render() {
      const tuKhoa = (oTimKiem ? oTimKiem.value.trim().toLowerCase() : "");
      const filterTT = (locTrangThai ? locTrangThai.value : "");
      const filterLoai = (locLoai ? locLoai.value : "");

      const dsLoc = dsNP.filter((item) => {
        const nv = dsNV.find((n) => n.MaNV === item.MaNV);
        const hoTen = nv ? nv.HoTen.toLowerCase() : "";
        const maNV = item.MaNV.toLowerCase();
        const maDon = item.MaDon.toLowerCase();
        const khopTuKhoa = !tuKhoa || hoTen.includes(tuKhoa) || maNV.includes(tuKhoa) || maDon.includes(tuKhoa);
        const khopTT = !filterTT || item.TrangThai === filterTT;
        const khopLoai = !filterLoai || item.LoaiNghi === filterLoai;
        return khopTuKhoa && khopTT && khopLoai;
      });

      // Cập nhật thống kê
      if (thongKeTong) thongKeTong.textContent = String(dsNP.length);
      if (thongKeCho) thongKeCho.textContent = String(dsNP.filter((x) => x.TrangThai === "ChoDuyet").length);
      if (thongKeDuyet) thongKeDuyet.textContent = String(dsNP.filter((x) => x.TrangThai === "DaDuyet").length);
      if (thongKeTuChoi) thongKeTuChoi.textContent = String(dsNP.filter((x) => x.TrangThai === "TuChoi").length);
      if (dongKetQua) dongKetQua.textContent = `Hiển thị ${dsLoc.length} / ${dsNP.length} đơn nghỉ phép`;

      if (!thanBang) return;
      if (dsLoc.length === 0) {
        thanBang.innerHTML = '<tr><td colspan="10" class="khong-co-du-lieu o-ngay-nghi-trong">Không tìm thấy đơn nghỉ phép nào.</td></tr>';
        return;
      }

      thanBang.innerHTML = dsLoc.map((item) => {
        const nv = dsNV.find((n) => n.MaNV === item.MaNV);
        const tenNV = nv ? nv.HoTen : item.MaNV;
        const tenPB = nv ? layTenPhongBan(dsPB, nv.MaPB) : "—";
        const thoiGian = item.TuNgay === item.DenNgay ? dinhDangNgay(item.TuNgay) : `${dinhDangNgay(item.TuNgay)} → ${dinhDangNgay(item.DenNgay)}`;

        let nutThaoTac = "";
        if (item.TrangThai === "ChoDuyet") {
          nutThaoTac = `
            <button class="nut nut-nho nut-duyet-np" data-ma-don="${escapeHTML(item.MaDon)}" type="button">Duyệt</button>
            <button class="nut nut-nho nut-vien nut-tu-choi-np" data-ma-don="${escapeHTML(item.MaDon)}" type="button">Từ chối</button>
          `;
        }
        if (item.TrangThai === "DaDuyet") {
          nutThaoTac = '<span class="chu-3">Đơn đã duyệt được giữ lại</span>';
        } else {
          nutThaoTac += `<button class="nut nut-nho nut-vien nut-xoa-np" data-ma-don="${escapeHTML(item.MaDon)}" type="button" aria-label="Xóa đơn ${escapeHTML(item.MaDon)}">&times;</button>`;
        }

        return `
          <tr data-ma-don="${escapeHTML(item.MaDon)}">
            <td data-cot="Mã đơn"><strong>${escapeHTML(item.MaDon)}</strong></td>
            <td data-cot="Mã NV">${escapeHTML(item.MaNV)}</td>
            <td data-cot="Họ và tên"><strong>${escapeHTML(tenNV)}</strong></td>
            <td data-cot="Phòng ban">${escapeHTML(tenPB)}</td>
            <td data-cot="Loại nghỉ">${nhanLoaiNghi(item.LoaiNghi)}</td>
            <td data-cot="Thời gian nghỉ">${escapeHTML(thoiGian)}</td>
            <td data-cot="Số ngày" class="o-ngay-nghi"><strong>${tinhSoNgayNghi(item.TuNgay, item.DenNgay)}</strong></td>
            <td data-cot="Lý do"><span title="${escapeHTML(item.LyDo)}">${escapeHTML(item.LyDo)}</span></td>
            <td data-cot="Trạng thái">${nhanTrangThaiDon(item.TrangThai)}</td>
            <td data-cot="Thao tác">
              <div class="hang-nut-cong-cu thao-tac-don-nghi">
                ${nutThaoTac}
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    // Phê duyệt / Từ chối / Xóa qua Event Delegation
    if (thanBang) {
      thanBang.addEventListener("click", async (e) => {
        const nutDuyet = e.target.closest(".nut-duyet-np");
        const nutTuChoi = e.target.closest(".nut-tu-choi-np");
        const nutXoa = e.target.closest(".nut-xoa-np");

        if (nutDuyet) {
          const maDon = nutDuyet.dataset.maDon;
          const don = dsNP.find((x) => x.MaDon === maDon);
          if (don?.TrangThai !== "ChoDuyet") return;
          const cacNgayNghi = layCacNgayTrongKhoang(don.TuNgay, don.DenNgay);
          const ngayDaDuyet = new Set(dsNP.filter((x) => x.MaNV === don.MaNV && x.TrangThai === "DaDuyet")
            .flatMap((x) => layCacNgayTrongKhoang(x.TuNgay, x.DenNgay)));
          const ngayTrung = cacNgayNghi.find((ngay) => ngayDaDuyet.has(ngay));
          if (!cacNgayNghi.length || ngayTrung) {
            hienThiToast(ngayTrung ? `Ngày ${dinhDangNgay(ngayTrung)} đã có đơn nghỉ được duyệt.` : "Đơn không có ngày làm việc hợp lệ.", "loi");
            return;
          }
          const ngayNgoaiHopDong = timNgayNghiNgoaiHopDong(dsHopDong, don.MaNV, cacNgayNghi);
          if (ngayNgoaiHopDong) {
            hienThiToast(`Nhân viên không có hợp đồng hiệu lực vào ngày ${dinhDangNgay(ngayNgoaiHopDong)}.`, "loi");
            return;
          }

          const dsMoi = dsNP.map((x) => x === don ? { ...x, TrangThai: "DaDuyet" } : x);
          const dsChamCongNgay = structuredClone(kho.dsChamCongNgay || {});
          const kyHieu = don.LoaiNghi === "ViecRieng" ? "KP" : "P";
          for (const ngay of cacNgayNghi) {
            const thang = ngay.slice(0, 7);
            dsChamCongNgay[thang] ||= {};
            dsChamCongNgay[thang][don.MaNV] ||= {};
            dsChamCongNgay[thang][don.MaNV][Number(ngay.slice(-2))] = kyHieu;
          }
          if (!await luuThayDoi({ ...kho, dsNghiPhep: dsMoi, dsChamCongNgay })) return;
          dsNP = dsMoi;
          kho.dsChamCongNgay = dsChamCongNgay;
          render();
          hienThiToast(`Đã duyệt đơn ${maDon} và tự động cập nhật bảng chấm công!`, "thanh-cong");
        }

        if (nutTuChoi) {
          const maDon = nutTuChoi.dataset.maDon;
          const don = dsNP.find((x) => x.MaDon === maDon);
          if (don?.TrangThai !== "ChoDuyet") return;
          const dsMoi = dsNP.map((x) => x === don ? { ...x, TrangThai: "TuChoi" } : x);
          if (!await luuThayDoi({ ...kho, dsNghiPhep: dsMoi })) return;
          dsNP = dsMoi;
          render();
          hienThiToast(`Đã từ chối đơn ${maDon}.`, "canh-bao");
        }

        if (nutXoa) {
          const maDon = nutXoa.dataset.maDon;
          const don = dsNP.find((x) => x.MaDon === maDon);
          if (!don || don.TrangThai === "DaDuyet") return;
          if (confirm(`Bạn có chắc chắn muốn xóa đơn nghỉ phép ${maDon}?`)) {
            const dsMoi = dsNP.filter((x) => x.MaDon !== maDon);
            if (!await luuThayDoi({ ...kho, dsNghiPhep: dsMoi })) return;
            dsNP = dsMoi;
            render();
            hienThiToast(`Đã xóa đơn nghỉ phép ${maDon}.`, "thanh-cong");
          }
        }
      });
    }

    // Mở modal tạo đơn
    if (nutTaoDon && dialogTao) {
      nutTaoDon.addEventListener("click", () => {
        if (formTao) formTao.reset();
        if (inputMaDon) inputMaDon.value = sinhMaNghiPhep(dsNP);
        if (inputTuNgay) inputTuNgay.value = "2026-10-30";
        if (inputDenNgay) inputDenNgay.value = "2026-10-30";
        capNhatSoNgay();
        moDialog(dialogTao);
      });
    }

    if (nutHuyTao && dialogTao) {
      nutHuyTao.addEventListener("click", () => dongDialog(dialogTao));
    }

    if (formTao) {
      formTao.addEventListener("submit", async (e) => {
        e.preventDefault();
        const maDon = inputMaDon ? inputMaDon.value : sinhMaNghiPhep(dsNP);
        const maNV = selectNV ? selectNV.value : "";
        const loaiNghi = selectLoaiNghi ? selectLoaiNghi.value : "PhepNam";
        const tuNgay = inputTuNgay ? inputTuNgay.value : "";
        const denNgay = inputDenNgay ? inputDenNgay.value : "";
        const lyDo = textareaLyDo ? textareaLyDo.value.trim() : "";

        if (!maNV || !tuNgay || !denNgay || !lyDo) {
          hienThiToast("Vui lòng điền đầy đủ thông tin đơn nghỉ phép.", "canh-bao");
          return;
        }

        const cacNgayNghi = layCacNgayTrongKhoang(tuNgay, denNgay);
        if (!cacNgayNghi.length) {
          hienThiToast("Khoảng thời gian nghỉ không hợp lệ (không chứa ngày làm việc).", "loi");
          return;
        }
        const ngayNgoaiHopDong = timNgayNghiNgoaiHopDong(dsHopDong, maNV, cacNgayNghi);
        if (ngayNgoaiHopDong) {
          hienThiToast(`Nhân viên không có hợp đồng hiệu lực vào ngày ${dinhDangNgay(ngayNgoaiHopDong)}.`, "loi");
          return;
        }

        const donMoi = {
          MaDon: maDon,
          MaNV: maNV,
          LoaiNghi: loaiNghi,
          TuNgay: tuNgay,
          DenNgay: denNgay,
          SoNgay: cacNgayNghi.length,
          LyDo: lyDo,
          TrangThai: "ChoDuyet",
          NgayTao: "2026-10-30"
        };

        const dsMoi = [donMoi, ...dsNP];
        if (!await luuThayDoi({ ...kho, dsNghiPhep: dsMoi })) return;
        dsNP = dsMoi;

        dongDialog(dialogTao);
        render();
        hienThiToast(`Đã gửi đơn nghỉ phép ${maDon} thành công. Đang chờ phê duyệt!`, "thanh-cong");
      });
    }

    // Xuất Excel / CSV
    if (nutXuatExcel) {
      nutXuatExcel.addEventListener("click", () => {
        const tieuDe = ["Mã Đơn", "Mã NV", "Họ và tên", "Phòng ban", "Loại nghỉ", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Trạng thái"];
        const cacDong = dsNP.map((item) => {
          const nv = dsNV.find((n) => n.MaNV === item.MaNV);
          return [
            item.MaDon,
            item.MaNV,
            nv ? nv.HoTen : item.MaNV,
            nv ? layTenPhongBan(dsPB, nv.MaPB) : "",
            item.LoaiNghi,
            item.TuNgay,
            item.DenNgay,
            tinhSoNgayNghi(item.TuNgay, item.DenNgay),
            item.LyDo,
            item.TrangThai === "DaDuyet" ? "Đã duyệt" : (item.TrangThai === "TuChoi" ? "Từ chối" : "Chờ duyệt")
          ];
        });
        const csv = taoChuoiCSV(tieuDe, cacDong);
        taiTapTinVeMay(csv, `danh-sach-don-nghi-phep-${new Date().toISOString().slice(0, 10)}.csv`);
        hienThiToast("Đã xuất danh sách đơn nghỉ phép ra Excel/CSV!", "thanh-cong");
      });
    }

    if (oTimKiem) oTimKiem.addEventListener("input", render);
    if (locTrangThai) locTrangThai.addEventListener("change", render);
    if (locLoai) locLoai.addEventListener("change", render);

    render();
  }
})();
