/* Data Contract v1.1: dữ liệu mẫu của website. */

const PHONG_BAN = [
  { MaPB: "PB01", TenPB: "Ban Giám đốc", MoTa: "Điều hành chung và định hướng chiến lược.", MaTruongPhong: "NV0001" },
  { MaPB: "PB02", TenPB: "Phòng Nhân sự", MoTa: "Tuyển dụng, hồ sơ nhân sự và đào tạo.", MaTruongPhong: "NV0002" },
  { MaPB: "PB03", TenPB: "Phòng Kế toán", MoTa: "Kế toán, thuế và tính lương.", MaTruongPhong: "NV0004" },
  { MaPB: "PB04", TenPB: "Phòng Kinh doanh", MoTa: "Phát triển khách hàng và doanh số.", MaTruongPhong: "" },
  { MaPB: "PB05", TenPB: "Phòng Kỹ thuật", MoTa: "Phát triển và vận hành hệ thống.", MaTruongPhong: "NV0007" },
  { MaPB: "PB06", TenPB: "Phòng Marketing", MoTa: "Truyền thông và tiếp thị.", MaTruongPhong: "NV0009" },
  { MaPB: "PB07", TenPB: "Phòng Mua hàng", MoTa: "Quản lý nhà cung cấp và mua sắm.", MaTruongPhong: "" },
  { MaPB: "PB08", TenPB: "Phòng Hành chính", MoTa: "Văn thư, lưu trữ và quản trị văn phòng.", MaTruongPhong: "NV0011" },
  { MaPB: "PB09", TenPB: "Phòng Pháp chế", MoTa: "Tư vấn pháp lý và hợp đồng.", MaTruongPhong: "" },
  { MaPB: "PB10", TenPB: "Phòng Chăm sóc khách hàng", MoTa: "Hỗ trợ và giải đáp khách hàng.", MaTruongPhong: "NV0014" }
];

