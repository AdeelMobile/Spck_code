const K='adeelmobile_v3',uid=()=>Math.random().toString(36).slice(2,9);
const seed=()=>({
  settings:{shop:'Adeel Mobile',phone:'0321-4265688',addr:'411 Chowk Shalamar, Shalimar Link Road, Lahore',markup:20,theme:'classic',fs:15,hfs:22,sfs:18,lfs:13},
  users:[{id:'u0',name:'Administrator',username:'admin',pass:'admin123',role:'admin',phone:'',active:true,biz:'',addr:'',target:0,brandMarkup:{},wallet:0}],
  products:[
    {id:'p1',brand:'Samsung',name:'Galaxy A15 128GB',price:48000,stock:10,img:''},
    {id:'p2',brand:'Infinix',name:'Hot 40 Pro',price:42000,stock:8,img:''},
    {id:'p3',brand:'Tecno',name:'Spark 20',price:38000,stock:6,img:''},
    {id:'p4',brand:'Apple',name:'iPhone 13 128GB',price:165000,stock:3,img:''}
  ],
  sales:[],verifications:[],purchases:[],cashbook:[],wallets:[],expenses:[] // Expenses add kiya
});

let D;try{D=JSON.parse(localStorage.getItem(K))}catch(e){}D=D||seed();
if(!D.verifications)D.verifications=[];
if(!D.purchases)D.purchases=[];
if(!D.cashbook)D.cashbook=[];
if(!D.wallets)D.wallets=[];
if(!D.expenses)D.expenses=[]; // Purane data me expenses array check kiya
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}};
D.settings={...seed().settings,...D.settings};

const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs=n=>'Rs '+Math.round(n).toLocaleString('en-PK');
const v=id=>$(id).value;
const calc=(p,a,m,k)=>{const t=p*(1+k/100),r=Math.max(t-a,0);return{t,r,m:r/Math.max(m,1)}};
const paid=s=>s.advance+s.payments.reduce((a,p)=>a+p.amt,0);
const wa=n=>{n=String(n||D.settings.phone).replace(/\D/g,'');return n.startsWith('0')?'92'+n.slice(1):n};

let me=null;
try{const s=sessionStorage.getItem('am_s');if(s)me=D.users.find(u=>u.id===s&&u.active)||null}catch(e){}

function checkAuth(){
  if(!me){window.location.href='index.html';return false;}
  return true;
}

function modal(h){
  let m = document.getElementById('modal');
  if(!m) { m = document.createElement('div'); m.id='modal'; document.body.appendChild(m); }
  m.innerHTML=h?`<div class="ov" onclick="if(event.target==this)modal()"><div class="md">${h}</div></div>`:'';
}

function logout(){
  me=null;
  try{sessionStorage.removeItem('am_s')}catch(e){}
  window.location.href='index.html';
}