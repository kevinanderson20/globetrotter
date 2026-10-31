/* ================= CHARTS =================
   Any card, explanation or model answer can include a chart token; rich() turns it into inline SVG.
   [[bars:1,2,3;0.2,0.5,0.3|hl=1,2|cmp=0|E=2.1|sd=0.7|cap=...]]  (no square brackets inside a token)  a discrete distribution (bar chart)
   [[binom:5,0.88|hl=4,5|cmp=0|E=4.4|cap=...]]                   the B(n, p) distribution as bars
   [[normal:50,15|gt=70 | lt=x | btw=a,b | cutr=x,10% | cutl=x,10% |bad|cap=...]]  a shaded bell curve
   [[zt:1.33]]                                                     the slice of the z table you'd read
   [[seq:5,4]]                                                     every success/failure order with x successes
*/
function rich(html){ return String(html).replace(/\[\[([^\]]+)\]\]/g,(m,t)=>{ try{ return viz(t); }catch(e){ return ""; } }); }
function vzArgs(t){ const [head,...rest]=t.split("|"); const i=head.indexOf(":"); const o={type:head.slice(0,i).trim(), a:head.slice(i+1).trim()};
  rest.forEach(r=>{ const j=r.indexOf("="); if(j<0) o[r.trim()]=true; else o[r.slice(0,j).trim()]=r.slice(j+1).trim(); }); return o; }
const vnum=s=>String(s).split(",").map(x=>+x);
const pf=p=>{ const s=(Math.round(p*1e4)/1e4).toFixed(4).replace(/0+$/,"").replace(/\.$/,""); return s==="0"?"0":s.replace(/^0\./,"."); };
const vesc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function fig(svg,cap){ return `<figure class="vz">${svg}${cap?`<figcaption>${vesc(cap)}</figcaption>`:""}</figure>`; }

