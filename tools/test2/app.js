/* ================= 640 TEST 2 APP ================= */
const APP_VERSION="dev";
const LS="globetrotter.test2.v1";
const $=id=>document.getElementById(id);
const app=$('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shuf=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const TPL={1:{name:"Table",long:"Distribution from a table",c:"--t1"},2:{name:"Binomial",long:"Binomial",c:"--t2"},3:{name:"Normal",long:"Normal",c:"--t3"}};

/* ---------- saved progress ---------- */
let S={cards:{}, qc:{}, sess:0, obj:{}, tests:[], sound:true, pr:{}, drills:{}, days:[]};
try{ const raw=localStorage.getItem(LS); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
function save(){ try{ localStorage.setItem(LS,JSON.stringify(S)); }catch(e){} }
function rec(objs,ok){ (objs||[]).forEach(o=>{ const s=S.obj[o]||(S.obj[o]={r:0,w:0}); ok?s.r++:s.w++; }); }

/* ---------- sound: the same small bell and soft thud as the map editions ---------- */
let actx=null;
function snd(kind){ if(!S.sound) return;
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended") actx.resume();
    const t=actx.currentTime;
    if(kind==="ok"){ const out=actx.createGain(); out.gain.value=.55; out.connect(actx.destination);
      [[1,1,1.1],[2.0,.45,.7],[2.76,.32,.45],[5.4,.14,.25]].forEach(([r,a,d])=>{ const os=actx.createOscillator(), gg=actx.createGain();
        os.type="sine"; os.frequency.value=1046.5*r; os.connect(gg); gg.connect(out);
        gg.gain.setValueAtTime(.0001,t); gg.gain.exponentialRampToValueAtTime(.09*a,t+.004); gg.gain.exponentialRampToValueAtTime(.0001,t+d);
        os.start(t); os.stop(t+d+.05); }); return; }
    const o=actx.createOscillator(), g=actx.createGain(); o.connect(g); g.connect(actx.destination);
    o.type="triangle"; o.frequency.setValueAtTime(196,t); o.frequency.exponentialRampToValueAtTime(130,t+.15);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.11,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+.22); o.start(t); o.stop(t+.24);
  }catch(e){} }
/* positive reinforcement: bell + green flash on every right answer, a callout on streaks, confetti on perfect rounds */
let STK=0;
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
function buzz(ok,streak=true){ snd(ok?"ok":"no"); try{ navigator.vibrate&&navigator.vibrate(ok?12:[20,40,20]); }catch(e){}
  if(!ok){ if(streak) STK=0; return; }
  flash(); if(!streak) return; STK++;
  if(STK===3) toast("3 in a row!"); else if(STK===5) toast("5 in a row. You're on fire!"); else if(STK%10===0) toast(`${STK} in a row. Unstoppable!`); }
function flash(){ const f=$('flash'); f.classList.remove("on"); void f.offsetWidth; f.classList.add("on"); }
function toast(t){ const el=$('toast'); el.textContent=t; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
const praise=()=>pick(["Right!","Exactly.","Nailed it.","Yes!","Correct.","Spot on."]);
function confetti(){ if(reduceMotion) return; const box=$('confetti'); box.innerHTML="";
  const cols=["var(--good)","var(--sun)","var(--m-learn)","var(--t3)","var(--t2)","var(--t1)"];
  for(let i=0;i<70;i++){ const e=document.createElement("i"); e.style.left=Math.random()*100+"%"; e.style.background=cols[i%cols.length];
    e.style.setProperty("--dx",(Math.random()*160-80)+"px"); e.style.setProperty("--r",(Math.random()*720-360)+"deg");
    e.style.animationDelay=Math.random()*.35+"s"; e.style.animationDuration=1.4+Math.random()*1.1+"s"; box.appendChild(e); }
  setTimeout(()=>{ box.innerHTML=""; },3200); }
const dstr=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function studied(){ const t=dstr(new Date()); S.days=S.days||[]; if(S.days[S.days.length-1]!==t){ S.days.push(t); S.days=S.days.slice(-90); } }
function dayStreak(){ const set=new Set(S.days||[]); let d=new Date(), n=0; if(!set.has(dstr(d))) d=new Date(Date.now()-864e5);
  while(set.has(dstr(d))){ n++; d=new Date(d.getTime()-864e5); } return n; }

/* ---------- timer ---------- */
let tick=null, t0=0;
function startTimer(){ stopTimer(); t0=Date.now(); tick=setInterval(()=>{ const el=$('timer'); if(el) el.textContent=fmtT((Date.now()-t0)/1000); },1000); }
function stopTimer(){ if(tick) clearInterval(tick); tick=null; return Math.round((Date.now()-t0)/1000); }
const fmtT=s=>{ s=Math.round(s); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); };

/* ---------- icons ---------- */
const IC={
 x:'<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
 back:'<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M13.5 4.5 7 11l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 learn:'<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="13" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M8 3h9a3 3 0 0 1 3 3v12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M7.5 11h6M7.5 15h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
 prac:'<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#fff" stroke-width="2"/><path d="m8 12.3 2.7 2.7L16.3 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 test:'<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 9.5v4l2.5 2M9.5 3h5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
 logo:'<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><path d="M6 27c5 0 6-15 12-15s7 15 12 15" fill="none" stroke="var(--m-learn)" stroke-width="3" stroke-linecap="round"/><path d="M6 28.5h24" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><circle cx="27" cy="9" r="3.5" fill="var(--sun)" stroke="var(--ink)" stroke-width="2"/></svg>'
};
function bar(title,opts={}){ return `<div class="bar"><button class="x" data-act="${opts.back||"home"}" aria-label="Back">${opts.close?IC.x:IC.back}</button>${opts.prog!=null?`<div class="steps"><i style="width:${opts.prog*100}%"></i></div>`:`<div class="ttl">${esc(title)}</div>`}${opts.z?'<button class="zbtn" data-act="ztable">z table</button>':""}${opts.timer?'<span class="timer" id="timer">0:00</span>':""}</div>`; }
function show(html){ app.innerHTML=html; window.scrollTo(0,0); }

