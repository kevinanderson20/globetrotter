/* ================= WORLDLE + TRAVLE: country games built on the World tab's map ================= */
/* geo.json (built by tools/build-games-geo.mjs) holds every country's silhouette, world-map outline, centre, area and borders.
   It loads the first time one of these games opens and is kept offline by the service worker. */
let GEO=null, GEO_P=null;
function geoLoad(){ if(GEO) return Promise.resolve(GEO); if(GEO_P) return GEO_P;
  GEO_P=fetch("geo.json?v=2").then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(d=>{
    const by={}; d.c.forEach(c=>{ by[c.id]=c; c.keys=[...new Set([c.n,...c.al].map(geoNorm))]; });
    const ix={}; d.c.forEach((c,i)=>ix[c.id]=i); GEO={W:d.w,list:d.c,by,ix,md:d.md||null}; return GEO; }).catch(e=>{ GEO_P=null; throw e; });
  return GEO_P; }
const geoNorm=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/&/g,"and").replace(/^the\s+/,"").replace(/[^a-z]/g,"");
function geoFind(text){ const q=geoNorm(text); if(!q) return null; return GEO.list.find(c=>c.keys.includes(q))||null; }
function geoMatches(text,skip){ const raw=String(text).trim().toLowerCase(); if(!raw) return [];
  const q=geoNorm(raw), words=c=>c.n.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().split(/[^a-z]+/);
  const scored=[]; GEO.list.forEach(c=>{ if(skip&&skip.has(c.id)) return; let sc=9;
    if(c.keys.includes(q)) sc=0; else if(geoNorm(c.n).startsWith(q)) sc=1; else if(words(c).some(w=>w.startsWith(q))) sc=2; else if(c.keys.some(k=>k.startsWith(q))) sc=3; else if(q.length>=3&&geoNorm(c.n).includes(q)) sc=4;
    if(sc<9) scored.push([sc,c]); });
  return scored.sort((a,b)=>a[0]-b[0]||a[1].n.localeCompare(b[1].n)).slice(0,6).map(x=>x[1]); }
/* a country-name box with suggestions, like the real games: type, tap a suggestion or press Enter */
function geoInput(box,{placeholder,skip,onPick,btn="Guess"}){
  box.innerHTML=`<form class="cin" autocomplete="off"><div class="cinwrap"><input type="text" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}"><div class="cinlist" role="listbox" hidden></div></div><button class="btn go" type="submit">${esc(btn)}</button></form>`;
  const f=box.querySelector("form"), inp=f.querySelector("input"), list=f.querySelector(".cinlist"); let opts=[], hi=0;
  const draw=()=>{ opts=geoMatches(inp.value,skip()); hi=0;
    list.hidden=!opts.length||!inp.value.trim(); list.innerHTML=opts.map((c,i)=>`<button type="button" role="option" data-i="${i}" class="${i===hi?"on":""}">${esc(c.n)}</button>`).join(""); };
  inp.addEventListener("input",draw);
  inp.addEventListener("keydown",e=>{ if(list.hidden) return; if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); hi=(hi+(e.key==="ArrowDown"?1:opts.length-1))%opts.length; [...list.children].forEach((b,i)=>b.classList.toggle("on",i===hi)); } if(e.key==="Escape") list.hidden=true; });
  list.addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b) return; e.preventDefault(); pick(opts[+b.dataset.i]); });
  f.onsubmit=e=>{ e.preventDefault(); const exact=geoFind(inp.value);
    if(exact) return pick(exact,inp.value);
    if(!list.hidden&&opts.length===1) return pick(opts[0]);
    if(!list.hidden&&opts.length&&document.activeElement===inp&&list.querySelector(".on")&&hi>0) return pick(opts[hi]);
    if(opts.length){ toast("Tap the country you mean from the list"); return; }
    pick(null,inp.value); };
  function pick(c,typed){ if(!c){ if(String(typed||"").trim()){ bad(); toast("Not a country on the list. Pick one from the suggestions."); } return; }
    if(onPick(c)!==false){ inp.value=""; list.hidden=true; } }
  setTimeout(()=>{ try{ inp.focus({preventScroll:true}); }catch(e){} },80);
  return {focus:()=>inp.focus(), el:inp}; }
