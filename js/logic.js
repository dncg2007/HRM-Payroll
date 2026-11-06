/* Hàm thuần: xử lý dữ liệu nhân viên độc lập, không truy cập DOM. */

/** Chuyển ký tự nguy hiểm thành thực thể HTML để dữ liệu an toàn khi kết xuất. */
function escapeHTML(chuoi) {
  const giaTri = chuoi === null || chuoi === undefined ? "" : String(chuoi);
  return giaTri.replace(/[&<>"']/g, (kyTu) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[kyTu]));
}

/** Ảnh tải lên được lưu dưới dạng data URL Base64; dữ liệu mẫu dùng đường dẫn
    tệp tĩnh trong thư mục assets. Chỉ nhận data URL ảnh hoặc đường dẫn tương
    đối an toàn (không dấu chấm trong từng phân đoạn để chặn "../"). */
function laAnhDaiDien(giaTri) {
  if (typeof giaTri !== "string") return false;
  if (/^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/]+={0,2}$/i.test(giaTri)) return true;
  return /^[\w\-]+(\/[\w\-]+)*\.(png|jpe?g|svg|gif|webp)$/i.test(giaTri);
}

/** Chuẩn hóa tiếng Việt về chữ thường không dấu để tìm kiếm nhất quán. */
function boDauTiengViet(chuoi) {
  const giaTri = chuoi === null || chuoi === undefined ? "" : String(chuoi);
  return giaTri.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

/** Định dạng ngày ISO hợp lệ thành dd/mm/yyyy; dữ liệu sai trả dấu gạch. */
function dinhDangNgay(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "—";
  const [nam, thang, ngay] = iso.split("-").map(Number);
  const soNgay = [31, (nam % 4 === 0 && nam % 100 !== 0) || nam % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (thang < 1 || thang > 12 || ngay < 1 || ngay > soNgay[thang - 1]) return "—";
  return `${String(ngay).padStart(2, "0")}/${String(thang).padStart(2, "0")}/${String(nam).padStart(4, "0")}`;
}

/** Lấy chữ cái đầu của từ đầu và từ cuối trong họ tên. */
function layChuCaiDau(hoTen) {
  const cacTu = typeof hoTen === "string" ? hoTen.trim().split(/\s+/).filter(Boolean) : [];
  if (cacTu.length === 0) return "?";
  return `${cacTu[0].charAt(0)}${cacTu[cacTu.length - 1].charAt(0)}`.toUpperCase();
}

/** Đổi mã trạng thái nghiệp vụ sang nhãn tiếng Việt. */
function nhanTrangThai(ma) {
  return { DangLam: "Đang làm việc", DaNghi: "Không làm việc" }[ma] || "Không xác định";
}

/** Tìm tên phòng ban theo mã, không tìm thấy thì trả nhãn dự phòng. */
function layTenPhongBan(dsPB, maPB) {
  if (!Array.isArray(dsPB)) return "Chưa phân phòng";
  const phongBan = dsPB.find((phong) => phong && phong.MaPB === maPB);
  return phongBan && typeof phongBan.TenPB === "string" ? phongBan.TenPB : "Chưa phân phòng";
}

/** Lọc theo từ khóa, phòng ban và trạng thái mà không sửa mảng gốc. */
function locNhanVien(dsNV, boLoc) {
  if (!Array.isArray(dsNV)) return [];
  const loc = boLoc && typeof boLoc === "object" ? boLoc : {};
  const tuKhoa = boDauTiengViet(loc.tuKhoa).trim();
  const maPB = typeof loc.maPB === "string" ? loc.maPB.trim() : "";
  const trangThai = typeof loc.trangThai === "string" ? loc.trangThai.trim() : "";
  return dsNV.filter((nhanVien) => {
    if (!nhanVien || typeof nhanVien !== "object") return false;
    const noiDung = [nhanVien.HoTen, nhanVien.MaNV, nhanVien.DienThoai].map(boDauTiengViet).join(" ");
    return (!tuKhoa || noiDung.includes(tuKhoa)) && (!maPB || nhanVien.MaPB === maPB) && (!trangThai || nhanVien.TrangThai === trangThai);
  });
}

/** Đếm tổng quân số và trạng thái bằng reduce. */
function thongKeNhanVien(dsNV) {
  if (!Array.isArray(dsNV)) return { tong: 0, dangLam: 0, daNghi: 0 };
  return dsNV.reduce((ketQua, nhanVien) => {
    if (!nhanVien || typeof nhanVien !== "object") return ketQua;
    ketQua.tong += 1;
    if (nhanVien.TrangThai === "DangLam") ketQua.dangLam += 1;
    if (nhanVien.TrangThai === "DaNghi") ketQua.daNghi += 1;
    return ketQua;
  }, { tong: 0, dangLam: 0, daNghi: 0 });
}

/** Đếm nhân viên theo phòng ban bằng map và filter. */
function demNhanVienTheoPhong(dsNV, dsPB) {
  if (!Array.isArray(dsPB)) return [];
  const danhSachNhanVien = Array.isArray(dsNV) ? dsNV : [];
  return dsPB.map((phongBan) => ({
    MaPB: phongBan && phongBan.MaPB ? phongBan.MaPB : "",
    TenPB: phongBan && typeof phongBan.TenPB === "string" ? phongBan.TenPB : "Chưa phân phòng",
    SoLuong: danhSachNhanVien.filter((nhanVien) => nhanVien && nhanVien.MaPB === (phongBan && phongBan.MaPB)).length
  }));
}

/** Kiểm tra phòng ban và trưởng phòng theo dữ liệu nhân viên. */
function kiemTraPhongBan(duLieu, dsPB, dsNV) {
  const loi = [];
  const ten = typeof duLieu?.TenPB === "string" ? duLieu.TenPB.trim() : "";
  if (!ten) loi.push({ truong: "TenPB", thongBao: "Tên phòng ban không được để trống." });
  if ((Array.isArray(dsPB) ? dsPB : []).some((pb) => pb.MaPB !== duLieu.MaPB && boDauTiengViet(pb.TenPB) === boDauTiengViet(ten))) loi.push({ truong: "TenPB", thongBao: "Tên phòng ban đã tồn tại." });
  if (duLieu.MaTruongPhong && !(Array.isArray(dsNV) ? dsNV : []).some((nv) => nv.MaNV === duLieu.MaTruongPhong && nv.MaPB === duLieu.MaPB)) loi.push({ truong: "MaTruongPhong", thongBao: "Trưởng phòng phải thuộc phòng ban." });
  return loi;
}

/** Sinh mã phòng ban kế tiếp theo định dạng PB##. */
function sinhMaPhongBan(dsPB) {
  const danhSach = Array.isArray(dsPB) ? dsPB : [];
  const maLonNhat = danhSach.reduce((lonNhat, phongBan) => {
    const soMa = Number(String(phongBan.MaPB || "").replace(/^PB/, "")) || 0;
    return Math.max(lonNhat, soMa);
  }, 0);
  return `PB${String(maLonNhat + 1).padStart(2, "0")}`;
}

/** Thêm phòng ban mà không sửa mảng đầu vào. */
function themPhongBan(dsPB, phongBan) { return [...(Array.isArray(dsPB) ? dsPB : []), { ...phongBan }]; }

/** Sửa phòng ban theo mã và trả mảng mới. */
function suaPhongBan(dsPB, maPB, thayDoi) { return (Array.isArray(dsPB) ? dsPB : []).map((pb) => pb.MaPB === maPB ? { ...pb, ...thayDoi, MaPB: maPB } : { ...pb }); }

/** Chặn xóa phòng ban còn nhân viên đang tham chiếu. */
function xoaPhongBan(dsPB, dsNV, maPB) {
  const danhSach = dsPB || [];
  const nhanVien = Array.isArray(dsNV) ? dsNV : [];
  const soNguoi = nhanVien.filter((nv) => nv.MaPB === maPB).length;
  if (soNguoi) return { ketQua: [...danhSach], loi: `Phòng còn ${soNguoi} nhân viên` };
  return { ketQua: danhSach.filter((pb) => pb.MaPB !== maPB), loi: null };
}

/** Kiểm tra tên chức vụ không rỗng và không trùng không dấu. */
function kiemTraChucVu(duLieu, dsCV) {
  const ten = typeof duLieu?.TenChucVu === "string" ? duLieu.TenChucVu.trim() : "";
  const loi = [];
  if (!ten) loi.push({ truong: "TenChucVu", thongBao: "Tên chức vụ không được để trống." });

  const tenKhongDau = boDauTiengViet(ten);
  const trungTen = (dsCV || []).some((chucVu) =>
    chucVu.MaChucVu !== duLieu?.MaChucVu && boDauTiengViet(chucVu.TenChucVu) === tenKhongDau
  );
  if (trungTen) loi.push({ truong: "TenChucVu", thongBao: "Tên chức vụ đã tồn tại." });
  return loi;
}

/** Sinh mã chức vụ kế tiếp theo định dạng CV##. */
function sinhMaChucVu(dsCV) {
  const maLonNhat = (dsCV || []).reduce((lonNhat, chucVu) => {
    const soMa = Number(String(chucVu.MaChucVu || "").replace(/^CV/, "")) || 0;
    return Math.max(lonNhat, soMa);
  }, 0);
  return `CV${String(maLonNhat + 1).padStart(2, "0")}`;
}

/** Thêm chức vụ mới. */
function themChucVu(dsCV, chucVu) { return [...(dsCV || []), { ...chucVu }]; }

/** Sửa chức vụ và cập nhật chức vụ tương ứng trên nhân viên. */
function suaChucVu(dsCV, dsNV, maCV, thayDoi) {
  const danhSach = dsCV || [];
  const chucVuCu = danhSach.find((cv) => cv.MaChucVu === maCV);
  return {
    danhSach: danhSach.map((cv) =>
      cv.MaChucVu === maCV ? { ...cv, ...thayDoi, MaChucVu: maCV } : { ...cv }
    ),
    nhanVien: (dsNV || []).map((nv) =>
      chucVuCu && nv.ChucVu === chucVuCu.TenChucVu ? { ...nv, ChucVu: thayDoi.TenChucVu } : { ...nv }
    )
  };
}

/** Chặn xóa chức vụ đang có nhân viên giữ. */
function xoaChucVu(dsCV, dsNV, maCV) {
  const danhSach = dsCV || [];
  const chucVuCu = danhSach.find((cv) => cv.MaChucVu === maCV);
  const soNguoi = chucVuCu ? (dsNV || []).filter((nv) => nv.ChucVu === chucVuCu.TenChucVu).length : 0;
  if (soNguoi) return { ketQua: [...danhSach], loi: `Chức vụ còn ${soNguoi} nhân viên` };
  return { ketQua: danhSach.filter((cv) => cv.MaChucVu !== maCV), loi: null };
}

/** Sửa nhân viên theo mã, không cho thay MaNV. */
function suaNhanVien(dsNV, maNV, thayDoi) { return (dsNV || []).map((nv) => nv.MaNV === maNV ? { ...nv, ...thayDoi, MaNV: maNV } : { ...nv }); }

/** Tính số tháng giữa 2 mốc ngày ISO */
function tinhKhoangThoiGianThang(ngayBatDau, ngayKetThuc) {
  if (!ngayBatDau || !ngayKetThuc || typeof ngayBatDau !== "string" || typeof ngayKetThuc !== "string") return 0;
  const p1 = ngayBatDau.split("-").map(Number);
  const p2 = ngayKetThuc.split("-").map(Number);
  if (p1.length < 2 || p2.length < 2) return 0;
  let thang = (p2[0] - p1[0]) * 12 + (p2[1] - p1[1]);
  const d1 = p1[2] || 1;
  const d2 = p2[2] || 1;
  if (d2 < d1) thang -= 1;
  return Math.max(0, thang);
}

/** Cộng thêm số tháng vào ngày ISO */
function congThang(ngayISO, soThang) {
  if (!ngayISO || typeof ngayISO !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(ngayISO)) return "";
  const [y, m, d] = ngayISO.split("-").map(Number);
  const totalMonths = y * 12 + (m - 1) + soThang;
  const newY = Math.floor(totalMonths / 12);
  const newM = (totalMonths % 12) + 1;
  const daysInMonth = new Date(newY, newM, 0).getDate();
  const newD = Math.min(d, daysInMonth);
  return `${newY}-${String(newM).padStart(2, "0")}-${String(newD).padStart(2, "0")}`;
}

/** Lấy ngày bắt đầu làm việc đầu tiên của nhân viên theo lịch sử hợp đồng */
function layNgayBatDauLamViec(dsHopDong, maNV) {
  const ds = Array.isArray(dsHopDong) ? dsHopDong.filter((hd) => hd && hd.MaNV === maNV && hd.TuNgay) : [];
  if (ds.length === 0) return null;
  return ds.map((hd) => hd.TuNgay).sort()[0];
}

/** Xác định giai đoạn Thực tập 6 tháng (lương giảm 30%, tức 70%) hay Chính thức (100% lương) */
function xacDinhGiaiDoanNhanSu(dsHopDong, maNV, ngayThamChieu) {
  const ngayBatDau = layNgayBatDauLamViec(dsHopDong, maNV) || ngayThamChieu;
  const soThang = tinhKhoangThoiGianThang(ngayBatDau, ngayThamChieu);

  const ds = Array.isArray(dsHopDong) ? dsHopDong.filter((hd) => hd && hd.MaNV === maNV) : [];
  const hdHienHanh = ds.filter((hd) => hd.TuNgay <= ngayThamChieu && (!hd.DenNgay || hd.DenNgay >= ngayThamChieu)).sort((a, b) => (b.TuNgay || "").localeCompare(a.TuNgay || ""))[0] || ds[0];

  const loai = hdHienHanh ? hdHienHanh.LoaiHD : null;
  // Thực tập nếu hợp đồng là ThucTap/ThuViec và trong 6 tháng đầu làm việc (< 6 tháng)
  const laThucTap = Boolean(
    (loai === "ThucTap" || loai === "ThuViec" || loai === 3) && soThang < 6
  );
  const laChinhThucMoi = !laThucTap && soThang >= 6;
  const heSoLuong = laThucTap ? 0.7 : 1.0; // Thực tập hưởng 70% lương (giảm 30%)

  return {
    ngayBatDau,
    soThang,
    laThucTap,
    laChinhThucMoi,
    heSoLuong,
    duDieuKienNghi: soThang >= 17, // Tối thiểu 1 năm 5 tháng = 17 tháng
    soThangThieu: Math.max(0, 17 - soThang)
  };
}

/** Kiểm tra điều kiện nghỉ việc theo quy định: Tối thiểu 1 năm 5 tháng (17 tháng: 6 tháng thực tập + 11 tháng chính thức) */
function kiemTraDieuKienNghiViec(dsHopDong, maNV, ngayNghi) {
  const ds = Array.isArray(dsHopDong) ? dsHopDong : [];
  const ngayBatDau = layNgayBatDauLamViec(ds, maNV);
  const ngayHopLe = laNgayHopLe(ngayNghi);
  const hopDong = ngayHopLe ? ds.filter((hd) =>
    hd?.MaNV === maNV && laNgayHopLe(hd.TuNgay, ngayNghi)
      && (!hd.DenNgay || (laNgayHopLe(hd.DenNgay) && ngayNghi <= hd.DenNgay))
  ).sort((a, b) => b.TuNgay.localeCompare(a.TuNgay))[0] : null;

  if (!hopDong) {
    return {
      hopLe: false,
      duDieuKien: false,
      ngayBatDau,
      soThang: 0,
      soThangThieu: 17,
      thongBao: ngayHopLe ? `Không có hợp đồng có hiệu lực ngày ${dinhDangNgay(ngayNghi)}.` : "Ngày nghỉ việc không hợp lệ."
    };
  }

  const soThang = tinhKhoangThoiGianThang(ngayBatDau, ngayNghi);
  const duDieuKien = soThang >= 17; // 1 năm 5 tháng = 17 tháng
  const soThangThieu = Math.max(0, 17 - soThang);

  return {
    hopLe: true,
    hopDong,
    duDieuKien,
    ngayBatDau,
    soThang,
    soThangThieu,
    thongBao: duDieuKien
      ? `Đủ điều kiện nghỉ việc (Đã làm việc ${soThang} tháng >= 17 tháng quy định).`
      : `Chưa đủ điều kiện nghỉ việc theo quy định: Nhân viên phải thực tập 6 tháng và làm việc chính thức tối thiểu 11 tháng (tổng cộng 1 năm 5 tháng = 17 tháng). Hiện tại mới làm việc được ${soThang} tháng từ ${dinhDangNgay(ngayBatDau)} (còn thiếu ${soThangThieu} tháng).`
  };
}

/** Kết thúc hợp đồng hiện hành tại ngày nghỉ, có kiểm tra ràng buộc 1 năm 5 tháng (17 tháng). */
function choNghiViec(dsHopDong, maNV, ngayNghi, boQuaDieuKien17Thang = false) {
  const ds = Array.isArray(dsHopDong) ? dsHopDong : [];
  const kiemTra = kiemTraDieuKienNghiViec(dsHopDong, maNV, ngayNghi);
  if (!kiemTra.hopLe) {
    return { ketQua: [...ds], loi: kiemTra.thongBao, chuaDuDieuKien: true };
  }

  if (!kiemTra.duDieuKien && !boQuaDieuKien17Thang) {
    return {
      ketQua: [...ds],
      loi: kiemTra.thongBao,
      chuaDuDieuKien: true,
      soThang: kiemTra.soThang,
      soThangThieu: kiemTra.soThangThieu
    };
  }

  return { ketQua: ds.map((x) => x === kiemTra.hopDong ? { ...x, DenNgay: ngayNghi } : { ...x }), loi: null };
}

/** Đếm nhân viên theo danh mục chức vụ. */
function demChucVu(dsNV, dsCV) { return (dsCV || []).map((cv) => ({ MaChucVu: cv.MaChucVu, TenChucVu: cv.TenChucVu, SoLuong: (dsNV || []).filter((nv) => nv.ChucVu === cv.TenChucVu).length })); }

/** Cập nhật TrangThai dẫn xuất theo ngày tham chiếu mà không sửa mảng gốc. */
function capNhatTrangThai(dsNV, dsHopDong, ngayThamChieu) {
  const coHopDong = new Set((dsHopDong || []).map((hd) => hd?.MaNV));
  return (dsNV || []).map((nv) => coHopDong.has(nv.MaNV)
    ? { ...nv, TrangThai: suyRaTrangThai(nv.MaNV, dsHopDong, ngayThamChieu) }
    : { ...nv });
}

/** Sinh mã nhân viên kế tiếp theo độ rộng mã lớn nhất hiện có. */
/** Chọn theme hợp lệ: ưu tiên giá trị đã lưu, sau đó đến preference hệ điều hành. */
/* Giữ đồng bộ với chonTheme trong theme.js: cùng whitelist và fallback hệ điều hành. */
function chonGiaoDien(giaTriLuu, uaTuaHeThongToi) {
  if (giaTriLuu === "light" || giaTriLuu === "dark") return giaTriLuu;
  return uaTuaHeThongToi === true ? "dark" : "light";
}

/** Suy ra trạng thái hợp đồng tại ngày tham chiếu theo view SQL, không dùng Date. */
function suyRaTrangThai(maNV, dsHopDong, ngayThamChieu) {
  if (typeof maNV !== "string" || !Array.isArray(dsHopDong) || !laNgayHopLe(ngayThamChieu)) return "DaNghi";
  const coHopDong = dsHopDong.some((hd) => hd?.MaNV === maNV && !kiemTraKhoangHopDong(hd.TuNgay, hd.DenNgay)
    && hd.TuNgay <= ngayThamChieu && (!hd.DenNgay || ngayThamChieu <= hd.DenNgay));
  return coHopDong ? "DangLam" : "DaNghi";
}

function sinhMaNhanVien(dsNV) {
  const danhSach = Array.isArray(dsNV) ? dsNV : [];
  const maHopLe = danhSach.map((nv) => nv && typeof nv.MaNV === "string" ? nv.MaNV.match(/^(.*?)(\d+)$/) : null).filter(Boolean);
  const doRong = maHopLe.reduce((max, match) => Math.max(max, match[2].length), 4);
  const soLonNhat = maHopLe.reduce((max, match) => Math.max(max, Number(match[2])), 0);
  return `NV${String(soLonNhat + 1).padStart(doRong, "0")}`;
}

function sinhMaHopDong(dsHD) {
  const danhSach = Array.isArray(dsHD) ? dsHD : [];
  const maHopLe = danhSach.map((hd) => hd && typeof hd.MaHD === "string" ? hd.MaHD.match(/^(.*?)(\d+)$/) : null).filter(Boolean);
  const doRong = maHopLe.reduce((max, match) => Math.max(max, match[2].length), 4);
  const soLonNhat = maHopLe.reduce((max, match) => Math.max(max, Number(match[2])), 0);
  return `HD${String(soLonNhat + 1).padStart(doRong, "0")}`;
}

function layTenLoaiHopDong(loaiHD) {
  if (loaiHD === "ThucTap") return "HĐ thực tập (6 tháng - 70% lương)";
  if (loaiHD === "ChinhThuc") return "HĐ chính thức (100% lương)";
  if (loaiHD === 1 || loaiHD === "1" || loaiHD === "KhongXacDinhThoiHan") return "HĐ không xác định thời hạn";
  if (loaiHD === 2 || loaiHD === "2" || loaiHD === "XacDinhThoiHan") return "HĐ xác định thời hạn (1 - 3 năm)";
  if (loaiHD === 3 || loaiHD === "3" || loaiHD === "ThuViec") return "HĐ thử việc";
  if (loaiHD === 4 || loaiHD === "4" || loaiHD === "ThoiVu") return "HĐ thời vụ / khoán việc";
  return loaiHD ? `Hợp đồng Loại ${loaiHD}` : "Chưa có hợp đồng";
}

function quyDoiMaLoaiHD(loaiHD) {
  if (loaiHD === "ThucTap") return "ThucTap";
  if (loaiHD === "ChinhThuc") return "ChinhThuc";
  if (loaiHD === 1 || loaiHD === "1" || loaiHD === "KhongXacDinhThoiHan") return "KhongXacDinhThoiHan";
  if (loaiHD === 2 || loaiHD === "2" || loaiHD === "XacDinhThoiHan") return "XacDinhThoiHan";
  if (loaiHD === 3 || loaiHD === "3" || loaiHD === "ThuViec") return "ThuViec";
  if (loaiHD === 4 || loaiHD === "4" || loaiHD === "ThoiVu") return "ThoiVu";
  return "KhongXacDinhThoiHan";
}

/** Tính tuổi theo ngày tham chiếu bằng phép so sánh chuỗi ISO, không dùng Date. */
function tinhTuoi(ngaySinh, ngayThamChieu) {
  if (typeof ngaySinh !== "string" || typeof ngayThamChieu !== "string") return -1;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngaySinh) || !/^\d{4}-\d{2}-\d{2}$/.test(ngayThamChieu)) return -1;
  const [namSinh, thangSinh, ngaySinhSo] = ngaySinh.split("-").map(Number);
  const [namRef, thangRef, ngayRef] = ngayThamChieu.split("-").map(Number);
  let tuoi = namRef - namSinh;
  if (thangRef < thangSinh || (thangRef === thangSinh && ngayRef < ngaySinhSo)) tuoi -= 1;
  return tuoi;
}

/** Kiểm tra ngày theo lịch và giới hạn ngày tham chiếu. */
function laNgayHopLe(iso, ngayThamChieu) {
  return dinhDangNgay(iso) !== "—" && (!ngayThamChieu || iso <= ngayThamChieu);
}

function kiemTraKhoangHopDong(tuNgay, denNgay) {
  if (!laNgayHopLe(tuNgay)) {
    return { truong: "TuNgayHD", thongBao: "Ngày bắt đầu hợp đồng không hợp lệ." };
  }
  if (denNgay !== null && denNgay !== undefined && denNgay !== ""
      && (!laNgayHopLe(denNgay) || denNgay < tuNgay)) {
    return { truong: "DenNgayHD", thongBao: "Ngày kết thúc hợp đồng phải hợp lệ và không trước ngày bắt đầu." };
  }
  return null;
}

/** Kiểm tra dữ liệu nhân viên mới và trả danh sách lỗi theo trường. */
function kiemTraNhanVien(duLieu, dsNV, dsPB, ngayThamChieu) {
  const duLieuAnToan = duLieu && typeof duLieu === "object" ? duLieu : {};
  const danhSach = Array.isArray(dsNV) ? dsNV : [];
  const phongBan = Array.isArray(dsPB) ? dsPB : [];
  const loi = [];
  const themLoi = (truong, thongBao) => loi.push({ truong, thongBao });
  const hoTen = typeof duLieuAnToan.HoTen === "string" ? duLieuAnToan.HoTen.trim() : "";
  // Regex: ^ bắt đầu, [^\s]+ là từ không có khoảng trắng, \s+ là ít nhất một khoảng trắng, $ kết thúc.
  if (!/^[^\s]{2,}(?:\s+[^\s]{2,})+$/.test(hoTen)) themLoi("HoTen", "Họ tên cần ít nhất 2 từ, mỗi từ tối thiểu 2 ký tự.");
  if (!["Nam", "Nữ", "Khác"].includes(duLieuAnToan.GioiTinh)) themLoi("GioiTinh", "Vui lòng chọn giới tính hợp lệ.");
  if (!laNgayHopLe(duLieuAnToan.NgaySinh, ngayThamChieu) || tinhTuoi(duLieuAnToan.NgaySinh, ngayThamChieu) < 18) themLoi("NgaySinh", "Ngày sinh không hợp lệ hoặc nhân viên chưa đủ 18 tuổi.");
  // Regex: ^\d{9}(\d{3})?$ nghĩa là đúng 9 hoặc 12 chữ số và không có ký tự khác.
  if (typeof duLieuAnToan.CMND !== "string" || !/^\d{9}(\d{3})?$/.test(duLieuAnToan.CMND) || danhSach.some((nv) => nv.CMND === duLieuAnToan.CMND)) themLoi("CMND", "CMND/CCCD phải có 9 hoặc 12 chữ số và không trùng.");
  // Regex: ^0 bắt đầu bằng số 0, \d{9} thêm đúng 9 chữ số, $ kết thúc chuỗi.
  if (typeof duLieuAnToan.DienThoai !== "string" || !/^0\d{9}$/.test(duLieuAnToan.DienThoai) || danhSach.some((nv) => nv.DienThoai === duLieuAnToan.DienThoai)) themLoi("DienThoai", "Số điện thoại phải có 10 chữ số bắt đầu bằng 0 và không trùng.");
  if (!laNgayHopLe(duLieuAnToan.NgayCap, ngayThamChieu) || duLieuAnToan.NgayCap <= duLieuAnToan.NgaySinh) themLoi("NgayCap", "Ngày cấp phải sau ngày sinh và không sau ngày tham chiếu.");
  ["NoiCap", "QueQuan", "ChucVu"].forEach((truong) => { if (typeof duLieuAnToan[truong] !== "string" || !duLieuAnToan[truong].trim()) themLoi(truong, "Trường này không được để trống."); });
  if (!phongBan.some((pb) => pb.MaPB === duLieuAnToan.MaPB)) themLoi("MaPB", "Phòng ban không tồn tại.");
  return loi;
}

/** Thêm nhân viên bằng spread và trả về mảng mới, không sửa mảng đầu vào. */
function themNhanVien(dsNV, nhanVienMoi) {
  return [...(Array.isArray(dsNV) ? dsNV : []), nhanVienMoi && typeof nhanVienMoi === "object" ? { ...nhanVienMoi } : {}];
}

/** Lấy hồ sơ nhân viên, phòng ban, lương và hợp đồng hiện hành. */
function layHoSoNhanVien(maNV, dsNV, dsPB, dsLuong, dsMucLuong, dsHopDong, ngayThamChieu) {
  const nhanVien = Array.isArray(dsNV) ? dsNV.find((nv) => nv && nv.MaNV === maNV) : null;
  if (!nhanVien) return null;
  const dsHDNV = Array.isArray(dsHopDong) ? dsHopDong.filter((hd) => hd && hd.MaNV === maNV) : [];
  let hopDong = dsHDNV.filter((hd) => hd.TuNgay <= ngayThamChieu && (!hd.DenNgay || hd.DenNgay >= ngayThamChieu)).sort((a, b) => (b.TuNgay || "").localeCompare(a.TuNgay || ""))[0];
  if (!hopDong && dsHDNV.length > 0) {
    hopDong = [...dsHDNV].sort((a, b) => (b.TuNgay || "").localeCompare(a.TuNgay || ""))[0];
  }
  return {
    nhanVien: { ...nhanVien },
    TenPB: layTenPhongBan(dsPB, nhanVien.MaPB),
    MucLuong: layLuongHienHanh(maNV, dsLuong, dsMucLuong, ngayThamChieu),
    HopDong: hopDong ? { MaHD: hopDong.MaHD, LoaiHD: hopDong.LoaiHD, TuNgay: hopDong.TuNgay, DenNgay: hopDong.DenNgay || null } : null
  };
}

/** Chọn mức lương có ngày bắt đầu mới nhất còn hiệu lực tại ngày tham chiếu. */
function layLuongHienHanh(maNV, dsLuong, dsMucLuong, ngayThamChieu) {
  if (!Array.isArray(dsLuong) || !Array.isArray(dsMucLuong)) return 0;
  const dongLuong = dsLuong.filter((luong) => luong.MaNV === maNV && luong.NgayBatDau <= ngayThamChieu && (!luong.NgayKetThuc || luong.NgayKetThuc >= ngayThamChieu)).sort((a, b) => b.NgayBatDau.localeCompare(a.NgayBatDau))[0];
  if (!dongLuong) return 0;
  const mucLuong = dsMucLuong.find((muc) => muc.MaMucLuong === dongLuong.MaMucLuong);
  return mucLuong && Number.isFinite(Number(mucLuong.SoTien)) ? Number(mucLuong.SoTien) : 0;
}

/** Tính lương theo ngày công, giới hạn ngày công không vượt chuẩn. */
function tinhLuong(soTienMucLuong, ngayCong, phuCap, ngayCongChuan) {
  const luong = Number(soTienMucLuong);
  const cong = Number(ngayCong);
  const phu = Number(phuCap);
  const chuan = Number(ngayCongChuan);
  if (![luong, cong, phu, chuan].every(Number.isFinite) || luong < 0 || cong < 0 || phu < 0 || chuan <= 0) return 0;
  return Math.round(luong / chuan * Math.min(cong, chuan)) + phu;
}

function tinhCacKhoanLuong(mucLuong, ngayCong, phuCap, thuong, phat, ngayCongChuan) {
  const luongNgayCong = tinhLuong(mucLuong, ngayCong, 0, ngayCongChuan);
  const baoHiem = Math.round(luongNgayCong * 0.105);
  const thucLinh = Math.max(0, luongNgayCong + phuCap + thuong - phat - baoHiem);
  return { luongNgayCong, baoHiem, thucLinh };
}

/** Xác định ngày trong tháng thuộc ít nhất một hợp đồng của nhân viên. */
function layKyLamViecTrongThang(nhanVien, thang, dsHopDong) {
  const ngayCuoi = ngayCuoiThang(thang);
  if (!nhanVien || !ngayCuoi) return null;
  const cacHopDong = (Array.isArray(dsHopDong) ? dsHopDong : []).filter((hd) => hd?.MaNV === nhanVien.MaNV);
  if (!cacHopDong.length) {
    // Hồ sơ từ CSV cũ chưa có hợp đồng. Chỉ có trạng thái để xác định đối tượng tính lương.
    return nhanVien.TrangThai === "DangLam" ? { ngayXetLuong: ngayCuoi, cacNgayHopLe: null } : null;
  }

  const ngayDau = `${thang}-01`;
  const hopDongTrongThang = cacHopDong.filter((hd) =>
    !kiemTraKhoangHopDong(hd.TuNgay, hd.DenNgay)
      && hd.TuNgay <= ngayCuoi && (!hd.DenNgay || hd.DenNgay >= ngayDau)
  );
  if (!hopDongTrongThang.length) return null;

  const cacNgayHopLe = new Set();
  let ngayXetLuong = ngayDau;
  for (let ngay = 1; ngay <= soNgayTrongThang(thang); ngay++) {
    const ngayISO = `${thang}-${String(ngay).padStart(2, "0")}`;
    if (hopDongTrongThang.some((hd) => hd.TuNgay <= ngayISO && (!hd.DenNgay || hd.DenNgay >= ngayISO))) {
      cacNgayHopLe.add(ngay);
      ngayXetLuong = ngayISO;
    }
  }
  return { ngayXetLuong, cacNgayHopLe };
}

/** Tạo bảng lương theo kỳ hợp đồng, ngày công, phụ cấp và thưởng phạt. */
function taoBangLuong(thang, dsNV, dsPB, dsLuong, dsMucLuong, dsChamCong, _cauHinh, dsChamCongNgay = {}, dsKhenThuong = [], dsHopDong = [], dsNghiPhep = []) {
  if (!ngayCuoiThang(thang) || !Array.isArray(dsNV)) return [];
  const dsChamCongArr = Array.isArray(dsChamCong) ? dsChamCong : [];
  const ngayCongChuan = tinhTongNgayCongTuBang(lapBangCongTheoNgay(thang));
  const nghiDaDuyet = layNghiDaDuyet(thang, dsNghiPhep, dsChamCongNgay);
  const ketQua = [];

  for (const nv of dsNV) {
    const kyLamViec = layKyLamViecTrongThang(nv, thang, dsHopDong);
    if (!kyLamViec) continue;
    const { ngayXetLuong, cacNgayHopLe } = kyLamViec;
    // 1. Xác định mức lương cơ bản gốc (Ưu tiên bảng lương chuẩn, nếu NV mới tự nhập thì lấy LuongDeXuat)
    let mucLuongGoc = layLuongHienHanh(nv.MaNV, dsLuong, dsMucLuong, ngayXetLuong);
    let laLuongDeXuat = false;
    if (!mucLuongGoc || mucLuongGoc <= 0) {
      mucLuongGoc = Number(nv.LuongDeXuat) || Number(nv.MucLuong) || 10000000;
      laLuongDeXuat = true;
    }

    // 2. Kiểm tra giai đoạn Thực tập 6 tháng (hưởng 70% lương, giảm 30%) hay Chính thức (100% lương theo quy định)
    const giaiDoan = xacDinhGiaiDoanNhanSu(dsHopDong, nv.MaNV, ngayXetLuong);
    const laThucTap = giaiDoan.laThucTap;
    const laChinhThucMoi = giaiDoan.laChinhThucMoi;
    const heSoLuong = giaiDoan.heSoLuong;
    const mucLuong = Math.round(mucLuongGoc * heSoLuong);

    // 3. Xác định ngày công và phụ cấp
    const chamCong = dsChamCongArr.find((cc) => cc.MaNV === nv.MaNV && cc.Thang === thang);
    const congDaLuu = { ...dsChamCongNgay?.[thang]?.[nv.MaNV], ...nghiDaDuyet.get(nv.MaNV) };
    const phuCap = chamCong ? Number(chamCong.PhuCap) || 0 : 500000;
    const congMau = chamCong ? Number(chamCong.NgayCong) || 0 : undefined;
    const ngayCong = tinhTongNgayCongTuBang(lapBangCongTheoNgay(thang, congDaLuu, cacNgayHopLe, congMau));

    // 4. Liên thông Thưởng và Phạt từ quyết định Khen thưởng & Kỷ luật trong tháng
    const { thuong, phat } = tinhThuongPhatThang(nv.MaNV, thang, dsKhenThuong);

    const { thucLinh } = tinhCacKhoanLuong(mucLuong, ngayCong, phuCap, thuong, phat, ngayCongChuan);

    ketQua.push({
      MaNV: nv.MaNV,
      HoTen: nv.HoTen,
      TenPB: layTenPhongBan(dsPB, nv.MaPB),
      ChucVu: nv.ChucVu || "—",
      MucLuongGoc: mucLuongGoc,
      MucLuong: mucLuong,
      LaLuongDeXuat: laLuongDeXuat,
      LaThucTap: laThucTap,
      LaChinhThucMoi: laChinhThucMoi,
      HeSoLuong: heSoLuong,
      ThoiGianLamViecThang: giaiDoan.soThang,
      NgayCong: ngayCong,
      NgayCongChuan: ngayCongChuan,
      PhuCap: phuCap,
      Thuong: thuong,
      Phat: phat,
      LuongThucNhan: thucLinh
    });
  }
  return ketQua;
}

/** Cộng tổng số nhân viên, quỹ lương và tính lương trung bình. */
function tongQuyLuong(dsBangLuong) {
  const danhSach = Array.isArray(dsBangLuong) ? dsBangLuong : [];
  const tongQuy = danhSach.reduce((tong, dong) => tong + (Number(dong.LuongThucNhan) || 0), 0);
  return { tongNhanVien: danhSach.length, tongQuyLuong: tongQuy, luongTrungBinh: danhSach.length ? tongQuy / danhSach.length : 0 };
}

/** Định dạng tiền Việt Nam; số sai kiểu trả về 0 đ. */
function dinhDangTien(so) {
  const giaTri = Number(so);
  return Number.isFinite(giaTri) && giaTri >= 0 ? `${Math.round(giaTri).toLocaleString("vi-VN")} đ` : "0 đ";
}

/** Chuyển số tiền thành chữ tiếng Việt chuẩn quy tắc kế toán */
function docSoThanhChu(so) {
  if (typeof so !== "number" || isNaN(so) || so <= 0) return "Không đồng chẵn.";
  const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const lop = ["", "nghìn", "triệu", "tỷ"];

  function docBaSo(baso, dayDu) {
    let tr = Math.floor(baso / 100);
    let ch = Math.floor((baso % 100) / 10);
    let dv = baso % 10;
    let kq = "";
    if (tr > 0 || dayDu) {
      kq += chuSo[tr] + " trăm ";
      if (ch === 0 && dv > 0) kq += "lẻ ";
    }
    if (ch === 1) {
      kq += "mười ";
    } else if (ch > 1) {
      kq += chuSo[ch] + " mươi ";
    }
    if (ch > 0 && dv === 1) {
      kq += (ch > 1) ? "mốt" : "một";
    } else if (ch > 0 && dv === 5) {
      kq += "lăm";
    } else if (dv > 0 || (tr === 0 && ch === 0 && !dayDu)) {
      kq += chuSo[dv];
    }
    return kq.trim();
  }

  let s = Math.round(so).toString();
  let cacLop = [];
  while (s.length > 0) {
    cacLop.push(parseInt(s.slice(-3), 10));
    s = s.slice(0, -3);
  }

  let chuoi = "";
  for (let i = cacLop.length - 1; i >= 0; i--) {
    let giaTri = cacLop[i];
    if (giaTri > 0) {
      let dayDu = (i < cacLop.length - 1);
      let chuLop = docBaSo(giaTri, dayDu);
      chuoi += chuLop + " " + lop[i] + " ";
    }
  }
  chuoi = chuoi.trim();
  return chuoi.charAt(0).toUpperCase() + chuoi.slice(1) + " đồng chẵn.";
}

/** Tính chi tiết các khoản trong phiếu lương cá nhân (khấu trừ bảo hiểm 10.5%, liên thông thưởng và phạt) */
function tinhChiTietPhieuLuong(dongLuong, cauHinh) {
  if (!dongLuong) return null;
  const ngayCongChuan = dongLuong.NgayCongChuan || cauHinh?.NGAY_CONG_CHUAN || 26;
  const mucLuong = Number(dongLuong.MucLuong) || 0;
  const ngayCong = Number(dongLuong.NgayCong) || 0;
  const phuCap = Number(dongLuong.PhuCap) || 0;
  const thuong = Number(dongLuong.Thuong) || 0;
  const phat = Number(dongLuong.Phat) || 0;

  const { luongNgayCong, baoHiem, thucLinh } = tinhCacKhoanLuong(
    mucLuong, ngayCong, phuCap, thuong, phat, ngayCongChuan
  );

  return {
    MaNV: dongLuong.MaNV,
    HoTen: dongLuong.HoTen,
    TenPB: dongLuong.TenPB,
    ChucVu: dongLuong.ChucVu || "Nhân viên",
    NgayCong: ngayCong,
    NgayCongChuan: ngayCongChuan,
    MucLuong: mucLuong,
    MucLuongGoc: dongLuong.MucLuongGoc || mucLuong,
    LaLuongDeXuat: !!dongLuong.LaLuongDeXuat,
    LaThucTap: !!dongLuong.LaThucTap,
    LaChinhThucMoi: !!dongLuong.LaChinhThucMoi,
    HeSoLuong: dongLuong.HeSoLuong || 1.0,
    ThoiGianLamViecThang: dongLuong.ThoiGianLamViecThang || 0,
    LuongNgayCong: luongNgayCong,
    PhuCap: phuCap,
    Thuong: thuong,
    Phat: phat,
    BaoHiem: baoHiem,
    ThucLinh: thucLinh,
    BangChu: docSoThanhChu(thucLinh)
  };
}

/** Đổi ngày ISO thành số ngày liên tục bằng thuật toán số học, không dùng Date. */
function soNgayTuMoc(iso) {
  if (typeof iso !== "string" || dinhDangNgay(iso) === "—") return null;
  const [namGoc, thangGoc, ngayGoc] = iso.split("-").map(Number);
  const nam = namGoc - (thangGoc <= 2 ? 1 : 0);
  const ky = Math.floor(nam / 400);
  const namTrongKy = nam - ky * 400;
  const thangTrongNam = thangGoc + (thangGoc > 2 ? -3 : 9);
  const ngayTrongNam = Math.floor((153 * thangTrongNam + 2) / 5) + ngayGoc - 1;
  const ngayTrongKy = namTrongKy * 365 + Math.floor(namTrongKy / 4) - Math.floor(namTrongKy / 100) + ngayTrongNam;
  return ky * 146097 + ngayTrongKy;
}

/** Tìm hợp đồng sắp hết hạn trong cửa sổ cảnh báo và sắp theo ngày còn lại. */
function hopDongSapHetHan(dsHopDong, dsNV, ngayThamChieu, soNgayCanhBao) {
  if (!Array.isArray(dsHopDong) || !Array.isArray(dsNV) || soNgayCanhBao < 0) return [];
  const moc = soNgayTuMoc(ngayThamChieu);
  if (moc === null) return [];
  return dsHopDong.map((hopDong) => {
    const nhanVien = dsNV.find((nv) => nv && nv.MaNV === (hopDong && hopDong.MaNV));
    const denNgay = hopDong && hopDong.DenNgay;
    if (!hopDong || !nhanVien || !denNgay) return null;
    const ngayKetThuc = soNgayTuMoc(denNgay);
    if (ngayKetThuc === null) return null;
    const soNgayConLai = ngayKetThuc - moc;
    return soNgayConLai >= 0 && soNgayConLai <= soNgayCanhBao ? { MaNV: nhanVien.MaNV, HoTen: nhanVien.HoTen, LoaiHD: hopDong.LoaiHD, DenNgay: denNgay, SoNgayConLai: soNgayConLai } : null;
  }).filter(Boolean).sort((a, b) => a.SoNgayConLai - b.SoNgayConLai);
}

/** Tổng hợp quân số, phòng ban và quỹ lương cho dashboard. */
function thongKeDashboard(dsNV, dsPB, dsBangLuong) {
  return { quanSo: thongKeNhanVien(dsNV), theoPhong: demNhanVienTheoPhong(dsNV, dsPB), quyLuong: tongQuyLuong(dsBangLuong) };
}

/** Tính ngày cuối tháng bằng phép tính số học, không dùng Date. */
function ngayCuoiThang(thang) {
  if (typeof thang !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(thang)) return null;
  return `${thang}-${soNgayTrongThang(thang)}`;
}

/** Thống kê cơ cấu nhân sự theo giới tính. */
function thongKeGioiTinh(dsNV) {
  const danhSach = Array.isArray(dsNV) ? dsNV : [];
  const tong = danhSach.length || 1;
  const ketQua = danhSach.reduce((acc, nv) => {
    if (nv && nv.GioiTinh === "Nam") acc.nam += 1;
    else if (nv && nv.GioiTinh === "Nữ") acc.nu += 1;
    else acc.khac += 1;
    return acc;
  }, { nam: 0, nu: 0, khac: 0 });
  return {
    ...ketQua,
    tong: danhSach.length,
    tyLeNam: Math.round((ketQua.nam / tong) * 100),
    tyLeNu: Math.round((ketQua.nu / tong) * 100),
    tyLeKhac: Math.round((ketQua.khac / tong) * 100)
  };
}

/** Thống kê cơ cấu nhân sự theo loại nhân viên. */
function thongKeLoaiNhanVien(dsNV) {
  const danhSach = Array.isArray(dsNV) ? dsNV : [];
  const tong = danhSach.length || 1;
  const chinhThuc = danhSach.filter((nv) => nv && nv.LoaiNV === "ChinhThuc").length;
  const thoiVu = danhSach.filter((nv) => nv && nv.LoaiNV === "ThoiVu").length;
  return {
    chinhThuc,
    thoiVu,
    tong: danhSach.length,
    tyLeChinhThuc: Math.round((chinhThuc / tong) * 100),
    tyLeThoiVu: Math.round((thoiVu / tong) * 100)
  };
}

/** Thống kê phân bổ nhân viên theo bậc lương. */
function thongKeBacLuong(dsNV, dsLuong, dsMucLuong, ngayThamChieu) {
  const danhSachNV = Array.isArray(dsNV) ? dsNV : [];
  const mucLuongList = Array.isArray(dsMucLuong) ? dsMucLuong : [];
  return mucLuongList.map((muc) => {
    const soLuong = danhSachNV.filter((nv) => {
      if (!nv) return false;
      const tienLuong = layLuongHienHanh(nv.MaNV, dsLuong, dsMucLuong, ngayThamChieu);
      return tienLuong === Number(muc.SoTien);
    }).length;
    return {
      MaMucLuong: muc.MaMucLuong,
      TenMucLuong: muc.TenMucLuong,
      SoTien: muc.SoTien,
      SoLuong: soLuong,
      TyLe: danhSachNV.length ? Math.round((soLuong / danhSachNV.length) * 100) : 0
    };
  });
}

/* ==========================================================================
   HÀM THUẦN HỖ TRỢ XUẤT NHẬP EXCEL, PHÂN TRANG, CHẤM CÔNG & KHEN THƯỞNG
   ========================================================================== */

/** Phân trang danh sách dữ liệu */
function phanTrang(danhSach, trang = 1, soDong = 10) {
  const ds = Array.isArray(danhSach) ? danhSach : [];
  const tongSoDong = ds.length;
  const tongSoTrang = Math.max(1, Math.ceil(tongSoDong / soDong));
  const trangHienTai = Math.max(1, Math.min(Number(trang) || 1, tongSoTrang));
  const batDau = (trangHienTai - 1) * soDong;
  const ketThuc = batDau + soDong;
  return {
    danhSachTrang: ds.slice(batDau, ketThuc),
    tongSoDong,
    tongSoTrang,
    trangHienTai,
    tuDong: tongSoDong === 0 ? 0 : batDau + 1,
    denDong: Math.min(ketThuc, tongSoDong)
  };
}

/** Tạo chuỗi CSV có UTF-8 BOM để Excel hiển thị tiếng Việt không lỗi font */
function taoChuoiCSV(tieuDeCot, cacDong) {
  function chuanHoaO(giaTri) {
    if (giaTri === null || giaTri === undefined) return "";
    const chuoi = String(giaTri).replace(/^[\t\r\n]+/, "");
    const canChanCongThuc = typeof giaTri === "string" && /^\s*[=+\-@＝＋－＠]/u.test(chuoi);
    // Tab bên trong ô đã bao nháy giữ dữ liệu dạng văn bản khi mở CSV trong Excel.
    const noiDung = canChanCongThuc ? `\t${chuoi}` : chuoi;
    if (canChanCongThuc || /[,;"\r\n]/.test(noiDung)) {
      return `"${noiDung.replace(/"/g, '""')}"`;
    }
    return noiDung;
  }
  const hangTieuDe = (tieuDeCot || []).map(chuanHoaO).join(",");
  const hangNoiDung = (cacDong || []).map((dong) => (dong || []).map(chuanHoaO).join(",")).join("\r\n");
  return "\uFEFF" + hangTieuDe + "\r\n" + hangNoiDung;
}

/** Tải file từ trình duyệt */
function taiTapTinVeMay(noiDung, tenFile, mimeType = "text/csv;charset=utf-8;") {
  const blob = new Blob([noiDung], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const lienKet = document.createElement("a");
  lienKet.href = url;
  lienKet.download = tenFile;
  document.body.appendChild(lienKet);
  lienKet.click();
  document.body.removeChild(lienKet);
  URL.revokeObjectURL(url);
}

/** Đọc bản ghi CSV và giữ số dòng gốc, kể cả ô có xuống dòng. */
function docDongCSV(vanBan) {
  if (typeof vanBan !== "string") return [];
  const noiDung = vanBan.replace(/^\uFEFF/, "");
  const ketQua = [];
  let soDong = 1;
  let dongBatDau = 1;
  let cacO = [];
  let o = "";
  let trongNhay = false;
  let daDongNhay = false;

  function ketThucO() {
    cacO.push(o.trim());
    o = "";
    daDongNhay = false;
  }

  function ketThucDong() {
    ketThucO();
    if (cacO.length > 1 || cacO[0]) ketQua.push({ soDong: dongBatDau, cacO });
    cacO = [];
  }

  for (let i = 0; i < noiDung.length; i++) {
    const kyTu = noiDung[i];
    if (kyTu === "\r" || kyTu === "\n") {
      const xuongDong = kyTu === "\r" && noiDung[i + 1] === "\n" ? "\r\n" : kyTu;
      i += xuongDong.length - 1;
      soDong++;
      if (trongNhay) {
        o += xuongDong;
      } else {
        ketThucDong();
        dongBatDau = soDong;
      }
    } else if (trongNhay) {
      if (kyTu === '"' && noiDung[i + 1] === '"') {
        o += '"';
        i++;
      } else if (kyTu === '"') {
        trongNhay = false;
        daDongNhay = true;
      } else {
        o += kyTu;
      }
    } else if (kyTu === ",") {
      ketThucO();
    } else if (kyTu === '"' && !o.trim() && !daDongNhay) {
      trongNhay = true;
    } else if (kyTu === '"' || (daDongNhay && kyTu.trim())) {
      throw new Error(`Dòng ${soDong} có dấu nháy kép sai định dạng CSV.`);
    } else {
      o += kyTu;
    }
  }
  if (trongNhay) throw new Error(`Bản ghi ở dòng ${dongBatDau} có ô chưa đóng dấu nháy kép.`);
  ketThucDong();
  return ketQua;
}

function docChuoiCSV(vanBan) {
  return docDongCSV(vanBan).map(({ cacO }) => cacO);
}

/** Lấy số ngày trong tháng (28 - 31) */
function soNgayTrongThang(thang) {
  if (typeof thang !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(thang)) return 30;
  const [nam, thangSo] = thang.split("-").map(Number);
  const danhSach = [31, (nam % 4 === 0 && nam % 100 !== 0) || nam % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return danhSach[thangSo - 1];
}

/** Tính thứ trong tuần (T2, T3, T4, T5, T6, T7, CN) */
function layThuTrongTuan(nam, thang, ngay) {
  const d = new Date(nam, thang - 1, ngay);
  const thu = d.getDay();
  return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][thu];
}

/** Ghép công đã lưu với lịch mặc định T2–T6, kể cả bản ghi chỉ có ngày nghỉ đã duyệt. */
function lapBangCongTheoNgay(thang, congDaLuu, cacNgayHopLe, congMau) {
  const [nam, thangSo] = thang.split("-").map(Number);
  const soNgay = soNgayTrongThang(thang);
  const kyHieuHopLe = new Set(["X", "P", "KP", "OT", "V", "1/2"]);
  const bangNgay = {};
  // Dữ liệu mẫu chỉ có tổng công tháng. Phân bổ công vào các ngày làm việc đầu tiên.
  let congConLai = congMau === undefined ? Infinity : Math.max(0, congMau);
  for (let ngay = 1; ngay <= soNgay; ngay++) {
    if (cacNgayHopLe && !cacNgayHopLe.has(ngay)) {
      bangNgay[ngay] = "V";
      continue;
    }
    const daLuu = congDaLuu?.[ngay];
    const thu = layThuTrongTuan(nam, thangSo, ngay);
    let macDinh = "V";
    if (thu !== "T7" && thu !== "CN" && congConLai > 0) {
      macDinh = congConLai >= 1 ? "X" : "1/2";
      congConLai -= 1;
    }
    bangNgay[ngay] = kyHieuHopLe.has(daLuu) ? daLuu : macDinh;
  }
  return bangNgay;
}

/** Dùng chung ký hiệu nghỉ cho bảng công và bảng lương. */
function layNghiDaDuyet(thang, dsNghiPhep, dsChamCongNgay) {
  const theoNhanVien = new Map();
  for (const don of dsNghiPhep || []) {
    if (don.TrangThai !== "DaDuyet") continue;
    const kyHieu = don.LoaiNghi === "ViecRieng" ? "KP" : "P";
    for (const ngay of layCacNgayTrongKhoang(don.TuNgay, don.DenNgay)) {
      if (!ngay.startsWith(thang + "-")) continue;
      const ngaySo = Number(ngay.slice(-2));
      if (!theoNhanVien.has(don.MaNV)) theoNhanVien.set(don.MaNV, {});
      const bangNgay = theoNhanVien.get(don.MaNV);
      const daCo = bangNgay[ngaySo];
      const daLuu = dsChamCongNgay?.[thang]?.[don.MaNV]?.[ngaySo];
      // Với đơn cũ trùng ngày, giữ ký hiệu đã ghi lúc duyệt nếu còn xác định được.
      bangNgay[ngaySo] = daCo && daCo !== kyHieu
        ? (daLuu === "P" || daLuu === "KP" ? daLuu : "KP")
        : kyHieu;
    }
  }
  return theoNhanVien;
}

/** Tính tổng số ngày công từ bảng ngày: X = 1, P = 1, 1/2 = 0.5, OT = 1, KP = 0 */
function tinhTongNgayCongTuBang(bangNgay) {
  if (!bangNgay || typeof bangNgay !== "object") return 0;
  let tong = 0;
  Object.values(bangNgay).forEach((giaTri) => {
    if (giaTri === "X" || giaTri === "OT") tong += 1;
    else if (giaTri === "P") tong += 1; // Nghỉ phép năm vẫn hưởng lương
    else if (giaTri === "1/2") tong += 0.5;
  });
  return tong;
}

/** Sinh mã quyết định khen thưởng / kỷ luật kế tiếp (QD001, QD002...) */
function sinhMaQuyetDinh(dsKT) {
  const danhSach = Array.isArray(dsKT) ? dsKT : [];
  const soMax = danhSach.reduce((max, item) => {
    const match = String(item.MaQD || "").match(/QD(\d+)/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `QD${String(soMax + 1).padStart(3, "0")}`;
}

/** Tính tổng tiền thưởng và phạt theo tháng */
function tinhThuongPhatThang(maNV, thang, dsKhenThuong) {
  const danhSach = Array.isArray(dsKhenThuong) ? dsKhenThuong : [];
  let thuong = 0;
  let phat = 0;
  danhSach.forEach((item) => {
    if (item && item.MaNV === maNV && String(item.NgayQD || "").startsWith(thang)) {
      const tien = Number(item.SoTien) || 0;
      if (item.Loai === "KhenThuong") thuong += tien;
      else if (item.Loai === "KyLuat") phat += tien;
    }
  });
  return { thuong, phat };
}

/** Bảng quy định định mức Khen thưởng & Xử phạt chuẩn mực (Min 500.000 đ, Max 15.000.000 đ, tăng 10%/cấp lỗi) */
const QUY_DINH_KT_KL = [
  {
    MaQC: "QC-XL01",
    Loai: "KyLuat",
    TenHanhVi: "Đi làm muộn hoặc về sớm không có lý do chính đáng",
    MucCoSo: 500000,
    MoTa: "Áp dụng khi đi muộn quá 15 phút hoặc về sớm không phép."
  },
  {
    MaQC: "QC-XL02",
    Loai: "KyLuat",
    TenHanhVi: "Vi phạm quy định trang phục / Không đeo thẻ nhân viên",
    MucCoSo: 500000,
    MoTa: "Vi phạm tác phong làm việc và văn hóa doanh nghiệp tại cơ quan."
  },
  {
    MaQC: "QC-XL03",
    Loai: "KyLuat",
    TenHanhVi: "Không hoàn thành nhiệm vụ được giao đúng hạn quy định",
    MucCoSo: 1000000,
    MoTa: "Chậm tiến độ gây ảnh hưởng trực tiếp đến kết quả chung của phòng ban."
  },
  {
    MaQC: "QC-KT01",
    Loai: "KhenThuong",
    TenHanhVi: "Nhân viên gương mẫu, chấp hành kỷ luật và tác phong tốt",
    MucCoSo: 1000000,
    MoTa: "Tập thể biểu quyết khen thưởng cá nhân tiêu biểu về tác phong và kỷ luật."
  },
  {
    MaQC: "QC-XL04",
    Loai: "KyLuat",
    TenHanhVi: "Vi phạm quy trình an toàn lao động / Nội quy PCCC",
    MucCoSo: 2000000,
    MoTa: "Không tuân thủ đồ bảo hộ hoặc quy trình vận hành an toàn lao động."
  },
  {
    MaQC: "QC-KT02",
    Loai: "KhenThuong",
    TenHanhVi: "Nhân viên xuất sắc nhất tháng (Hoàn thành 100% KPI)",
    MucCoSo: 2500000,
    MoTa: "Đạt thành tích dẫn đầu về năng suất và chỉ tiêu trong tháng."
  },
  {
    MaQC: "QC-XL05",
    Loai: "KyLuat",
    TenHanhVi: "Làm hư hỏng công cụ, máy móc, trang thiết bị công ty",
    MucCoSo: 4000000,
    MoTa: "Bất cẩn gây hư hại tài sản hoặc trang thiết bị làm việc được giao."
  },
  {
    MaQC: "QC-KT03",
    Loai: "KhenThuong",
    TenHanhVi: "Vượt chỉ tiêu hiệu suất / Doanh số vượt trội trong quý",
    MucCoSo: 5000000,
    MoTa: "Vượt trên 120% định mức chỉ tiêu kế hoạch kinh doanh quý."
  },
  {
    MaQC: "QC-KT04",
    Loai: "KhenThuong",
    TenHanhVi: "Sáng kiến cải tiến kỹ thuật, tối ưu hóa quy trình làm việc",
    MucCoSo: 8000000,
    MoTa: "Đề xuất giải pháp sáng tạo mang lại hiệu quả tăng năng suất hoặc tiết kiệm chi phí."
  },
  {
    MaQC: "QC-XL06",
    Loai: "KyLuat",
    TenHanhVi: "Vi phạm nghiêm trọng chính sách bảo mật, làm lộ dữ liệu",
    MucCoSo: 10000000,
    MoTa: "Làm rò rỉ bí mật công nghệ, mã nguồn hoặc dữ liệu khách hàng."
  },
  {
    MaQC: "QC-KT05",
    Loai: "KhenThuong",
    TenHanhVi: "Thành tích đặc biệt xuất sắc / Cống hiến vượt bậc cả năm",
    MucCoSo: 15000000,
    MoTa: "Mức khen thưởng danh dự cao nhất cho cá nhân có đóng góp mang tính chiến lược."
  }
];

/** Tính số tiền khen thưởng / kỷ luật theo cấp độ lỗi hoặc số lần vi phạm (mỗi cấp tăng 10%) */
function tinhTienTheoCapDoLoi(mucCoSo, capDoLoi = 1) {
  const coSo = Number(mucCoSo) || 500000;
  const cap = Math.max(1, Number(capDoLoi) || 1);
  const heSo = 1 + (cap - 1) * 0.10;
  const tinhToan = Math.round(coSo * heSo);
  return Math.min(15000000, Math.max(500000, tinhToan));
}

/** Sắp xếp danh mục quy định theo số tiền tăng dần hoặc giảm dần */
function sapXepQuyDinh(danhSach, huong = "tang") {
  const ds = Array.isArray(danhSach) ? [...danhSach] : [];
  if (huong === "tang") {
    return ds.sort((a, b) => (Number(a.MucCoSo) || 0) - (Number(b.MucCoSo) || 0));
  }
  return ds.sort((a, b) => (Number(b.MucCoSo) || 0) - (Number(a.MucCoSo) || 0));
}

/** Sinh mã đơn nghỉ phép kế tiếp (NP001, NP002...) */
function sinhMaNghiPhep(dsNP) {
  const danhSach = Array.isArray(dsNP) ? dsNP : [];
  const soMax = danhSach.reduce((max, item) => {
    const match = String(item.MaDon || "").match(/NP(\d+)/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `NP${String(soMax + 1).padStart(3, "0")}`;
}

/** Tính số ngày nghỉ giữa 2 ngày (loại trừ Thứ 7 và Chủ Nhật) */
function tinhSoNgayNghi(tuNgay, denNgay) {
  return layCacNgayTrongKhoang(tuNgay, denNgay).length;
}

function timNgayNghiNgoaiHopDong(dsHopDong, maNV, cacNgayNghi) {
  return cacNgayNghi.find((ngay) => suyRaTrangThai(maNV, dsHopDong, ngay) !== "DangLam");
}

/** Tự động trích xuất các ngày làm việc (không tính T7, CN) trong khoảng ngày nghỉ */
function layCacNgayTrongKhoang(tuNgay, denNgay) {
  if (dinhDangNgay(tuNgay) === "—" || dinhDangNgay(denNgay) === "—" || tuNgay > denNgay) return [];
  const danhSach = [];
  const ngayCuoi = new Date(denNgay);
  for (const ngay = new Date(tuNgay); ngay <= ngayCuoi; ngay.setUTCDate(ngay.getUTCDate() + 1)) {
    const thu = ngay.getUTCDay();
    if (thu !== 0 && thu !== 6) {
      danhSach.push(ngay.toISOString().slice(0, 10));
    }
  }
  return danhSach;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    phanTrang,
    taoChuoiCSV,
    taiTapTinVeMay,
    docChuoiCSV,
    soNgayTrongThang,
    layThuTrongTuan,
    tinhTongNgayCongTuBang,
    sinhMaQuyetDinh,
    tinhThuongPhatThang,
    sinhMaNghiPhep,
    tinhSoNgayNghi,
    layCacNgayTrongKhoang,
    taoBangLuong,
    tinhChiTietPhieuLuong,
    sinhMaNhanVien,
    sinhMaHopDong,
    layTenLoaiHopDong,
    quyDoiMaLoaiHD,
    layHoSoNhanVien,
    themNhanVien,
    suaNhanVien,
    tinhKhoangThoiGianThang,
    congThang,
    layNgayBatDauLamViec,
    xacDinhGiaiDoanNhanSu,
    kiemTraDieuKienNghiViec,
    choNghiViec,
    QUY_DINH_KT_KL,
    tinhTienTheoCapDoLoi,
    sapXepQuyDinh
  };
}
