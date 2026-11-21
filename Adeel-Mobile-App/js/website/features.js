// ==========================================
// 4. SHARE POPUPS, MENU & BUDGET CALCULATOR
// ==========================================

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