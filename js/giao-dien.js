/* Tiện ích giao diện dùng chung giữa các trang. */

document.addEventListener("DOMContentLoaded", () => {
  khoiTaoThuGonSidebar();
  khoiTaoHeaderGlobal();
});

/** Hiển thị thông báo Toast góc màn hình */
function hienThiToast(tinNhan, loai = "thanh-cong") {
  const vungHienThi = document.querySelector("dialog[open]") || document.body;
  let vungToast = vungHienThi.querySelector(":scope > .vung-toast");
  if (!vungToast) {
    vungToast = document.createElement("div");
    vungToast.className = "vung-toast";
    vungToast.setAttribute("aria-live", "polite");
    vungHienThi.appendChild(vungToast);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${loai}`;
  toast.innerHTML = `
    <div class="toast-noi-dung">${escapeHTML(tinNhan)}</div>
    <button type="button" class="toast-nut-dong" aria-label="Đóng">&times;</button>
  `;
  const nutDong = toast.querySelector(".toast-nut-dong");
  const dongToast = () => {
    toast.classList.add("toast-an");
    setTimeout(() => toast.remove(), 300);
  };
  nutDong.addEventListener("click", dongToast);
  vungToast.appendChild(toast);
  setTimeout(dongToast, 3500);
}

async function luuThayDoi(duLieu) {
  try {
    await khoDuLieu.luuDuLieu(duLieu);
    return true;
  } catch (loi) {
    hienThiToast(loi.message, "loi");
    return false;
  }
}

/** Bộ điều khiển thu gọn / mở rộng Sidebar trên toàn bộ hệ thống */
function khoiTaoThuGonSidebar() {
  const nutThuGon = document.querySelector("#nut-thu-gon-sidebar");
  if (!nutThuGon) return;
  const KHOA_SIDEBAR = "hrm-sidebar-collapsed";
  try {
    if (localStorage.getItem(KHOA_SIDEBAR) === "true") {
      document.body.classList.add("sidebar-thu-gon");
      nutThuGon.setAttribute("aria-expanded", "false");
    }
  } catch (e) {}

  nutThuGon.addEventListener("click", () => {
    const isCollapsed = document.body.classList.toggle("sidebar-thu-gon");
    nutThuGon.setAttribute("aria-expanded", String(!isCollapsed));
    try {
      localStorage.setItem(KHOA_SIDEBAR, String(isCollapsed));
    } catch (e) {}
  });
}

/** Trợ giúp mở dialog an toàn trên mọi môi trường (kể cả JSDOM).
    Có hiệu ứng trượt lên (Animate.css) nếu thư viện đã tải. */
function moDialog(dialogNode) {
  if (!dialogNode) return;
  if (typeof dialogNode.showModal === "function") {
    dialogNode.showModal();
  } else {
    dialogNode.setAttribute("open", "");
  }
  const giamChuyenDong = window.HRMThuVien && window.HRMThuVien.giamChuyenDong();
  if (typeof dialogNode.classList?.add === "function" && !giamChuyenDong) {
    dialogNode.classList.add("animate__animated", "animate__fadeInUp");
    dialogNode.addEventListener("animationend", () => {
      dialogNode.classList.remove("animate__animated", "animate__fadeInUp");
    }, { once: true });
  }
}

/** Trợ giúp đóng dialog an toàn */
function dongDialog(dialogNode) {
  if (!dialogNode) return;
  if (typeof dialogNode.close === "function") {
    dialogNode.close();
  } else {
    dialogNode.removeAttribute("open");
  }
}

/** Rung nhẹ ô nhập liệu khi validation thất bại (Animate.css shakeX). */
function rungLoi(truong) {
  if (!truong || typeof truong.classList?.add !== "function") return;
  if (window.HRMThuVien && window.HRMThuVien.giamChuyenDong()) return;
  truong.classList.add("bo-rung", "animate__animated", "animate__shakeX");
  truong.addEventListener("animationend", () => {
    truong.classList.remove("bo-rung", "animate__animated", "animate__shakeX");
  }, { once: true });
}

function ngayThamChieuDemo() {
  if (typeof CAU_HINH !== "undefined" && CAU_HINH.NGAY_THAM_CHIEU_DEMO) {
    return CAU_HINH.NGAY_THAM_CHIEU_DEMO;
  }
  const homNay = new Date();
  return `${homNay.getFullYear()}-${String(homNay.getMonth() + 1).padStart(2, "0")}-${String(homNay.getDate()).padStart(2, "0")}`;
}

/* Menu "Dữ liệu" trên header đã chuyển sang Bootstrap Dropdown
   (data-bs-toggle="dropdown") — bundle JS tự lo mở/đóng/Escape/click ngoài. */

function khoiTaoHeaderGlobal() {
  // 1. Sao lưu JSON
  const nutBackupList = document.querySelectorAll("#nut-backup-json");
  nutBackupList.forEach((nut) => {
    nut.addEventListener("click", () => {
      if (typeof khoDuLieu === "undefined") return;
      try {
        const duLieu = khoDuLieu.layDuLieuSaoLuu();
        const chuoiJSON = JSON.stringify(duLieu, null, 2);
        const ngay = new Date().toISOString().slice(0, 10);
        taiTapTinVeMay(chuoiJSON, `hrm-backup-${ngay}.json`, "application/json;charset=utf-8;");
        hienThiToast("Đã sao lưu toàn bộ dữ liệu hệ thống ra tệp JSON!", "thanh-cong");
      } catch (loi) {
        hienThiToast(`Không thể sao lưu dữ liệu: ${loi.message}`, "loi");
      }
    });
  });

  // 2. Khôi phục JSON
  const fileRestore = document.querySelector("#file-restore-json");
  const nutRestoreList = document.querySelectorAll("#nut-restore-json");
  nutRestoreList.forEach((nut) => {
    nut.addEventListener("click", () => {
      if (fileRestore) fileRestore.click();
    });
  });

  if (fileRestore) {
    fileRestore.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (re) => {
        try {
          const duLieuMoi = khoDuLieu.chuanBiKhoiPhuc(JSON.parse(re.target.result));
          if (!confirm("Khôi phục sẽ ghi đè toàn bộ dữ liệu trong hệ thống bằng nội dung tệp JSON đã chọn. Bạn có chắc chắn muốn khôi phục?")) return;
          await khoDuLieu.khoiPhucTuTep(duLieuMoi);
          location.reload();
        } catch (err) {
          alert("Không thể khôi phục dữ liệu: " + err.message);
        }
      };
      reader.readAsText(file, "UTF-8");
      fileRestore.value = "";
    });
  }

  // 3. Tìm kiếm toàn cục (Live search dropdown autocomplete)
  const formSearch = document.querySelector("#global-search-form");
  const inputSearch = document.querySelector("#global-search");
  const liveResults = document.querySelector("#live-search-results");

  if (inputSearch && liveResults) {
    const handleSearch = () => {
      const q = inputSearch.value.trim().toLowerCase();
      if (!q) {
        liveResults.innerHTML = "";
        liveResults.hidden = true;
        return;
      }
      if (typeof khoDuLieu === "undefined") return;
      const data = khoDuLieu.layDuLieu();

      const dsNV = (data.dsNhanVien || []).filter((nv) =>
        (nv.HoTen && nv.HoTen.toLowerCase().includes(q)) ||
        (nv.MaNV && nv.MaNV.toLowerCase().includes(q)) ||
        (nv.DienThoai && nv.DienThoai.includes(q))
      ).slice(0, 5);

      const dsPB = (data.dsPhongBan || []).filter((pb) =>
        (pb.TenPB && pb.TenPB.toLowerCase().includes(q)) ||
        (pb.MaPB && pb.MaPB.toLowerCase().includes(q))
      ).slice(0, 3);

      const dsCV = (data.dsChucVu || []).filter((cv) =>
        (cv.TenChucVu && cv.TenChucVu.toLowerCase().includes(q)) ||
        (cv.MaChucVu && cv.MaChucVu.toLowerCase().includes(q))
      ).slice(0, 3);

      if (!dsNV.length && !dsPB.length && !dsCV.length) {
        liveResults.innerHTML = '<div class="search-empty">Không tìm thấy kết quả phù hợp</div>';
        liveResults.hidden = false;
        return;
      }

      let html = "";
      if (dsNV.length) {
        html += '<div class="search-group-title">Nhân viên</div>';
        dsNV.forEach((nv) => {
          const avatarHtml = laAnhDaiDien(nv.HinhAnh)
            ? `<img src="${escapeHTML(nv.HinhAnh)}" class="search-item-avatar" alt="">`
            : `<span class="search-item-avatar">${escapeHTML(layChuCaiDau(nv.HoTen))}</span>`;
          html += `
            <a href="nhan-vien.html?q=${encodeURIComponent(nv.MaNV)}" class="search-item">
              ${avatarHtml}
              <div class="search-item-info">
                <span class="search-item-main">${escapeHTML(nv.HoTen)} (${escapeHTML(nv.MaNV)})</span>
                <span class="search-item-sub">${escapeHTML(nv.ChucVu || "Nhân viên")} • ${escapeHTML(layTenPhongBan(data.dsPhongBan, nv.MaPB))}</span>
              </div>
            </a>
          `;
        });
      }

      if (dsPB.length) {
        html += '<div class="search-group-title">Phòng ban</div>';
        dsPB.forEach((pb) => {
          html += `
            <a href="phong-ban.html" class="search-item">
              <span class="search-item-avatar search-avatar-phong-ban">PB</span>
              <div class="search-item-info">
                <span class="search-item-main">${escapeHTML(pb.TenPB)}</span>
                <span class="search-item-sub">Mã: ${escapeHTML(pb.MaPB)}</span>
              </div>
            </a>
          `;
        });
      }

      if (dsCV.length) {
        html += '<div class="search-group-title">Chức vụ</div>';
        dsCV.forEach((cv) => {
          html += `
            <a href="chuc-vu.html" class="search-item">
              <span class="search-item-avatar search-avatar-chuc-vu">CV</span>
              <div class="search-item-info">
                <span class="search-item-main">${escapeHTML(cv.TenChucVu)}</span>
                <span class="search-item-sub">Mã: ${escapeHTML(cv.MaChucVu)}</span>
              </div>
            </a>
          `;
        });
      }

      liveResults.innerHTML = html;
      liveResults.hidden = false;
    };

    inputSearch.addEventListener("input", handleSearch);
    inputSearch.addEventListener("focus", handleSearch);

    document.addEventListener("click", (e) => {
      if (!inputSearch.contains(e.target) && !liveResults.contains(e.target)) {
        liveResults.hidden = true;
      }
    });

    inputSearch.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        liveResults.hidden = true;
      }
    });

    if (formSearch) {
      formSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = inputSearch.value.trim();
        if (q) {
          window.location.href = `nhan-vien.html?q=${encodeURIComponent(q)}`;
        }
      });
    }
  }
}