/* TrangThai là trường mô phỏng dẫn xuất từ view dbo.v_NhanVien_TrangThai: DangLam khi có hợp đồng hiệu lực (TuNgay <= ngày tham chiếu và (DenNgay NULL hoặc DenNgay >= ngày tham chiếu)); ngược lại là DaNghi. */
const NHAN_VIEN = [
  { MaNV: "NV0001", HoTen: "Trần Minh Khoa", HinhAnh: "assets/images/avatars/NV0001.svg", GioiTinh: "Nam", NgaySinh: "1980-05-12", CMND: "900000000001", NgayCap: "2000-05-12", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Hà Nội", DienThoai: "0900000001", Email: "khoa.tran@example.com", LoaiNV: "ChinhThuc", MaPB: "PB01", ChucVu: "Giám đốc", MaQuanLyTrucTiep: "", TrangThai: "DangLam" },
  { MaNV: "NV0002", HoTen: "Lê Thu Hà", HinhAnh: "assets/images/avatars/NV0002.svg", GioiTinh: "Nữ", NgaySinh: "1988-09-23", CMND: "900000000002", NgayCap: "2003-09-23", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Hải Phòng", DienThoai: "0900000002", Email: "ha.le@example.com", LoaiNV: "ChinhThuc", MaPB: "PB02", ChucVu: "Trưởng phòng", MaQuanLyTrucTiep: "NV0001", TrangThai: "DangLam" },
  { MaNV: "NV0003", HoTen: "Phạm Quốc Bảo", HinhAnh: "assets/images/avatars/NV0003.svg", GioiTinh: "Nam", NgaySinh: "1995-02-14", CMND: "900000000003", NgayCap: "2010-02-14", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Đà Nẵng", DienThoai: "0900000003", Email: "bao.pham@example.com", LoaiNV: "ChinhThuc", MaPB: "PB02", ChucVu: "Chuyên viên", MaQuanLyTrucTiep: "NV0002", TrangThai: "DangLam" },
  { MaNV: "NV0004", HoTen: "Nguyễn Ngọc Lan", HinhAnh: "assets/images/avatars/NV0004.svg", GioiTinh: "Nữ", NgaySinh: "1985-11-30", CMND: "900000000004", NgayCap: "2000-11-30", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Thừa Thiên Huế", DienThoai: "0900000004", Email: "lan.nguyen@example.com", LoaiNV: "ChinhThuc", MaPB: "PB03", ChucVu: "Kế toán trưởng", MaQuanLyTrucTiep: "NV0001", TrangThai: "DangLam" },
  { MaNV: "NV0005", HoTen: "Võ Thanh Tùng", HinhAnh: "assets/images/avatars/NV0005.svg", GioiTinh: "Nam", NgaySinh: "2001-07-08", CMND: "900000000005", NgayCap: "2016-07-08", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Quảng Nam", DienThoai: "0900000005", Email: "tung.vo@example.com", LoaiNV: "ThoiVu", MaPB: "PB03", ChucVu: "Nhân viên thời vụ", MaQuanLyTrucTiep: "NV0004", TrangThai: "DangLam" },
  { MaNV: "NV0006", HoTen: "Đặng Hoài Nam", HinhAnh: "assets/images/avatars/NV0006.svg", GioiTinh: "Nam", NgaySinh: "1993-12-03", CMND: "900000000006", NgayCap: "2008-12-03", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Đồng Nai", DienThoai: "0900000006", Email: "nam.dang@example.com", LoaiNV: "ChinhThuc", MaPB: "PB02", ChucVu: "Chuyên viên", MaQuanLyTrucTiep: "NV0002", TrangThai: "DangLam" },
  { MaNV: "NV0007", HoTen: "Đỗ Minh Anh", HinhAnh: "assets/images/avatars/NV0007.svg", GioiTinh: "Nữ", NgaySinh: "1990-03-10", CMND: "900000000007", NgayCap: "2005-03-10", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Bình Dương", DienThoai: "0900000007", Email: "do.anh@example.com", LoaiNV: "ChinhThuc", MaPB: "PB05", ChucVu: "Kỹ sư phần mềm", MaQuanLyTrucTiep: "NV0003", TrangThai: "DangLam" },
  { MaNV: "NV0008", HoTen: "Bùi Thanh Tâm", HinhAnh: "assets/images/avatars/NV0008.svg", GioiTinh: "Nam", NgaySinh: "2002-08-03", CMND: "900000000008", NgayCap: "2017-08-03", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Tây Ninh", DienThoai: "0900000008", Email: "bui.tam@example.com", LoaiNV: "ThoiVu", MaPB: "PB05", ChucVu: "Nhân viên thời vụ", MaQuanLyTrucTiep: "NV0007", TrangThai: "DaNghi" },
  { MaNV: "NV0009", HoTen: "Trương Ngọc Hà", HinhAnh: "assets/images/avatars/NV0009.svg", GioiTinh: "Nữ", NgaySinh: "1989-06-18", CMND: "900000000009", NgayCap: "2004-06-18", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Quảng Ninh", DienThoai: "0900000009", Email: "truong.ha@example.com", LoaiNV: "ChinhThuc", MaPB: "PB06", ChucVu: "Trưởng phòng Marketing", MaQuanLyTrucTiep: "NV0007", TrangThai: "DangLam" },
  { MaNV: "NV0010", HoTen: "Dương Hải Yến", HinhAnh: "assets/images/avatars/NV0010.svg", GioiTinh: "Nữ", NgaySinh: "2000-10-27", CMND: "900000000010", NgayCap: "2015-10-27", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Bình Phước", DienThoai: "0900000010", Email: "duong.yen@example.com", LoaiNV: "ThoiVu", MaPB: "PB06", ChucVu: "Nhân viên thời vụ", MaQuanLyTrucTiep: "NV0009", TrangThai: "DangLam" },
  { MaNV: "NV0011", HoTen: "Lê Hoàng Vân", HinhAnh: "assets/images/avatars/NV0011.svg", GioiTinh: "Nữ", NgaySinh: "1991-01-22", CMND: "900000000011", NgayCap: "2006-01-22", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Khánh Hòa", DienThoai: "0900000011", Email: "le.van@example.com", LoaiNV: "ChinhThuc", MaPB: "PB08", ChucVu: "Trưởng phòng Hành chính", MaQuanLyTrucTiep: "NV0010", TrangThai: "DangLam" },
  { MaNV: "NV0012", HoTen: "Phan Thị Hương", HinhAnh: "assets/images/avatars/NV0012.svg", GioiTinh: "Nữ", NgaySinh: "1998-04-16", CMND: "900000000012", NgayCap: "2013-04-16", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Nam Định", DienThoai: "0900000012", Email: "phan.huong@example.com", LoaiNV: "ChinhThuc", MaPB: "PB09", ChucVu: "Chuyên viên pháp chế", MaQuanLyTrucTiep: "NV0011", TrangThai: "DaNghi" },
  { MaNV: "NV0013", HoTen: "Nguyễn Thảo Vy", HinhAnh: "assets/images/avatars/NV0013.svg", GioiTinh: "Nữ", NgaySinh: "1994-07-29", CMND: "900000000013", NgayCap: "2009-07-29", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Vĩnh Long", DienThoai: "0900000013", Email: "", LoaiNV: "ChinhThuc", MaPB: "PB08", ChucVu: "Chuyên viên hành chính", MaQuanLyTrucTiep: "NV0011", TrangThai: "DangLam" },
  { MaNV: "NV0014", HoTen: "Vũ Minh Khôi", HinhAnh: "assets/images/avatars/NV0014.svg", GioiTinh: "Nam", NgaySinh: "1987-03-05", CMND: "900000000014", NgayCap: "2002-03-05", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Bà Rịa - Vũng Tàu", DienThoai: "0900000014", Email: "vu.khoi@example.com", LoaiNV: "ChinhThuc", MaPB: "PB10", ChucVu: "Trưởng phòng Chăm sóc khách hàng", MaQuanLyTrucTiep: "NV0013", TrangThai: "DangLam" },
  { MaNV: "NV0015", HoTen: "Đặng Quốc Hưng", HinhAnh: "assets/images/avatars/NV0015.svg", GioiTinh: "Nam", NgaySinh: "1999-09-14", CMND: "900000000015", NgayCap: "2014-09-14", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Long An", DienThoai: "0900000015", Email: "dang.hung@example.com", LoaiNV: "ChinhThuc", MaPB: "PB10", ChucVu: "Chuyên viên chăm sóc khách hàng", MaQuanLyTrucTiep: "NV0014", TrangThai: "DangLam" },
  { MaNV: "NV0016", HoTen: "Phạm Thị Quế", HinhAnh: "assets/images/avatars/NV0016.svg", GioiTinh: "Nữ", NgaySinh: "1996-12-20", CMND: "900000000016", NgayCap: "2011-12-20", NoiCap: "Cục Cảnh sát QLHC về TTXH", QueQuan: "Bắc Ninh", DienThoai: "0900000016", Email: "pham.que@example.com", LoaiNV: "ChinhThuc", MaPB: "PB02", ChucVu: "Chuyên viên nhân sự", MaQuanLyTrucTiep: "NV0002", TrangThai: "DangLam" }
];

const MUC_LUONG = [
  { MaMucLuong: "ML01", TenMucLuong: "Bậc 1", MoTa: "Mức khởi điểm", SoTien: 12000000 },
  { MaMucLuong: "ML02", TenMucLuong: "Bậc 2", MoTa: "Mức chuyên viên", SoTien: 18000000 },
  { MaMucLuong: "ML03", TenMucLuong: "Bậc 3", MoTa: "Mức quản lý", SoTien: 26000000 },
  { MaMucLuong: "ML04", TenMucLuong: "Bậc 4", MoTa: "Mức điều hành", SoTien: 35000000 }
];

const LUONG_NHAN_VIEN = [
  ...NHAN_VIEN.map((nhanVien, index) => ({ MaLuongNhanVien: `L${String(index + 1).padStart(4, "0")}`, MaNV: nhanVien.MaNV, MaMucLuong: index === 0 ? "ML04" : index < 4 ? "ML03" : "ML02", NgayBatDau: "2025-01-01", NgayKetThuc: null })),
  { MaLuongNhanVien: "L0017", MaNV: "NV0003", MaMucLuong: "ML01", NgayBatDau: "2023-01-01", NgayKetThuc: "2024-12-31" }
];

const HOP_DONG_LAO_DONG = [
  ...NHAN_VIEN.map((nhanVien, index) => ({
    MaHD: `HD${String(index + 1).padStart(4, "0")}`,
    MaNV: nhanVien.MaNV,
    LoaiHD: index % 3 === 0 ? 1 : index % 3 === 1 ? 2 : 3,
    TuNgay: "2025-01-01",
    DenNgay: nhanVien.MaNV === "NV0005" || nhanVien.MaNV === "NV0010" ? "2025-12-31" : nhanVien.TrangThai === "DaNghi" ? "2025-12-31" : null
  })),
  { MaHD: "HD0017", MaNV: "NV0005", LoaiHD: 3, TuNgay: "2026-01-01", DenNgay: "2026-11-05" },
  { MaHD: "HD0018", MaNV: "NV0010", LoaiHD: 3, TuNgay: "2026-01-01", DenNgay: "2026-12-10" }
];

const CHAM_CONG = NHAN_VIEN
  .filter((nhanVien) => nhanVien.TrangThai === "DangLam")
  .map((nhanVien, index) => ({
    MaChamCong: `CC${String(index + 1).padStart(4, "0")}`,
    MaNV: nhanVien.MaNV,
    Thang: "2026-10",
    NgayCong: 22 - (index % 5),
    PhuCap: index % 2 === 0 ? 500000 : 750000
  }));

const CAU_HINH = {
  SO_NGAY_CANH_BAO_HOP_DONG: 60,
  NGAY_THAM_CHIEU_DEMO: "2026-10-18"
};
