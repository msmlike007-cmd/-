'use strict';
/* ===== Utilities ===== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>iso(new Date());
const parseD=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const addDays=(s,n)=>{const d=parseD(s);d.setDate(d.getDate()+n);return iso(d)};
const diffDays=(a,b)=>Math.round((parseD(b)-parseD(a))/864e5);
const wkStart=s=>{const d=parseD(s);d.setDate(d.getDate()-((d.getDay()+1)%7));return iso(d)}; // week starts Saturday
const monthEnd=s=>{const d=parseD(s);return iso(new Date(d.getFullYear(),d.getMonth()+1,0))};
const num=v=>Number(v)||0;
const sum=(a,f)=>a.reduce((x,y)=>x+num(f?f(y):y),0);
const by=(f,desc)=>(a,b)=>{const x=f(a),y=f(b);return(x>y?1:x<y?-1:0)*(desc?-1:1)};
const debounce=(f,ms)=>{let h;return(...a)=>{clearTimeout(h);h=setTimeout(()=>f(...a),ms)}};

/* ===== Language & formatting ===== */
let LANG=localStorage.getItem('kh-lang')||'bn';
const bd=s=>s.replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
function t(k,v){let s=(LANG==='bn'&&window.BN&&BN[k])||k;if(v)s=s.replace(/\{(\w+)\}/g,(m,x)=>v[x]!==undefined?v[x]:m);return LANG==='bn'?bd(String(s)):String(s)}
const L=p=>p?p[LANG==='bn'?1:0]||p[0]:'';          // pick from [en,bn]
const loc=(r,f)=>(LANG==='bn'&&r.i18n&&r.i18n.bn&&r.i18n.bn[f]!==undefined?r.i18n.bn[f]:r[f])||'';
const LOC=()=>LANG==='bn'?'bn-BD':'en-GB';
const fnum=(x,d=2)=>Number(x||0).toLocaleString(LANG==='bn'?'bn-BD':'en-US',{maximumFractionDigits:d});
const cur=()=>(S().cur||'৳');
const money=x=>cur()+fnum(x,2);
const fdate=s=>s?new Intl.DateTimeFormat(LOC(),{day:'numeric',month:'short',year:'numeric'}).format(parseD(s)):'—';
const fmon=s=>new Intl.DateTimeFormat(LOC(),{month:'short',year:'2-digit'}).format(parseD(s+'-01'));
const fmonL=s=>new Intl.DateTimeFormat(LOC(),{month:'long',year:'numeric'}).format(parseD(s+'-01'));
const fday=s=>new Intl.DateTimeFormat(LOC(),{day:'numeric',month:'short'}).format(parseD(s));
const ftime=s=>s?(LANG==='bn'?bd(s):s):'';
const ago=(s)=>{const d=diffDays(s,today());return d===0?t('today'):d>0?t('{n} days ago',{n:d}):t('in {n} days',{n:-d})};

