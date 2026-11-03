/* ================= MATH: rapid-fire mental arithmetic ================= */
const APP_VERSION="dev";
const LS="globetrotter.math.v1";
const $=id=>document.getElementById(id);
const app=$('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pick=(a,r=Math.random)=>a[Math.floor(r()*a.length)];
const shuf=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const fmtT=s=>{ s=Math.max(0,s); const m=Math.floor(s/60), r=s-m*60; return m+":"+(r<10?"0":"")+r.toFixed(1); };
const fmtS=ms=>(ms/1000).toFixed(1)+"s";

const OPS={add:{s:"+",c:"--add",name:"Addition"},sub:{s:"−",c:"--sub",name:"Subtraction"},mul:{s:"×",c:"--mul",name:"Multiplication"},div:{s:"÷",c:"--div",name:"Division"}};
const LVNAME=["","Warm-up","Easy","Medium","Hard","Brutal"];

/* ---------- saved progress ---------- */
let S={cust:{a:1,b:2}, ops:["add","sub","mul","div"], lv:2, xp:0, sprint:{}, survival:0, daily:{}, stats:{}, facts:{}, plev:{add:1,sub:1,mul:1,div:1}, days:[], sound:true, tricks:{}, rounds:0, solved:0};
try{ const raw=localStorage.getItem(LS); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
function save(){ try{ localStorage.setItem(LS,JSON.stringify(S)); }catch(e){} }

/* ---------- problems ---------- */
function R(a,b,r){ return a+Math.floor(r()*(b-a+1)); }
/* custom digits: the first and second numbers get exactly the chosen number of digits.
   For ÷ the first setting is the answer's digits and the second the divisor's, so it always divides exactly. */
const DR=[null,[2,9],[11,99],[100,999],[1000,9999]];
const dig=(d,r)=>R(DR[d][0],DR[d][1],r);
function genC(op,r){ const {a:da,b:db}=S.cust, lv=Math.min(5,Math.max(1,da+db-1));
  let a=dig(da,r), b=dig(db,r);
  if(op==="add") return mk(op,a,b,a+b,lv);
  if(op==="sub"){ if(da===db){ for(let k=0;k<50&&a===b;k++) b=dig(db,r); if(a<b) [a,b]=[b,a]; } else if(da<db) [a,b]=[b,a]; return mk(op,a,b,a-b,lv); }
  if(op==="mul") return mk(op,a,b,a*b,lv);
  return mk(op,a*b,b,a,lv); }
const custLabel=()=>{ const {a,b}=S.cust; return `${a}-digit and ${b}-digit`; };
function gen(op,lv,r=Math.random){
  if(lv==="c") return genC(op,r);
  let a,b;
  if(op==="add"||op==="sub"){
    if(lv===1){ a=R(2,9,r); b=R(2,9,r); } else if(lv===2){ a=R(11,89,r); b=R(3,9,r); } else if(lv===3){ a=R(12,89,r); b=R(12,89,r); }
    else if(lv===4){ a=R(101,899,r); b=R(12,99,r); } else { a=R(120,899,r); b=R(120,899,r); }
    if(op==="add") return mk(op,a,b,a+b,lv);
    return mk(op,a+b,b,a,lv);                 // (a+b) − b: never negative
  }
  if(lv===1){ a=R(2,9,r); b=R(2,9,r); } else if(lv===2){ a=R(3,12,r); b=R(6,12,r); } else if(lv===3){ a=R(12,99,r); b=R(3,9,r); }
  else if(lv===4){ a=R(11,25,r); b=R(11,19,r); } else { a=R(21,99,r); b=R(12,49,r); }
  if(r()<.5) [a,b]=[b,a];
  if(op==="mul") return mk(op,a,b,a*b,lv);
  return mk(op,a*b,b,a,lv);                   // exact division
}
function mk(op,a,b,ans,lv){ return {op,a,b,ans,lv,key:(op==="add"||op==="mul")?`${Math.min(a,b)}${OPS[op].s}${Math.max(a,b)}`:`${a}${OPS[op].s}${b}`}; }
const ptext=p=>`${p.a} ${OPS[p.op].s} ${p.b}`;

/* a mental shortcut for any problem: shown after a miss in practice */
function hint(p){ const h=hintRaw(p); return new RegExp(`(= |, so |[Tt]otal |: |→ )${p.ans}$`).test(h)?h:`${h} = ${p.ans}`; }
function hintRaw(p){
  const {op,a,b}=p, T=n=>Math.floor(n/10)*10, up=n=>Math.ceil(n/10)*10;
  if(op==="add"){
    if(b>=10&&b%10>=7){ const u=up(b); return `Round: ${a} + ${u} = ${a+u}, then − ${u-b}`; }
    if(a>=10&&b>=10) return `Tens first: ${a} + ${T(b)} = ${a+T(b)}, then + ${b%10}`;
    const big=Math.max(a,b), sm=Math.min(a,b), need=up(big)-big;
    if(need&&sm>need) return `Make a ten: ${big} + ${need} = ${up(big)}, then + ${sm-need}`;
    return `Count on from ${big}: + ${sm}`;
  }
  if(op==="sub"){
    if(b%10>=7&&b>=10){ const u=up(b); return `Round: ${a} − ${u} = ${a-u}, then + ${u-b}`; }
    if(b<10){ const u=a%10;
      if(a<20) return `Think addition: ${b} + ? = ${a}. ${b} + ${a-b} = ${a}`;
      if(b>u&&u>0) return `Down to a ten: ${a} − ${u} = ${T(a)}, then − ${b-u} = ${a-b}`;
      if(u===0) return `From the ten: ${a} − 10 = ${a-10}, + ${10-b} = ${a-b}`;
      return `Just the ones: ${u} − ${b} = ${u-b}, so ${a-b}`; }
    const nx=up(b); if(nx<a&&nx!==b) return `Count up from ${b}: +${nx-b} to ${nx}, +${a-nx} to ${a}. Total ${a-b}`;
    return `Tens, then ones: ${a} − ${T(b)} = ${a-T(b)}, − ${b%10} = ${a-b}`;
  }
  if(op==="mul"){
    const [s,l]=a<b?[a,b]:[b,a];
    if(s===9||l===9){ const o=s===9?l:s; return `×9 = ×10 − 1×: ${o*10} − ${o} = ${o*9}`; }
    if(s===5||l===5){ const o=s===5?l:s; return `×5 = ×10 then halve: ${o*10} ÷ 2 = ${o*5}`; }
    if(s===11||l===11){ const o=s===11?l:s; return o<10?`${o} × 11 = ${o}${o}`:`×11: ${o} × 10 + ${o} = ${o*11}`; }
    if(s===4||l===4){ const o=s===4?l:s; return `×4 = double, double: ${o} → ${o*2} → ${o*4}`; }
    if(l>=10){ const t=T(l), u=l%10; return `Split: ${s} × ${t} = ${s*t}, ${s} × ${u} = ${s*u}, total ${s*l}`; }
    if(s===l) return `Square: ${s}² = ${s*s}`;
    return `${s} × ${l} = ${s} × ${l-1} + ${s} = ${s*(l-1)} + ${s}`;
  }
  return `Think backwards: ${b} × ? = ${a}. ${b} × ${p.ans} = ${a}, so ${p.ans}`;
}

/* ---------- tricks: a short lesson plus a 10-problem drill each ---------- */
const TRICKS=[
 {id:"x5", t:"Times 5", d:"Multiply by 10, then halve.", ex:"<b>48 × 5</b> → 480 ÷ 2 = <b>240</b>",
  g:r=>{ const n=R(12,98,r); return mk("mul",n,5,n*5,2); }, h:p=>`${p.a}0 ÷ 2 = ${p.ans}`},
 {id:"x9", t:"Times 9", d:"Times 10, minus the number once.", ex:"<b>37 × 9</b> → 370 − 37 = <b>333</b>",
  g:r=>{ const n=R(12,49,r); return mk("mul",n,9,n*9,3); }, h:p=>`${p.a*10} − ${p.a} = ${p.ans}`},
 {id:"x11", t:"Times 11", d:"For a two-digit number: write the digits apart and put their sum in the middle (carry if it's 10+).", ex:"<b>54 × 11</b> → 5, then 5+4 = 9, then 4 → <b>594</b>",
  g:r=>{ const n=R(12,98,r); return mk("mul",n,11,n*11,3); }, h:p=>{ const t=Math.floor(p.a/10), u=p.a%10; return `${t} (${t}+${u}=${t+u}) ${u} → ${p.ans}`; }},
 {id:"round", t:"Add by rounding", d:"Round one number up to a ten, add, then take back the extra.", ex:"<b>46 + 38</b> → 46 + 40 = 86, − 2 = <b>84</b>",
  g:r=>{ const a=R(13,89,r), b=R(1,8,r)*10+R(7,9,r); return mk("add",a,b,a+b,3); }, h:p=>{ const u=Math.ceil(p.b/10)*10; return `${p.a} + ${u} = ${p.a+u}, − ${u-p.b} = ${p.ans}`; }},
 {id:"countup", t:"Subtract by counting up", d:"Start at the smaller number and hop up to the bigger one. Add the hops.", ex:"<b>82 − 47</b> → 47 +3 → 50 +32 → 82: <b>35</b>",
  g:r=>{ const b=R(13,69,r), a=b+R(12,39,r); return mk("sub",a,b,a-b,3); }, h:p=>{ const n=Math.ceil(p.b/10)*10; return `${p.b} +${n-p.b} → ${n} +${p.a-n} → ${p.a}: ${p.ans}`; }},
 {id:"split", t:"Split and multiply", d:"Break the bigger number into tens and ones, multiply each, add.", ex:"<b>7 × 46</b> → 7×40 = 280, 7×6 = 42 → <b>322</b>",
  g:r=>{ const a=R(3,9,r), b=R(13,98,r); return mk("mul",a,b,a*b,3); }, h:p=>{ const t=Math.floor(p.b/10)*10, u=p.b%10; return `${p.a}×${t} = ${p.a*t}, ${p.a}×${u} = ${p.a*u} → ${p.ans}`; }},
 {id:"halve", t:"Double and halve", d:"Halve one number, double the other. The answer doesn't change, and it often gets easy.", ex:"<b>25 × 16</b> → 50 × 8 → 100 × 4 = <b>400</b>",
  g:r=>{ const a=pick([25,50,15,35,45],r), b=2*R(2,12,r); return mk("mul",a,b,a*b,4); }, h:p=>`${p.a*2} × ${p.b/2} = ${p.ans}`},
 {id:"sq5", t:"Squaring numbers ending in 5", d:"Take the tens digit, multiply it by the next number up, then write 25 after it.", ex:"<b>65 × 65</b> → 6 × 7 = 42 → <b>4225</b>",
  g:r=>{ const t=R(1,9,r), n=t*10+5; return mk("mul",n,n,n*n,4); }, h:p=>{ const t=Math.floor(p.a/10); return `${t} × ${t+1} = ${t*(t+1)}, then 25 → ${p.ans}`; }},
 {id:"div5", t:"Divide by 5", d:"Double it, then divide by 10.", ex:"<b>340 ÷ 5</b> → 680 ÷ 10 = <b>68</b>",
  g:r=>{ const n=R(12,99,r); return mk("div",n*5,5,n,3); }, h:p=>`${p.a} × 2 = ${p.a*2}, ÷ 10 = ${p.ans}`},
 {id:"x4", t:"Times 4 and 8", d:"×4 is double twice. ×8 is double three times.", ex:"<b>17 × 8</b> → 34 → 68 → <b>136</b>",
  g:r=>{ const n=R(12,49,r), m=pick([4,8],r); return mk("mul",n,m,n*m,3); }, h:p=>{ let v=p.a, s=[v]; for(let k=p.b;k>1;k/=2){ v*=2; s.push(v); } return s.join(" → "); }}
];

/* ---------- ranks ---------- */
const RANKS=[["Counter",0],["Adder",40],["Quick Thinker",120],["Number Cruncher",260],["Mathlete",480],["Speed Demon",800],["Calculator",1300],["Human Calculator",2100],["Math Wizard",3300],["Legend",5000]];
function rankOf(xp){ let i=0; while(i+1<RANKS.length&&xp>=RANKS[i+1][1]) i++; const nxt=RANKS[i+1]; return {i, name:RANKS[i][0], next:nxt?nxt[0]:null, frac:nxt?(xp-RANKS[i][1])/(nxt[1]-RANKS[i][1]):1, need:nxt?nxt[1]-xp:0}; }

/* ---------- days ---------- */
const dstr=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>dstr(new Date());
function studied(){ const t=today(); if(S.days[S.days.length-1]!==t){ S.days.push(t); S.days=S.days.slice(-120); } }
function dayStreak(){ const set=new Set(S.days); let d=new Date(), n=0; if(!set.has(dstr(d))) d=new Date(Date.now()-864e5); while(set.has(dstr(d))){ n++; d=new Date(d.getTime()-864e5); } return n; }
function seeded(str){ let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; }
  return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); h^=h>>>16; return (h>>>0)/4294967296; }; }