/* ---------- derived stats ---------- */
const ALLCARDS=DECKS.flatMap(d=>d.cards.map((c,i)=>({...c, deck:d.id, dt:d.title, key:d.id+":"+i})));
function cardStats(d){ const cs=d?ALLCARDS.filter(c=>c.deck===d):ALLCARDS; return {n:cs.length, got:cs.filter(c=>S.cards[c.key]===1).length, learning:cs.filter(c=>S.cards[c.key]===0).length}; }
function accuracy(){ let r=0,w=0; Object.values(S.obj).forEach(o=>{ r+=o.r; w+=o.w; }); return r+w?r/(r+w):null; }
function weakObjs(){ return Object.entries(S.obj).filter(([k,o])=>o.r+o.w>=3).map(([k,o])=>({k, a:o.r/(o.r+o.w), n:o.r+o.w})).filter(o=>o.a<.85).sort((a,b)=>a.a-b.a).slice(0,3); }
const bestExam=()=>{ const e=S.tests.filter(t=>t.k==="exam"); return e.length?Math.max(...e.map(t=>Math.round(t.s/t.m*100))):null; };

/* ================= HOME ================= */
function home(){
  stopTimer();
  const cs=cardStats(), acc=accuracy(), be=bestExam(), weak=weakObjs();
  show(`
  <div class="brand">${IC.logo}<h1>640 Test 2</h1>
    <nav class="tabs" aria-label="Edition"><a href="../">World</a><a href="../usa/">USA</a><a href="../earth/">Earth</a><a href="./" aria-current="page">640 Test 2</a></nav></div>
  <section class="hero">
    <div><div class="eyebrow">BUAN 640 · Applied Statistics${dayStreak()?` · <span class="streak">${dayStreak()}-day streak</span>`:""}</div><h2>One written problem, one of three types</h2></div>
    <p>Closed book, calculator only. You get the formula sheet and the normal table. Graded on your reasoning and wording, not just the number.</p>
    <div class="tpls">${[1,2,3].map(t=>`<button class="tpl" style="--c:var(${TPL[t].c})" data-act="exam" data-t="${t}"><b>${TPL[t].name}</b><span>${["Table → P, E[X], SD","n trials → B(n, p)","z-scores & cutoffs"][t-1]}</span></button>`).join("")}</div>
    <div class="stats3">
      <div class="stat"><b>${cs.got}<small style="font-size:13px;color:var(--ink-3)">/${cs.n}</small></b><span>concepts known</span></div>
      <div class="stat"><b>${acc==null?"–":Math.round(acc*100)+"%"}</b><span>practice accuracy</span></div>
      <div class="stat"><b>${be==null?"–":be+"%"}</b><span>best exam score</span></div>
    </div>
  </section>
  <button class="mode" style="--cc:var(--m-learn)" data-act="learn"><span class="ic">${IC.learn}</span><span><b>Learn key concepts</b><span>Flip cards for every idea on the test</span></span><i>${Math.round(cs.got/cs.n*100)}%</i></button>
  <button class="mode" style="--cc:var(--m-prac)" data-act="practice"><span class="ic">${IC.prac}</span><span><b>Practice questions</b><span>Instant feedback, step by step</span></span><i>${Object.keys(S.qc).length}/${QC.length}</i></button>
  <button class="mode" style="--cc:var(--m-test)" data-act="testmenu"><span class="ic">${IC.test}</span><span><b>Test mode</b><span>Timed, graded at the end</span></span><i>${S.tests.length} run${S.tests.length===1?"":"s"}</i></button>
  <section class="card"><h3>Your weak spots</h3>${weak.length?`<div class="weak">${weak.map(w=>wrow(w.k,w.a)).join("")}</div><button class="btn go wide" data-act="weakqc">Practice these</button>`:`<p class="muted">${Object.keys(S.obj).length?"Nothing below 85% right now. Nice work.":"Answer a few practice questions and the topics you miss most show up here."}</p>`}</section>
  <div class="duo">
    <button class="tile" data-act="ztable"><b>z table</b><span>The same table you get on the test</span></button>
    <button class="tile" data-act="deck" data-d="grading"><b>Full-credit checklist</b><span>What the grader looks for</span></button>
    <button class="tile" data-act="drills"><b>Speed drills</b><span>Fast one-step reps, beat your time</span></button>
    <button class="tile" data-act="cram"><b>Cram sheet</b><span>Everything to memorize on one page</span></button>
  </div>
  <div class="foot">
    <div>Progress saves on this device</div>
    <div class="row" style="justify-content:center"><button class="btn ghost small" data-act="sound">Sounds ${S.sound?"on":"off"}</button><button class="btn ghost small" data-act="reset">Start over</button></div>
    <div>Version ${esc(APP_VERSION)}</div>
  </div>`);
}
function wrow(k,a){ const c=a>=.85?"var(--good)":a>=.6?"var(--sun)":"var(--bad)"; return `<div class="wrow"><span><b>${k}</b> ${esc(OBJ[k]||"")}</span><em>${Math.round(a*100)}%</em><div class="bar2"><i style="width:${Math.max(4,a*100)}%;--c:${c}"></i></div></div>`; }

