// ==========================================
// STORE LOGIC & SECTION LOADER (Supabase Data)
// UPDATE: 2026-11-15 (Brand Filters Added)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadSections().then(() => {
    initBannerSlider();
    setTimeout(loadProductsFromSupabase, 1500); 
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

// --- GLOBAL VARIABLES ---
let allBrands = [];      // Supabase se active brands
let currentBrand = 'All'; // Filhal konsa brand selected hai
let currentMinPrice = 0;
let currentMaxPrice = 9999999;

// --- SUPABASE DATA FETCH & RENDER ---
async function loadProductsFromSupabase() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (!supabaseClient) {
    grid.innerHTML = '<p style="text-align:center; color:var(--bad); grid-column: span 2;">Database connection error. Please refresh.</p>';
    return;
  }

  grid.innerHTML = '<p style="text-align:center; color:var(--mute); grid-column: span 2;">Loading products...</p>';

  try {
    // 1. Brands, Models, Variants fetch karo
    const { data: brandsData } = await supabaseClient.from('brands').select('id, brand').eq('is_active', true);
    const { data: models } = await supabaseClient.from('models').select('id, brand_id, model');
    const { data: variants } = await supabaseClient.from('variants').select('*');

    if (!variants || !models || !brandsData) {
      grid.innerHTML = '<p style="text-align:center; color:var(--mute); grid-column: span 2;">No data found.</p>';
      return;
    }

    allBrands = brandsData;

    // 2. Brand Buttons render karo
    renderBrandButtons();

    // 3. Products render karo
    let html = '';
    let count = 0;

    variants.forEach(v => {
      const model = models.find(m => m.id === v.model_id);
      if(!model) return; 

      const brand = brandsData.find(b => b.id === model.brand_id);
      if (!brand) return; 

      const brandName = brand.brand;
      if(v.show_website === false) return; 

      count++;
      const price = v.price || 0;
      const advance = price * 0.30; 
      const pName = model.model;
      const pVariant = v.variant;
      
      const msg = encodeURIComponent('Hello, I want to book ' + brandName + ' ' + pName);
      const pData = JSON.stringify(v).replace(/"/g, '&quot;');

      let imageHtml = '';
      if (v.image_link) {
        imageHtml = `<img src="${v.image_link}" alt="${esc(pName)}" style="width:100%; height:100%; object-fit:contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size:40px\\'>📱</div>';" />`;
      } else {
        imageHtml = `<div style="font-size:40px;">📱</div>`; 
      }

      html += `<div class="p-card" data-price="${price}" data-brand="${esc(brandName)}">
        <div class="p-brand">${esc(brandName)}</div>
        <div class="p-img">${imageHtml}</div>
        
        <div class="p-info">
          <div class="p-name">${esc(pName)} <br><small style="font-weight:400; color:var(--mute);">${esc(pVariant)}</small></div>
          
          <div class="price-block">
            <div class="price-row main-price">
              <span class="price-label">Rs</span>
              <span class="price-value">${rs(price)}</span>
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
          
          <a class="btn-wa" href="https://wa.me/?text=${msg}" target="_blank">
            Order on WhatsApp
          </a>
        </div>
      </div>`;
    });

    if(count === 0) {
       grid.innerHTML = '<p style="text-align:center; color:var(--mute); grid-column: span 2;">No products available.</p>';
    } else {
       grid.innerHTML = html;
    }

  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p style="text-align:center; color:var(--bad); grid-column: span 2;">Error loading data.</p>';
  }
}

// --- BRAND BUTTONS RENDER ---
function renderBrandButtons() {
  const container = document.getElementById('brandFiltersContainer');
  if (!container) return;

  let html = `
    <button class="price-btn active brand-btn" 
      data-brand="All"
      onclick="handleBrandClick('All', this)"
      onmousedown="startBrandPress('All', this)" 
      onmouseup="endFilterPress()" 
      onmouseleave="endFilterPress()"
      ontouchstart="startBrandPress('All', this)" 
      ontouchend="endFilterPress()" 
      ontouchcancel="endFilterPress()">All Brands</button>
  `;

  allBrands.forEach(b => {
    html += `
      <button class="price-btn brand-btn" 
        data-brand="${esc(b.brand)}"
        onclick="handleBrandClick('${esc(b.brand)}', this)"
        onmousedown="startBrandPress('${esc(b.brand)}', this)" 
        onmouseup="endFilterPress()" 
        onmouseleave="endFilterPress()"
        ontouchstart="startBrandPress('${esc(b.brand)}', this)" 
        ontouchend="endFilterPress()" 
        ontouchcancel="endFilterPress()">${esc(b.brand)}</button>
    `;
  });

  container.innerHTML = html;
  container.style.cssText = 'max-width:1000px; margin: 0 auto 12px; padding: 0 16px; display: flex; overflow-x: auto; gap: 8px; scrollbar-width: none;';
}