/* ---------- sound + reinforcement ---------- */
let actx=null;
function snd(kind){ if(!S.sound) return;
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended") actx.resume();
    const t=actx.currentTime;
    if(kind==="ok"){ const out=actx.createGain(); out.gain.value=.45; out.connect(actx.destination);
      [[1,1,.7],[2.0,.45,.45],[2.76,.32,.3],[5.4,.14,.18]].forEach(([r,a,d])=>{ const os=actx.createOscillator(), gg=actx.createGain();
        os.type="sine"; os.frequency.value=1046.5*r; os.connect(gg); gg.connect(out);
        gg.gain.setValueAtTime(.0001,t); gg.gain.exponentialRampToValueAtTime(.09*a,t+.004); gg.gain.exponentialRampToValueAtTime(.0001,t+d);
        os.start(t); os.stop(t+d+.05); }); return; }
    if(kind==="tick"){ const o=actx.createOscillator(), g=actx.createGain(); o.connect(g); g.connect(actx.destination); o.type="sine"; o.frequency.value=880;
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.05,t+.005); g.gain.exponentialRampToValueAtTime(.0001,t+.08); o.start(t); o.stop(t+.1); return; }
    const o=actx.createOscillator(), g=actx.createGain(); o.connect(g); g.connect(actx.destination);
    o.type="triangle"; o.frequency.setValueAtTime(196,t); o.frequency.exponentialRampToValueAtTime(130,t+.15);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.11,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+.22); o.start(t); o.stop(t+.24);
  }catch(e){} }
