// ==========================================
// STORE LOGIC & SECTION LOADER
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
    const downPayment = p.price * 0.30;
    const monthly = (p.price - downPayment) / 9;
    const msg = encodeURIComponent('Hello, I want to book ' + p.brand + ' ' + p.name);
    const pData = JSON.stringify({ id: p.id, brand: p.brand, name: p.name, price: p.price }).replace(/"/g, '&quot;');
    
    return `<div class="p-card" data-name="${esc((p.brand+' '+p.name).toLowerCase())}" data-price="${p.price}">
      <div class="p-img" style="${p.img?`background-image:url('${esc(p.img)}')`:''}">${p.img?'':'📱'}</div>
      <div class="p-info">
        <div class="p-brand">${esc(p.brand)}</div>
        <div class="p-name">${esc(p.name)}</div>
        <div class="p-variant">128GB Storage</div>
        
        <div class="price-block">
          <div class="price-row main-price">
            <span class="price-label">Rs Price</span>
            <span class="price-value">${rs(p.price)}</span>
          </div>
          <div class="price-row down-payment">
            <span class="price-label">Advance</span>
            <span class="price-value">${rs(downPayment)}</span>
          </div>
          <div class="price-row monthly">
            <span class="price-label">Monthly (9 mo)</span>
            <span class="price-value">${rs(monthly)}</span>
          </div>
        </div>

        <!-- Action Buttons (Line by Line / Column) -->
        <div class="p-actions-list">
          <button class="btn-action-row" onclick="showPlans(${pData})">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Installment Plans
          </button>
          
          <button class="btn-action-row" onclick="alert('Full Specs not available yet.')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Specs
          </button>

          <button class="btn-action-row" onclick="showComparisons(${pData})">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            Compare
          </button>

          <button class="btn-action-row" onclick="shareProduct('${esc(p.brand)} ${esc(p.name)}', ${p.price})">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Share
          </button>

          <button class="btn-action-row" onclick="downloadProduct('${esc(p.brand)}', '${esc(p.name)}', '${rs(p.price)}', '${rs(downPayment)}', '${rs(monthly)}')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download
          </button>

          <button class="btn-action-row" onclick="alert('Verification feature coming soon!')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Verification
          </button>
        </div>

        <!-- Bottom Buttons -->
        <a class="btn-wa" style="margin-top: 10px;" href="https://wa.me/${n}?text=${msg}" target="_blank">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Book on WhatsApp
        </a>
      </div>
    </div>`;
  }).join('');
  
  grid.innerHTML = html;
}

// --- 4. DOWNLOAD FUNCTION (Fake download for now) ---
function downloadProduct(brand, name, price, advance, monthly) {
  alert(`Downloading details for:\n\n${brand} ${name}\nPrice: ${price}\nAdvance: ${advance}\nMonthly: ${monthly}`);
}

// --- 5. MODALS (Installments & Compare) ---
function showPlans(prod) {
  const price = prod.price;
  const advance = price * 0.30;
  
  const buildTable = (months, colorClass) => {
    const perMonth = (price - advance) / months;
    let rows = '';
    let d = new Date();
    
    for (let i = 1; i <= months; i++) {
      d.setMonth(d.getMonth() + 1);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      rows += `<tr><td>${dateStr}</td><td><b>${rs(perMonth)}</b></td></tr>`;
    }
    return `<table class="plan-table ${colorClass}"><tr><th>Due Date</th><th>Installment</th></tr>${rows}</table>`;
  };
  
  let html = `
    <div style="text-align:center; margin-bottom:20px; background:#f8fafc; padding:12px; border-radius:12px; border:1px solid #e2e8f0;">
      <div style="font-size:13px; color:var(--mute); margin-bottom:4px;">Retail Price: <b>${rs(price)}</b></div>
      <div style="font-size:13px; color:var(--ok);">Advance: <b>${rs(advance)}</b></div>
    </div>
    <h4 style="margin-bottom:8px;">Plan 1: 3 Months</h4>${buildTable(3, 't-green')}
    <h4 style="margin-bottom:8px;">Plan 2: 6 Months</h4>${buildTable(6, 't-blue')}
    <h4 style="margin-bottom:8px;">Plan 3: 9 Months</h4>${buildTable(9, 't-yellow')}
  `;
  
  document.getElementById('modalTitle').innerText = `${prod.brand} ${prod.name}`;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

function showComparisons(prod) {
  const similar = D.products.filter(p => p.id !== prod.id && p.stock > 0 && p.price >= prod.price * 0.8 && p.price <= prod.price * 1.2);
  let html = `<p style="color:var(--mute); font-size:13px; margin-bottom:15px;">Similar products in this price range:</p>`;
  
  if (similar.length === 0) {
    html += `<p style="text-align:center; padding:20px;">No similar products found.</p>`;
  } else {
    html += similar.map(p => {
      const monthly = (p.price - (p.price * 0.30)) / 9;
      return `<div style="display:flex; justify-content:space-between; border:1px solid var(--line); padding:12px; border-radius:12px; margin-bottom:10px;">
        <div><b style="display:block; font-size:15px; color:var(--ink);">${esc(p.brand)} ${esc(p.name)}</b><small style="color:var(--mute);">Monthly: ${rs(monthly)}</small></div>
        <div style="font-weight:700; color:var(--pri);">${rs(p.price)}</div>
      </div>`;
    }).join('');
  }
  document.getElementById('modalTitle').innerText = `Compare with ${prod.name}`;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

function closeModal() {
  document.getElementById('infoModal').classList.remove('open');
}

function shareProduct(name, price) {
  if (navigator.share) {
    navigator.share({ title: name, text: `Check out ${name} for ${rs(price)}`, url: window.location.href });
  } else {
    alert('Link copied to clipboard!');
  }
}