function geoLoading(){ stage.innerHTML=`<div class="gmsg">Loading the map…</div>`; }
function geoFail(){ stage.innerHTML=`<div class="gmsg">Couldn't load the map. Connect once to the internet so it can be saved for offline play.</div>`; }
const KM=(a,b)=>{ const r=Math.PI/180, [l1,p1]=a, [l2,p2]=b, dp=(p2-p1)*r, dl=(l2-l1)*r, h=Math.sin(dp/2)**2+Math.cos(p1*r)*Math.cos(p2*r)*Math.sin(dl/2)**2; return 2*6371*Math.asin(Math.min(1,Math.sqrt(h))); };
// compass (rhumb-line) bearing, as Worldle uses: the arrow never points over a pole
const BEARING=(a,b)=>{ const r=Math.PI/180, p1=a[1]*r, p2=b[1]*r; let dl=(b[0]-a[0])*r; if(Math.abs(dl)>Math.PI) dl=dl>0?-(2*Math.PI-dl):2*Math.PI+dl;
  const dpsi=Math.log(Math.tan(Math.PI/4+p2/2)/Math.tan(Math.PI/4+p1/2)); return (Math.atan2(dl,dpsi)/r+360)%360; };
const ARROWS=["⬆️","↗️","➡️","↘️","⬇️","↙️","⬅️","↖️"];
/* the world map zoomed to a set of countries, used for results and for Travle's board */
function geoBox(ids,pad=.18,minW=220){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  ids.forEach(id=>{ const b=GEO.by[id].bb; x0=Math.min(x0,b[0]); y0=Math.min(y0,b[1]); x1=Math.max(x1,b[2]); y1=Math.max(y1,b[3]); });
  let w=Math.max(x1-x0,minW), h=Math.max(y1-y0,minW*.62); const cx=(x0+x1)/2, cy=(y0+y1)/2;
  if(w/h<1.25) w=h*1.25; else h=w/1.25; w*=1+pad*2; h*=1+pad*2; return [cx-w/2,cy-h/2,w,h]; }
function geoPathEl(c,cls,extra=""){ return c.wp?`<path class="${cls}" d="${c.wp}" ${extra}/>`:`<circle class="${cls}" cx="${c.cp[0]}" cy="${c.cp[1]}" r="3" ${extra}/>`; }
function geoMapSVG(box,layers){ const [x,y,w,h]=box, sw=(w/400).toFixed(2);
  const inView=c=>{ const b=c.bb; return b[2]>=x&&b[0]<=x+w&&b[3]>=y&&b[1]<=y+h; };
  return `<svg class="gmap" viewBox="${x.toFixed(0)} ${y.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}" style="--sw:${sw}">${layers(inView)}</svg>`; }

/* ---------------- WORLDLE ---------------- */
/* six guesses at a country's silhouette; each miss shows the distance, the direction and how close it was */
let WL_ROT=null;
const wlDaily=()=>{ if(!WL_ROT) WL_ROT=shuf(GEO.list.map(c=>c.id).sort(),seeded("globetrotter-worldle-v1")); const n=WL_ROT.length; return WL_ROT[((dayIndex()%n)+n)%n]; };
const wlNum=()=>dayIndex()+1;
/* closeness: 99% for a neighbour, falling off faster near home than real Worldle's straight line (which gave a neighbour only ~87%) */
const wlProx=d=>Math.max(0,Math.floor(99*(1-Math.sqrt(Math.min(d,20000)/20000))));
/* closest distance between the two countries' borders, precomputed for every pair (0 = they share a border) */
function geoGap(a,b){ if(!GEO.md) return KM(GEO.by[a].ll,GEO.by[b].ll); let i=GEO.ix[a], j=GEO.ix[b]; if(i===j) return 0; if(i>j) [i,j]=[j,i]; const N=GEO.list.length; return GEO.md[i*N-i*(i+1)/2+(j-i-1)]; }
const wlSquares=p=>{ const t=Math.floor(p/10); return "🟩".repeat(Math.floor(t/2))+(t%2?"🟨":"")+"⬛".repeat(5-Math.floor(t/2)-(t%2)); };
const wlUnit=d=>S.wlMi?`${Math.round(d*0.621371).toLocaleString()} mi`:`${Math.round(d).toLocaleString()} km`;
function wlRow(t,gid){ const g=GEO.by[gid]; if(gid===t.id) return {id:gid,n:g.n,hit:1,d:0,a:"🎉",p:100};
  const d=geoGap(gid,t.id), deg=BEARING(g.ll,t.ll); return {id:gid,n:g.n,d,deg,a:ARROWS[Math.round(deg/45)%8],p:wlProx(d)}; }
