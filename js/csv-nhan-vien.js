const COT_CSV_NHAN_VIEN = {
  MaNV: "Mã NV",
  HoTen: "Họ và tên",
  GioiTinh: "Giới tính",
  NgaySinh: "Ngày sinh",
  HonNhan: "Hôn nhân",
  CMND: "CMND/CCCD",
  NgayCap: "Ngày cấp",
  NoiCap: "Nơi cấp",
  QueQuan: "Quê quán",
  DiaChi: "Địa chỉ",
  DienThoai: "Điện thoại",
  Email: "Email",
  MaPB: "Phòng ban",
  ChucVu: "Chức vụ",
  LuongDeXuat: "Lương đề xuất",
  BangCap: "Bằng cấp",
  ChuyenNganh: "Chuyên ngành",
  SucKhoe: "Sức khỏe",
  NguoiPhuThuoc: "Người phụ thuộc",
  HoanCanh: "Hoàn cảnh",
  LoaiNV: "Loại NV",
  TrangThai: "Trạng thái"
};

function xuatCSVNhanVien(dsNV, dsPB) {
  const cacTruong = Object.keys(COT_CSV_NHAN_VIEN);
  const cacDong = dsNV.map((nv) => cacTruong.map((truong) =>
    truong === "MaPB" ? layTenPhongBan(dsPB, nv.MaPB) : nv[truong]
  ));
  return taoChuoiCSV(Object.values(COT_CSV_NHAN_VIEN), cacDong);
}

function docCSVNhanVien(vanBan, dsNV, dsPB, ngayThamChieu) {
  const [tieuDe, ...cacDong] = docDongCSV(vanBan);
  if (!tieuDe || !cacDong.length) throw new Error("Tệp CSV cần có hàng tiêu đề và ít nhất một dòng dữ liệu.");

  const chuanHoa = (chuoi) => boDauTiengViet(chuoi).trim().replace(/\s+/g, " ");
  const cacCot = tieuDe.cacO.map(chuanHoa);
  if (new Set(cacCot).size !== cacCot.length || cacCot.includes("")) {
    throw new Error(`Dòng ${tieuDe.soDong} có tên cột trống hoặc bị trùng.`);
  }

  const viTri = Object.fromEntries(Object.entries(COT_CSV_NHAN_VIEN).map(([truong, tenCot]) => {
    const theoTieuDe = cacCot.indexOf(chuanHoa(tenCot));
    return [truong, theoTieuDe >= 0 ? theoTieuDe : cacCot.indexOf(chuanHoa(truong))];
  }));
  const cotBatBuoc = ["HoTen", "GioiTinh", "NgaySinh", "CMND", "NgayCap", "NoiCap", "QueQuan", "DienThoai", "MaPB", "ChucVu"];
  const thieuCot = cotBatBuoc.filter((truong) => viTri[truong] < 0);
  if (thieuCot.length) {
    throw new Error(`Thiếu cột bắt buộc: ${thieuCot.map((truong) => COT_CSV_NHAN_VIEN[truong]).join(", ")}.`);
  }

  const nhanVienMoi = [];
  const loi = [];
  const danhSach = [...dsNV];
  const dinhDangMa = /^NV\d{4,12}$/;
  const maDatTruoc = cacDong
    .map(({ cacO }) => (cacO[viTri.MaNV] || "").toUpperCase())
    .filter((maNV) => dinhDangMa.test(maNV))
    .map((MaNV) => ({ MaNV }));

  for (const { soDong, cacO } of cacDong) {
    if (cacO.length !== cacCot.length) {
      loi.push({ soDong, thongBao: `Có ${cacO.length} ô, cần ${cacCot.length} ô theo hàng tiêu đề.` });
      continue;
    }
    const nv = Object.fromEntries(Object.entries(viTri).map(([truong, index]) => [truong, cacO[index] || ""]));
    const phongBan = dsPB.find((pb) => chuanHoa(pb.MaPB) === chuanHoa(nv.MaPB))
      || dsPB.find((pb) => chuanHoa(pb.TenPB) === chuanHoa(nv.MaPB));
    nv.MaPB = phongBan?.MaPB || "";
    nv.MaNV = nv.MaNV.toUpperCase();
    nv.LoaiNV ||= "ChinhThuc";
    nv.TrangThai ||= "DangLam";
    for (const truong of ["NgaySinh", "NgayCap"]) {
      const ngay = nv[truong].match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ngay) nv[truong] = `${ngay[3]}-${ngay[2].padStart(2, "0")}-${ngay[1].padStart(2, "0")}`;
    }

    const loiDong = kiemTraNhanVien(nv, danhSach, dsPB, ngayThamChieu)
      .map(({ truong, thongBao }) => `${COT_CSV_NHAN_VIEN[truong]} — ${thongBao}`);
    if (nv.MaNV && (!dinhDangMa.test(nv.MaNV) || danhSach.some((nguoi) => nguoi.MaNV.toUpperCase() === nv.MaNV))) {
      loiDong.push("Mã NV phải có dạng NV0001 và không trùng.");
    }
    if (!["ChinhThuc", "ThoiVu"].includes(nv.LoaiNV)) loiDong.push("Loại NV phải là ChinhThuc hoặc ThoiVu.");
    if (!["DangLam", "DaNghi"].includes(nv.TrangThai)) loiDong.push("Trạng thái phải là DangLam hoặc DaNghi.");
    if (nv.Email && !/^[^\s@]+@[^\s@]+$/.test(nv.Email)) loiDong.push("Email không đúng định dạng.");
    if (nv.LuongDeXuat && (!/^\d+$/.test(nv.LuongDeXuat) || !Number.isSafeInteger(Number(nv.LuongDeXuat)) || Number(nv.LuongDeXuat) <= 0)) {
      loiDong.push("Lương đề xuất phải là số nguyên dương.");
    }
    if (nv.NguoiPhuThuoc && (!/^\d+$/.test(nv.NguoiPhuThuoc) || !Number.isSafeInteger(Number(nv.NguoiPhuThuoc)))) {
      loiDong.push("Người phụ thuộc phải là số nguyên không âm.");
    }
    if (loiDong.length) {
      loi.push({ soDong, thongBao: loiDong.join(" ") });
      continue;
    }

    nv.MaNV ||= sinhMaNhanVien([...danhSach, ...maDatTruoc]);
    nv.LuongDeXuat = nv.LuongDeXuat ? Number(nv.LuongDeXuat) : undefined;
    nv.NguoiPhuThuoc = Number(nv.NguoiPhuThuoc);
    danhSach.push(nv);
    nhanVienMoi.push(nv);
  }
  return { nhanVienMoi, loi };
}
