'use strict';
/* Views part 1: shared helpers, Home, Animals, Animal profile, Breeding, Events */
const V={},A={},Q={},C={};
const card=(title,body,link)=>`<div class="card">${title?`<h3><span class="sp">${title}</span>${link||''}</h3>`:''}${body}</div>`;
const more=(href,label='See all')=>`<a href="${href}">${t(label)}</a>`;
const empty=(msg,btn)=>`<div class="empty">${t(msg)}${btn?`<div style="margin-top:10px">${btn}</div>`:''}</div>`;
const phHtml=(a,sz=52)=>`<div class="ph" style="width:${sz}px;height:${sz}px;font-size:${sz*.55}px">${a&&a.photo?`<img src="${a.photo}">`:CAT(a?a.cat:'other').e}</div>`;
const aName=id=>{const a=DB.mem.get(id);return a?a.name:'—'};
const catOpts=(list=CATS)=>list.map(c=>[c.id,c.e+' '+L(c.n)]);
const animalOpts=(cat,all)=>[['','— '+t('None / whole category')+' —']].concat(Calc.animals().filter(a=>(!cat||a.cat===cat||(cat==='*'))&&(all||!a.sellDate)).map(a=>[a.id,CAT(a.cat).e+' '+a.name]));
const EVT={egg:['🥚','Egg collection'],hatch:['🐣','Hatching / chicks'],mortality:['⚠️','Mortality'],sale:['💰','Sale'],feed:['🌾','Feed consumption'],health:['🩺','Health record'],birth:['🍼','Birth record'],custom:['📌','Custom record']};
const evTypes=a=>{const c=CAT(a.cat);return c.flock?[...(c.egg?['egg']:[]),'hatch','mortality','sale','feed','health','custom']:['health',...(c.birth?['birth']:[]),'custom']};
const detail=(title,rows)=>UI.modal(`<h2><span>${esc(title)}</span><button class="ib" style="color:var(--mut)" data-x>${ic('x')}</button></h2>${rows||empty('No records')}`).addEventListener('click',e=>{if(e.target.closest('[data-x]'))UI.close()});
function actDesc(r){switch(r.col){
 case'animals':return['🐾',t('Animal')+': '+r.name];
 case'events':return[EVT[r.type]?EVT[r.type][0]:'📌',t(EVT[r.type]?EVT[r.type][1]:'Record')+(r.qty?' · '+fnum(r.qty):'')+' — '+aName(r.animalId)];
 case'breeding':return['💉',t('Insemination recorded')+' — '+aName(r.animalId)];
 case'milk':return['🥛',t('Milk')+': '+fnum(r.qty)+' L'];
 case'vax':return['💉',t('Vaccination')+': '+r.vaccine];
 case'finance':return['💰',(r.type==='income'?t('Income'):t('Expense'))+': '+money(r.amount)];
 case'feedbuy':return['🌾',t('Feed purchased')+': '+fnum(r.qty)];
 case'tasks':return['📋',r.name];case'reminders':return['⏰',r.name];case'notes':return['📝',r.title];case'files':return['📎',r.name];default:return null}}

