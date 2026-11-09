/* ================= CHARTS =================
   Any card, explanation or model answer can include a chart token; rich() turns it into inline SVG.
   [[normal:mu,sd|gt=x | lt=x | btw=a,b | out=a,b |lab=..|bad|cap=...]]  a shaded bell curve (out = both tails beyond a and b)
   [[clt:skew|n=64|cap=]]        a skewed population next to the sampling distribution of x̄ for that n
   [[ci:lo,hi,est|claim=c|cap=]] a confidence interval on a number line, with an optional claimed value
   [[cis:20,90|cap=]]            many intervals from repeated samples, most covering the true value
   [[cc:0|cap=]]                 an x-bar control chart with one point outside the limits
   [[tvz:4|cap=]]                t with 4 d.f. against the standard normal
   [[tdist:14|gt=1.345 | lt=-1.345 | two=2.145 |obs=2.408|cap=]]  a t curve with its rejection region and the observed t
   [[tt:14,2.408|cap=]]          the slice of the t table you'd read for that d.f. and t
   [[zt:1.33]]                   the slice of the z table you'd read
*/
function rich(html){ return String(html).replace(/\[\[([^\]]+)\]\]/g,(m,t)=>{ try{ return viz(t); }catch(e){ return ""; } }); }
function vzArgs(t){ const [head,...rest]=t.split("|"); const i=head.indexOf(":"); const o={type:head.slice(0,i).trim(), a:head.slice(i+1).trim()};
  rest.forEach(r=>{ const j=r.indexOf("="); if(j<0) o[r.trim()]=true; else o[r.slice(0,j).trim()]=r.slice(j+1).trim(); }); return o; }
const vnum=s=>String(s).split(",").map(x=>+x);
const pf=p=>{ const s=(Math.round(p*1e4)/1e4).toFixed(4).replace(/0+$/,"").replace(/\.$/,""); return s==="0"?"0":s.replace(/^0\./,"."); };
const vesc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const vn=x=>String(+(+x).toFixed(4)).replace(/^-/,"−");
function fig(svg,cap){ return `<figure class="vz">${svg}${cap?`<figcaption>${vesc(cap)}</figcaption>`:""}</figure>`; }

function viz(t){
  const o=vzArgs(t);
  if(o.type==="normal") return bell(vnum(o.a),o);
  if(o.type==="zt") return zslice(+o.a);
  if(o.type==="clt") return cltViz(o);
  if(o.type==="ci") return ciViz(vnum(o.a),o);
  if(o.type==="cis") return cisViz(vnum(o.a),o);
  if(o.type==="cc") return ccViz(o);
  if(o.type==="tvz") return tvzViz(+o.a,o);
  if(o.type==="tdist") return tdistViz(+o.a,o);
  if(o.type==="tt") return tslice(vnum(o.a),o);
  return "";
}
/* densities */
function lgam(x){ const g=7, c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61503916999185,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if(x<.5) return Math.log(Math.PI/Math.sin(Math.PI*x))-lgam(1-x); x-=1; let a=c[0]; const t=x+g+.5; for(let i=1;i<9;i++) a+=c[i]/(x+i); return .5*Math.log(2*Math.PI)+(x+.5)*Math.log(t)-t+Math.log(a); }
const npdf=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
const tpdf=(x,v)=>Math.exp(lgam((v+1)/2)-lgam(v/2)-.5*Math.log(v*Math.PI)-(v+1)/2*Math.log(1+x*x/v));
const gpdf=(x,k,th)=>x<=0?0:Math.exp((k-1)*Math.log(x)-x/th-lgam(k)-k*Math.log(th));
/* a curve f over [lo,hi] with optional shaded pieces [[a,b],...] */
function curveSVG(f,lo,hi,ymax,box,shade,cls=""){ const {W,L,R,T,base}=box, sx=x=>L+(x-lo)/(hi-lo)*(W-L-R), y=x=>base-f(x)/ymax*(base-T);
  let g=""; (shade||[]).forEach(([a,b])=>{ const aa=Math.max(lo,a), bb=Math.min(hi,b); if(bb<=aa) return; let p=`M${sx(aa).toFixed(1)} ${base}`;
    for(let i=0;i<=60;i++){ const x=aa+(bb-aa)*i/60; p+=`L${sx(x).toFixed(1)} ${y(x).toFixed(1)}`; } g+=`<path class="area${cls}" d="${p}L${sx(bb).toFixed(1)} ${base}Z"/>`; });
  let p=""; for(let i=0;i<=140;i++){ const x=lo+(hi-lo)*i/140; p+=(i?"L":"M")+sx(x).toFixed(1)+" "+y(x).toFixed(1); }
  return {g, path:p, sx, y}; }
