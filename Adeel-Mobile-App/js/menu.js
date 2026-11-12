let openCategories = { 'installment': true };

function renderApp(title, contentHTML) {
  if (!checkAuth()) return;
  
  document.documentElement.style.setProperty('--head-case', D.settings.headCase || 'none');
  document.documentElement.style.setProperty('--head-color', D.settings.headColor || '#000000');
  document.documentElement.style.setProperty('--th-color', D.settings.thColor || '#334155');
  document.documentElement.style.setProperty('--hfs', (D.settings.hfs || 22) + 'px');
  document.documentElement.style.setProperty('--sfs', (D.settings.sfs || 18) + 'px');
  document.documentElement.style.setProperty('--lfs', (D.settings.lfs || 13) + 'px');
  document.documentElement.style.setProperty('--fs', (D.settings.fs || 15) + 'px');
  document.documentElement.style.setProperty('--nfs', (D.settings.nfs || 15) + 'px');
  
  const A = me.role === 'admin';

  const navAdmin = [
    { id: 'installment', cat: 'Installment', items: [
      ['users.html', 'Users', '👥'],
      ['verifications.html', 'Verifications', '✅'],
      ['customers.html', 'Customers', '🤝'],
      ['users.html', 'Performance', '📈'],
      ['my-store.html', 'Website Control', '🌐'],
      ['settings.html', 'Rules', '⚙️']
    ]},
    { id: 'pos', cat: 'POS', items: [
      ['cash-in-hand.html', 'Cash in hand', '💰'],
      ['create-sale.html', 'Sale', '🛒'],
      ['purchase.html', 'Purchase', '📥'],
      ['in-stock.html', 'Stock', '🏢'],
      ['expenses.html', 'Expense', '💸']
    ]},
    { id: 'database', cat: 'Database', items: [
      ['database.html', 'Database', '🗄️']
    ]},
    { id: 'setting', cat: 'Setting', items: [
      ['settings.html', 'Settings', '⚙️']
    ]}
  ];

  const navUser = [
    ['dashboard.html', 'Dashboard', '📊'],
    ['my-store.html', 'My Store', '🌐'],
    ['verifications.html', 'Verifications', '✅'],
    ['my-wallet.html', 'My Wallet', '💳'],
    ['new-sale.html', 'My Sales', '🧾'],
    ['my-customers.html', 'My Customers', '🤝']
  ];
  
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';

  let navHtml = '';
  
  if(A) {
    navHtml = `<a href="dashboard.html" class="nav ${page==='dashboard.html'?'on':''}" style="margin-bottom:10px;"><span>📊</span>Dashboard</a>`;
    
    navHtml += navAdmin.map(group => {
      const isOpen = openCategories[group.id];
      const hasActiveChild = group.items.some(item => item[0] === page);
      
      let btnClass = "nav";
      if (isOpen || hasActiveChild) btnClass += " on";
      
      return `
        <div style="margin-bottom:6px;">
          <!-- Yahan onmousedown add kiya hai jo scroll foran rokta hai -->
          <div class="${btnClass}" onmousedown="event.preventDefault()" onclick="toggleDropdown('${group.id}')" style="justify-content:space-between; cursor:pointer; user-select:none;">
            <span>${group.cat}</span>
            <span style="font-size:12px; transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}; transition:0.3s;">▼</span>
          </div>
          <div id="dd-${group.id}" style="display:${isOpen ? 'block' : 'none'}; padding-left:10px; border-left:2px solid var(--line); margin-left:12px; margin-top:4px;">
            ${group.items.map(n => `
              <a href="${n[0]}" class="nav ${page===n[0]?'on':''}" style="padding:8px 12px;">
                <span>${n[2]}</span>${n[1]}
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } else {
    navHtml = navUser.map(n => `
      <a href="${n[0]}" class="nav ${page===n[0]?'on':''}">
        <span>${n[2]}</span>${n[1]}
      </a>
    `).join('');
  }

  const html = `
  <div class="app">
    <div class="mbar">
      <button class="burger" onclick="toggleMenu()">☰</button>
      <b>${esc(D.settings.shop)}</b>
    </div>
    <div class="scrim" id="scr" onclick="toggleMenu(0)"></div>
    <aside class="side" id="sd">
      <div class="brand" style="margin-bottom:15px;">${esc(D.settings.shop)}</div>
      
      ${navHtml}
      
      <div class="who">
        ${esc(me.name)} (${me.role})<br>
        <button class="btn sec sm" style="margin-top:8px" onclick="logout()">Logout</button>
      </div>
    </aside>
    <main class="main">${contentHTML}</main>
  </div>`;
  
  document.getElementById('root').innerHTML = html;
}

function toggleDropdown(id) {
  const dd = document.getElementById('dd-' + id);
  const btn = dd.previousElementSibling;
  const arrow = btn.querySelector('span:last-child');

  if (dd.style.display === 'none' || dd.style.display === '') {
    dd.style.display = 'block';
    btn.classList.add('on');
    if(arrow) arrow.style.transform = 'rotate(180deg)';
  } else {
    dd.style.display = 'none';
    btn.classList.remove('on');
    if(arrow) arrow.style.transform = 'rotate(0deg)';
  }
}

function toggleMenu(open) {
  const sd = document.getElementById('sd');
  const sc = document.getElementById('scr');
  if (!sd) return;
  const isOpen = open === undefined ? !sd.classList.contains('open') : open;
  sd.classList.toggle('open', isOpen);
  sc.classList.toggle('open', isOpen);
}