/* ---------- Home ---------- */
V.home=()=>{const td=today(),st=S(),an=DB.list('animals'),hd=cs=>sum(an.filter(a=>cs.includes(a.cat)),a=>Calc.heads(a));
 const stats=[['cow',['dairycow','cattle'],'🐄','Cows'],['goat',['goat'],'🐐','Goats'],['duck',['duck'],'🦆','Ducks'],['chicken',['chicken'],'🐔','Chickens'],['pigeon',['pigeon'],'🕊️','Pigeons']];
 const [f,tt]=Calc.range('month'),fin=Calc.fin(f,tt);
 const feeding=Calc.tasksOn(td).filter(k=>k.kind==='feeding'),
  milking=DB.list('animals').some(a=>a.cat==='dairycow'&&!a.sellDate)||Calc.milkDay(td).length?slots().map(s=>({s,q:sum(Calc.milkDay(td).filter(m=>m.slotId===s.id),m=>m.qty),has:Calc.milkDay(td).some(m=>m.slotId===s.id)})):[];
 const vax=Calc.nextVax().filter(v=>v.left<=30).slice(0,5);
 const rem=[];for(let i=0;i<7&&rem.length<6;i++){const d=addDays(td,i);[...Calc.remsOn(d),...Calc.tasksOn(d).filter(k=>k.kind!=='feeding')].forEach(k=>{if(rem.length<6&&!Calc.done(k,d))rem.push({k,d})})}
 const feeds=DB.list('feeds').map(x=>({x,i:Calc.feedInfo(x)}));
 const acts=DB.records().filter(r=>!r.deleted&&!r.auto&&r.updatedAt>0&&actDesc(r)).sort(by(r=>r.updatedAt,1)).slice(0,8);
 const tk=(k,d)=>`<div class="li"><input type="checkbox" style="width:22px;height:22px;accent-color:var(--g)" data-c="tick" data-id="${k.id}" data-d="${d}" ${Calc.done(k,d)?'checked':''}><div class="t"><b style="${Calc.done(k,d)?'text-decoration:line-through;opacity:.6':''}">${esc(k.name)}</b><small>${k.time?ftime(k.time)+' · ':''}${k.cat?esc(L(CAT(k.cat).n)):t('Whole farm')}</small></div></div>`;
 return{title:st.farm||'আমার খামার',html:`
 ${heroHtml(fin,an)}
 ${quickHtml()}
 <div class="grid gauto" style="margin-bottom:12px">${stats.map(s=>`<div class="stat" data-a="go" data-h="#/animals/${s[1][0]}"><div class="em">${s[2]}</div><div><b>${fnum(hd(s[1]),0)}</b><small>${t(s[3])}</small></div></div>`).join('')}</div>
 <div id="adslot-home" class="adslot" hidden data-slot="home"></div>
 <div class="two"><div>
 ${projHome()}
 ${card('🌾 '+t("Today's feeding schedule"),feeding.length?feeding.map(k=>tk(k,td)).join(''):empty('No feeding routine for today',`<a class="btn sm pri" href="#/routine">${t('Add routine')}</a>`),more('#/routine'))}
 ${card('🥛 '+t("Today's milking schedule"),milking.length?milking.map(m=>`<div class="li click" data-a="go" data-h="#/milk"><div class="em">🥛</div><div class="t"><b>${esc(slotName(m.s))} · ${ftime(m.s.time)}</b><small>${m.has?fnum(m.q)+' '+t('litres recorded'):t('Not recorded yet')}</small></div>${m.has?`<span class="pill">${ic('check','sm')}</span>`:`<span class="pill warn">${t('Pending')}</span>`}</div>`).join(''):empty('No dairy cows yet'),more('#/milk'))}
 ${card('💉 '+t('Upcoming vaccinations'),vax.length?vax.map(v=>{const s=Calc.vaxStatus(v);return`<div class="li click" data-a="go" data-h="#/vax"><div class="em">💉</div><div class="t"><b>${esc(v.vaccine)}</b><small>${v.animalId?esc(aName(v.animalId)):esc(L(CAT(v.cat||'other').n))} · ${fdate(v.next)}</small></div><span class="pill ${s.c}">${t(s.t,{n:s.n})}</span></div>`}).join(''):empty('No vaccinations due in the next 30 days'),more('#/vax'))}
 ${card('⏰ '+t('Upcoming reminders'),rem.length?rem.map(r=>`<div class="li"><input type="checkbox" style="width:22px;height:22px;accent-color:var(--g)" data-c="tick" data-id="${r.k.id}" data-d="${r.d}"><div class="t"><b>${esc(r.k.name)}</b><small>${fdate(r.d)}${r.k.time?' · '+ftime(r.k.time):''}</small></div></div>`).join(''):empty('No upcoming reminders'),more('#/notify'))}
 </div><div>
 ${card('💰 '+t('This month'),`<div class="sum3"><div class="card"><small>${t('Income')}</small><b class="ok">${money(fin.inc)}</b></div><div class="card"><small>${t('Expenses')}</small><b class="bad">${money(fin.exp)}</b></div><div class="card"><small>${t('Profit / Loss')}</small><b class="${fin.net<0?'bad':'ok'}">${money(fin.net)}</b></div></div>`,more('#/finance'))}
 ${card('📦 '+t('Current feed inventory'),feeds.length?feeds.slice(0,6).map(({x,i})=>`<div class="li click" data-a="go" data-h="#/feed"><div class="em">🌾</div><div class="t"><b>${esc(x.name)}</b><small>${i.days!==null?t('about {n} days left',{n:fnum(i.days,0)}):''}</small></div><b class="${i.low?'bad':''}">${fnum(i.st)} ${esc(x.unit||'kg')}</b>${i.low?`<span class="pill bad">${t('Low')}</span>`:''}</div>`).join(''):empty('No feed recorded yet',`<a class="btn sm pri" href="#/feed">${t('Add feed')}</a>`),more('#/feed'))}
 ${card('🕘 '+t('Recent farm activities'),acts.length?acts.map(r=>{const d=actDesc(r);return`<div class="li"><div class="em">${d[0]}</div><div class="t"><b>${esc(d[1])}</b><small>${fdate(iso(new Date(r.updatedAt)))}</small></div></div>`}).join(''):empty('Your activities will appear here'))}
 </div></div>`}};
