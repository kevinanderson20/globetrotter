/* ================= GAMES: quick games for memory, speed and logic ================= */
/* (saved under the "brain" key: the tab was first called Brain, and the key keeps that progress) */
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
const CATS=[["daily","Daily games","New puzzles every day","--wd"],["mem","Memory","Hold it in your head","--mem"],["spd","Speed & focus","React fast, stay sharp","--spd"],["log","Logic","Think it through","--log"],["unl","Unlimited","Play as much as you like","--nm"]];
const GAMES={
 seq:{cat:"mem", ic:"🔲", name:"Sequence memory", desc:"Tiles light up in order. Repeat the pattern; it grows each round.", hi:true, fmt:v=>`Level ${v}`},
 num:{cat:"mem", ic:"🔢", name:"Number memory", desc:"A number flashes. Type it back. One more digit each round.", hi:true, fmt:v=>`${v} digits`},
 match:{cat:"mem", ic:"🃏", name:"Card match", desc:"Flip two at a time and find all 8 pairs.", hi:false, fmt:v=>fmtT(v)},
 react:{cat:"spd", ic:"⚡", name:"Reaction time", desc:"Wait for green, then tap. Average of 5.", hi:false, fmt:v=>`${Math.round(v)} ms`},
 stroop:{cat:"spd", ic:"🎨", name:"Color clash", desc:"Tap the ink color, not the word. 30 seconds.", hi:true, fmt:v=>`${v} pts`},
 schulte:{cat:"spd", ic:"🎯", name:"Number hunt", desc:"Tap 1 to 25 in order as fast as you can.", hi:false, fmt:v=>fmtT(v)},
 count:{cat:"log", ic:"🧮", name:"Countdown", desc:"Hit the target with six numbers and + − × ÷.", hi:false, fmt:v=>fmtT(v)},
 sudoku:{cat:"log", ic:"🧩", name:"Mini sudoku", desc:"6×6: every row, column and box gets 1 to 6. Unlimited puzzles, easy to hard.", hi:false, fmt:v=>fmtT(v)},
 mini:{cat:"daily", col:"--wd", ic:"✏️", name:"Mini crossword", desc:"A quick 5×5 crossword. New puzzle every day.", hi:false, fmt:v=>fmtT(v)},
 groups:{cat:"daily", col:"--wd", ic:"🗂️", name:"Connections", desc:"Sort 16 words into four groups of four.", hi:false, fmt:v=>v===0?"Perfect":`${v} mistake${v>1?"s":""}`},
 dive:{cat:"daily", col:"--nm", ic:"🦐", name:"Krillion", desc:"Name one answer per prompt. Rarer answers score more. 700 is perfect.", hi:true, fmt:v=>`${v} / 700`},
 climb:{cat:"daily", col:"--nm", ic:"🎈", name:"Reverse Krillion", desc:"Name the answer most people would. Common answers score more.", hi:true, fmt:v=>`${v} / 700`},
 strandsu:{cat:"unl", col:"--wd", ic:"🧵", name:"Unlimited Strands", desc:"Play any of the Strands boards, as many as you like.", hi:false, fmt:v=>v===0?"Perfect":`${v} hint${v>1?"s":""}`},
 worldleu:{cat:"unl", col:"--geo", ic:"🗺️", name:"Unlimited Worldle", desc:"A random country outline every round.", hi:false, fmt:v=>v>=7?"X/6":`${v}/6`},
 globleu:{cat:"unl", col:"--geo", ic:"🌍", name:"Unlimited Globle", desc:"A random mystery country every round.", hi:false, fmt:v=>v>=999?"✗":`${v} guess${v===1?"":"es"}`},
 nbrsu:{cat:"unl", col:"--geo", ic:"🧱", name:"Unlimited Neighbors", desc:"Five random countries. Name every border.", hi:true, fmt:v=>`${v}%`},
 travleu:{cat:"unl", col:"--geo", ic:"🧭", name:"Unlimited Travle", desc:"A random pair of countries every round.", hi:false, fmt:v=>v>=99?"✗":v===0?"Perfect":`+${v}`},
 diveu:{cat:"unl", col:"--nm", ic:"🦐", name:"Unlimited Krillion", desc:"Fresh random prompts, as many rounds as you like.", hi:true, fmt:v=>`${v} / 700`},
 climbu:{cat:"unl", col:"--nm", ic:"🎈", name:"Unlimited Reverse Krillion", desc:"Fresh random prompts, as many rounds as you like.", hi:true, fmt:v=>`${v} / 700`},
 strands:{cat:"daily", col:"--wd", ic:"🧵", name:"Strands", desc:"Find the hidden theme words on a 6×8 board. One spangram crosses it end to end.", hi:false, fmt:v=>v===0?"Perfect":`${v} hint${v>1?"s":""}`},
 worldle:{cat:"daily", col:"--geo", ic:"🗺️", name:"Worldle", desc:"Guess the country from its outline. Six tries, with distance and direction hints.", hi:false, fmt:v=>v>=7?"X/6":`${v}/6`},
 travle:{cat:"daily", col:"--geo", ic:"🧭", name:"Travle", desc:"Connect two countries through the countries in between, in as few guesses as you can.", hi:false, fmt:v=>v>=99?"✗":v===0?"Perfect":`+${v}`},
 globle:{cat:"daily", col:"--geo", ic:"🌍", name:"Globle", desc:"Find the mystery country. Every guess glows hotter the closer it is.", hi:false, fmt:v=>v>=999?"✗":`${v} guess${v===1?"":"es"}`},
 nbrs:{cat:"daily", col:"--geo", ic:"🧱", name:"Neighbors", desc:"Five countries. Name every country each one borders.", hi:true, fmt:v=>`${v}%`},
 dsudoku:{cat:"daily", col:"--log", ic:"🔢", name:"Daily sudoku", desc:"An easy 6×6 with pencil notes. One new puzzle a day.", hi:false, fmt:v=>fmtT(v)},
 lights:{cat:"log", ic:"💡", name:"Lights out", desc:"Each tap flips a light and its neighbors. Turn them all off.", hi:false, fmt:v=>fmtT(v)}
};
const WORKOUT=["num","schulte","sudoku"];

/* ---------- saved progress ---------- */
const FRESH=()=>({best:{}, hist:{}, days:[], sound:true, work:{}, plays:0, sud:"easy", lit:5, xw:{done:{},prog:{}}, gp:{done:{}}, nm:{}});
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
  play.hidden=false; document.body.classList.add("playing"); stage.innerHTML=""; stage.className="gstage"; return GS; }
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
  begin("sudoku",daily?"Workout sudoku":`Mini sudoku · ${diff}`);
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

/*PUZZLES*/