// --- PRICE FILTER (With Long Press) ---
let filterPressTimer = null;
let isLongPressActive = false;

function startFilterPress(min, max, btn) {
  isLongPressActive = false;
  filterPressTimer = setTimeout(() => {
    isLongPressActive = true;
    showPriceSharePopup(min, max, btn);
  }, 500);
}

function endFilterPress() {
  if (filterPressTimer) {
    clearTimeout(filterPressTimer);
    filterPressTimer = null;
  }
}

function handleFilterClick(min, max, btn) {
  if (isLongPressActive) {
    isLongPressActive = false;
    return;
  }
  currentMinPrice = min;
  currentMaxPrice = max;
  applyFilters();
}

// --- BRAND FILTER (With Long Press) ---
function startBrandPress(brandName, btn) {
  isLongPressActive = false;
  filterPressTimer = setTimeout(() => {
    isLongPressActive = true;
    showBrandSharePopup(brandName);
  }, 500);
}

function handleBrandClick(brandName, btn) {
  if (isLongPressActive) {
    isLongPressActive = false;
    return;
  }
  document.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentBrand = brandName;
  applyFilters();
}

// --- APPLY FILTERS (Brand + Price) ---
function applyFilters() {
  const cards = document.querySelectorAll('.p-card');
  let visibleCount = 0;

  cards.forEach(c => {
    const price = parseInt(c.getAttribute('data-price')) || 0;
    const brand = c.getAttribute('data-brand');

    const priceMatch = price >= currentMinPrice && price <= currentMaxPrice;
    const brandMatch = currentBrand === 'All' || brand === currentBrand;

    if (priceMatch && brandMatch) {
      c.style.display = 'flex';
      visibleCount++;
    } else {
      c.style.display = 'none';
    }
  });

  // Show no products message
  const grid = document.getElementById('productGrid');
  let noProductsMsg = document.getElementById('noProductsMsg');
  
  if (visibleCount === 0) {
    if (!noProductsMsg) {
      noProductsMsg = document.createElement('p');
      noProductsMsg.id = 'noProductsMsg';
      noProductsMsg.style.cssText = 'text-align:center; color:var(--mute); grid-column: span 2; padding:20px;';
      noProductsMsg.innerText = 'No products found for this filter.';
      grid.appendChild(noProductsMsg);
    }
  } else {
    if (noProductsMsg) noProductsMsg.remove();
  }
}

// --- SHARE POPUPS ---
function showPriceSharePopup(min, max, btn) {
  const rangeText = btn.innerText;
  const pageUrl = window.location.origin + window.location.pathname;
  const shareUrl = pageUrl + `?min=${min}&max=${max}`;
  const shareMessage = encodeURIComponent(`Adeel Mobile par ${rangeText} tak ke mobile phones ka installment plan dekhein!\n\n${shareUrl}`);

  let html = `
    <div style="text-align:center; padding:10px;">
      <div style="font-size:40px; margin-bottom:10px;">🔗</div>
      <h3 style="margin-bottom:5px;">Share Price Range</h3>
      <p style="color:var(--mute); font-size:13px; margin-bottom:20px;">"${rangeText}" wale phones share karein</p>
      <a href="https://wa.me/?text=${shareMessage}" target="_blank" class="btn" style="background:#25D366; display:block; text-decoration:none; width:100%; margin-bottom:10px;">📱 Share on WhatsApp</a>
      <button class="btn sec" style="width:100%; margin-bottom:10px;" onclick="copyFilterLink('${shareUrl}')">📋 Copy Link</button>
      <button class="btn sec" style="width:100%;" onclick="closeModal()">Close</button>
    </div>
  `;
  openShareModal('Share Price Range', html);
}

