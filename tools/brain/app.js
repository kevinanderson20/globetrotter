/* ================= BRAIN: quick games for memory, speed and logic ================= */
const APP_VERSION="dev";
const LS="globetrotter.brain.v1";
const $=id=>document.getElementById(id);
const app=$('app'), play=$('play'), stage=$('gstage');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const R=(a,b,r=Math.random)=>a+Math.floor(r()*(b-a+1));
const pick=(a,r=Math.random)=>a[Math.floor(r()*a.length)];
const shuf=(a,r=Math.random)=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const fmtT=ms=>{ const s=ms/1000, m=Math.floor(s/60), r=s-m*60; return m?`${m}:${(r<10?"0":"")+r.toFixed(1)}`:`${r.toFixed(1)}s`; };
const dstr=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>dstr(new Date());
function seeded(str){ let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; }
  return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); h^=h>>>16; return (h>>>0)/4294967296; }; }

/* ---------- the games ---------- */
const CATS=[["mem","Memory","Hold it in your head","--mem"],["spd","Speed & focus","React fast, stay sharp","--spd"],["log","Logic","Think it through","--log"]];
const GAMES={
 seq:{cat:"mem", ic:"🔲", name:"Sequence memory", desc:"Tiles light up in order. Repeat the pattern; it grows each round.", hi:true, fmt:v=>`Level ${v}`},
 num:{cat:"mem", ic:"🔢", name:"Number memory", desc:"A number flashes. Type it back. One more digit each round.", hi:true, fmt:v=>`${v} digits`},
 match:{cat:"mem", ic:"🃏", name:"Card match", desc:"Flip two at a time and find all 8 pairs.", hi:false, fmt:v=>fmtT(v)},
 react:{cat:"spd", ic:"⚡", name:"Reaction time", desc:"Wait for green, then tap. Average of 5.", hi:false, fmt:v=>`${Math.round(v)} ms`},
 stroop:{cat:"spd", ic:"🎨", name:"Color clash", desc:"Tap the ink color, not the word. 30 seconds.", hi:true, fmt:v=>`${v} pts`},
 schulte:{cat:"spd", ic:"🎯", name:"Number hunt", desc:"Tap 1 to 25 in order as fast as you can.", hi:false, fmt:v=>fmtT(v)},
 count:{cat:"log", ic:"🧮", name:"Countdown", desc:"Hit the target with six numbers and + − × ÷.", hi:false, fmt:v=>fmtT(v)},
 sudoku:{cat:"log", ic:"🧩", name:"Mini sudoku", desc:"6×6: every row, column and box gets 1 to 6. New daily puzzle.", hi:false, fmt:v=>fmtT(v)},
 lights:{cat:"log", ic:"💡", name:"Lights out", desc:"Each tap flips a light and its neighbors. Turn them all off.", hi:false, fmt:v=>fmtT(v)}
};
const WORKOUT=["num","schulte","sudoku"];

/* ---------- saved progress ---------- */
const FRESH=()=>({best:{}, hist:{}, days:[], sound:true, work:{}, plays:0, sud:"easy", lit:5});
let S=FRESH();
try{ const raw=localStorage.getItem(LS); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
function save(){ try{ localStorage.setItem(LS,JSON.stringify(S)); }catch(e){} }
function studied(){ const t=today(); if(S.days[S.days.length-1]!==t){ S.days.push(t); S.days=S.days.slice(-120); } }
function dayStreak(){ const set=new Set(S.days); let d=new Date(), n=0; if(!set.has(dstr(d))) d=new Date(Date.now()-864e5); while(set.has(dstr(d))){ n++; d=new Date(d.getTime()-864e5); } return n; }
/* one record per finished game; best is kept per game (and per difficulty where there is one) */
function record(game,v,key){ const k=key||game, g=GAMES[game], prev=S.best[k];
  const better=prev==null||(g.hi?v>prev:v<prev); if(better) S.best[k]=v;
  (S.hist[k]=S.hist[k]||[]).push({d:today(),v}); S.hist[k]=S.hist[k].slice(-60); S.plays++; studied(); save();
  return {better, prev}; }

/* ---------- sound + reinforcement ---------- */
let actx=null;
function tone(freq,dur=.25,type="sine",vol=.08){ if(!S.sound) return; try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended") actx.resume();
  const t=actx.currentTime, o=actx.createOscillator(), g=actx.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(actx.destination);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.start(t); o.stop(t+dur+.05); }catch(e){} }
function snd(kind){ if(!S.sound) return;
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended") actx.resume(); const t=actx.currentTime;
    if(kind==="ok"){ const out=actx.createGain(); out.gain.value=.45; out.connect(actx.destination);
      [[1,1,.7],[2.0,.45,.45],[2.76,.32,.3],[5.4,.14,.18]].forEach(([r,a,d])=>{ const os=actx.createOscillator(), gg=actx.createGain(); os.type="sine"; os.frequency.value=1046.5*r; os.connect(gg); gg.connect(out);
        gg.gain.setValueAtTime(.0001,t); gg.gain.exponentialRampToValueAtTime(.09*a,t+.004); gg.gain.exponentialRampToValueAtTime(.0001,t+d); os.start(t); os.stop(t+d+.05); }); return; }
    if(kind==="tick") return tone(880,.08,"sine",.05);
    const o=actx.createOscillator(), g=actx.createGain(); o.connect(g); g.connect(actx.destination); o.type="triangle"; o.frequency.setValueAtTime(196,t); o.frequency.exponentialRampToValueAtTime(130,t+.15);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.11,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+.22); o.start(t); o.stop(t+.24); }catch(e){} }