/* ================= WORD PUZZLES: mini crossword and groups ================= */
const DAY0=new Date(2026,0,1);
const dayIndex=()=>{ const n=new Date(); return Math.round((new Date(n.getFullYear(),n.getMonth(),n.getDate())-DAY0)/864e5); };
const dailyOf=list=>((dayIndex()%list.length)+list.length)%list.length;
function shareText(text,btn){ const t=text+"\n"+location.origin+location.pathname;
  (async()=>{ try{ if(navigator.share){ await navigator.share({text:t}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
    try{ await navigator.clipboard.writeText(t); btn.textContent="Copied to clipboard"; }
    catch(e){ btn.insertAdjacentHTML("afterend",`<textarea class="sharetxt" readonly rows="5">${esc(t)}</textarea>`); btn.remove(); const ta=document.querySelector(".sharetxt"); ta.focus(); ta.select(); } })(); }

/* ---------- mini crossword ---------- */
function parseMini(P){
  const g=P.g.map(r=>r.toUpperCase()), open=(r,c)=>r>=0&&r<5&&c>=0&&c<5&&g[r][c]!=="#";
  const num=Array(25).fill(0), words=[], cw=[...Array(25)].map(()=>({})); let n=0;
  for(let r=0;r<5;r++) for(let c=0;c<5;c++){ if(!open(r,c)) continue;
    const sa=!open(r,c-1)&&open(r,c+1), sd=!open(r-1,c)&&open(r+1,c); if(sa||sd) num[r*5+c]=++n;
    if(sa){ const cells=[]; for(let k=c;open(r,k);k++) cells.push(r*5+k); words.push({dir:"a",num:n,cells}); }
    if(sd){ const cells=[]; for(let k=r;open(k,c);k++) cells.push(k*5+c); words.push({dir:"d",num:n,cells}); } }
  words.sort((x,y)=>x.dir===y.dir?x.num-y.num:x.dir==="a"?-1:1);
  words.forEach((w,k)=>{ w.ans=w.cells.map(i=>g[Math.floor(i/5)][i%5]).join(""); w.clue=P.c[w.ans]; w.cells.forEach(i=>cw[i][w.dir]=k); });
  const sol=[...Array(25)].map((_,i)=>open(Math.floor(i/5),i%5)?g[Math.floor(i/5)][i%5]:null);
  return {num,words,cw,sol}; }
function startMini(opt={}){
  const id=opt.id!=null?opt.id:dailyOf(MINIS), daily=opt.id==null||opt.id===dailyOf(MINIS), X=parseMini(MINIS[id]);
  begin("mini",`Mini crossword #${id+1}`);
  S.xw=S.xw||{done:{},prog:{}}; const saved=S.xw.prog[id], prev=S.xw.done[id];
  const fill=saved?saved.f.split(","):Array(25).fill(""), wrong=new Set(), rev=new Set(saved&&saved.r?saved.r:[]);
  let sel=X.words[0].cells[0], dir="a", won=!!prev, menu=null;
  if(prev) X.sol.forEach((L,i)=>{ if(L) fill[i]=L; });
  clock(); if(saved) GS.t0-=saved.ms; if(prev){ cancelAnimationFrame(GS.raf); $('ginfo').textContent=fmtT(prev.t); }
  const word=()=>X.words[X.cw[sel][dir]];
  stage.innerHTML=`<div class="xwwrap"><div class="xw" id="xg">${X.sol.map((L,i)=>L?`<button class="xc" data-i="${i}">${X.num[i]?`<span class="n">${X.num[i]}</span>`:""}<span class="l"></span></button>`:`<span class="xc blk"></span>`).join("")}</div>
    <div class="xwtools" id="xt"></div><div class="sp"></div>
    <div class="xwclue" id="xcb"><button class="xarr" data-d="-1" aria-label="Previous clue">‹</button><div class="xct" id="xct" role="button" tabindex="0" aria-label="Switch direction"></div><button class="xarr" data-d="1" aria-label="Next clue">›</button></div>
    <div class="kb" id="kb">${["QWERTYUIOP","ASDFGHJKL","ZXCVBNM<"].map(r=>`<div>${[...r].map(k=>`<button data-k="${k}" class="${k==="<"?"bk":""}" aria-label="${k==="<"?"Delete":k}">${k==="<"?"⌫":k}</button>`).join("")}</div>`).join("")}</div></div>`;
  const cells=[...stage.querySelectorAll("#xg .xc")], byI={}; cells.forEach(b=>{ if(b.dataset.i) byI[b.dataset.i]=b; });
  function paint(){ const w=word(), inW=new Set(w.cells);
    for(const i in byI){ const b=byI[i], k=+i; b.querySelector(".l").textContent=fill[k]||"";
      b.className="xc"+(k===sel?" sel":inW.has(k)?" word":"")+(wrong.has(k)?" wrong":"")+(rev.has(k)?" rev":"")+(won?" won":""); }
    $('xct').innerHTML=`<b>${w.num}${w.dir==="a"?"A":"D"}</b> ${esc(w.clue)}`;
    $('xt').innerHTML=won?`<span class="xdone">${prev?"Solved":"Solved!"}</span>`:menu?`<span class="xlab">${menu==="chk"?"Check":"Reveal"}:</span>${["Square","Word","Puzzle"].map(x=>`<button data-m="${x}">${x}</button>`).join("")}<button data-m="x" aria-label="Close">✕</button>`:`<button data-m="chk">Check</button><button data-m="rev">Reveal</button>`; }
  const store=()=>{ if(won) return; S.xw.prog[id]={f:fill.join(","),ms:elapsed(),r:[...rev]}; save(); };
  function next(){ const w=word(), pos=w.cells.indexOf(sel), empty=i=>!fill[i];
    const after=w.cells.slice(pos+1).find(empty); if(after!=null){ sel=after; return; }
    const before=w.cells.slice(0,pos).find(empty); if(before!=null){ sel=before; return; }
    const k=X.cw[sel][dir]; for(let s=1;s<=X.words.length;s++){ const nw=X.words[(k+s)%X.words.length], e=nw.cells.find(empty); if(e!=null){ sel=e; dir=nw.dir; return; } }
    if(pos<w.cells.length-1) sel=w.cells[pos+1]; }
  function type(L){ if(won) return; if(rev.has(sel)){ next(); return paint(); } fill[sel]=L; wrong.delete(sel); tone(520+L.charCodeAt(0)*4,.05,"sine",.035); next(); paint(); store(); done(); }
  function back(){ if(won) return; const w=word(), pos=w.cells.indexOf(sel);
    if(fill[sel]&&!rev.has(sel)){ fill[sel]=""; wrong.delete(sel); }
    else if(pos>0){ sel=w.cells[pos-1]; if(!rev.has(sel)){ fill[sel]=""; wrong.delete(sel); } }
    paint(); store(); }
  function jump(d){ const k=X.cw[sel][dir], nw=X.words[(k+d+X.words.length)%X.words.length]; dir=nw.dir; sel=nw.cells.find(i=>!fill[i])??nw.cells[0]; paint(); }
  function done(){ if(fill.some((L,i)=>X.sol[i]&&!L)) return;
    if(fill.every((L,i)=>!X.sol[i]||L===X.sol[i])){ won=true; cancelAnimationFrame(GS.raf); const t=elapsed(); delete S.xw.prog[id];
      if(!prev) S.xw.done[id]={t,rev:rev.size,d:today()}; save(); paint(); good();
      const clean=!rev.size;
      later(()=>finish("mini",t,{noRecord:!clean, sub:`Puzzle #${id+1}${daily?" (today's)":""}${clean?"":` · ${rev.size} square${rev.size>1?"s":""} revealed`}`, archive:true,
        share:`Mini crossword #${id+1}\n✅ Solved in ${fmtT(t)}${clean?"":` · ${rev.size} revealed`}`}),1100); }
    else toast("Not quite. Something's off."); }
  function act(m){ if(m==="chk"||m==="rev"){ menu=m; return paint(); } if(m==="x"){ menu=null; return paint(); }
    const set=m==="Square"?[sel]:m==="Word"?word().cells:X.sol.map((L,i)=>L?i:-1).filter(i=>i>=0);
    if(menu==="chk"){ let n=0; set.forEach(i=>{ if(fill[i]&&fill[i]!==X.sol[i]){ wrong.add(i); n++; } }); n?bad():toast(set.some(i=>!fill[i])?"No mistakes so far":"All correct"); }
    else { set.forEach(i=>{ if(fill[i]!==X.sol[i]){ fill[i]=X.sol[i]; rev.add(i); wrong.delete(i); } }); store(); }
    menu=null; paint(); done(); }
  $('xg').addEventListener("pointerdown",e=>{ const b=e.target.closest(".xc[data-i]"); if(!b) return; e.preventDefault(); const i=+b.dataset.i;
    if(i===sel){ const o=dir==="a"?"d":"a"; if(X.cw[i][o]!=null) dir=o; } else { sel=i; if(X.cw[i][dir]==null) dir=dir==="a"?"d":"a"; } paint(); });
  $('kb').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b) return; e.preventDefault(); b.classList.add("down"); setTimeout(()=>b.classList.remove("down"),90); b.dataset.k==="<"?back():type(b.dataset.k); });
  $('xcb').addEventListener("pointerdown",e=>{ const a=e.target.closest(".xarr"); e.preventDefault(); if(a) return jump(+a.dataset.d); const o=dir==="a"?"d":"a"; if(X.cw[sel][o]!=null){ dir=o; paint(); } });
  $('xt').addEventListener("click",e=>{ const b=e.target.closest("button"); if(b) act(b.dataset.m); });
  window._xwKey=k=>{ if(/^[a-z]$/i.test(k)) type(k.toUpperCase()); else if(k==="Backspace") back(); else if(k==="Tab"||k==="Enter") jump(1); else if(k===" "){ const o=dir==="a"?"d":"a"; if(X.cw[sel][o]!=null){ dir=o; paint(); } }
    else if(k.startsWith("Arrow")){ const r=Math.floor(sel/5), c=sel%5, [dr,dc]={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k], nd=dc?"a":"d";
      if(dir!==nd&&X.cw[sel][nd]!=null){ dir=nd; return paint(); } let rr=r+dr, cc=c+dc; while(rr>=0&&rr<5&&cc>=0&&cc<5&&!X.sol[rr*5+cc]){ rr+=dr; cc+=dc; } if(rr>=0&&rr<5&&cc>=0&&cc<5){ sel=rr*5+cc; if(X.cw[sel][dir]==null) dir=nd; paint(); } } };
  __b.mini=X; paint();
}

