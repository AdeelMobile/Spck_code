// ==========================================
// STORE LOGIC & SECTION LOADER (Supabase Data)
// UPDATE: 2026-11-15 (Dynamic Installment Rules)
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
let allBrands = [];
let currentBrand = 'All';
let currentMinPrice = 0;
let currentMaxPrice = 9999999;
let verifyFrontImg = '';
let verifyBackImg = '';

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
    const { data: brandsData } = await supabaseClient.from('brands').select('id, brand').eq('is_active', true);
    const { data: models } = await supabaseClient.from('models').select('id, brand_id, model');
    const { data: variants } = await supabaseClient.from('variants').select('*');

    if (!variants || !models || !brandsData) {
      grid.innerHTML = '<p style="text-align:center; color:var(--mute); grid-column: span 2;">No data found.</p>';
      return;
    }

    allBrands = brandsData;
    renderBrandButtons();

    let html = '';
    let count = 0;

    // --- GET SETTINGS FOR CARD DISPLAY ---
    const advLow = D.settings.advLow || 20;   
    const advHigh = D.settings.advHigh || 30; 

    variants.forEach(v => {
      const model = models.find(m => m.id === v.model_id);
      if(!model) return; 

      const brand = brandsData.find(b => b.id === model.brand_id);
      if (!brand) return; 

      const brandName = brand.brand;
      if(v.show_website === false) return; 

      count++;
      const price = v.price || 0;
      
      // Card par Advance calculate karo (Price ke hisaab se)
      let advancePct = (price < 60000) ? advLow : advHigh;
      const advance = price * (advancePct / 100); 
      
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

      html += `<div class="p-card" data-price="${price}" data-brand="${esc(brandName)}" onclick="showSpecs(${pData})" style="cursor:pointer;">
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
              <span class="price-label">Advance (${advancePct}%)</span>
              <span class="price-value">${rs(advance)}</span>
            </div>
          </div>

          <div class="p-actions" style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;" onclick="event.stopPropagation()">
            <button class="btn-action" style="background: var(--pri2); color: var(--pri); border-color: var(--pri); font-weight: 700;" onclick="showInstallmentPlans(${pData})">📋 Plans</button>
            <button class="btn-action verify-btn" onclick="showVerifyForm(${pData})">Verification</button>
          </div>
          
          <a class="btn-wa" href="https://wa.me/?text=${msg}" target="_blank" onclick="event.stopPropagation()">
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

// --- BRAND BUTTONS ---
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

// --- FILTERS LOGIC ---
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

// --- FEATURES DROPDOWN MENU ---
function toggleFeaturesMenu() {
  const menu = document.getElementById('featuresMenu');
  if (menu) menu.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('featuresMenu');
  if (menu && !e.target.closest('.features-dropdown-wrapper')) {
    menu.classList.remove('open');
  }
});

// --- BUDGET CALCULATOR POPUP ---
function openBudgetCalculator() {
  const menu = document.getElementById('featuresMenu');
  if (menu) menu.classList.remove('open');

  let html = `
    <div style="text-align:center; margin-bottom:15px;">
      <div style="font-size:40px; margin-bottom:10px;">🧮</div>
      <h3 style="margin:0; color:var(--pri);">Budget Calculator</h3>
      <p style="color:var(--mute); font-size:12px;">Apna monthly budget daalein, hum aapko sahi phone dikhayenge</p>
    </div>

    <label>Monthly Installment Budget (Rs)</label>
    <input id="calc_budget" type="number" placeholder="e.g. 5000" style="margin-bottom:15px;">

    <label>Months</label>
    <select id="calc_months" style="margin-bottom:15px;">
      <option value="3">3 Months</option>
      <option value="6">6 Months</option>
      <option value="9" selected>9 Months</option>
    </select>

    <button class="btn" style="width:100%;" onclick="calculateBudget()">Calculate</button>
    <div id="calc_result" style="margin-top:20px;"></div>
  `;
  
  document.getElementById('modalTitle').innerText = 'Budget Calculator';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

function calculateBudget() {
  const budget = parseFloat(document.getElementById('calc_budget').value);
  const months = parseInt(document.getElementById('calc_months').value);
  const resultBox = document.getElementById('calc_result');

  if (!budget || budget <= 0) {
    resultBox.innerHTML = '<p style="color:var(--bad); text-align:center;">Please enter a valid budget.</p>';
    return;
  }

  const estimatedTotal = (budget * months) / 0.7;

  const cards = document.querySelectorAll('.p-card');
  let matchedProducts = [];

  cards.forEach(c => {
    const price = parseInt(c.getAttribute('data-price')) || 0;
    if (price <= estimatedTotal) {
      const advance = price * 0.30;
      const monthly = (price - advance) / months;
      matchedProducts.push({ 
        name: c.querySelector('.p-name').innerText.split('\n')[0].trim(),
        price: price,
        advance: advance,
        monthly: Math.round(monthly)
      });
    }
  });

  if (matchedProducts.length === 0) {
    resultBox.innerHTML = `<p style="color:var(--mute); text-align:center; padding:20px;">Is budget mein koi phone nahi mila.</p>`;
    return;
  }

  let html = `<h4 style="margin-bottom:10px;">Suitable Phones (${matchedProducts.length})</h4>`;
  html += `<table style="width:100%; border-collapse: collapse; font-size:12px; table-layout: fixed;">`;
  html += `<tr style="background:var(--pri); color:#fff;">
    <th style="padding:8px; text-align:left; width: 70%;">Phone</th>
    <th style="padding:8px; text-align:right; width: 30%;">Total</th>
  </tr>`;
  
  matchedProducts.forEach(p => {
    html += `<tr style="border-bottom:1px solid var(--line);">
      <td style="padding:8px; word-break: break-word;">${esc(p.name)}</td>
      <td style="padding:8px; text-align:right; color:var(--pri); font-weight:700;">${rs(p.price)}</td>
    </tr>`;
  });
  
  html += `</table>`;
  resultBox.innerHTML = html;
}

// --- PRICE LIST POPUP ---
function openPriceList() {
  const menu = document.getElementById('featuresMenu');
  if (menu) menu.classList.remove('open');

  const cards = document.querySelectorAll('.p-card');
  let listHtml = '';

  if (cards.length === 0) {
    listHtml = '<p style="text-align:center; color:var(--mute);">No products available.</p>';
  } else {
    listHtml = `<table style="width:100%; border-collapse: collapse; font-size:13px; table-layout: fixed;">
      <tr style="background:var(--pri); color:#fff;">
        <th style="padding:8px; text-align:left; width: 70%;">Phone</th>
        <th style="padding:8px; text-align:right; width: 30%;">Price</th>
      </tr>`;
    
    cards.forEach(c => {
      const price = parseInt(c.getAttribute('data-price')) || 0;
      const name = c.querySelector('.p-name').innerText.split('\n')[0].trim();
      listHtml += `<tr style="border-bottom:1px solid var(--line);">
        <td style="padding:8px; word-break: break-word;">${esc(name)}</td>
        <td style="padding:8px; text-align:right; color:var(--pri); font-weight:700;">${rs(price)}</td>
      </tr>`;
    });
    
    listHtml += `</table>`;
  }

  let html = `
    <div style="text-align:center; margin-bottom:15px;">
      <div style="font-size:40px; margin-bottom:10px;">📋</div>
      <h3 style="margin:0; color:var(--pri);">Full Price List</h3>
      <p style="color:var(--mute); font-size:12px;">Adeel Mobile - All Products</p>
    </div>
    <div style="max-height:400px; overflow-y:auto;">${listHtml}</div>
    <button class="btn" style="width:100%; margin-top:15px;" onclick="closeModal()">Close</button>
  `;
  
  document.getElementById('modalTitle').innerText = 'Price List';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

// --- SPECS POPUP (Product Click) ---
function showSpecs(p) {
  let specsTableHtml = '<p style="color:var(--mute); font-size:13px; text-align:center;">No specifications available for this product.</p>';
  
  if (p.specs) {
    let specsObj = p.specs;
    if (typeof p.specs === 'string') {
      try { specsObj = JSON.parse(p.specs); } catch(e) { specsObj = null; }
    }
    if (specsObj && typeof specsObj === 'object' && Object.keys(specsObj).length > 0) {
      specsTableHtml = `<table style="width:100%; border-collapse: collapse; font-size:13px; margin-top:10px; table-layout: fixed;">
        ${Object.entries(specsObj).map(([key, value]) => `
          <tr style="border-bottom: 1px solid var(--line);">
            <td style="padding: 10px 5px; font-weight: 600; color: var(--ink); width: 35%; word-break: break-word;">${esc(key)}</td>
            <td style="padding: 10px 5px; color: var(--mute); width: 65%; word-break: break-word;">${esc(value)}</td>
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
      <p style="color:var(--pri); font-size:14px; font-weight:600; margin-top:5px;">Rs ${(p.price||0).toLocaleString('en-PK')}</p>
    </div>

    <div>
      <h4 style="margin-bottom:8px; color: var(--ink); border-bottom:1px solid var(--line); padding-bottom:5px;">📱 Specifications</h4>
      ${specsTableHtml}
    </div>

    <button class="btn" style="width:100%; margin-top:20px;" onclick="closeModal()">Close</button>
  `;
  
  document.getElementById('modalTitle').innerText = 'Product Specifications';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

// --- INSTALLMENT PLANS POPUP (With New Rules) ---
function showInstallmentPlans(p) {
  const basePrice = p.price || 0;
  
  // 1. Rules Fetch karo
  const advLow = D.settings.advLow || 20;   
  const advHigh = D.settings.advHigh || 30; 
  const mark3 = D.settings.mark3 || 15;
  const mark6 = D.settings.mark6 || 27;
  const mark9 = D.settings.mark9 || 37;

  // 2. Advance Percentage Decide karo
  let advancePct = (basePrice < 60000) ? advLow : advHigh;
  const advance = basePrice * (advancePct / 100);
  
  // 3. Har plan ki Total Price nikaalo (Base + Markup)
  const totalPrice3 = basePrice + (basePrice * mark3 / 100);
  const totalPrice6 = basePrice + (basePrice * mark6 / 100);
  const totalPrice9 = basePrice + (basePrice * mark9 / 100);

  // 4. Har plan ki Monthly nikaalo (Total Price - Advance / Months)
  const monthly3 = Math.round((totalPrice3 - advance) / 3);
  const monthly6 = Math.round((totalPrice6 - advance) / 6);
  const monthly9 = Math.round((totalPrice9 - advance) / 9);

  let imagePopup = '';
  if (p.image_link) {
    imagePopup = `<img src="${p.image_link}" style="max-height:120px; object-fit:contain; margin-bottom:10px;">`;
  } else {
    imagePopup = `<div style="font-size:50px; margin-bottom:10px;">📱</div>`;
  }

  let html = `
    <div style="text-align:center; margin-bottom:15px;">
      ${imagePopup}
      <h2 style="margin:0; font-size:18px;">${esc(p.variant)}</h2>
      <p style="color:var(--mute); font-size:13px; margin-top:5px;">Base Price: <b>${rs(basePrice)}</b></p>
    </div>

    <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-bottom:15px; border:1px solid var(--line);">
      <h4 style="margin:0 0 10px 0; text-align:center; color:var(--pri);">📊 Installment Plans</h4>
      <p style="font-size:11px; color:var(--mute); text-align:center; margin-bottom:10px;">(Advance ${advancePct}% = ${rs(advance)})</p>
      
      <table style="width:100%; border-collapse: collapse; font-size:13px; background:#fff; border-radius:8px; overflow:hidden;">
        <thead>
          <tr style="background:var(--pri); color:#fff;">
            <th style="padding:10px 5px; text-align:left; font-size:12px;">Plan</th>
            <th style="padding:10px 5px; text-align:right; font-size:12px;">Total Price</th>
            <th style="padding:10px 5px; text-align:right; font-size:12px;">Monthly</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--line);">
            <td style="padding:12px 5px; font-weight:700;">3 Months</td>
            <td style="padding:12px 5px; text-align:right; color:var(--mute); font-weight:600;">${rs(totalPrice3)}</td>
            <td style="padding:12px 5px; text-align:right; color:var(--pri); font-weight:700;">${rs(monthly3)}/mo</td>
          </tr>
          <tr style="border-bottom:1px solid var(--line);">
            <td style="padding:12px 5px; font-weight:700;">6 Months</td>
            <td style="padding:12px 5px; text-align:right; color:var(--mute); font-weight:600;">${rs(totalPrice6)}</td>
            <td style="padding:12px 5px; text-align:right; color:var(--pri); font-weight:700;">${rs(monthly6)}/mo</td>
          </tr>
          <tr>
            <td style="padding:12px 5px; font-weight:700;">9 Months</td>
            <td style="padding:12px 5px; text-align:right; color:var(--mute); font-weight:600;">${rs(totalPrice9)}</td>
            <td style="padding:12px 5px; text-align:right; color:var(--pri); font-weight:700;">${rs(monthly9)}/mo</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:11px; color:var(--mute); text-align:center; margin:10px 0 0;">Monthly amount Total Price (Markup ke sath) se Advance nikal kar calculate kiya gaya hai.</p>
    </div>

    <button class="btn" style="width:100%; margin-top:20px;" onclick="closeModal()">Close</button>
  `;
  
  document.getElementById('modalTitle').innerText = 'Installment Plans';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

// --- VERIFICATION FORM POPUP ---
function showVerifyForm(p) {
  verifyFrontImg = '';
  verifyBackImg = '';

  let html = `
    <div style="text-align:center; margin-bottom:15px;">
      <h3 style="margin:0; color:var(--pri);">Verification Form</h3>
      <p style="color:var(--mute); font-size:12px;">For: ${esc(p.variant)}</p>
    </div>

    <label>Customer Name *</label>
    <input id="v_name" placeholder="Enter full name">

    <label>WhatsApp Number *</label>
    <input id="v_phone" placeholder="03xx-xxxxxxx">

    <label>CNIC Number</label>
    <input id="v_cnic" placeholder="12345-1234567-1">

    <label style="margin-top:10px; display:block;">ID Card Front Image</label>
    <div class="img-upload-box" style="border: 2px dashed var(--line); padding: 15px; text-align: center; border-radius: 10px; background: var(--bg); margin-bottom: 15px; position: relative;">
      <span style="color:var(--pri); font-weight:600; font-size:14px;">📷 Click to Upload Front Image</span>
      <input type="file" accept="image/*" onchange="resizeAndPreview(this, 'front')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
    </div>
    <img id="preview_front" style="width: 100%; height: 120px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: 8px; margin-top: 10px; display: none;">

    <label style="margin-top:10px; display:block;">ID Card Back Image</label>
    <div class="img-upload-box" style="border: 2px dashed var(--line); padding: 15px; text-align: center; border-radius: 10px; background: var(--bg); margin-bottom: 15px; position: relative;">
      <span style="color:var(--pri); font-weight:600; font-size:14px;">📷 Click to Upload Back Image</span>
      <input type="file" accept="image/*" onchange="resizeAndPreview(this, 'back')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
    </div>
    <img id="preview_back" style="width: 100%; height: 120px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: 8px; margin-top: 10px; display: none;">

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

function resizeAndPreview(input, type) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxSize = 600;
      if (width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.7);
      
      if(type === 'front') verifyFrontImg = base64Image;
      if(type === 'back') verifyBackImg = base64Image;

      const previewId = type === 'front' ? 'preview_front' : 'preview_back';
      const previewEl = document.getElementById(previewId);
      if(previewEl) {
        previewEl.src = base64Image;
        previewEl.style.display = 'block';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function submitVerification(productName) {
  const name = document.getElementById('v_name').value.trim();
  const phone = document.getElementById('v_phone').value.trim();
  const cnic = document.getElementById('v_cnic').value.trim();
  const loan = document.getElementById('v_loan').value;

  if(!name || !phone) {
    alert('Name and WhatsApp number are required.');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const agentUsername = urlParams.get('user') || 'guest';

  try {
    const { error } = await supabaseClient.from('verifications').insert([{
      name: name,
      phone: phone,
      cnic: cnic,
      front_img: verifyFrontImg,
      back_img: verifyBackImg,
      loan_taken: loan,
      product: productName,
      status: 'Pending',
      added_by: agentUsername
    }]);

    if (error) throw error;

    closeModal();
    alert('Verification request submitted successfully! Our team will contact you.');
    
    verifyFrontImg = '';
    verifyBackImg = '';

  } catch (err) {
    alert('Error submitting verification: ' + err.message);
    console.error(err);
  }
}

function closeModal() {
  document.getElementById('infoModal').classList.remove('open');
}