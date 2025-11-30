/**
 * script.js (Logic JavaScript - Đã Việt hóa)
 * Chứa logic Giỏ hàng, Scroll, Carousel, Form và Đăng nhập Local Storage
 */

// ------------------------------------
// A. LOGIC CHUNG: TIỀN TỆ & GIỎ HÀNG (Cart)
// ------------------------------------

// Hàm định dạng số sang tiền tệ Việt Nam Đồng (VND)
function formatVND(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '0₫';
    return amount.toLocaleString('vi-VN') + '₫';
}
window.formatVND = formatVND; 

// Hàm lấy dữ liệu giỏ hàng hiện tại từ Local Storage
function layDuLieuGioHang() {
    const gioHangJSON = localStorage.getItem('shopping_cart');
    if (gioHangJSON) {
        return JSON.parse(gioHangJSON);
    }
    // Dữ liệu mẫu ban đầu (Nếu Local Storage trống)
    return []; 
}

// Hàm lưu dữ liệu giỏ hàng vào Local Storage
function luuDuLieuGioHang(gioHangMoi) {
    localStorage.setItem('shopping_cart', JSON.stringify(gioHangMoi));
}

function tinhTongGioHang(items) {
    let tongCong = 0;
    let tongSoLuong = 0;
    items.forEach(item => {
        tongCong += item.gia * item.soLuong;
        tongSoLuong += item.soLuong;
    });
    return { tongCong, tongSoLuong };
}

