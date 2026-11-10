/* ================= MINESWEEPER · MAP TAP · STATELE ================= */

/* ---------------- MINESWEEPER ---------------- */
/* Every board can be cleared by logic alone, never a forced guess: a board is only kept if a solver that uses the
   numbers (single-square and overlapping-square rules, plus the mine count) clears it from the starting square.
   Daily: everyone gets the same board and starting square. Unlimited: your first tap is the start. */
const MS_LV={easy:{c:8,r:10,m:10,name:"Easy"},medium:{c:10,r:14,m:25,name:"Medium"},hard:{c:12,r:18,m:45,name:"Hard"}};
function msNb(C,R,i){ const r=Math.floor(i/C), c=i%C, o=[]; for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ if(!dr&&!dc) continue; const rr=r+dr, cc=c+dc; if(rr>=0&&rr<R&&cc>=0&&cc<C) o.push(rr*C+cc); } return o; }
function msSolvable(C,R,mine,start){ const N=C*R, NB=[...Array(N)].map((_,i)=>msNb(C,R,i)), num=NB.map((l,i)=>l.filter(j=>mine[j]).length);
  const open=new Uint8Array(N), flag=new Uint8Array(N); let opened=0, safeTotal=N-mine.reduce((a,b)=>a+b,0);
  const reveal=i=>{ const st=[i]; while(st.length){ const k=st.pop(); if(open[k]||flag[k]) continue; if(mine[k]) return false; open[k]=1; opened++; if(num[k]===0) for(const j of NB[k]) if(!open[j]) st.push(j); } return true; };
  reveal(start);
  for(let guard=0;guard<2000&&opened<safeTotal;guard++){ let prog=false; const cons=[];
    for(let i=0;i<N;i++){ if(!open[i]||num[i]===0) continue; const U=[]; let f=0; for(const j of NB[i]){ if(flag[j]) f++; else if(!open[j]) U.push(j); }
      if(!U.length) continue; const need=num[i]-f;
      if(need===0){ U.forEach(reveal); prog=true; } else if(need===U.length){ U.forEach(j=>flag[j]=1); prog=true; } else cons.push([U,need]); }
    if(prog) continue;
    // overlapping squares: if one square's unknowns sit inside another's, the difference is decided
    outer: for(let a=0;a<cons.length;a++) for(let b=0;b<cons.length;b++){ if(a===b) continue; const [UA,na]=cons[a], [UB,nb]=cons[b];
      if(UA.length>=UB.length||!UA.every(x=>UB.includes(x))) continue; const D=UB.filter(x=>!UA.includes(x)), k=nb-na;
      if(k===0){ D.forEach(reveal); prog=true; break outer; } if(k===D.length){ D.forEach(j=>flag[j]=1); prog=true; break outer; } }
    if(prog) continue;
    const unk=[]; for(let i=0;i<N;i++) if(!open[i]&&!flag[i]) unk.push(i); const left=mine.reduce((a,b)=>a+b,0)-flag.reduce((a,b)=>a+b,0);
    if(left===0){ unk.forEach(reveal); continue; } if(left===unk.length){ unk.forEach(j=>flag[j]=1); continue; }
    return false; }
  return opened>=safeTotal; }
function msMake(lv,rnd,start){ const {c:C,r:R,m:M}=MS_LV[lv], N=C*R;
  for(let t=0;t<3000;t++){ const s=start!=null?start:Math.floor(rnd()*N); const ban=new Set([s,...msNb(C,R,s)]);
    const cells=shuf([...Array(N).keys()].filter(i=>!ban.has(i)),rnd).slice(0,M), mine=new Array(N).fill(0); cells.forEach(i=>mine[i]=1);
    if(msSolvable(C,R,mine,s)) return {C,R,M,mine,start:s}; }
  return null; }