/* ---------- groups: find four groups of four ---------- */
const GP_EM=["🟩","🟧","🟦","🟪"];
function startGroups(opt={}){
  const id=opt.id!=null?opt.id:dailyOf(GROUPS), daily=opt.id==null||opt.id===dailyOf(GROUPS);
  const groups=GROUPS[id].map(([name,ws],k)=>({k,name,words:ws.split(" ")}));
  begin("groups",`Connections #${id+1}`); S.gp=S.gp||{done:{}};
  let left=shuf(groups.flatMap(g=>g.words)), solved=[], sel=new Set(), mistakes=0, guesses=[], over=false, busy=false;
  const prev=S.gp.done[id];
  function render(){
    stage.innerHTML=`<div class="gpwrap"><div class="gphead">${over?"":"Make four groups of four."}</div>
      <div class="gpsolved">${solved.map(g=>`<div class="gpbar t${g.k}"><b>${esc(g.name)}</b><span>${g.words.map(esc).join(", ")}</span></div>`).join("")}</div>
      ${left.length?`<div class="gpgrid" id="gg">${left.map(w=>`<button class="gpw${sel.has(w)?" on":""}${w.length>8?" xl":w.length>6?" l":""}" data-w="${w}">${w}</button>`).join("")}</div>`:""}
      ${over?"":`<div class="gpmist">Mistakes left: ${[0,1,2,3].map(k=>`<i class="${k<4-mistakes?"":"off"}"></i>`).join("")}</div>
      <div class="gpbtns"><button class="btn ghost small" id="gsh">Shuffle</button><button class="btn ghost small" id="gde" ${sel.size?"":"disabled"}>Deselect all</button><button class="btn small" id="gsu" ${sel.size===4?"":"disabled"}>Submit</button></div>`}
      <div id="gpend"></div></div>`;
    if(over) return;
    $('gg')&&$('gg').addEventListener("pointerdown",e=>{ const b=e.target.closest(".gpw"); if(!b||busy) return; e.preventDefault(); const w=b.dataset.w;
      if(sel.has(w)) sel.delete(w); else if(sel.size<4) sel.add(w); else return; tone(sel.has(w)?660:440,.05,"sine",.04); render(); });
    $('gsh').onclick=()=>{ if(busy) return; left=shuf(left); render(); };
    $('gde').onclick=()=>{ if(busy) return; sel.clear(); render(); };
    $('gsu').onclick=submit; }
  function submit(){ if(sel.size!==4||busy) return;
    const key=[...sel].sort().join("|"); if(guesses.some(g=>g.key===key)){ toast("Already guessed!"); return; }
    const tiers=[...sel].map(w=>groups.find(g=>g.words.includes(w)).k); guesses.push({key,tiers});
    const hit=groups.find(g=>!solved.includes(g)&&g.words.every(w=>sel.has(w)));
    const tiles=[...stage.querySelectorAll(".gpw.on")]; busy=true;
    if(hit){ tiles.forEach((t,k)=>setTimeout(()=>t.classList.add("hop"),k*80)); good();
      later(()=>{ solved.push(hit); left=left.filter(w=>!hit.words.includes(w)); sel.clear(); busy=false; render(); if(solved.length===4) end(true); },650); return; }
    mistakes++; const one=groups.some(g=>!solved.includes(g)&&g.words.filter(w=>sel.has(w)).length===3);
    tiles.forEach(t=>t.classList.add("shake")); bad(); toast(one?"One away…":"Not a group");
    later(()=>{ busy=false; render(); if(mistakes>=4){ over=true; reveal(); } },550); }
  function reveal(){ const rest=groups.filter(g=>!solved.includes(g)).sort((a,b)=>a.k-b.k); sel.clear(); render();
    rest.forEach((g,k)=>later(()=>{ solved.push(g); left=left.filter(w=>!g.words.includes(w)); render(); if(k===rest.length-1) end(false); },700*(k+1))); }
  function end(won){ over=true; if(!prev) S.gp.done[id]={won,m:mistakes,d:today()}; save();
    const grid=guesses.map(g=>g.tiers.map(t=>GP_EM[t]).join("")).join("\n"), share=`Connections #${id+1}\n${grid}`;
    if(won) return later(()=>finish("groups",mistakes,{sub:`Puzzle #${id+1}${daily?" (today's)":""} · ${guesses.length} guesses`, archive:true, share}),900);
    render(); $('gpend').innerHTML=`<div class="gpout"><b>Out of mistakes</b><span>Here are the groups. A new puzzle is waiting tomorrow.</span><div class="gpgridtxt">${grid.replace(/\n/g,"<br>")}</div>
      <button class="btn go wide" id="gshr">Share result</button><div class="row" style="width:100%"><button class="btn wide" id="garc">More puzzles</button><button class="btn ghost" id="ghm">Home</button></div></div>`;
    $('gshr').onclick=()=>shareText(share,$('gshr')); $('garc').onclick=()=>{ end_(); archive(); }; $('ghm').onclick=()=>{ end_(); home(); }; }
  const end_=()=>{ cancelAnimationFrame(GS&&GS.raf); play.hidden=true; document.body.classList.remove("playing"); GS&&GS.timers.forEach(clearTimeout); GS=null; };
  if(prev){ solved=groups.slice(); left=[]; over=true; render(); $('gpend').innerHTML=`<div class="gpout"><b>${prev.won?(prev.m?`Solved with ${prev.m} mistake${prev.m>1?"s":""}`:"Solved with no mistakes"):"You've played this one"}</b><div class="row" style="width:100%"><button class="btn wide" id="garc">More puzzles</button><button class="btn ghost" id="ghm">Home</button></div></div>`;
    $('garc').onclick=()=>{ end_(); archive(); }; $('ghm').onclick=()=>{ end_(); home(); }; return; }
  __b.groups=groups; render();
}

