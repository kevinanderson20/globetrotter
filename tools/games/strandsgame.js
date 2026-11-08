/* ================= STRANDS: find the theme words on a 6×8 board ================= */
/*STRANDS_DATA*/
/* rules, as in the NYT game: every letter belongs to one theme word or the spangram; the spangram (yellow) touches two
   opposite sides; letters connect in any of 8 directions; any other real word of 4+ letters counts toward a hint
   (3 words = 1 hint); a hint circles one theme word's letters, and a second hint while one is showing spells out its order */
const ST_C=6, ST_R=8;
let ST_ROT=null;
const stDailyIx=()=>{ if(!ST_ROT) ST_ROT=shuf([...STRANDS.keys()],seeded("globetrotter-strands-v1")); const n=ST_ROT.length; return ST_ROT[((dayIndex()%n)+n)%n]; };
const stNum=()=>dayIndex()+1;
function stStatus(){ S.st=S.st||{}; const d=S.st[today()]; const P=STRANDS[stDailyIx()];
  return d&&d.done?`Today's done · ${d.h?`${d.h} hint${d.h>1?"s":""}`:"perfect"}`:d&&d.f&&d.f.length?`Today's #${stNum()} · ${d.f.length}/${P.w.length} found`:`Today's theme: "${P.c}"`; }
function stShare(P,st,daily){ const rows=[]; for(let i=0;i<st.o.length;i+=4) rows.push(st.o.slice(i,i+4).join(""));
  return `Strands ${daily?"#"+stNum():"(unlimited)"}\n“${P.c}”\n${rows.join("\n")}`; }