const msNum=()=>dayIndex()+1;
function msStatus(){ S.ms=S.ms||{}; const d=S.ms[today()]; return d&&d.over?(d.won?`Today's done · ${fmtT(d.t)}`:"Today's done · 💥"):d&&d.open&&d.open.some(Boolean)?`Today's #${msNum()} · in progress`:`Today's #${msNum()} is ready`; }
function msShare(st,lv,daily){ return `💣 Minesweeper ${daily?"#"+msNum():"(unlimited)"} · ${MS_LV[lv].name}\n${st.won?`✅ Cleared in ${fmtT(st.t)}`:"💥 Boom"}`; }
function msChooser(){ begin("msu","Unlimited Minesweeper"); stage.className="gstage scroll";
  stage.innerHTML=`<div class="mschoose"><p class="muted center">Every board can be solved without guessing. Your first tap is always safe.</p>${Object.entries(MS_LV).map(([k,v])=>{ const b=S.best["msu:"+k];
    return `<button class="mslv" data-lv="${k}"><b>${v.name}</b><span>${v.c}×${v.r} · ${v.m} mines</span><em>${b!=null?"Best "+fmtT(b):"Not played"}</em></button>`; }).join("")}</div>`;
  stage.querySelectorAll(".mslv").forEach(b=>b.onclick=()=>{ S.msLvl=b.dataset.lv; save(); startMines({unlimited:true,lv:b.dataset.lv}); }); }