function flash(bad){ const f=$('flash'); f.classList.toggle("bad",!!bad); f.classList.remove("on"); void f.offsetWidth; f.classList.add("on"); }
function toast(t){ const el=$('toast'); el.textContent=t; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti(){ if(reduceMotion) return; const box=$('confetti'); box.innerHTML="";
  const cols=["var(--good)","var(--sun)","var(--sub)","var(--hot)","var(--mul)","var(--div)"];
  for(let i=0;i<70;i++){ const e=document.createElement("i"); e.style.left=Math.random()*100+"%"; e.style.background=cols[i%cols.length];
    e.style.setProperty("--dx",(Math.random()*160-80)+"px"); e.style.setProperty("--r",(Math.random()*720-360)+"deg");
    e.style.animationDelay=Math.random()*.35+"s"; e.style.animationDuration=1.4+Math.random()*1.1+"s"; box.appendChild(e); }
  setTimeout(()=>{ box.innerHTML=""; },3200); }

/* ---------- icons ---------- */
const IC={
 back:'<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M13.5 4.5 7 11l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 logo:'<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><path d="M10 12h6M13 9v6" stroke="var(--add)" stroke-width="2.6" stroke-linecap="round"/><path d="M20 12h6" stroke="var(--sub)" stroke-width="2.6" stroke-linecap="round"/><path d="m10.5 21.5 5 5M15.5 21.5l-5 5" stroke="var(--mul)" stroke-width="2.6" stroke-linecap="round"/><path d="M20 24h6" stroke="var(--div)" stroke-width="2.6" stroke-linecap="round"/><circle cx="23" cy="20.6" r="1.5" fill="var(--div)"/><circle cx="23" cy="27.4" r="1.5" fill="var(--div)"/></svg>'
};
function bar(title,back="home"){ return `<div class="bar"><button class="x" data-act="${back}" aria-label="Back">${IC.back}</button><div class="ttl">${esc(title)}</div></div>`; }
function show(html){ app.innerHTML=html; window.scrollTo(0,0); }

/* ================= HOME ================= */
function home(){
  const rk=rankOf(S.xp), st=dayStreak(), td=S.daily[today()];
  const skey=sprintKey(), sb=S.sprint[skey];
  const sample=S.ops.map(o=>{ const p=gen(o,S.lv); return `<span style="color:var(${OPS[o].c})">${ptext(p)}</span>`; }).join(" · ");
  show(`
  <div class="brand">${IC.logo}<h1>Math</h1>
    <nav class="tabs" aria-label="Edition"><a href="../">World</a><a href="../usa/">USA</a><a href="../earth/">Earth</a><a href="./" aria-current="page">Math</a></nav></div>
  <section class="rank"><div class="badge">${rk.i+1}</div><b>${esc(rk.name)}</b>
    <div class="xpbar"><i style="width:${Math.max(3,rk.frac*100)}%"></i></div>
    <div class="sub">${rk.next?`${rk.need} XP to ${esc(rk.next)}`:"Top rank reached"} · ${S.solved} solved</div></section>
  ${st||td?`<div class="chips">${st?`<span class="chip hot">${st}-day streak</span>`:""}${td?`<span class="chip">Daily 20 done: ${fmtT(td.t/1000)}</span>`:""}</div>`:""}
  <section class="card"><h3>Your mix</h3>
    <div class="ops" role="group" aria-label="Operations">${Object.entries(OPS).map(([k,o])=>`<button class="op" style="--c:var(${o.c})" data-act="op" data-o="${k}" aria-pressed="${S.ops.includes(k)}" aria-label="${o.name}">${o.s}</button>`).join("")}</div>
    <div class="lvls" role="group" aria-label="Level">${[1,2,3,4,5].map(l=>`<button class="lv" data-act="lv" data-l="${l}" aria-pressed="${S.lv===l}">${l}</button>`).join("")}<button class="lv dg" data-act="lv" data-l="c" aria-pressed="${S.lv==="c"}">Digits</button></div>
    ${S.lv==="c"?`<div class="digits">${["a","b"].map(w=>`<div class="dgrow"><span>${w==="a"?"First number":"Second number"}</span><div class="dgs" role="group" aria-label="${w==="a"?"First":"Second"} number digits">${[1,2,3,4].map(d=>`<button data-act="dig" data-w="${w}" data-d="${d}" aria-pressed="${S.cust[w]===d}">${d}</button>`).join("")}</div></div>`).join("")}<p class="muted" style="font-size:12px">For ÷ the first number is the answer, so it always divides exactly.</p></div>`:""}
    <div class="eg">${S.lv==="c"?`Custom, ${custLabel()}`:`Level ${S.lv}, ${LVNAME[S.lv]}`}: ${sample}</div></section>
  <button class="mode" style="--cc:var(--mul)" data-act="sprint"><b>60-second sprint</b><span>As many as you can. Speed and streaks score more.</span><i>${sb?`Best ${sb}`:"Go"}</i></button>
  <button class="mode" style="--cc:var(--hot)" data-act="survival"><b>Survival</b><span>3 lives. It gets harder and faster.</span><i>${S.survival?`Best ${S.survival}`:"Go"}</i></button>
  <button class="mode" style="--cc:var(--sub)" data-act="daily"><b>Daily 20</b><span>Same 20 for everyone today. Wrong answers add 5 seconds.</span><i>${td?fmtT(td.t/1000):"New"}</i></button>
  <button class="mode" style="--cc:var(--add)" data-act="practice"><b>Practice</b><span>No clock. Levels adjust to you, with a shortcut when you miss.</span><i>20 Qs</i></button>
  <div class="duo">
    <button class="tile" data-act="tricks"><b>Mental math tricks</b><span>10 shortcuts, each with a quick drill</span><span class="ex" style="--c:var(--mul)">48 × 5 = 480 ÷ 2</span></button>
    <button class="tile" data-act="stats"><b>Your stats</b><span>Speed by operation and your toughest facts</span><span class="ex" style="--c:var(--hot)">${toughFacts().length?`${toughFacts().length} facts to fix`:"Play to fill"}</span></button>
  </div>
  <div class="foot">
    <div>Progress saves on this device</div>
    <div class="row" style="justify-content:center"><button class="btn ghost small" data-act="sound">Sounds ${S.sound?"on":"off"}</button><button class="btn ghost small" data-act="reset">Start over</button></div>
    <div>Version ${esc(APP_VERSION)}</div>
  </div>`);
}
const sprintKey=()=>S.ops.slice().sort().join(",")+"|"+(S.lv==="c"?`d${S.cust.a}x${S.cust.b}`:S.lv);

/* ================= TRICKS ================= */
function tricks(){
  show(`${bar("Mental math tricks")}
  <p class="muted">Read the trick, then drill it: 10 problems with the shortcut shown. Use it until it's automatic.</p>
  ${TRICKS.map(t=>{ const b=S.tricks[t.id]; return `<button class="trick" data-act="trick" data-id="${t.id}"><b>${esc(t.t)}</b><p>${esc(t.d)}</p><div class="ex">${t.ex}</div><span class="best">${b?`Best: ${b.r}/10 in ${fmtT(b.t/1000)}`:"Tap to drill"}</span></button>`; }).join("")}`);
}

/* ================= STATS ================= */
function toughFacts(){ return Object.entries(S.facts).filter(([k,f])=>f.n>=2&&(f.m>0||f.t/Math.max(1,f.n-f.m)>5000))
  .map(([k,f])=>({k, f, score:f.m/f.n*2+Math.min(3,(f.t/Math.max(1,f.n-f.m))/4000)})).sort((a,b)=>b.score-a.score).slice(0,12); }
function stats(){
  const tf=toughFacts();
  show(`${bar("Your stats")}
  <section class="card"><h3>By operation</h3>${Object.entries(OPS).map(([k,o])=>{ const s=S.stats[k]; if(!s||!(s.r+s.w)) return `<div class="statrow" style="--c:var(${o.c})"><span class="o">${o.s}</span><span>${o.name}</span><em>not played</em><b></b></div>`;
    const acc=s.r/(s.r+s.w), avg=s.r?s.t/s.r:0; return `<div class="statrow" style="--c:var(${o.c})"><span class="o">${o.s}</span><span>${o.name}</span><em>${Math.round(acc*100)}%</em><b>${fmtS(avg)}</b><div class="bar2"><i style="width:${Math.max(4,Math.min(100,100*2500/Math.max(avg,1)))}%"></i></div></div>`; }).join("")}
    <p class="muted">Accuracy and average time per correct answer. The bar fills as you get faster.</p></section>
  <section class="card"><h3>Toughest facts</h3>${tf.length?`<div class="facts">${tf.map(x=>`<span class="fact">${esc(x.k.replace(/([+−×÷])/," $1 "))}</span>`).join("")}</div><button class="btn go wide" data-act="facts">Drill these</button>`:`<p class="muted">Facts you miss or answer slowly show up here.</p>`}</section>
  <section class="card"><h3>Records</h3><div class="kv"><div><b>${Math.max(0,...Object.values(S.sprint))||"–"}</b><span>best sprint</span></div><div><b>${S.survival||"–"}</b><span>survival</span></div><div><b>${(()=>{ const v=Object.values(S.daily).map(d=>d.t); return v.length?fmtT(Math.min(...v)/1000):"–"; })()}</b><span>fastest daily</span></div></div>
  <p class="muted">${S.rounds} rounds played · ${S.solved} problems solved · ${S.xp} XP</p></section>`);
}

/* ================= THE GAME ================= */
let G=null, raf=0;
const play=$('play');
function start(mode,opt={}){
  const ops=S.ops.length?S.ops:["add"];
  G={mode, ops, lv:S.lv, i:0, score:0, right:0, wrong:0, combo:0, maxCombo:0, log:[], typed:"", lock:false, hearts:3, penalty:0, list:null, retype:false, opt};
  if(mode==="daily"){ const r=seeded("math-daily-"+today()); G.list=[...Array(20)].map((_,k)=>gen(pick(["add","sub","mul","div"],r),k<5?1:k<10?2:k<16?3:4,r)); }
  if(mode==="trick"){ const t=TRICKS.find(x=>x.id===opt.id); G.trick=t; G.list=[...Array(10)].map(()=>t.g(Math.random)); }
  if(mode==="facts"){ const tf=toughFacts().map(x=>x.k); G.list=shuf([...tf,...tf]).slice(0,20).map(parseFact).filter(Boolean); if(!G.list.length) return home(); }
  if(mode==="practice") G.total=20;
  document.body.classList.add("playing"); play.hidden=false;
  $('hearts').hidden=mode!=="survival"; $('score').hidden=mode==="practice"||mode==="trick"||mode==="facts";
  $('clock').textContent=""; $('reveal').innerHTML=""; $('pts').classList.remove("on"); $('toast').classList.remove("on"); renderHearts(); $('score').textContent="0"; setCombo();
  const timed=mode==="sprint"||mode==="survival"||mode==="daily";
  if(timed) countdown(()=>{ G.t0=performance.now(); next(); loop(); }); else { G.t0=performance.now(); next(); loop(); }
}
function parseFact(k){ const m=k.match(/^(\d+)([+−×÷])(\d+)$/); if(!m) return null; const a=+m[1], b=+m[3], op=Object.keys(OPS).find(o=>OPS[o].s===m[2]);
  const flip=(op==="add"||op==="mul")&&Math.random()<.5; const [x,y]=flip?[b,a]:[a,b];
  const ans=op==="add"?x+y:op==="sub"?x-y:op==="mul"?x*y:x/y; return {...mk(op,x,y,ans,1), key:k}; }
function countdown(done){ const cd=$('cd'); cd.hidden=false; let n=3; cd.textContent=n; snd("tick");
  const iv=setInterval(()=>{ n--; if(n===0){ clearInterval(iv); cd.hidden=true; done(); } else { cd.textContent=n; snd("tick"); } },650); G.cdiv=iv; }
function pickProblem(){
  if(G.list) return G.list[G.i];
  if(G.mode==="survival"){ const lv=Math.min(5,1+Math.floor(G.right/6)); G.lv=lv; return gen(pick(G.ops),lv); }
  if(G.mode==="practice"){ const op=pick(G.ops); return gen(op,S.lv==="c"?"c":S.plev[op]||1); }
  return gen(pick(G.ops),G.lv);
}
function next(){
  if(!G) return;
  if(G.list&&G.i>=G.list.length) return finish();
  if(G.mode==="practice"&&G.i>=G.total) return finish();
  let p=pickProblem(); if(G.p&&p.key===G.p.key&&!G.list) p=pickProblem();
  G.p=p; G.typed=""; G.lock=false; G.retype=false; G.qStart=performance.now();
  if(G.mode==="survival") G.limit=Math.max(3500,9000-G.right*140);
  $('prob').innerHTML=`${p.a}<span class="o" style="--c:var(${OPS[p.op].c})">${OPS[p.op].s}</span>${p.b}`;
  $('lvtag').textContent=G.mode==="practice"?`${OPS[p.op].name} · ${S.lv==="c"?`${S.cust.a}-digit, ${S.cust.b}-digit`:`level ${S.plev[p.op]}`}`:G.mode==="trick"?G.trick.t:G.mode==="facts"?"Toughest facts":G.mode==="daily"?`${G.i+1} of 20`:G.mode==="survival"?`Level ${G.lv}`:G.lv==="c"?`${S.cust.a}-digit, ${S.cust.b}-digit`:`Level ${G.lv}`;
  $('reveal').innerHTML=G.mode==="trick"?`<span class="hint">${esc(G.trick.h(p))}</span>`:"";
  if(G.mode==="trick") $('reveal').querySelector(".hint").style.opacity=".55";
  drawAns();
}
function drawAns(state){ const a=$('ans'); a.className="ans"+(state?" "+state:""); a.innerHTML=esc(G.typed)+(state?"":'<span class="caret"></span>'); }
function key(k){
  if(!G||G.lock||!G.p||!$('cd').hidden) return;
  if(k==="del"){ G.typed=G.typed.slice(0,-1); return drawAns(); }
  if(k==="skip") return miss(true);
  if(G.typed.length>=9) return;
  G.typed+=k; drawAns();
  const want=String(G.p.ans);
  if(G.typed.length>=want.length){ if(G.typed===want) hit(); else miss(false); }
}
function hit(){
  const p=G.p, ms=performance.now()-G.qStart;
  if(G.retype){ G.lock=true; drawAns("ok"); snd("ok"); G.i++; setTimeout(next,260); return; }
  G.lock=true; G.right++; G.combo++; G.maxCombo=Math.max(G.maxCombo,G.combo); S.solved++;
  const mult=Math.min(5,1+Math.floor(G.combo/5)), pts=Math.round((10*p.lv+Math.max(0,Math.round((4000-ms)/200)))*mult);
  G.score+=pts; S.xp+=p.lv+(G.combo>=10?1:0);
  G.log.push({p,ok:true,ms}); stat(p,true,ms);
  drawAns("ok"); flash(); snd("ok"); setCombo(true);
  if(G.mode==="sprint"||G.mode==="survival"){ const el=$('pts'); el.textContent="+"+pts; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
  $('score').textContent=G.mode==="survival"?G.right:G.score;
  if([10,25,50,75,100].includes(G.combo)) toast(`${G.combo} in a row!`);
  if(G.mode==="practice"&&S.lv!=="c") adapt(p.op,true,ms);
  G.i++; setTimeout(next,G.mode==="sprint"||G.mode==="survival"?140:260);
}
function miss(skipped){
  const p=G.p, ms=performance.now()-G.qStart;
  if(G.retype){ if(!skipped){ G.typed=""; drawAns("no"); setTimeout(()=>drawAns(),400); } return; }
  G.lock=true; G.wrong++; G.combo=0; setCombo();
  G.log.push({p,ok:false,ms,typed:skipped?"skipped":G.typed}); stat(p,false,ms);
  flash(true); snd("no"); drawAns("no");
  const learn=G.mode==="practice"||G.mode==="trick"||G.mode==="facts";
  $('reveal').innerHTML=`<b>${ptext(p)} = ${p.ans}</b>${learn?`<span class="hint">${esc(G.mode==="trick"?G.trick.h(p):hint(p))}</span>`:""}`;
  if(G.mode==="practice"&&S.lv!=="c") adapt(p.op,false,ms);
  if(G.mode==="survival"){ G.hearts--; renderHearts(); if(G.hearts<=0) return setTimeout(finish,900); }
  if(G.mode==="daily") G.penalty+=5000;
  if(learn){ setTimeout(()=>{ if(!G) return; G.retype=true; G.typed=""; G.lock=false; drawAns(); $('lvtag').textContent="Type the answer to continue"; },700); return; }
  G.i++; setTimeout(next,G.mode==="sprint"?650:1000);
}
function setCombo(bump){ const c=$('combo'); if(!G||G.combo<3){ c.className="combo"; return; } const m=Math.min(5,1+Math.floor(G.combo/5));
  c.textContent=`${G.combo} streak${m>1?` · ×${m}`:""}`; c.className="combo on"+(bump?" bump":""); }
function renderHearts(){ $('hearts').innerHTML=[0,1,2].map(i=>`<span class="${G&&i<G.hearts?"":"off"}">♥</span>`).join(""); }
function stat(p,ok,ms){ const s=S.stats[p.op]||(S.stats[p.op]={r:0,w:0,t:0}); ok?(s.r++,s.t+=Math.min(ms,20000)):s.w++;
  const f=S.facts[p.key]||(S.facts[p.key]={n:0,m:0,t:0,l:0}); f.n++; if(!ok) f.m++; else f.t+=Math.min(ms,20000); f.l=Date.now();
  if(ok&&f.n>=6&&f.m>0&&p.lv<=2){ const recent=G.log.filter(x=>x.p.key===p.key).slice(-3); if(recent.length>=3&&recent.every(x=>x.ok)) f.m=Math.max(0,f.m-1); }
  const keys=Object.keys(S.facts); if(keys.length>500){ keys.sort((a,b)=>S.facts[a].l-S.facts[b].l).slice(0,keys.length-450).forEach(k=>delete S.facts[k]); }
  studied(); }
/* practice adjusts each operation's level: fast and right moves up, misses move down */
function adapt(op,ok,ms){ G.ad=G.ad||{}; const a=G.ad[op]||(G.ad[op]=[]); a.push({ok,ms}); const lv=S.plev[op]||1;
  const last=a.slice(-5);
  if(last.length===5&&last.every(x=>x.ok)&&last.reduce((s,x)=>s+x.ms,0)/5<4500&&lv<5){ S.plev[op]=lv+1; G.ad[op]=[]; toast(`${OPS[op].name}: level ${lv+1}!`); }
  else if(!ok&&a.slice(-3).filter(x=>!x.ok).length>=2&&lv>1){ S.plev[op]=lv-1; G.ad[op]=[]; } }
function loop(){
  cancelAnimationFrame(raf);
  const step=()=>{ if(!G||play.hidden) return; const now=performance.now();
    if(G.mode==="sprint"){ const left=60000-(now-G.t0); $('meter').style.transform=`scaleX(${Math.max(0,left/60000)})`; $('meter').classList.toggle("low",left<10000); $('clock').textContent=Math.ceil(Math.max(0,left)/1000);
      if(left<=0) return finish(); }
    else if(G.mode==="survival"){ if(!G.lock&&G.qStart){ const left=G.limit-(now-G.qStart); $('meter').style.transform=`scaleX(${Math.max(0,left/G.limit)})`; $('meter').classList.toggle("low",left<G.limit*.3);
        if(left<=0){ $('reveal').innerHTML=""; miss(true); $('reveal').insertAdjacentHTML("afterbegin","<b>Time!</b> "); } } $('clock').textContent=""; }
    else if(G.mode==="daily"){ $('meter').style.transform=`scaleX(${G.i/20})`; $('meter').classList.remove("low"); $('clock').textContent=fmtT((now-G.t0+G.penalty)/1000); }
    else { const tot=G.list?G.list.length:G.total; $('meter').style.transform=`scaleX(${G.i/tot})`; $('meter').classList.remove("low"); $('clock').textContent=""; }
    raf=requestAnimationFrame(step); };
  raf=requestAnimationFrame(step);
}
function stopGame(){ cancelAnimationFrame(raf); if(G&&G.cdiv) clearInterval(G.cdiv); play.hidden=true; document.body.classList.remove("playing"); }
function quit(){ const g=G; stopGame(); G=null; if(g&&g.right+g.wrong>0){ S.rounds++; } save(); home(); }

/* ================= RESULTS ================= */
const MODE_NAME={sprint:"60-second sprint", survival:"Survival", daily:"Daily 20", practice:"Practice", trick:"Trick drill", facts:"Toughest facts"};
function finish(){
  if(!G) return; const g=G; stopGame(); G=null; S.rounds++;
  const n=g.right+g.wrong, acc=n?g.right/n:0, okMs=g.log.filter(x=>x.ok).map(x=>x.ms), avg=okMs.length?okMs.reduce((a,b)=>a+b,0)/okMs.length:0;
  let big="", sub="", best=false, cheer="";
  if(g.mode==="sprint"){ const k=sprintKey(), prev=S.sprint[k]||0; big=g.score; sub=`points · ${g.right} right`; if(g.score>prev&&g.right){ S.sprint[k]=g.score; best=prev>0; cheer=prev?`New best! Old best was ${prev}.`:"First score on this mix. Now beat it!"; } else if(prev) cheer=`Best on this mix: ${prev}`; }
  else if(g.mode==="survival"){ const prev=S.survival; big=g.right; sub=`survived · reached level ${g.lv}`; if(g.right>prev){ S.survival=g.right; best=prev>0; cheer=prev?`New best! Old best was ${prev}.`:"Now beat it!"; } else cheer=`Best: ${prev}`; }
  else if(g.mode==="daily"){ const t=Math.round(performance.now()-g.t0+g.penalty); const prev=S.daily[today()]; big=fmtT(t/1000); sub=`${g.right}/20 right${g.wrong?` · +${g.wrong*5}s penalty`:""}`;
    if(!prev||t<prev.t){ S.daily[today()]={t,wrong:g.wrong}; best=!!prev; cheer=prev?`Faster than your earlier ${fmtT(prev.t/1000)}!`:"Come back tomorrow for a new 20."; } else cheer=`Your best today: ${fmtT(prev.t/1000)}`; }
  else if(g.mode==="trick"){ const t=Math.round(performance.now()-g.t0), prev=S.tricks[g.trick.id]; big=`${g.right}/10`; sub=`${g.trick.t} · ${fmtT(t/1000)}`;
    if(!prev||g.right>prev.r||(g.right===prev.r&&t<prev.t)){ S.tricks[g.trick.id]={r:g.right,t}; best=!!prev; } }
  else { big=`${g.right}/${n}`; sub=g.mode==="practice"?(S.lv==="c"?`custom: ${custLabel()}`:`levels now: ${Object.keys(OPS).filter(o=>g.ops.includes(o)).map(o=>`${OPS[o].s} ${S.plev[o]}`).join(" · ")}`):"toughest facts"; }
  if(acc===1&&n>=10) cheer=cheer||"Perfect round!";
  save();
  const misses=g.log.filter(x=>!x.ok);
  const byOp={}; g.log.forEach(x=>{ const b=byOp[x.p.op]||(byOp[x.p.op]={r:0,n:0,t:0}); b.n++; if(x.ok){ b.r++; b.t+=x.ms; } });
  const again={sprint:"sprint",survival:"survival",daily:"home",practice:"practice",trick:"trick",facts:"facts"}[g.mode];
  show(`${bar(MODE_NAME[g.mode])}
  <section class="card center"><div class="big">${esc(big)}</div><p class="muted">${esc(sub)}</p>${cheer?`<p class="cheer">${esc(cheer)}</p>`:""}</section>
  <div class="kv"><div><b>${Math.round(acc*100)}%</b><span>accuracy</span></div><div><b>${avg?fmtS(avg):"–"}</b><span>avg per answer</span></div><div><b>${g.maxCombo}</b><span>best streak</span></div></div>
  ${Object.keys(byOp).length>1?`<section class="card"><h3>By operation</h3>${Object.entries(byOp).map(([k,b])=>`<div class="statrow" style="--c:var(${OPS[k].c})"><span class="o">${OPS[k].s}</span><span>${b.r}/${b.n} right</span><em>${b.r?fmtS(b.t/b.r):"–"}</em><b></b></div>`).join("")}</section>`:""}
  ${misses.length?`<section class="card"><h3>Missed</h3><div class="miss">${misses.slice(0,12).map(x=>`<div><span>${ptext(x.p)} = <b>${x.p.ans}</b></span><span class="y">${esc(x.typed||"")}</span><small>${esc(hint(x.p))}</small></div>`).join("")}</div></section>`:""}
  ${g.mode==="daily"?"":`<button class="btn go wide" data-act="${again}" ${g.mode==="trick"?`data-id="${g.trick.id}"`:""}>Play again</button>`}
  <button class="btn ghost wide" data-act="home">Home</button>`);
  if((best||(acc===1&&n>=10))) setTimeout(confetti,120);
}

/* ================= wiring ================= */
$('pad').innerHTML=["1","2","3","4","5","6","7","8","9","del","0","skip"].map(k=>`<button data-k="${k}" class="${k.length>1?"fn":""}" aria-label="${k==="del"?"Delete":k==="skip"?"Skip":k}">${k==="del"?"⌫":k==="skip"?"Skip":k}</button>`).join("");
$('pad').addEventListener("pointerdown",e=>{ const b=e.target.closest("button"); if(!b) return; e.preventDefault(); b.classList.add("down"); setTimeout(()=>b.classList.remove("down"),90); key(b.dataset.k); });
$('pquit').onclick=quit;
document.addEventListener("keydown",e=>{ if(play.hidden) return; if(/^[0-9]$/.test(e.key)) key(e.key); else if(e.key==="Backspace") key("del"); else if(e.key==="Enter") key("skip"); else if(e.key==="Escape") quit(); });
app.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b) return; const a=b.dataset.act;
  switch(a){
    case "home": return home();
    case "op": { const o=b.dataset.o; S.ops=S.ops.includes(o)?S.ops.filter(x=>x!==o):[...S.ops,o]; if(!S.ops.length) S.ops=[o]; save(); const y=scrollY; home(); scrollTo(0,y); return; }
    case "dig": S.cust[b.dataset.w]=+b.dataset.d; save(); { const y=scrollY; home(); scrollTo(0,y); } return;
    case "lv": S.lv=b.dataset.l==="c"?"c":+b.dataset.l; save(); { const y=scrollY; home(); scrollTo(0,y); } return;
    case "sprint": case "survival": case "daily": case "practice": case "facts": return start(a);
    case "trick": return start("trick",{id:b.dataset.id});
    case "tricks": return tricks();
    case "stats": return stats();
    case "sound": S.sound=!S.sound; save(); return home();
    case "reset": if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to erase all Math progress"; return; }
      S={cust:{a:1,b:2}, ops:["add","sub","mul","div"], lv:2, xp:0, sprint:{}, survival:0, daily:{}, stats:{}, facts:{}, plev:{add:1,sub:1,mul:1,div:1}, days:[], sound:S.sound, tricks:{}, rounds:0, solved:0}; save(); return home();
  }
});
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") save(); });

/* ---------- offline + updates (shared with the map editions) ---------- */
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) navigator.serviceWorker.register("../sw.js").catch(()=>{});
async function checkUpdate(){ if(!navigator.onLine||APP_VERSION==="dev") return;
  try{ const r=await fetch("../version.json",{cache:"no-store"}); if(!r.ok) return; const v=(await r.json()).v; if(v&&v!==APP_VERSION) $('updBtn').hidden=false; }catch(e){} }
$('updBtn').onclick=async()=>{ $('updBtn').textContent="Updating…";
  try{ const reg=await navigator.serviceWorker?.getRegistration(); await reg?.update();
    const fresh=await fetch(location.pathname+"?fresh="+Date.now(),{cache:"no-store"});
    if(fresh.ok&&window.caches){ const c=await caches.open("globetrotter-v6"); await c.put(new URL(location.pathname,location.href).href,fresh); } }catch(e){}
  location.reload(); };
setTimeout(checkUpdate,1500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"&&play.hidden) checkUpdate(); });
try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}

home();
