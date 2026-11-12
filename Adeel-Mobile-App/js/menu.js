function renderApp(title, contentHTML){
  if(!checkAuth()) return;

  document.documentElement.style.setProperty('--head-case', D.settings.headCase || 'none');
  document.documentElement.style.setProperty('--head-color', D.settings.headColor || '#000000');
  document.documentElement.style.setProperty('--th-color', D.settings.thColor || '#334155');
  document.documentElement.style.setProperty('--hfs', (D.settings.hfs || 22) + 'px');
  document.documentElement.style.setProperty('--sfs', (D.settings.sfs || 18) + 'px');
  document.documentElement.style.setProperty('--lfs', (D.settings.lfs || 13) + 'px');
  document.documentElement.style.setProperty('--fs', (D.settings.fs || 15) + 'px');

  const A = me.role==='admin';
  const navAdmin = [
    ['dashboard.html','Dashboard','📊'],
    ['my-store.html','My Store','🌐'],
    ['users.html','Users','👥'],
    ['products.html','Products','📦'],
    ['in-stock.html','In Stock','🏢'],
    ['cash-in-hand.html','Cash in Hand','💰'],
    ['verifications.html','Verifications','✅'],
    ['customers.html','Customers','🤝'],
    ['new-sale.html','Sale / Purchase','➕'],
    ['settings.html','Settings','⚙️']
  ];
  const navUser = [
    ['dashboard.html','Dashboard','📊'],
    ['my-store.html','My Store','🌐'],
    ['verifications.html','Verifications','✅'],
    ['my-wallet.html','My Wallet','💳'],
    ['new-sale.html','My Sales','🧾'],
    ['my-customers.html','My Customers','🤝']
  ];
  const nav = A ? navAdmin : navUser;
  
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/')+1) || 'dashboard.html';

  const html = `
  <div class="app">
    <div class="mbar">
      <button class="burger" onclick="toggleMenu()">☰</button>
      <b>${esc(D.settings.shop)}</b>
    </div>
    <div class="scrim" id="scr" onclick="toggleMenu(0)"></div>
    <aside class="side" id="sd">
      <div class="brand">${esc(D.settings.shop)}</div>
      ${nav.map(n=>`<a href="${n[0]}" class="nav ${page===n[0]?'on':''}"><span>${n[2]}</span>${n[1]}</a>`).join('')}
      <div class="who">
        ${esc(me.name)} (${me.role})<br>
        <button class="btn sec sm" style="margin-top:8px" onclick="logout()">Logout</button>
      </div>
    </aside>
    <main class="main">${contentHTML}</main>
  </div>`;
  document.getElementById('root').innerHTML = html;
}

function toggleMenu(open){
  const sd = document.getElementById('sd');
  const sc = document.getElementById('scr');
  if(!sd) return;
  const isOpen = open===undefined ? !sd.classList.contains('open') : open;
  sd.classList.toggle('open', isOpen);
  sc.classList.toggle('open', isOpen);
}