A.go=d=>{location.hash=d.h};
A.tick=async(d,el)=>{const k=DB.get(d.id);if(!k)return;if((k.repeat||'none')==='none')k.done=el.checked;else{const s=new Set(k.doneDates||[]);el.checked?s.add(d.d):s.delete(d.d);k.doneDates=[...s]}await DB.save(k.col,k)};

/* ---------- Animals ---------- */
V.animals=cat=>{if(!cat)return{title:t('Animal Management'),html:`<div class="grid gauto">${CATS.map(c=>{const an=Calc.animals(c.id);return`<div class="stat" data-a="go" data-h="#/animals/${c.id}" style="flex-direction:column;text-align:center;padding:18px 8px"><div class="catic" style="width:68px;height:68px;font-size:40px;border-radius:20px">${c.e}</div><div><b style="font-size:17px">${L(c.n)}</b><small>${fnum(sum(an,a=>Calc.heads(a)),0)} ${t(c.flock?'birds':'animals')}</small></div></div>`}).join('')}</div>`};
 const c=CAT(cat),q=(Q['an'+cat]||'').toLowerCase(),all=Calc.animals(cat),list=all.filter(a=>!q||(a.name+' '+(a.breed||'')).toLowerCase().includes(q)).sort(by(a=>(a.sellDate?'1':'0')+a.name.toLowerCase()));
 const [tw,tp]=Calc.range('week'),[ms,me]=Calc.range('month'),td=today(),act=all.filter(a=>!a.sellDate);
 const eggs=c.egg?card('🥚 '+t('Egg production'),`<div class="sum3"><div class="card"><small>${t('Today')}</small><b>${fnum(Calc.eggSum(td,td,0,cat),0)}</b></div><div class="card"><small>${t('This week')}</small><b>${fnum(Calc.eggSum(tw,tp,0,cat),0)}</b></div><div class="card"><small>${t('This month')}</small><b>${fnum(Calc.eggSum(ms,me,0,cat),0)}</b></div></div>${Chart.html(eggChart(cat))}<div class="row" style="margin-top:8px"><button class="btn pri sm" data-a="addEgg" data-cat="${cat}">${ic('plus','sm')} ${t('Record eggs')}</button><button class="btn sm" data-a="eggSale">${ic('cash','sm')} ${t('Record egg sale')}</button></div>`):'';
 const flock=c.flock&&act.length?`<div class="sum3"><div class="card"><small>${t('Birds')}</small><b>${fnum(sum(act,a=>Calc.heads(a)),0)}</b></div><div class="card"><small>${t('Mortality')}</small><b>${fnum(sum(DB.list('events').filter(e=>e.type==='mortality'&&e.cat===cat),e=>e.qty),0)}</b></div><div class="card"><small>${t('Chicks hatched')}</small><b>${fnum(sum(DB.list('events').filter(e=>e.type==='hatch'&&e.cat===cat),e=>e.qty),0)}</b></div></div>`:'';
 return{title:L(c.n),back:'#/animals',fab:'addAnimal',fabData:`data-cat="${cat}"`,html:`
 <div class="card row"><div class="catic" style="width:60px;height:60px;font-size:34px">${c.e}</div><div class="grow"><b style="font-size:19px">${L(c.n)}</b><div class="mut">${fnum(sum(act,a=>Calc.heads(a)),0)} ${t(c.flock?'birds':'animals')} · ${fnum(all.length,0)} ${t('profiles')}</div></div><button class="btn pri" data-a="addAnimal" data-cat="${cat}">${ic('plus','sm')} ${t('Add')}</button></div>
 ${c.milk?`<a class="btn" href="#/milk" style="width:100%;margin-bottom:12px">🥛 ${t('Open Milk Management')}</a>`:''}${flock}${eggs}
 <div class="search">${ic('search')}<input data-c="qan" data-cat="${cat}" placeholder="${t('Search by name or breed')}" value="${esc(Q['an'+cat]||'')}"></div>
 <div class="card">${list.length?list.map(a=>`<div class="li click" data-a="go" data-h="#/animal/${a.id}">${phHtml(a)}<div class="t"><b>${esc(a.name)}</b><small>${esc([a.breed,a.age].filter(Boolean).join(' · '))}</small></div>${a.sellDate?`<span class="pill warn">${t('Sold')}</span>`:c.flock?`<span class="pill">${fnum(Calc.heads(a),0)} ${t('birds')}</span>`:''}${ic('chev')}</div>`).join(''):empty(all.length?'No matching records':'No records yet — tap Add',all.length?'':`<button class="btn pri" data-a="addAnimal" data-cat="${cat}">${ic('plus','sm')} ${t('Add')}</button>`)}</div>`}};
