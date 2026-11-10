/* ================= FLAGLE · HIGHER OR LOWER · QUEENS · TIMELINE ================= */
/* flags.json (built by tools/build-flags.mjs): every country's flag as SVG, its capital and its 2025 population. Loaded on first use. */
let FD=null, FD_P=null;
function flagsLoad(){ if(FD) return Promise.resolve(FD); if(FD_P) return FD_P;
  FD_P=Promise.all([geoLoad(),fetch("flags.json?v=1").then(r=>{ if(!r.ok) throw 0; return r.json(); })]).then(([g,d])=>FD=d).catch(e=>{ FD_P=null; throw e; });
  return FD_P; }
const flagSVG=id=>FD.f[id]||"";
const dailyRot=(name,list)=>{ const rot=shuf(list.slice().sort(),seeded("globetrotter-"+name+"-v1")); const n=rot.length; return rot[((dayIndex()%n)+n)%n]; };
const bigNum=n=>n>=1e9?(n/1e9).toFixed(n>=1e10?1:2)+" billion":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" million":Math.round(n).toLocaleString();

/* ---------------- FLAGLE ---------------- */
/* the flag hides under six tiles; each wrong guess lifts one. Six guesses, with Worldle-style distance, direction and closeness.
   Win and there are two bonus questions: the capital, and a neighbour. */
let FL_POOL=null;
const flPool=()=>FL_POOL||(FL_POOL=GEO.list.filter(c=>FD.f[c.id]).map(c=>c.id));
const flDaily=()=>{ const pool=flPool(); let id=dailyRot("flagle",pool); if(id===wlDaily()||id===gbDaily()){ const rot=shuf(pool.slice().sort(),seeded("globetrotter-flagle-v1")); id=rot[(rot.indexOf(id)+1)%rot.length]; } return id; };
const flNum=()=>dayIndex()+1;
function flStatus(){ S.fl=S.fl||{}; const d=S.fl[today()]; return d&&d.over?(d.won?`Today's done · ${d.g.length}/6${d.bon?" "+"⭐".repeat(d.bon):""}`:"Today's done · X/6"):d&&d.g.length?`Today's #${flNum()} · ${d.g.length}/6 guessed`:`Today's #${flNum()} is ready`; }
function flShare(st,daily){ const t=GEO.by[st.t], rows=st.g.map(id=>wlRow(t,id)), best=Math.max(0,...rows.map(r=>r.p));
  return `#Flagle ${daily?"#"+flNum():"(unlimited)"} ${st.won?rows.length:"X"}/6 (${best}%)\n${rows.map(r=>r.hit?"🟩🟩🟩🟩🟩🎉":wlSquares(r.p)+r.a).join("\n")}${st.won&&st.bq?`\nBonus ${"⭐".repeat(st.bon||0)}${"▫️".repeat(2-(st.bon||0))}`:""}`; }
