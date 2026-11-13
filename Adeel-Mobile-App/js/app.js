const K='adeelmobile_v3',uid=()=>Math.random().toString(36).slice(2,9);

// --- SUPABASE SETUP START ---
const SB_URL = 'https://nqihozwbdrvpyalctwbc.supabase.co';
const SB_KEY = 'sb_publishable_KQG5u2pwI4QjgYMZsJ97Kw_sTPH1OeL';
let supabaseClient = null;

// Debug Box Function
function showDebug(msg, color) {
  let dbg = document.getElementById('debug-box');
  if(!dbg) {
    dbg = document.createElement('div');
    dbg.id = 'debug-box';
    dbg.style.cssText = 'position:fixed; bottom:10px; left:10px; right:10px; background:#fff; border:2px solid '+color+'; color:'+color+'; padding:10px; border-radius:8px; z-index:99999; font-size:12px; font-weight:bold; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.2);';
    document.body.appendChild(dbg);
  }
  dbg.innerText = msg;
  setTimeout(() => { if(dbg) dbg.remove(); }, 10000);
}

// Library check aur load function
function initSupabase() {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SB_URL, SB_KEY);
    console.log('Supabase connected successfully!');
    fetchTestData();
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
      supabaseClient = window.supabase.createClient(SB_URL, SB_KEY);
      console.log('Supabase connected successfully (auto loaded)!');
      fetchTestData();
    };
    script.onerror = () => {
      showDebug("❌ Library Load Nahi Hui (Network Error)!", "#ef4444");
    };
    document.head.appendChild(script);
  }
}

window.addEventListener('load', initSupabase);

// --- DATA FETCH TEST ---
async function fetchTestData() {
  if(!supabaseClient) return;
  
  try {
    const { data: models, error: mErr } = await supabaseClient.from('models').select('*').limit(5);
    if(mErr) throw mErr;

    const { data: variants, error: vErr } = await supabaseClient.from('variants').select('*').limit(5);
    if(vErr) throw vErr;

    console.log("--- MODELS DATA ---", models);
    console.log("--- VARIANTS DATA ---", variants);

    if(models && variants) {
      showDebug(`✅ Data Mil Gaya! Models: ${models.length}, Variants: ${variants.length}`, "#10b981");
    }

  } catch (err) {
    console.error(err);
    showDebug("⚠️ Data Fetch Error: " + err.message, "#f59e0b");
  }
}
// --- SUPABASE SETUP END ---

const seed=()=>({
  settings:{shop:'Adeel Mobile',phone:'0321-4265688',addr:'411 Chowk Shalamar, Shalimar Link Road, Lahore',markup:20,theme:'classic',fs:15,hfs:22,sfs:18,lfs:13,nfs:15},
  users:[{id:'u0',name:'Administrator',username:'admin',pass:'admin123',role:'admin',phone:'',active:true,biz:'',addr:'',target:0,brandMarkup:{},wallet:0}],
  products:[
    {id:'p1',brand:'Samsung',name:'Galaxy A15 128GB',price:48000,stock:10,img:''},
    {id:'p2',brand:'Infinix',name:'Hot 40 Pro',price:42000,stock:8,img:''},
    {id:'p3',brand:'Tecno',name:'Spark 20',price:38000,stock:6,img:''},
    {id:'p4',brand:'Apple',name:'iPhone 13 128GB',price:165000,stock:3,img:''}
  ],
  sales:[],verifications:[],purchases:[],cashbook:[],wallets:[],expenses:[]
});

let D;try{D=JSON.parse(localStorage.getItem(K))}catch(e){}D=D||seed();
if(!D.verifications)D.verifications=[];
if(!D.purchases)D.purchases=[];
if(!D.cashbook)D.cashbook=[];
if(!D.wallets)D.wallets=[];
if(!D.expenses)D.expenses=[];
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}};
D.settings={...seed().settings,...D.settings};

const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs=n=>'Rs '+Math.round(n).toLocaleString('en-PK');
const v=id=>$(id).value;
const calc=(p,a,m,k)=>{const t=p*(1+k/100),r=Math.max(t-a,0);return{t,r,m:r/Math.max(m,1)}};
const paid=s=>s.advance+s.payments.reduce((a,p)=>a+p.amt,0);
const wa=n=>{n=String(n||D.settings.phone).replace(/\D/g,'');return n.startsWith('0')?'92'+n.slice(1):n};

// CHANGE 1: Yahan sessionStorage ki jagah localStorage kar diya hai
let me=null;
try{const s=localStorage.getItem('am_user');if(s)me=JSON.parse(s)}catch(e){}

function checkAuth(){
  if(!me){window.location.href='index.html';return false;}
  return true;
}

function modal(h){
  let m = document.getElementById('modal');
  if(!m) { m = document.createElement('div'); m.id='modal'; document.body.appendChild(m); }
  m.innerHTML=h?`<div class="ov" onclick="if(event.target==this)modal()"><div class="md">${h}</div></div>`:'';
}

// CHANGE 2: Logout mein bhi localStorage kar diya hai
function logout(){
  me=null;
  try{localStorage.removeItem('am_user')}catch(e){}
  window.location.href='index.html';
}