function showBrandSharePopup(brandName) {
  const pageUrl = window.location.origin + window.location.pathname;
  const shareUrl = pageUrl + `?brand=${encodeURIComponent(brandName)}`;
  const shareMessage = encodeURIComponent(`Adeel Mobile par ${brandName} ke mobile phones ka installment plan dekhein!\n\n${shareUrl}`);

  let html = `
    <div style="text-align:center; padding:10px;">
      <div style="font-size:40px; margin-bottom:10px;">🔗</div>
      <h3 style="margin-bottom:5px;">Share Brand</h3>
      <p style="color:var(--mute); font-size:13px; margin-bottom:20px;">${brandName} ke phones share karein</p>
      <a href="https://wa.me/?text=${shareMessage}" target="_blank" class="btn" style="background:#25D366; display:block; text-decoration:none; width:100%; margin-bottom:10px;">📱 Share on WhatsApp</a>
      <button class="btn sec" style="width:100%; margin-bottom:10px;" onclick="copyFilterLink('${shareUrl}')">📋 Copy Link</button>
      <button class="btn sec" style="width:100%;" onclick="closeModal()">Close</button>
    </div>
  `;
  openShareModal('Share Brand', html);
}

function openShareModal(title, html) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

function copyFilterLink(url) {
  try {
    navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  } catch(e) {
    const temp = document.createElement('textarea');
    temp.value = url;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    alert('Link copied!');
  }
}

// --- MORE DETAILS POPUP ---
function showMore(p) {
  const price = p.price || 0;
  const advance = price * 0.30;
  const monthly9 = (price - advance) / 9;
  const monthly6 = (price - advance) / 6;

  let specsTableHtml = '<p style="color:var(--mute); font-size:13px;">No specifications available.</p>';
  
  if (p.specs) {
    let specsObj = p.specs;
    if (typeof p.specs === 'string') {
      try { specsObj = JSON.parse(p.specs); } catch(e) { specsObj = null; }
    }
    if (specsObj && typeof specsObj === 'object' && Object.keys(specsObj).length > 0) {
      specsTableHtml = `<table style="width:100%; border-collapse: collapse; font-size:13px; margin-top:10px;">
        ${Object.entries(specsObj).map(([key, value]) => `
          <tr style="border-bottom: 1px solid var(--line);">
            <td style="padding: 8px 5px; font-weight: 600; color: var(--ink); width: 40%;">${esc(key)}</td>
            <td style="padding: 8px 5px; color: var(--mute);">${esc(value)}</td>
          </tr>
        `).join('')}
      </table>`;
    }
  }

  let imagePopup = '';
  if (p.image_link) {
    imagePopup = `<img src="${p.image_link}" style="max-height:180px; object-fit:contain; margin-bottom:10px;">`;
  } else {
    imagePopup = `<div style="font-size:60px; margin-bottom:10px;">📱</div>`;
  }

  let html = `
    <div style="text-align:center; margin-bottom:20px;">
      ${imagePopup}
      <h2 style="margin:0; font-size:20px;">${esc(p.variant)}</h2>
    </div>
    
    <div style="background:var(--bg); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid var(--line);">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="color:var(--mute);">Total Price:</span>
        <b>${rs(price)}</b>
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
      <h4 style="margin-bottom:8px; color: var(--ink);">Specifications</h4>
      ${specsTableHtml}
    </div>

    <button class="btn" style="width:100%; margin-top:20px;" onclick="closeModal()">Close</button>
  `;
  
  document.getElementById('modalTitle').innerText = 'Product Details';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

// --- VERIFICATION FORM POPUP ---
function showVerifyForm(p) {
  let html = `
    <div style="text-align:center; margin-bottom:15px;">
      <h3 style="margin:0; color:var(--pri);">Verification Form</h3>
      <p style="color:var(--mute); font-size:12px;">For: ${esc(p.variant)}</p>
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
      <button class="btn" style="flex:1;" onclick="submitVerification('${esc(p.variant)}')">Submit Form</button>
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

  D.verifications.push({
    id: uid(),
    userId: 'guest',
    cname: name,
    cphone: phone,
    frontImg: front,
    backImg: back,
    loan: loan,
    product: productName,
    status: 'Pending',
    date: Date.now()
  });

  save(); 
  closeModal();
  alert('Verification request submitted successfully! Our team will contact you.');
}

function closeModal() {
  document.getElementById('infoModal').classList.remove('open');
}