function flash(bad){ const f=$('flash'); f.classList.toggle("bad",!!bad); f.classList.remove("on"); void f.offsetWidth; f.classList.add("on"); }
function toast(t){ const el=$('toast'); el.textContent=t; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
const good=()=>{ snd("ok"); flash(); try{ navigator.vibrate&&navigator.vibrate(10); }catch(e){} };
const bad=()=>{ snd("no"); flash(true); try{ navigator.vibrate&&navigator.vibrate([20,40,20]); }catch(e){} };
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti(){ if(reduceMotion) return; const box=$('confetti'); box.innerHTML="";
  const cols=["var(--good)","var(--sun)","var(--mem)","var(--spd)","var(--log)","var(--hot)"];
  for(let i=0;i<70;i++){ const e=document.createElement("i"); e.style.left=Math.random()*100+"%"; e.style.background=cols[i%cols.length];
    e.style.setProperty("--dx",(Math.random()*160-80)+"px"); e.style.setProperty("--r",(Math.random()*720-360)+"deg");
    e.style.animationDelay=Math.random()*.35+"s"; e.style.animationDuration=1.4+Math.random()*1.1+"s"; box.appendChild(e); }
  setTimeout(()=>{ box.innerHTML=""; },3200); }

/* ---------- game shell: timers are tracked so quitting always cleans up ---------- */
let GS=null; window.__b={}; // read by automated tests
function begin(game,title){ end(); GS={game, timers:[], raf:0, t0:0}; $('gttl').textContent=title||GAMES[game].name; $('ginfo').textContent=""; $('gpill').hidden=true;
  play.hidden=false; document.body.classList.add("playing"); stage.innerHTML=""; return GS; }
const later=(fn,ms)=>{ const g=GS; const id=setTimeout(()=>{ if(GS===g) fn(); },ms); g&&g.timers.push(id); return id; };
function clock(fmt=ms=>fmtT(ms)){ const g=GS; g.t0=performance.now(); const step=()=>{ if(GS!==g) return; $('ginfo').textContent=fmt(performance.now()-g.t0); g.raf=requestAnimationFrame(step); }; g.raf=requestAnimationFrame(step); }
const elapsed=()=>Math.round(performance.now()-GS.t0);
function end(){ if(!GS) return; GS.timers.forEach(clearTimeout); cancelAnimationFrame(GS.raf); GS=null; play.hidden=true; document.body.classList.remove("playing"); }
$('pquit').onclick=()=>{ end(); home(); };

/* ================= MEMORY ================= */
/* sequence memory: a 3×3 grid; the pattern grows by one each round */
function startSeq(){
  begin("seq"); const notes=[262,294,330,392,440,523,587,659,784];
  stage.innerHTML=`<div class="gmsg" id="sm">Watch the pattern</div><div class="grid" id="sg" style="grid-template-columns:repeat(3,1fr)">${[...Array(9)].map((_,i)=>`<button class="cell" data-i="${i}" aria-label="Tile ${i+1}"></button>`).join("")}</div><div class="gsub" id="ss">Level 1</div>`;
  const cells=[...stage.querySelectorAll(".cell")]; let seq=[], at=0, busy=true;
  const lit=(i,ms)=>{ cells[i].classList.add("lit"); tone(notes[i],.3,"sine",.07); later(()=>cells[i].classList.remove("lit"),ms); };
  function round(){ seq.push(R(0,8)); at=0; busy=true; $('sm').textContent="Watch"; $('ss').textContent=`Level ${seq.length}`; $('ginfo').textContent=`Level ${seq.length}`;
    const on=Math.max(260,520-seq.length*18), gap=Math.max(120,220-seq.length*6);
    seq.forEach((i,k)=>later(()=>lit(i,on),600+k*(on+gap)));
    later(()=>{ busy=false; $('sm').textContent="Your turn"; },600+seq.length*(on+gap)); }
  $('sg').addEventListener("pointerdown",e=>{ const b=e.target.closest(".cell"); if(!b||busy) return; e.preventDefault(); const i=+b.dataset.i;
    if(i===seq[at]){ lit(i,180); at++; if(at===seq.length){ busy=true; $('sm').textContent="Nice!"; good(); later(round,800); } }
    else { busy=true; b.classList.add("no"); cells[seq[at]].classList.add("lit"); bad(); $('sm').textContent="Not that one";
      later(()=>finish("seq",seq.length-1,{sub:`You repeated ${seq.length-1} step${seq.length===2?"":"s"} in a row.`}),1300); } });
  __b.seq=()=>({seq,busy}); round();
}
/* number memory: a number flashes, you type it back */
function startNum(){
  begin("num"); let n=3, cur="", typed="";
  function show(){ cur=String(R(1,9))+[...Array(n-1)].map(()=>R(0,9)).join(""); const ms=1200+n*500;
    $('ginfo').textContent=`${n} digits`;
    stage.innerHTML=`<div class="gsub">Remember this</div><div class="bignum">${cur}</div><div class="bar1"><i id="nb"></i></div>`;
    const bar=$('nb'), t0=performance.now(), g=GS; const step=()=>{ if(GS!==g) return; const f=1-(performance.now()-t0)/ms; bar.style.transform=`scaleX(${Math.max(0,f)})`; if(f>0) g.raf=requestAnimationFrame(step); }; step();
    later(ask,ms); }
  function ask(){ typed="";
    stage.innerHTML=`<div class="gsub">What was the number?</div><div class="typed" id="nt">&nbsp;</div><div style="flex:1"></div><div class="npad" id="np">${["1","2","3","4","5","6","7","8","9","del","0","ok"].map(k=>`<button data-k="${k}" class="${k==="del"?"fn":k==="ok"?"go":""}">${k==="del"?"⌫":k==="ok"?"Enter":k}</button>`).join("")}</div>`;
    $('np').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b) return; e.preventDefault(); key(b.dataset.k); }); }
  function key(k){ if(k==="del") typed=typed.slice(0,-1); else if(k==="ok") return check(); else if(typed.length<24) typed+=k; $('nt').innerHTML=typed||"&nbsp;"; }
  function check(){ if(!typed) return;
    if(typed===cur){ good(); stage.innerHTML=`<div class="gmsg" style="color:var(--good)">Correct!</div><div class="bignum">${cur}</div><div class="gsub">Next: ${n+1} digits</div>`; n++; later(show,1100); }
    else { bad(); const cmp=[...cur].map((c,i)=>typed[i]===c?c:`<span class="xx">${c}</span>`).join("");
      stage.innerHTML=`<div class="gmsg">Not quite</div><div class="gsub">Number</div><div class="cmp">${cur}</div><div class="gsub">You typed</div><div class="cmp">${[...typed].map((c,i)=>cur[i]===c?c:`<span class="xx">${esc(c)}</span>`).join("")}</div>`;
      later(()=>finish("num",n-1,{sub:`You held ${n-1} digits.`, note:"Most adults manage about 7."}),2200); } }
  window._numKey=key; __b.num=()=>cur; show();
}
/* card match: 8 pairs */
function startMatch(){
  begin("match"); const sy=shuf(["🍎","🚀","🌙","⭐","🎈","🐢","🌵","🎲","🦊","🍩","⚓","🎧"]).slice(0,8), deck=shuf([...sy,...sy]);
  let open=[], moves=0, done=0, started=false, lock=false;
  stage.innerHTML=`<div class="gsub" id="mm">Find all 8 pairs</div><div class="grid" style="grid-template-columns:repeat(4,1fr);max-width:360px">${deck.map((s,i)=>`<button class="card2" data-i="${i}" aria-label="Card"><span>${s}</span></button>`).join("")}</div><div class="gsub" id="mv">0 moves</div>`;
  const cards=[...stage.querySelectorAll(".card2")]; __b.deck=deck;
  stage.querySelector(".grid").addEventListener("pointerdown",e=>{ const b=e.target.closest(".card2"); if(!b||lock) return; e.preventDefault(); const i=+b.dataset.i;
    if(b.classList.contains("up")||b.classList.contains("done")) return;
    if(!started){ started=true; clock(); }
    b.classList.add("up"); tone(600+open.length*120,.12,"sine",.05); open.push(i);
    if(open.length===2){ moves++; $('mv').textContent=`${moves} move${moves===1?"":"s"}`; const [a,c]=open;
      if(deck[a]===deck[c]){ open=[]; done++; later(()=>{ cards[a].className="card2 done"; cards[c].className="card2 done"; good(); },250);
        if(done===8) later(()=>finish("match",elapsed(),{sub:`${moves} moves (8 is perfect).`}),900); }
      else { lock=true; later(()=>{ cards[a].classList.remove("up"); cards[c].classList.remove("up"); open=[]; lock=false; },750); } } });
}