/* ---------- archive: every puzzle, playable any time ---------- */
function archive(){
  S.xw=S.xw||{done:{},prog:{}}; S.gp=S.gp||{done:{}};
  const dm=dailyOf(MINIS), dg=dailyOf(GROUPS);
  show(`${bar("Puzzle archive")}
  <p class="muted">Today's puzzles are marked. Play any of them; your first solve of each is saved.</p>
  <section class="card"><h3>✏️ Mini crossword</h3><div class="arch">${MINIS.map((_,i)=>{ const d=S.xw.done[i], p=S.xw.prog[i]; return `<button data-act="pmini" data-id="${i}" class="${d?"ok":""}${i===dm?" today":""}"><b>#${i+1}</b><span>${i===dm?"Today":d?fmtT(d.t):p?"In progress":"Not played"}</span></button>`; }).join("")}</div></section>
  <section class="card"><h3>🗂️ Connections</h3><div class="arch">${GROUPS.map((_,i)=>{ const d=S.gp.done[i]; return `<button data-act="pgrp" data-id="${i}" class="${d?(d.won?"ok":"lost"):""}${i===dg?" today":""}"><b>#${i+1}</b><span>${i===dg?"Today":d?(d.won?(d.m?`${d.m} mistake${d.m>1?"s":""}`:"Perfect"):"Missed"):"Not played"}</span></button>`; }).join("")}</div></section>`);
}
function wordStatus(k){ if(k==="mini"){ S.xw=S.xw||{done:{},prog:{}}; const i=dailyOf(MINIS), d=S.xw.done[i], p=S.xw.prog[i]; return d?`Today's done · ${fmtT(d.t)}`:p?`Today's #${i+1} · in progress`:`Today's #${i+1} is ready`; }
  S.gp=S.gp||{done:{}}; const i=dailyOf(GROUPS), d=S.gp.done[i]; return d?(d.won?`Today's done · ${d.m?`${d.m} mistake${d.m>1?"s":""}`:"perfect"}`:"Today's done"):`Today's #${i+1} is ready`; }

/* ================= DEEP DIVE + SKY CLIMB: name one answer per prompt ================= */
/* Deep dive pays for rare answers (deeper ocean); Sky climb pays for the answer most people give (higher sky). */
/*LISTS*/
(()=>{ // extra prompts built from the country lists: "a country starting with M", ordered so famous ones still come first
  const all=[EUROPE,AFRICA,ASIA,SAMERICA,NAMERICA,OCEANIA].flatMap(s=>{ const a=s.split(","); return a.map((x,i)=>({x,f:i/a.length})); })
    .filter(o=>!["england","scotland","wales","northern ireland","palestine"].includes(o.x)).sort((a,b)=>a.f-b.f);
  const seen=new Set(), uniq=all.filter(o=>{ const k=o.x.split("/")[0]; if(seen.has(k)) return false; seen.add(k); return true; });
  "ABCGMNST".split("").forEach(L=>{ const it=uniq.filter(o=>o.x[0]===L.toLowerCase()).map(o=>o.x.split("/").filter(a=>a[0]===L.toLowerCase()).join("/"));
    LISTS.push({p:`Name a country that starts with ${L}`, a:it.join(",")}); });
})();
const NM_NORM=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/&/g," and ").replace(/['’`.]/g,"").replace(/[^a-z0-9]+/g," ").trim();
function nmPrep(L){ if(L.items) return L; const drop=new Set(["the","a","an",...(L.d||[])]);
  L.norm=s=>{ const w=NM_NORM(s).split(" ").filter(Boolean), k=w.filter(x=>!drop.has(x)); return (k.length?k:w).join(" "); };
  L.items=L.a.split(",").map(x=>x.trim()).filter(Boolean).map((x,r)=>{ const al=x.split("/").map(s=>s.trim()); return {show:al[0],keys:[...new Set(al.map(L.norm))],r}; });
  L.N=L.items.length; return L; }
function lev(a,b){ const m=a.length,n=b.length; let p=[...Array(n+1).keys()];
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[n]; }
function nmMatch(L,input){ nmPrep(L); const q=L.norm(input); if(!q) return null; const qs=q.replace(/ /g,"");
  const vars=new Set(); [q,qs].forEach(v=>{ vars.add(v); vars.add(v+"s"); if(v.endsWith("ies")) vars.add(v.slice(0,-3)+"y"); if(v.endsWith("es")) vars.add(v.slice(0,-2)); if(v.endsWith("s")) vars.add(v.slice(0,-1)); });
  for(const it of L.items) for(const k of it.keys){ if(vars.has(k)||vars.has(k.replace(/ /g,""))) return it; }
  if(L.t){ const w=q.split(" "); for(let s=1;s<w.length;s++){ const tail=w.slice(s).join(" "), tv=new Set([tail,tail.replace(/ /g,""),tail.replace(/s$/,""),tail+"s"]); for(const it of L.items) if(it.keys.some(k=>tv.has(k)||tv.has(k.replace(/ /g,"")))) return it; } }
  return null; }
/* near misses: typos, a missing word, the start of a longer name. Returns up to 3 answers for "Did you mean…?" */
function nmSuggest(L,input){ nmPrep(L); const q=L.norm(input), qs=q.replace(/ /g,""); if(qs.length<3) return [];
  const tries=[qs]; if(L.t){ const w=q.split(" "); if(w.length>1) tries.push(w[w.length-1]); }
  const sc=new Map();
  for(const it of L.items) for(const k of it.keys){ const ks=k.replace(/ /g,""); let best=9;
    for(const t of tries){ if(t.length<3) continue;
      const lim=t.length<5?1:t.length<9?2:3;
      if(Math.abs(ks.length-t.length)<=lim){ const d=lev(t,ks); if(d<=lim) best=Math.min(best,d); }
      if(t.length>=4&&ks.startsWith(t)) best=Math.min(best,1.5);
      if(t.length>=4&&k.split(" ").some(w=>w===t||(w.length>=5&&lev(w,t)<=1))) best=Math.min(best,1.2);
      if(t.length>=5&&ks.includes(t)) best=Math.min(best,1.8); }
    if(best<9&&(!sc.has(it)||sc.get(it)>best)) sc.set(it,best); }
  return [...sc.entries()].sort((a,b)=>a[1]-b[1]||a[0].r-b[0].r).slice(0,3).map(e=>e[0]); }
/* five tiers, 100 points max per prompt, 700 a round.
   Krillion counts from the rare end: the single rarest answer is the Krillion. Reverse Krillion counts from the common end. */
const NM_TIERS={
  dive:[[100,"Krillion","The rarest answer on the list","🐋"],[85,"Deep cut","Among the rarest 25%","🐙"],[60,"Rare","Rarer than most","🦑"],[30,"Schooler","A common pick","🐠"],[10,"Plankton","Everyone says it","🫧"]],
  climb:[[100,"Top answer","The #1 answer most people give","🚀"],[85,"Crowd favorite","Among the most common 25%","🛰️"],[60,"Popular","More common than most","✈️"],[30,"Uncommon","The crowd mostly went elsewhere","☁️"],[10,"Too rare","Almost nobody says that","🌱"]]};
function nmTierIx(mode,r,N){ const k=mode==="dive"?N-1-r:r, q=k/N; return k===0?0:q<.25?1:q<.65?2:q<.9?3:4; }
const NM={
  dive:{name:"Krillion", ic:"🦐", tag:"The rarer the answer, the more points",
    zone:p=>p<20?"Sunlit zone":p<100?"Twilight zone":p<400?"Midnight zone":p<600?"Abyssal zone":"Hadal trench",
    col:f=>`color-mix(in srgb,#8fd8f5 ${Math.round((1-f)*100)}%,#04162b)`},
  climb:{name:"Reverse Krillion", ic:"🎈", tag:"The more common the answer, the more points",
    zone:p=>p<50?"Treetops":p<200?"Low clouds":p<400?"Alpine peaks":p<600?"Thin air":"Top of the world",
    col:f=>`color-mix(in srgb,#bfe9a6 ${Math.round((1-f)*100)}%,#3a7bd5)`}
};
const nmCap=s=>s.replace(/(^|[\s\-&])([a-z])/g,(m,a,b)=>a+b.toUpperCase()).replace(/\bMc([a-z])/g,(m,a)=>"Mc"+a.toUpperCase()).replace(/\b(Dc|Uk|Usa|Us|Uae|Drc|Bmw|Gmc|Vw|Byd|Tvr|Bmx|K2|Lbj|Jfk|Fdr|Kfc|Hiit|Bbq|Led|Tv|Mma|Bjj|Usb)\b/g,x=>x.toUpperCase()).replace(/\bAnd\b/g,"and").replace(/\bOf\b/g,"of").replace(/\bThe\b(?!^)/g,"the").replace(/^the/,"The");
/* scores used to be meters (x10); bring old saves onto the 700-point scale once */
if(!S.nmPts){ ["dive","climb"].forEach(k=>{ if(S.best[k]!=null) S.best[k]=Math.round(S.best[k]/10); (S.hist[k]||[]).forEach(h=>h.v=Math.round(h.v/10)); Object.values((S.nm||{})[k]||{}).forEach(d=>{ if(d&&d.m!=null) d.m=Math.round(d.m/10); }); }); S.nmPts=1; try{ localStorage.setItem(LS,JSON.stringify(S)); }catch(e){} }
/* daily prompts follow one fixed rotation, so a prompt can't come back until every other prompt has had its turn.
   Each day gets one or two country prompts; Sky climb runs half a cycle ahead, so the two games never share a prompt on the same day. */
let NM_ROT=null;
function nmDay(mode,d){
  if(!NM_ROT){ const r=seeded("globetrotter-name-it-v1"), ks=[...LISTS.keys()], isC=k=>/countr/i.test(LISTS[k].p);
    const C=shuf(ks.filter(isC),r), O=shuf(ks.filter(k=>!isC(k)),r), days=Math.floor(ks.length/7); let o=0; NM_ROT=[];
    for(let j=0;j<days;j++){ const c=C.slice(Math.floor(j*C.length/days),Math.floor((j+1)*C.length/days)), day=c.concat(O.slice(o,o+7-c.length)); o+=7-c.length; NM_ROT.push(shuf(day,r)); } }
  const n=NM_ROT.length, j=(((d+(mode==="climb"?Math.floor(n/2):0))%n)+n)%n; return NM_ROT[j]; }
function nmStatus(k){ S.nm=S.nm||{}; const d=(S.nm[k]||{})[today()]; return d?`Today's done · ${d.m} / 700 · tap for your answers`:"Today's prompts are ready"; }
/* every answer on a list, grouped by tier, best tier first; yours is highlighted */
function nmAllHtml(mode,L,it){ const T=NM_TIERS[mode], g=T.map(()=>[]);
  (mode==="dive"?[...L.items].reverse():L.items).forEach(x=>g[nmTierIx(mode,x.r,L.N)].push(x));
  return `<div class="nmall">${g.map((xs,ti)=>xs.length?`<div class="nmgrp"><h5>${T[ti][3]} ${esc(T[ti][1])} <small>${T[ti][0]} pts · ${xs.length}</small></h5><p>${xs.map(x=>`<span${x===it?' class="me"':""}>${esc(nmCap(x.show))}</span>`).join("")}</p></div>`:"").join("")}</div>`; }
function nmResultsHtml(mode,res){ return `<section class="card"><h3>Your answers</h3><p class="muted nmtip">Tap a prompt to see every answer.</p><div class="nmlist">${res.map(r=>`<details class="nmrow"><summary><span>${r.em}</span><p>${esc(r.L.p)}<b>${r.it?esc(nmCap(r.it.show)):r.pts==null?"Tap to see every answer":"No answer"}</b><small>${esc(r.lab)}</small></p><em>${r.pts==null?"":"+"+r.pts}</em><i class="nmchev">›</i></summary>${nmAllHtml(mode,r.L,r.it)}</details>`).join("")}</div></section>`; }
function nmWireRows(){ document.querySelectorAll(".nmrow").forEach(d=>d.addEventListener("toggle",()=>{ if(d.open) document.querySelectorAll(".nmrow[open]").forEach(o=>{ if(o!==d) o.open=false; }); })); }
const nmShareText=(mode,m,em)=>`${NM[mode].name} ${NM[mode].ic} ${new Date().toLocaleDateString(undefined,{month:"short",day:"numeric"})}\n${em}\n${m} / 700 · ${NM[mode].zone(m)}`;
/* today's round is played once; after that the daily card shows what you answered */
function nmToday(mode){ const M=NM[mode], T=NM_TIERS[mode], d=S.nm[mode][today()];
  const res=d.a?d.a.map(([k,r])=>{ const L=nmPrep(LISTS[k]), it=r>=0?L.items[r]:null, t=it?T[nmTierIx(mode,it.r,L.N)]:[0,"Time's up","","⬛"]; return {L,it,pts:t[0],lab:t[1],em:t[3]}; })
    // rounds saved before answers were stored: today's prompts are still known, just not what was typed
    :nmDay(mode,dayIndex()).map(k=>({L:nmPrep(LISTS[k]),it:null,pts:null,lab:"Your answer wasn't saved",em:"▫️"}));
  show(`${bar(M.name)}
  <section class="card center" style="--c:var(${GAMES[mode].col})"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Today's ${esc(M.name)}</div>
    <div class="big">${d.m} / 700</div><p class="muted">${esc(M.zone(d.m))}</p><p class="cheer" style="color:var(--ink-2)">New prompts tomorrow</p></section>
  ${nmResultsHtml(mode,res)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="${mode}u">Play unlimited ${esc(M.name)}</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(nmShareText(mode,d.m,d.e||"")); nmWireRows(); }
function startNm(mode,opt={}){
  const M=NM[mode], T=NM_TIERS[mode]; S.nm=S.nm||{}; S.nm[mode]=S.nm[mode]||{};
  if(!opt.practice&&S.nm[mode][today()]) return nmToday(mode);
  const daily=!opt.practice, gid=daily?mode:mode+"u";
  const idx=daily?nmDay(mode,dayIndex()):shuf([...LISTS.keys()]).slice(0,7), picks=idx.map(i=>nmPrep(LISTS[i]));
  begin(gid,daily?`${M.name} · today`:`Unlimited ${M.name}`);
  let i=0, res=[], m=0, locked=false, deadline=0, tmr=0;
  const TIME=25000;
  function scene(){ const f=Math.min(1,m/700);
    return `<div class="nmscene ${mode}" style="--sc:${M.col(f)};--pos:${(mode==="dive"?f:1-f)*100}%"><div class="nmtrack"><i></i><span>${M.ic}</span></div><div class="nmdepth"><b>${m}<small> / 700</small></b><span>${M.zone(m)}</span></div></div>`; }
  function ask(){ locked=false; const L=picks[i];
    stage.innerHTML=`<div class="nmwrap">${scene()}<div class="nmcard"><div class="nmno">Prompt ${i+1} of 7 · ${esc(M.tag)}</div><div class="nmq">${esc(L.p)}</div>
      <div class="nmtime"><i id="nmbar"></i></div>
      <form id="nmf" class="nmform" autocomplete="off"><input id="nmin" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="Type one answer" aria-label="Your answer"><button class="btn go" type="submit">Go</button></form>
      <div class="nmmsg" id="nmmsg"></div></div></div>`;
    __b.nm={mode,list:L,i};
    const inp=$('nmin'); setTimeout(()=>inp.focus(),60);
    deadline=performance.now()+TIME; tmr=later(()=>reveal(null),TIME);
    const g=GS, step=()=>{ if(GS!==g||locked) return; const left=Math.max(0,deadline-performance.now()); const b=$('nmbar'); if(b){ b.style.width=(left/TIME*100)+"%"; b.classList.toggle("low",left<6000); } $('ginfo').textContent=Math.ceil(left/1000)+"s"; g.raf=requestAnimationFrame(step); }; g.raf=requestAnimationFrame(step);
    $('nmf').onsubmit=e=>{ e.preventDefault(); if(locked) return; const v=inp.value.trim(); if(!v) return;
      const it=nmMatch(L,v); if(it) return reveal(it);
      const sug=nmSuggest(L,v), msg=$('nmmsg');
      if(sug.length){ msg.className="nmmsg sug"; msg.innerHTML=`<span>Did you mean…</span>${sug.map((s,j)=>`<button type="button" class="nmsug" data-j="${j}">${esc(nmCap(s.show))}</button>`).join("")}`;
        msg.querySelectorAll(".nmsug").forEach(b=>b.onclick=()=>reveal(sug[+b.dataset.j])); return; }
      bad(); inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake"); msg.className="nmmsg"; msg.textContent=`"${v}" isn't on the list. Try another.`; inp.select(); }; }
  function reveal(it){ if(locked) return; locked=true; clearTimeout(tmr); cancelAnimationFrame(GS.raf); $('ginfo').textContent=""; const L=picks[i];
    const ti=it?nmTierIx(mode,it.r,L.N):-1, [pts,lab,why,em]=it?T[ti]:[0,"Time's up","No answer this time","⬛"];
    if(it) good(); else bad();
    const m0=m; m+=pts; res.push({L,it,pts,em,lab,ti,k:idx[i]});
    stage.innerHTML=`<div class="nmwrap">${scene()}<div class="nmcard"><div class="nmno">Prompt ${i+1} of 7</div><div class="nmq">${esc(L.p)}</div>
      <div class="nmres ${it?"ok":"no"} t${ti}"><b>${it?esc(nmCap(it.show)):"No answer"}</b><span>${em} ${esc(lab)}${it?` · ${esc(why)}`:""}</span><em>+${pts}</em></div>
      <button class="btn go wide" id="nmnext">${i<6?"Next prompt":"See results"}</button></div></div>`;
    __b.nm={mode,list:L,i,pts};
    if(it){ const d=stage.querySelector(".nmdepth b"); if(d&&!reduceMotion){ const t0=performance.now(), g=GS; const run=()=>{ if(GS!==g) return; const k=Math.min(1,(performance.now()-t0)/700); d.innerHTML=Math.round(m0+(m-m0)*k)+"<small> / 700</small>"; if(k<1) requestAnimationFrame(run); }; run(); } }
    $('nmnext').onclick=()=>{ i++; if(i<7) ask(); else done_(); }; }
  function done_(){ const em=res.map(r=>r.em).join("");
    if(daily){ S.nm[mode][today()]={m,e:em,a:res.map(r=>[r.k,r.it?r.it.r:-1])}; const ks=Object.keys(S.nm[mode]).sort(); ks.slice(0,-60).forEach(k=>delete S.nm[mode][k]); save(); }
    finish(gid,m,{sub:`${M.zone(m)}${daily?" · today's prompts":" · unlimited round"}`, share:nmShareText(mode,m,em), html:nmResultsHtml(mode,res), nextG:mode+"u", nextLabel:daily?`Play unlimited ${M.name}`:"Play again", after:nmWireRows}); }
  ask();
}

/* ================= DAILY SUDOKU: one easy 6×6 a day ================= */
let DS_CACHE=null;
/* the daily puzzle is a 6×6 (2×3 boxes), easy, from the same generator as Mini sudoku */
const DN=6, DBOX=i=>Math.floor(Math.floor(i/6)/2)*2+Math.floor((i%6)/3);
function dsToday(){ const day=today(); if(DS_CACHE&&DS_CACHE.day===day) return DS_CACHE;
  const M=makeSudoku("easy",seeded("globetrotter-daily-sudoku6-"+day));
  return DS_CACHE={day,sol:M.sol,p:M.p,lvl:"easy6",clues:M.p.filter(Boolean).length}; }
function dsStatus(){ S.ds=S.ds||{done:{}}; const P=dsToday(), d=S.ds.done[P.day], cap="Easy";
  return d!=null?`Today's done · ${fmtT(d)}`:S.ds.day===P.day&&S.ds.lvl===P.lvl&&S.ds.g?`Today's puzzle · in progress`:`Today's puzzle: ${cap}`; }
function startDSudoku(){
  S.ds=S.ds||{done:{}}; const P=dsToday(), done=S.ds.done[P.day]!=null;
  const fresh=S.ds.day!==P.day||S.ds.lvl!==P.lvl||!S.ds.g||done;
  const g=fresh?P.p.slice():S.ds.g.slice(), notes=fresh?Array(DN*DN).fill(0):(S.ds.n||Array(DN*DN).fill(0)).slice();
  let errs=fresh?0:(S.ds.e||0), sel=g.findIndex(v=>!v), noting=false, won=false;
  const cap="Easy";
  begin("dsudoku",`Daily sudoku · ${cap}`); clock(); if(!fresh&&S.ds.t) GS.t0-=S.ds.t;
  __b.ds=P;
  const store=()=>{ if(won) return; S.ds.day=P.day; S.ds.lvl=P.lvl; S.ds.g=g; S.ds.n=notes; S.ds.e=errs; S.ds.t=GS?elapsed():S.ds.t; save(); };
  const peers=i=>{ const r=Math.floor(i/DN),c=i%DN,b=DBOX(i),o=[]; for(let j=0;j<DN*DN;j++) if(j!==i&&(Math.floor(j/DN)===r||j%DN===c||DBOX(j)===b)) o.push(j); return o; };
  const clash=i=>g[i]&&peers(i).some(j=>g[j]===g[i]);
  function render(){ const sv=sel>=0?g[sel]:0, pe=sel>=0?new Set(peers(sel)):new Set();
    stage.innerHTML=`<div class="ds ${won?"won":""}" id="dg">${g.map((v,i)=>{ const r=Math.floor(i/DN),c=i%DN;
      const cls=[P.p[i]?"given":"", i===sel?"sel":v&&v===sv?"same":pe.has(i)?"peer":"", clash(i)?"bad":"", r===1||r===3?"rb":"", c===2?"cb":""].filter(Boolean).join(" ");
      const inner=v?v:notes[i]?`<span class="dn">${[1,2,3,4,5,6].map(n=>`<i>${notes[i]&(1<<n)?n:""}</i>`).join("")}</span>`:"";
      return `<button data-i="${i}" class="${cls}" aria-label="Row ${r+1} column ${c+1}${v?`: ${v}`:""}">${inner}</button>`; }).join("")}</div>
      <div class="dspad" id="dp">${[1,2,3,4,5,6].map(v=>`<button data-v="${v}">${v}<small>${DN-g.filter(x=>x===v).length||""}</small></button>`).join("")}</div>
      <div class="dstools"><button id="dnote" class="btn ${noting?"go":"ghost"}" aria-pressed="${noting}">✏️ Notes ${noting?"on":"off"}</button><button id="derase" class="btn ghost">⌫ Erase</button></div>
      <div class="gsub">${won?"Solved!":`${cap} · ${P.clues} clues · ${errs?`${errs} clash${errs>1?"es":""}`:"no clashes yet"}`}</div>`;
    $('dg').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b||won) return; e.preventDefault(); sel=+b.dataset.i; render(); });
    $('dp').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b) return; e.preventDefault(); put(+b.dataset.v); });
    $('dnote').onclick=()=>{ noting=!noting; render(); };
    $('derase').onclick=()=>put(0); }
  function put(v){ if(won||sel<0||P.p[sel]) return;
    if(noting&&v){ if(g[sel]) return; notes[sel]^=(1<<v); tone(500+v*40,.05,"sine",.04); store(); return render(); }
    g[sel]=v; if(!v){ notes[sel]=0; store(); return render(); }
    notes[sel]=0; peers(sel).forEach(j=>notes[j]&=~(1<<v));
    if(clash(sel)){ errs++; bad(); } else tone(560+v*40,.07,"sine",.05);
    if(g.every((x,i)=>x===P.sol[i])){ won=true; const t=elapsed(); S.ds.done[P.day]=t; S.ds.g=null; save(); render(); good();
      const share=`Daily sudoku ${new Date().toLocaleDateString(undefined,{month:"short",day:"numeric"})} · ${cap}\n⏱️ ${fmtT(t)} · ${errs?`${errs} clash${errs>1?"es":""}`:"no clashes ✨"}`;
      later(()=>finish("dsudoku",t,{sub:`${cap} · ${errs?`${errs} clash${errs>1?"es":""}`:"no clashes"}`, share, practice:false, daily:true, nextG:"sudoku", nextLabel:"Unlimited mini sudoku"}),1000); return; }
    if(!g.includes(0)) toast("Something clashes. Look for red.");
    else if(!clash(sel)){ const nx=g.findIndex((x,i)=>i>sel&&!x); if(nx>=0) sel=nx; }
    store(); render(); }
  window._dsKey=k=>{ if(/^[1-6]$/.test(k)) put(+k); else if(k==="Backspace"||k==="Delete"||k==="0") put(0); else if(k==="n"||k==="N"){ noting=!noting; render(); }
    else if(k.startsWith("Arrow")&&sel>=0){ const d={ArrowUp:-DN,ArrowDown:DN,ArrowLeft:-1,ArrowRight:1}[k], n=sel+d; if(n>=0&&n<DN*DN) { sel=n; render(); } } };
  if(done){ toast("You solved today's puzzle. Here it is again for fun; your time is saved."); }
  render();
}