function taoHTMLSanPhamGioHang(item) {
    return `
        <div class="san-pham-gio-hang flex items-center space-x-3 pb-3 border-b" data-id="${item.id}">
            <img
                src="${item.img}"
                alt="Ảnh bìa sách"
                class="w-14 h-20 object-cover rounded"
            />
            <div class="flex-1">
                <h5 class="text-sm font-medium">${item.ten}</h5>
                <p class="text-xs text-gray-medium">${item.tacGia}</p>
                <div class="flex justify-between items-center mt-1">
                    <span class="gia-san-pham text-secondary font-medium">${formatVND(item.gia)}</span>
                    <div class="flex items-center space-x-1">
                        <input 
                            type="number" 
                            min="1" 
                            value="${item.soLuong}" 
                            data-id="${item.id}"
                            class="input-so-luong w-10 text-center text-xs border border-gray-300 rounded"
                            onchange="capNhatSoLuongGioHang(this.dataset.id, parseInt(this.value))"
                        />
                        <button class="text-red-500 hover:text-red-700 text-sm" onclick="xoaKhoiGio('${item.id}')">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Hàm Thêm sản phẩm vào giỏ hàng
function themVaoGio(productId, ten, gia, img, tacGia) {
    const gioHang = layDuLieuGioHang();
    const sanPhamHienTai = gioHang.find(item => item.id === productId);

    if (sanPhamHienTai) {
        sanPhamHienTai.soLuong += 1;
    } else {
        gioHang.push({ id: productId, ten: ten, gia: gia, soLuong: 1, img: img, tacGia: tacGia });
    }

    luuDuLieuGioHang(gioHang);
    capNhatHienThiGioHang();
    alert(`Đã thêm "${ten}" vào giỏ hàng!`);
}

// Hàm Cập nhật số lượng sản phẩm
function capNhatSoLuongGioHang(productId, newQuantity) {
    let gioHang = layDuLieuGioHang();
    const index = gioHang.findIndex(item => item.id === productId);

    if (index !== -1 && newQuantity > 0) {
        gioHang[index].soLuong = newQuantity;
        luuDuLieuGioHang(gioHang);
    } else if (newQuantity <= 0) {
        xoaKhoiGio(productId);
        return;
    }

    capNhatHienThiGioHang();
}

// Hàm Xóa sản phẩm khỏi giỏ hàng
function xoaKhoiGio(productId) {
    let gioHang = layDuLieuGioHang();
    gioHang = gioHang.filter(item => item.id !== productId);
    
    luuDuLieuGioHang(gioHang);
    capNhatHienThiGioHang();
}

// Hàm cập nhật hiển thị giỏ hàng (chạy sau mỗi thao tác)
function capNhatHienThiGioHang() {
    const gioHangHienTai = layDuLieuGioHang();
    const { tongCong, tongSoLuong } = tinhTongGioHang(gioHangHienTai);

    const demSoLuong = document.getElementById('dem-so-luong-gio-hang');
    const tongTienHienThi = document.querySelector('.tong-tien-hien-thi');
    const danhSachSanPham = document.getElementById('danh-sach-san-pham-gio-hang');

    if (demSoLuong) demSoLuong.textContent = tongSoLuong;
    if (tongTienHienThi) tongTienHienThi.textContent = formatVND(tongCong);
    
    if (danhSachSanPham) {
        danhSachSanPham.innerHTML = gioHangHienTai.map(taoHTMLSanPhamGioHang).join('');
    }
}


// ------------------------------------
// B. LOGIC ĐĂNG KÝ VÀ ĐĂNG NHẬP (Local Storage)
// ------------------------------------

function dangKyTaiKhoan(ten, matKhau) {
    const taiKhoanDaTonTai = localStorage.getItem('user_' + ten);
    if (taiKhoanDaTonTai) {
        alert('Tên người dùng đã tồn tại!');
        return false;
    }
    
    const userData = { matKhau: matKhau };
    localStorage.setItem('user_' + ten, JSON.stringify(userData));
    
    alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
    return true;
}

function dangNhapTaiKhoan(ten, matKhau) {
    const userString = localStorage.getItem('user_' + ten);
    
    if (!userString) {
        alert('Tên người dùng không tồn tại.');
        return false;
    }
    
    const userData = JSON.parse(userString);
    
    if (userData.matKhau === matKhau) {
        localStorage.setItem('current_user', ten);
        capNhatTrangThaiTaiKhoan();
        alert('Đăng nhập thành công!');
        return true;
    } else {
        alert('Mật khẩu không chính xác.');
        return false;
    }
}

function dangXuatTaiKhoan() {
    localStorage.removeItem('current_user');
    capNhatTrangThaiTaiKhoan();
    alert('Bạn đã đăng xuất.');
}

function hienThiFormDangKy() {
    const khuVucTaiKhoan = document.getElementById('khu-vuc-tai-khoan');
    
    if (!khuVucTaiKhoan) return;
    
    // Thay thế nội dung header bằng form Đăng ký tạm thời
    khuVucTaiKhoan.innerHTML = `
        <div class="relative group pt-5">
            <button class="flex items-center space-x-1 text-gray-dark hover:text-primary transition-colors">
                <i class="fa fa-user-plus text-xl"></i>
                <span>Đăng ký tài khoản</span>
            </button>
            <div id="form-dang-ky-dropdown" class="absolute right-0 mt-0 w-64 bg-white rounded-lg shadow-lg p-4 block z-50">
                <h4 class="font-medium mb-3 text-primary">Tạo tài khoản</h4>
                <form id="form-dang-ky">
                    <div class="mb-3">
                        <input type="text" id="register-ten" placeholder="Tên người dùng" class="w-full px-4 py-2 border border-gray-200 rounded-md form-input-focus" required>
                    </div>
                    <div class="mb-4">
                        <input type="password" id="register-matkhau" placeholder="Mật khẩu" class="w-full px-4 py-2 border border-gray-200 rounded-md form-input-focus" required>
                    </div>
                    <button type="submit" class="w-full btn-chinh">Đăng ký</button>
                </form>
                <button id="nut-quay-lai-dang-nhap" class="w-full btn-vien mt-2">Quay lại Đăng nhập</button>
            </div>
        </div>
    `;

    document.getElementById('form-dang-ky')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const ten = document.getElementById('register-ten').value;
        const matKhau = document.getElementById('register-matkhau').value;
        if (dangKyTaiKhoan(ten, matKhau)) {
             capNhatTrangThaiTaiKhoan();
        }
    });
    
    document.getElementById('nut-quay-lai-dang-nhap')?.addEventListener('click', capNhatTrangThaiTaiKhoan);
}

function capNhatTrangThaiTaiKhoan() {
    const tenNguoiDung = localStorage.getItem('current_user');
    const khuVucTaiKhoan = document.getElementById('khu-vuc-tai-khoan');
    
    if (!khuVucTaiKhoan) return;
    
    if (tenNguoiDung) {
        // TRẠNG THÁI: Đã Đăng nhập
        khuVucTaiKhoan.innerHTML = `
            <div class="relative group pt-5">
                <button class="flex items-center space-x-1 text-gray-dark hover:text-primary transition-colors">
                    <i class="fa fa-user-circle text-xl"></i>
                    <span>Xin chào, ${tenNguoiDung}</span>
                </button>
                <div class="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg p-3 hidden group-hover:block z-50">
                    <button id="nut-dang-xuat" class="w-full btn-vien">Đăng xuất</button>
                    <a href="#" class="block text-sm text-gray-medium mt-2 hover:text-primary">Thông tin tài khoản</a>
                </div>
            </div>
        `;
        document.getElementById('nut-dang-xuat')?.addEventListener('click', dangXuatTaiKhoan);
        
    } else {
        // TRẠNG THÁI: Chưa Đăng nhập (Hiển thị Form Đăng nhập)
        khuVucTaiKhoan.innerHTML = `
            <div class="relative group pt-5">
                <button class="flex items-center space-x-1 text-gray-dark hover:text-primary transition-colors">
                    <i class="fa fa-user text-xl"></i>
                    <span>Đăng nhập/Đăng Ký</span>
                </button>
                <div id="tuy-chon-dang-nhap" class="absolute right-0 mt-0 w-64 bg-white rounded-lg shadow-lg p-4 hidden group-hover:block z-50">
                    <h4 class="font-medium mb-3">Đăng nhập</h4>
                    <form id="form-dang-nhap">
                        <div class="mb-3">
                            <input type="text" id="login-ten" placeholder="Tên người dùng" class="w-full px-4 py-2 border border-gray-200 rounded-md form-input-focus" required>
                        </div>
                        <div class="mb-4">
                            <input type="password" id="login-matkhau" placeholder="Mật khẩu" class="w-full px-4 py-2 border border-gray-200 rounded-md form-input-focus" required>
                        </div>
                        <button type="submit" class="w-full btn-chinh">Đăng nhập</button>
                    </form>
                    
                    <div class="relative my-4">
                        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
                        <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-2 text-gray-medium">hoặc</span></div>
                    </div>

                    <button id="nut-hien-thi-dang-ky" class="w-full btn-vien">Tạo tài khoản mới</button>
                </div>
            </div>
        `;
        
        document.getElementById('form-dang-nhap')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const ten = document.getElementById('login-ten').value;
            const matKhau = document.getElementById('login-matkhau').value;
            dangNhapTaiKhoan(ten, matKhau);
        });

        document.getElementById('nut-hien-thi-dang-ky')?.addEventListener('click', hienThiFormDangKy);
    }
}


// ------------------------------------
// C. LOGIC CAROUSEL (Chỉ cho index.html)
// ------------------------------------

function khoiTaoCarousel() {
    const phanTuBanner = document.querySelectorAll('.carousel-item');
    const cacChiBao = document.querySelectorAll('#vong-quay-banner button');
    const nutLui = document.getElementById('nut-lui');
    const nutToi = document.getElementById('nut-toi');
    const vongQuay = document.getElementById('vong-quay-banner');
    
    if (!vongQuay) return; 

    let chiSoHienTai = 0;
    let chuKyTuDong;
    const thoiGianChuyenSlide = 5000;

    function capNhatSlide(index) {
        if (phanTuBanner.length === 0) return;
        
        if (phanTuBanner.length > chiSoHienTai) {
            phanTuBanner[chiSoHienTai].classList.remove('opacity-100');
            phanTuBanner[chiSoHienTai].classList.add('opacity-0');
        }
        if (cacChiBao.length > chiSoHienTai) {
            cacChiBao[chiSoHienTai].classList.remove('opacity-100');
            cacChiBao[chiSoHienTai].classList.add('opacity-50');
        }
        
        chiSoHienTai = index;
        
        if (phanTuBanner.length > chiSoHienTai) {
            phanTuBanner[chiSoHienTai].classList.remove('opacity-0');
            phanTuBanner[chiSoHienTai].classList.add('opacity-100');
        }
        if (cacChiBao.length > chiSoHienTai) {
            cacChiBao[chiSoHienTai].classList.remove('opacity-50');
            cacChiBao[chiSoHienTai].classList.add('opacity-100');
        }
    }

    function chuyenSlideTiepTheo() {
        let indexMoi = (chiSoHienTai + 1) % phanTuBanner.length;
        capNhatSlide(indexMoi);
    }
    
    function chuyenSlideTruocDo() {
        let indexMoi = (chiSoHienTai - 1 + phanTuBanner.length) % phanTuBanner.length;
        capNhatSlide(indexMoi);
    }

    function batDauVongQuay() {
        clearInterval(chuKyTuDong);
        chuKyTuDong = setInterval(chuyenSlideTiepTheo, thoiGianChuyenSlide);
    }

    if (cacChiBao.length > 0) {
        cacChiBao.forEach((chiBao, index) => {
            chiBao.addEventListener('click', () => {
                clearInterval(chuKyTuDong);
                capNhatSlide(index);
                batDauVongQuay();
            });
        });
    }

    if (nutLui) {
        nutLui.addEventListener('click', () => {
            clearInterval(chuKyTuDong);
            chuyenSlideTruocDo();
            batDauVongQuay();
        });
    }
    
    if (nutToi) {
        nutToi.addEventListener('click', () => {
            clearInterval(chuKyTuDong);
            chuyenSlideTiepTheo();
            batDauVongQuay();
        });
    }

    vongQuay.addEventListener('mouseenter', () => clearInterval(chuKyTuDong));
    vongQuay.addEventListener('mouseleave', batDauVongQuay);

    capNhatSlide(0);
    batDauVongQuay();
}


// ------------------------------------
// D. LOGIC SCROLL VÀ HEADER (Chung)
// ------------------------------------

function khoiTaoChucNangScroll() {
    const nutCuonLenDau = document.getElementById('nut-cuon-len-dau');
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        // Nút Cuộn Lên Đầu Trang
        if (nutCuonLenDau) {
            if (window.pageYOffset > 300) {
                nutCuonLenDau.classList.remove('opacity-0', 'invisible');
                nutCuonLenDau.classList.add('opacity-100', 'visible');
            } else {
                nutCuonLenDau.classList.remove('opacity-100', 'visible');
                nutCuonLenDau.classList.add('opacity-0', 'invisible');
            }
        }
        
        // Hiệu ứng cuộn cho Header
        if (header) {
            if (window.pageYOffset > 100) {
                header.classList.add('py-2', 'shadow');
            } else {
                header.classList.remove('py-2', 'shadow');
            }
        }
    });
    
    if (nutCuonLenDau) {
        nutCuonLenDau.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}


// ------------------------------------
// E. LOGIC RIÊNG CHO TRANG BÁN SÁCH (index1.html)
// ------------------------------------

function khoiTaoChucNangBanSach() {
    const modalThongBaoThanhCong = document.getElementById("modalThongBaoThanhCong");
    const nutDongModal = document.getElementById("dongModal");
    const bieuMauDangBanSach = document.getElementById("bieuMauDangBanSach");
    const inputAnhSach = document.getElementById('anhSach');
    const khuVucXemTruocAnh = document.getElementById('xemTruocAnh');
    
    // Xử lý Form Đăng Bán
    if (bieuMauDangBanSach) {
        bieuMauDangBanSach.addEventListener("submit", function (e) {
            e.preventDefault();
            if (modalThongBaoThanhCong) {
                modalThongBaoThanhCong.classList.remove("hidden");
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
        });
    }

    // Đóng Modal và reset Form
    if (nutDongModal) {
        nutDongModal.addEventListener("click", function () {
            if (modalThongBaoThanhCong) modalThongBaoThanhCong.classList.add("hidden");
            if (bieuMauDangBanSach) bieuMauDangBanSach.reset();
        });
    }

    // Xử lý Xem trước Ảnh
    if (inputAnhSach && khuVucXemTruocAnh) {
        inputAnhSach.addEventListener('change', function(event) {
            khuVucXemTruocAnh.innerHTML = ''; 
            
            if (event.target.files.length > 0) {
                khuVucXemTruocAnh.classList.remove('hidden');
                Array.from(event.target.files).forEach(file => {
                    const url = URL.createObjectURL(file);
                    const imgElement = document.createElement('img');
                    imgElement.src = url;
                    imgElement.className = 'w-20 h-20 object-cover rounded-md border border-gray-200';
                    khuVucXemTruocAnh.appendChild(imgElement);
                });
            } else {
                khuVucXemTruocAnh.classList.add('hidden');
            }
        });
    }
}


// ------------------------------------
// F. KHỞI TẠO CHUNG KHI TẢI TRANG
// ------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    capNhatTrangThaiTaiKhoan(); 
    capNhatHienThiGioHang();
    khoiTaoChucNangScroll();

    khoiTaoCarousel(); 
    khoiTaoChucNangBanSach(); 
});

// --- LOGIC GIẢM GIÁ (Mô phỏng) ---
const GIA_TRI_MIEN_SHIP = 30000;
const VOUCHER_MIEN_SHIP = "FREESHIP30K";

function tinhGiaTriDonHang(gioHang) {
    const { tongCong } = tinhTongGioHang(gioHang);
    let phiVanChuyen = 40000; // Giả định phí vận chuyển
    let tongThanhToan = tongCong + phiVanChuyen;
    let giamGia = 0;

    // Lấy mã voucher từ Local Storage hoặc input (nếu bạn có)
    const maVoucherApDung = localStorage.getItem('applied_voucher');
    
    if (maVoucherApDung === VOUCHER_MIEN_SHIP && tongCong >= 200000) {
        giamGia = GIA_TRI_MIEN_SHIP;
        phiVanChuyen = Math.max(0, phiVanChuyen - giamGia);
    } else {
        localStorage.removeItem('applied_voucher');
        giamGia = 0;
    }

    tongThanhToan = tongCong + phiVanChuyen - giamGia;

    return { tongCong, phiVanChuyen, giamGia, tongThanhToan };
}

// --- LOGIC MODAL THANH TOÁN ---

function hienThiModalThanhToan() {
    const modal = document.getElementById('modal-thanh-toan');
    const gioHang = layDuLieuGioHang();

    if (gioHang.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }
    
    // Tính toán chi tiết đơn hàng
    const { tongCong, phiVanChuyen, giamGia, tongThanhToan } = tinhGiaTriDonHang(gioHang);

    // Cập nhật thông tin trong modal
    document.getElementById('chi-tiet-hang').textContent = formatVND(tongCong);
    document.getElementById('chi-tiet-ship').textContent = formatVND(phiVanChuyen);
    document.getElementById('chi-tiet-giam-gia').textContent = `- ${formatVND(giamGia)}`;
    document.getElementById('tong-cong-cuoi').textContent = formatVND(tongThanhToan);
    
    modal.classList.remove('hidden');
}

function dongModalThanhToan() {
    document.getElementById('modal-thanh-toan').classList.add('hidden');
}

function apDungVoucher() {
    const inputVoucher = document.getElementById('input-voucher').value.toUpperCase();
    if (inputVoucher === VOUCHER_MIEN_SHIP) {
        localStorage.setItem('applied_voucher', VOUCHER_MIEN_SHIP);
        alert("Áp dụng mã FREESHIP30K thành công! (Áp dụng khi đơn hàng > 200k)");
    } else {
        localStorage.removeItem('applied_voucher');
        alert("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
    hienThiModalThanhToan(); // Tải lại modal để cập nhật giá
}

// --- KHỞI TẠO CHUNG (Cập nhật nút Thanh toán) ---

document.addEventListener("DOMContentLoaded", function () {
    // ... (logic giỏ hàng, đăng nhập, scroll - GIỮ NGUYÊN) ...

    // Gán sự kiện cho nút Thanh Toán trong dropdown giỏ hàng
    const nutThanhToan = document.querySelector('#tong-tien-gio-hang .btn-chinh');
    if (nutThanhToan) {
        nutThanhToan.addEventListener('click', hienThiModalThanhToan);
    }
    
    // Gán sự kiện cho nút đóng modal
    document.getElementById('nut-dong-modal-thanh-toan')?.addEventListener('click', dongModalThanhToan);
    document.getElementById('nut-ap-dung-voucher')?.addEventListener('click', apDungVoucher);

    // Khởi tạo các chức năng khác
    capNhatTrangThaiTaiKhoan(); 
    capNhatHienThiGioHang();
    khoiTaoChucNangScroll();
    khoiTaoCarousel(); 
    khoiTaoChucNangBanSach(); 
});