/* ================= SPEED & FOCUS ================= */
/* reaction time: wait for green */
function startReact(){
  begin("react"); const times=[]; let state="idle", goAt=0;
  stage.innerHTML=`<button class="react" id="rp" data-s="idle">Tap to start<small>When the screen turns green, tap as fast as you can.</small></button><div class="tries" id="rt"></div>`;
  const rp=$('rp');
  const set=(s,html)=>{ state=s; rp.dataset.s=s; rp.innerHTML=html; };
  function arm(){ set("wait","Wait for green…"); const id=later(()=>{ set("go","TAP!"); goAt=performance.now(); },R(1400,3800)); GS.armed=id; }
  rp.addEventListener("pointerdown",e=>{ e.preventDefault(); const now=performance.now();
    if(state==="idle"||state==="shown"){ arm(); return; }
    if(state==="wait"){ clearTimeout(GS.armed); bad(); set("soon","Too soon!<small>Tap to try that one again.</small>"); state="shown"; return; }
    if(state==="go"){ const ms=Math.round(now-goAt); times.push(ms); tone(1200,.08,"sine",.06);
      $('rt').innerHTML=times.map(t=>`<span>${t} ms</span>`).join(""); $('ginfo').textContent=`${times.length} of 5`;
      if(times.length===5){ const avg=Math.round(times.reduce((a,b)=>a+b,0)/5); set("shown",`${ms} ms`); good(); later(()=>finish("react",avg,{sub:`Best try ${Math.min(...times)} ms. Typical is about 250 ms.`}),900); state="end"; return; }
      set("shown",`${ms} ms<small>Tap for the next one</small>`); } });
}
/* color clash (Stroop): tap the ink, not the word */
function startStroop(){
  begin("stroop"); const C=[["RED","--g-red"],["BLUE","--g-blue"],["GREEN","--g-green"],["PURPLE","--g-purple"]];
  let right=0, wrong=0, cur=null, t0=0, shown=0, rts=[];
  stage.innerHTML=`<div class="gsub">Tap the color of the <b>ink</b></div><div class="word" id="sw"></div><div class="colors" id="sc">${shuf(C).map(([n,v])=>`<button data-n="${n}"><i style="--k:var(${v})"></i>${n[0]+n.slice(1).toLowerCase()}</button>`).join("")}</div><div class="gsub" id="sr">0 right</div>`;
  function next(){ const w=pick(C), ink=Math.random()<.3?w:pick(C.filter(c=>c!==w)); cur=ink[0]; const el=$('sw'); el.textContent=w[0]; el.style.color=`var(${ink[1]})`; shown=performance.now(); }
  $('sc').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b||!cur) return; e.preventDefault();
    if(b.dataset.n===cur){ right++; rts.push(performance.now()-shown); tone(900,.06,"sine",.05); flash(); } else { wrong++; bad(); }
    $('sr').textContent=`${right} right${wrong?` · ${wrong} wrong`:""}`; next(); });
  const g=GS; g.t0=performance.now(); const step=()=>{ if(GS!==g) return; const left=30000-(performance.now()-g.t0); $('ginfo').textContent=Math.ceil(Math.max(0,left)/1000)+"s";
    if(left<=0){ cur=null; const sc=right-wrong; return finish("stroop",Math.max(0,sc),{sub:`${right} right, ${wrong} wrong${rts.length?` · ${Math.round(rts.reduce((a,b)=>a+b,0)/rts.length)} ms per answer`:""}.`}); } g.raf=requestAnimationFrame(step); };
  __b.stroop=()=>cur; next(); g.raf=requestAnimationFrame(step);
}
/* number hunt (Schulte table): tap 1 → 25 */
function startSchulte(){
  begin("schulte"); const nums=shuf([...Array(25)].map((_,i)=>i+1)); let want=1, miss=0;
  stage.innerHTML=`<div class="gmsg" id="hw">Find 1</div><div class="grid" style="grid-template-columns:repeat(5,1fr);gap:6px">${nums.map(n=>`<button class="cell" data-n="${n}" style="font-size:22px">${n}</button>`).join("")}</div><div class="gsub" id="hm">Keep your eyes in the middle and let them find the numbers.</div>`;
  let started=false;
  stage.querySelector(".grid").addEventListener("pointerdown",e=>{ const b=e.target.closest(".cell"); if(!b) return; e.preventDefault(); const n=+b.dataset.n;
    if(!started){ started=true; clock(); }
    if(n===want){ b.classList.add("found"); tone(500+want*20,.07,"sine",.05); want++;
      if(want>25){ good(); return finish("schulte",elapsed(),{sub:miss?`${miss} wrong tap${miss>1?"s":""}.`:"No wrong taps!"}); } $('hw').textContent=`Find ${want}`; }
    else if(n>want){ miss++; b.classList.add("no"); bad(); later(()=>b.classList.remove("no"),350); } });
}