function startMines(opt={}){
  const daily=!opt.unlimited, gid=daily?"mines":"msu", lv=daily?"medium":opt.lv;
  if(!daily&&!lv) return msChooser();
  S.ms=S.ms||{}; const key=today();
  if(daily&&S.ms[key]&&S.ms[key].over) return msResults();
  const {c:C,r:R,m:M}=MS_LV[lv], N=C*R;
  let B=null, st;
  if(daily){ st=S.ms[key]; if(!st||!st.mine){ B=msMake(lv,seeded("globetrotter-mines-v1-"+key)); st=S.ms[key]={mine:B.mine,start:B.start,open:new Array(N).fill(0),flag:new Array(N).fill(0),ms:0}; save(); } }
  else st={mine:null,start:null,open:new Array(N).fill(0),flag:new Array(N).fill(0),ms:0};
  begin(gid,daily?`Minesweeper #${msNum()}`:`Minesweeper · ${MS_LV[lv].name}`); stage.className="gstage scroll";
  let num=null, over=false, flagMode=false, started=st.open.some(Boolean);
  const NB=[...Array(N)].map((_,i)=>msNb(C,R,i));
  const calcNum=()=>{ num=NB.map(l=>l.filter(j=>st.mine[j]).length); };
  if(st.mine) calcNum();
  __b.ms={st,lv};
  const persist=()=>{ st.ms=started?elapsed():0; if(daily) save(); };
  stage.innerHTML=`<div class="ms"><div class="msbar"><span id="msleft">💣 ${M}</span><button class="msmode" id="msmode" aria-pressed="false"><span>⛏️ Dig</span><span>🚩 Flag</span></button></div>
    <div class="msboard" id="msb" style="--c:${C};--r:${R}">${[...Array(N)].map((_,i)=>`<button class="mc" data-i="${i}"></button>`).join("")}</div>
    <p class="muted center msrules">${daily?"Start on the square marked ●. ":"Tap anywhere to start. "}Tap ⛏️/🚩 to switch, or press and hold a square to flag it. Tap a number whose flags are all placed to clear around it.</p></div>`;
  const cells=[...stage.querySelectorAll(".mc")];
  function draw(boom){ let flags=0;
    cells.forEach((el,i)=>{ const o=st.open[i], f=st.flag[i]; if(f) flags++;
      el.className="mc"+(o?" o":"")+(f&&!o?" f":"")+(o&&num&&num[i]?" n"+num[i]:"")+(over&&st.mine&&st.mine[i]&&!f?" mine":"")+(boom===i?" boom":"")+(over&&f&&st.mine&&!st.mine[i]?" wrongf":"")+(!started&&daily&&i===st.start?" start":"");
      el.textContent=o?(num[i]||""):f?"🚩":over&&st.mine&&st.mine[i]?"💣":(!started&&daily&&i===st.start?"●":""); });
    $('msleft').textContent=`💣 ${M-flags}`; }
  function reveal(i){ const stack=[i]; while(stack.length){ const k=stack.pop(); if(st.open[k]||st.flag[k]) continue; st.open[k]=1; if(num[k]===0) for(const j of NB[k]) if(!st.open[j]) stack.push(j); } }
  function first(i){ if(!st.mine){ const b=msMake(lv,Math.random,i); st.mine=b.mine; st.start=i; calcNum(); } started=true; clock(); GS.t0-=st.ms||0; }
  function act(i,forceFlag){ if(over) return;
    if(!started){ if(daily&&i!==st.start){ toast("Start on the ● square"); return; } first(i); }
    if(forceFlag||(flagMode&&!st.open[i])){ if(st.open[i]) return; st.flag[i]=st.flag[i]?0:1; tone(st.flag[i]?700:500,.05,"sine",.04); persist(); draw(); return; }
    if(st.flag[i]) return;
    if(st.open[i]){ // chord
      const f=NB[i].filter(j=>st.flag[j]).length; if(!num[i]||f!==num[i]) return;
      for(const j of NB[i]) if(!st.flag[j]&&!st.open[j]){ if(st.mine[j]) return lose(j); reveal(j); } }
    else { if(st.mine[i]) return lose(i); reveal(i); }
    persist(); draw(); check(); }
  function check(){ let n=0; for(let i=0;i<N;i++) if(st.open[i]) n++; if(n<N-M) return;
    over=true; cancelAnimationFrame(GS.raf); const t=elapsed(); st.won=1; st.t=t; st.over=1; for(let i=0;i<N;i++) if(st.mine[i]) st.flag[i]=1; persist(); draw(); good(); setTimeout(confetti,200);
    later(()=>finish(gid,t,{key:daily?undefined:"msu:"+lv, sub:`${MS_LV[lv].name} · ${C}×${R} · ${M} mines`, share:msShare(st,lv,daily), nextG:"msu", nextLabel:daily?"Play unlimited Minesweeper":"Play again"}),1300); }
  function lose(i){ over=true; cancelAnimationFrame(GS.raf); st.over=1; st.won=0; st.boom=i; persist(); bad(); draw(i); stage.querySelector(".msboard").classList.add("lost");
    later(()=>finish(gid,99*60000,{noRecord:true, sub:`${MS_LV[lv].name} · hit a mine`, share:msShare(st,lv,daily), nextG:"msu", nextLabel:daily?"Play unlimited Minesweeper":"Try another board"}),1800); }
  // press and hold to flag; a quick tap digs (or flags in flag mode)
  const board=$('msb'); let hold=null, held=false, downI=-1, sx=0, sy=0;
  board.addEventListener("pointerdown",e=>{ const el=e.target.closest(".mc"); if(!el) return; downI=+el.dataset.i; held=false; sx=e.clientX; sy=e.clientY;
    clearTimeout(hold); hold=setTimeout(()=>{ if(downI<0||st.open[downI]) return; held=true; try{ navigator.vibrate&&navigator.vibrate(15); }catch(x){} act(downI,true); },380); });
  board.addEventListener("pointermove",e=>{ if(downI>=0&&Math.hypot(e.clientX-sx,e.clientY-sy)>12){ clearTimeout(hold); downI=-1; } });
  board.addEventListener("pointerup",()=>{ clearTimeout(hold); if(downI>=0&&!held) act(downI,false); downI=-1; });
  board.addEventListener("pointercancel",()=>{ clearTimeout(hold); downI=-1; });
  board.addEventListener("contextmenu",e=>{ e.preventDefault(); });
  $('msmode').onclick=()=>{ flagMode=!flagMode; $('msmode').setAttribute("aria-pressed",flagMode); };
  if(started){ clock(); GS.t0-=st.ms||0; }
  draw();
}
function msResults(){ const st=S.ms[today()];
  show(`${bar("Minesweeper")}
  <section class="card center" style="--c:var(--log)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Minesweeper #${msNum()}</div>
    <div class="big">${st.won?fmtT(st.t):"💥"}</div><p class="muted">${st.won?"Cleared":"Hit a mine"} · Medium, 10×14, 25 mines</p><p class="cheer" style="color:var(--ink-2)">New board tomorrow</p></section>
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="msu">Play unlimited Minesweeper</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(msShare(st,"medium",true)); }

/* ---------------- MAP TAP ---------------- */
/* five cities, one at a time ("Lyon, France"): tap where it is on a blank world map. Within 20 km is 1,000 points;
   after that the score falls off with the distance from your tap to the city. Cities: GeoNames (tools/build-cities.mjs). */
const MT_R=5;
let CT=null, CT_P=null;
function citiesLoad(){ if(CT) return Promise.resolve(CT); if(CT_P) return CT_P;
  CT_P=Promise.all([geoLoad(),fetch("cities.json?v=1").then(r=>{ if(!r.ok) throw 0; return r.json(); })]).then(([g,d])=>{ const list=[];
    Object.entries(d).forEach(([id,cs])=>cs.forEach(([n,lon,lat,pop])=>{ if(GEO.by[id]) list.push({id,n,ll:[lon,lat],pop}); })); return CT={list}; }).catch(e=>{ CT_P=null; throw e; });
  return CT_P; }
const mtFwd=([lon,lat])=>{ const W=GEO.W, k=W/(2*Math.PI), r=Math.PI/180; return [W/2+k*lon*r, W/2*0.95-k*Math.log(Math.tan(Math.PI/4+lat*r/2))]; };
const mtInv=(x,y)=>{ const W=GEO.W, k=W/(2*Math.PI); return [(x-W/2)/k*180/Math.PI, (2*Math.atan(Math.exp((W/2*0.95-y)/k))-Math.PI/2)*180/Math.PI]; }; // undo the map's Mercator projection
const mtPts=d=>d<=20?1000:Math.max(0,Math.round(1000*Math.exp(-(d-20)/550)));
const mtNum=()=>dayIndex()+1;
const mtLabel=q=>`${q.n}, ${GEO.by[q.id].n}`;
function mtPick(rnd){ const tiers=[[5e6,1e9],[1.5e6,5e6],[5e5,1.5e6],[1.5e5,5e5],[0,1.5e5]], out=[], used=new Set();
  tiers.forEach(([lo,hi])=>{ const pool=shuf(CT.list.filter(c=>c.pop>=lo&&c.pop<hi).sort((a,b)=>(a.id+a.n).localeCompare(b.id+b.n)),rnd);
    const c=pool.find(x=>!used.has(x.id)); if(c){ used.add(c.id); out.push({id:c.id,n:c.n,ll:c.ll}); } });
  return out; }
function mtStatus(){ S.mt=S.mt||{}; const d=S.mt[today()]; return d&&d.over?`Today's done · ${d.r.reduce((a,x)=>a+x.p,0).toLocaleString()}`:d&&d.r&&d.r.length?`Today's #${mtNum()} · round ${d.r.length+1} of ${MT_R}`:`Today's #${mtNum()} is ready`; }
function mtShare(st,daily){ const tot=st.r.reduce((a,x)=>a+x.p,0); return `📍 Map Tap ${daily?"#"+mtNum():"(unlimited)"}\n${tot.toLocaleString()} / 5,000\n${st.r.map(x=>x.p>=1000?"🎯":x.p>=700?"🟩":x.p>=400?"🟨":x.p>=150?"🟧":"🟥").join("")}`; }
async function startMapTap(opt={}){
  const daily=!opt.unlimited, gid=daily?"maptap":"maptapu";
  begin(gid,daily?`Map Tap #${mtNum()}`:"Unlimited Map Tap"); stage.className="gstage scroll"; geoLoading();
  try{ await citiesLoad(); }catch(e){ return geoFail(); }
  if(!GS||GS.game!==gid) return;
  S.mt=S.mt||{}; const key=today();
  if(daily&&S.mt[key]&&S.mt[key].over&&S.mt[key].v===2){ end(); return mtResults(); }
  let st; if(daily&&S.mt[key]&&S.mt[key].v===2) st=S.mt[key]; else { st={v:2,q:mtPick(daily?seeded("globetrotter-maptap-v2-"+key):Math.random),r:[]}; if(daily){ S.mt[key]=st; save(); } }
  __b.mt=st;
  const world=geoBox(GEO.list.map(c=>c.id),.02,200); let zoom={}, pin=null, shown=null;
  const persist=()=>{ if(daily) save(); };
  const pinR=()=>((zoom.v||world)[2]/70).toFixed(2);
  function render(){ const i=st.r.length, q=st.q[Math.min(i,st.q.length-1)], tot=st.r.reduce((a,x)=>a+x.p,0);
    $('ginfo').textContent=`${tot.toLocaleString()} pts`;
    const map=geoZoomable(world,inView=>GEO.list.filter(inView).map(x=>shown&&x.id===shown.q.id?geoPathEl(x,"g-reveal"):geoPathEl(x,"g-land")).join("")+
      (shown?`<line class="mtline" x1="${shown.x}" y1="${shown.y}" x2="${shown.c[0]}" y2="${shown.c[1]}"/><circle class="mtcity" cx="${shown.c[0]}" cy="${shown.c[1]}" r="${pinR()}"/>`:"")+
      (pin?`<circle class="mtpin" cx="${pin[0]}" cy="${pin[1]}" r="${pinR()}"/>`:""),zoom);
    const lab=mtLabel(shown?shown.q:q);
    stage.innerHTML=`<div class="tv mt"><div class="mthead"><span>Round ${Math.min(i+(shown?0:1),MT_R)} of ${MT_R}</span><b>${esc(lab.split(", ")[0])}</b><em>${esc(lab.split(", ").slice(1).join(", "))}</em></div>
      <div class="tvmap mtmap">${map}</div>
      ${shown?`<div class="mtres"><b>${shown.p>=1000?"🎯 Bullseye!":`${Math.round(shown.d).toLocaleString()} km away`}</b><span>+${shown.p} points</span></div><button class="btn go wide" id="mtnext">${st.r.length<MT_R?"Next city":"See results"}</button>`
        :`<p class="muted center">${pin?"Zoom in to adjust, or lock it in.":"Tap the map where you think the city is. Pinch or use + to zoom."}</p><button class="btn go wide" id="mtlock" ${pin?"":"disabled"}>Lock it in</button>`}</div>`;
    zoom.onTap=shown?null:((x,y)=>{ pin=[x,y]; const svg=stage.querySelector(".gmap"); let c0=svg.querySelector(".mtpin"); if(!c0){ c0=document.createElementNS("http://www.w3.org/2000/svg","circle"); c0.setAttribute("class","mtpin"); svg.appendChild(c0); } c0.setAttribute("r",pinR()); c0.setAttribute("cx",x); c0.setAttribute("cy",y); $('mtlock').disabled=false; });
    geoZoomInit(stage,zoom);
    if(shown) $('mtnext').onclick=()=>{ shown=null; pin=null; zoom={}; if(st.r.length>=MT_R) return done(); render(); };
    else $('mtlock').onclick=()=>{ if(!pin) return; const d=KM(mtInv(pin[0],pin[1]),q.ll), p=mtPts(d), c=mtFwd(q.ll);
      st.r.push({id:q.id,n:q.n,d:Math.round(d),p}); persist(); shown={q,d,p,x:pin[0],y:pin[1],c}; p>=700?good():p<150?bad():tone(520,.08,"sine",.05); if(p>=1000) setTimeout(confetti,100);
      // frame the tap and the city together
      const x0=Math.min(c[0],pin[0]), y0=Math.min(c[1],pin[1]), x1=Math.max(c[0],pin[0]), y1=Math.max(c[1],pin[1]); let w=Math.max(x1-x0,50)*1.8; const ar=world[3]/world[2]; let h=w*ar; if((y1-y0)*1.8>h){ h=(y1-y0)*1.8; w=h/ar; }
      zoom.v=[(x0+x1)/2-w/2,(y0+y1)/2-h/2,w,h]; render(); }; }
  function done(){ st.over=1; persist(); const tot=st.r.reduce((a,x)=>a+x.p,0); if(tot>=4000) setTimeout(confetti,200);
    finish(gid,tot,{sub:st.r.map(x=>`${x.n} ${x.p}`).join(" · "), share:mtShare(st,daily), html:mtCard(st), nextG:"maptapu", nextLabel:daily?"Play unlimited Map Tap":"Play again"}); }
  if(st.r.length>=MT_R) return done();
  render();
}
function mtCard(st){ return `<section class="card"><h3>Your taps</h3><div class="mtlist">${st.r.map(x=>`<div><b>${esc(x.n?`${x.n}, ${GEO.by[x.id].n}`:GEO.by[x.id].n)}</b><span>${x.d<=20?"Spot on":Math.round(x.d).toLocaleString()+" km"}</span><em>${x.p}</em></div>`).join("")}</div></section>`; }
function mtResults(){ const st=S.mt[today()], tot=st.r.reduce((a,x)=>a+x.p,0);
  show(`${bar("Map Tap")}
  <section class="card center" style="--c:var(--geo)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Map Tap #${mtNum()}</div>
    <div class="big">${tot.toLocaleString()}</div><p class="muted">out of 5,000</p><p class="cheer" style="color:var(--ink-2)">New cities tomorrow</p></section>
  ${mtCard(st)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="maptapu">Play unlimited Map Tap</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(mtShare(st,true)); }

/* ---------------- STATELE ---------------- */
/* Worldle for the 50 states: six guesses at an outline, with border-to-border distance, direction and closeness */
let US=null, US_P=null;
function usLoad(){ if(US) return Promise.resolve(US); if(US_P) return US_P;
  US_P=fetch("states.json?v=1").then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(d=>{ const by={}, ix={};
    d.c.forEach((c,i)=>{ by[c.id]=c; ix[c.id]=i; c.keys=[...new Set([c.n,...c.al].map(geoNorm))]; }); US={W:d.w,list:d.c,by,ix,md:d.md}; return US; }).catch(e=>{ US_P=null; throw e; });
  return US_P; }
function usGap(a,b){ let i=US.ix[a], j=US.ix[b]; if(i===j) return 0; if(i>j) [i,j]=[j,i]; const N=US.list.length; return US.md[i*N-i*(i+1)/2+(j-i-1)]; }
const sbProx=d=>Math.max(0,Math.floor(99*(1-Math.sqrt(Math.min(d,4500)/4500))));
function sbRow(t,gid){ const g=US.by[gid]; if(gid===t.id) return {id:gid,n:g.n,hit:1,d:0,a:"🎉",p:100};
  const d=usGap(gid,t.id), deg=BEARING(g.ll,t.ll); return {id:gid,n:g.n,d,deg,a:ARROWS[Math.round(deg/45)%8],p:sbProx(d)}; }
const sbNum=()=>dayIndex()+1;
const sbDaily=()=>dailyRot("statele",US.list.map(c=>c.id));
function sbStatus(){ S.sb=S.sb||{}; const d=S.sb[today()]; return d&&d.over?(d.won?`Today's done · ${d.g.length}/6`:"Today's done · X/6"):d&&d.g.length?`Today's #${sbNum()} · ${d.g.length}/6 guessed`:`Today's #${sbNum()} is ready`; }
function sbShare(t,rows,won,daily){ const best=Math.max(0,...rows.map(r=>r.p));
  return `#Statele ${daily?"#"+sbNum():"(unlimited)"} ${won?rows.length:"X"}/6 (${best}%)\n${rows.map(r=>r.hit?"🟩🟩🟩🟩🟩🎉":wlSquares(r.p)+r.a).join("\n")}`; }
function sbMapCard(t,rows){ const ids=rows.map(r=>r.id), box=[0,0,US.W,640];
  return `<section class="card"><h3>${esc(t.n)} on the map</h3><svg class="gmap" viewBox="${box.join(" ")}">${US.list.map(c=>geoPathEl(c,c.id===t.id?"g-hit":ids.includes(c.id)?"g-tried":"g-land")).join("")}</svg><p class="muted">${esc(t.c)} · ${Math.round(t.km2).toLocaleString()} km²${t.b.length?` · borders ${t.b.map(id=>US.by[id].n).join(", ")}`:" · no land borders with other states"}</p></section>`; }
async function startStatele(opt={}){
  const daily=!opt.unlimited, gid=daily?"statele":"stateleu";
  begin(gid,daily?`Statele #${sbNum()}`:"Unlimited Statele"); stage.className="gstage scroll"; geoLoading();
  try{ await usLoad(); }catch(e){ return geoFail(); }
  if(!GS||GS.game!==gid) return;
  S.sb=S.sb||{}; const key=today();
  if(daily&&S.sb[key]&&S.sb[key].over){ end(); return sbResults(); }
  const tid=daily?sbDaily():(()=>{ const p=US.list.map(c=>c.id).filter(x=>x!==S.sbLast); const x=p[Math.floor(Math.random()*p.length)]; S.sbLast=x; save(); return x; })();
  const t=US.by[tid], st=daily?(S.sb[key]=S.sb[key]&&S.sb[key].t===tid?S.sb[key]:{t:tid,g:[]}):{t:tid,g:[]};
  __b.sb=st; let over=false;
  function render(){ const rows=st.g.map(id=>sbRow(t,id));
    stage.innerHTML=`<div class="wl">
      <div class="wlshape ${over?(rows.some(r=>r.hit)?"won":"lost"):""}"><svg viewBox="0 0 400 400" aria-label="Mystery state outline"><path d="${t.sh}"/></svg>${over?`<div class="wlname">${esc(t.n)}</div>`:""}</div>
      <div class="wlrows">${[0,1,2,3,4,5].map(i=>{ const r=rows[i]; return r?wlRowHtml(r,true):`<div class="wlrow empty"><b></b><span></span><span></span><span></span></div>`; }).join("")}</div>
      <div id="sbin"></div></div>`;
    stage.querySelectorAll(".wldist").forEach(el=>el.onclick=()=>{ S.wlMi=!S.wlMi; save(); render(); });
    if(!over) geoInput($('sbin'),{placeholder:"Which state?",skip:()=>new Set(st.g),onPick:guess,list:US.list}); }
  function guess(c){ if(over) return false; if(st.g.includes(c.id)){ toast("Already guessed!"); return false; }
    st.g.push(c.id); if(daily) save();
    if(c.id===t.id){ good(); over=true; return finishUp(true); }
    bad(); if(st.g.length>=6){ over=true; return finishUp(false); } render(); }
  function finishUp(won){ render(); const rows=st.g.map(id=>sbRow(t,id));
    if(daily){ st.over=1; st.won=won?1:0; save(); }
    if(won) setTimeout(confetti,200); else toast(`It was ${t.n}`);
    later(()=>finish(gid,won?rows.length:7,{sub:won?`${t.n} in ${rows.length}`:`It was ${t.n}`, share:sbShare(t,rows,won,daily), html:sbMapCard(t,rows), nextG:"stateleu", nextLabel:daily?"Play unlimited Statele":"Play again"}),won?1300:1800); }
  if(st.g.includes(t.id)||st.g.length>=6){ over=true; finishUp(st.g.includes(t.id)); } else render();
}
function sbResults(){ const st=S.sb[today()], t=US.by[st.t], rows=st.g.map(id=>sbRow(t,id)), won=!!st.won;
  show(`${bar("Statele")}
  <section class="card center" style="--c:var(--geo)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Statele #${sbNum()}</div>
    <div class="big">${won?rows.length:"X"}/6</div><p class="muted">${won?`You found ${esc(t.n)}`:`It was ${esc(t.n)}`}</p><p class="cheer" style="color:var(--ink-2)">New state tomorrow</p></section>
  <section class="card"><div class="wlshape small ${won?"won":"lost"}"><svg viewBox="0 0 400 400"><path d="${t.sh}"/></svg></div><div class="wlrows">${rows.map(r=>wlRowHtml(r)).join("")}</div></section>
  ${sbMapCard(t,rows)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="stateleu">Play unlimited Statele</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(sbShare(t,rows,won,true)); }
