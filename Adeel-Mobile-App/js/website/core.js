// ==========================================
// 1. CORE SETUP & SECTION LOADER
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadSections().then(() => {
    initBannerSlider();
    setTimeout(loadProductsFromSupabase, 1500); // Yeh products.js mein hai
  });
});

async function loadSections() {
  const sections = ['header', 'banner', 'filters', 'products', 'features', 'about', 'reviews', 'footer'];
  for (let sec of sections) {
    try {
      const response = await fetch(`sections/${sec}.html`);
      const html = await response.text();
      const el = document.getElementById(`sec-${sec}`);
      if (el) el.innerHTML = html;
    } catch (error) { console.log(`Error loading ${sec}:`, error); }
  }
}

function initBannerSlider() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  if (slides.length > 0) {
    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      const track = document.getElementById('sliderTrack');
      if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }, 3000);
  }
}

function toggleSidebar() {
  if (typeof me !== 'undefined' && me && me.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'index.html';
  }
}

// Global Variables (Jo sab files use karengi)
let allBrands = [];
let currentBrand = 'All';
let currentMinPrice = 0;
let currentMaxPrice = 9999999;
let verifyFrontImg = '';
let verifyBackImg = '';