/* ================= LOGIC ================= */
/* countdown: reach the target using six numbers once each */
function solveCountdown(nums,target){
  let best={d:Infinity,v:null,e:""}; const seen=new Set();
  function rec(items){
    for(const it of items){ const d=Math.abs(it.v-target); if(d<best.d){ best={d,v:it.v,e:it.e}; if(!d) return true; } }
    if(items.length<2) return false;
    const key=items.map(x=>x.v).sort((a,b)=>a-b).join(","); if(seen.has(key)) return false; seen.add(key);
    for(let i=0;i<items.length;i++) for(let j=i+1;j<items.length;j++){
      const a=items[i], b=items[j], rest=items.filter((_,k)=>k!==i&&k!==j), [hi,lo]=a.v>=b.v?[a,b]:[b,a];
      const c=[{v:a.v+b.v,e:`${a.v} + ${b.v} = ${a.v+b.v}`,s:[a,b]}];
      if(hi.v-lo.v>0) c.push({v:hi.v-lo.v,e:`${hi.v} − ${lo.v} = ${hi.v-lo.v}`,s:[hi,lo]});
      if(a.v>1&&b.v>1) c.push({v:a.v*b.v,e:`${a.v} × ${b.v} = ${a.v*b.v}`,s:[a,b]});
      if(lo.v>1&&hi.v%lo.v===0) c.push({v:hi.v/lo.v,e:`${hi.v} ÷ ${lo.v} = ${hi.v/lo.v}`,s:[hi,lo]});
      for(const x of c){ const node={v:x.v,e:[x.s[0].e,x.s[1].e,x.e].filter(Boolean).join("|")}; if(rec([...rest,node])) return true; } }
    return false; }
  rec(nums.map(v=>({v,e:""}))); return best; }
