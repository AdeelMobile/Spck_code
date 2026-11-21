// ==========================================
// 2. SUPABASE DATA FETCH & RENDER (Clean UI)
// ==========================================

async function loadProductsFromSupabase() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.style.backgroundColor = '#f8fafc'; 
  grid.style.padding = '15px';
  grid.style.borderRadius = '15px';

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
    renderBrandButtons(); // Yeh filters.js mein hai

    let html = '';
    let count = 0;

    const advLow = D.settings.advLow || 20;   
    const advHigh = D.settings.advHigh || 30; 
    const mark3 = D.settings.mark3 || 15;
    const mark6 = D.settings.mark6 || 27;
    const mark9 = D.settings.mark9 || 37;

    variants.forEach(v => {
      const model = models.find(m => m.id === v.model_id);
      if(!model) return; 

      const brand = brandsData.find(b => b.id === model.brand_id);
      if (!brand || v.show_website === false) return; 

      count++;
      const price = v.price || 0;
      
      let advancePct = (price < 60000) ? advLow : advHigh;
      const advance = price * (advancePct / 100);
      
      const total3 = price + (price * mark3 / 100);
      const total6 = price + (price * mark6 / 100);
      const total9 = price + (price * mark9 / 100);

      const m3 = Math.round((total3 - advance) / 3);
      const m6 = Math.round((total6 - advance) / 6);
      const m9 = Math.round((total9 - advance) / 9);
      
      const pName = model.model;
      const pVariant = v.variant;
      const msg = encodeURIComponent('Hello, I want to book ' + brand.brand + ' ' + pName);
      const pData = JSON.stringify(v).replace(/"/g, '&quot;');

      let imageHtml = v.image_link ? `<img src="${v.image_link}" alt="${esc(pName)}" style="width:100%; height:100%; object-fit:contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size:40px\\'>📱</div>';" />` : `<div style="font-size:40px;">📱</div>`;

      // --- SIMPLE & CLEAN CARD DESIGN ---
      html += `<div class="p-card" data-name="${esc(pName)}" data-price="${price}" data-brand="${esc(brand.brand)}" onclick="showSpecs(${pData})" style="cursor:pointer; background: #ffffff; border-radius: 12px; padding: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column;">
        
        <div class="p-brand" style="color:#64748b; font-size:10px; font-weight:700; text-transform:uppercase; margin-bottom: 5px;">${esc(brand.brand)}</div>
        
        <div class="p-img" style="height: 110px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">${imageHtml}</div>
        
        <div class="p-info" style="flex: 1; display: flex; flex-direction: column;">
          
          <div class="p-name" style="min-height: 40px; margin-bottom: 10px;">
            <div style="font-weight: 700; font-size: 14px; line-height: 1.2; color: #1e293b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${esc(pName)}</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${esc(pVariant)}</div>
          </div>
          
          <!-- Price & Advance Box -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
            
            <!-- Total Price -->
            <div style="display:flex; align-items:baseline; gap:4px; margin-bottom:5px;">
              <span style="font-size:12px; color:#64748b; font-weight:600;">Rs</span>
              <span style="font-size:16px; color:#2563eb; font-weight:800;">${rs(price).replace('Rs ', '').replace('Rs', '')}</span>
            </div>

            <!-- Advance -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
              <div style="display:flex; align-items:baseline; gap:4px;">
                <span style="font-size:11px; color:#16a34a; font-weight:600;">Rs</span>
                <span style="font-size:13px; color:#16a34a; font-weight:800;">${rs(advance).replace('Rs ', '').replace('Rs', '')}</span>
              </div>
              <span style="font-size:10px; color:#64748b; font-weight:600; text-align:right;">Advance<br>(${advancePct}%)</span>
            </div>

          </div>

          <!-- Installments Boxes -->
          <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
            
            <!-- 3 Months -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:8px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:#1e293b; font-weight:600;">3 Months</span>
              <span style="font-size:12px; color:#ea580c; font-weight:700;">${rs(m3)}</span>
            </div>
            
            <!-- 6 Months -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:8px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:#1e293b; font-weight:600;">6 Months</span>
              <span style="font-size:12px; color:#9333ea; font-weight:700;">${rs(m6)}</span>
            </div>
            
            <!-- 9 Months -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:8px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:#1e293b; font-weight:600;">9 Months</span>
              <span style="font-size:12px; color:#0d9488; font-weight:700;">${rs(m9)}</span>
            </div>

          </div>

          <!-- Buttons -->
          <div class="p-actions" style="display:flex; flex-direction:column; gap:6px; margin-top:auto;" onclick="event.stopPropagation()">
            <button class="btn-action verify-btn" style="width:100%; padding:8px; border-radius:6px; background:#fff; border:1px solid #3b82f6; color:#2563eb; font-weight:700; font-size:12px; cursor:pointer;" onclick="showVerifyForm(${pData})">Verification</button>
            <a class="btn-wa" href="https://wa.me/?text=${msg}" target="_blank" style="width:100%; padding:8px; border-radius:6px; background: #16a34a; color:white; font-weight:700; font-size:12px; text-align:center; text-decoration:none;">Order on WhatsApp</a>
          </div>
        </div>
      </div>`;
    });

    grid.innerHTML = count === 0 ? '<p style="text-align:center;">No products available.</p>' : html;

  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p style="text-align:center; color:var(--bad); grid-column: span 2;">Error loading data.</p>';
  }
}