/* ================= LEARN ================= */
function learn(){
  const cs=cardStats();
  show(`${bar("Learn key concepts")}
  <p class="muted">Tap a card to flip it. Mark it <b>Got it</b> or <b>Still learning</b>; swipe for the next one.</p>
  <div class="row"><button class="btn go" style="flex:1" data-act="review" ${cs.learning?"":"disabled"}>Review still learning (${cs.learning})</button><button class="btn ghost" data-act="allcards">Shuffle all</button></div>
  ${DECKS.map(d=>{ const s=cardStats(d.id); return `<button class="deck" data-act="deck" data-d="${d.id}" data-done="${s.got===s.n?1:0}"><b>${esc(d.title)}</b><em>${s.got}/${s.n}</em><span>${esc(d.sub)}</span><div class="bar2"><i style="width:${s.got/s.n*100}%"></i></div></button>`; }).join("")}`);
}
let CV=null; // card viewer state
function cards(list,title,back="learn"){ CV={list:list.map(c=>({...c, s:(SIMPLE[c.deck]||[])[+c.key.split(":")[1]]})), i:0, side:"f", title, back, got:0, learning:0, simp:false}; renderCards(); }
function renderCards(){
  const c=CV.list[CV.i];
  show(`${bar(CV.title,{back:CV.back, prog:CV.i/CV.list.length})}
  <div class="pn"><button data-act="cprev" ${CV.i?"":"disabled"}>‹ Prev</button><span>${CV.i+1} of ${CV.list.length} · ${esc(c.dt)}</span><button data-act="cnext">Skip ›</button></div>
  <div class="flip" id="flip" data-act="flip" data-side="${CV.side}" data-k="${S.cards[c.key]??""}" role="button" aria-label="Flip card">${cardFace(c)}</div>
  ${CV.simp&&c.s?`<section class="simple" id="simple"><div class="eyebrow">In plain English</div><div class="cb">${c.s}</div></section>`:""}
  <div class="cnav"><button class="btn learn" data-act="mark" data-v="0">Still learning</button><button class="btn got" data-act="mark" data-v="1">Got it</button></div>`);
  const el=$('flip'); let sx=null, sy=0;
  el.addEventListener("touchstart",e=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  el.addEventListener("touchend",e=>{ if(sx==null) return; const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; sx=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){ e.preventDefault(); dx<0?cardStep(1):cardStep(-1); } });
}
const BULB='<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5a5.5 5.5 0 0 0-3.2 10c.5.4.7.9.7 1.5v.5h5v-.5c0-.6.2-1.1.7-1.5A5.5 5.5 0 0 0 10 2.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 17.5h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
function simpBtn(c){ return c.s?`<button class="simp" data-act="simp" aria-label="Explain it simply" aria-pressed="${CV.simp}">${BULB}<span>${CV.simp?"Hide":"Simpler"}</span></button>`:""; }
function cardFace(c){ return simpBtn(c)+(CV.side==="f"?`<div class="eyebrow">${esc(c.dt)}</div><div class="ft">${esc(c.f)}</div><div class="hint">Tap to flip</div>`
  :`<div class="ft">${esc(c.f)}</div><div class="cb">${c.b}</div><div class="hint">Tap to flip back</div>`); }
function flip(){ const el=$('flip'); if(!el) return; el.classList.add("turn");
  setTimeout(()=>{ CV.side=CV.side==="f"?"b":"f"; el.dataset.side=CV.side; el.innerHTML=cardFace(CV.list[CV.i]); el.classList.remove("turn"); },160); }
function cardStep(d){ const n=CV.i+d; if(n<0) return; if(n>=CV.list.length) return cardsDone(); CV.i=n; CV.side="f"; CV.simp=false; renderCards(); }
function mark(v){ const c=CV.list[CV.i]; S.cards[c.key]=v; v?CV.got++:CV.learning++; studied(); save(); if(v) buzz(true,false); cardStep(1); }
function cardsDone(){
  const cs=cardStats(); if(CV.got===CV.list.length) setTimeout(confetti,100);
  show(`${bar(CV.title,{back:CV.back})}
  <section class="card center"><div class="big">${CV.got}</div><p class="muted">marked <b>Got it</b> this round, ${CV.learning} still learning.</p>
  <p class="muted">${cs.got} of ${cs.n} concepts known overall.</p>${CV.got&&!CV.learning?`<p class="cheer">Every card in this round. Great work!</p>`:""}</section>
  ${cs.learning?`<button class="btn go wide" data-act="review">Review still learning (${cs.learning})</button>`:""}
  <button class="btn wide" data-act="practice">Try practice questions</button>
  <button class="btn ghost wide" data-act="learn">Back to decks</button>`);
}

/* ================= PRACTICE ================= */
let PT=1;
function practice(){
  const due=QC.filter((q,i)=>S.qc[i]&&S.qc[i].n<=S.sess).length, unseen=QC.length-Object.keys(S.qc).length;
  const objs=Object.keys(OBJ).filter(k=>S.obj[k]);
  show(`${bar("Practice questions")}
  <section class="card"><h3>Quick checks</h3><p class="muted">One idea per question: notation, event wording, which model fits, definitions. Missed ones come back sooner.</p>
    <p class="muted">${unseen} new · ${due} due for review</p>
    <button class="btn go wide" data-act="qc">Start 10 questions</button></section>
  <section class="card"><h3>Step-by-step problems</h3><p class="muted">A fresh test-style problem in a new context, broken into small steps with feedback on each. The model answer after every part shows exactly what to write.</p>
    <div class="seg" role="group" aria-label="Problem type">${[1,2,3,0].map(t=>`<button data-act="ptype" data-t="${t}" aria-pressed="${PT===t}">${t?TPL[t].name:"Mixed"}<span>${t?["Template 1","Template 2","Template 3"][t-1]:"Any"}</span></button>`).join("")}</div>
    <button class="btn wide" data-act="prob">Start a problem</button></section>
  ${drillCard()}
  ${objs.length?`<section class="card"><h3>Accuracy by topic</h3><div class="weak">${objs.map(k=>{ const o=S.obj[k]; return wrow(k,o.r/(o.r+o.w)); }).join("")}</div></section>`:""}`);
}
function drillCard(){ return `<section class="card" id="drillcard"><h3>Speed drills</h3><p class="muted">10 fast one-step questions. Right answers move on by themselves; get all 10 to set a best time.</p>
  <div class="dgrid">${Object.entries(DRILLS).map(([k,d])=>{ const st=S.drills[k]; return `<button class="tile" data-act="drill" data-k="${k}"><b>${esc(d.title)}</b><span>${esc(d.sub)}</span><span class="best">${st&&st.best!=null?`Best ${fmtT(st.best)}`:"No best yet"}</span></button>`; }).join("")}</div></section>`; }
