// ==========================================
// 3. BRAND BUTTONS & FILTERS LOGIC
// ==========================================

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

let filterPressTimer = null;
let isLongPressActive = false;

function startFilterPress(min, max, btn) {
  isLongPressActive = false;
  filterPressTimer = setTimeout(() => {
    isLongPressActive = true;
    showPriceSharePopup(min, max, btn); // features.js mein
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
    showBrandSharePopup(brandName); // features.js mein
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