function viz(t){
  const o=vzArgs(t);
  if(o.type==="bars") { const [xs,ps]=o.a.split(";"); return bars(vnum(xs), vnum(ps), o); }
  if(o.type==="binom"){ const [n,p]=vnum(o.a); const xs=[], ps=[]; for(let x=0;x<=n;x++){ xs.push(x); ps.push(C(n,x)*Math.pow(p,x)*Math.pow(1-p,n-x)); }
    if(!o.cap&&o.cap!=="") o.cap=`X ~ B(${n}, ${p}): P(X = x) for each x`; return bars(xs,ps,o); }
  if(o.type==="normal") return bell(vnum(o.a),o);
  if(o.type==="zt") return zslice(+o.a);
  if(o.type==="seq") return seqs(...vnum(o.a));
  return "";
}
/* bar chart of a discrete distribution */
function bars(xs,ps,o){
  const W=320,H=158,L=8,R=8,T=26,B=26, k=xs.length, slot=(W-L-R)/k, bw=Math.min(40,slot*.62), maxP=Math.max(...ps)||1;
  const hl=o.hl!=null?new Set(vnum(o.hl)):null, cmp=o.cmp!=null?new Set(vnum(o.cmp)):null;
  const cx=i=>L+slot*(i+.5), base=H-B, ph=H-T-B;
  let g=`<line class="ax" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/>`;
  if(o.sd&&o.E){ const E=+o.E, sd=+o.sd, x0=cx(0)+(E-sd-xs[0])*slot, x1=cx(0)+(E+sd-xs[0])*slot;
    g+=`<rect class="band" x="${x0}" y="${T-8}" width="${x1-x0}" height="${base-T+8}"/>`; }
  xs.forEach((x,i)=>{ const h=Math.max(ps[i]>0?2:0, ps[i]/maxP*ph); const cls=cmp&&cmp.has(x)?"cmp":hl&&hl.has(x)?"hl":hl||cmp?"bar dim":"bar";
    g+=`<rect class="${cls}" x="${cx(i)-bw/2}" y="${base-h}" width="${bw}" height="${h}" rx="3"/>`;
    g+=`<text x="${cx(i)}" y="${base-h-5}" text-anchor="middle" class="tiny${hl&&hl.has(x)||cmp&&cmp.has(x)?" lab":""}">${pf(ps[i])}</text>`;
    g+=`<text x="${cx(i)}" y="${base+15}" text-anchor="middle" class="${hl&&hl.has(x)?"lab":""}">${x}</text>`; });
  if(o.E){ const E=+o.E, ex=cx(0)+(E-xs[0])*slot;
    g+=`<line class="ev" x1="${ex}" x2="${ex}" y1="${T-12}" y2="${base}"/><text class="lab evt" x="${Math.min(W-R-2,Math.max(L+2,ex))}" y="${T-15}" text-anchor="${ex>W*.75?"end":ex<W*.25?"start":"middle"}">E[X] = ${o.E}</text>`; }
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of the distribution">${g}</svg>`, o.cap||"");
}
/* bell curve with a shaded region */
function bell([mu,sd],o){
  const W=320,H=150,L=10,R=10,T=22,B=34, base=H-B;
  let lo=mu-3.6*sd, hi=mu+3.6*sd; const marks=[];
  let a=null,b=null,label=null,bad=!!o.bad;
  const zOf=x=>Math.round((x-mu)/sd*100)/100;
  const area=z=>phi(z);
  if(o.gt!=null){ const x=+o.gt; a=x; b=hi; marks.push(x); label=pf4(1-area(zOf(x))); }
  if(o.lt!=null){ const x=+o.lt; a=lo; b=x; marks.push(x); label=pf4(area(zOf(x))); }
  if(o.btw!=null){ const [x1,x2]=vnum(o.btw); a=x1; b=x2; marks.push(x1,x2); label=pf4(area(zOf(x2))-area(zOf(x1))); }
  if(o.cutr!=null){ const [x,l]=o.cutr.split(","); a=+x; b=hi; marks.push(+x); label=l||null; }
  if(o.cutl!=null){ const [x,l]=o.cutl.split(","); a=lo; b=+x; marks.push(+x); label=l||null; }
  if(o.mark!=null) marks.push(...vnum(o.mark));
  if(o.lab) label=o.lab;
  const sx=x=>L+(x-lo)/(hi-lo)*(W-L-R), y=x=>{ const z=(x-mu)/sd; return base-Math.exp(-z*z/2)*(base-T); };
  let path="", N=120; for(let i=0;i<=N;i++){ const x=lo+(hi-lo)*i/N; path+=(i?"L":"M")+sx(x).toFixed(1)+" "+y(x).toFixed(1); }
  let g=`<line class="ax" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/>`;
  if(a!=null){ const aa=Math.max(lo,a), bb=Math.min(hi,b); let poly=`M${sx(aa).toFixed(1)} ${base}`; const M=60;
    for(let i=0;i<=M;i++){ const x=aa+(bb-aa)*i/M; poly+=`L${sx(x).toFixed(1)} ${y(x).toFixed(1)}`; } poly+=`L${sx(bb).toFixed(1)} ${base}Z`;
    g+=`<path class="area${bad?" bad":""}" d="${poly}"/>`; }
  g+=`<path class="curve" d="${path}"/>`;
  const std=mu===0&&sd===1;
  const crowd=marks.some(x=>Math.abs(sx(x)-sx(mu))<(std?16:30));   // a marked value next to the mean takes the label spot
  g+=`<line class="tick" x1="${sx(mu)}" x2="${sx(mu)}" y1="${base}" y2="${base+4}"/>${crowd?"":`<text x="${sx(mu)}" y="${base+15}" text-anchor="middle">${std?"0":"μ = "+mu}</text>`}`;
  marks.forEach(x=>{ const z=zOf(x);
    g+=`<line class="mk" x1="${sx(x)}" x2="${sx(x)}" y1="${y(x)}" y2="${base+4}"/><text class="lab" x="${sx(x)}" y="${base+15}" text-anchor="middle">${std?fz2(z):x}</text>${std?"":`<text class="tiny" x="${sx(x)}" y="${base+27}" text-anchor="middle">z = ${fz2(z)}</text>`}`; });
  if(label&&a!=null){ const aa=Math.max(lo,a), bb=Math.min(hi,b); let cxp=(aa+bb)/2;
    if(bb-aa>4*sd) cxp=b===hi?Math.max(aa+sd*.9, mu+sd*.2):Math.min(bb-sd*.9, mu-sd*.2);
    const tail=(b===hi&&aa>mu+sd*.8)||(a===lo&&bb<mu-sd*.8); const lx=tail?(b===hi?Math.min(W-R-4,sx(aa)+26):Math.max(L+4,sx(bb)-26)):sx(cxp);
    const ly=tail?Math.min(y(aa===lo?bb:aa)-10,base-30):Math.max(T+14,(y(cxp)+base)/2);
    g+=`<text class="lab arealab" x="${lx}" y="${ly}" text-anchor="middle">${vesc(label)}</text>`; }
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Normal curve with the shaded area">${g}</svg>`, (crowd&&!std?`μ = ${mu}. `:"")+(o.cap||""));
}
const pf4=v=>(Math.round(v*1e4)/1e4).toFixed(4);
const fz2=z=>(z<0?"−":"")+Math.abs(z).toFixed(2);
/* a 3×3 slice of the z table around the cell you'd read */
function zslice(z){
  const a=Math.abs(z), r=Math.floor(Math.round(a*100)/10), c=Math.round(a*100)%10;
  const rows=[r-1,r,r+1].filter(x=>x>=0&&x<=30), cols=[c-1,c,c+1].filter(x=>x>=0&&x<=9);
  return `<figure class="vz"><table class="dt zs"><tr><th>z</th>${cols.map(k=>`<th${k===c?' class="hc"':""}>.0${k}</th>`).join("")}</tr>${rows.map(rr=>`<tr><th${rr===r?' class="hc"':""}>${(rr/10).toFixed(1)}</th>${cols.map(k=>`<td${rr===r&&k===c?' class="on"':rr===r||k===c?' class="hl"':""}>${ZT[rr][k].toFixed(4)}</td>`).join("")}</tr>`).join("")}</table><figcaption>Row ${(r/10).toFixed(1)}, column .0${c}: P(Z &lt; ${a.toFixed(2)}) = ${ZT[r][c].toFixed(4)}</figcaption></figure>`;
}
/* every order of successes (✓) and failures (✗) that gives x successes out of n */
function seqs(n,x){
  const out=[]; (function go(pre,s){ if(pre.length===n){ if(s===x) out.push(pre); return; } go(pre+"1",s+1); go(pre+"0",s); })("",0);
  return `<figure class="vz"><div class="seqs">${out.map(q=>`<div>${[...q].map(ch=>`<span class="${ch==="1"?"s":"f"}">${ch==="1"?"✓":"✗"}</span>`).join("")}</div>`).join("")}</div><figcaption>${out.length} orders give ${x} success${x===1?"":"es"} out of ${n}: that's C(${n}, ${x}) = ${C(n,x)}. Each order has probability p${x>1?sup(x):x===1?"":"⁰"} × (1 − p)${n-x>1?sup(n-x):n-x===1?"":"⁰"}.</figcaption></figure>`;
}