/* bell curve with a shaded region */
function bell([mu,sd],o){
  const W=320,H=150,L=10,R=10,T=22,B=34, base=H-B;
  const lo=mu-3.6*sd, hi=mu+3.6*sd, marks=[]; let shade=[], label=null;
  const zOf=x=>Math.round((x-mu)/sd*100)/100;
  if(o.gt!=null){ const x=+o.gt; shade=[[x,hi]]; marks.push(x); label=pf4(1-phi(zOf(x))); }
  if(o.lt!=null){ const x=+o.lt; shade=[[lo,x]]; marks.push(x); label=pf4(phi(zOf(x))); }
  if(o.btw!=null){ const [x1,x2]=vnum(o.btw); shade=[[x1,x2]]; marks.push(x1,x2); label=pf4(phi(zOf(x2))-phi(zOf(x1))); }
  if(o.out!=null){ const [x1,x2]=vnum(o.out); shade=[[lo,x1],[x2,hi]]; marks.push(x1,x2); label=null; }
  if(o.lab) label=o.lab;
  const box={W,L,R,T,base}, f=x=>npdf((x-mu)/sd), c=curveSVG(f,lo,hi,npdf(0),box,shade,o.bad?" bad":"");
  let g=`<line class="ax" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/>`+c.g+`<path class="curve" d="${c.path}"/>`;
  const std=mu===0&&sd===1, vis=marks.filter(x=>x>=lo&&x<=hi);
  const crowd=vis.some(x=>Math.abs(c.sx(x)-c.sx(mu))<(std?16:30));
  g+=`<line class="tick" x1="${c.sx(mu)}" x2="${c.sx(mu)}" y1="${base}" y2="${base+4}"/>${crowd?"":`<text x="${c.sx(mu)}" y="${base+15}" text-anchor="middle">${std?"0":"μ = "+vn(mu)}</text>`}`;
  vis.forEach(x=>{ const z=zOf(x);
    g+=`<line class="mk" x1="${c.sx(x)}" x2="${c.sx(x)}" y1="${c.y(x)}" y2="${base+4}"/><text class="lab" x="${c.sx(x)}" y="${base+15}" text-anchor="middle">${std?fz2(z):vn(x)}</text>${std?"":`<text class="tiny" x="${c.sx(x)}" y="${base+27}" text-anchor="middle">z = ${fz2(z)}</text>`}`; });
  if(label&&shade.length===1){ const [a,b]=shade[0], aa=Math.max(lo,a), bb=Math.min(hi,b); let cxp=(aa+bb)/2;
    if(bb-aa>4*sd) cxp=b>=hi?Math.max(aa+sd*.9, mu+sd*.2):Math.min(bb-sd*.9, mu-sd*.2);
    const tail=(b>=hi&&aa>mu+sd*.8)||(a<=lo&&bb<mu-sd*.8); const lx=tail?(b>=hi?Math.min(W-R-4,c.sx(aa)+26):Math.max(L+4,c.sx(bb)-26)):c.sx(cxp);
    const ly=tail?Math.min(c.y(a<=lo?bb:aa)-10,base-30):Math.max(T+14,(c.y(cxp)+base)/2);
    g+=`<text class="lab arealab" x="${lx}" y="${ly}" text-anchor="middle">${vesc(label)}</text>`; }
  if(label&&shade.length===2) g+=`<text class="lab arealab" x="${W/2}" y="${T-6}" text-anchor="middle">${vesc(label)}</text>`;
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Normal curve with the shaded area">${g}</svg>`, (crowd&&!std?`μ = ${vn(mu)}. `:"")+(o.cap||""));
}
const pf4=v=>(Math.round(v*1e4)/1e4).toFixed(4);
const fz2=z=>(z<0?"−":"")+Math.abs(z).toFixed(2);
/* the CLT, side by side: a right-skewed population (gamma, shape 1.6) and the exact distribution of x̄ for that n */
function cltViz(o){
  const n=+(o.n||36), k=1.6, th=1, mu=k*th, W=320,H=150,T=26,B=24, base=H-B, half=W/2;
  const lo=0, hi=mu+4.2*Math.sqrt(k)*th;
  const pop=x=>gpdf(x,k,th), sm=x=>gpdf(x,n*k,th/n);
  let pm=0, sm0=0; for(let i=1;i<=200;i++){ const x=hi*i/200; pm=Math.max(pm,pop(x)); sm0=Math.max(sm0,sm(x)); }
  const A=curveSVG(pop,lo,hi,pm*1.05,{W:half-6,L:8,R:6,T,base}), Bc=curveSVG(sm,lo,hi,sm0*1.05,{W:W,L:half+6,R:8,T,base});
  const g=`<line class="ax" x1="8" x2="${half-12}" y1="${base}" y2="${base}"/><line class="ax" x1="${half+6}" x2="${W-8}" y1="${base}" y2="${base}"/>
    <path class="area pop" d="${A.path}L${(half-12).toFixed(1)} ${base}L8 ${base}Z"/><path class="curve" d="${A.path}"/>
    <path class="area" d="${Bc.path}L${W-8} ${base}L${half+6} ${base}Z"/><path class="curve" d="${Bc.path}"/>
    <line class="mk" x1="${A.sx(mu)}" x2="${A.sx(mu)}" y1="${T}" y2="${base+3}"/><line class="mk" x1="${Bc.sx(mu)}" x2="${Bc.sx(mu)}" y1="${T}" y2="${base+3}"/>
    <text class="lab" x="${(8+half-12)/2}" y="14" text-anchor="middle">Population (one unit)</text><text class="lab" x="${(half+6+W-8)/2}" y="14" text-anchor="middle">x̄ for n = ${n}</text>
    <text x="${A.sx(mu)}" y="${base+15}" text-anchor="middle">μ</text><text x="${Bc.sx(mu)}" y="${base+15}" text-anchor="middle">μ</text>`;
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Skewed population and the sampling distribution of the mean">${g}</svg>`, o.cap||"");
}
/* a confidence interval on a number line */
function ciViz([lo,hi,est],o){
  const W=320,H=84, L=18, R=18, c=o.claim!=null?+o.claim:null, w=hi-lo;
  let a=Math.min(lo,c??lo)-w*.35, b=Math.max(hi,c??hi)+w*.35; const sx=x=>L+(x-a)/(b-a)*(W-L-R), y=40;
  const inside=c!=null&&c>=lo&&c<=hi;
  let g=`<line class="ax" x1="${L}" x2="${W-R}" y1="${y+18}" y2="${y+18}"/>
    <line class="ci" x1="${sx(lo)}" x2="${sx(hi)}" y1="${y}" y2="${y}"/><line class="ci" x1="${sx(lo)}" x2="${sx(lo)}" y1="${y-8}" y2="${y+8}"/><line class="ci" x1="${sx(hi)}" x2="${sx(hi)}" y1="${y-8}" y2="${y+8}"/>
    <circle class="est" cx="${sx(est)}" cy="${y}" r="5"/>
    <text class="lab" x="${sx(lo)}" y="${y+32}" text-anchor="middle">${vn(lo)}</text><text class="lab" x="${sx(hi)}" y="${y+32}" text-anchor="middle">${vn(hi)}</text>
    <text x="${sx(est)}" y="${y-12}" text-anchor="middle">${vn(est)}</text>`;
  if(c!=null) g+=`<line class="claim${inside?" in":""}" x1="${sx(c)}" x2="${sx(c)}" y1="${y-26}" y2="${y+18}"/><text class="lab claimt${inside?" in":""}" x="${Math.min(W-R-10,Math.max(L+10,sx(c)))}" y="${y-30}" text-anchor="middle">claim ${vn(c)}</text>`;
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Confidence interval">${g}</svg>`, o.cap||"");
}
/* many intervals from repeated samples; the misses are drawn in red */
function cisViz([k,cl],o){
  const W=320, rowH=9, T=10, H=T+k*rowH+16, L=10,R=10, mid=W/2, miss=Math.round(k*(100-cl)/100);
  let seed=7+k+cl; const rand=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const missAt=new Set(); while(missAt.size<miss) missAt.add(Math.floor(rand()*k));
  const half=52; let g=`<line class="truth" x1="${mid}" x2="${mid}" y1="${T-6}" y2="${H-12}"/><text class="lab" x="${mid}" y="${H-1}" text-anchor="middle">true value</text>`;
  for(let i=0;i<k;i++){ let c; if(missAt.has(i)) c=mid+(rand()<.5?-1:1)*(half+6+rand()*24); else c=mid+(rand()*2-1)*half*.9;
    const yy=T+i*rowH, bad=missAt.has(i); g+=`<line class="ci${bad?" miss":""}" x1="${c-half}" x2="${c+half}" y1="${yy}" y2="${yy}"/><circle class="est${bad?" miss":""}" cx="${c}" cy="${yy}" r="2.4"/>`; }
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Intervals from repeated samples">${g}</svg>`, o.cap||"");
}
/* an x-bar control chart */
function ccViz(o){
  const W=320,H=140,L=34,R=10,T=14,B=18, n=16, mid=(T+H-B)/2, sd=(H-B-T)/8;
  const pts=[.3,-.8,1.1,.2,-1.6,.5,1.8,-.4,.9,-1.1,.1,3.5,.6,-.7,1.3,-.2];
  const sx=i=>L+(i+.5)*(W-L-R)/n, sy=z=>mid-z*sd;
  let g=`<line class="cl" x1="${L}" x2="${W-R}" y1="${sy(0)}" y2="${sy(0)}"/><line class="lim" x1="${L}" x2="${W-R}" y1="${sy(3)}" y2="${sy(3)}"/><line class="lim" x1="${L}" x2="${W-R}" y1="${sy(-3)}" y2="${sy(-3)}"/>
    <text x="${L-4}" y="${sy(3)+4}" text-anchor="end" class="lab">UCL</text><text x="${L-4}" y="${sy(0)+4}" text-anchor="end">CL</text><text x="${L-4}" y="${sy(-3)+4}" text-anchor="end" class="lab">LCL</text>
    <polyline class="run" points="${pts.map((z,i)=>sx(i)+","+sy(z)).join(" ")}"/>`;
  pts.forEach((z,i)=>{ g+=`<circle class="pt${Math.abs(z)>3?" out":""}" cx="${sx(i)}" cy="${sy(z)}" r="${Math.abs(z)>3?4.5:3}"/>`; });
  g+=`<text x="${(L+W-R)/2}" y="${H-3}" text-anchor="middle">sample number</text>`;
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="x-bar control chart">${g}</svg>`, o.cap||"");
}
/* t against the normal */
function tvzViz(v,o){
  const W=320,H=140,L=10,R=10,T=14,B=24, base=H-B, box={W,L,R,T,base}, ym=npdf(0)*1.04;
  const N=curveSVG(npdf,-4.2,4.2,ym,box), Tt=curveSVG(x=>tpdf(x,v),-4.2,4.2,ym,box);
  const g=`<line class="ax" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/><path class="curve norm" d="${N.path}"/><path class="curve tcur" d="${Tt.path}"/>
    ${[-3,-2,-1,0,1,2,3].map(z=>`<text x="${N.sx(z)}" y="${base+15}" text-anchor="middle">${z<0?"−"+(-z):z}</text>`).join("")}
    <text class="lab tl" x="${N.sx(2.7)}" y="${Tt.y(2.7)-10}" text-anchor="middle">t, ${v} d.f.</text><text class="lab" x="${N.sx(.9)+30}" y="${N.y(.9)-6}" text-anchor="start">normal</text>`;
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="t distribution and the normal">${g}</svg>`, o.cap||"");
}
/* a t curve with its rejection region, and the observed statistic */
function tdistViz(v,o){
  const W=320,H=150,L=10,R=10,T=22,B=34, base=H-B, box={W,L,R,T,base}, f=x=>tpdf(x,v);
  const obs=o.obs!=null?+o.obs:null, ext=Math.max(4,Math.abs(obs||0)+.6), lo=-ext, hi=ext; let shade=[], marks=[];
  if(o.gt!=null){ shade=[[+o.gt,hi]]; marks=[+o.gt]; }
  if(o.lt!=null){ shade=[[lo,+o.lt]]; marks=[+o.lt]; }
  if(o.two!=null){ const c=+o.two; shade=[[lo,-c],[c,hi]]; marks=[-c,c]; }
  const c=curveSVG(f,lo,hi,f(0)*1.04,box,shade," bad");
  let g=`<line class="ax" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/>`+c.g+`<path class="curve" d="${c.path}"/>`;
  g+=`<line class="tick" x1="${c.sx(0)}" x2="${c.sx(0)}" y1="${base}" y2="${base+4}"/><text x="${c.sx(0)}" y="${base+15}" text-anchor="middle">0</text>`;
  marks.forEach(x=>{ g+=`<line class="mk" x1="${c.sx(x)}" x2="${c.sx(x)}" y1="${c.y(x)}" y2="${base+4}"/><text class="lab" x="${c.sx(x)}" y="${base+15}" text-anchor="middle">${vn(x)}</text>`; });
  if(marks.length) { const m=marks[marks.length-1], right=m>0; g+=`<text class="tiny" x="${right?Math.min(W-R-2,c.sx(m)+30):Math.max(L+2,c.sx(m)-30)}" y="${base-18}" text-anchor="${right?"middle":"middle"}">reject</text>`; }
  if(obs!=null){ const near=marks.some(m=>Math.abs(c.sx(m)-c.sx(obs))<26);
    g+=`<line class="obs" x1="${c.sx(obs)}" x2="${c.sx(obs)}" y1="${T-4}" y2="${base}"/><text class="lab obst" x="${Math.min(W-R-14,Math.max(L+14,c.sx(obs)))}" y="${near?T-8:base+29}" text-anchor="middle">t = ${vn(obs)}</text>`; }
  return fig(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="t distribution with rejection region">${g}</svg>`, (o.cap||"")+` (t with ${v} d.f.)`);
}
/* the slice of the z table */
function zslice(z){
  const a=Math.abs(z), r=Math.floor(Math.round(a*100)/10), c=Math.round(a*100)%10;
  const rows=[r-1,r,r+1].filter(x=>x>=0&&x<=30), cols=[c-1,c,c+1].filter(x=>x>=0&&x<=9);
  return `<figure class="vz"><table class="dt zs"><tr><th>z</th>${cols.map(k=>`<th${k===c?' class="hc"':""}>.0${k}</th>`).join("")}</tr>${rows.map(rr=>`<tr><th${rr===r?' class="hc"':""}>${(rr/10).toFixed(1)}</th>${cols.map(k=>`<td${rr===r&&k===c?' class="on"':rr===r||k===c?' class="hl"':""}>${ZT[rr][k].toFixed(4)}</td>`).join("")}</tr>`).join("")}</table><figcaption>Row ${(r/10).toFixed(1)}, column .0${c}: P(Z &lt; ${a.toFixed(2)}) = ${ZT[r][c].toFixed(4)}</figcaption></figure>`;
}
/* the slice of the t table: rows around this d.f., every column, the two cells around |t| highlighted */
function tslice([df,t],o){
  const i=TDF.indexOf(df), rows=[i-1,i,i+1].filter(x=>x>=0&&x<TDF.length), a=Math.abs(t), row=TT[i];
  let k=-1; row.forEach((v,j)=>{ if(a>=v) k=j; });
  const hot=new Set([k,k+1].filter(j=>j>=0&&j<row.length));
  const cap=o.cap||(k<0?`${vn(a)} is below ${row[0]}: one-tail p-value above .1`:k>=row.length-1?`${vn(a)} is beyond ${row[row.length-1]}: one-tail p-value below .0005`:`${vn(a)} is between ${row[k]} and ${row[k+1]}: one-tail p-value between ${pf(TCOL[k+1])} and ${pf(TCOL[k])}`);
  return `<figure class="vz"><div class="tblwrap"><table class="dt zs tsl"><tr><th>d.f.</th>${TCOL.map((p,j)=>`<th${hot.has(j)?' class="hc"':""}>${pf(p)}</th>`).join("")}</tr>${rows.map(r=>`<tr><th${r===i?' class="hc"':""}>${TDF[r]===Infinity?"∞":TDF[r]}</th>${TT[r].map((v,j)=>`<td${r===i&&hot.has(j)?' class="on"':r===i||hot.has(j)?' class="hl"':""}>${v.toFixed(3)}</td>`).join("")}</tr>`).join("")}</table></div><figcaption>${vesc(cap)}</figcaption></figure>`;
}