function eggChart(cat){const b=buckets('daily',14);return{type:'bar',labels:b.map(x=>x.label),full:b.map(x=>x.full),series:[{name:t('Eggs'),data:b.map(x=>Calc.eggSum(x.from,x.to,0,cat)),color:'#e0a02b'}],fmt:v=>fnum(v,0),onClick:i=>{const r=DB.list('events').filter(e=>e.type==='egg'&&e.cat===cat&&e.date===b[i].from);detail(b[i].full,r.length?r.map(e=>`<div class="li"><div class="em">🥚</div><div class="t"><b>${esc(aName(e.animalId))}</b></div><b>${fnum(e.qty,0)}</b></div>`).join(''):'')}}}
A.eggSale=()=>finForm('income',{cat:'egg'});
C.qan=(d,el)=>{Q['an'+d.cat]=el.value;render(true)};
function animalForm(a,cat){const edit=!!a;a=a||{cat:cat||'dairycow',purchaseDate:today(),projLen:cat==='cattle'?3:'',projUnit:'month'};
 UI.form({title:edit?'Edit animal':'Add animal / bird',values:a,fields:[
 {k:'name',label:'Name or ID',req:1},{k:'cat',label:'Animal type',type:'select',opts:catOpts()},{k:'photo',label:'Photo',type:'image'},
 {k:'count',label:'Number of birds',type:'number',req:1,if:o=>CAT(o.cat).flock},{k:'breed',label:'Breed'},{k:'age',label:'Age (if known)',ph:'e.g. 2 years'},{k:'ageDays',label:AL.ageDays(),type:'number',if:o=>CAT(o.cat).flock,hint:AL.ageHint()},{k:'weight',label:'Weight (kg, optional)',type:'number'},
 {k:'purchaseDate',label:'Purchase date',type:'date'},{k:'purchasePrice',label:'Purchase price',type:'number'},
 {k:'gest',label:'Gestation period (days)',type:'number',if:o=>o.cat==='other',hint:'Used to estimate delivery date'},
 {k:'health',label:'Health information',type:'textarea'},{k:'feeding',label:'Feeding information',type:'textarea'},{k:'notes',label:'Notes',type:'textarea'},
 {k:'h1',type:'h',label:AL.proj()},{k:'projLen',label:AL.projLen(),type:'number',hint:AL.projHint()},{k:'projUnit',label:AL.projUnit(),type:'select',opts:[['month',AL.month()],['day',AL.day()]]}],
 onSave:async o=>{const n=Object.assign({},a,o);if(!n.name)n.name=defName(n);if(!edit&&n.cat!=='dairycow'&&n.projLen===''&&(n.cat==='cattle'))n.projLen=3,n.projUnit='month';const s=await DB.save('animals',n);syncAnimalFin(s);if(!edit)location.hash='#/animal/'+s.id}})}
