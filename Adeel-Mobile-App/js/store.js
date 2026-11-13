// ==========================================
// STORE LOGIC & SECTION LOADER
// UPDATE: 2026-11-13
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadSections().then(() => {
    initBannerSlider();
    loadProducts();
  });
});

// --- 1. SECTIONS KO LOAD KARNA ---
async function loadSections() {
  const sections = ['header', 'banner', 'filters', 'products', 'features', 'about', 'reviews', 'footer'];
  
  for (let sec of sections) {
    try {
      const response = await fetch(`sections/${sec}.html`);
      const html = await response.text();
      const el = document.getElementById(`sec-${sec}`);
      if (el) el.innerHTML = html;
    } catch (error) {
      console.log(`Error loading ${sec}:`, error);
    }
  }
}

// --- 2. BANNER SLIDER LOGIC ---
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

// --- 3. PRODUCTS KO LOAD KARNA ---
function loadProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  const params = new URLSearchParams(window.location.search);
  const uname = params.get('user');
  const dealer = D.users.find(x => x.username === uname && x.active) || D.users.find(x => x.username === 'admin');
  const n = wa(dealer.phone || D.settings.phone);
  
  let html = '';
  html += D.products.filter(p => p.stock > 0).map(p => {
    const advance = p.price * 0.30;
    const msg = encodeURIComponent('Hello, I want to book ' + p.brand + ' ' + p.name);
    // Product data stringify for passing to Modal
    const pData = JSON.stringify(p).replace(/"/g, '&quot;');
    
    return `<div class="p-card" data-name="${esc((p.brand+' '+p.name).toLowerCase())}" data-price="${p.price}">
      <div class="p-brand">${esc(p.brand)}</div>
      <div class="p-img" style="${p.img?`background-image:url('${esc(p.img)}')`:''}">${p.img?'':'📱'}</div>
      
      <div class="p-info">
        <div class="p-name">${esc(p.name)}</div>
        
        <div class="price-block">
          <div class="price-row main-price">
            <span class="price-label">Rs</span>
            <span class="price-value">${rs(p.price)}</span>
          </div>
          <div class="price-row down-payment">
            <span class="price-label">Advance</span>
            <span class="price-value">${rs(advance)}</span>
          </div>
        </div>

        <div class="p-actions">
          <button class="btn-action" onclick="showMore(${pData})">More ▼</button>
          <button class="btn-action verify-btn" onclick="showVerifyForm(${pData})">Verification</button>
        </div>
        
        <a class="btn-wa" href="https://wa.me/${n}?text=${msg}" target="_blank">
          Order on WhatsApp
        </a>
      </div>
    </div>`;
  }).join('');
  
  grid.innerHTML = html;
}

// --- 4. MORE DETAILS POPUP ---
function showMore(p) {
  const advance = p.price * 0.30;
  const monthly9 = (p.price - advance) / 9;
  const monthly6 = (p.price - advance) / 6;

  let html = `
    <div style="text-align:center; margin-bottom:20px;">
      <div style="font-size:60px; margin-bottom:10px;">📱</div>
      <h2 style="margin:0; font-size:20px;">${esc(p.brand)} ${esc(p.name)}</h2>
      <p style="color:var(--mute); font-size:13px; margin-top:5px;">Variant: ${esc(p.variant || 'Standard')}</p>
    </div>
    
    <div style="background:var(--bg); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid var(--line);">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--mute);">Total Price:</span>
        <b>${rs(p.price)}</b>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--mute);">Advance (30%):</span>
        <b style="color:var(--ok);">${rs(advance)}</b>
      </div>
      <hr style="border:0; border-top:1px solid var(--line); margin:10px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--mute);">9 Months Plan:</span>
        <b style="color:var(--pri);">${rs(monthly9)} / mo</b>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:var(--mute);">6 Months Plan:</span>
        <b style="color:var(--pri);">${rs(monthly6)} / mo</b>
      </div>
    </div>

    <div>
      <h4 style="margin-bottom:8px;">Specifications</h4>
      <p style="color:var(--mute); font-size:13px; line-height:1.5;">${esc(p.specs || 'No specifications available for this model.')}</p>
    </div>

    <button class="btn" style="width:100%; margin-top:20px;" onclick="closeModal()">Close</button>
  `;
  
  document.getElementById('modalTitle').innerText = 'Product Details';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

// --- 5. VERIFICATION FORM POPUP ---
function showVerifyForm(p) {
  let html = `
    <div style="text-align:center; margin-bottom:15px;">
      <h3 style="margin:0; color:var(--pri);">Verification Form</h3>
      <p style="color:var(--mute); font-size:12px;">For: ${esc(p.brand)} ${esc(p.name)}</p>
    </div>

    <label>Customer Name *</label>
    <input id="v_name" placeholder="Enter full name">

    <label>WhatsApp Number *</label>
    <input id="v_phone" placeholder="03xx-xxxxxxx">

    <label>ID Card Front (URL)</label>
    <input id="v_front" placeholder="https://...">

    <label>ID Card Back (URL)</label>
    <input id="v_back" placeholder="https://...">

    <label>Have you taken any online loan?</label>
    <select id="v_loan">
      <option value="No">No</option>
      <option value="Yes">Yes</option>
    </select>

    <div style="margin-top:20px; display:flex; gap:10px;">
      <button class="btn" style="flex:1;" onclick="submitVerification('${esc(p.brand)} ${esc(p.name)}')">Submit Form</button>
      <button class="btn sec" onclick="closeModal()">Cancel</button>
    </div>
  `;
  
  document.getElementById('modalTitle').innerText = 'Customer Verification';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

function submitVerification(productName) {
  const name = document.getElementById('v_name').value.trim();
  const phone = document.getElementById('v_phone').value.trim();
  const front = document.getElementById('v_front').value.trim();
  const back = document.getElementById('v_back').value.trim();
  const loan = document.getElementById('v_loan').value;

  if(!name || !phone) {
    alert('Name and WhatsApp number are required.');
    return;
  }

  // Save to D.verifications
  D.verifications.push({
    id: uid(),
    userId: 'guest', // Store se aane wala user
    cname: name,
    cphone: phone,
    frontImg: front,
    backImg: back,
    loan: loan,
    product: productName,
    status: 'Pending',
    date: Date.now()
  });

  save(); // Global save function from app.js
  closeModal();
  alert('Verification request submitted successfully! Our team will contact you.');
}

// --- HELPER FUNCTIONS ---
function closeModal() {
  document.getElementById('infoModal').classList.remove('open');
}