function startStrands(opt={}){
  const daily=!opt.unlimited, gid=daily?"strands":"strandsu";
  S.st=S.st||{}; const key=today();
  if(daily&&S.st[key]&&S.st[key].done) return stResults();
  const ix=daily?stDailyIx():(()=>{ const d=stDailyIx(); let k; do{ k=Math.floor(Math.random()*STRANDS.length); }while(k===d&&STRANDS.length>1); return k; })();
  const P=STRANDS[ix], words=P.w.map(([w,p])=>({w,p,sp:w===P.s})), extra=new Set(P.x?P.x.split(" "):[]);
  const st=daily?(S.st[key]=S.st[key]&&S.st[key].ix===ix?S.st[key]:{ix,f:[],o:[],hp:0,h:0,hw:-1,ho:0,nw:[]}):{ix,f:[],o:[],hp:0,h:0,hw:-1,ho:0,nw:[]};
  begin(gid,daily?`Strands #${stNum()}`:"Unlimited Strands"); stage.className="gstage scroll st-stage";
  __b.st={P,st};
  let sel=[], dragging=false, moved=false, msg="", msgCls="";
  const owner=new Array(48).fill(-1); words.forEach((w,i)=>w.p.forEach(c=>owner[c]=i));
  const persist=()=>{ if(daily) save(); };
  stage.innerHTML=`<div class="st">
    <div class="stclue"><span>Today's theme</span><b>${esc(P.c)}</b></div>
    <div class="stword" id="stw"></div>
    <div class="stboard" id="stb"><svg class="stlines" id="stl" viewBox="0 0 ${ST_C*100} ${ST_R*100}" preserveAspectRatio="none"></svg>
      ${P.g.split("").map((ch,i)=>`<div class="stc" data-i="${i}"><span>${ch}</span></div>`).join("")}</div>
    <div class="stfoot"><button class="sthint" id="sth"><i></i><span>Hint</span></button><div class="stprog" id="stp"></div></div></div>`;
  const board=$('stb'), cells=[...board.querySelectorAll(".stc")];
  const ctr=i=>[(i%ST_C)*100+50,Math.floor(i/ST_C)*100+50];
  const adj=(a,b)=>a!==b&&Math.abs(a%ST_C-b%ST_C)<=1&&Math.abs(Math.floor(a/ST_C)-Math.floor(b/ST_C))<=1;
  function lineFor(path,cls){ if(path.length<2) return ""; return `<polyline class="${cls}" points="${path.map(i=>ctr(i).join(",")).join(" ")}"/>`; }
  function render(){ const fset=new Set(st.f);
    cells.forEach((el,i)=>{ const o=owner[i], found=fset.has(o);
      el.className="stc"+(found?(words[o].sp?" span":" theme"):"")+(sel.includes(i)?" sel":"")+(!found&&st.hw===o?" hinted":"");
      const ord=!found&&st.hw===o&&st.ho?words[o].p.indexOf(i)+1:0; el.dataset.ord=ord||""; });
    $('stl').innerHTML=st.f.map(k=>lineFor(words[k].p,words[k].sp?"ln span":"ln theme")).join("")+lineFor(sel,"ln sel");
    const cur=sel.map(i=>P.g[i]).join("");
    $('stw').innerHTML=cur?`<b>${cur}</b>`:msg?`<span class="${msgCls}">${esc(msg)}</span>`:"";
    $('stp').innerHTML=`<b>${st.f.length}</b> of <b>${words.length}</b> theme words found.`;
    const hb=$('sth'), can=st.hp>=3; hb.classList.toggle("ready",can); hb.style.setProperty("--hp",Math.min(3,st.hp)/3*100+"%");
    hb.querySelector("span").textContent="Hint"; }
  function say(t,cls=""){ msg=t; msgCls=cls; render(); if(t) later(()=>{ if(msg===t){ msg=""; render(); } },1800); }
  function submit(){ const path=sel.slice(); sel=[]; if(path.length<1){ render(); return; }
    const word=path.map(i=>P.g[i]).join("");
    const k=words.findIndex(w=>w.p.length===path.length&&w.p.every((c,j)=>c===path[j]));
    if(k>=0){ if(st.f.includes(k)){ say("Already found","dim"); return; }
      st.f.push(k); st.o.push(words[k].sp?"🟡":"🔵"); if(st.hw===k){ st.hw=-1; st.ho=0; }
      good(); persist(); if(words[k].sp) say("SPANGRAM!","spang"); else say(nmCap(word.toLowerCase()),"themew");
      board.querySelectorAll(".stc").forEach(el=>{ if(words[k].p.includes(+el.dataset.i)){ el.classList.add("pop"); later(()=>el.classList.remove("pop"),450); } });
      if(st.f.length===words.length) return win(); return; }
    if(path.length<4){ say("Too short","dim"); bad(); return; }
    if(extra.has(word)||words.some(w=>w.w===word)){ if(st.nw.includes(word)){ say("Already found","dim"); return; }
      st.nw.push(word); st.hp++; persist(); tone(660,.08,"sine",.05); say(st.hp>=3&&st.hp%3===0?"Hint ready!":`${nmCap(word.toLowerCase())} · ${st.hp%3||3}/3 toward a hint`,"good"); return; }
    bad(); say("Not in word list","dim"); }
  function useHint(){ if(st.hp<3){ say(`Find ${3-st.hp} more word${3-st.hp>1?"s":""} of 4+ letters to earn a hint`,"dim"); return; }
    if(st.hw>=0&&!st.f.includes(st.hw)){ if(st.ho){ say("Find the circled word first","dim"); return; } st.ho=1; }
    else { const left=words.map((w,i)=>i).filter(i=>!st.f.includes(i)); st.hw=left.find(i=>!words[i].sp)??left[0]; st.ho=0; }
    st.hp-=3; st.h++; st.o.push("💡"); persist(); render(); }
  function win(){ st.done=1; persist(); render(); board.classList.add("won"); setTimeout(confetti,300);
    later(()=>finish(gid,st.h,{sub:`“${P.c}” · ${st.h?`${st.h} hint${st.h>1?"s":""}`:"no hints"}`, share:stShare(P,st,daily), html:stBoardCard(P,st), nextG:"strandsu", nextLabel:daily?"Play unlimited Strands":"Play again"}),1600); }
  // pointer input: drag through letters, or tap them one by one and tap the last letter again to submit
  const hit=(x,y,strict)=>{ const r=board.getBoundingClientRect(), cw=r.width/ST_C, ch=r.height/ST_R, c=Math.floor((x-r.left)/cw), rr=Math.floor((y-r.top)/ch);
    if(c<0||c>=ST_C||rr<0||rr>=ST_R) return -1; if(strict){ const dx=(x-r.left)-(c+.5)*cw, dy=(y-r.top)-(rr+.5)*ch; if(Math.hypot(dx,dy)>Math.min(cw,ch)*.42) return -1; } return rr*ST_C+c; };
  board.addEventListener("pointerdown",e=>{ const i=hit(e.clientX,e.clientY,false); if(i<0||st.done) return; e.preventDefault(); board.setPointerCapture(e.pointerId);
    dragging=true; moved=false; msg="";
    if(sel.length&&i===sel[sel.length-1]){ dragging="tapEnd"; return; }
    const at=sel.indexOf(i); if(at>=0){ sel=sel.slice(0,at+1); render(); return; }
    if(sel.length&&adj(sel[sel.length-1],i)) sel.push(i); else sel=[i]; render(); });
  board.addEventListener("pointermove",e=>{ if(!dragging) return; const i=hit(e.clientX,e.clientY,true); if(i<0) return;
    const last=sel[sel.length-1]; if(i===last) return;
    if(sel.length>1&&i===sel[sel.length-2]){ sel.pop(); moved=true; render(); return; }
    if(!sel.includes(i)&&adj(last,i)){ sel.push(i); moved=true; dragging=true; render(); } });
  const up=()=>{ if(!dragging) return; const d=dragging; dragging=false;
    if(d==="tapEnd"&&!moved){ submit(); return; } if(moved&&sel.length>1) submit(); };
  board.addEventListener("pointerup",up); board.addEventListener("pointercancel",()=>{ dragging=false; });
  $('sth').onclick=useHint;
  window._stKey=k=>{ if(k==="Enter"&&sel.length) submit(); if(k==="Escape"){ sel=[]; render(); } };
  render();
  if(st.f.length===words.length&&!st.done) win();
}
function stBoardCard(P,st){ const words=P.w.map(([w,p])=>({w,p,sp:w===P.s}));
  const ctr=i=>[(i%ST_C)*100+50,Math.floor(i/ST_C)*100+50], owner=new Array(48).fill(-1); words.forEach((w,i)=>w.p.forEach(c=>owner[c]=i));
  return `<section class="card"><h3>“${esc(P.c)}”</h3><div class="stboard mini won"><svg class="stlines" viewBox="0 0 ${ST_C*100} ${ST_R*100}" preserveAspectRatio="none">${words.map(w=>`<polyline class="ln ${w.sp?"span":"theme"}" points="${w.p.map(i=>ctr(i).join(",")).join(" ")}"/>`).join("")}</svg>${P.g.split("").map((ch,i)=>`<div class="stc ${words[owner[i]].sp?"span":"theme"}"><span>${ch}</span></div>`).join("")}</div>
    <p class="muted" style="margin-top:10px">Spangram: <b>${esc(nmCap(P.s.toLowerCase()))}</b> · ${words.filter(w=>!w.sp).map(w=>esc(nmCap(w.w.toLowerCase()))).join(", ")}</p></section>`; }
function stResults(){ const st=S.st[today()], P=STRANDS[st.ix];
  show(`${bar("Strands")}
  <section class="card center" style="--c:var(--wd)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's Strands #${stNum()}</div>
    <div class="big">${st.h?`${st.h} hint${st.h>1?"s":""}`:"Perfect"}</div><p class="muted">“${esc(P.c)}”</p><p class="cheer" style="color:var(--ink-2)">New theme tomorrow</p></section>
  ${stBoardCard(P,st)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="strandsu">Play unlimited Strands</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(stShare(P,st,true)); }