A.addAnimal=d=>animalForm(null,d.cat);
A.editAnimal=d=>animalForm(DB.get(d.id));
A.delAnimal=async d=>{const a=DB.get(d.id);if(!await UI.confirm(t('Delete "{n}"? You can undo right after.',{n:a.name})))return;await DB.remove(a.id);await autoFin('fin-buy-'+a.id,null);await autoFin('fin-sell-'+a.id,null);location.hash='#/animals/'+a.cat;UI.toast(t('Deleted'),async()=>{await DB.restore(a.id);syncAnimalFin(DB.get(a.id));bus.emit()})};

/* ---------- Animal profile ---------- */
V.animal=id=>{const a=DB.get(id);if(!a)return{title:t('Not found'),back:'#/animals',html:empty('This record was deleted')};
 const c=CAT(a.cat),td=today(),ev=Calc.evs(a).sort(by(e=>e.date,1)),b=c.breed?Calc.breed(a):null;
 const kv=(k,v)=>v||v===0?`<div><small>${t(k)}</small>${v}</div>`:'';
 const evRow=e=>{const T=EVT[e.type]||EVT.custom;return`<div class="li"><div class="em">${T[0]}</div><div class="t"><b>${esc(e.type==='custom'&&e.title?e.title:t(T[1]))}${e.qty!==''&&e.qty!=null?' · '+fnum(e.qty,2):''}${num(e.amount)?' · '+money(e.amount):''}</b><small>${fdate(e.date)}${e.note?' · '+esc(e.note):''}</small></div><button class="ib" style="color:var(--mut)" data-a="editEv" data-id="${e.id}">${ic('edit','sm')}</button><button class="ib" style="color:var(--bad)" data-a="delEv" data-id="${e.id}">${ic('trash','sm')}</button></div>`};
 const vx=DB.list('vax').filter(v=>v.animalId===a.id).sort(by(v=>v.date,1)),fl=DB.list('files').filter(f=>f.animalId===a.id).sort(by(f=>f.created,1)),fi=DB.list('finance').filter(f=>f.animalId===a.id).sort(by(f=>f.date,1));
 const breedHtml=b?card('🍼 '+t('Breeding / Insemination'),`
  ${b.last?`<div class="kv" style="margin-bottom:10px"><div><small>${t('Last insemination')}</small><b>${fdate(b.last.date)}</b></div><div><small>${t('Days elapsed')}</small><b>${dmFrom(b.last.date)}</b></div>${b.est?`<div style="grid-column:1/3;background:var(--gl);padding:8px 10px;border-radius:12px"><small>${t('Estimated delivery date (estimate only)')}</small><b>${fdate(b.est)}</b> <span class="mut">(${b.estDays>=0?t('in {n} days',{n:b.estDays}):t('{n} days ago',{n:-b.estDays})})</span><br><small>${t('Based on a {n}-day gestation. Actual dates vary.',{n:b.gest})}</small></div>`:''}</div>`:empty('No insemination recorded yet')}
  ${b.items.slice().reverse().map(r=>`<div class="li"><div class="em">💉</div><div class="t"><b>${t('Insemination #{n}',{n:r.no})} — ${fdate(r.date)}</b><small>${r.days>=0?(r.days===0?t('Insemination was performed today'):t('Insemination was performed {n} days ago',{n:r.days})):''}${r.days>0?' ('+dmFrom(r.date)+')':''}${r.mode?' · '+t(r.mode):''}${r.semen?' · 🧬 '+esc(r.semen):''}${r.tech?' · 👨‍⚕️ '+esc(r.tech):''}${r.bull?' · '+esc(r.bull):''}${r.note?' · '+esc(r.note):''}</small></div>${r.result==='yes'?`<span class="pill">${t('Pregnant')}</span>`:r.result==='no'?`<span class="pill bad">${t('Not pregnant')}</span>`:''}<button class="ib" style="color:var(--mut)" data-a="editBreed" data-id="${r.id}">${ic('edit','sm')}</button><button class="ib" style="color:var(--bad)" data-a="delBreed" data-id="${r.id}">${ic('trash','sm')}</button></div>`).join('')}
  ${b.miles.length?`<h4>${t('Estimated milestones')}</h4>${b.miles.map(m=>`<div class="li"><div class="em">${m.date<td?'✅':'📅'}</div><div class="t"><b>${L(m.txt)}</b><small>${fdate(m.date)} · ${t('day {n}',{n:m.day})} (${t('estimate')})</small></div></div>`).join('')}`:''}
  <button class="btn pri sm" style="margin-top:8px" data-a="addBreed" data-id="${a.id}">${ic('plus','sm')} ${t('Add insemination')}</button>`):'';
 const milkHtml=c.milk?card('🥛 '+t('Milk production'),`<div class="sum3"><div class="card"><small>${t('Today')}</small><b>${fnum(Calc.milkSum(td,td,a.id))} L</b></div><div class="card"><small>${t('Last 7 days')}</small><b>${fnum(Calc.milkSum(addDays(td,-6),td,a.id))} L</b></div><div class="card"><small>${t('This month')}</small><b>${fnum(Calc.milkSum(td.slice(0,7)+'-01',td,a.id))} L</b></div></div><a class="btn sm" href="#/milk">${t('Open Milk Management')}</a>`):'';
 return{title:a.name,back:'#/animals/'+a.cat,html:`
 <div class="card"><div class="row" style="align-items:flex-start">${phHtml(a,84)}<div class="grow"><div class="row sb"><b style="font-size:20px">${esc(a.name)}</b><button class="ib" style="color:var(--mut)" data-a="animMenu" data-id="${a.id}" aria-label="Menu">${ic('more')}</button></div><div class="mut">${c.e} ${L(c.n)}${a.breed?' · '+esc(a.breed):''}</div>${a.sellDate?`<span class="pill warn">${t('Sold')} ${fdate(a.sellDate)}</span>`:''}${c.flock?`<span class="pill">${fnum(Calc.heads(a),0)} ${t('birds')}</span>`:''}</div></div>
 <div class="kv" style="margin-top:12px">${kv('Purchase date',a.purchaseDate?fdate(a.purchaseDate):'')}${kv('Purchase price',num(a.purchasePrice)?money(a.purchasePrice):'')}${kv('Age',esc(a.age||''))}${kv('Weight',a.weight?fnum(a.weight)+' kg':'')}${c.flock?kv('Initial number',fnum(a.count,0)):''}${kv(AL.held(),a.purchaseDate?dmFrom(a.purchaseDate,a.sellDate):'')}</div>
 ${a.health?`<h4>${t('Health information')}</h4><div>${esc(a.health)}</div>`:''}${a.feeding?`<h4>${t('Feeding information')}</h4><div>${esc(a.feeding)}</div>`:''}${a.notes?`<h4>${t('Notes')}</h4><div>${esc(a.notes)}</div>`:''}
 </div>
 ${projCard(a)}${pnlCard(a)}${breedHtml}${milkHtml}${feedGuideCard(a)}
 ${card('📌 '+t('Records & history'),(ev.length?ev.map(evRow).join(''):empty('No records yet'))+`<div class="row" style="margin-top:8px">${evTypes(a).map(x=>`<button class="btn sm" data-a="addEv" data-id="${a.id}" data-type="${x}">${EVT[x][0]} ${t(EVT[x][1])}</button>`).join('')}</div>`)}
 ${card('💉 '+t('Vaccination'),(vx.length?vx.map(v=>vaxRow(v)).join(''):empty('No vaccination records'))+`<button class="btn sm pri" style="margin-top:8px" data-a="addVax" data-id="${a.id}">${ic('plus','sm')} ${t('Add vaccination')}</button>`)}
 ${card('📎 '+t('Photos & documents'),(fl.length?fl.map(f=>fileRow(f)).join(''):empty('No files attached'))+`<button class="btn sm pri" style="margin-top:8px" data-a="addFile" data-id="${a.id}">${ic('plus','sm')} ${t('Attach file')}</button>`)}
 ${card('💰 '+t('Income & expenses'),(fi.length?fi.map(f=>finRow(f)).join(''):empty('No entries'))+`<div class="row" style="margin-top:8px"><button class="btn sm" data-a="addFin" data-type="income" data-id="${a.id}">${ic('plus','sm')} ${t('Income')}</button><button class="btn sm" data-a="addFin" data-type="expense" data-id="${a.id}">${ic('plus','sm')} ${t('Expense')}</button></div>`)}
 ${todoCard(a)}`}};