function pickQC(n,objs){
  S.sess++; save();
  let pool=QC.map((q,i)=>i); if(objs&&objs.length){ const f=pool.filter(i=>QC[i].o.some(o=>objs.includes(o))); if(f.length>=4) pool=f; }
  const st=i=>S.qc[i];
  const due=shuf(pool.filter(i=>st(i)&&st(i).n<=S.sess)).sort((a,b)=>st(a).b-st(b).b);
  const unseen=shuf(pool.filter(i=>!st(i)));
  const rest=shuf(pool.filter(i=>st(i)&&st(i).n>S.sess)).sort((a,b)=>st(a).n-st(b).n);
  return [...due,...unseen,...rest].slice(0,n);
}
function srs(i,ok){ const s=S.qc[i]||{b:0,n:0}; s.b=ok?Math.min(s.b+1,4):0; s.n=S.sess+(ok?[1,2,4,8,16][s.b]:1); S.qc[i]=s; }

/* question runner. mode "prac": instant feedback · "test": held to the end · "drill": instant, auto-advance when right, timed.
   Options are shuffled every time, so you learn the idea, not the position. */
let QR=null;
const qcItem=i=>({...mcShuffle(QC[i]), idx:i});
function runQC(list,mode,title,drill){ QR={items:list.map(x=>typeof x==="number"?qcItem(x):mcShuffle(x)), i:0, mode, title, drill, ans:[], right:0};
  if(mode!=="prac") startTimer(); renderQ(); }