/*GEOGAMES*/
/*STRANDSGAME*/
/* ================= RESULTS ================= */
function spark(hist,hi){ if(!hist||hist.length<2) return ""; const v=hist.slice(-12).map(h=>h.v), mx=Math.max(...v), mn=Math.min(...v), sp=(mx-mn)||1;
  const pts=v.map((x,i)=>`${(i/(v.length-1)*54+1).toFixed(1)},${(hi?17-(x-mn)/sp*16:1+(x-mn)/sp*16).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 56 18" aria-hidden="true"><polyline points="${pts}"/></svg>`; }
function bigChart(hist,g){ if(!hist||hist.length<2) return ""; const v=hist.slice(-20), W=320,H=110,L=8,T=12,B=12, vals=v.map(h=>h.v), mx=Math.max(...vals), mn=Math.min(...vals), sp=(mx-mn)||1;
  const x=i=>L+i*(W-2*L)/(v.length-1), y=val=>g.hi?T+(mx-val)/sp*(H-T-B):T+(val-mn)/sp*(H-T-B);
  return `<svg class="chart2" viewBox="0 0 ${W} ${H}" role="img" aria-label="Your recent results">${`<polyline points="${v.map((h,i)=>`${x(i).toFixed(1)},${y(h.v).toFixed(1)}`).join(" ")}"/>`}${v.map((h,i)=>`<circle cx="${x(i)}" cy="${y(h.v)}" r="3.5"/>`).join("")}<text x="${L}" y="${H}">older</text><text x="${W-L}" y="${H}" text-anchor="end">latest</text></svg>`; }
let WK=null; // set when a game is part of the daily workout
function finish(game,v,o={}){
  end(); const g=GAMES[game], key=o.key||game, r=o.noRecord?{better:false,prev:S.best[key]}:record(game,v,key); if(o.noRecord){ S.plays++; studied(); save(); }
  if(WK&&game===WK){ (S.work[today()]=S.work[today()]||{})[game]=v; save(); }
  const wkDone=WORKOUT.every(x=>(S.work[today()]||{})[x]!=null), wkNext=WORKOUT.find(x=>(S.work[today()]||{})[x]==null);
  const cheer=o.archive?(game==="mini"?(o.noRecord?"Solved with help. Try one clean tomorrow!":(r.better&&r.prev!=null?`New best time! Old best: ${g.fmt(r.prev)}`:r.prev!=null?`Your best: ${g.fmt(r.prev)}`:"Nice solve!")):(v===0?"Perfect: no mistakes!":"Solved!")):r.prev==null?"First score. Now beat it!":r.better?`New best! Old best: ${g.fmt(r.prev)}`:`Your best: ${g.fmt(r.prev)}`;
  show(`${bar(g.name)}
  <section class="card center" style="--c:var(${g.col||"--"+g.cat})"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">${esc(g.name)}</div>
    <div class="big">${esc(g.fmt(v))}</div><p class="muted">${esc(o.sub||"")}</p>${o.note?`<p class="muted">${esc(o.note)}</p>`:""}<p class="cheer" style="${r.better?"":"color:var(--ink-2)"}">${esc(cheer)}</p></section>
  ${o.html||""}
  ${(S.hist[key]||[]).length>1?`<section class="card" style="--c:var(${g.col||"--"+g.cat})"><h3>Your trend</h3>${bigChart(S.hist[key],g)}<p class="muted">${g.hi?"Higher is better.":"Lower is better."} ${S.hist[key].length} games played.</p></section>`:""}
  ${WK&&wkNext?`<button class="btn go wide" data-act="wk">Workout: next is ${esc(GAMES[wkNext].name)}</button>`:""}
  ${WK&&wkDone&&game===WK?`<section class="card center"><p class="cheer">Daily workout complete!</p><p class="muted">${dayStreak()}-day streak. Come back tomorrow.</p></section>`:""}
  ${o.share?`<div class="sharerow"><button class="btn go" id="shareB">Share result</button><button class="btn" id="copyB">Copy</button></div>`:""}
  ${o.archive?`<button class="btn wide" data-act="arch">More puzzles</button>`:`<button class="btn ${WK&&wkNext?"":"go"} wide" data-act="${o.practice?"nmp":"play"}" data-g="${o.nextG||game}">${o.nextLabel||(o.practice?"Practice round":o.daily?"Practice another":"Play again")}</button>`}
  <button class="btn ghost wide" data-act="home">Home</button>`);
  if(o.share) wireShare(o.share);
  if(o.after) o.after();
  if(o.archive) setTimeout(confetti,150); else if(WK&&wkDone&&game===WK){ setTimeout(confetti,150); toast("Workout complete!"); } else if(r.better&&r.prev!=null) setTimeout(confetti,150);
  WK=null;
}

function wireShare(text){ $('shareB').onclick=()=>shareText(text,$('shareB'));
  $('copyB').onclick=async()=>{ const t=text+"\n"+location.origin+location.pathname, b=$('copyB');
    try{ await navigator.clipboard.writeText(t); b.textContent="Copied!"; good(); setTimeout(()=>{ if(b.isConnected) b.textContent="Copy"; },1800); }
    catch(e){ if(!document.querySelector(".sharetxt")) b.parentNode.insertAdjacentHTML("afterend",`<textarea class="sharetxt" readonly rows="5">${esc(t)}</textarea>`); const ta=document.querySelector(".sharetxt"); ta.focus(); ta.select(); } }; }
const SHARE_ROW=`<div class="sharerow"><button class="btn go" id="shareB">Share result</button><button class="btn" id="copyB">Copy</button></div>`;

/* ================= HOME ================= */
function bar(title,back="home"){ return `<div class="bar"><button class="x" data-act="${back}" aria-label="Back"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M13.5 4.5 7 11l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ttl">${esc(title)}</div></div>`; }
function show(html){ app.innerHTML=html; window.scrollTo(0,0); }
const LOGO='<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><path d="M13 10.5a4 4 0 0 0-4 4 3.6 3.6 0 0 0 .6 2 4 4 0 0 0 1.4 6.4 4 4 0 0 0 7 1.6V11.6a3.5 3.5 0 0 0-5-1.1Z" fill="var(--mem)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M23 10.5a4 4 0 0 1 4 4 3.6 3.6 0 0 1-.6 2 4 4 0 0 1-1.4 6.4 4 4 0 0 1-7 1.6V11.6a3.5 3.5 0 0 1 5-1.1Z" fill="var(--log)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/></svg>';
function bestOf(game){ if(game==="sudoku"){ const k=S.best["sudoku:daily"]!=null?"sudoku:daily":`sudoku:${S.sud}`; return {v:S.best[k],h:S.hist[k]}; }
  if(game==="lights"){ const k=`lights:${S.lit}`; return {v:S.best[k],h:S.hist[k]}; } return {v:S.best[game],h:S.hist[game]}; }
function home(){
  const w=S.work[today()]||{}, wdone=WORKOUT.filter(x=>w[x]!=null).length, st=dayStreak();
  show(`
  <div class="brand">${LOGO}<h1>Games</h1>
    <nav class="tabs" aria-label="Edition"><a href="../">World</a><a href="../usa/">USA</a><a href="../earth/">Earth</a><a href="../math/">Math</a><a href="./" aria-current="page">Games</a><a href="../test3/">Test 3</a></nav></div>
  <button class="workout" data-act="wk"><b>${wdone===3?"Workout done ✓":"Daily workout"}</b><span>${wdone===3?`Nice. ${st}-day streak. Replay any game below.`:"Three games, about four minutes: memory, speed, logic."}</span>
    <div class="steps3">${WORKOUT.map(x=>`<span class="${w[x]!=null?"done":""}">${GAMES[x].ic} ${x==="sudoku"?"Mini sudoku":esc(GAMES[x].name)}${w[x]!=null?` · ${esc(GAMES[x].fmt(w[x]))}`:""}</span>`).join("")}</div></button>
  ${st?`<div class="chips"><span class="chip hot">${st}-day streak</span><span class="chip">${S.plays} games played</span></div>`:""}
  ${CATS.map(([c,name,sub,col])=>`<section class="sec"><div class="sech"><h2>${name}</h2><span>${sub}</span></div><div class="games">${Object.entries(GAMES).filter(([k,g])=>g.cat===c).map(([k,g])=>{ const b=bestOf(k);
    return `<button class="game" style="--c:var(${g.col||col})" data-act="play" data-g="${k}"><span class="ic">${g.ic}</span><b>${esc(g.name)}</b><span>${esc(g.desc)}</span><span class="rec">${g.cat==="daily"?esc(k==="mini"||k==="groups"?wordStatus(k):k==="dsudoku"?dsStatus():k==="strands"?stStatus():k==="worldle"?wlStatus():k==="travle"?tvStatus():k==="globle"?gbStatus():k==="nbrs"?nbStatus():nmStatus(k))+(b.v!=null&&k!=="mini"&&k!=="groups"?` · best ${esc(g.fmt(b.v))}`:""):b.v!=null?`Best ${esc(g.fmt(b.v))}`:"Not played"}${g.cat==="daily"?"":spark(b.h,g.hi)}</span></button>`; }).join("")}</div></section>`).join("")}
  <button class="btn ghost wide" data-act="arch">Puzzle archive: every crossword and Connections puzzle</button>
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
const STARTERS={strands:()=>startStrands(),strandsu:()=>startStrands({unlimited:true}),worldle:()=>startWorldle(),worldleu:()=>startWorldle({unlimited:true}),travle:()=>startTravle(),travleu:()=>startTravle({unlimited:true}),globle:()=>startGloble(),globleu:()=>startGloble({unlimited:true}),nbrs:()=>startNeighbors(),nbrsu:()=>startNeighbors({unlimited:true}),diveu:()=>startNm("dive",{practice:true}),climbu:()=>startNm("climb",{practice:true}),dsudoku:startDSudoku,dive:o=>startNm("dive",o),climb:o=>startNm("climb",o),mini:startMini,groups:startGroups,seq:startSeq,num:startNum,match:startMatch,react:startReact,stroop:startStroop,schulte:startSchulte,count:startCount,sudoku:startSudoku,lights:startLights};
app.addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b) return; const a=b.dataset.act;
  if(a==="home") return home();
  if(a==="arch") return archive();
  if(a==="pmini") return startMini({id:+b.dataset.id});
  if(a==="pgrp") return startGroups({id:+b.dataset.id});
  if(a==="play"){ WK=null; return STARTERS[b.dataset.g](b.dataset.daily?{daily:true}:{}); }
  if(a==="wk"){ const w=S.work[today()]||{}, nx=WORKOUT.find(x=>w[x]==null); if(!nx) return; WK=nx; return STARTERS[nx](nx==="sudoku"?{daily:true}:{}); }
  if(a==="sud"){ S.sud=b.dataset.v; save(); const y=scrollY; home(); scrollTo(0,y); return; }
  if(a==="lit"){ S.lit=+b.dataset.v; save(); const y=scrollY; home(); scrollTo(0,y); return; }
  if(a==="sound"){ S.sound=!S.sound; save(); return home(); }
  if(a==="reset"){ if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to erase all Games progress"; return; } const s0=S.sound; S=FRESH(); S.sound=s0; S.nmPts=1; save(); return home(); }
});
document.addEventListener("keydown",e=>{ if(play.hidden) return; if(e.key==="Escape"){ end(); home(); return; }
  if(GS&&(GS.game==="strands"||GS.game==="strandsu")&&window._stKey&&(e.key==="Enter"||e.key==="Escape")){ e.preventDefault(); window._stKey(e.key); return; }
  if(GS&&GS.game==="dsudoku"&&window._dsKey&&!e.metaKey&&!e.ctrlKey){ if(/^[0-9nN]$/.test(e.key)||["Backspace","Delete","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){ e.preventDefault(); window._dsKey(e.key); } return; }
  if(GS&&GS.game==="mini"&&window._xwKey&&!e.metaKey&&!e.ctrlKey){ if(/^[a-z]$/i.test(e.key)||["Backspace","Tab","Enter"," ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){ e.preventDefault(); window._xwKey(e.key); } return; }
  if(GS&&GS.game==="num"&&window._numKey){ if(/^[0-9]$/.test(e.key)) window._numKey(e.key); else if(e.key==="Backspace") window._numKey("del"); else if(e.key==="Enter") window._numKey("ok"); } });
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") save(); });

/* ---------- offline + updates (shared with the other tabs) ---------- */
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) navigator.serviceWorker.register("../sw.js").catch(()=>{});
async function checkUpdate(){ if(!navigator.onLine||APP_VERSION==="dev") return;
  try{ const r=await fetch("../version.json",{cache:"no-store"}); if(!r.ok) return; const v=(await r.json()).v; if(v&&v!==APP_VERSION) $('updBtn').hidden=false; }catch(e){} }
$('updBtn').onclick=async()=>{ $('updBtn').textContent="Updating…";
  try{ const reg=await navigator.serviceWorker?.getRegistration(); await reg?.update();
    const fresh=await fetch(location.pathname+"?fresh="+Date.now(),{cache:"no-store"});
    if(fresh.ok&&window.caches){ const c=await caches.open("globetrotter-v11"); await c.put(new URL(location.pathname,location.href).href,fresh); } }catch(e){}
  location.reload(); };
setTimeout(checkUpdate,1500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"&&play.hidden) checkUpdate(); });
try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}

home();