/* ---------- Breeding ---------- */
function breedForm(r,aid){UI.form({title:r?'Edit insemination':'Add insemination',values:r||{date:today(),result:'',mode:'AI'},fields:[
 {k:'date',label:'Insemination date',type:'date',req:1},{k:'mode',label:'Method',type:'select',opts:[['AI',t('Artificial insemination')],['Natural',t('Natural mating')]]},
 {k:'semen',label:AL.semen()},{k:'tech',label:AL.tech()},{k:'result',label:'Pregnancy result',type:'select',opts:[['',t('Pending / unknown')],['yes',t('Pregnant')],['no',t('Not pregnant')]]},{k:'note',label:'Notes',type:'textarea'}],
 onSave:async o=>{await DB.save('breeding',Object.assign({},r||{animalId:aid},o))}})}
A.addBreed=d=>breedForm(null,d.id);A.editBreed=d=>breedForm(DB.get(d.id));
A.delBreed=d=>UI.del(d.id,t('Insemination'));

/* ---------- Events ---------- */
function eventForm(e,aid,type){const a=DB.get(aid||e.animalId),c=CAT(a.cat);e=e||{date:today(),type};
 const feeds=DB.list('feeds');
 UI.form({title:EVT[e.type][1],values:e,fields:[
 {k:'type',label:'Record type',type:'select',opts:evTypes(a).map(x=>[x,EVT[x][0]+' '+t(EVT[x][1])])},
 {k:'date',label:'Date',type:'date',req:1},{k:'title',label:'Title',if:o=>o.type==='custom'},
 {k:'qty',label:'Quantity',type:'number',if:o=>['egg','hatch','mortality','sale','birth','feed'].includes(o.type),req:0,hint:'e.g. number of eggs, birds or kg'},
 {k:'amount',label:'Total sale price',type:'number',if:o=>o.type==='sale'},
 {k:'feedId',label:'Deduct from feed stock',type:'select',opts:[['','— '+t('Do not deduct')+' —']].concat(feeds.map(f=>[f.id,f.name])),if:o=>o.type==='feed'&&feeds.length},
 {k:'note',label:'Notes',type:'textarea'}],
 onSave:async o=>{const n=Object.assign({},e,o,{animalId:a.id,cat:a.cat});
  if(n.type==='egg'&&!n.id)n.id=`egg-${a.id}-${n.date}`;
  const s=await DB.save('events',n,{silent:true});
  await autoFin('fin-ev-'+s.id,s.type==='sale'&&num(s.amount)>0?{type:'income',cat:c.flock?'bird':'animal',amount:num(s.amount),date:s.date,note:a.name+' ×'+(s.qty||''),animalId:a.id}:null);
  const lid='fl-'+s.id;if(s.type==='feed'&&s.feedId&&num(s.qty)>0)await DB.save('feedlog',Object.assign({},DB.mem.get(lid)||{},{id:lid,feedId:s.feedId,date:s.date,qty:num(s.qty),animalId:a.id}),{silent:true});else if(DB.get(lid))await DB.remove(lid,{silent:true});
  bus.emit()}})}
A.addEv=d=>eventForm(null,d.id,d.type);A.editEv=d=>eventForm(DB.get(d.id));
A.delEv=d=>{const e=DB.get(d.id);UI.del(e.id,t(EVT[e.type][1]),()=>{autoFin('fin-ev-'+e.id,null);if(DB.get('fl-'+e.id))DB.remove('fl-'+e.id)})};
A.addEgg=d=>{const fl=Calc.animals(d.cat).filter(a=>!a.sellDate);if(!fl.length){UI.toast(t('Add a flock first'));return}
 UI.form({title:'Record eggs',values:{date:today(),animalId:fl[0].id},fields:[{k:'animalId',label:'Flock',type:'select',opts:fl.map(a=>[a.id,a.name])},{k:'date',label:'Date',type:'date',req:1},{k:'qty',label:'Number of eggs',type:'number',req:1,hint:'Saving again for the same flock and date updates the record'},{k:'note',label:'Notes'}],
 onSave:async o=>{const id=`egg-${o.animalId}-${o.date}`;await DB.save('events',Object.assign({},DB.mem.get(id)||{},{id,type:'egg',animalId:o.animalId,cat:d.cat,date:o.date,qty:o.qty,note:o.note}))}})};