const qBack=()=>QR.mode==="test"?"testmenu":"practice";
function renderQ(){
  const q=QR.items[QR.i], n=QR.items.length;
  show(`${bar(QR.title,{back:qBack(), close:true, prog:QR.i/n, timer:QR.mode!=="prac"})}
  <div class="eyebrow">${QR.drill?esc(DRILLS[QR.drill].title)+" · ":""}Question ${QR.i+1} of ${n}${STK>=2&&QR.mode!=="test"?` <span class="streak">${STK} in a row</span>`:""}</div>
  <div class="qtext">${esc(q.q)}</div>
  <div class="opts">${q.c.map((c,k)=>`<button class="opt" data-act="qopt" data-o="${k}">${esc(c)}</button>`).join("")}</div>
  <div id="qfb"></div>`);
  if(QR.mode!=="prac"&&t0){ const el=$('timer'); if(el) el.textContent=fmtT((Date.now()-t0)/1000); }
}
function qPick(k){
  if(QR.done) return; const q=QR.items[QR.i], ok=k===q.a; QR.done=true;
  QR.ans.push({q,k,ok}); if(ok) QR.right++; rec(q.o,ok); studied();
  const btns=[...app.querySelectorAll(".opt")];
  if(QR.mode==="test"){ btns[k].dataset.s="pick"; save(); setTimeout(()=>{ QR.done=false; qNext(); },260); return; }
  if(q.idx!=null) srs(q.idx,ok); save(); buzz(ok);
  btns.forEach((b,j)=>{ b.disabled=true; b.dataset.s=j===q.a?"right":j===k?"wrong":"fade"; });
  if(QR.mode==="drill"&&ok){ setTimeout(()=>{ if(QR&&QR.done&&QR.items[QR.i]===q) qNext(); },550); return; }
  $('qfb').innerHTML=`<div class="fb" data-k="${ok?"ok":"no"}"><b>${ok?praise():"Not quite."}</b>${esc(q.e)}<div>${(q.o||[]).map(o=>`<span class="tag">${o} ${esc(OBJ[o])}</span>`).join("")}</div></div>
  <div style="height:10px"></div><button class="btn wide" data-act="qnext">${QR.i+1<QR.items.length?"Continue":"See results"}</button>`;
  $('qfb').scrollIntoView({behavior:"smooth",block:"nearest"});
}
function qNext(){ QR.done=false; QR.i++; if(QR.i<QR.items.length) return renderQ(); qResults(); }
function qResults(){
  const secs=QR.mode!=="prac"?stopTimer():0, n=QR.items.length, pct=QR.right/n;
  let note="";
  if(QR.mode==="test"){ S.tests.push({d:Date.now(), k:"quiz", s:QR.right, m:n, t:secs}); }
  if(QR.mode==="drill"){ const d=S.drills[QR.drill]||(S.drills[QR.drill]={best:null,runs:0}); d.runs++;
    if(QR.right===n&&(d.best==null||secs<d.best)){ note=d.best==null?"First perfect run. That's your time to beat.":`New best time! Old best was ${fmtT(d.best)}.`; d.best=secs; }
    else if(d.best!=null) note=QR.right===n?`Best time: ${fmtT(d.best)}`:`Get all ${n} right to set a best time (best: ${fmtT(d.best)}).`;
    else note=`Get all ${n} right to set a best time.`; }
  save();
  const by={}; QR.ans.forEach(a=>(a.q.o||[]).forEach(o=>{ const b=by[o]||(by[o]={r:0,n:0}); b.n++; if(a.ok) b.r++; }));
  const missed=QR.ans.filter(a=>!a.ok);
  const again=QR.mode==="test"?`data-act="quiz">Take another quiz`:QR.mode==="drill"?`data-act="drill" data-k="${QR.drill}">Go again`:`data-act="qc">10 more questions`;
  show(`${bar(QR.title,{back:qBack()})}
  <section class="card center"><div class="big">${QR.right}/${n}</div><p class="muted">${QR.mode!=="prac"?`in ${fmtT(secs)} · `:""}${Math.round(pct*100)}% right</p>${pct===1?`<p class="cheer">${pick(["Perfect round!","Flawless.","Every single one. Great work!"])}</p>`:pct>=.8?`<p class="cheer">Strong round. Keep it up!</p>`:""}${note?`<p class="muted">${esc(note)}</p>`:""}</section>
  ${QR.mode==="test"?`<section class="card"><h3>By topic</h3><div class="weak">${Object.entries(by).sort((a,b)=>a[1].r/a[1].n-b[1].r/b[1].n).map(([o,b])=>wrow(o,b.r/b.n)).join("")}</div></section>`:""}
  ${missed.length?`<section class="card"><h3>Review what you missed</h3>${missed.map(a=>`<div class="fb" data-k="no"><b>${esc(a.q.q)}</b>You chose: ${esc(a.q.c[a.k])}<br><b style="display:inline;font-size:15px">Answer:</b> ${esc(a.q.c[a.q.a])}<br><span class="muted">${esc(a.q.e)}</span></div>`).join("")}</section>`:""}
  <button class="btn go wide" ${again}</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  if(pct===1) confetti();
}

/* ================= CRAM SHEET: everything to memorize, on one scroll ================= */
function cram(){
  const deck=id=>DECKS.find(d=>d.id===id).cards;
  const lookups=deck("normal").find(c=>c.f.startsWith("Common table"));
  show(`${bar("Cram sheet")}
  <p class="muted">The night-before page: what's not on the formula sheet, the lookups worth memorizing, and what the grader wants.</p>
  <section class="card"><h3>Memorize (not on the sheet)</h3><div class="cb">${deck("formulas").slice(1).map(c=>`<p style="margin:0 0 8px"><b>${esc(c.f.replace("Memorize: ",""))}:</b> ${c.b}</p>`).join("")}</div></section>
  <section class="card"><h3>Table lookups</h3><div class="cb">${lookups.b}</div></section>
  <section class="card"><h3>Word → X</h3><div class="cb">"at least k" → X ≥ k (k included)<br>"at most k" → X ≤ k (k included)<br>"more than k" → X > k (k left out)<br>"fewer than k" → X &lt; k (k left out)<br>"exactly one failure out of n" → X = n − 1<br>"at least one" → 1 − P(X = 0)<br>"top k%" → (100 − k)th percentile</div></section>
  <section class="card"><h3>Interpret E[X] (full credit)</h3><div class="cb">Average + what it's averaged over + context and units.<ex>"An average rating of a car in this set is 3.93 stars."<br>"If this experiment were repeated infinitely many times, on average the expert would correctly identify 4.4 matches out of 5."</ex></div></section>
  <section class="card"><h3>Binomial justification (full credit)</h3><div class="cb"><ex>"Let X = number of correct matches out of 5. Since this random variable can be represented as a number of successes in n identical independent trials, X ~ B(5, 0.88)."</ex></div></section>
  <section class="card"><h3>Every answer shows</h3><div class="cb">${deck("grading").map(c=>`• ${esc(c.f.replace(/^\d+\.\s*/,""))}`).join("<br>")}</div></section>
  <section class="card"><h3>Traps</h3><div class="cb">${deck("errors").map(c=>`• ${esc(c.f.replace("Trap: ",""))}`).join("<br>")}</div></section>`);
}

/* ================= PROBLEMS (practice: step by step; exam: all at once) ================= */
let PR=null;
function newProblem(t,mode){
  const tpl=t||1+Math.floor(Math.random()*3);
  PR={p:GEN[tpl](), mode, t, pi:0, si:0, res:{}, val:{}, right:0, total:0};
  if(mode==="exam"){ startTimer(); renderExam(); } else renderProb();
}
const sid=(pi,si)=>pi+"-"+si;
function setupHTML(open){ const p=PR.p; return `<details class="setup" style="--tc:var(${TPL[p.tpl].c})" ${open?"open":""}><summary>${esc(TPL[p.tpl].long)} · ${esc(p.title)}</summary><div class="tblwrap">${p.setup}</div></details>`; }
function fmtAns(s){ const v=x=>s.pct?`${(Math.round(x*1e4)/1e4).toFixed(4)} (${+(x*100).toFixed(2)}%)`:String(Math.round(x*1e4)/1e4).replace("-","−"); return v(s.ans)+(s.alt!=null?` or ${v(s.alt)}`:""); }
function parseNum(str,pct){ let s=String(str??"").trim().replace(/[−–]/g,"-").replace(/,/g,"").replace(/\s/g,""); let per=false;
  if(s.endsWith("%")){ per=true; s=s.slice(0,-1); } if(!s) return null; let v;
  if(/^-?\d*\.?\d+\/\d*\.?\d+$/.test(s)){ const [a,b]=s.split("/"); v=+a/+b; } else v=Number(s);
  if(!isFinite(v)) return null; if(pct&&(per||v>1)) v/=100; return v; }
const okNum=(s,v)=>v!=null&&(Math.abs(v-s.ans)<=s.tol+1e-9||(s.alt!=null&&Math.abs(v-s.alt)<=s.tol+1e-9));

function stepHTML(s,pi,si,mode){
  const id=sid(pi,si), r=PR.res[id], v=PR.val[id];
  let h=`<div class="step" id="st${id}"><div class="sq">${esc(s.q)}</div>`;
  if(s.k==="mc"){
    h+=`<div class="opts">${s.c.map((c,k)=>{ let st=""; if(r){ st=k===s.a?"right":k===r.k?"wrong":"fade"; } else if(mode==="exam"&&v===k) st="pick";
      const why=r&&s.ce&&(k===r.k||k===s.a)?`<small>${esc(s.ce[k])}</small>`:"";
      return `<button class="opt" data-act="sopt" data-id="${id}" data-o="${k}" ${r?"disabled":""} ${st?`data-s="${st}"`:""}>${esc(c)}${why}</button>`; }).join("")}</div>`;
    if(r&&!s.ce) h+=`<div class="fb" data-k="${r.ok?"ok":"no"}"><b>${r.ok?"Right.":"Not quite."}</b>${esc(s.e)}</div>`;
    else if(r&&!r.ok) h+=`<div class="fb" data-k="no">${esc(s.e)}</div>`;
  } else if(s.k==="num"){
    h+=`<div class="num"><input inputmode="decimal" autocomplete="off" enterkeyhint="done" data-id="${id}" value="${v!=null?esc(v):""}" ${r?`disabled data-s="${r.ok?"right":"wrong"}"`:""} placeholder="${s.pct?"e.g. 0.0918":"Your answer"}" aria-label="${esc(s.q)}">${mode==="prac"&&!r?`<button class="btn small" data-act="schk" data-id="${id}">Check</button>`:""}</div>`;
    if(r) h+=`<div class="fb" data-k="${r.ok?"ok":"no"}"><b>${r.ok?"Right.":"Not quite."}</b>${r.ok?`Answer: ${fmtAns(s)}`:`The answer is ${fmtAns(s)}.`}</div>`;
  } else {
    h+=`<div class="mf">${s.fields.map((f,k)=>{ const fv=v?v[k]:""; const fr=r?r.each[k]:null; return `<label>${esc(f.l)}<input inputmode="decimal" autocomplete="off" data-id="${id}" data-f="${k}" value="${fv!=null?esc(fv):""}" ${r?`disabled data-s="${fr?"right":"wrong"}"`:""}></label>`; }).join("")}</div>`;
    if(mode==="prac"&&!r) h+=`<button class="btn small" data-act="schk" data-id="${id}">Check</button>`;
    if(r) h+=`<div class="fb" data-k="${r.ok?"ok":"no"}"><b>${r.ok?"Right.":"Not quite."}</b>${s.fields.map(f=>`${esc(f.l)} = ${+f.ans.toFixed(4)}`).join(" · ")}</div>`;
  }
  return h+"</div>";
}
function gradeStep(s,id){
  const v=PR.val[id];
  if(s.k==="mc") return {ok:v===s.a, k:v};
  if(s.k==="num") return {ok:okNum(s,parseNum(v,s.pct))};
  const each=s.fields.map((f,k)=>{ const x=parseNum(v?v[k]:null,false); return x!=null&&Math.abs(x-f.ans)<=s.tol; });
  return {ok:each.every(Boolean), each};
}
function renderProb(){
  const p=PR.p, part=p.parts[PR.pi];
  const nSteps=p.parts.reduce((a,x)=>a+x.steps.length,0), doneSteps=Object.keys(PR.res).length;
  let h=`${bar("",{back:"practice", close:true, prog:doneSteps/nSteps, z:p.tpl===3})}${setupHTML(PR.pi===0)}`;
  p.parts.slice(0,PR.pi).forEach(pt=>{ h+=`<details class="part"><summary><b>(${pt.label})</b> ${esc(pt.q)}</summary><div class="model"><b>What to write</b>${pt.model}</div></details>`; });
  h+=`<section class="part"><h3><span class="pl">${part.label}</span>${esc(part.q)}</h3>`;
  for(let si=0;si<=Math.min(PR.si,part.steps.length-1);si++) h+=stepHTML(part.steps[si],PR.pi,si,"prac");
  if(PR.si>=part.steps.length){
    h+=`<div class="model"><b>What to write on the test</b>${part.model}</div>`;
    h+=PR.pi+1<p.parts.length?`<button class="btn go wide" data-act="pnext">Next: part (${p.parts[PR.pi+1].label})</button>`:`<button class="btn go wide" data-act="pdone">Finish</button>`;
  }
  h+=`</section>`;
  show(h);
  const target=document.getElementById("st"+sid(PR.pi,Math.min(PR.si,part.steps.length-1)));
  if(PR.pi||PR.si) (PR.si>=part.steps.length?app.querySelector(".model:last-of-type"):target)?.scrollIntoView({block:"center"});
  const inp=app.querySelector(`#st${sid(PR.pi,PR.si)} input:not([disabled])`); if(inp&&PR.si) setTimeout(()=>inp.focus({preventScroll:true}),50);
}
function answerStep(id){
  const [pi,si]=id.split("-").map(Number), s=PR.p.parts[pi].steps[si];
  if(PR.mode==="exam") return;
  if(s.k!=="mc"){ const box=app.querySelectorAll(`input[data-id="${id}"]`);
    if(s.k==="num") PR.val[id]=box[0].value; else PR.val[id]=[...box].map(b=>b.value);
    if(s.k==="num"&&parseNum(PR.val[id],s.pct)==null){ box[0].focus(); box[0].dataset.s="wrong"; return; } }
  const r=gradeStep(s,id); PR.res[id]=r; PR.total++; if(r.ok) PR.right++; rec(s.o,r.ok); studied();
  const st=S.pr[PR.p.tpl]||(S.pr[PR.p.tpl]={r:0,w:0}); r.ok?st.r++:st.w++; save(); buzz(r.ok);
  PR.si++; renderProb();
}
function probDone(){
  const p=PR.p; if(PR.right===PR.total) setTimeout(confetti,100);
  show(`${bar("Problem done",{back:"practice"})}
  <section class="card center"><div class="big">${PR.right}/${PR.total}</div><p class="muted">steps right on this ${esc(TPL[p.tpl].long.toLowerCase())} problem</p>${PR.right===PR.total?`<p class="cheer">Perfect problem!</p>`:PR.right/PR.total>=.8?`<p class="cheer">Solid work. Check the model answers for anything you missed.</p>`:""}</section>
  ${checklist(p.tpl)}
  <button class="btn go wide" data-act="prob">Another ${PR.t?esc(TPL[PR.t].name.toLowerCase()):"mixed"} problem</button>
  <button class="btn ghost wide" data-act="practice">Back to practice</button>`);
}
const CHECK={
  1:["Said discrete with a reason (a finite number of values that can be listed)","Showed each probability as count ÷ total","Translated the event into values of X before adding","Wrote E[X] = Σ x·P(x) with the numbers","Interpreted E[X]: average + over what + units","Showed the deviation table, Var(X), then SD = √Var with units"],
  2:["Defined X in words (what it counts, out of n)","Justified the binomial: successes in n identical independent trials, X ~ B(n, p)","Turned each phrase into values of X (watch \"exactly one failure\")","Wrote C(n, x)·pˣ·(1 − p)ⁿ⁻ˣ with numbers for each term","Added values because they are mutually exclusive","Interpreted E[X] = np as an average over many repetitions"],
  3:["Named the percentile for the cutoff (top 10% → 90th)","Quoted the closest table probability and its z","Converted back with x = μ + zσ and rounded in context","Showed z = (x − μ)/σ with numbers, two decimals","Used the complement, difference or symmetry, and showed it","Finished each part with a sentence in context"]
};
function checklist(t){ return `<section class="card"><h3>Wording check</h3><p class="muted">On paper the grader looks for these. Tick the ones your written answer had.</p><div class="check">${CHECK[t].map((c,i)=>`<label><input type="checkbox">${esc(c)}</label>`).join("")}</div></section>`; }

/* exam: every part at once, no feedback until Submit */
function renderExam(){
  const p=PR.p;
  let h=`${bar("",{back:"testmenu", close:true, timer:true, z:p.tpl===3})}
  <p class="muted">Work it on paper the way you would on the test, then enter your numbers and choices here. Nothing is graded until you submit.</p>${setupHTML(true)}`;
  p.parts.forEach((pt,pi)=>{ h+=`<section class="part"><h3><span class="pl">${pt.label}</span>${esc(pt.q)}</h3>${pt.steps.map((s,si)=>stepHTML(s,pi,si,"exam")).join("")}</section>`; });
  h+=`<button class="btn go wide" data-act="esubmit">Submit and grade</button>`;
  show(h); const el=$('timer'); if(el) el.textContent=fmtT((Date.now()-t0)/1000);
}
function examSubmit(){
  const p=PR.p, secs=stopTimer(); let right=0,total=0;
  p.parts.forEach((pt,pi)=>pt.steps.forEach((s,si)=>{ const id=sid(pi,si); const r=gradeStep(s,id); PR.res[id]=r; total++; if(r.ok) right++; rec(s.o,r.ok); }));
  S.tests.push({d:Date.now(), k:"exam", tpl:p.tpl, title:p.title, s:right, m:total, t:secs}); studied(); save(); if(right===total) setTimeout(confetti,100);
  const pct=Math.round(right/total*100);
  let h=`${bar("Exam results",{back:"testmenu"})}
  <section class="card center"><div class="eyebrow">${esc(TPL[p.tpl].long)} · ${esc(p.title)}</div><div class="big">${pct}%</div><p class="muted">${right} of ${total} steps right · ${fmtT(secs)}</p>${pct===100?`<p class="cheer">Perfect exam!</p>`:pct>=80?`<p class="cheer">Strong result. Review the misses below.</p>`:""}</section>`;
  p.parts.forEach((pt,pi)=>{
    h+=`<section class="part"><h3><span class="pl">${pt.label}</span>${esc(pt.q)}</h3><div class="res">${pt.steps.map((s,si)=>{ const id=sid(pi,si), r=PR.res[id], v=PR.val[id];
      const yours=s.k==="mc"?(v!=null?s.c[v]:"no answer"):s.k==="num"?(v?v:"no answer"):(v?v.join(", "):"no answer");
      const right=s.k==="mc"?s.c[s.a]:s.k==="num"?fmtAns(s):s.fields.map(f=>+f.ans.toFixed(4)).join(", ");
      return `<div class="rline"><span class="${r.ok?"ok":"no"}">${r.ok?"✓":"✗"}</span><div>${esc(s.q)}<br><small>${r.ok?`You: ${esc(yours)}`:`You: ${esc(yours)} · Answer: ${esc(right)}`}</small></div></div>`; }).join("")}</div>
      <details><summary class="link" style="text-decoration:none">Show model answer</summary><div class="model"><b>What to write</b>${pt.model}</div></details></section>`; });
  h+=checklist(p.tpl)+`<button class="btn go wide" data-act="exam" data-t="${PR.t||0}">Another exam problem</button><button class="btn ghost wide" data-act="home">Home</button>`;
  show(h);
}

/* ================= TEST MENU ================= */
let ET=0;
function testmenu(){
  stopTimer();
  const ex=S.tests.filter(t=>t.k==="exam"), qz=S.tests.filter(t=>t.k==="quiz");
  const spark=(arr,c)=>arr.length>1?`<div class="spark">${arr.slice(-14).map(t=>`<i style="height:${Math.max(6,t.s/t.m*100)}%;--c:var(${c})" title="${Math.round(t.s/t.m*100)}%"></i>`).join("")}</div>`:"";
  const rows=S.tests.slice(-8).reverse().map(t=>`<div class="hrow"><div>${t.k==="exam"?`Exam · ${esc(TPL[t.tpl].name)}`:"Concept quiz"}<br><span>${new Date(t.d).toLocaleDateString(undefined,{month:"short",day:"numeric"})} · ${fmtT(t.t)}</span></div><b>${Math.round(t.s/t.m*100)}%</b></div>`).join("");
  show(`${bar("Test mode")}
  <section class="card"><h3>Exam simulation</h3><p class="muted">One full problem like the real test, in a new context, timed. Answer every part, then submit for your score and the model answers.</p>
    <div class="seg" role="group" aria-label="Problem type">${[0,1,2,3].map(t=>`<button data-act="etype" data-t="${t}" aria-pressed="${ET===t}">${t?TPL[t].name:"Random"}<span>${t?["Template 1","Template 2","Template 3"][t-1]:"Like the test"}</span></button>`).join("")}</div>
    <button class="btn go wide" data-act="exam" data-t="${ET}">Start exam</button>${spark(ex,"--m-test")}</section>
  <section class="card"><h3>Concept quiz</h3><p class="muted">12 quick questions across every topic, timed, with a topic breakdown at the end.</p>
    <button class="btn wide" data-act="quiz">Start quiz</button>${spark(qz,"--m-learn")}</section>
  ${rows?`<section class="card"><h3>History</h3><div class="hist">${rows}</div></section>`:""}`);
}

/* ================= z table sheet ================= */
function buildZ(){
  let h=`<table><thead><tr><th>z</th>${[...Array(10)].map((_,c)=>`<th data-c="${c}">.0${c}</th>`).join("")}</tr></thead><tbody>`;
  ZT.forEach((row,r)=>{ h+=`<tr><th data-r="${r}">${(r/10).toFixed(1)}</th>${row.map((v,c)=>`<td data-r="${r}" data-c="${c}">${v.toFixed(4)}</td>`).join("")}</tr>`; });
  $('ztab').innerHTML=h+"</tbody></table>";
  $('ztab').addEventListener("click",e=>{ const td=e.target.closest("td"); if(!td) return; const r=+td.dataset.r, c=+td.dataset.c;
    $('ztab').querySelectorAll(".hl,.on").forEach(x=>x.classList.remove("hl","on"));
    $('ztab').querySelectorAll(`[data-r="${r}"],[data-c="${c}"]`).forEach(x=>x.classList.add("hl")); td.classList.remove("hl"); td.classList.add("on");
    const z=(r/10+c/100).toFixed(2), v=ZT[r][c].toFixed(4);
    $('zsel').innerHTML=`P(Z &lt; ${z}) = <b>${v}</b> · P(Z &gt; ${z}) = <b>${(1-ZT[r][c]).toFixed(4)}</b> · P(Z &lt; −${z}) = <b>${(1-ZT[r][c]).toFixed(4)}</b>`; });
}
buildZ();
$('zclose').onclick=()=>{ $('zsheet').hidden=true; };
$('zsheet').addEventListener("click",e=>{ if(e.target.id==="zsheet") $('zsheet').hidden=true; });

/* ================= event wiring ================= */
app.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b||b.disabled) return; const a=b.dataset.act;
  switch(a){
    case "home": return home();
    case "learn": return learn();
    case "practice": return practice();
    case "testmenu": return testmenu();
    case "deck": { const d=DECKS.find(x=>x.id===b.dataset.d); return cards(ALLCARDS.filter(c=>c.deck===d.id), d.title, "learn"); }
    case "review": { const l=shuf(ALLCARDS.filter(c=>S.cards[c.key]===0)); return l.length?cards(l,"Still learning"):learn(); }
    case "allcards": return cards(shuf(ALLCARDS),"All concepts");
    case "flip": return flip();
    case "mark": return mark(+b.dataset.v);
    case "cprev": return cardStep(-1);
    case "cnext": return cardStep(1);
    case "qc": return runQC(pickQC(10),"prac","Quick checks");
    case "drill": { const k=b.dataset.k; return runQC([...Array(10)].map(()=>DRILLS[k].gen()),"drill",DRILLS[k].title,k); }
    case "drills": practice(); return setTimeout(()=>$('drillcard')?.scrollIntoView({block:"start"}),30);
    case "cram": return cram();
    case "simp": { CV.simp=!CV.simp; renderCards(); if(CV.simp) setTimeout(()=>$('simple')?.scrollIntoView({behavior:"smooth",block:"nearest"}),30); return; }
    case "weakqc": return runQC(pickQC(10,weakObjs().map(w=>w.k)),"prac","Weak spots");
    case "quiz": return runQC(shuf(QC.map((_,i)=>i)).slice(0,12),"test","Concept quiz");
    case "qopt": return qPick(+b.dataset.o);
    case "qnext": return qNext();
    case "ptype": PT=+b.dataset.t; return practice();
    case "etype": ET=+b.dataset.t; return testmenu();
    case "prob": return newProblem(PT,"prac");
    case "exam": return newProblem(+b.dataset.t,"exam");
    case "sopt": { const id=b.dataset.id; PR.val[id]=+b.dataset.o;
      if(PR.mode==="exam"){ b.parentNode.querySelectorAll(".opt").forEach(x=>x.removeAttribute("data-s")); b.dataset.s="pick"; return; }
      return answerStep(id); }
    case "schk": return answerStep(b.dataset.id);
    case "pnext": PR.pi++; PR.si=0; return renderProb();
    case "pdone": return probDone();
    case "esubmit": { const missing=PR.p.parts.reduce((n,pt,pi)=>n+pt.steps.filter((s,si)=>{ const v=PR.val[sid(pi,si)]; return v==null||v===""||(Array.isArray(v)&&v.some(x=>!x)); }).length,0);
      if(missing&&!b.dataset.sure){ b.dataset.sure="1"; b.textContent=`${missing} blank. Tap again to submit`; return; }
      return examSubmit(); }
    case "ztable": $('zsheet').hidden=false; return;
    case "sound": S.sound=!S.sound; save(); return home();
    case "reset": if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to erase all 640 progress"; return; }
      S={cards:{}, qc:{}, sess:0, obj:{}, tests:[], sound:S.sound, pr:{}, drills:{}, days:[]}; save(); return home();
  }
});
app.addEventListener("input",e=>{ const t=e.target; if(!PR||!t.dataset.id) return; const id=t.dataset.id;
  if(t.dataset.f!=null){ const arr=PR.val[id]||[]; arr[+t.dataset.f]=t.value; PR.val[id]=arr; } else PR.val[id]=t.value; });