/* ===== Icons ===== */
const IC={home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',paw:'<circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 11c-3 0-6 4-5 7 .6 2 2.5 2 5 1.2 2.5.8 4.4.8 5-1.2 1-3-2-7-5-7z"/>',feed:'<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',milk:'<path d="M12 2.7S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.3-7-12.3z"/>',vax:'<path d="M18 2l4 4M17 7l3-3M19 9l-8.7 8.7a2 2 0 0 1-2.8 0L6.3 16.5a2 2 0 0 1 0-2.8L15 5M9 11l4 4M5 19l-3 3M14 4l6 6"/>',dis:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',chart:'<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',note:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',check:'<path d="M20 6L9 17l-5-5"/>',search:'<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',back:'<path d="M15 18l-6-6 6-6"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',cloud:'<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>',dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',ul:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',sync:'<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 15-3.4L23 10M1 14l4.5 4.4A9 9 0 0 0 20.5 15"/>',alert:'<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',chev:'<path d="M9 18l6-6-6-6"/>',cam:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'};
const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]||''}</svg>`;

/* ===== Database (IndexedDB + in-memory mirror) ===== */
const DB={db:null,mem:new Map(),name:'',
 open(name){return new Promise((res,rej)=>{if(this.db)this.db.close();this.name=name;localStorage.setItem('kh-db',name);
  const rq=indexedDB.open(name,1);
  rq.onupgradeneeded=()=>rq.result.createObjectStore('r',{keyPath:'id'});
  rq.onerror=()=>rej(rq.error);
  rq.onsuccess=()=>{this.db=rq.result;this.mem=new Map();const c=this.db.transaction('r').objectStore('r').openCursor();
   c.onsuccess=e=>{const cur=e.target.result;if(cur){this.mem.set(cur.value.id,cur.value);cur.continue()}else res()}}})},
 persist(r){return new Promise(res=>{try{const tx=this.db.transaction('r','readwrite');tx.objectStore('r').put(r);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)}catch(e){res(false)}})},
 records(){return[...this.mem.values()]},
 list(col){const o=[];for(const r of this.mem.values())if(r.col===col&&!r.deleted)o.push(r);return o},
 get(id){const r=this.mem.get(id);return r&&!r.deleted?r:null},
 async save(col,o,opt={}){o.col=col;if(!o.id)o.id=uid();if(!o.created)o.created=Date.now();o.updatedAt=Date.now();o.dirty=1;delete o.deleted;this.mem.set(o.id,o);await this.persist(o);if(!opt.silent)bus.emit();Sync.soon();return o},
 async remove(id,opt={}){const r=this.mem.get(id);if(!r)return;r.deleted=1;r.updatedAt=Date.now();r.dirty=1;await this.persist(r);if(!opt.silent)bus.emit();Sync.soon()},
 async restore(id){const r=this.mem.get(id);if(!r)return;delete r.deleted;r.updatedAt=Date.now();r.dirty=1;await this.persist(r);bus.emit();Sync.soon()},
 async raw(r){this.mem.set(r.id,r);await this.persist(r)},
 async wipe(){return new Promise(res=>{const tx=this.db.transaction('r','readwrite');tx.objectStore('r').clear();tx.oncomplete=()=>{this.mem=new Map();res()}})}
};
const bus={f:[],on(f){this.f.push(f)},emit:debounce(()=>bus.f.forEach(f=>f()),30)};
const S=()=>DB.get('settings')||{id:'settings',col:'settings'};
const DEF_SLOTS=()=>[{id:'morning',key:'morning',name:'',time:'06:00',remind:true},{id:'evening',key:'evening',name:'',time:'17:00',remind:true}];
const slots=()=>S().slots||DEF_SLOTS();
const slotName=s=>s.key==='morning'?t('Morning'):s.key==='evening'?t('Evening'):s.name;
async function setSettings(p,silent){const s=Object.assign({id:'settings'},S(),p);await DB.save('settings',s,{silent})}
function seed(){ // reference data (local only, never overwrites cloud edits: updatedAt=0, not dirty)
 VAXG.forEach((g,i)=>{const id='g-'+i;if(DB.mem.has(id))return;const r={id,col:'vaxguide',grp:g[0],name:g[1],when:g[3],interval:g[5],notes:g[6],src:SRC,i18n:{bn:{name:g[2],when:g[4],notes:g[7]}},updatedAt:0,created:0,dirty:0};DB.mem.set(id,r);DB.persist(r)});
}

/* ===== Domain calculations ===== */
const Calc={
 animals(cat){return DB.list('animals').filter(a=>!cat||a.cat===cat)},
 evs(a,type){return DB.list('events').filter(e=>e.animalId===a.id&&(!type||e.type===type))},
 heads(a){if(!CAT(a.cat).flock)return a.sellDate?0:1;const ev=DB.list('events').filter(e=>e.animalId===a.id);return Math.max(0,num(a.count)-sum(ev.filter(e=>e.type==='mortality'||e.type==='sale'),e=>e.qty)+sum(ev.filter(e=>e.type==='hatch'),e=>e.qty))},
 occ(k,d){const s=k.date;if(!s||d<s)return false;if(k.until&&d>k.until)return false;const r=k.repeat||'none',n=diffDays(s,d);
  return r==='none'?n===0:r==='daily'?true:r==='weekly'?n%7===0:r==='monthly'?parseD(d).getDate()===parseD(s).getDate():false},
 done(k,d){return(k.repeat||'none')==='none'?!!k.done:(k.doneDates||[]).includes(d)},
 tasksOn(d){return DB.list('tasks').filter(k=>Calc.occ(k,d)).sort(by(k=>k.time||'99'))},
 remsOn(d){return DB.list('reminders').filter(k=>Calc.occ(k,d)).sort(by(k=>k.time||'99'))},
 stock(f){return sum(DB.list('feedbuy').filter(b=>b.feedId===f.id),b=>b.qty)-sum(DB.list('feedlog').filter(l=>l.feedId===f.id),l=>l.qty)},
 feedInfo(f){const st=Math.max(0,Calc.stock(f)),du=num(f.dailyUse),days=du>0?st/du:null,low=(f.minStock!==''&&f.minStock!=null&&st<=num(f.minStock))||(days!==null&&days<=num(S().lowDays??5))||(st<=0&&DB.list('feedbuy').some(b=>b.feedId===f.id));return{st,days,low}},
 autoFeed(){const td=today();let ch=false;DB.list('feeds').forEach(f=>{if(!f.auto||num(f.dailyUse)<=0)return;const buys=DB.list('feedbuy').filter(b=>b.feedId===f.id).sort(by(b=>b.date));if(!buys.length)return;
  let from=f.startDate&&f.startDate>buys[0].date?f.startDate:buys[0].date;const min=addDays(td,-400);if(from<min)from=min;
  for(let d=from;d<=td;d=addDays(d,1)){const id=`auto-${f.id}-${d}`;if(DB.mem.has(id))continue;DB.mem.set(id,{id,col:'feedlog',feedId:f.id,date:d,qty:num(f.dailyUse),auto:1,created:Date.now(),updatedAt:Date.now(),dirty:1});DB.persist(DB.mem.get(id));ch=true}});if(ch)Sync.soon()},
 breed(a){const c=CAT(a.cat),rec=DB.list('breeding').filter(b=>b.animalId===a.id).sort(by(b=>b.date)),td=today();
  const items=rec.map((b,i)=>({...b,no:i+1,days:diffDays(b.date,td)}));const last=items[items.length-1];
  const gest=c.gest||num(a.gest)||0;let est=null,miles=[];
  if(last&&gest&&last.result!=='no'){est=addDays(last.date,gest);const m=(MILES[c.g]||[]);miles=m.map(x=>({day:x[0],date:addDays(last.date,x[0]),txt:x[1]}))}
  return{items,last,gest,est,miles,estDays:est?diffDays(td,est):null}},
 milkDay(d,aid){return DB.list('milk').filter(m=>m.date===d&&(!aid||m.animalId===aid))},
 milkSum(from,to,aid){return sum(DB.list('milk').filter(m=>m.date>=from&&m.date<=to&&(!aid||m.animalId===aid)),m=>m.qty)},
 eggSum(from,to,aid,cat){return sum(DB.list('events').filter(e=>e.type==='egg'&&e.date>=from&&e.date<=to&&(!aid||e.animalId===aid)&&(!cat||e.cat===cat)),e=>e.qty)},
 range(p,c){const td=today();const ms=td.slice(0,7)+'-01';
  if(p==='today')return[td,td];if(p==='week'){const w=wkStart(td);return[w,addDays(w,6)]}
  if(p==='month')return[ms,monthEnd(td)];if(p==='prev'){const pe=addDays(ms,-1);return[pe.slice(0,7)+'-01',pe]}
  if(p==='custom'&&c)return[c[0]||'0000-01-01',c[1]||'9999-12-31'];return['0000-01-01','9999-12-31']},
 fin(from,to){const r=DB.list('finance').filter(f=>f.date>=from&&f.date<=to);const inc=sum(r.filter(f=>f.type==='income'),f=>f.amount),exp=sum(r.filter(f=>f.type==='expense'),f=>f.amount);return{rows:r,inc,exp,net:inc-exp}},
 nextVax(){const td=today();return DB.list('vax').filter(v=>v.next&&v.remind!==false).map(v=>({...v,left:diffDays(td,v.next)})).sort(by(v=>v.next))},
 vaxStatus(v){if(!v.next)return null;if(v.remind===false)return{k:'off',t:'Reminder off',c:''};const d=diffDays(today(),v.next);return d<0?{k:'over',t:'Overdue by {n} days',n:-d,c:'bad'}:d<=7?{k:'soon',t:'Due in {n} days',n:d,c:'warn'}:{k:'ok',t:'Due in {n} days',n:d,c:''}}
};
// Automatic income/expense entries linked to source records (deterministic id => no duplicates)
async function autoFin(id,data){const ex=DB.mem.get(id);if(!data){if(ex&&!ex.deleted)await DB.remove(id,{silent:true});return}
 const o=Object.assign({},ex||{},{id,auto:1},data);await DB.save('finance',o,{silent:true})}
function syncAnimalFin(a){const c=CAT(a.cat);
 autoFin('fin-buy-'+a.id,num(a.purchasePrice)>0?{type:'expense',cat:'animal',amount:num(a.purchasePrice)*(c.flock?1:1),date:a.purchaseDate||today(),note:(a.name||'')+' ('+L(c.n)+')',animalId:a.id}:null);
 autoFin('fin-sell-'+a.id,!c.flock&&a.sellDate&&num(a.sellPrice)>0?{type:'income',cat:'animal',amount:num(a.sellPrice),date:a.sellDate,note:a.name||'',animalId:a.id}:null)}

/* ===== UI helpers ===== */
const UI={
 modal(html,cls=''){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="sheet ${cls}">${html}</div>`;m.addEventListener('mousedown',e=>{if(e.target===m)UI.close(m)});document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add('show'));return m},
 close(m){m=m||$$('.modal').pop();if(!m)return;m.classList.remove('show');setTimeout(()=>m.remove(),200)},
 toast(msg,undo){const d=document.createElement('div');d.className='toast';d.innerHTML=`<span>${esc(msg)}</span>${undo?`<button>${t('Undo')}</button>`:''}`;$('#toasts').appendChild(d);if(undo)$('button',d).onclick=()=>{undo();d.remove()};setTimeout(()=>d.remove(),undo?6500:2800)},
 confirm(msg,ok='Delete'){return new Promise(res=>{const m=UI.modal(`<p style="margin:4px 0 14px;font-size:17px">${esc(msg)}</p><div class="row end"><button class="btn" data-x="0">${t('Cancel')}</button><button class="btn ${ok==='Delete'?'danger':'pri'}" data-x="1">${t(ok)}</button></div>`,'small');m.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(b){UI.close(m);res(b.dataset.x==='1')}})})},
 async del(id,label,after){if(!await UI.confirm(t('Delete "{n}"? You can undo right after.',{n:label||t('this record')})))return;await DB.remove(id);if(after)after();UI.toast(t('Deleted'),()=>DB.restore(id))},
 form(cfg){const vals={...(cfg.values||{})};const F=cfg.fields;
  const row=f=>{if(f.type==='h')return`<h4>${t(f.label)}</h4>`;const v=vals[f.k]??f.def??'';let inp;
   switch(f.type){
    case'select':inp=`<select name="${f.k}">${f.opts.map(o=>`<option value="${esc(o[0])}" ${String(o[0])===String(v)?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`;break;
    case'textarea':inp=`<textarea name="${f.k}" rows="3">${esc(v)}</textarea>`;break;
    case'check':return`<div class="fld" data-k="${f.k}"><label class="chk"><input type="checkbox" name="${f.k}" ${v?'checked':''}><span>${t(f.label)}</span></label></div>`;
    case'image':inp=`<div class="imgfld"><img ${v?`src="${v}"`:'style="visibility:hidden"'}><div><input type="file" accept="image/*" data-img="${f.k}"><small>${t('Photo is resized to save space')}</small></div><input type="hidden" name="${f.k}" value="${v&&v.length<4e5?esc(v):''}" data-big="${v&&v.length>=4e5?'1':''}"></div>`;break;
    case'file':inp=`<input type="file" data-file="${f.k}" ${f.accept?`accept="${f.accept}"`:''}><input type="hidden" name="${f.k}"><small data-fn="${f.k}"></small>`;break;
    default:inp=`<input name="${f.k}" type="${f.type||'text'}" ${f.type==='number'?'step="any" inputmode="decimal"':''} value="${esc(v)}" ${f.list?`list="dl_${f.k}"`:''} ${f.ph?`placeholder="${esc(t(f.ph))}"`:''}>${f.list?`<datalist id="dl_${f.k}">${f.list.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`:''}`}
   return`<div class="fld" data-k="${f.k}"><label>${t(f.label)}${f.req?' *':''}</label>${inp}${f.hint?`<small>${t(f.hint)}</small>`:''}</div>`};
  const m=UI.modal(`<h2><span>${t(cfg.title)}</span><button class="ib" style="color:var(--mut)" data-x>${ic('x')}</button></h2><form novalidate>${F.map(row).join('')}<div class="row end" style="margin-top:8px"><button type="button" class="btn" data-x>${t('Cancel')}</button><button class="btn pri" type="submit">${t(cfg.submit||'Save')}</button></div></form>`);
  const fm=$('form',m);
  const read=()=>{const o={};F.forEach(f=>{if(f.type==='h')return;const el=fm.elements[f.k];if(!el)return;if(f.type==='check')o[f.k]=el.checked;else if(f.type==='number')o[f.k]=el.value===''?'':Number(el.value);else if(f.type==='image'&&el.dataset.big&&!el.value)o[f.k]=vals[f.k];else o[f.k]=typeof el.value==='string'&&f.type!=='textarea'?el.value.trim():el.value});return o};
  const vis=()=>{const o=read();F.forEach(f=>{if(f.if){const d=$(`[data-k="${f.k}"]`,fm);if(d)d.hidden=!f.if(o)}})};
  vis();
  m.addEventListener('click',e=>{if(e.target.closest('[data-x]')){e.preventDefault();UI.close(m)}});
  fm.addEventListener('change',async e=>{const el=e.target;
   if(el.dataset.img){const f=el.files[0];if(f){const d=await imgData(f);fm.elements[el.dataset.img].value=d;fm.elements[el.dataset.img].dataset.big='';$('img',el.closest('.imgfld')).src=d;$('img',el.closest('.imgfld')).style.visibility='visible'}}
   else if(el.dataset.file){const f=el.files[0];if(f){if(f.size>6e6){UI.toast(t('File too large (max 6 MB)'));el.value='';return}const d=await fileData(f);fm.elements[el.dataset.file].value=d;vals['_'+el.dataset.file]={name:f.name,type:f.type,size:f.size};$(`[data-fn="${el.dataset.file}"]`,fm).textContent=f.name;if(fm.elements.name&&!fm.elements.name.value)fm.elements.name.value=f.name}}
   vis();if(cfg.onChange)cfg.onChange(el.name,fm,read)});
  fm.addEventListener('submit',async e=>{e.preventDefault();const o=read();let bad=false;F.forEach(f=>{const d=$(`[data-k="${f.k}"]`,fm);if(!d)return;const miss=f.req&&!d.hidden&&(o[f.k]===''||o[f.k]==null);d.classList.toggle('bad',miss);if(miss)bad=true});
   if(bad){UI.toast(t('Please fill the required fields'));return}
   Object.keys(vals).filter(k=>k[0]==='_').forEach(k=>o[k]=vals[k]);
   const r=await cfg.onSave(o);if(r!==false)UI.close(m)});
  setTimeout(()=>{const f=$('input:not([type=hidden]):not([type=file]),select',fm);if(f&&!/Android|iPhone/i.test(navigator.userAgent))f.focus()},250);return m}
};
function imgData(file,max=720,q=.72){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q))};im.onerror=()=>res('');im.src=r.result};r.readAsDataURL(file)})}
function fileData(file){return new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file)})}
function download(name,text,type='application/json'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}

/* ===== Notifications (in-app + OS notifications while app is open) ===== */
const Notif={
 items(){const now=new Date(),td=iso(now),out=[],hm=pad(now.getHours())+':'+pad(now.getMinutes());
  Calc.tasksOn(td).forEach(k=>{if(!Calc.done(k,td))out.push({id:'t'+k.id+td,when:k.time||'08:00',title:k.name,body:t('Task'),kind:'task',icon:(KINDS.find(x=>x[0]===k.kind)||[0,0,'📋'])[2],link:'#/routine'})});
  Calc.remsOn(td).forEach(k=>{if(!Calc.done(k,td))out.push({id:'r'+k.id+td,when:k.time||'08:00',title:k.name,body:t('Reminder'),kind:'rem',icon:'⏰',link:'#/notify'})});
  slots().forEach(s=>{if(s.remind!==false&&DB.list('animals').some(a=>a.cat==='dairycow'&&!a.sellDate))out.push({id:'m'+s.id+td,when:s.time,title:t('Milking time')+' — '+slotName(s),body:t('Milk Management'),kind:'milk',icon:'🥛',link:'#/milk'})});
  Calc.nextVax().forEach(v=>{if(v.left<=7)out.push({id:'v'+v.id+td,when:'08:00',title:t('Vaccination due')+': '+v.vaccine,body:v.left<0?t('Overdue by {n} days',{n:-v.left}):v.left===0?t('today'):t('Due in {n} days',{n:v.left}),kind:'vax',icon:'💉',link:'#/vax',sticky:true})});
  DB.list('animals').filter(a=>CAT(a.cat).breed&&!a.sellDate).forEach(a=>{const b=Calc.breed(a);if(b.est&&b.estDays<=14&&b.estDays>=-7)out.push({id:'e'+a.id+b.est,when:'08:00',title:t('Delivery expected soon')+': '+a.name,body:fdate(b.est)+' ('+t('estimate')+')',kind:'breed',icon:'🍼',link:'#/animal/'+a.id,sticky:true});
   b.miles.forEach(m=>{const d=diffDays(td,m.date);if(d>=0&&d<=2)out.push({id:'b'+a.id+m.date,when:'08:00',title:a.name+': '+L(m.txt),body:fdate(m.date)+' ('+t('estimate')+')',kind:'breed',icon:'📅',link:'#/animal/'+a.id,sticky:true})})});
  DB.list('feeds').forEach(f=>{const i=Calc.feedInfo(f);if(i.low)out.push({id:'f'+f.id+td,when:'08:00',title:t('Low feed stock')+': '+f.name,body:fnum(i.st)+' '+(f.unit||'kg'),kind:'feed',icon:'🌾',link:'#/feed',sticky:true})});
  return out.map(o=>({...o,due:o.sticky||o.when<=hm,hm})).sort(by(o=>o.when))},
 async show(title,body,link){try{const reg=await navigator.serviceWorker?.getRegistration();if(reg)reg.showNotification(title,{body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:title,data:link});else new Notification(title,{body,icon:'icons/icon-192.png'})}catch(e){try{new Notification(title,{body})}catch(_){}}},
 check(){if(!('Notification'in window)||Notification.permission!=='granted'||S().notif===false)return;const fired=JSON.parse(localStorage.getItem('kh-fired')||'{}'),td=today(),now=new Date(),hm=pad(now.getHours())+':'+pad(now.getMinutes());
  Object.keys(fired).forEach(k=>{if(fired[k]!==td)delete fired[k]});
  this.items().forEach(i=>{if(fired[i.id])return;const diff=(now.getHours()*60+now.getMinutes())-(+i.when.slice(0,2)*60+ +i.when.slice(3,5));if(i.when<=hm&&diff<=45){fired[i.id]=td;this.show(i.title,i.body,i.link)}else if(i.when<=hm)fired[i.id]=td});
  localStorage.setItem('kh-fired',JSON.stringify(fired))},
 async ask(){if(!('Notification'in window)){UI.toast(t('Notifications are not supported in this browser'));return}const p=await Notification.requestPermission();UI.toast(p==='granted'?t('Notifications enabled'):t('Notifications blocked — allow them in browser settings'));bus.emit()}
};

/* ===== Cloud: Google sign-in + Firestore sync ===== */
const Sync={cfg:window.FIREBASE_CONFIG||{},ready:false,user:null,status:'off',err:'',busy:false,
 enabled(){return!!(this.cfg.apiKey&&this.cfg.projectId&&this.cfg.appId)},
 loadJs(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})},
 async init(){if(!this.enabled()){this.status='unconfigured';return}
  try{const v='10.12.2',b=`https://www.gstatic.com/firebasejs/${v}/firebase-`;
   for(const m of['app','auth','firestore','storage'])if(m!=='storage'||this.cfg.storageBucket)await this.loadJs(`${b}${m}-compat.js`);
   firebase.initializeApp(this.cfg);this.auth=firebase.auth();this.fs=firebase.firestore();this.st=this.cfg.storageBucket?firebase.storage():null;this.ready=true;this.status='signedout';
   this.auth.getRedirectResult().catch(e=>{this.err=e.message});
   this.auth.onAuthStateChanged(u=>this.onUser(u))}catch(e){this.status='offline';this.err='Could not load cloud services (offline?)'}bus.emit()},
 async onUser(u){this.user=u;const want='khamar-'+(u?u.uid:'guest');
  if(DB.name!==want){const old=DB.name==='khamar-guest'&&u?DB.records().filter(r=>r.updatedAt>0&&r.col!=='settings'&&!r.deleted):[];
   await DB.open(want);
   if(old.length&&!DB.records().some(r=>r.updatedAt>0&&r.col!=='settings')){if(await UI.confirm(t('Copy the {n} records saved on this device into your account?',{n:old.length}),'Copy')){for(const r of old)await DB.raw({...r,dirty:1})}}
   seed();await App.afterOpen()}
  this.status=u?'idle':'signedout';bus.emit();if(u)this.sync()},
 async login(){if(!this.ready){UI.toast(t(this.enabled()?'Cloud services unavailable offline':'Cloud is not configured yet — see SETUP.md'));return}
  const p=new firebase.auth.GoogleAuthProvider();try{await this.auth.signInWithPopup(p)}catch(e){if(/popup|cancelled/.test(e.code||''))try{await this.auth.signInWithRedirect(p)}catch(_){UI.toast(e.message)}else UI.toast(e.message)}},
 async logout(){if(!await UI.confirm(t('Sign out? Your data stays on this device inside your account and syncs again when you sign in.'),'Sign out'))return;await this.sync();await this.auth.signOut()},
 soon:debounce(()=>Sync.sync(),2500),
 async sync(){if(!this.ready||!this.user||!navigator.onLine||this.busy)return;this.busy=true;this.status='syncing';bus.emit();
  try{const uid=this.user.uid,col=this.fs.collection(`users/${uid}/records`);
   const dirty=DB.records().filter(r=>r.dirty&&r.updatedAt>0);
   for(let i=0;i<dirty.length;i+=150){const chunk=dirty.slice(i,i+150),batch=this.fs.batch(),snap=[];
    for(const r of chunk){if(r.col==='files'&&r.data&&!r.remoteUrl&&this.st){try{const ref=this.st.ref(`users/${uid}/files/${r.id}`);await ref.putString(r.data,'data_url');r.remoteUrl=await ref.getDownloadURL()}catch(e){this.err='File upload: '+e.message}}
     const d=JSON.parse(JSON.stringify(r));delete d.dirty;if(d.remoteUrl)delete d.data;else if(d.data&&d.data.length>9e5){delete d.data;d.tooBig=true}
     batch.set(col.doc(r.id),d);snap.push([r,r.updatedAt])}
    await batch.commit();for(const[r,u]of snap)if(r.updatedAt===u){r.dirty=0;await DB.persist(r)}}
   const key='kh-pull-'+uid,since=Number(localStorage.getItem(key)||0);
   const q=await col.where('updatedAt','>',Math.max(0,since-120000)).orderBy('updatedAt').get();let max=since,ch=0;
   for(const d of q.docs){const r=d.data(),loc=DB.mem.get(r.id);max=Math.max(max,r.updatedAt||0);
    if(!loc||(r.updatedAt||0)>(loc.updatedAt||0)){const n={...r,dirty:0};if(loc&&loc.data&&!n.data)n.data=loc.data;await DB.raw(n);ch++}}
   localStorage.setItem(key,String(max));this.status='ok';this.err='';this.last=Date.now();if(ch){Calc.autoFeed();bus.emit()}
  }catch(e){this.status='error';this.err=e.message||String(e)}finally{this.busy=false;bus.emit()}},
 async restoreAll(){if(!this.user)return;localStorage.removeItem('kh-pull-'+this.user.uid);await this.sync();UI.toast(t('Restore finished'))},
 async adsConfig(){if(!this.ready)return null;try{const d=await this.fs.doc('config/ads').get();return d.exists?d.data():null}catch(e){return null}}
};
addEventListener('online',()=>{Sync.sync();bus.emit()});addEventListener('offline',()=>bus.emit());
