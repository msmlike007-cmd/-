'use strict';
const NAV=[['home','home','Home'],['animals','paw','Animal Management'],['routine','list','Daily Routine'],['feed','feed','Feeding'],['milk','milk','Milk Management'],['vax','vax','Vaccination Center'],['disease','dis','Disease Information'],['finance','chart','Financial Reports'],['calendar','cal','Calendar'],['files','folder','Photos & Documents'],['notes','note','Notes'],['notify','bell','Notifications'],['settings','set','Settings'],['about','info','About Application']];
const BOTTOM=[['home','home','Home'],['animals','paw','Animals'],['milk','milk','Milk'],['vax','vax','Vaccines'],['more','menu','More']];
const LIVE=['qan','noteQ','fileQ'];
const isDark=()=>{const th=S().theme||'auto';return th==='dark'||(th==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches)};
function route(){const h=(location.hash.replace(/^#\/?/,'')||'home').split('?')[0].split('/');return{name:h[0],args:h.slice(1).map(decodeURIComponent)}}
function render(keep){
 const{name,args}=route(),fn=V[name]||V.home,ae=document.activeElement;let focus=null;
 if(ae&&ae.closest&&ae.closest('#view')&&ae.dataset&&ae.dataset.c){focus={sel:'#view input[data-c="'+ae.dataset.c+'"]'+Object.keys(ae.dataset).filter(k=>k!=='c').map(k=>`[data-${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}="${ae.dataset[k]}"]`).join(''),pos:ae.selectionStart}}
 const y=window.scrollY;Chart.reg={};let r;
 try{r=fn(...args)}catch(e){console.error(e);r={title:'Error',html:`<div class="card"><b class="bad">⚠️ ${esc(e.message)}</b></div>`}}
 $('#view').innerHTML=r.html+'<div class="adslot" hidden data-slot="footer"></div>'+(r.fab?`<button class="fab" data-a="${r.fab}" ${r.fabData||''} aria-label="Add">${ic('plus')}</button>`:'');
 document.title=(r.title?r.title+' · ':'')+'খামার ম্যানেজিং';
 App.chrome(r,name);Chart.mountAll();if(keep)scrollTo(0,y);else scrollTo(0,0);
 if(focus){const el=$(focus.sel);if(el){el.focus();try{el.setSelectionRange(focus.pos,focus.pos)}catch(_){}}}
 App.ads()}
const App={last:null,
 async init(){const st=localStorage.getItem('kh-db')||'khamar-guest';
  try{await DB.open(st)}catch(e){document.body.innerHTML='<p style="padding:20px">Storage is not available in this browser mode.</p>';return}
  seed();await App.afterOpen();
  bus.on(()=>{const a=document.activeElement;if(a&&a.matches&&a.matches('#view input[data-c="milk"]'))return;render(true)});
  addEventListener('hashchange',()=>{$('#side').classList.remove('open');$('#scrim').classList.remove('show');render()});
  if(!location.hash)location.hash='#/home';
  render();
  if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
  Sync.init();
  setInterval(()=>{Calc.autoFeed();Notif.check();if(App.day!==today()){App.day=today();render(true)}else App.chrome()},30000);App.day=today();setTimeout(()=>Notif.check(),1500)},
 async afterOpen(){const s=DB.get('settings');if(s&&s.lang&&s.lang!==LANG){LANG=s.lang;localStorage.setItem('kh-lang',LANG)}document.documentElement.lang=LANG;Calc.autoFeed();App.theme()},
 theme(){document.documentElement.dataset.theme=S().theme||'auto';$('meta[name=theme-color]').content=isDark()?'#14281c':'#1b8a4b'},
 chrome(r,name){r=r||App.last||{};App.last=r;name=name||route().name;const n=Notif.items().filter(i=>i.sticky||i.due).length;
  const cs={synced:'',ok:'',error:'color:#ffb4b4',syncing:'opacity:.6'}[Sync.status]??'opacity:.55';
  $('#top').innerHTML=`<button class="ib menu" data-a="menu" aria-label="Menu">${ic('menu')}</button>${r.back?`<button class="ib" data-a="go" data-h="${r.back}" aria-label="Back">${ic('back')}</button>`:''}<h1>${esc(r.title||'')}</h1><button class="ib" data-a="langToggle" style="font-size:14px;font-weight:700" aria-label="Language">${LANG==='bn'?'EN':'বাং'}</button><button class="ib" data-a="themeToggle" aria-label="Theme">${ic(isDark()?'sun':'moon')}</button><button class="ib" data-a="go" data-h="#/notify" aria-label="Notifications">${ic('bell')}${n?`<span class="badge">${fnum(n,0)}</span>`:''}</button><button class="ib" data-a="go" data-h="#/settings" style="${cs}" title="${t(syncTxt())}" aria-label="Sync">${ic('cloud')}</button>`;
  const cur=name==='animal'?'animals':name;
  $('#side').innerHTML=`<div class="brand"><span class="lg">🐄</span><div>খামার ম্যানেজিং<div class="mut sm" style="font-weight:400">Khamar Managing</div></div></div>`+NAV.map(x=>`<a href="#/${x[0]}" class="${cur===x[0]?'on':''}">${ic(x[1])}<span>${t(x[2])}</span></a>`).join('');
  $('#bnav').innerHTML=BOTTOM.map(x=>x[0]==='more'?`<a data-a="menu">${ic(x[1])}<span>${t(x[2])}</span></a>`:`<a href="#/${x[0]}" class="${cur===x[0]?'on':''}">${ic(x[1])}<span>${t(x[2])}</span></a>`).join('')},
 async ads(){const els=$$('.adslot');if(!els.length||!Sync.ready)return;if(App._ads===undefined){App._ads=null;App._ads=await Sync.adsConfig()}const c=App._ads;if(!c||!c.enabled)return;
  $$('.adslot').forEach(el=>{const s=(c.slots&&c.slots[el.dataset.slot])||c;if(s&&/^https:\/\//.test(s.imageUrl||'')){const link=/^https:\/\//.test(s.link||'')?s.link:'#';el.innerHTML=`<a href="${esc(link)}" target="_blank" rel="noopener sponsored"><img src="${esc(s.imageUrl)}" alt="${t('Sponsored')}"></a>`;el.hidden=false}})}
};
A.menu=()=>{$('#side').classList.toggle('open');$('#scrim').classList.toggle('show')};
$('#scrim').onclick=()=>A.menu();
$('#side').addEventListener('click',e=>{if(e.target.closest('a')){$('#side').classList.remove('open');$('#scrim').classList.remove('show')}});
A.langToggle=()=>A.lang({v:LANG==='bn'?'en':'bn'});
A.themeToggle=async()=>{await setSettings({theme:isDark()?'light':'dark'},true);App.theme();render(true)};
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const f=A[el.dataset.a];if(f){if(el.tagName==='A'&&!el.getAttribute('href'))e.preventDefault();f(el.dataset,el,e)}});
document.addEventListener('change',e=>{const el=e.target,c=el.dataset&&el.dataset.c;if(c&&C[c]&&!LIVE.includes(c))C[c](el.dataset,el)});
document.addEventListener('input',e=>{const el=e.target,c=el.dataset&&el.dataset.c;if(c&&LIVE.includes(c)&&C[c])C[c](el.dataset,el)});
addEventListener('unhandledrejection',e=>console.error('Unhandled',e.reason));
App.init();
