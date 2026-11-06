(function () {
  document.addEventListener("DOMContentLoaded", khoiTaoTrangNhanVien);

  function khoiTaoTrangNhanVien() {
    const thanBangNhanVien = document.querySelector("#than-bang-nhan-vien");
    const formLoc = document.querySelector("#form-loc");
    const oTimKiem = document.querySelector("#o-tim-kiem");
    const locPhongBan = document.querySelector("#loc-phong-ban");
    const locTrangThai = document.querySelector("#loc-trang-thai");
    const dongKetQua = document.querySelector("#dong-ket-qua");
    const thongBao = document.querySelector("#thong-bao-form");

    const dialogThemNV = document.querySelector("#dialog-them-nhan-vien");
    const nutThemNV = document.querySelector("#nut-them-nhan-vien");
    const nutDongThemNV = document.querySelector("#nut-dong-them-nv");

    const dialogSua = document.querySelector("#dialog-sua-nhan-vien");
    const formSua = document.querySelector("#form-sua-nhan-vien");
    const nutDongSua = document.querySelector("#nut-dong-sua-nv");
    const loiDialogSua = document.querySelector("#loi-dialog-sua");

    const dialogNghi = document.querySelector("#dialog-cho-nghi-viec");
    const formNghi = document.querySelector("#form-cho-nghi-viec");
    const nutDongNghi = document.querySelector("#nut-dong-dialog-nghi");
    const moTaNghi = document.querySelector("#mo-ta-cho-nghi-viec");
    const ngayNghiInput = document.querySelector("#ngay-nghi-viec");
    const nutXacNhanNghi = document.querySelector("#nut-xac-nhan-nghi");
    const loiDialogNghi = document.querySelector("#loi-dialog-nghi");

    const dialogKhoiPhuc = document.querySelector("#dialog-xac-nhan-khoi-phuc");
    const formKhoiPhuc = document.querySelector("#form-khoi-phuc-mau");
    const nutKhoiPhucMau = document.querySelector("#nut-khoi-phuc-mau");
    const nutHuyKhoiPhuc = document.querySelector("#nut-huy-khoi-phuc");

    let duLieuKho = typeof khoDuLieu !== "undefined" ? khoDuLieu.layDuLieu() : { dsNhanVien: [...NHAN_VIEN], dsPhongBan: [...PHONG_BAN], dsHopDong: [...HOP_DONG_LAO_DONG], dsChucVu: [] };
    let dsNhanVienHienTai = [...duLieuKho.dsNhanVien];
    let dsPhongBanHienTai = [...duLieuKho.dsPhongBan];
    let dsHopDongHienTai = [...duLieuKho.dsHopDong];
    let dsChucVuHienTai = [...(duLieuKho.dsChucVu || [])];
    const ngayThamChieu = ngayThamChieuDemo();
    let maNVDangChonNghi = "";
    let anhThemBase64 = "";
    let anhSuaBase64 = "";
    let maHopDongDangSua = null;

    /* Lắng nghe tải ảnh đại diện Base64 */
    const fileInputThem = document.querySelector("#avatar-file");
    const previewThem = document.querySelector("#preview-avatar-them");
    const fileInputSua = document.querySelector("#edit-avatar-file");
    const previewSua = document.querySelector("#preview-avatar-sua");

    function hienThiAnhXemTruoc(container, nguon, moTa) {
      if (!container) return;
      container.replaceChildren();
      if (!laAnhDaiDien(nguon)) return;
      const anh = document.createElement("img");
      anh.src = nguon;
      anh.className = "avatar-preview-img";
      anh.alt = moTa;
      container.appendChild(anh);
    }

    function langNgheChonAnh(input, capNhatAnh) {
      input?.addEventListener("change", () => {
        const tep = input.files[0];
        if (!tep) {
          capNhatAnh("");
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          if (input.files[0] !== tep) return;
          if (!laAnhDaiDien(reader.result)) {
            input.value = "";
            hienThiToast("Vui lòng chọn một tệp ảnh hợp lệ.", "loi");
            return;
          }
          capNhatAnh(reader.result);
        });
        reader.readAsDataURL(tep);
      });
    }

    langNgheChonAnh(fileInputThem, (anh) => {
      anhThemBase64 = anh;
      hienThiAnhXemTruoc(previewThem, anh, "Ảnh xem trước");
    });
    langNgheChonAnh(fileInputSua, (anh) => {
      if (!anh) return;
      anhSuaBase64 = anh;
      hienThiAnhXemTruoc(previewSua, anh, "Ảnh xem trước");
    });

    async function luuDuLieuHeThong(dsNhanVien, dsHopDong = dsHopDongHienTai) {
      const hienTai = khoDuLieu.layDuLieu();
      if (!await luuThayDoi({ ...hienTai, dsNhanVien, dsHopDong })) return false;
      dsNhanVienHienTai = dsNhanVien;
      dsHopDongHienTai = dsHopDong;
      return true;
    }

    function renderBoLoc() {
      const danhSachPhongBan = demNhanVienTheoPhong(dsNhanVienHienTai, dsPhongBanHienTai);
      const luaChonPhongBan = danhSachPhongBan.map((pb) => `<option value="${escapeHTML(pb.MaPB)}">${escapeHTML(pb.TenPB)} (${escapeHTML(pb.SoLuong)})</option>`).join("");
      locPhongBan.innerHTML = `<option value="">Tất cả phòng ban</option>${luaChonPhongBan}`;

      const employeeDepartment = document.querySelector("#employee-department");
      if (employeeDepartment) {
        employeeDepartment.innerHTML = `<option value="">Chọn phòng ban</option>${danhSachPhongBan.map((pb) => `<option value="${escapeHTML(pb.MaPB)}">${escapeHTML(pb.TenPB)}</option>`).join("")}`;
      }

      const editDepartment = document.querySelector("#edit-department");
      if (editDepartment) {
        editDepartment.innerHTML = `<option value="">Chọn phòng ban</option>${danhSachPhongBan.map((pb) => `<option value="${escapeHTML(pb.MaPB)}">${escapeHTML(pb.TenPB)}</option>`).join("")}`;
      }
    }

    function renderThongKe() {
      const thongKe = thongKeNhanVien(dsNhanVienHienTai);
      const dem = window.HRMThuVien ? window.HRMThuVien.demLen : (node, giaTri) => { node.textContent = String(giaTri); };
      dem(document.querySelector("#thong-ke-tong"), thongKe.tong);
      dem(document.querySelector("#thong-ke-dang-lam"), thongKe.dangLam);
      dem(document.querySelector("#thong-ke-da-nghi"), thongKe.daNghi);
    }

    function renderAvatar(nhanVien) {
      const hoTen = escapeHTML(nhanVien.HoTen);
      if (laAnhDaiDien(nhanVien.HinhAnh)) {
        return `<img class="anh-dai-dien" src="${escapeHTML(nhanVien.HinhAnh)}" alt="Ảnh đại diện ${hoTen}" width="48" height="48" loading="lazy">`;
      }
      return `<span class="avatar-chu" aria-hidden="true">${escapeHTML(layChuCaiDau(nhanVien.HoTen))}</span>`;
    }

    function renderBangNhanVien(dsNhanVien, maMoi = "") {
      if (!dsNhanVien.length) {
        thanBangNhanVien.innerHTML = '<tr><td class="khong-co-du-lieu" data-cot="Kết quả" colspan="9">Không tìm thấy nhân viên phù hợp</td></tr>';
        return;
      }
      thanBangNhanVien.innerHTML = dsNhanVien.map((nhanVien) => {
        const trangThai = escapeHTML(nhanTrangThai(nhanVien.TrangThai));
        const maNV = escapeHTML(nhanVien.MaNV);
        return `<tr data-ma-nv="${maNV}"${nhanVien.MaNV === maMoi ? ' class="hang-moi"' : ''}>
          <td data-cot="Ảnh đại diện"><span class="avatar">${renderAvatar(nhanVien)}</span></td>
          <td data-cot="Mã NV">${maNV}</td>
          <td data-cot="Họ và tên"><span class="ten-nhan-vien"><strong>${escapeHTML(nhanVien.HoTen)}</strong><small>${escapeHTML(nhanVien.ChucVu)}</small></span></td>
          <td data-cot="Giới tính">${escapeHTML(nhanVien.GioiTinh)}</td>
          <td data-cot="Ngày sinh"><time datetime="${escapeHTML(nhanVien.NgaySinh)}">${escapeHTML(dinhDangNgay(nhanVien.NgaySinh))}</time></td>
          <td data-cot="Phòng ban">${escapeHTML(layTenPhongBan(dsPhongBanHienTai, nhanVien.MaPB))}</td>
          <td data-cot="Điện thoại"><a href="tel:${escapeHTML(nhanVien.DienThoai)}">${escapeHTML(nhanVien.DienThoai || "—")}</a></td>
          <td data-cot="Trạng thái"><span class="nhan nhan-${nhanVien.TrangThai === "DaNghi" ? "da-nghi" : "dang-lam"}">${trangThai}</span></td>
          <td data-cot="Thao tác">
            <div class="nhom-nut-thao-tac">
              <button class="nut nut-nho nut-vien nut-xem-ho-so" type="button" data-ma-nv="${maNV}" aria-label="Xem hồ sơ ${escapeHTML(nhanVien.HoTen)}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Xem hồ sơ nhanh"><i class="bi bi-eye" aria-hidden="true"></i> Xem</button>
              <button class="nut nut-nho nut-vien nut-sua" type="button" data-ma-nv="${maNV}" aria-label="Sửa hồ sơ ${escapeHTML(nhanVien.HoTen)}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Sửa hồ sơ nhân viên"><i class="bi bi-pencil-square" aria-hidden="true"></i> Sửa</button>
              ${nhanVien.TrangThai === "DangLam" ? `<button class="nut nut-nho nut-nguy-hiem nut-nghi-viec" type="button" data-ma-nv="${maNV}" aria-label="Cho nghỉ việc ${escapeHTML(nhanVien.HoTen)}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Cho nghỉ việc (kết thúc hợp đồng)"><i class="bi bi-person-dash" aria-hidden="true"></i> Nghỉ việc</button>` : ""}
            </div>
          </td>
        </tr>`;
      }).join("");
      if (window.HRMThuVien) window.HRMThuVien.khoiTaoTooltip(thanBangNhanVien);
    }

    let trangHienTai = 1;
    const soDongMoiTrang = 8;
    let danhSachDangLoc = [];

    function renderPhanTrang(tongSoTrang, hienTai) {
      const container = document.querySelector("#phan-trang-nhan-vien");
      if (!container) return;
      if (tongSoTrang <= 1) {
        container.innerHTML = "";
        return;
      }
      let htmlNut = "";
      for (let i = 1; i <= tongSoTrang; i++) {
        htmlNut += `<button type="button" class="nut-trang ${i === hienTai ? "kich-hoat" : ""}" data-trang="${i}">${i}</button>`;
      }
      container.innerHTML = `
        <div class="thong-tin-phan-trang">Trang ${hienTai} / ${tongSoTrang}</div>
        <div class="nhom-nut-phan-trang">
          <button type="button" class="nut-trang" id="nut-trang-truoc" ${hienTai === 1 ? "disabled" : ""}>&laquo;</button>
          ${htmlNut}
          <button type="button" class="nut-trang" id="nut-trang-sau" ${hienTai === tongSoTrang ? "disabled" : ""}>&raquo;</button>
        </div>
      `;

      container.querySelectorAll(".nut-trang[data-trang]").forEach((btn) => {
        btn.addEventListener("click", () => {
          trangHienTai = Number(btn.getAttribute("data-trang"));
          capNhatBang();
        });
      });
      container.querySelector("#nut-trang-truoc")?.addEventListener("click", () => {
        if (trangHienTai > 1) {
          trangHienTai--;
          capNhatBang();
        }
      });
      container.querySelector("#nut-trang-sau")?.addEventListener("click", () => {
        if (trangHienTai < tongSoTrang) {
          trangHienTai++;
          capNhatBang();
        }
      });
    }

    function capNhatBang() {
      const boLoc = { tuKhoa: oTimKiem.value, maPB: locPhongBan.value, trangThai: locTrangThai.value };
      danhSachDangLoc = locNhanVien(dsNhanVienHienTai, boLoc);
      const kq = phanTrang(danhSachDangLoc, trangHienTai, soDongMoiTrang);
      trangHienTai = kq.trangHienTai;
      renderBangNhanVien(kq.danhSachTrang);
      renderPhanTrang(kq.tongSoTrang, trangHienTai);
      dongKetQua.textContent = `Tìm thấy ${danhSachDangLoc.length} / ${dsNhanVienHienTai.length} nhân viên (Hiển thị ${kq.tuDong} - ${kq.denDong})`;
    }

    const nutXuatCSV = document.querySelector("#nut-xuat-excel-nv");
    nutXuatCSV.addEventListener("click", () => {
      const csv = xuatCSVNhanVien(dsNhanVienHienTai, dsPhongBanHienTai);
      const ngay = new Date().toISOString().slice(0, 10);
      taiTapTinVeMay(csv, `danh-sach-nhan-vien-${ngay}.csv`);
      hienThiToast("Đã xuất danh sách nhân viên ra CSV.", "thanh-cong");
    });

    const nutNhapCSV = document.querySelector("#nut-nhap-excel-nv");
    const fileNhapCSV = document.querySelector("#file-nhap-excel");
    const tomTatNhapCSV = document.querySelector("#ket-qua-nhap-csv");
    const loiNhapCSV = document.querySelector("#loi-nhap-csv");

    nutNhapCSV.addEventListener("click", () => fileNhapCSV.click());
    fileNhapCSV.addEventListener("change", async () => {
      const file = fileNhapCSV.files[0];
      if (!file) return;
      nutNhapCSV.disabled = true;
      loiNhapCSV.replaceChildren();
      loiNhapCSV.hidden = true;
      tomTatNhapCSV.textContent = "Đang đọc tệp CSV…";

      try {
        const noiDung = await file.text();
        const { nhanVienMoi, loi } = docCSVNhanVien(noiDung, dsNhanVienHienTai, dsPhongBanHienTai, ngayThamChieu);
        if (nhanVienMoi.length) {
          if (!await luuDuLieuHeThong([...dsNhanVienHienTai, ...nhanVienMoi])) {
            tomTatNhapCSV.textContent = "Chưa lưu được nhân viên từ tệp CSV.";
            return;
          }
          renderBoLoc();
          renderThongKe();
          capNhatBang();
        }
        tomTatNhapCSV.textContent = `Đã nhập ${nhanVienMoi.length} nhân viên. Bỏ qua ${loi.length} dòng có lỗi.`;
        for (const { soDong, thongBao } of loi) {
          const muc = document.createElement("li");
          muc.textContent = `Dòng ${soDong}: ${thongBao}`;
          loiNhapCSV.appendChild(muc);
        }
        loiNhapCSV.hidden = loi.length === 0;
      } catch (loi) {
        tomTatNhapCSV.textContent = loi.message || "Không thể đọc tệp CSV.";
      } finally {
        fileNhapCSV.value = "";
        nutNhapCSV.disabled = false;
      }
    });

    function xoaLoiForm() {
      document.querySelectorAll("#employee-form .thong-bao-loi").forEach((vungLoi) => { vungLoi.textContent = ""; });
      document.querySelectorAll("#employee-form [aria-invalid]").forEach((control) => { control.removeAttribute("aria-invalid"); });
    }

    function hienThiLoiForm(cacLoi) {
      const idLoi = { HoTen: "loi-ho-ten", NgaySinh: "loi-ngay-sinh", GioiTinh: "loi-gioi-tinh", CMND: "loi-cmnd", NgayCap: "loi-ngay-cap", NoiCap: "loi-noi-cap", QueQuan: "loi-que-quan", DienThoai: "loi-dien-thoai", MaPB: "loi-phong-ban", ChucVu: "loi-chuc-vu", TuNgayHD: "loi-contract-start", DenNgayHD: "loi-contract-end" };
      xoaLoiForm();
      cacLoi.forEach(({ truong, thongBao: noiDung }) => {
        const control = document.querySelector(`#employee-form [name="${truong}"]`) || document.querySelector(`#employee-form [name="${truong}"]:checked`);
        const vungLoi = document.querySelector(`#${idLoi[truong] || "loi-ma-nv"}`);
        if (control) {
          control.setAttribute("aria-invalid", "true");
          rungLoi(control);
        }
        if (vungLoi) vungLoi.textContent = noiDung;
      });
      const loiDau = cacLoi[0];
      const controlDau = loiDau ? document.querySelector(`#employee-form [name="${loiDau.truong}"]`) : null;
      if (controlDau) controlDau.focus();
    }

    function docDuLieuForm() {
      const checked = document.querySelector("#employee-form input[name=\"GioiTinh\"]:checked");
      return {
        MaNV: sinhMaNhanVien(dsNhanVienHienTai),
        HoTen: document.querySelector("#full-name").value.trim(),
        HinhAnh: anhThemBase64 || "",
        GioiTinh: checked ? checked.value : "",
        NgaySinh: document.querySelector("#birth-date").value,
        HonNhan: document.querySelector("#marital-status") ? document.querySelector("#marital-status").value : "Độc thân",
        CMND: document.querySelector("#cmnd").value.trim(),
        NgayCap: document.querySelector("#issue-date").value,
        NoiCap: document.querySelector("#issue-place").value.trim(),
        QueQuan: document.querySelector("#hometown").value.trim(),
        DiaChi: document.querySelector("#current-address") ? document.querySelector("#current-address").value.trim() : "",
        DienThoai: document.querySelector("#phone").value.trim(),
        Email: document.querySelector("#email").value.trim(),
        LoaiNV: "ChinhThuc",
        MaPB: document.querySelector("#employee-department").value,
        ChucVu: document.querySelector("#position").value.trim(),
        LuongDeXuat: Number(document.querySelector("#proposed-salary") ? document.querySelector("#proposed-salary").value : 0) || 10000000,
        LoaiHD: document.querySelector("#contract-type") ? document.querySelector("#contract-type").value : "KhongXacDinhThoiHan",
        TuNgayHD: (document.querySelector("#contract-start") && document.querySelector("#contract-start").value) || ngayThamChieu,
        DenNgayHD: (document.querySelector("#contract-end") && document.querySelector("#contract-end").value) || null,
        BangCap: document.querySelector("#education-level") ? document.querySelector("#education-level").value : "Đại học",
        ChuyenNganh: document.querySelector("#major") ? document.querySelector("#major").value.trim() : "",
        SucKhoe: document.querySelector("#health-status") ? document.querySelector("#health-status").value : "Loại I (Rất tốt)",
        NguoiPhuThuoc: Number(document.querySelector("#dependents-count") ? document.querySelector("#dependents-count").value : 0) || 0,
        HoanCanh: document.querySelector("#family-circumstance") ? document.querySelector("#family-circumstance").value.trim() : "Bình thường",
        MaQuanLyTrucTiep: ""
      };
    }

    let maNVHoSoDangXem = "";

    /** Gắn nội dung và liên kết tel:/mailto: cho các dòng liên hệ. */
    function capNhatLienHe(id, giaTri, tienTo) {
      const el = document.querySelector("#" + id);
      if (!el) return;
      if (giaTri) {
        el.textContent = giaTri;
        el.setAttribute("href", tienTo + giaTri);
      } else {
        el.textContent = "—";
        el.removeAttribute("href");
      }
    }

    function renderHoSo(maNV) {
      const hoSo = layHoSoNhanVien(maNV, dsNhanVienHienTai, dsPhongBanHienTai, LUONG_NHAN_VIEN, MUC_LUONG, dsHopDongHienTai, ngayThamChieu);
      if (!hoSo) return;
      const nv = hoSo.nhanVien;
      maNVHoSoDangXem = nv.MaNV;

      const capNhat = (id, val) => {
        const el = document.querySelector("#" + id);
        if (el) el.textContent = val;
      };

      capNhat("huong-dan-ho-so", "Đang xem hồ sơ được chọn.");
      capNhat("ho-so-ho-ten", nv.HoTen);
      capNhat("ho-so-chuc-vu-phu", `${nv.ChucVu || "Nhân viên"} • ${hoSo.TenPB}`);
      capNhat("ho-so-ma-nv", nv.MaNV);

      /* Chip tuổi tính theo ngày tham chiếu, ẩn khi thiếu ngày sinh hợp lệ. */
      const elTuoi = document.querySelector("#ho-so-tuoi");
      if (elTuoi) {
        const tuoi = tinhTuoi(nv.NgaySinh, ngayThamChieu);
        const coTuoi = Number.isFinite(tuoi) && tuoi > 0;
        elTuoi.hidden = !coTuoi;
        if (coTuoi) elTuoi.textContent = `${tuoi} tuổi`;
      }

      /* Badge trạng thái suy ra từ hợp đồng tại ngày tham chiếu. */
      const badgeTrangThai = document.querySelector("#ho-so-badge-trang-thai");
      if (badgeTrangThai) {
        const trangThai = suyRaTrangThai(nv.MaNV, dsHopDongHienTai, ngayThamChieu);
        badgeTrangThai.textContent = nhanTrangThai(trangThai);
        badgeTrangThai.classList.toggle("nhan-dang-lam", trangThai === "DangLam");
        badgeTrangThai.classList.toggle("nhan-da-nghi", trangThai !== "DangLam");
      }

      capNhat("ho-so-phong-ban", hoSo.TenPB);
      capNhat("ho-so-chuc-vu", nv.ChucVu || "—");
      capNhat("ho-so-gioi-tinh", nv.GioiTinh || "—");
      capNhat("ho-so-ngay-sinh", dinhDangNgay(nv.NgaySinh));
      capNhat("ho-so-hon-nhan", nv.HonNhan || "Độc thân");
      capNhat("ho-so-cmnd", nv.CMND || "—");
      capNhat("ho-so-ngay-cap", dinhDangNgay(nv.NgayCap));
      capNhat("ho-so-noi-cap", nv.NoiCap || "—");
      capNhat("ho-so-que-quan", nv.QueQuan || "—");
      capNhat("ho-so-dia-chi", nv.DiaChi || nv.QueQuan || "—");
      capNhatLienHe("ho-so-dien-thoai", nv.DienThoai || "", "tel:");
      capNhatLienHe("ho-so-email", nv.Email || "", "mailto:");
      const mucLuongHienThi = (hoSo.MucLuong && hoSo.MucLuong > 0) ? hoSo.MucLuong : (Number(nv.LuongDeXuat) || 10000000);
      capNhat("ho-so-muc-luong", `${dinhDangTien(mucLuongHienThi)}${!hoSo.MucLuong || hoSo.MucLuong <= 0 ? " (Lương đề xuất)" : ""}`);

      /* Hợp đồng lao động + cảnh báo sắp hết hạn (cửa sổ 60 ngày). */
      let chuHopDong = "Chưa có hợp đồng";
      let canhBaoHopDong = "";
      let hetHan = false;
      if (hoSo.HopDong) {
        chuHopDong = `${layTenLoaiHopDong(hoSo.HopDong.LoaiHD)} (Từ ${dinhDangNgay(hoSo.HopDong.TuNgay)}${hoSo.HopDong.DenNgay ? ` đến ${dinhDangNgay(hoSo.HopDong.DenNgay)}` : " - Không xác định thời hạn"})`;
        const mocHienTai = soNgayTuMoc(ngayThamChieu);
        const mocKetThuc = soNgayTuMoc(hoSo.HopDong.DenNgay);
        if (mocHienTai !== null && mocKetThuc !== null) {
          const soNgayConLai = mocKetThuc - mocHienTai;
          if (soNgayConLai < 0) {
            canhBaoHopDong = `Hợp đồng đã hết hạn ${Math.abs(soNgayConLai)} ngày (từ ${dinhDangNgay(hoSo.HopDong.DenNgay)}).`;
            hetHan = true;
          } else if (soNgayConLai <= 60) {
            canhBaoHopDong = `Hợp đồng sẽ hết hạn sau ${soNgayConLai} ngày (${dinhDangNgay(hoSo.HopDong.DenNgay)}).`;
          }
        }
      }
      capNhat("ho-so-hop-dong", chuHopDong);
      const elCanhBaoHopDong = document.querySelector("#ho-so-hop-dong-canh-bao");
      if (elCanhBaoHopDong) {
        elCanhBaoHopDong.hidden = !canhBaoHopDong;
        elCanhBaoHopDong.innerHTML = canhBaoHopDong
          ? `<i class="bi bi-exclamation-triangle" aria-hidden="true"></i> ${escapeHTML(canhBaoHopDong)}`
          : "";
        elCanhBaoHopDong.classList.toggle("het-han", hetHan);
      }

      capNhat("ho-so-bang-cap", nv.BangCap || "Đại học");
      capNhat("ho-so-chuyen-nganh", nv.ChuyenNganh || "Đúng chuyên môn");
      capNhat("ho-so-suc-khoe", nv.SucKhoe || "Loại I (Rất tốt)");
      capNhat("ho-so-hoan-canh", `${nv.NguoiPhuThuoc !== undefined ? nv.NguoiPhuThuoc : 0} người phụ thuộc${nv.HoanCanh ? ` (${nv.HoanCanh})` : ""}`);

      const hoSoAnh = document.querySelector("#ho-so-anh");
      const hoSoAvatarChu = document.querySelector("#ho-so-avatar-chu");
      if (hoSoAnh && hoSoAvatarChu) {
        const coAnh = laAnhDaiDien(nv.HinhAnh);
        hoSoAnh.hidden = !coAnh;
        hoSoAvatarChu.hidden = coAnh;
        if (coAnh) {
          hoSoAnh.src = nv.HinhAnh;
        } else {
          hoSoAvatarChu.textContent = layChuCaiDau(nv.HoTen);
        }
      }

      const dialogXem = document.querySelector("#dialog-xem-ho-so");
      if (dialogXem) {
        moDialog(dialogXem);
      }
    }

    const dialogXemHoSo = document.querySelector("#dialog-xem-ho-so");
    const nutDongXemHoSo = document.querySelector("#nut-dong-xem-ho-so");
    const nutInHoSo = document.querySelector("#nut-in-ho-so");
    const nutSuaHoSo = document.querySelector("#nut-sua-ho-so");
    if (nutDongXemHoSo && dialogXemHoSo) {
      nutDongXemHoSo.addEventListener("click", () => dongDialog(dialogXemHoSo));
    }
    if (nutSuaHoSo && dialogXemHoSo) {
      nutSuaHoSo.addEventListener("click", () => {
        if (!maNVHoSoDangXem) return;
        dongDialog(dialogXemHoSo);
        moSuaNhanVien(maNVHoSoDangXem);
      });
    }
    if (nutInHoSo) {
      nutInHoSo.addEventListener("click", () => {
        document.body.classList.add("che-do-in-ho-so");
        window.print();
        setTimeout(() => document.body.classList.remove("che-do-in-ho-so"), 500);
      });
    }

    /* Nút sao chép (mã NV, SĐT, email, CMND) — dùng Clipboard API, có dự phòng execCommand. */
    if (dialogXemHoSo) {
      dialogXemHoSo.querySelectorAll(".nut-copy").forEach((nut) => {
        nut.addEventListener("click", async () => {
          const dich = document.querySelector(`#${nut.dataset.copy}`);
          const giaTri = dich ? dich.textContent.trim() : "";
          if (!giaTri || giaTri === "—") return;
          try {
            if (navigator.clipboard && window.isSecureContext) {
              await navigator.clipboard.writeText(giaTri);
            } else {
              const oTam = document.createElement("textarea");
              oTam.value = giaTri;
              oTam.setAttribute("readonly", "");
              oTam.style.position = "fixed";
              oTam.style.opacity = "0";
              document.body.appendChild(oTam);
              oTam.select();
              document.execCommand("copy");
              oTam.remove();
            }
            hienThiToast(`Đã sao chép: ${giaTri}`, "thanh-cong");
          } catch (e) {
            hienThiToast("Không thể sao chép nội dung này.", "loi");
          }
        });
      });
    }

    /* Xử lý Thêm nhân viên qua Popup Dialog */
    const formNhanVien = document.querySelector("#employee-form form");

    if (nutThemNV) {
      nutThemNV.addEventListener("click", () => {
        formNhanVien.reset();
        anhThemBase64 = "";
        if (previewThem) previewThem.innerHTML = "";
        document.querySelector("#employee-id").value = sinhMaNhanVien(dsNhanVienHienTai);
        if (document.querySelector("#proposed-salary")) document.querySelector("#proposed-salary").value = "10000000";
        xoaLoiForm();
        moDialog(dialogThemNV);
        const fullNameInput = document.querySelector("#full-name");
        if (fullNameInput) fullNameInput.focus();
      });
    }

    if (nutDongThemNV) {
      nutDongThemNV.addEventListener("click", () => {
        anhThemBase64 = "";
        if (previewThem) previewThem.innerHTML = "";
        dongDialog(dialogThemNV);
        if (nutThemNV) nutThemNV.focus();
      });
    }

    formNhanVien.addEventListener("submit", async (suKien) => {
      suKien.preventDefault();
      const duLieu = docDuLieuForm();
      const cacLoi = kiemTraNhanVien(duLieu, dsNhanVienHienTai, dsPhongBanHienTai, ngayThamChieu);
      const loiHopDong = kiemTraKhoangHopDong(duLieu.TuNgayHD, duLieu.DenNgayHD);
      if (loiHopDong) cacLoi.push(loiHopDong);
      if (cacLoi.length) {
        hienThiLoiForm(cacLoi);
        thongBao.textContent = "Chưa thể lưu hồ sơ. Vui lòng kiểm tra các trường được đánh dấu.";
        return;
      }
      const hopDongMoi = {
        MaHD: sinhMaHopDong(dsHopDongHienTai),
        MaNV: duLieu.MaNV,
        LoaiHD: duLieu.LoaiHD,
        TuNgay: duLieu.TuNgayHD,
        DenNgay: duLieu.DenNgayHD || null
      };
      const dsHopDongMoi = [...dsHopDongHienTai, hopDongMoi];
      const TrangThai = suyRaTrangThai(duLieu.MaNV, dsHopDongMoi, ngayThamChieu);
      const dsNhanVienMoi = themNhanVien(dsNhanVienHienTai, { ...duLieu, TrangThai });
      if (!await luuDuLieuHeThong(dsNhanVienMoi, dsHopDongMoi)) return;
      dongDialog(dialogThemNV);
      if (nutThemNV) nutThemNV.focus();
      formNhanVien.reset();
      document.querySelector("#employee-id").value = sinhMaNhanVien(dsNhanVienHienTai);
      xoaLoiForm();
      renderBoLoc();
      renderThongKe();
      capNhatBang();
      thongBao.textContent = `Đã thêm nhân viên ${duLieu.HoTen} thành công.`;
      const hangMoi = thanBangNhanVien.querySelector(`[data-ma-nv="${duLieu.MaNV}"]`);
      if (hangMoi) {
        if (typeof hangMoi.scrollIntoView === "function") hangMoi.scrollIntoView({ block: "center" });
        const nutXem = hangMoi.querySelector(".nut-xem-ho-so");
        if (nutXem) nutXem.focus();
      }
    });

    /* Mở dialog Sửa nhân viên */
    function moSuaNhanVien(maNV) {
      const nv = dsNhanVienHienTai.find((x) => x.MaNV === maNV);
      if (!nv || !dialogSua) return;
      anhSuaBase64 = laAnhDaiDien(nv.HinhAnh) ? nv.HinhAnh : "";
      if (fileInputSua) fileInputSua.value = "";
      hienThiAnhXemTruoc(previewSua, anhSuaBase64, "Ảnh hiện tại");
      const hopDong = dsHopDongHienTai.filter((hd) => hd && hd.MaNV === maNV).sort((a, b) => (b.TuNgay || "").localeCompare(a.TuNgay || ""))[0];
      maHopDongDangSua = hopDong?.MaHD ?? null;

      document.querySelector("#edit-employee-id").value = nv.MaNV;
      document.querySelector("#edit-full-name").value = nv.HoTen || "";
      document.querySelector("#edit-birth-date").value = nv.NgaySinh || "";
      document.querySelector("#edit-gender").value = nv.GioiTinh || "Nam";
      if (document.querySelector("#edit-marital-status")) {
        document.querySelector("#edit-marital-status").value = nv.HonNhan || "Độc thân";
      }
      document.querySelector("#edit-cmnd").value = nv.CMND || "";
      document.querySelector("#edit-issue-date").value = nv.NgayCap || "";
      document.querySelector("#edit-issue-place").value = nv.NoiCap || "";
      document.querySelector("#edit-hometown").value = nv.QueQuan || "";
      if (document.querySelector("#edit-address")) {
        document.querySelector("#edit-address").value = nv.DiaChi || nv.QueQuan || "";
      }
      document.querySelector("#edit-phone").value = nv.DienThoai || "";
      document.querySelector("#edit-email").value = nv.Email || "";
      document.querySelector("#edit-department").value = nv.MaPB || "";
      document.querySelector("#edit-position").value = nv.ChucVu || "";
      if (document.querySelector("#edit-contract-type")) {
        document.querySelector("#edit-contract-type").value = hopDong ? quyDoiMaLoaiHD(hopDong.LoaiHD) : "KhongXacDinhThoiHan";
      }
      if (document.querySelector("#edit-contract-start")) {
        document.querySelector("#edit-contract-start").value = hopDong ? (hopDong.TuNgay || "") : "";
      }
      if (document.querySelector("#edit-contract-end")) {
        document.querySelector("#edit-contract-end").value = (hopDong && hopDong.DenNgay) ? hopDong.DenNgay : "";
      }
      if (document.querySelector("#edit-proposed-salary")) {
        document.querySelector("#edit-proposed-salary").value = nv.LuongDeXuat || 10000000;
      }
      if (document.querySelector("#edit-education-level")) {
        document.querySelector("#edit-education-level").value = nv.BangCap || "Đại học";
      }
      if (document.querySelector("#edit-major")) {
        document.querySelector("#edit-major").value = nv.ChuyenNganh || "";
      }
      if (document.querySelector("#edit-health-status")) {
        document.querySelector("#edit-health-status").value = nv.SucKhoe || "Loại I (Rất tốt)";
      }
      if (document.querySelector("#edit-dependents-count")) {
        document.querySelector("#edit-dependents-count").value = nv.NguoiPhuThuoc !== undefined ? nv.NguoiPhuThuoc : 0;
      }
      if (document.querySelector("#edit-family-circumstance")) {
        document.querySelector("#edit-family-circumstance").value = nv.HoanCanh || "Bình thường";
      }
      if (loiDialogSua) loiDialogSua.textContent = "";
      moDialog(dialogSua);
    }

    if (formSua) {
      formSua.addEventListener("submit", async (suKien) => {
        suKien.preventDefault();
        const maNV = document.querySelector("#edit-employee-id").value;
        const nvHienTai = dsNhanVienHienTai.find((x) => x.MaNV === maNV) || {};
        const thayDoi = {
          HoTen: document.querySelector("#edit-full-name").value.trim(),
          HinhAnh: anhSuaBase64 || "",
          GioiTinh: document.querySelector("#edit-gender").value,
          NgaySinh: document.querySelector("#edit-birth-date").value,
          HonNhan: document.querySelector("#edit-marital-status") ? document.querySelector("#edit-marital-status").value : (nvHienTai.HonNhan || "Độc thân"),
          CMND: document.querySelector("#edit-cmnd").value.trim(),
          NgayCap: document.querySelector("#edit-issue-date").value,
          NoiCap: document.querySelector("#edit-issue-place").value.trim(),
          QueQuan: document.querySelector("#edit-hometown").value.trim(),
          DiaChi: document.querySelector("#edit-address") ? document.querySelector("#edit-address").value.trim() : (nvHienTai.DiaChi || ""),
          DienThoai: document.querySelector("#edit-phone").value.trim(),
          Email: document.querySelector("#edit-email").value.trim(),
          MaPB: document.querySelector("#edit-department").value,
          ChucVu: document.querySelector("#edit-position").value.trim(),
          LuongDeXuat: Number(document.querySelector("#edit-proposed-salary") ? document.querySelector("#edit-proposed-salary").value : 0) || nvHienTai.LuongDeXuat || 10000000,
          BangCap: document.querySelector("#edit-education-level") ? document.querySelector("#edit-education-level").value : (nvHienTai.BangCap || "Đại học"),
          ChuyenNganh: document.querySelector("#edit-major") ? document.querySelector("#edit-major").value.trim() : (nvHienTai.ChuyenNganh || ""),
          SucKhoe: document.querySelector("#edit-health-status") ? document.querySelector("#edit-health-status").value : (nvHienTai.SucKhoe || "Loại I (Rất tốt)"),
          NguoiPhuThuoc: Number(document.querySelector("#edit-dependents-count") ? document.querySelector("#edit-dependents-count").value : 0) || 0,
          HoanCanh: document.querySelector("#edit-family-circumstance") ? document.querySelector("#edit-family-circumstance").value.trim() : (nvHienTai.HoanCanh || "Bình thường")
        };
        // Bỏ qua chính nhân viên đang sửa khi kiểm tra trùng CMND/điện thoại
        const dsKiemTra = dsNhanVienHienTai.filter((x) => x.MaNV !== maNV);
        const cacLoi = kiemTraNhanVien({ ...thayDoi, MaNV: maNV }, dsKiemTra, dsPhongBanHienTai, ngayThamChieu);
        if (cacLoi.length) {
          if (loiDialogSua) loiDialogSua.textContent = cacLoi[0].thongBao;
          return;
        }

        // Cập nhật hợp đồng tương ứng
        const loaiHDEdit = document.querySelector("#edit-contract-type") ? document.querySelector("#edit-contract-type").value : "KhongXacDinhThoiHan";
        const tuNgayHDEdit = document.querySelector("#edit-contract-start") ? document.querySelector("#edit-contract-start").value : "";
        const denNgayHDEdit = (document.querySelector("#edit-contract-end") && document.querySelector("#edit-contract-end").value) ? document.querySelector("#edit-contract-end").value : null;

        const dsHopDongMoi = [...dsHopDongHienTai];
        const viTriHD = dsHopDongMoi.findIndex((hd) => hd?.MaNV === maNV && hd.MaHD === maHopDongDangSua);
        const hopDong = dsHopDongMoi[viTriHD];
        if (hopDong || tuNgayHDEdit || denNgayHDEdit) {
          const tuNgay = tuNgayHDEdit || hopDong?.TuNgay;
          const loiHopDong = kiemTraKhoangHopDong(tuNgay, denNgayHDEdit);
          if (loiHopDong) {
            if (loiDialogSua) loiDialogSua.textContent = loiHopDong.thongBao;
            return;
          }
          const hopDongMoi = {
            ...hopDong,
            MaHD: hopDong?.MaHD || sinhMaHopDong(dsHopDongMoi),
            MaNV: maNV,
            LoaiHD: loaiHDEdit,
            TuNgay: tuNgay,
            DenNgay: denNgayHDEdit
          };
          if (viTriHD >= 0) dsHopDongMoi[viTriHD] = hopDongMoi;
          else dsHopDongMoi.push(hopDongMoi);
          const trangThai = suyRaTrangThai(maNV, dsHopDongMoi, ngayThamChieu);
          thayDoi.TrangThai = trangThai;
        }

        const dsNhanVienMoi = suaNhanVien(dsNhanVienHienTai, maNV, thayDoi);
        if (!await luuDuLieuHeThong(dsNhanVienMoi, dsHopDongMoi)) return;
        dongDialog(dialogSua);
        renderBoLoc();
        renderThongKe();
        capNhatBang();
        thongBao.textContent = `Đã cập nhật hồ sơ nhân viên ${thayDoi.HoTen}.`;
      });
    }

    if (nutDongSua) nutDongSua.addEventListener("click", () => dongDialog(dialogSua));

    /* Tự động tính hạn hợp đồng 6 tháng khi chọn Thực tập */
    const loaiHDThem = document.querySelector("#contract-type");
    const tuNgayThem = document.querySelector("#contract-start");
    const denNgayThem = document.querySelector("#contract-end");
    if (loaiHDThem && tuNgayThem && denNgayThem) {
      const tuDongSetHanThucTap = () => {
        if (loaiHDThem.value === "ThucTap" && tuNgayThem.value) {
          denNgayThem.value = congThang(tuNgayThem.value, 6);
        }
      };
      loaiHDThem.addEventListener("change", tuDongSetHanThucTap);
      tuNgayThem.addEventListener("change", () => {
        if (loaiHDThem.value === "ThucTap") tuDongSetHanThucTap();
      });
    }

    const loaiHDSua = document.querySelector("#edit-contract-type");
    const tuNgaySua = document.querySelector("#edit-contract-start");
    const denNgaySua = document.querySelector("#edit-contract-end");
    if (loaiHDSua && tuNgaySua && denNgaySua) {
      const tuDongSetHanThucTapSua = () => {
        if (loaiHDSua.value === "ThucTap" && tuNgaySua.value) {
          denNgaySua.value = congThang(tuNgaySua.value, 6);
        }
      };
      loaiHDSua.addEventListener("change", tuDongSetHanThucTapSua);
      tuNgaySua.addEventListener("change", () => {
        if (loaiHDSua.value === "ThucTap") tuDongSetHanThucTapSua();
      });
    }

    /* Xử lý Cho nghỉ việc qua Dialog: Kiểm tra điều kiện 1 năm 5 tháng (17 tháng) */
    function capNhatKiemTraNghiViec(maNV, ngayNghi) {
      const elNgayBD = document.querySelector("#nghi-ngay-bat-dau");
      const elThamNien = document.querySelector("#nghi-tham-nien");
      const elTinhTrang = document.querySelector("#nghi-tinh-trang-dieu-kien");
      const vungNgoaiLe = document.querySelector("#vung-ngoai-le-nghi");

      const kiemTra = kiemTraDieuKienNghiViec(dsHopDongHienTai, maNV, ngayNghi);
      if (nutXacNhanNghi) nutXacNhanNghi.disabled = !kiemTra.hopLe;
      if (elNgayBD) elNgayBD.textContent = dinhDangNgay(kiemTra.ngayBatDau);
      if (elThamNien) elThamNien.textContent = `${kiemTra.soThang} tháng`;

      if (elTinhTrang) {
        if (!kiemTra.hopLe) {
          elTinhTrang.textContent = `❌ ${kiemTra.thongBao}`;
          elTinhTrang.style.color = "var(--mau-loi, #ef4444)";
          if (vungNgoaiLe) vungNgoaiLe.hidden = true;
        } else if (kiemTra.duDieuKien) {
          elTinhTrang.textContent = `✓ Đủ điều kiện nghỉ việc (Đã làm việc ${kiemTra.soThang} tháng >= 17 tháng quy định).`;
          elTinhTrang.style.color = "var(--mau-thanh-cong, #10b981)";
          if (vungNgoaiLe) vungNgoaiLe.hidden = true;
        } else {
          elTinhTrang.textContent = `⚠️ CHƯA ĐỦ ĐIỀU KIỆN (Mới làm việc ${kiemTra.soThang}/17 tháng - Thiếu ${kiemTra.soThangThieu} tháng).`;
          elTinhTrang.style.color = "var(--mau-canh-bao, #f59e0b)";
          if (vungNgoaiLe) vungNgoaiLe.hidden = false;
        }
      }
    }

    function moXacNhanNghiViec(maNV) {
      const nv = dsNhanVienHienTai.find((x) => x.MaNV === maNV);
      if (!nv || !dialogNghi) return;
      maNVDangChonNghi = maNV;
      if (moTaNghi) moTaNghi.textContent = `Bạn có chắc chắn muốn cho nhân viên ${nv.HoTen} (${nv.MaNV}) thôi việc?`;
      if (ngayNghiInput) ngayNghiInput.value = ngayThamChieu;
      if (loiDialogNghi) loiDialogNghi.textContent = "";
      const chkNgoaiLe = document.querySelector("#xac-nhan-ngoai-le-nghi");
      if (chkNgoaiLe) chkNgoaiLe.checked = false;

      capNhatKiemTraNghiViec(maNV, ngayNghiInput ? ngayNghiInput.value : ngayThamChieu);
      moDialog(dialogNghi);
    }

    if (ngayNghiInput) {
      ngayNghiInput.addEventListener("input", () => {
        capNhatKiemTraNghiViec(maNVDangChonNghi, ngayNghiInput.value);
      });
    }

    if (formNghi) {
      formNghi.addEventListener("submit", async (suKien) => {
        suKien.preventDefault();
        const ngayNghi = ngayNghiInput ? ngayNghiInput.value : ngayThamChieu;
        const chkNgoaiLe = document.querySelector("#xac-nhan-ngoai-le-nghi");
        const boQuaDieuKien = chkNgoaiLe ? chkNgoaiLe.checked : false;

        const result = choNghiViec(dsHopDongHienTai, maNVDangChonNghi, ngayNghi, boQuaDieuKien);
        if (result.loi) {
          if (loiDialogNghi) loiDialogNghi.textContent = result.loi;
          return;
        }
        const trangThai = suyRaTrangThai(maNVDangChonNghi, result.ketQua, ngayThamChieu);
        const dsNhanVienMoi = suaNhanVien(dsNhanVienHienTai, maNVDangChonNghi, { TrangThai: trangThai });
        if (!await luuDuLieuHeThong(dsNhanVienMoi, result.ketQua)) return;
        dongDialog(dialogNghi);
        renderThongKe();
        capNhatBang();
        const thongBaoNghi = `Hợp đồng của ${maNVDangChonNghi} kết thúc vào ngày ${dinhDangNgay(ngayNghi)}.`;
        hienThiToast(thongBaoNghi, "thanh-cong");
        thongBao.textContent = thongBaoNghi;
      });
    }

    if (nutDongNghi) nutDongNghi.addEventListener("click", () => dongDialog(dialogNghi));

    /* Khôi phục dữ liệu mẫu */
    if (nutKhoiPhucMau) {
      nutKhoiPhucMau.addEventListener("click", () => moDialog(dialogKhoiPhuc));
    }
    if (formKhoiPhuc) {
      formKhoiPhuc.addEventListener("submit", async (suKien) => {
        suKien.preventDefault();
        try {
          duLieuKho = await khoDuLieu.khoiPhucMau();
          dsNhanVienHienTai = [...duLieuKho.dsNhanVien];
          dsPhongBanHienTai = [...duLieuKho.dsPhongBan];
          dsHopDongHienTai = [...duLieuKho.dsHopDong];
          dsChucVuHienTai = [...duLieuKho.dsChucVu];
          dongDialog(dialogKhoiPhuc);
          renderBoLoc();
          renderThongKe();
          document.querySelector("#employee-id").value = sinhMaNhanVien(dsNhanVienHienTai);
          capNhatBang();
          thongBao.textContent = "Đã khôi phục toàn bộ dữ liệu mẫu ban đầu.";
        } catch (loi) {
          hienThiToast(loi.message, "loi");
        }
      });
    }
    if (nutHuyKhoiPhuc) nutHuyKhoiPhuc.addEventListener("click", () => dongDialog(dialogKhoiPhuc));

    /* Event delegation trên bảng */
    thanBangNhanVien.addEventListener("click", (suKien) => {
      const nut = suKien.target.closest("button");
      if (!nut) return;
      const maNV = nut.dataset.maNv;
      if (nut.classList.contains("nut-xem-ho-so")) renderHoSo(maNV);
      if (nut.classList.contains("nut-sua")) moSuaNhanVien(maNV);
      if (nut.classList.contains("nut-nghi-viec")) moXacNhanNghiViec(maNV);
    });

    formLoc.addEventListener("submit", (suKien) => { suKien.preventDefault(); capNhatBang(); });
    formLoc.addEventListener("reset", () => { oTimKiem.value = ""; locPhongBan.value = ""; locTrangThai.value = ""; capNhatBang(); });
    oTimKiem.addEventListener("input", capNhatBang);
    locPhongBan.addEventListener("change", capNhatBang);
    locTrangThai.addEventListener("change", capNhatBang);

    renderBoLoc();
    renderThongKe();
    document.querySelector("#employee-id").value = sinhMaNhanVien(dsNhanVienHienTai);

    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get("q");
    if (qParam && oTimKiem) {
      oTimKiem.value = qParam;
    }
    capNhatBang();
  }
})();
