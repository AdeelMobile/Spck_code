// ==========================================
// 5. POPUPS (Specs, Price List, Installments)
// ==========================================

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

function showInstallmentPlans(p) {
  const basePrice = p.price || 0;
  
  const advLow = D.settings.advLow || 20;   
  const advHigh = D.settings.advHigh || 30; 
  const mark3 = D.settings.mark3 || 15;
  const mark6 = D.settings.mark6 || 27;
  const mark9 = D.settings.mark9 || 37;

  let advancePct = (basePrice < 60000) ? advLow : advHigh;
  const advance = basePrice * (advancePct / 100);
  
  const totalPrice3 = basePrice + (basePrice * mark3 / 100);
  const totalPrice6 = basePrice + (basePrice * mark6 / 100);
  const totalPrice9 = basePrice + (basePrice * mark9 / 100);

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

function closeModal() {
  document.getElementById('infoModal').classList.remove('open');
}