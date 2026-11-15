'use strict';
/* Lightweight interactive canvas charts (bar / line). Click or tap a bar to open the records behind it. */
const Chart={reg:{},n:0,COL:['#1b8a4b','#e0702b','#3b82f6','#8b5cf6'],
 html(cfg){const id='ch'+(++this.n);this.reg[id]=cfg;
  const lg=cfg.series.length>1?`<div class="legend">${cfg.series.map((s,i)=>`<span><i style="background:${s.color||this.COL[i]}"></i>${esc(s.name)}</span>`).join('')}</div>`:'';
  return`<div class="chart" data-ch="${id}"><canvas></canvas><div class="tip"></div>${lg}</div>`},
 mountAll(root=document){$$('.chart',root).forEach(el=>this.draw(el))},
 draw(el){const cfg=this.reg[el.dataset.ch];if(!cfg)return;const cv=$('canvas',el),dpr=window.devicePixelRatio||1,W=cv.clientWidth||300,H=cv.clientHeight||230;
  cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext('2d');x.scale(dpr,dpr);
  const cs=getComputedStyle(document.documentElement),tx=cs.getPropertyValue('--mut').trim()||'#667',gr=cs.getPropertyValue('--bd').trim()||'#ddd';
  const n=cfg.labels.length,ns=cfg.series.length,all=cfg.series.flatMap(s=>s.data);let mx=Math.max(1,...all);
  const mag=Math.pow(10,Math.floor(Math.log10(mx))),st=[1,2,2.5,5,10].map(m=>m*mag).find(s=>mx/s<=4)||mag*10;mx=Math.ceil(mx/st)*st;
  const left=48,right=8,top=10,bot=28,pw=W-left-right,ph=H-top-bot;
  x.font='12px system-ui,sans-serif';x.fillStyle=tx;x.strokeStyle=gr;x.lineWidth=1;x.textAlign='right';
  for(let v=0;v<=mx+1e-9;v+=st){const y=top+ph-v/mx*ph;x.beginPath();x.moveTo(left,y);x.lineTo(W-right,y);x.stroke();x.fillText(Chart.short(v),left-6,y+4)}
  x.textAlign='center';const gw=pw/Math.max(1,n),every=Math.ceil(n/Math.max(1,Math.floor(pw/46)));
  cfg.labels.forEach((l,i)=>{if(i%every===0)x.fillText(l,left+gw*i+gw/2,H-9)});
  const pos=[];
  cfg.series.forEach((s,si)=>{const col=s.color||Chart.COL[si];x.fillStyle=col;x.strokeStyle=col;
   if(cfg.type==='line'){x.lineWidth=2.5;x.beginPath();s.data.forEach((v,i)=>{const px=left+gw*i+gw/2,py=top+ph-v/mx*ph;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();s.data.forEach((v,i)=>{x.beginPath();x.arc(left+gw*i+gw/2,top+ph-v/mx*ph,3.5,0,7);x.fill()})}
   else{const bw=Math.min(34,gw*.78/ns);s.data.forEach((v,i)=>{const bx=left+gw*i+gw/2-bw*ns/2+bw*si,bh=v/mx*ph;x.beginPath();if(x.roundRect)x.roundRect(bx+1,top+ph-bh,bw-2,Math.max(bh,0),4);else x.rect(bx+1,top+ph-bh,bw-2,bh);x.fill()})}});
  const tip=$('.tip',el),idx=e=>{const r=cv.getBoundingClientRect(),px=(e.touches?e.touches[0].clientX:e.clientX)-r.left;const i=Math.floor((px-left)/gw);return i>=0&&i<n?i:-1};
  const show=e=>{const i=idx(e);if(i<0){tip.style.display='none';return}tip.innerHTML=`<b>${esc(cfg.full?cfg.full[i]:cfg.labels[i])}</b><br>`+cfg.series.map((s,k)=>`<span style="color:${s.color||Chart.COL[k]}">●</span> ${esc(s.name)}: ${(cfg.fmt||fnum)(s.data[i])}`).join('<br>');tip.style.display='block';tip.style.left=Math.min(Math.max(4,left+gw*i+gw/2-50),W-130)+'px';tip.style.top='6px'};
  cv.onmousemove=show;cv.onmouseleave=()=>tip.style.display='none';
  cv.onclick=e=>{const i=idx(e);if(i>=0){show(e);if(cfg.onClick)cfg.onClick(i)}}},
 short(v){return v>=1e6?(v/1e6).toFixed(1).replace('.0','')+'M':v>=1e3?(v/1e3).toFixed(1).replace('.0','')+'k':String(+v.toFixed(2))},
 redraw(){$$('.chart').forEach(el=>this.draw(el))}
};
addEventListener('resize',debounce(()=>Chart.redraw(),150));
/* Bucket helper: returns [{key,label,full,from,to}] for last N days/weeks/months */
function buckets(mode,count){const td=today(),o=[];
 if(mode==='daily')for(let i=count-1;i>=0;i--){const d=addDays(td,-i);o.push({key:d,label:fday(d),full:fdate(d),from:d,to:d})}
 else if(mode==='weekly'){let w=wkStart(td);for(let i=count-1;i>=0;i--){const f=addDays(w,-7*i);o.push({key:f,label:fday(f),full:fday(f)+' – '+fday(addDays(f,6)),from:f,to:addDays(f,6)})}}
 else{const d=parseD(td);for(let i=count-1;i>=0;i--){const m=new Date(d.getFullYear(),d.getMonth()-i,1),k=iso(m).slice(0,7);o.push({key:k,label:fmon(k),full:fmonL(k),from:k+'-01',to:monthEnd(k+'-01')})}}
 return o}