function makeCountdown(r=Math.random){
  for(let t=0;t<40;t++){ const big=shuf([25,50,75,100],r).slice(0,r()<.5?1:2); const smalls=shuf([1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10],r).slice(0,6-big.length);
    const nums=[...big,...smalls], target=R(101,999,r), sol=solveCountdown(nums,target); if(sol.d===0) return {nums,target,sol}; }
  return makeCountdown(r); }
function startCount(){
  begin("count"); const P=makeCountdown(); let tiles=P.nums.map((v,i)=>({v,id:i,from:null})), sel=null, op=null, hist=[], log=[], over=false;
  clock();
  function render(){
    stage.innerHTML=`<div class="gsub">Make exactly</div><div class="target">${P.target}</div>
      <div class="tiles" id="ct">${tiles.map((t,i)=>`<button data-i="${i}" class="${sel===i?"sel":""}${t.v===P.target?" hit":""}">${t.v}</button>`).join("")}</div>
      <div class="opsrow" id="co">${["+","−","×","÷"].map(o=>`<button data-o="${o}" class="${op===o?"sel":""}">${o}</button>`).join("")}</div>
      <div class="worklog">${log.length?esc(log.join(" · ")):"Tap a number, an operation, then another number."}</div>
      <div class="row" style="justify-content:center"><button class="btn ghost small" id="cu" ${hist.length?"":"disabled"}>Undo</button><button class="btn ghost small" id="cr">Start over</button><button class="btn ghost small" id="cg">Show a solution</button></div>`;
    $('ct').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b||over) return; e.preventDefault(); tap(+b.dataset.i); });
    $('co').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b||over) return; e.preventDefault(); if(sel==null) return; op=op===b.dataset.o?null:b.dataset.o; render(); });
    $('cu').onclick=()=>{ if(!hist.length) return; const h=hist.pop(); tiles=h.tiles; log=h.log; sel=null; op=null; render(); };
    $('cr').onclick=()=>{ if(!hist.length) return; tiles=hist[0].tiles; log=[]; hist=[]; sel=null; op=null; render(); };
    $('cg').onclick=()=>{ const b=$('cg'); if(!b.dataset.sure){ b.dataset.sure=1; b.textContent="Tap again to give up"; return; } over=true; reveal(false); };
  }
  function tap(i){
    if(sel==null||op==null){ sel=sel===i?null:i; op=null; tone(700,.05,"sine",.04); return render(); }
    if(i===sel){ sel=null; op=null; return render(); }
    const a=tiles[sel].v, b=tiles[i].v; let v=null;
    if(op==="+") v=a+b; else if(op==="×") v=a*b; else if(op==="−") v=a-b>0?a-b:null; else v=b>0&&a%b===0?a/b:null;
    if(v==null){ bad(); toast(op==="−"?"Results must be positive":"Must divide exactly"); sel=null; op=null; return render(); }
    hist.push({tiles:tiles.map(t=>({...t})), log:log.slice()}); log.push(`${a} ${op} ${b} = ${v}`);
    const keep=tiles.filter((_,k)=>k!==sel&&k!==i); keep.push({v,id:Date.now()}); tiles=keep; sel=null; op=null; tone(820,.07,"sine",.05);
    if(v===P.target){ over=true; render(); good(); later(()=>finish("count",elapsed(),{sub:log.join(" · ")}),900); return; }
    render(); }
  function reveal(){ const steps=P.sol.e.split("|").filter(Boolean);
    stage.innerHTML=`<div class="gsub">Target</div><div class="target">${P.target}</div><div class="gsub">One way to get there</div><div class="cmp wrap" style="font-size:18px;letter-spacing:0">${steps.map(esc).join("<br>")}</div>
      <div class="row" style="justify-content:center"><button class="btn go" id="cn">New numbers</button><button class="btn ghost" id="ch">Home</button></div>`;
    $('cn').onclick=startCount; $('ch').onclick=()=>{ end(); home(); }; }
  __b.count=P; render();
}
/* mini sudoku: 6×6 with 2×3 boxes, unique solution */
const box6=(r,c)=>Math.floor(r/2)*2+Math.floor(c/3);
function sudFill(g,r){ const i=g.indexOf(0); if(i<0) return true; const row=Math.floor(i/6), col=i%6;
  for(const v of shuf([1,2,3,4,5,6],r)){ if(ok6(g,row,col,v)){ g[i]=v; if(sudFill(g,r)) return true; g[i]=0; } } return false; }
function ok6(g,row,col,v){ for(let k=0;k<6;k++){ if(g[row*6+k]===v||g[k*6+col]===v) return false; }
  const br=Math.floor(row/2)*2, bc=Math.floor(col/3)*3; for(let r=br;r<br+2;r++) for(let c=bc;c<bc+3;c++) if(g[r*6+c]===v) return false; return true; }