/* one guess row: name, border-to-border distance, an arrow at the exact compass angle, closeness */
function wlRowHtml(r,click){ return `<div class="wlrow ${r.hit?"hit":""}"><b>${esc(r.n)}</b><span class="wldist"${click?' role="button" tabindex="0"':""}>${r.hit?"":r.d===0?"Borders it":wlUnit(r.d)}</span><span class="wlarr">${r.hit?"🎉":`<svg viewBox="0 0 24 24" style="transform:rotate(${Math.round(r.deg)}deg)" aria-label="Direction ${Math.round(r.deg)} degrees"><path d="M12 2.5 19 12h-4.6v9.5H9.6V12H5z"/></svg>`}</span><span class="wlpct" style="--p:${r.p}%">${r.p}%</span></div>`; }
function wlStatus(){ S.wl=S.wl||{}; const d=S.wl[today()]; return d&&d.over?(d.won?`Today's done · ${d.g.length}/6`:"Today's done · missed it"):d&&d.g.length?`Today's #${wlNum()} · ${d.g.length}/6 guessed`:`Today's #${wlNum()} is ready`; }
function wlShare(t,rows,won,daily){ const best=Math.max(...rows.map(r=>r.p));
  return `#Worldle ${daily?"#"+wlNum():"(unlimited)"} ${won?rows.length:"X"}/6 (${best}%)\n${rows.map(r=>r.hit?"🟩🟩🟩🟩🟩🎉":wlSquares(r.p)+r.a).join("\n")}`; }
async function startWorldle(opt={}){
  const daily=!opt.unlimited, gid=daily?"worldle":"worldleu";
  begin(gid,daily?`Worldle #${dayIndex()+1}`:"Unlimited Worldle"); stage.className="gstage scroll"; geoLoading();
  try{ await geoLoad(); }catch(e){ return geoFail(); }
  if(!GS||GS.game!==gid) return;
  S.wl=S.wl||{}; const key=today();
  if(daily&&S.wl[key]&&S.wl[key].over){ end(); return wlResults(true); }
  const t=GEO.by[daily?wlDaily():pickRandom()], st=daily?(S.wl[key]=S.wl[key]||{g:[]}):{g:[]};
  function pickRandom(){ const ok=GEO.list.filter(c=>c.km2>3000); return ok[Math.floor(Math.random()*ok.length)].id; }
  __b.wl={t:t.id};
  let over=false;
  function render(){ const rows=st.g.map(id=>wlRow(t,id));
    stage.innerHTML=`<div class="wl">
      <div class="wlshape ${over?(rows.some(r=>r.hit)?"won":"lost"):""}"><svg viewBox="0 0 400 400" aria-label="Mystery country outline"><path d="${t.sh}"/></svg>${over?`<div class="wlname">${esc(t.n)}</div>`:""}</div>
      <div class="wlrows">${[0,1,2,3,4,5].map(i=>{ const r=rows[i]; return r?wlRowHtml(r,true):`<div class="wlrow empty"><b></b><span></span><span></span><span></span></div>`; }).join("")}</div>
      <div id="wlin"></div></div>`;
    stage.querySelectorAll(".wldist").forEach(el=>el.onclick=()=>{ S.wlMi=!S.wlMi; save(); render(); });
    if(!over) geoInput($('wlin'),{placeholder:"Country, territory…",skip:()=>new Set(st.g),onPick:guess}); }
  function guess(c){ if(over) return false; if(st.g.includes(c.id)){ toast("Already guessed!"); return false; }
    st.g.push(c.id); if(daily) save();
    if(c.id===t.id){ good(); over=true; finishUp(true); return; }
    bad(); if(st.g.length>=6){ over=true; finishUp(false); return; }
    render(); }
  function finishUp(won){ render(); const rows=st.g.map(id=>wlRow(t,id));
    if(daily){ st.over=1; st.won=won?1:0; st.t=t.id; save(); }
    if(won) setTimeout(confetti,200); else toast(`It was ${t.n}`);
    later(()=>finish(gid,won?rows.length:7,{sub:won?`${t.n} in ${rows.length}`:`It was ${t.n}`, share:wlShare(t,rows,won,daily), html:wlMapCard(t,rows), nextG:"worldleu", nextLabel:daily?"Play unlimited Worldle":"Play again"}),won?1300:1800); }
  if(st.g.includes(t.id)||st.g.length>=6){ over=true; finishUp(st.g.includes(t.id)); } else render();
}
function wlMapCard(t,rows){ const ids=[t.id,...rows.map(r=>r.id)], box=geoBox([t.id],.55,150);
  return `<section class="card"><h3>${esc(t.n)} on the map</h3>${geoMapSVG(box,inView=>GEO.list.filter(inView).map(c=>geoPathEl(c,c.id===t.id?"g-hit":ids.includes(c.id)?"g-tried":"g-land")).join(""))}<p class="muted">${esc(t.c)} · ${Math.round(t.km2).toLocaleString()} km²${t.b.length?` · borders ${t.b.map(id=>GEO.by[id].n).join(", ")}`:" · no land borders"}</p></section>`; }