function flBoard(t,st,over){ const shown=new Set(st.rev); return `<div class="flbox ${over?(st.won?"won":"lost"):""}"><div class="flsvg">${flagSVG(t.id)}</div><div class="fltiles">${[0,1,2,3,4,5].map(i=>`<i class="${over||shown.has(i)?"off":""}" style="--d:${i*.05}s"></i>`).join("")}</div></div>`; }
async function startFlagle(opt={}){
  const daily=!opt.unlimited, gid=daily?"flagle":"flagleu";
  begin(gid,daily?`Flagle #${flNum()}`:"Unlimited Flagle"); stage.className="gstage scroll"; geoLoading();
  try{ await flagsLoad(); }catch(e){ return geoFail(); }
  if(!GS||GS.game!==gid) return;
  S.fl=S.fl||{}; const key=today();
  if(daily&&S.fl[key]&&S.fl[key].over&&S.fl[key].bq>=2){ end(); return flResults(); }
  let st;
  if(daily) st=S.fl[key]=S.fl[key]&&S.fl[key].t===flDaily()?S.fl[key]:{t:flDaily(),g:[],rev:[Math.floor(seeded("fl-first"+key)()*6)]};
  else { const pool=flPool().filter(id=>id!==S.flLast&&GEO.by[id].km2>3000); const t=pool[Math.floor(Math.random()*pool.length)]; S.flLast=t; save(); st={t,g:[],rev:[Math.floor(Math.random()*6)]}; }
  const t=GEO.by[st.t]; __b.fl=st;
  let over=!!st.over;
  const persist=()=>{ if(daily) save(); };
  function render(){ const rows=st.g.map(id=>wlRow(t,id));
    stage.innerHTML=`<div class="wl fl">${flBoard(t,st,over)}${over?`<div class="flname">${esc(t.n)}</div>`:""}
      <div class="wlrows">${[0,1,2,3,4,5].map(i=>{ const r=rows[i]; return r?wlRowHtml(r,true):`<div class="wlrow empty"><b></b><span></span><span></span><span></span></div>`; }).join("")}</div>
      <div id="flin"></div></div>`;
    revealRow(st.g.length);
    stage.querySelectorAll(".wldist").forEach(el=>el.onclick=()=>{ S.wlMi=!S.wlMi; save(); render(); });
    if(!over) geoInput($('flin'),{placeholder:"Which country's flag?",skip:()=>new Set(st.g),onPick:guess}); }
  function guess(c){ if(over) return false; if(st.g.includes(c.id)){ toast("Already guessed!"); return false; }
    st.g.push(c.id);
    if(c.id===t.id){ good(); over=true; st.won=1; st.over=1; persist(); render(); setTimeout(confetti,250); later(bonus,1500); return; }
    bad(); const hidden=[0,1,2,3,4,5].filter(i=>!st.rev.includes(i)); if(hidden.length) st.rev.push(hidden[Math.floor(Math.random()*hidden.length)]);
    if(st.g.length>=6){ over=true; st.won=0; st.over=1; st.bq=2; persist(); render(); toast(`It was ${t.n}`); later(fin,1900); return; }
    persist(); render(); }
  /* bonus rounds, as on flagle.io: name the capital, then pick a country that borders it (or, for an island, its continent) */
  function bonus(){ st.bq=st.bq||0; st.bon=st.bon||0; if(st.bq>=2) return fin();
    const sameC=GEO.list.filter(c=>c.c===t.c&&c.id!==t.id&&FD.cap[c.id]), any=GEO.list.filter(c=>c.id!==t.id&&FD.cap[c.id]);
    let q, right, opts;
    if(st.bq===0){ q=`Bonus: what is the capital of ${t.n}?`; right=FD.cap[t.id]; opts=shuf(sameC.length>=3?sameC:any).slice(0,3).map(c=>FD.cap[c.id]); }
    else if(t.b.length){ q=`Bonus: which of these borders ${t.n}?`; right=GEO.by[t.b[Math.floor(Math.random()*t.b.length)]].n; opts=shuf((sameC.length>=6?sameC:any).filter(c=>!t.b.includes(c.id))).slice(0,3).map(c=>c.n); }
    else { q=`Bonus: which continent is ${t.n} part of?`; right=t.c; opts=shuf(["Africa","Asia","Europe","North America","South America","Oceania"].filter(x=>x!==t.c)).slice(0,3); }
    const all=shuf([right,...opts.filter((o,i,a)=>o&&o!==right&&a.indexOf(o)===i)].slice(0,4));
    stage.innerHTML=`<div class="wl fl">${flBoard(t,st,true)}<div class="flname">${esc(t.n)}</div>
      <div class="flbonus"><div class="eyebrow2">Bonus ${st.bq+1} of 2</div><h3>${esc(q)}</h3><div class="flopts">${all.map(o=>`<button class="btn" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div></div></div>`;
    stage.querySelectorAll(".flopts button").forEach(b=>b.onclick=()=>{ const ok=b.dataset.o===right;
      stage.querySelectorAll(".flopts button").forEach(x=>{ x.disabled=true; if(x.dataset.o===right) x.classList.add("right"); else if(x===b) x.classList.add("wrong"); });
      if(ok){ good(); st.bon++; } else bad(); st.bq++; persist(); later(bonus,1100); }); }
  function fin(){ const rows=st.g.map(id=>wlRow(t,id));
    finish(gid,st.won?rows.length:7,{sub:st.won?`${t.n} in ${rows.length}${st.bq?` · bonus ${st.bon||0}/2`:""}`:`It was ${t.n}`, share:flShare(st,daily), html:flCard(st), nextG:"flagleu", nextLabel:daily?"Play unlimited Flagle":"Play again"}); }
  if(over&&st.won&&(st.bq||0)<2){ render(); later(bonus,600); return; }
  render();
}
function flCard(st){ const t=GEO.by[st.t]; return `<section class="card"><div class="flcard">${flagSVG(t.id)}</div><h3 style="margin-top:10px">${esc(t.n)}</h3><p class="muted">Capital ${esc(FD.cap[t.id]||"–")} · ${esc(t.c)}${FD.pop[t.id]?` · ${bigNum(FD.pop[t.id])} people`:""}</p></section>`; }
function flResults(){ const st=S.fl[today()], t=GEO.by[st.t], rows=st.g.map(id=>wlRow(t,id));
  show(`${bar("Flagle")}
  <section class="card center" style="--c:var(--geo)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Flagle #${flNum()}</div>
    <div class="big">${st.won?rows.length:"X"}/6</div><p class="muted">${st.won?`You found ${esc(t.n)}${st.bon!=null?` · bonus ${st.bon}/2`:""}`:`It was ${esc(t.n)}`}</p><p class="cheer" style="color:var(--ink-2)">New flag tomorrow</p></section>
  ${flCard(st)}
  <section class="card"><div class="wlrows">${rows.map(r=>wlRowHtml(r)).join("")}</div></section>
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="flagleu">Play unlimited Flagle</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(flShare(st,true)); }

/* ---------------- HIGHER OR LOWER (population) ---------------- */
/* the known country on top, the next one below: does it have more people or fewer? One miss ends the run. */
const HL_POOL=()=>GEO.list.filter(c=>FD.pop[c.id]&&FD.f[c.id]).map(c=>c.id).sort();
function hlNext(prev,rnd,used){ const pool=HL_POOL(), p0=FD.pop[prev];
  for(let k=0;k<200;k++){ const id=pool[Math.floor(rnd()*pool.length)]; if(id===prev||used.has(id)) continue; const r=FD.pop[id]/p0;
    if(r>.93&&r<1.075) continue; // skip near-ties: too close to call
    return id; }
  return pool.find(id=>id!==prev&&!used.has(id)); }
function hlStatus(){ S.hl=S.hl||{}; const d=S.hl[today()]; return d&&d.over?`Today's done · ${d.n} in a row`:`Today's run is ready`; }
function hlShare(n,daily){ return `🌍 Higher or Lower: population ${daily?"#"+(dayIndex()+1):"(unlimited)"}\n${n} in a row ${n>=15?"🔥🔥🔥":n>=10?"🔥🔥":n>=5?"🔥":""}`; }
async function startHiLo(opt={}){
  const daily=!opt.unlimited, gid=daily?"hilo":"hilou";
  begin(gid,daily?"Higher or Lower":"Unlimited Higher or Lower"); stage.className="gstage scroll"; geoLoading();
  try{ await flagsLoad(); }catch(e){ return geoFail(); }
  if(!GS||GS.game!==gid) return;
  S.hl=S.hl||{}; const key=today();
  if(daily&&S.hl[key]&&S.hl[key].over){ end(); return hlResults(); }
  const rnd=daily?seeded("globetrotter-hilo-v1-"+key):Math.random, used=new Set();
  let a=HL_POOL()[Math.floor(rnd()*HL_POOL().length)]; used.add(a); let b=hlNext(a,rnd,used); used.add(b);
  let n=0, busy=false; const history=[];
  __b.hl={get a(){return a;}, get b(){return b;}};
  const card=(id,known,cls="")=>{ const c=GEO.by[id]; return `<div class="hlc ${cls}"><div class="hlflag">${flagSVG(id)}</div><div class="hltxt"><b>${esc(c.n)}</b>${known?`<span class="hlpop">${bigNum(FD.pop[id])}</span><small>people</small>`:`<span class="hlq">has a <em>higher</em> or <em>lower</em> population?</span>`}</div></div>`; };
  function render(){ $('ginfo').textContent=`${n} in a row`;
    stage.innerHTML=`<div class="hl">${card(a,true)}<div class="hlvs">VS</div>${card(b,false,"hlb")}
      <div class="hlbtns"><button class="btn hlup" data-v="1">▲ Higher</button><button class="btn hldn" data-v="-1">▼ Lower</button></div>
      <p class="muted center">${n?`Streak: <b>${n}</b>`:"Population estimates for 2025"}</p></div>`;
    stage.querySelectorAll(".hlbtns button").forEach(btn=>btn.onclick=()=>pick(+btn.dataset.v)); }
  function pick(v){ if(busy) return; busy=true; const pa=FD.pop[a], pb=FD.pop[b], ok=v>0?pb>pa:pb<pa;
    const box=stage.querySelector(".hlb .hltxt"); box.querySelector(".hlq").outerHTML=`<span class="hlpop" id="hlcount">0</span><small>people</small>`;
    stage.querySelectorAll(".hlbtns button").forEach(x=>x.disabled=true);
    const t0=performance.now(), dur=700, el=$('hlcount');
    const step=()=>{ const k=Math.min(1,(performance.now()-t0)/dur), e=1-(1-k)**3; el.textContent=bigNum(pb*e); if(k<1) requestAnimationFrame(step); else done(); }; requestAnimationFrame(step);
    function done(){ stage.querySelector(".hlb").classList.add(ok?"ok":"no"); history.push(ok);
      if(ok){ good(); n++; $('ginfo').textContent=`${n} in a row`; later(()=>{ a=b; used.add(a); b=hlNext(a,rnd,used); used.add(b); busy=false; render(); },850); }
      else { bad(); later(lose,1200); } } }
  function lose(){ if(daily){ S.hl[key]={over:1,n}; save(); }
    if(n>=5) setTimeout(confetti,200);
    finish(gid,n,{sub:`${GEO.by[b].n} has ${bigNum(FD.pop[b])} people; ${GEO.by[a].n} has ${bigNum(FD.pop[a])}`, share:hlShare(n,daily), nextG:"hilou", nextLabel:daily?"Play unlimited Higher or Lower":"Play again", note:"Population: UN estimates for 2025."}); }
  render();
}
function hlResults(){ const st=S.hl[today()];
  show(`${bar("Higher or Lower")}
  <section class="card center" style="--c:var(--geo)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's run</div>
    <div class="big">${st.n}</div><p class="muted">in a row</p><p class="cheer" style="color:var(--ink-2)">New run tomorrow</p></section>
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="hilou">Play unlimited Higher or Lower</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(hlShare(st.n,true)); }

/* ---------------- QUEENS ---------------- */
/* one queen in every row, column and color region, and no two queens touch, not even at a corner.
   Tap a square once for ✕, twice for a queen, again to clear; drag across squares to mark ✕. */
/*QUEENS_DATA*/
const QCOL=["#f4b07a","#b8d4f5","#c9e5a6","#e8b8e8","#f5e08a","#a8e0d8","#f5a8a8","#c7c0f0","#dcdcdc","#f3c9a0"];
const QCOL_D=["#a8683b","#3f6a9e","#5f8a3c","#8e4f8e","#9c8530","#2f8a80","#a84a4a","#5d55a0","#6b6f75","#a0703f"];
let QN_ROT=null;
const qnDailyIx=()=>{ if(!QN_ROT) QN_ROT=shuf([...QUEENS.keys()],seeded("globetrotter-queens-v1")); const n=QN_ROT.length; return QN_ROT[((dayIndex()%n)+n)%n]; };
const qnNum=()=>dayIndex()+1;
function qnStatus(){ S.qn=S.qn||{}; const d=S.qn[today()]; return d&&d.done?`Today's done · ${fmtT(d.t)}`:d&&d.m&&d.m.some(Boolean)?`Today's #${qnNum()} · in progress`:`Today's #${qnNum()} is ready`; }
function qnShare(P,t,h,daily){ return `👑 Queens ${daily?"#"+qnNum():"(unlimited)"} · ${P[0]}×${P[0]}\n⏱️ ${fmtT(t)}${h?` · 💡 ${h} hint${h>1?"s":""}`:" · no hints"}`; }
function startQueens(opt={}){
  const daily=!opt.unlimited, gid=daily?"queens":"queensu";
  S.qn=S.qn||{}; const key=today();
  if(daily&&S.qn[key]&&S.qn[key].done) return qnResults();
  const ix=daily?qnDailyIx():(()=>{ let k; do{ k=Math.floor(Math.random()*QUEENS.length); }while(k===qnDailyIx()); return k; })();
  const P=QUEENS[ix], N=P[0], reg=[...P[1]].map(ch=>ch.charCodeAt(0)-65), sol=[...P[2]].map(Number);
  const st=daily?(S.qn[key]=S.qn[key]&&S.qn[key].ix===ix?S.qn[key]:{ix,m:new Array(N*N).fill(0),h:0,ms:0}):{ix,m:new Array(N*N).fill(0),h:0,ms:0};
  begin(gid,daily?`Queens #${qnNum()}`:"Unlimited Queens"); stage.className="gstage scroll"; clock(); GS.t0-=st.ms||0;
  __b.qn={P,st,sol};
  const undo=[]; let won=false;
  const dark=matchMedia("(prefers-color-scheme: dark)").matches&&document.documentElement.dataset.theme!=="light"||document.documentElement.dataset.theme==="dark";
  const pal=dark?QCOL_D:QCOL;
  const R=i=>Math.floor(i/N), C=i=>i%N;
  const persist=()=>{ st.ms=elapsed(); if(daily) save(); };
  stage.innerHTML=`<div class="qn"><div class="qnboard" id="qb" style="--n:${N}">${reg.map((g,i)=>{ const r=R(i), c=C(i);
      const bt=r===0||reg[i-N]!==g, bb=r===N-1||reg[i+N]!==g, bl=c===0||reg[i-1]!==g, br=c===N-1||reg[i+1]!==g;
      const sh=[bt?"inset 0 1.5px 0 var(--qline)":"",bb?"inset 0 -1.5px 0 var(--qline)":"",bl?"inset 1.5px 0 0 var(--qline)":"",br?"inset -1.5px 0 0 var(--qline)":"","inset 0 0 0 .5px var(--qthin)"].filter(Boolean).join(",");
      return `<button class="qc" data-i="${i}" style="--q:${pal[g%pal.length]};box-shadow:${sh}"></button>`; }).join("")}</div>
    <div class="qnbar"><button class="btn ghost sm" id="qundo">↶ Undo</button><button class="btn ghost sm" id="qclear">Clear</button><button class="btn ghost sm" id="qhint">💡 Hint</button></div>
    <label class="qnauto"><input type="checkbox" id="qauto" ${S.qnAuto?"checked":""}> Auto-mark ✕ around queens</label>
    <p class="muted center qnrules">One 👑 in each row, column and color. Queens can't touch, even diagonally. Tap once for ✕, twice for 👑. Drag to mark ✕.</p></div>`;
  const cells=[...stage.querySelectorAll(".qc")];
  function conflicts(){ const q=st.m.map((v,i)=>v===2?i:-1).filter(i=>i>=0), bad=new Set();
    for(let a=0;a<q.length;a++) for(let b=a+1;b<q.length;b++){ const x=q[a], y=q[b];
      if(R(x)===R(y)||C(x)===C(y)||reg[x]===reg[y]||(Math.abs(R(x)-R(y))<=1&&Math.abs(C(x)-C(y))<=1)){ bad.add(x); bad.add(y); } }
    return {q,bad}; }
  function auto(){ // auto-✕: every square a queen rules out, shown faintly
    const a=new Set(); if(!S.qnAuto) return a; st.m.forEach((v,i)=>{ if(v!==2) return; for(let j=0;j<N*N;j++) if(j!==i&&(R(j)===R(i)||C(j)===C(i)||reg[j]===reg[i]||(Math.abs(R(j)-R(i))<=1&&Math.abs(C(j)-C(i))<=1))) a.add(j); }); return a; }
  function draw(){ const {q,bad}=conflicts(), au=auto();
    // a row, column or region with two queens gets every square striped red, like the real game
    const badUnits=new Set(); q.forEach(x=>q.forEach(y=>{ if(x<y){ if(R(x)===R(y)) badUnits.add("r"+R(x)); if(C(x)===C(y)) badUnits.add("c"+C(x)); if(reg[x]===reg[y]) badUnits.add("g"+reg[x]); } }));
    cells.forEach((el,i)=>{ const v=st.m[i]; el.textContent=v===2?"👑":v===1||(v===0&&au.has(i))?"✕":"";
      el.classList.toggle("qx",v===1); el.classList.toggle("qax",v===0&&au.has(i)); el.classList.toggle("qq",v===2); el.classList.toggle("bad",bad.has(i));
      el.classList.toggle("stripe",badUnits.has("r"+R(i))||badUnits.has("c"+C(i))||badUnits.has("g"+reg[i])); });
    if(q.length===N&&!bad.size&&!won){ won=true; win(); } }
  function set(i,v,rec=true){ if(st.m[i]===v) return; if(rec) undo.push([i,st.m[i]]); st.m[i]=v; }
  function tap(i){ if(won) return; const v=st.m[i]; set(i,v===0?1:v===1?2:0); if(st.m[i]===2) tone(520+R(i)*40,.07,"sine",.04); persist(); draw(); }
  function win(){ cancelAnimationFrame(GS.raf); const t=elapsed(); st.done=1; st.t=t; persist(); stage.querySelector(".qnboard").classList.add("won"); setTimeout(confetti,250);
    later(()=>finish(gid,t,{sub:`${N}×${N}${st.h?` · ${st.h} hint${st.h>1?"s":""}`:" · no hints"}`, share:qnShare(P,t,st.h,daily), nextG:"queensu", nextLabel:daily?"Play unlimited Queens":"Play again"}),1500); }
  // pointer: tap cycles; dragging from a square marks ✕ on every empty square you pass
  const board=$('qb'); let down=null, moved=false;
  const at=(x,y)=>{ const el=document.elementFromPoint(x,y); return el&&el.classList.contains("qc")?+el.dataset.i:-1; };
  board.addEventListener("pointerdown",e=>{ const i=at(e.clientX,e.clientY); if(i<0||won) return; e.preventDefault(); board.setPointerCapture(e.pointerId); down=i; moved=false; });
  board.addEventListener("pointermove",e=>{ if(down==null) return; const i=at(e.clientX,e.clientY); if(i<0) return;
    if(i!==down&&!moved){ moved=true; if(st.m[down]===0) set(down,1); }
    if(moved&&st.m[i]===0){ set(i,1); draw(); } });
  const up=()=>{ if(down==null) return; const i=down; down=null; if(!moved) tap(i); else { persist(); draw(); } };
  board.addEventListener("pointerup",up); board.addEventListener("pointercancel",()=>{ down=null; });
  $('qundo').onclick=()=>{ const u=undo.pop(); if(!u) return; st.m[u[0]]=u[1]; persist(); draw(); };
  $('qclear').onclick=()=>{ const b=$('qclear'); if(!b.dataset.sure){ b.dataset.sure=1; b.textContent="Tap to clear"; setTimeout(()=>{ if(b.isConnected){ b.dataset.sure=""; b.textContent="Clear"; } },2000); return; } st.m.forEach((v,i)=>set(i,0)); b.dataset.sure=""; b.textContent="Clear"; persist(); draw(); };
  $('qhint').onclick=()=>{ if(won) return; // fix one wrong mark, or place one correct queen
    const solSet=new Set(sol.map((c,r)=>r*N+c)); const wrongQ=st.m.findIndex((v,i)=>v===2&&!solSet.has(i)); const wrongX=st.m.findIndex((v,i)=>v===1&&solSet.has(i));
    let i; if(wrongQ>=0){ set(wrongQ,0); i=wrongQ; toast("That queen can't go there"); } else if(wrongX>=0){ set(wrongX,0); i=wrongX; toast("A queen belongs on this ✕"); }
    else { const need=[...solSet].filter(j=>st.m[j]!==2); if(!need.length) return; i=need[Math.floor(Math.random()*need.length)]; set(i,2); }
    st.h++; persist(); draw(); const el=cells[i]; el.classList.add("hint"); later(()=>el.classList.remove("hint"),1200); };
  $('qauto').onchange=e=>{ S.qnAuto=e.target.checked; save(); draw(); };
  draw();
}
function qnResults(){ const st=S.qn[today()], P=QUEENS[st.ix];
  show(`${bar("Queens")}
  <section class="card center" style="--c:var(--log)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Queens #${qnNum()}</div>
    <div class="big">${fmtT(st.t)}</div><p class="muted">${P[0]}×${P[0]}${st.h?` · ${st.h} hint${st.h>1?"s":""}`:" · no hints"}</p><p class="cheer" style="color:var(--ink-2)">New board tomorrow</p></section>
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="queensu">Play unlimited Queens</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(qnShare(P,st.t,st.h,true)); }

/* ---------------- TIMELINE ---------------- */
/* one event is on the line; place each new card where it belongs. A wrong spot costs a life and the card jumps to its real place. */
/*TIMELINE_DATA*/
const TL_N=8, TL_LIVES=3;
const tlYear=y=>y<0?`${-y} BC`:String(y);
function tlDeck(rnd){ const order=shuf([...TL.keys()],rnd), out=[], years=new Set(), cats={};
  for(const k of order){ const [y,,c]=TL[k]; if(years.has(y)) continue; if((cats[c]||0)>=3) continue; years.add(y); cats[c]=(cats[c]||0)+1; out.push(k); if(out.length===TL_N) break; }
  return out; }
function tlStatus(){ S.tl=S.tl||{}; const d=S.tl[today()]; return d&&d.over?`Today's done · ${d.sc}/${TL_N-1}`:d&&d.i>1?`Today's #${dayIndex()+1} · card ${d.i} of ${TL_N}`:`Today's #${dayIndex()+1} is ready`; }
function tlShare(st,daily){ return `📅 Timeline ${daily?"#"+(dayIndex()+1):"(unlimited)"} ${st.sc}/${TL_N-1}\n${st.res.map(r=>r?"🟩":"🟥").join("")}${"⬜".repeat(Math.max(0,TL_N-1-st.res.length))}`; }
function startTimeline(opt={}){
  const daily=!opt.unlimited, gid=daily?"timeline":"timelineu";
  S.tl=S.tl||{}; const key=today();
  if(daily&&S.tl[key]&&S.tl[key].over) return tlResults();
  let st;
  if(daily&&S.tl[key]) st=S.tl[key];
  else { st={d:tlDeck(daily?seeded("globetrotter-timeline-v1-"+key):Math.random),i:1,line:[],res:[],lives:TL_LIVES,sc:0}; st.line=[st.d[0]]; if(daily){ S.tl[key]=st; save(); } }
  begin(gid,daily?`Timeline #${dayIndex()+1}`:"Unlimited Timeline"); stage.className="gstage scroll";
  __b.tl=st;
  const persist=()=>{ if(daily) save(); };
  let busy=false, flash=null;
  function render(){ const cur=st.i<st.d.length&&st.lives>0?TL[st.d[st.i]]:null;
    $('ginfo').textContent=`${"❤️".repeat(st.lives)}${"🤍".repeat(TL_LIVES-st.lives)}`;
    const line=st.line.map(k=>TL[k]);
    stage.innerHTML=`<div class="tl">
      ${cur?`<div class="tlcur"><span class="tlcat">${esc(cur[2])}</span><b>${esc(cur[1])}</b><small>Card ${st.i} of ${TL_N-1} · tap where it goes</small></div>`:""}
      <div class="tlline">${line.map((e,j)=>`${cur?`<button class="tlslot" data-p="${j}"><span>Place here</span></button>`:""}<div class="tlcard ${flash&&flash.k===st.line[j]?flash.cls:""}"><span class="tly">${tlYear(e[0])}</span><span class="tle">${esc(e[1])}</span></div>`).join("")}${cur?`<button class="tlslot" data-p="${line.length}"><span>Place here</span></button>`:""}</div></div>`;
    stage.querySelectorAll(".tlslot").forEach(b=>b.onclick=()=>place(+b.dataset.p));
    if(flash){ const el=stage.querySelector(".tlcard."+flash.cls); if(el) el.scrollIntoView({block:"center",behavior:"smooth"}); } }
  function place(p){ if(busy) return; busy=true; const k=st.d[st.i], y=TL[k][0], line=st.line.map(x=>TL[x][0]);
    const ok=(p===0||line[p-1]<=y)&&(p===line.length||y<=line[p]);
    let pos=p; if(!ok){ pos=line.findIndex(v=>v>y); if(pos<0) pos=line.length; st.lives--; bad(); } else good();
    st.line.splice(pos,0,k); st.res.push(ok); if(ok) st.sc++; st.i++; flash={k,cls:ok?"ok":"no"};
    if(!ok) toast(`${tlYear(y)}`);
    persist(); render();
    if(st.i>=st.d.length||st.lives<=0){ st.over=1; persist(); if(st.sc===TL_N-1) setTimeout(confetti,250);
      later(()=>finish(gid,st.sc,{sub:`${st.sc} of ${TL_N-1} placed right${st.lives<=0&&st.i<st.d.length?" · out of lives":""}`, share:tlShare(st,daily), html:tlCard(st), nextG:"timelineu", nextLabel:daily?"Play unlimited Timeline":"Play again"}),1500); return; }
    later(()=>{ busy=false; flash=null; render(); },900); }
  render();
}
function tlCard(st){ return `<section class="card"><h3>The timeline</h3><div class="tlline">${st.line.map(k=>{ const e=TL[k], ix=st.d.indexOf(k), r=ix>0?st.res[ix-1]:null;
  return `<div class="tlcard ${r===true?"ok":r===false?"no":""}"><span class="tly">${tlYear(e[0])}</span><span class="tle">${esc(e[1])}</span></div>`; }).join("")}</div></section>`; }
function tlResults(){ const st=S.tl[today()];
  show(`${bar("Timeline")}
  <section class="card center" style="--c:var(--spd)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Timeline #${dayIndex()+1}</div>
    <div class="big">${st.sc}/${TL_N-1}</div><p class="muted">placed right</p><p class="cheer" style="color:var(--ink-2)">New cards tomorrow</p></section>
  ${tlCard(st)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="timelineu">Play unlimited Timeline</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(tlShare(st,true)); }
