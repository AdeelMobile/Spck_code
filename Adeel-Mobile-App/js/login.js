// ==========================================
// LOGIN LOGIC
// ==========================================

if(typeof me !== 'undefined' && me) {
  if (me.role === 'admin' && me.username === 'admin') {
    window.location.href='admin-dashboard.html';
  } else {
    window.location.href='user-dashboard.html'; 
  }
}

async function doLogin(){
  const user = v('lu').trim();
  const pass = v('lp');
  const remember = document.getElementById('rm').checked;

  const btn = document.querySelector('.btn');
  btn.innerText = 'Signing in...';
  btn.disabled = true;

  if(!user || !pass) {
    document.getElementById('err').innerText = 'Please enter username and password';
    btn.innerText = 'Login';
    btn.disabled = false;
    return;
  }

  try {
    const { data, error } = await supabaseClient.rpc('check_login', {
      p_username: user,
      p_password: pass
    });

    if(error) {
      document.getElementById('err').innerText = 'Error: ' + error.message;
      btn.innerText = 'Login';
      btn.disabled = false;
      return;
    }

    if(!data || data.success === false) {
      document.getElementById('err').innerText = data.message || 'Invalid credentials';
      btn.innerText = 'Login';
      btn.disabled = false;
      return;
    }

    const dbUser = data.user;
    
    if(remember){
      localStorage.setItem('am_remember', JSON.stringify({u: user, p: pass}));
    } else {
      localStorage.removeItem('am_remember');
    }

    let userRole = 'user';
    if (user.toLowerCase() === 'admin') {
        userRole = 'admin';
    }

    const loggedInUser = {
      id: dbUser.id,
      name: dbUser.name || 'User',
      username: dbUser.login_username,
      role: userRole, 
      active: true,
      phone: dbUser.contact || '',
      biz: '',
      addr: dbUser.address || '',
      target: dbUser.sale_target || 0,
      wallet: 0,
      brandMarkup: {}
    };

    localStorage.setItem('am_user', JSON.stringify(loggedInUser));
    window.me = loggedInUser; 
    
    if (userRole === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'user-dashboard.html'; 
    }

  } catch (err) {
    document.getElementById('err').innerText = 'Catch Error: ' + err.message;
    btn.innerText = 'Login';
    btn.disabled = false;
  }
}

function togglePass(){
  const p = document.getElementById('lp');
  const i = document.getElementById('eyeIcon');
  if(p.type === 'password'){ p.type = 'text'; i.innerText = '🙈'; } 
  else { p.type = 'password'; i.innerText = '👁️'; }
}

let savedUser = '';
let savedPass = '';
let isRemembered = false;

try {
  const saved = JSON.parse(localStorage.getItem('am_remember'));
  if(saved) { savedUser = saved.u || ''; savedPass = saved.p || ''; isRemembered = true; }
} catch(e){}

document.getElementById('root').innerHTML = `
<div class="login">
  <div class="card">
    <h1 style="color:var(--pri);text-align:center">${esc(D.settings.shop)}</h1>
    <p style="color:var(--mute);text-align:center;margin:6px 0 20px">Sign in to your account</p>
    <label>Username</label>
    <input id="lu" autocomplete="username" placeholder="Enter username" value="${esc(savedUser)}">
    <label>Password</label>
    <div class="pass-wrap">
      <input id="lp" type="password" autocomplete="current-password" placeholder="Enter password" value="${esc(savedPass)}" onkeydown="if(event.key=='Enter')doLogin()">
      <button class="eye-btn" onclick="togglePass()" id="eyeIcon" type="button">👁️</button>
    </div>
    <div class="remember-wrap">
      <input type="checkbox" id="rm" ${isRemembered?'checked':''}>
      <label for="rm" style="margin:0;cursor:pointer;">Remember Me</label>
    </div>
    <p id="err" style="color:var(--bad);min-height:18px;font-size:13px;text-align:center;margin-top:10px"></p>
    <button class="btn" style="width:100%;padding:12px;font-size:16px" onclick="doLogin()">Login</button>
    <p class="hint" style="text-align:center;margin-top:16px">First time: admin / 0000</p>
  </div>
</div>`;