function wlResults(daily){ const st=S.wl[today()], t=GEO.by[st.t||wlDaily()], rows=st.g.map(id=>wlRow(t,id)), won=!!st.won;
  show(`${bar("Worldle")}
  <section class="card center" style="--c:var(--geo)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Worldle #${wlNum()}</div>
    <div class="big">${won?rows.length:"X"}/6</div><p class="muted">${won?`You found ${esc(t.n)}`:`It was ${esc(t.n)}`}</p><p class="cheer" style="color:var(--ink-2)">New country tomorrow</p></section>
  <section class="card"><div class="wlshape small ${won?"won":"lost"}"><svg viewBox="0 0 400 400"><path d="${t.sh}"/></svg></div>
    <div class="wlrows">${rows.map(r=>wlRowHtml(r)).join("")}</div></section>
  ${wlMapCard(t,rows)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="worldleu">Play unlimited Worldle</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(wlShare(t,rows,won,true)); }

/* ---------------- TRAVLE ---------------- */
/* connect two countries through the countries in between. Rules follow travle.earth:
   guesses allowed = shortest route + 4 to 8 extra; ✅ on a best route and linked to the start, 🟩 on a best route,
   🟧 a route through it is at most one longer, 🟥 further off. "Perfect" = the shortest route with every guess ✅. */
const TV_EXTRA=n=>n<=3?4:n<=6?5:n<=9?6:n<=12?7:8;
/* fewest new countries needed to join a and b when guessed countries are free (0-1 shortest path) */
function tvDist(from,set,free){ const D={}, P={}; GEO.list.forEach(c=>D[c.id]=1e9); const dq=[from]; D[from]=free.has(from)?0:1;
  while(dq.length){ let bi=0; for(let i=1;i<dq.length;i++) if(D[dq[i]]<D[dq[bi]]) bi=i; const u=dq.splice(bi,1)[0];
    for(const v of GEO.by[u].b){ const nd=D[u]+(free.has(v)?0:1); if(nd<D[v]){ D[v]=nd; P[v]=u; dq.push(v); } } }
  D.__p=P; return D; }
function tvNeed(a,b,free){ const D=tvDist(a,null,free); return D[b]>=1e9?1e9:D[b]; } // a and b are free, so this counts only the countries in between
function tvPathCountries(a,b,free){ // one best route's unguessed countries, in order
  const D=tvDist(a,null,free); if(D[b]>=1e9) return []; const path=[]; let u=b, guard=0;
  while(u!==a&&guard++<300){ if(!free.has(u)) path.unshift(u); u=D.__p[u]; if(!u) break; }
  return path; }
function tvComponent(a,free){ const seen=new Set([a]), q=[a]; while(q.length){ const u=q.shift(); for(const v of GEO.by[u].b) if(free.has(v)&&!seen.has(v)){ seen.add(v); q.push(v); } } return seen; }
let TV_POOL=null;
function tvPair(rnd){ if(!TV_POOL) TV_POOL=GEO.list.filter(c=>c.b.length&&c.km2>12000).map(c=>c.id).sort();
  for(let k=0;k<400;k++){ const a=TV_POOL[Math.floor(rnd()*TV_POOL.length)], b=TV_POOL[Math.floor(rnd()*TV_POOL.length)]; if(a===b) continue;
    const n=tvNeed(a,b,new Set([a,b])); if(n>=3&&n<=7) return [a,b]; }
  return ["FRA","POL"]; }
const tvNum=()=>dayIndex()+1;
function tvStatus(){ S.tv=S.tv||{}; const d=S.tv[today()]; return d&&d.over?(d.won?`Today's done · ${d.score===0?"perfect":"+"+d.score}`:"Today's done · didn't make it"):d&&d.g.length?`Today's #${tvNum()} · in progress`:`Today's #${tvNum()} is ready`; }
function tvShare(st,daily){ return `#travle ${daily?"#"+tvNum():"(unlimited)"} ${st.won?"+"+st.score:"(?/"+st.max+")"}${st.won&&st.score===0&&st.e.every(x=>x==="✅")?" (Perfect)":""}${st.h?` (${st.h} hint${st.h>1?"s":""})`:""}\n${st.e.join("")}`; }
async function startTravle(opt={}){
  const daily=!opt.unlimited, gid=daily?"travle":"travleu";
  begin(gid,daily?`Travle #${tvNum()}`:"Unlimited Travle"); stage.className="gstage scroll"; geoLoading();
  try{ await geoLoad(); }catch(e){ return geoFail(); }
  if(!GS||GS.game!==gid) return;
  S.tv=S.tv||{}; const key=today();
  if(daily&&S.tv[key]&&S.tv[key].over){ end(); return tvResults(); }
  let st;
  if(daily&&S.tv[key]) st=S.tv[key];
  else { const [a,b]=tvPair(daily?seeded("globetrotter-travle-v1-"+key):Math.random), n=tvNeed(a,b,new Set([a,b]));
    st={a,b,n,max:n+TV_EXTRA(n),g:[],e:[],h:0,hints:{}}; if(daily){ S.tv[key]=st; save(); } }
  const A=GEO.by[st.a], B=GEO.by[st.b];
  __b.tv=st;
  const free=()=>new Set([st.a,st.b,...st.g]);
  let over=false;
  const baseBox=geoBox([st.a,st.b,...tvPathCountries(st.a,st.b,new Set([st.a,st.b]))],.22,160);
  function render(msg){ const fr=free(), need=tvNeed(st.a,st.b,fr), left=st.max-st.g.length;
    const col={}; st.g.forEach((id,i)=>col[id]=st.e[i]==="✅"||st.e[i]==="🟩"?"g-ok":st.e[i]==="🟧"?"g-near":"g-far");
    const next=!over&&(st.hints.next||st.hints.init)?tvPathCountries(st.a,st.b,fr)[0]:null;
    const map=geoMapSVG(baseBox,inView=>{ let s="";
      if(st.hints.outlines||over) s+=GEO.list.filter(inView).filter(c=>!fr.has(c.id)).map(c=>geoPathEl(c,"g-ghost")).join("");
      if(next&&st.hints.next) s+=geoPathEl(GEO.by[next],"g-next");
      s+=st.g.map(id=>geoPathEl(GEO.by[id],col[id])).join("");
      if(over&&!st.won) s+=tvPathCountries(st.a,st.b,fr).map(id=>geoPathEl(GEO.by[id],"g-miss")).join("");
      s+=geoPathEl(A,"g-start")+geoPathEl(B,"g-end");
      return s; });
    stage.innerHTML=`<div class="tv">
      <div class="tvhead">Travel from <b class="tva">${esc(A.n)}</b> to <b class="tvb">${esc(B.n)}</b></div>
      <div class="tvmap">${map}</div>
      <div class="tvbar"><span>${over?(st.won?(st.score===0?"Perfect route!":`Made it · +${st.score}`):"Out of guesses"):`${left} guess${left===1?"":"es"} left`}</span>${over?"":`<button class="btn ghost sm" id="tvhint">💡 Hint${st.h?` (${st.h})`:""}</button>`}</div>
      ${next&&st.hints.init?`<div class="tvinit">Next country starts with <b>${esc(GEO.by[next].n[0])}</b></div>`:""}
      ${msg?`<div class="tvmsg">${msg}</div>`:""}
      <div class="tvlist">${st.g.map((id,i)=>`<span class="tvg ${col[id]}">${st.e[i]} ${esc(GEO.by[id].n)}</span>`).join("")}</div>
      ${over?"":`<div id="tvin"></div>`}
      ${over&&!st.won?`<div class="tvmsg">One shortest route: ${esc([st.a,...tvPathCountries(st.a,st.b,new Set([st.a,st.b])),st.b].map(id=>GEO.by[id].n).join(" → "))}</div>`:""}
    </div>`;
    if(!over){ geoInput($('tvin'),{placeholder:"Type a country",skip:()=>free(),onPick:guess});
      $('tvhint').onclick=hintMenu; }
    __b.tvNeed=need; }
  function hintMenu(){ const opts=[["outlines","Show all borders on the map"],["init","First letter of the next country"],["next","Outline the next country"]].filter(([k])=>!st.hints[k]);
    if(!opts.length){ toast("No hints left"); return; }
    const box=document.createElement("div"); box.className="tvhints"; box.innerHTML=`<p>Each hint is noted in your result.</p>${opts.map(([k,l])=>`<button class="btn" data-k="${k}">${esc(l)}</button>`).join("")}<button class="btn ghost" data-k="">Cancel</button>`;
    stage.querySelector(".tv").appendChild(box);
    box.onclick=e=>{ const b=e.target.closest("button"); if(!b) return; box.remove(); if(!b.dataset.k) return; st.hints[b.dataset.k]=1; st.h++; if(daily) save(); render(); }; }
  function guess(c){ if(over) return false;
    if(c.id===st.a||c.id===st.b){ toast(`${c.n} is on the map already`); return false; }
    if(st.g.includes(c.id)){ toast("Already guessed!"); return false; }
    const fr=free(), before=tvNeed(st.a,st.b,fr);
    const ds=tvDist(st.a,null,fr), de=tvDist(st.b,null,fr), through=ds[c.id]>=1e9||de[c.id]>=1e9?1e9:ds[c.id]+de[c.id]-1;
    st.g.push(c.id); const fr2=free(), after=tvNeed(st.a,st.b,fr2);
    let e; if(after<before) e=tvComponent(st.a,fr2).has(c.id)?"✅":"🟩"; else e=through<=before+1?"🟧":"🟥";
    st.e.push(e); if(e==="✅"||e==="🟩") good(); else bad();
    if(after===0){ over=true; st.won=1; st.score=st.g.length-st.n; return done(); }
    if(st.g.length>=st.max){ over=true; st.won=0; return done(); }
    if(daily) save(); render(); }
  function done(){ st.over=1; if(daily) save(); render(); if(st.won) setTimeout(confetti,250);
    later(()=>finish(gid,st.won?st.score:99,{sub:st.won?`${A.n} → ${B.n} · ${st.g.length} guesses (best possible ${st.n})${st.h?` · ${st.h} hint${st.h>1?"s":""}`:""}`:`${A.n} → ${B.n} · didn't make it`, share:tvShare(st,daily), html:tvMapCard(st)+tvRouteCard(st), nextG:"travleu", nextLabel:daily?"Play unlimited Travle":"Play again"}),2200); }
  if(st.over){ over=true; } render();
}
function tvMapCard(st){ const col={}; st.g.forEach((id,i)=>col[id]=st.e[i]==="✅"||st.e[i]==="🟩"?"g-ok":st.e[i]==="🟧"?"g-near":"g-far");
  return `<section class="card"><div class="tvmap">${geoMapSVG(geoBox([st.a,st.b,...st.g.filter((id,i)=>st.e[i]!=="🟥")],.18,160),inView=>GEO.list.filter(inView).filter(c=>c.id!==st.a&&c.id!==st.b&&!col[c.id]).map(c=>geoPathEl(c,"g-ghost")).join("")+st.g.map(id=>geoPathEl(GEO.by[id],col[id])).join("")+geoPathEl(GEO.by[st.a],"g-start")+geoPathEl(GEO.by[st.b],"g-end"))}</div></section>`; }
function tvRouteCard(st){ const best=[st.a,...tvPathCountries(st.a,st.b,new Set([st.a,st.b])),st.b].map(id=>GEO.by[id].n);
  return `<section class="card"><h3>Your route</h3><div class="tvlist">${st.g.map((id,i)=>`<span class="tvg">${st.e[i]} ${esc(GEO.by[id].n)}</span>`).join("")}</div><p class="muted" style="margin-top:10px">One shortest route (${st.n} in between): ${esc(best.join(" → "))}</p></section>`; }
function tvResults(){ const st=S.tv[today()];
  show(`${bar("Travle")}
  <section class="card center" style="--c:var(--geo)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Travle #${tvNum()}</div>
    <div class="big">${st.won?(st.score===0?"Perfect":"+"+st.score):"✗"}</div><p class="muted">${esc(GEO.by[st.a].n)} → ${esc(GEO.by[st.b].n)}${st.h?` · ${st.h} hint${st.h>1?"s":""}`:""}</p><p class="cheer" style="color:var(--ink-2)">New route tomorrow</p></section>
  ${tvMapCard(st)}
  ${tvRouteCard(st)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="travleu">Play unlimited Travle</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(tvShare(st,true)); }
