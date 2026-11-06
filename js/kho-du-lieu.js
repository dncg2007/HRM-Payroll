/* Storage layer Sprint 6A: lưu trạng thái quản lý trong localStorage, không sửa hằng Data Contract. */
(function () {
  const KHOA = "hrm-du-lieu";
  const PHIEN_BAN = "1.0";
  let duLieuHienTai = null;
  let banGhiDaDoc = null;
  let dangKhoiPhuc = false;

  function saoChep(giaTri) {
    return JSON.parse(JSON.stringify(giaTri));
  }

  function duLieuMau() {
    return {
      phienBan: PHIEN_BAN,
      dsNhanVien: saoChep(NHAN_VIEN),
      dsPhongBan: saoChep(PHONG_BAN),
      dsHopDong: saoChep(HOP_DONG_LAO_DONG),
      dsChucVu: [...new Set(NHAN_VIEN.map((nv) => nv.ChucVu).filter(Boolean))].map((TenChucVu, index) => ({ MaChucVu: `CV${String(index + 1).padStart(2, "0")}`, TenChucVu, MoTa: "" })),
      dsKhenThuong: [
        { MaQD: "QD001", MaNV: "NV0003", Loai: "KhenThuong", SoTien: 1000000, LyDo: "Hoàn thành xuất sắc nhiệm vụ tuyển dụng quý 3", NgayQD: "2026-10-15" },
        { MaQD: "QD002", MaNV: "NV0007", Loai: "KhenThuong", SoTien: 1500000, LyDo: "Sáng kiến tối ưu hóa hệ thống phần mềm", NgayQD: "2026-10-18" },
        { MaQD: "QD003", MaNV: "NV0005", Loai: "KyLuat", SoTien: 300000, LyDo: "Đi muộn quá số lần quy định trong tháng", NgayQD: "2026-10-20" }
      ],
      dsChamCongNgay: {},
      dsNghiPhep: [
        { MaDon: "NP001", MaNV: "NV0002", LoaiNghi: "PhepNam", TuNgay: "2026-10-24", DenNgay: "2026-10-25", LyDo: "Giải quyết việc cá nhân gia đình", TrangThai: "DaDuyet" },
        { MaDon: "NP002", MaNV: "NV0006", LoaiNghi: "NghiOm", TuNgay: "2026-10-28", DenNgay: "2026-10-29", LyDo: "Khám bệnh tại bệnh viện", TrangThai: "ChoDuyet" },
        { MaDon: "NP003", MaNV: "NV0010", LoaiNghi: "ViecRieng", TuNgay: "2026-10-31", DenNgay: "2026-10-31", LyDo: "Nghỉ việc riêng không hưởng lương", TrangThai: "DaDuyet" }
      ]
    };
  }

  function laBanGhi(giaTri) {
    return giaTri !== null && typeof giaTri === "object" && !Array.isArray(giaTri);
  }

  const KHOA_DANH_SACH = {
    dsNhanVien: "MaNV", dsPhongBan: "MaPB", dsHopDong: "MaHD", dsChucVu: "MaChucVu",
    dsKhenThuong: "MaQD", dsNghiPhep: "MaDon"
  };
  const TRUONG_BAT_BUOC = {
    dsNhanVien: ["HoTen", "MaPB"], dsPhongBan: ["TenPB"], dsHopDong: ["MaNV", "TuNgay"],
    dsChucVu: ["TenChucVu"], dsKhenThuong: ["MaNV", "Loai", "NgayQD"],
    dsNghiPhep: ["MaNV", "LoaiNghi", "TuNgay", "DenNgay", "TrangThai"]
  };

  function kiemTraNghiepVuSaoLuu(kho) {
    const maNhanVien = new Set(kho.dsNhanVien.map((nv) => nv.MaNV));
    const maPhongBan = new Set(kho.dsPhongBan.map((pb) => pb.MaPB));
    for (const nv of kho.dsNhanVien) {
      if (nv.DienThoai !== undefined && (typeof nv.DienThoai !== "string" || (nv.DienThoai && !/^0\d{9}$/.test(nv.DienThoai)))) {
        throw new Error(`Điện thoại của ${nv.MaNV} phải là chuỗi 10 chữ số bắt đầu bằng 0 hoặc để trống.`);
      }
      if (!maPhongBan.has(nv.MaPB)) throw new Error(`Phòng ban của ${nv.MaNV} không tồn tại.`);
    }
    for (const hd of kho.dsHopDong) {
      if (!maNhanVien.has(hd.MaNV)) throw new Error(`Nhân viên của hợp đồng ${hd.MaHD} không tồn tại.`);
      const loi = kiemTraKhoangHopDong(hd.TuNgay, hd.DenNgay);
      if (loi) throw new Error(`Hợp đồng ${hd.MaHD} không hợp lệ. ${loi.thongBao}`);
    }
    for (const don of kho.dsNghiPhep) {
      if (!maNhanVien.has(don.MaNV) || kiemTraKhoangHopDong(don.TuNgay, don.DenNgay)) {
        throw new Error(`Đơn nghỉ ${don.MaDon} có nhân viên hoặc khoảng ngày không hợp lệ.`);
      }
    }
    for (const qd of kho.dsKhenThuong) {
      if (!maNhanVien.has(qd.MaNV) || !laNgayHopLe(qd.NgayQD) || !Number.isSafeInteger(qd.SoTien) || qd.SoTien < 0) {
        throw new Error(`Quyết định ${qd.MaQD} có nhân viên, ngày hoặc số tiền không hợp lệ.`);
      }
    }
  }

  function chuanBiKhoiPhuc(duLieu) {
    if (!laBanGhi(duLieu) || (duLieu.phienBan !== undefined && duLieu.phienBan !== PHIEN_BAN)) {
      throw new Error("Tệp sao lưu không đúng định dạng hoặc phiên bản.");
    }

    const kho = { ...duLieu, phienBan: PHIEN_BAN };
    for (const [ten, khoa] of Object.entries(KHOA_DANH_SACH)) {
      if ((ten === "dsKhenThuong" || ten === "dsNghiPhep") && kho[ten] === undefined) kho[ten] = [];
      const danhSach = kho[ten];
      const cacTruong = [khoa, ...TRUONG_BAT_BUOC[ten]];
      if (!Array.isArray(danhSach) || !danhSach.every((dong) => laBanGhi(dong) &&
          cacTruong.every((truong) => typeof dong[truong] === "string" && dong[truong].trim())
          && !["__proto__", "constructor", "prototype"].includes(dong[khoa]))
          || new Set(danhSach.map((dong) => dong[khoa])).size !== danhSach.length) {
        throw new Error(`Danh sách ${ten} bị thiếu, sai cấu trúc hoặc trùng mã.`);
      }
    }

    kiemTraNghiepVuSaoLuu(kho);
    if (kho.dsChamCongNgay === undefined) kho.dsChamCongNgay = {};
    const maNhanVien = new Set(kho.dsNhanVien.map((nv) => nv.MaNV));
    if (!laBanGhi(kho.dsChamCongNgay) || !Object.entries(kho.dsChamCongNgay).every(([thang, nhanVien]) =>
      /^\d{4}-(0[1-9]|1[0-2])$/.test(thang) && laBanGhi(nhanVien) && Object.entries(nhanVien).every(([maNV, bangNgay]) =>
        maNhanVien.has(maNV) && laBanGhi(bangNgay) && Object.entries(bangNgay).every(([ngay, kyHieu]) =>
          /^[1-9]\d?$/.test(ngay) && Number(ngay) <= soNgayTrongThang(thang) && ["X", "P", "KP", "OT", "V", "1/2"].includes(kyHieu)
        )
      )
    )) {
      throw new Error("Dữ liệu chấm công theo ngày không hợp lệ.");
    }
    kho.dsNhanVien = capNhatTrangThai(kho.dsNhanVien, kho.dsHopDong, CAU_HINH.NGAY_THAM_CHIEU_DEMO);
    return kho;
  }

  function docBanGhi(banGhi) {
    if (banGhi === null) return duLieuMau();
    const daLuu = JSON.parse(banGhi);
    if (daLuu?.phienBan !== PHIEN_BAN || !Array.isArray(daLuu.dsNhanVien) || !Array.isArray(daLuu.dsPhongBan)) {
      throw new Error("Bản lưu hiện tại không đúng cấu trúc.");
    }
    // Bản lưu cũ có thể thiếu các danh sách được thêm sau.
    for (const ten of Object.keys(KHOA_DANH_SACH)) {
      if (!Array.isArray(daLuu[ten])) daLuu[ten] = [];
    }
    if (!laBanGhi(daLuu.dsChamCongNgay)) daLuu.dsChamCongNgay = {};
    return daLuu;
  }

  function layDuLieu() {
    if (duLieuHienTai) return saoChep(duLieuHienTai);
    try {
      banGhiDaDoc = localStorage.getItem(KHOA);
      duLieuHienTai = docBanGhi(banGhiDaDoc);
      duLieuHienTai.dsNhanVien = capNhatTrangThai(duLieuHienTai.dsNhanVien, duLieuHienTai.dsHopDong, CAU_HINH.NGAY_THAM_CHIEU_DEMO);
    } catch (loi) {
      console.warn("Kho dữ liệu: không đọc được bản lưu.");
    }
    duLieuHienTai ||= duLieuMau();
    return saoChep(duLieuHienTai);
  }

  function layDuLieuSaoLuu() {
    // Đọc riêng bản đã lưu, giữ nguyên mốc kiểm tra của dữ liệu đang mở trên trang.
    return docBanGhi(localStorage.getItem(KHOA));
  }

  function kiemTraCoTheGhi() {
    if (dangKhoiPhuc) throw new Error("Đang khôi phục dữ liệu. Vui lòng đợi trang tải lại.");
  }

  async function ghiDuLieu(duLieu, khoiPhuc = false) {
    if (!khoiPhuc) kiemTraCoTheGhi();
    if (!laBanGhi(duLieu) || !Array.isArray(duLieu.dsNhanVien) || !Array.isArray(duLieu.dsPhongBan)) {
      throw new Error("Dữ liệu cần lưu không đúng cấu trúc.");
    }
    if (!duLieuHienTai) layDuLieu();
    const banGhiGoc = banGhiDaDoc;
    const banGhiMoi = JSON.stringify({ ...duLieu, phienBan: PHIEN_BAN });

    function ghi() {
      if (!khoiPhuc) kiemTraCoTheGhi();
      let banGhiHienTai;
      try {
        banGhiHienTai = localStorage.getItem(KHOA);
      } catch (loi) {
        throw new Error("Không thể truy cập bộ nhớ trình duyệt để lưu dữ liệu.");
      }
      if (banGhiHienTai !== banGhiGoc) {
        throw new Error("Dữ liệu đã đổi ở trang khác. Hãy tải lại trang trước khi thử lưu.");
      }
      try {
        localStorage.setItem(KHOA, banGhiMoi);
      } catch (loi) {
        throw new Error("Không thể lưu dữ liệu. Bộ nhớ trình duyệt có thể đã đầy hoặc bị chặn.");
      }
      banGhiDaDoc = banGhiMoi;
      duLieuHienTai = JSON.parse(banGhiMoi);
      return saoChep(duLieuHienTai);
    }

    const khoaGhi = globalThis.navigator?.locks;
    return khoaGhi ? khoaGhi.request(KHOA, ghi) : ghi();
  }

  function luuDuLieu(duLieu) {
    return ghiDuLieu(duLieu);
  }

  async function khoiPhucTuTep(duLieu) {
    kiemTraCoTheGhi();
    const kho = chuanBiKhoiPhuc(duLieu);
    dangKhoiPhuc = true;
    try {
      await ghiDuLieu(kho, true);
      // Các trang đang mở giữ dữ liệu cũ cho đến khi trình duyệt tải lại.
    } catch (loi) {
      dangKhoiPhuc = false;
      throw loi;
    }
  }

  function khoiPhucMau() {
    return luuDuLieu(duLieuMau());
  }

  window.khoDuLieu = { layDuLieu, layDuLieuSaoLuu, luuDuLieu, khoiPhucMau, chuanBiKhoiPhuc, khoiPhucTuTep };
})();