app.addEventListener("keydown",e=>{ if(e.key!=="Enter") return; const t=e.target; if(!t.dataset||!t.dataset.id||!PR||PR.mode!=="prac") return;
  e.preventDefault(); if(t.dataset.f!=null){ const nx=app.querySelector(`input[data-id="${t.dataset.id}"][data-f="${+t.dataset.f+1}"]`); if(nx) return nx.focus(); } answerStep(t.dataset.id); });

/* ---------- offline + updates (shared with the map editions) ---------- */
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) navigator.serviceWorker.register("../sw.js").catch(()=>{});
async function checkUpdate(){ if(!navigator.onLine||APP_VERSION==="dev") return;
  try{ const r=await fetch("../version.json",{cache:"no-store"}); if(!r.ok) return; const v=(await r.json()).v; if(v&&v!==APP_VERSION) $('updBtn').hidden=false; }catch(e){} }
$('updBtn').onclick=async()=>{ $('updBtn').textContent="Updating…";
  try{ const reg=await navigator.serviceWorker?.getRegistration(); await reg?.update();
    const fresh=await fetch(location.pathname+"?fresh="+Date.now(),{cache:"no-store"});
    if(fresh.ok&&window.caches){ const c=await caches.open("globetrotter-v5"); await c.put(new URL(location.pathname,location.href).href,fresh); } }catch(e){}
  location.reload(); };
setTimeout(checkUpdate,1500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") checkUpdate(); });
try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}

home();
