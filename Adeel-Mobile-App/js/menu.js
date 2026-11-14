let openCategories = {}; 

// --- ICONS SET (SVG) ---
const ICONS = {
  dashboard: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  users: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  verify: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  customers: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
  performance: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
  website: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
  rules: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
  cash: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>',
  sale: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
  purchase: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
  stock: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
  expense: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
  database: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
  settings: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  wallet: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
  credits: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
  social: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
  ai: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><circle cx="7.5" cy="14.5" r="1.5"></circle><circle cx="16.5" cy="14.5" r="1.5"></circle></svg>',
  appearance: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>',
  installment: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
  pos: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16.01" y2="14"></line><line x1="12" y1="14" x2="12.01" y2="14"></line><line x1="8" y1="14" x2="8.01" y2="14"></line><line x1="16" y1="18" x2="16.01" y2="18"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="8" y1="18" x2="8.01" y2="18"></line></svg>',
  design: '<svg width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
};

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
    { id: 'installment', cat: 'Installment', icon: ICONS.installment, items: [
      ['users.html', 'Users', ICONS.users],
      ['verifications.html', 'Verifications', ICONS.verify],
      ['customers.html', 'Customers', ICONS.customers],
      ['users.html', 'Performance', ICONS.performance],
      ['my-store.html', 'Website Control', ICONS.website],
      ['settings.html', 'Rules', ICONS.rules]
    ]},
    { id: 'pos', cat: 'POS', icon: ICONS.pos, items: [
      ['cash-in-hand.html', 'Cash in hand', ICONS.cash],
      ['create-sale.html', 'Sale', ICONS.sale],
      ['purchase.html', 'Purchase', ICONS.purchase],
      ['in-stock.html', 'Stock', ICONS.stock],
      ['expenses.html', 'Expense', ICONS.expense]
    ]},
    { id: 'database', cat: 'Database', icon: ICONS.database, items: [
      ['database.html', 'Product Updates', ICONS.database]
    ]},
    { id: 'credits', cat: 'Credits & Debits', icon: ICONS.credits, items: [
      ['credits-debits.html', 'Accounts', ICONS.credits]
    ]},
    { id: 'social', cat: 'Social Media', icon: ICONS.social, items: [
      ['social-media.html', 'Content', ICONS.social]
    ]},
    { id: 'ai', cat: 'AI Agents', icon: ICONS.ai, items: [
      ['ai-agents.html', 'AI Agents', ICONS.ai]
    ]},
    { id: 'appearance', cat: 'Design Studio', icon: ICONS.design, items: [
      ['design-studio.html?tab=adminpanel', 'Admin Design', ICONS.dashboard],
      ['design-studio.html?tab=userdash', 'User Design', ICONS.users],
      ['design-studio.html?tab=website', 'Website Design', ICONS.website],
      ['design-studio.html?tab=themes', 'Theme', ICONS.rules],
      ['design-studio.html?tab=global', 'Global Settings', ICONS.settings]
    ]},
    { id: 'setting', cat: 'Setting', icon: ICONS.settings, items: [
      ['settings.html', 'Settings', ICONS.settings]
    ]}
  ];

  const navUser = [
    ['dashboard.html', 'Dashboard', ICONS.dashboard],
    ['my-store.html', 'My Store', ICONS.website],
    ['verifications.html', 'Verifications', ICONS.verify],
    ['my-wallet.html', 'My Wallet', ICONS.wallet],
    ['new-sale.html', 'My Sales', ICONS.sale],
    ['my-customers.html', 'My Customers', ICONS.customers]
  ];
  
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';

  let navHtml = '';
  
  if(A) {
    navHtml = `<a href="dashboard.html" class="nav ${page==='dashboard.html'?'on':''}" style="margin-bottom:10px;"><span>${ICONS.dashboard}</span>Dashboard</a>`;
    
    navHtml += navAdmin.map(group => {
      const isOpen = openCategories[group.id];
      const hasActiveChild = group.items.some(item => item[0].split('?')[0] === page);
      
      let btnClass = "nav";
      if (isOpen || hasActiveChild) btnClass += " on";
      
      return `
        <div style="margin-bottom:6px;">
          <div class="${btnClass}" onmousedown="event.preventDefault()" onclick="toggleDropdown('${group.id}')" style="justify-content:space-between; cursor:pointer; user-select:none;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="cat-icon">${group.icon}</span>
              <span>${group.cat}</span>
            </div>
            <span class="arrow-icon" style="font-size:12px; transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}; transition:0.3s;">▼</span>
          </div>
          <div id="dd-${group.id}" style="display:${isOpen ? 'block' : 'none'}; padding-left:10px; border-left:2px solid var(--line); margin-left:12px; margin-top:4px;">
            ${group.items.map(n => `
              <a href="${n[0]}" class="nav ${page===n[0]?'on':''}" style="padding:8px 12px; gap:10px;">
                <span style="display:flex; align-items:center; justify-content:center;">${n[2]}</span>${n[1]}
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } else {
    navHtml = navUser.map(n => `
      <a href="${n[0]}" class="nav ${page===n[0]?'on':''}" style="gap:10px;">
        <span style="display:flex; align-items:center; justify-content:center;">${n[2]}</span>${n[1]}
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
  const arrow = btn.querySelector('.arrow-icon');

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
} // <--- YEH BRACKET MISSING THA, AB ADD KAR DIYA HAI