function sudCount(g,lim=2){ const i=g.indexOf(0); if(i<0) return 1; const row=Math.floor(i/6), col=i%6; let n=0;
  for(let v=1;v<=6;v++) if(ok6(g,row,col,v)){ g[i]=v; n+=sudCount(g,lim); g[i]=0; if(n>=lim) break; } return n; }
function makeSudoku(diff,r=Math.random){ const sol=Array(36).fill(0); sudFill(sol,r); const p=sol.slice(); const target=diff==="hard"?11:diff==="medium"?14:18;
  for(const i of shuf([...Array(36)].map((_,k)=>k),r)){ if(p.filter(Boolean).length<=target) break; const v=p[i]; p[i]=0; if(sudCount(p.slice())!==1) p[i]=v; }
  return {sol,p}; }
function startSudoku(opt={}){
  const daily=!!opt.daily, diff=daily?"medium":S.sud, key=`sudoku:${daily?"daily":diff}`;
  begin("sudoku",daily?"Daily sudoku":`Mini sudoku · ${diff}`);
  const P=makeSudoku(diff,daily?seeded("brain-sudoku-"+today()):Math.random), g=P.p.slice(); let sel=g.indexOf(0), won=false, errs=0;
  __b.sud=P; clock();
  function bad6(i){ const v=g[i]; if(!v) return false; const row=Math.floor(i/6), col=i%6; g[i]=0; const ok=ok6(g,row,col,v); g[i]=v; return !ok; }
  function render(){ const sv=sel>=0?g[sel]:0, sr=Math.floor(sel/6), sc=sel%6;
    stage.innerHTML=`<div class="sud ${won?"won":""}" id="sg">${g.map((v,i)=>{ const r=Math.floor(i/6), c=i%6, peer=sel>=0&&(r===sr||c===sc||box6(r,c)===box6(sr,sc));
      return `<button data-i="${i}" class="${P.p[i]?"given":""}${i===sel?" sel":v&&v===sv?" same":peer?" peer":""}${bad6(i)?" bad":""}${r===1||r===3?" r2":""}${c===2?" c3":""}" aria-label="Row ${r+1} column ${c+1}${v?`: ${v}`:""}">${v||""}</button>`; }).join("")}</div>
      <div class="spad" id="sp">${[1,2,3,4,5,6].map(v=>`<button data-v="${v}">${v}</button>`).join("")}<button data-v="0" class="fn" aria-label="Erase">⌫</button></div>
      <div class="gsub">${won?"Solved!":"Every row, column and 2×3 box needs 1 to 6."}</div>`;
    $('sg').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b||won) return; e.preventDefault(); sel=+b.dataset.i; render(); });
    $('sp').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b||won||sel<0||P.p[sel]) return; e.preventDefault(); const v=+b.dataset.v; g[sel]=v;
      if(v&&bad6(sel)){ errs++; bad(); } else if(v) tone(600+v*60,.07,"sine",.05);
      if(g.every((x,i)=>x===P.sol[i])){ won=true; render(); good(); later(()=>finish("sudoku",elapsed(),{key, sub:`${daily?"Today's puzzle":diff[0].toUpperCase()+diff.slice(1)} · ${errs?`${errs} clash${errs>1?"es":""}`:"no clashes"}`, daily}),1000); return; }
      if(v&&!g.includes(0)) toast("Something clashes. Look for red.");
      if(v){ const nx=g.findIndex((x,i)=>i>sel&&!x); if(nx>=0&&!bad6(sel)) sel=nx; } render(); });
  }
  render();
}
/* lights out: 5×5, generated from random presses so it is always solvable */
function startLights(){
  const presses={3:3,5:5,8:8}[S.lit]||5, key=`lights:${S.lit}`;
  begin("lights",`Lights out · ${presses} taps`);
  const on=Array(25).fill(false), flip=i=>{ const r=Math.floor(i/5), c=i%5; [[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([y,x])=>{ if(y>=0&&y<5&&x>=0&&x<5) on[y*5+x]=!on[y*5+x]; }); };
  shuf([...Array(25)].map((_,i)=>i)).slice(0,presses).forEach(flip);
  if(!on.some(Boolean)) flip(12);
  let moves=0, started=false; __b.lights=on;
  stage.innerHTML=`<div class="gmsg" id="lm">Turn every light off</div><div class="grid lights" id="lg" style="grid-template-columns:repeat(5,1fr);gap:6px">${on.map((v,i)=>`<button class="cell${v?" on":""}" data-i="${i}" aria-label="Light ${i+1}"></button>`).join("")}</div><div class="gsub" id="lv">Solvable in ${presses} taps · 0 moves</div>`;
  const cells=[...stage.querySelectorAll(".cell")];
  $('lg').addEventListener("pointerdown",e=>{ const b=e.target.closest(".cell"); if(!b) return; e.preventDefault(); if(!started){ started=true; clock(); }
    flip(+b.dataset.i); moves++; cells.forEach((c,i)=>c.classList.toggle("on",on[i])); tone(on[+b.dataset.i]?660:440,.07,"sine",.05);
    $('lv').textContent=`Solvable in ${presses} taps · ${moves} move${moves===1?"":"s"}`;
    if(!on.some(Boolean)){ good(); later(()=>finish("lights",elapsed(),{key, sub:`${moves} moves (best possible: ${presses} or fewer).`}),700); } });
}

/* ================= RESULTS ================= */
function spark(hist,hi){ if(!hist||hist.length<2) return ""; const v=hist.slice(-12).map(h=>h.v), mx=Math.max(...v), mn=Math.min(...v), sp=(mx-mn)||1;
  const pts=v.map((x,i)=>`${(i/(v.length-1)*54+1).toFixed(1)},${(hi?17-(x-mn)/sp*16:1+(x-mn)/sp*16).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 56 18" aria-hidden="true"><polyline points="${pts}"/></svg>`; }
function bigChart(hist,g){ if(!hist||hist.length<2) return ""; const v=hist.slice(-20), W=320,H=110,L=8,T=12,B=12, vals=v.map(h=>h.v), mx=Math.max(...vals), mn=Math.min(...vals), sp=(mx-mn)||1;
  const x=i=>L+i*(W-2*L)/(v.length-1), y=val=>g.hi?T+(mx-val)/sp*(H-T-B):T+(val-mn)/sp*(H-T-B);
  return `<svg class="chart2" viewBox="0 0 ${W} ${H}" role="img" aria-label="Your recent results">${`<polyline points="${v.map((h,i)=>`${x(i).toFixed(1)},${y(h.v).toFixed(1)}`).join(" ")}"/>`}${v.map((h,i)=>`<circle cx="${x(i)}" cy="${y(h.v)}" r="3.5"/>`).join("")}<text x="${L}" y="${H}">older</text><text x="${W-L}" y="${H}" text-anchor="end">latest</text></svg>`; }
let WK=null; // set when a game is part of the daily workout
function finish(game,v,o={}){
  end(); const g=GAMES[game], key=o.key||game, r=record(game,v,key);
  if(WK&&game===WK){ (S.work[today()]=S.work[today()]||{})[game]=v; save(); }
  const wkDone=WORKOUT.every(x=>(S.work[today()]||{})[x]!=null), wkNext=WORKOUT.find(x=>(S.work[today()]||{})[x]==null);
  const cheer=r.prev==null?"First score. Now beat it!":r.better?`New best! Old best: ${g.fmt(r.prev)}`:`Your best: ${g.fmt(r.prev)}`;
  show(`${bar(g.name)}
  <section class="card center" style="--c:var(--${g.cat})"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">${esc(g.name)}</div>
    <div class="big">${esc(g.fmt(v))}</div><p class="muted">${esc(o.sub||"")}</p>${o.note?`<p class="muted">${esc(o.note)}</p>`:""}<p class="cheer" style="${r.better?"":"color:var(--ink-2)"}">${esc(cheer)}</p></section>
  ${(S.hist[key]||[]).length>1?`<section class="card" style="--c:var(--${g.cat})"><h3>Your trend</h3>${bigChart(S.hist[key],g)}<p class="muted">${g.hi?"Higher is better.":"Lower is better."} ${S.hist[key].length} games played.</p></section>`:""}
  ${WK&&wkNext?`<button class="btn go wide" data-act="wk">Workout: next is ${esc(GAMES[wkNext].name)}</button>`:""}
  ${WK&&wkDone&&game===WK?`<section class="card center"><p class="cheer">Daily workout complete!</p><p class="muted">${dayStreak()}-day streak. Come back tomorrow.</p></section>`:""}
  <button class="btn ${WK&&wkNext?"":"go"} wide" data-act="play" data-g="${game}">${o.daily?"Practice another":"Play again"}</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  if(WK&&wkDone&&game===WK){ setTimeout(confetti,150); toast("Workout complete!"); } else if(r.better&&r.prev!=null) setTimeout(confetti,150);
  WK=null;
}

/* ================= HOME ================= */
function bar(title,back="home"){ return `<div class="bar"><button class="x" data-act="${back}" aria-label="Back"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M13.5 4.5 7 11l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ttl">${esc(title)}</div></div>`; }
function show(html){ app.innerHTML=html; window.scrollTo(0,0); }
const LOGO='<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><path d="M13 10.5a4 4 0 0 0-4 4 3.6 3.6 0 0 0 .6 2 4 4 0 0 0 1.4 6.4 4 4 0 0 0 7 1.6V11.6a3.5 3.5 0 0 0-5-1.1Z" fill="var(--mem)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M23 10.5a4 4 0 0 1 4 4 3.6 3.6 0 0 1-.6 2 4 4 0 0 1-1.4 6.4 4 4 0 0 1-7 1.6V11.6a3.5 3.5 0 0 1 5-1.1Z" fill="var(--log)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/></svg>';
function bestOf(game){ if(game==="sudoku"){ const k=S.best["sudoku:daily"]!=null?"sudoku:daily":`sudoku:${S.sud}`; return {v:S.best[k],h:S.hist[k]}; }
  if(game==="lights"){ const k=`lights:${S.lit}`; return {v:S.best[k],h:S.hist[k]}; } return {v:S.best[game],h:S.hist[game]}; }
function home(){
  const w=S.work[today()]||{}, wdone=WORKOUT.filter(x=>w[x]!=null).length, st=dayStreak();
  show(`
  <div class="brand">${LOGO}<h1>Brain</h1>
    <nav class="tabs" aria-label="Edition"><a href="../">World</a><a href="../usa/">USA</a><a href="../earth/">Earth</a><a href="../math/">Math</a><a href="./" aria-current="page">Brain</a></nav></div>
  <button class="workout" data-act="wk"><b>${wdone===3?"Workout done ✓":"Daily workout"}</b><span>${wdone===3?`Nice. ${st}-day streak. Replay any game below.`:"Three games, about four minutes: memory, speed, logic."}</span>
    <div class="steps3">${WORKOUT.map(x=>`<span class="${w[x]!=null?"done":""}">${GAMES[x].ic} ${x==="sudoku"?"Daily sudoku":esc(GAMES[x].name)}${w[x]!=null?` · ${esc(GAMES[x].fmt(w[x]))}`:""}</span>`).join("")}</div></button>
  ${st?`<div class="chips"><span class="chip hot">${st}-day streak</span><span class="chip">${S.plays} games played</span></div>`:""}
  ${CATS.map(([c,name,sub,col])=>`<section class="sec"><div class="sech"><h2>${name}</h2><span>${sub}</span></div><div class="games">${Object.entries(GAMES).filter(([k,g])=>g.cat===c).map(([k,g])=>{ const b=bestOf(k);
    return `<button class="game" style="--c:var(${col})" data-act="play" data-g="${k}"><span class="ic">${g.ic}</span><b>${esc(g.name)}</b><span>${esc(g.desc)}</span><span class="rec">${b.v!=null?`Best ${esc(g.fmt(b.v))}`:"Not played"}${spark(b.h,g.hi)}</span></button>`; }).join("")}</div></section>`).join("")}
  <section class="card"><h3>Options</h3>
    <div class="sech"><span>Mini sudoku</span></div><div class="levels">${["easy","medium","hard"].map(d=>`<button data-act="sud" data-v="${d}" aria-pressed="${S.sud===d}">${d[0].toUpperCase()+d.slice(1)}</button>`).join("")}</div>
    <div class="sech"><span>Lights out</span></div><div class="levels">${[3,5,8].map(d=>`<button data-act="lit" data-v="${d}" aria-pressed="${S.lit===d}">${d} taps</button>`).join("")}</div></section>
  <div class="foot">
    <div>Progress saves on this device</div>
    <div id="bk" style="width:100%"></div>
    <div class="row" style="justify-content:center"><button class="btn ghost small" data-act="sound">Sounds ${S.sound?"on":"off"}</button><button class="btn ghost small" data-act="reset">Start over</button></div>
    <div>Version ${esc(APP_VERSION)}</div>
  </div>`);
  GT_BK.ui($('bk'),{beforeBackup:save});
}
const STARTERS={seq:startSeq,num:startNum,match:startMatch,react:startReact,stroop:startStroop,schulte:startSchulte,count:startCount,sudoku:startSudoku,lights:startLights};
app.addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b) return; const a=b.dataset.act;
  if(a==="home") return home();
  if(a==="play"){ WK=null; return STARTERS[b.dataset.g](b.dataset.daily?{daily:true}:{}); }
  if(a==="wk"){ const w=S.work[today()]||{}, nx=WORKOUT.find(x=>w[x]==null); if(!nx) return; WK=nx; return STARTERS[nx](nx==="sudoku"?{daily:true}:{}); }
  if(a==="sud"){ S.sud=b.dataset.v; save(); const y=scrollY; home(); scrollTo(0,y); return; }
  if(a==="lit"){ S.lit=+b.dataset.v; save(); const y=scrollY; home(); scrollTo(0,y); return; }
  if(a==="sound"){ S.sound=!S.sound; save(); return home(); }
  if(a==="reset"){ if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to erase all Brain progress"; return; } const s0=S.sound; S=FRESH(); S.sound=s0; save(); return home(); }
});
document.addEventListener("keydown",e=>{ if(play.hidden) return; if(e.key==="Escape"){ end(); home(); return; }
  if(GS&&GS.game==="num"&&window._numKey){ if(/^[0-9]$/.test(e.key)) window._numKey(e.key); else if(e.key==="Backspace") window._numKey("del"); else if(e.key==="Enter") window._numKey("ok"); } });
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") save(); });

/* ---------- offline + updates (shared with the other tabs) ---------- */
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) navigator.serviceWorker.register("../sw.js").catch(()=>{});
async function checkUpdate(){ if(!navigator.onLine||APP_VERSION==="dev") return;
  try{ const r=await fetch("../version.json",{cache:"no-store"}); if(!r.ok) return; const v=(await r.json()).v; if(v&&v!==APP_VERSION) $('updBtn').hidden=false; }catch(e){} }
$('updBtn').onclick=async()=>{ $('updBtn').textContent="Updating…";
  try{ const reg=await navigator.serviceWorker?.getRegistration(); await reg?.update();
    const fresh=await fetch(location.pathname+"?fresh="+Date.now(),{cache:"no-store"});
    if(fresh.ok&&window.caches){ const c=await caches.open("globetrotter-v7"); await c.put(new URL(location.pathname,location.href).href,fresh); } }catch(e){}
  location.reload(); };
setTimeout(checkUpdate,1500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"&&play.hidden) checkUpdate(); });
try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}

home();
