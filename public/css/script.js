// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Animated stat counters (trigger once when visible)
const statEls = document.querySelectorAll('.stat__num');

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = value.toLocaleString('vi-VN');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (statEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statEls.forEach((el) => observer.observe(el));
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Chặn chuột phải
  document.addEventListener('contextmenu', event => event.preventDefault());

  // Chặn các phím tắt F12, Ctrl+U, Ctrl+Shift+I
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
    }
  });


// FIXED: Hiển thị tên khách và mã đơn từ URL ?ten=&booking_id=
  (function(){
    const p = new URLSearchParams(window.location.search);
    const ten = p.get('ten');
    const id = p.get('booking_id');
    const diem = p.get('diem');
    const loai = p.get('loai');
    const el = document.getElementById('customerInfo');
    const title = document.getElementById('thankTitle');
    
    if (ten && el) {
      let txt = 'Cảm ơn anh/chị ' + ten;
      if (id) txt += ' • Mã đơn: ' + id;
      el.textContent = txt;
    } else if (id && el) {
      el.textContent = 'Mã đơn của bạn: ' + id;
    }

    // Nếu có điểm đi, hiện thêm vào đoạn p đầu
    if (diem) {
      const firstP = document.querySelector('.card p');
      if (firstP) {
        firstP.innerHTML += '<br><span style="color:#1f1b15">Tuyến: <strong>' + diem + '</strong>' + (loai ? ' • ' + loai : '') + '</span>';
      }
    }

    // Google Ads / GTM conversion event nếu có
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'booking_success', booking_id: id, customer_name: ten });
    }
  })();
  
 /*  Hiệu ứng vf6 */
    const tilt = document.getElementById('tilt');
  const MAX = 10;   // góc nghiêng tối đa (độ). Muốn mạnh hơn thì tăng số này

  // Nếu khách bật "giảm chuyển động" trong máy thì tắt hiệu ứng
  const giamChuyenDong = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Điện thoại/máy cảm ứng = không có chuột để rê
  const laCamUng = window.matchMedia('(hover: none)').matches;

  // Hàm dùng chung: nhận vị trí x, y (0 → 1) rồi nghiêng ảnh + đặt vệt sáng
  function nghieng(x, y) {
    const rotY = (x - 0.5) * 2 * MAX;              // x lớn → xoay qua phải
    const rotX = (0.5 - y) * 2 * MAX;              // y nhỏ → ngửa lên
    tilt.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
    tilt.style.setProperty('--mx', x * 100 + '%');
    tilt.style.setProperty('--my', y * 100 + '%');
  }
  function veLaiBinhThuong() {
    tilt.style.transform = 'rotateX(0) rotateY(0) scale(1)';
  }

  /* ===== MÁY TÍNH: chạy theo chuột ===== */
  tilt.addEventListener('mousemove', (e) => {
    if (giamChuyenDong) return;
    const r = tilt.getBoundingClientRect();        // vị trí + kích thước khung ảnh
    nghieng((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  tilt.addEventListener('mouseleave', veLaiBinhThuong);

  /* ===== ĐIỆN THOẠI: kéo tới ảnh thì tự chạy ===== */
  let dangChay = false;   // tránh chạy chồng khi đang diễn

  function tuChay() {
    if (dangChay) return;
    dangChay = true;
    tilt.classList.add('chay');                    // bật vệt sáng
    const THOI_GIAN = 2600;                        // chạy trong 5,6 giây (mili giây)
    const batDau = performance.now();

    function buoc(bayGio) {
      const t = (bayGio - batDau) / THOI_GIAN;     // tiến độ: 0 → 1
      if (t >= 1) {                                // xong thì trả ảnh về cũ
        veLaiBinhThuong();
        tilt.classList.remove('chay');
        dangChay = false;
        return;
      }
      // Dùng sin/cos để "chuột ảo" vẽ vòng tròn quanh tâm ảnh
      const x = 0.5 + 0.4 * Math.sin(t * Math.PI * 2);
      const y = 0.5 + 0.3 * Math.cos(t * Math.PI * 2);
      nghieng(x, y);
      requestAnimationFrame(buoc);
    }
    requestAnimationFrame(buoc);
  }

  if (laCamUng && !giamChuyenDong) {
    // IntersectionObserver = "người gác cổng" báo khi ảnh lọt vào màn hình
    const gac = new IntersectionObserver((danhSach) => {
      danhSach.forEach((m) => { if (m.isIntersecting) tuChay(); });
    }, { threshold: 0.6 });                        // thấy 60% ảnh mới chạy
    gac.observe(tilt);
  }