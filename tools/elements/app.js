/* ================= ELEMENTS: learn the periodic table the way the geography tabs teach the map =================
   Home is a trail of lessons, row by row. A lesson shows each new element on the table with a memory hook and a
   silly sentence for the symbols, then quizzes: tap it on the table, name the glowing cell, pick the symbol.
   Every answer feeds a spaced-repetition schedule; Review brings back what's due. Name them all and In order
   are the full-recall drills, and the Daily 10 is the same ten questions for everyone each day. */
const APP_VERSION="dev";
const LS="globetrotter.elements.v1";
const $=id=>document.getElementById(id);
const app=$('app'), play=$('play'), ptab=$('ptable'), panel=$('panel');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shuffle=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
/*DATA*/
const Z=range(1,118), SYM=z=>ELS[z-1][0], NAME=z=>ELS[z-1][1];
const lessonTitle=l=>`${NAME(l.z[0])} to ${NAME(l.z[l.z.length-1])}`;

/* ---------- saved progress ---------- */
const FRESH=()=>({el:{}, done:{}, daily:{}, best:{}, days:[], sound:true, color:"fam", tips:false, wq:true, big:false});
let S=FRESH();
try{ const raw=localStorage.getItem(LS); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
function save(){ try{ localStorage.setItem(LS,JSON.stringify(S)); }catch(e){} }
if(S.wq==null) S.wq=true;
const WT=z=>ELS[z-1][2];
if(!S.v2){ S.v2=1; for(const l of LESSONS) if(!S.done[l.id]&&l.z.every(z=>S.el[z]&&S.el[z].n>0)) S.done[l.id]=2; save(); }
const dstr=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const today=()=>dstr(new Date());
const dayNo=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
function practiced(){ const t=today(); if(!S.days.includes(t)){ S.days.push(t); S.days=S.days.slice(-120); } }
function streak(){ let n=0, d=new Date(); if(!S.days.includes(dstr(d))) d=new Date(Date.now()-864e5); while(S.days.includes(dstr(d))){ n++; d=new Date(d.getTime()-864e5); } return n; }

/* spaced repetition: strength 0-5; each right answer pushes the next review further out */
const GAP=[0,1,2,4,8,16];
const E=z=>S.el[z]||(S.el[z]={s:0,due:0,n:0,r:0});
const learned=z=>!!S.el[z]&&S.el[z].n>0;
// strength only climbs once a day, so "mastered" means remembered on four separate days
function mark(z,ok){ const e=E(z), d=dayNo(); e.n++; if(ok){ e.r++; if(e.day!==d){ e.s=Math.min(5,e.s+1); e.day=d; } else e.s=Math.max(e.s,1); } else e.s=Math.max(0,e.s-2); e.due=d+(ok?GAP[e.s]:0); }
const dueList=()=>Z.filter(z=>learned(z)&&E(z).due<=dayNo());
const nLearned=()=>Z.filter(learned).length, nMastered=()=>Z.filter(z=>learned(z)&&E(z).s>=4).length;

/* ---------- sound (the tab bar adds a haptic tap to every sound) ---------- */
let AC=null;
function ac(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume(); }catch(e){ AC=null; } return AC; }
function tone(f,t0,d,v,type){ const a=AC, o=a.createOscillator(), g=a.createGain(); o.type=type||"sine"; o.frequency.value=f; g.gain.setValueAtTime(0,a.currentTime+t0); g.gain.linearRampToValueAtTime(v,a.currentTime+t0+.01); g.gain.exponentialRampToValueAtTime(.001,a.currentTime+t0+d); o.connect(g).connect(a.destination); o.start(a.currentTime+t0); o.stop(a.currentTime+t0+d+.02); }
function snd(k){ if(!S.sound||!ac()) return;
  if(k==="ok"){ tone(660,0,.12,.18); tone(990,.07,.16,.16); }
  else if(k==="no"){ tone(200,0,.22,.2,"triangle"); }
  else if(k==="done"){ [523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.22,.15)); }
  else if(k==="pop"){ tone(880,0,.07,.1); } }

/* ================= the table ================= */
// one cell per element on an 18-column grid; rows 9 and 10 hold the lanthanides and actinides
function tableHTML(o={}){ let h=`<div class="pt ${o.cls||""}" style="${o.style||""}">`;
  for(const z of Z){ const [c,r]=cellOf(z); h+=`<button class="el f-${famOf(z)}" data-z="${z}" style="grid-column:${c};grid-row:${r}" tabindex="-1" aria-label="${esc(NAME(z))}"><small>${z}</small><b>${SYM(z)}</b><i class="w">${WT(z)}</i></button>`; }
  h+=`<span class="ph f-lan" style="grid-column:3;grid-row:6">57–71</span><span class="ph f-act" style="grid-column:3;grid-row:7">89–103</span><span class="gap" style="grid-row:8"></span>`;
  return h+`</div>`; }
const cellEl=(root,z)=>root.querySelector(`.el[data-z="${z}"]`);
// paint a table: which cells are in play, what they show, and how they're colored
function paint(root,o={}){ const pt=root.querySelector(".pt"); if(!pt) return;
  pt.classList.toggle("mastery",o.color==="mastery"); pt.classList.toggle("plain",o.color==="plain");
  for(const b of pt.querySelectorAll(".el")){ const z=+b.dataset.z;
    b.classList.toggle("dim",!!o.scope&&!o.scope.has(z));
    b.classList.toggle("blank",!!o.blank&&(o.blank===true||o.blank.has(z)));
    b.classList.toggle("hl",o.hl===z||!!(o.hlSet&&o.hlSet.has(z)));
    b.classList.toggle("cur",o.cur===z);
    b.classList.remove("ok","bad","pick");
    if(o.color==="mastery"){ const e=S.el[z]; b.dataset.m=!e||!e.n?0:e.s>=4?3:e.s>=2?2:1; } } }
function flash(root,z,cls,ms=900){ const b=cellEl(root,z); if(!b) return; b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); if(ms) setTimeout(()=>b.classList.remove(cls),ms); }
// the nearest cell to a tap, so the 2px gaps never swallow it
function cellAt(root,x,y){ let best=null, bd=1e9; for(const b of root.querySelectorAll(".el:not(.dim)")){ const r=b.getBoundingClientRect(), dx=Math.max(r.left-x,0,x-r.right), dy=Math.max(r.top-y,0,y-r.bottom), d=dx*dx+dy*dy; if(d<bd){ bd=d; best=b; } }
  return bd<=196?+best.dataset.z:null; }
function tile(z,big){ const f=famOf(z); return `<div class="etile f-${f} ${big?"big":""}"><small>${z}</small><b>${SYM(z)}</b><span>${esc(NAME(z))}</span><em>${esc(ELS[z-1][2])}</em></div>`; }
const where=z=>{ const g=groupOf(z), p=periodOf(z); return g?`Row ${p} · group ${g}`:`${famOf(z)==="lan"?"Lanthanide row":"Actinide row"} (row ${p})`; };

/* ================= sessions: lessons, review, daily ================= */
let SES=null;
const norm=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z]/g,"");
const ALT={aluminium:13,sulphur:16,caesium:55};
function nameToZ(t){ const n=norm(t); if(!n) return null; if(ALT[n]) return ALT[n]; const z=Z.find(z=>norm(NAME(z))===n); return z||null; }
function lev(a,b){ const m=a.length, n=b.length, d=Array.from({length:m+1},(_,i)=>[i]); for(let j=1;j<=n;j++) d[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[m][n]; }
const closeEnough=(t,z)=>{ const a=norm(t), b=norm(NAME(z)); return a===b||ALT[a]===z||(b.length>=6&&lev(a,b)<=1); };
// wrong answers that teach something: neighbors on the table, look-alike symbols, lesson-mates
function distract(z,pool,kind){ const [c,r]=cellOf(z), out=new Set();
  const near=Z.filter(y=>y!==z&&Math.abs(cellOf(y)[0]-c)+Math.abs(cellOf(y)[1]-r)<=2);
  const look=Z.filter(y=>y!==z&&SYM(y)[0]===SYM(z)[0]);
  const cand=kind==="sym"?shuffle(look).concat(shuffle(near)):shuffle(near).concat(shuffle(pool||[]));
  for(const y of cand.concat(shuffle(Z))){ if(y!==z) out.add(y); if(out.size>=3) break; }
  return shuffle([z,...out]); }
// wrong numbers that are easy to confuse: one off, and the element directly above or below
function numOpts(z){ const c=[z-1,z+1,z-8,z+8,z-18,z+18,z-32,z+32,z+2,z-2].filter(n=>n>=1&&n<=118&&n!==z), out=new Set();
  for(const n of shuffle(c.slice(0,4)).concat(shuffle(c.slice(4)))){ out.add(n); if(out.size>=3) break; } return shuffle([z,...out]); }
function startSession(o){ SES=Object.assign({i:0,right:0,wrong:0,asked:0,missed:new Set(),t0:Date.now()},o);
  document.body.classList.add("playing"); play.hidden=false; ptab.innerHTML=tableHTML({cls:"play-pt"}); scrollTo(0,0); step(); }
function endSession(){ play.hidden=true; document.body.classList.remove("playing"); SES=null; home(); }
$('pclose').onclick=()=>{ if(SES&&SES.kind==="fill"){ clearInterval(SES.timer); } endSession(); };
function progress(){ const s=SES, n=s.steps.length; $('pfill').style.width=`${Math.round(s.i/n*100)}%`; $('pcount').textContent=s.kind==="daily"?`${Math.min(s.i+1,n)} / ${n}`:""; }
function step(){ const s=SES; progress(); if(s.i>=s.steps.length) return finish(); const q=s.steps[s.i]; s.q=q; s.locked=false;
  const scope=s.scope||null;
  if(q.t==="teach"){ paint(ptab,{scope,hl:q.z}); flash(ptab,q.z,"pop",700);
    const k=s.taught=(s.taught||0)+1, tot=s.steps.filter(x=>x.t==="teach").length;
    panel.innerHTML=`<div class="teach"><p class="eyebrow">New element ${k} of ${tot}</p>${tile(q.z,true)}
      <div class="facts"><span>${esc(FAM[famOf(q.z)])}</span><span>${where(q.z)}</span><span>Atomic weight ${esc(WT(q.z))}</span></div>
      <p class="hook">${esc(ELS[q.z-1][3])}</p><button class="btn go wide" id="nx">${k===tot?"See them together":"Next"}</button></div>`;
    $('nx').onclick=()=>{ const e=E(q.z); e.n++; if(!e.due) e.due=dayNo(); next(); }; return; }
  if(q.t==="mnem"){ const l=s.lesson; paint(ptab,{scope,hlSet:new Set(l.z)});
    panel.innerHTML=`<div class="teach"><p class="eyebrow">Remember them in order</p><p class="mnem">${mnemHTML(l)}</p>
      <div class="syms">${l.z.map(z=>`<span class="f-${famOf(z)}"><small>${z}</small>${SYM(z)}</span>`).join("")}</div>
      <p class="muted">Say the sentence out loud a couple of times. The capital letters are the symbols, ${UNITS[l.u].dir==="down"?"top to bottom down the column":"left to right across the row"}.</p>
      <div class="about"><b>${esc(UNITS[l.u].name)}</b> ${esc(UNITS[l.u].about)}</div>
      <button class="btn go wide" id="nx">Quiz me</button></div>`; $('nx').onclick=next; return; }
  s.asked++;
  const opts=q.t==="find"||q.t==="type"?null:q.t==="znum"||q.t==="wt"?numOpts(q.z):distract(q.z,s.pool,q.t==="sym"?"sym":"name");
  let prompt="", sub="";
  if(q.t==="find"){ paint(ptab,{scope,blank:q.blankAll?true:null}); prompt=`Tap <b>${esc(NAME(q.z))}</b>`; sub=q.blankAll?"The symbols are hidden. Go by position.":"Find it on the table."; }
  else if(q.t==="name"){ paint(ptab,{scope,hl:q.z,blank:new Set([q.z])}); prompt="Which element is glowing?"; }
  else if(q.t==="sym"){ paint(ptab,{scope,hl:q.z,blank:new Set([q.z])}); prompt=`What's the symbol for <b>${esc(NAME(q.z))}</b>?`; }
  else if(q.t==="who"){ paint(ptab,{scope,blank:new Set([q.z])}); prompt=`Which element is <b class="sy">${SYM(q.z)}</b>?`; }
  else if(q.t==="num"){ paint(ptab,{scope,blank:new Set([q.z])}); prompt=`Which element is number <b>${q.z}</b>?`; }
  else if(q.t==="type"){ paint(ptab,{scope,hl:q.z,blank:new Set([q.z])}); prompt="Type the name of the glowing element"; }
  else if(q.t==="wt"){ paint(ptab,{scope,hl:q.z}); prompt=`What's the atomic weight of <b>${esc(NAME(q.z))}</b>?`; sub="Hint: it's usually a bit more than twice the atomic number for anything past calcium."; }
  else if(q.t==="znum"){ paint(ptab,{scope,hl:q.z}); prompt=`What's the atomic number of <b>${esc(NAME(q.z))}</b>?`; sub="Count across the rows. It's also the number of protons."; }
  panel.innerHTML=`<div class="ask"><p class="prompt">${prompt}</p>${sub?`<p class="muted center">${sub}</p>`:""}
    ${opts?`<div class="opts">${opts.map(z=>`<button class="opt" data-a="${z}">${q.t==="sym"?`<b class="sy">${SYM(z)}</b>`:q.t==="znum"?`<b class="sy">${z}</b>`:q.t==="wt"?`<b class="sy">${esc(WT(z))}</b>`:esc(NAME(z))}</button>`).join("")}</div>`:""}
    ${q.t==="type"?`<form class="tin" id="tform" autocomplete="off"><input id="tin" type="text" enterkeyhint="send" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Element name" aria-label="Element name"><button class="btn go" type="submit">Check</button></form><button class="btn ghost small" id="idk" type="button">I don't know</button>`:""}
    <div class="fb" id="fb"></div></div>`;
  panel.querySelectorAll(".opt").forEach(b=>b.onclick=()=>answer(+b.dataset.a,b));
  if(q.t==="type"){ const i=$('tin'); setTimeout(()=>i.focus(),60); $('tform').onsubmit=e=>{ e.preventDefault(); const v=i.value.trim(); if(!v) return; answer(closeEnough(v,q.z)?q.z:-1,null,v); }; $('idk').onclick=()=>answer(-1,null,""); } }
function mnemHTML(l){ return esc(l.m).replace(/[A-Z]/g,m=>`<u>${m}</u>`); }
ptab.addEventListener("pointerdown",e=>{ const s=SES; if(!s||s.locked) return; const q=s.q;
  if(s.kind==="fill") return;
  if(!q||q.t!=="find") return; const z=cellAt(ptab,e.clientX,e.clientY); if(z==null) return; e.preventDefault(); answer(z,null); });
function answer(a,btn,typed){ const s=SES, q=s.q; if(s.locked) return; s.locked=true; const ok=a===q.z;
  mark(q.z,ok); if(ok) s.right++; else { s.wrong++; s.missed.add(q.z); }
  snd(ok?"ok":"no");
  paint(ptab,{scope:s.scope,hl:q.z}); flash(ptab,q.z,ok?"ok":"bad",0);
  if(q.t==="find"&&!ok&&a>0) flash(ptab,a,"pick",0);
  panel.querySelectorAll(".opt").forEach(b=>{ const z=+b.dataset.a; b.disabled=true; if(z===q.z) b.classList.add("right"); else if(b===btn) b.classList.add("wrong"); });
  const fb=$('fb');
  if(ok){ fb.innerHTML=`<p class="yes">${["Nice!","Right!","Yes!","Got it!"][Math.floor(Math.random()*4)]} <span>${SYM(q.z)} is ${esc(NAME(q.z))}, number ${q.z}${q.t==="wt"?`, weight ${esc(WT(q.z))}`:""}</span></p>`; setTimeout(next,q.t==="type"?900:750); }
  else { if(s.requeue!==false) s.steps.splice(Math.min(s.steps.length,s.i+3),0,{t:q.t==="find"&&q.blankAll?"find":q.t==="type"?"name":q.t,z:q.z,again:true});
    fb.innerHTML=`<div class="no">${tile(q.z)}<div><p><b>${q.t==="find"&&a>0?`That's ${esc(NAME(a))}. `:typed?`Not "${esc(typed)}". `:""}It's ${esc(NAME(q.z))}${q.t==="znum"?`, number ${q.z}`:q.t==="wt"?`, atomic weight ${esc(WT(q.z))}`:""}.</b></p><p>${esc(ELS[q.z-1][3])}</p></div></div><button class="btn wide" id="nx">Continue</button>`;
    $('nx').onclick=next; } }
function next(){ if(!SES||SES.kind==="fill") return; SES.i++; step(); }
function finish(){ const s=SES; practiced(); const acc=s.asked?Math.round(s.right/(s.right+s.wrong)*100):100, secs=Math.round((Date.now()-s.t0)/1000);
  let head="", extra="";
  if(s.kind==="lesson"){ const st=acc>=95?3:acc>=80?2:1, l=s.lesson; S.done[l.id]=Math.max(S.done[l.id]||0,st);
    head=`<p class="eyebrow">Lesson complete</p><h2>${esc(lessonTitle(l))}</h2><div class="stars">${[1,2,3].map(i=>`<i class="${i<=st?"on":""}">★</i>`).join("")}</div>`;
    extra=`<div class="syms">${l.z.map(z=>`<span class="f-${famOf(z)}"><small>${z}</small>${SYM(z)}</span>`).join("")}</div><p class="mnem small">${mnemHTML(l)}</p>`; }
  else if(s.kind==="daily"){ const d=today(), first=!S.daily[d]; if(first) S.daily[d]={sc:s.right,n:s.steps.length,t:secs};
    head=`<p class="eyebrow">Daily 10 · ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}</p><h2>${s.right} / ${s.steps.length}</h2><p class="muted">${first?`${fmt(secs)}`:`Practice run. Today's score: ${S.daily[d].sc} / ${S.daily[d].n}`}</p>`;
    extra=`<button class="btn wide" id="shr">Share</button>`; }
  else head=`<p class="eyebrow">Review done</p><h2>${s.right} of ${s.right+s.wrong} right</h2>`;
  save(); snd("done");
  const missed=[...s.missed];
  progress(); paint(ptab,{scope:s.scope,hlSet:new Set(s.kind==="lesson"?s.lesson.z:missed)});
  panel.innerHTML=`<div class="fin">${head}<div class="kv"><div><b>${acc}%</b><span>accuracy</span></div><div><b>${fmt(secs)}</b><span>time</span></div><div><b>${nLearned()}</b><span>of 118 learned</span></div></div>
    ${extra}${missed.length&&s.kind!=="lesson"?`<p class="muted">To work on: ${missed.map(z=>`<b>${SYM(z)}</b> ${esc(NAME(z))}`).join(", ")}</p>`:""}
    ${s.kind==="lesson"&&nextLesson()?`<button class="btn go wide" id="nl">Next lesson</button>`:""}<button class="btn ${s.kind==="lesson"&&nextLesson()?"ghost":"go"} wide" id="dn">Done</button></div>`;
  $('dn').onclick=endSession; if($('nl')) $('nl').onclick=()=>startLesson(nextLesson());
  if($('shr')) $('shr').onclick=()=>{ const d=S.daily[today()], txt=`Globetrotter Elements · Daily 10 · ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}\n${d.sc}/${d.n} in ${fmt(d.t)}${streak()>1?`\n${streak()}-day streak`:""}\n${location.origin}${location.pathname}`;
    if(navigator.share) navigator.share({text:txt}).catch(()=>{}); else if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>{ $('shr').textContent="Copied"; }); }; }
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

// a lesson: teach each new element, the memory sentence, then three kinds of questions on each plus a few old ones
function startLesson(l){ const steps=l.z.map(z=>({t:"teach",z})); steps.push({t:"mnem"});
  const rot=S.wq?["name","znum","wt","num"]:["name","znum","num"], qs=[]; l.z.forEach((z,i)=>qs.push({t:"find",z},{t:"sym",z},{t:rot[i%rot.length],z}));
  const old=shuffle(Z.filter(z=>learned(z)&&!l.z.includes(z))).sort((a,b)=>E(a).s-E(b).s).slice(0,3); old.forEach(z=>qs.push({t:Math.random()<.5?"find":"who",z}));
  startSession({kind:"lesson",lesson:l,pool:l.z,steps:steps.concat(spread(qs))}); }
function spread(qs){ // shuffle, then nudge so the same element never comes twice in a row
  let a=shuffle(qs); for(let k=0;k<30;k++){ let bad=false; for(let i=1;i<a.length;i++) if(a[i].z===a[i-1].z){ const j=Math.floor(Math.random()*a.length); [a[i],a[j]]=[a[j],a[i]]; bad=true; } if(!bad) break; } return a; }
function nextLesson(){ return LESSONS.find(l=>!S.done[l.id])||null; }
// review: what's due first, then the weakest; harder question types as an element gets stronger
function startReview(){ const due=dueList().sort((a,b)=>E(a).s-E(b).s||E(a).due-E(b).due), more=Z.filter(z=>learned(z)&&!due.includes(z)).sort((a,b)=>E(a).s-E(b).s);
  const pick=due.concat(more).slice(0,12); if(!pick.length) return;
  const qs=pick.map(z=>{ const s=E(z).s, kinds=s<=1?["find","name","sym"]:s===2?["sym","who","znum"]:s===3?["type","num","znum"]:["type","find+","num"]; if(S.wq&&s>=2) kinds.push("wt"); let t=kinds[Math.floor(Math.random()*kinds.length)];
    return t==="find+"?{t:"find",z,blankAll:true}:{t,z}; });
  startSession({kind:"review",pool:pick,steps:spread(qs)}); }
// the daily 10: the same questions for everyone on a given day
function seeded(str){ let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); h^=h>>>16; return (h>>>0)/4294967296; }; }
function startDaily(){ const r=seeded("elements-"+today()), zs=[]; while(zs.length<10){ const z=1+Math.floor(r()*118); if(!zs.includes(z)) zs.push(z); }
  const kinds=["find","name","sym","who","znum"];
  startSession({kind:"daily",steps:zs.map((z,i)=>({t:kinds[i%5],z})),requeue:false}); }

/* ================= full recall: Name them all, In order ================= */
function scopeZ(key){ if(key==="all") return Z; const u=UNITS.find(u=>u.key===key); return u.lessons.flatMap(l=>l.z).sort((a,b)=>a-b); }
const scopeName=key=>key==="all"?"All 118":UNITS.find(u=>u.key===key).name;
function startFill(kind,key){ const zs=scopeZ(key), scope=new Set(zs);
  SES={kind:"fill",mode:kind,key,zs,scope,got:new Set(),i:0,miss:0,hints:0,t0:Date.now(),steps:[0]};
  document.body.classList.add("playing"); play.hidden=false; ptab.innerHTML=tableHTML({cls:"play-pt"}); scrollTo(0,0);
  $('pfill').style.width="0%"; $('pcount').textContent="";
  panel.innerHTML=`<div class="fill"><p class="prompt" id="fp">${kind==="names"?"Type any element name":"Type the symbol for the glowing cell"}</p>
    <form class="tin" id="fform" autocomplete="off"><input id="fin" type="text" enterkeyhint="done" autocapitalize="${kind==="order"?"characters":"off"}" autocorrect="off" spellcheck="false" placeholder="${kind==="names"?"Element name":"Symbol"}" aria-label="Answer"></form>
    <div class="fstat"><b id="fcount">0 / ${zs.length}</b><span id="ftime">0:00</span></div>
    <div class="row2"><button class="btn ghost small" id="fhint" type="button">Hint</button><button class="btn ghost small" id="fgive" type="button">Give up</button></div>
    <p class="muted center" id="fnote">${kind==="names"?"Each name you get drops into its cell. Spelling counts, but British spellings are fine.":"Go in order of atomic number. Wrong letters count as misses."}</p></div>`;
  fillPaint(); const inp=$('fin'); setTimeout(()=>inp.focus(),80);
  SES.timer=setInterval(()=>{ if(SES&&SES.kind==="fill") $('ftime').textContent=fmt(Math.round((Date.now()-SES.t0)/1000)); },500);
  inp.addEventListener("input",fillInput); $('fform').onsubmit=e=>{ e.preventDefault(); fillInput(true); };
  $('fhint').addEventListener("pointerdown",e=>e.preventDefault()); $('fhint').onclick=fillHint;
  $('fgive').onclick=()=>fillDone(true); }
function fillPaint(){ const s=SES, left=new Set(s.zs.filter(z=>!s.got.has(z)));
  paint(ptab,{scope:s.scope,blank:left,cur:s.mode==="order"?s.zs[s.i]:null}); for(const z of s.got) cellEl(ptab,z).classList.add("got"); }
function fillInput(enter){ const s=SES, inp=$('fin'), v=inp.value.trim();
  if(s.mode==="names"){ const z=nameToZ(v); if(z&&s.scope.has(z)&&!s.got.has(z)){ s.got.add(z); inp.value=""; snd("pop"); fillPaint(); flash(ptab,z,"pop",600); fillCount(); }
    else if(enter===true&&v){ inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake"); } return; }
  const z=s.zs[s.i], want=SYM(z).toLowerCase(), got=v.toLowerCase();
  if(got===want){ s.got.add(z); s.i++; inp.value=""; snd("pop"); fillPaint(); flash(ptab,z,"pop",600); fillCount(); }
  else if(!want.startsWith(got)){ s.miss++; inp.value=""; snd("no"); flash(ptab,z,"bad",500); inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake"); } }
function fillCount(){ const s=SES; $('fcount').textContent=`${s.got.size} / ${s.zs.length}`; $('pfill').style.width=`${Math.round(s.got.size/s.zs.length*100)}%`; if(s.got.size===s.zs.length) fillDone(false); }
function fillHint(){ const s=SES; s.hints++; const left=s.zs.filter(z=>!s.got.has(z)); if(!left.length) return; const z=s.mode==="order"?s.zs[s.i]:left[0];
  const b=cellEl(ptab,z); b.classList.add("peek"); setTimeout(()=>b.classList.remove("peek"),1600);
  $('fnote').innerHTML=s.mode==="order"?`It's <b>${SYM(z)}</b>, ${esc(NAME(z))}.`:`Try number ${z}: it starts with <b>${esc(NAME(z).slice(0,2))}…</b>`; $('fin').focus(); }
function fillDone(gave){ const s=SES; clearInterval(s.timer); practiced(); const secs=Math.round((Date.now()-s.t0)/1000), all=s.got.size===s.zs.length;
  for(const z of s.zs) if(learned(z)||s.got.has(z)) mark(z,s.got.has(z));
  const bk=s.mode+":"+s.key, prev=S.best[bk]; let isBest=false; if(all&&!s.hints&&(!prev||secs<prev)){ S.best[bk]=secs; isBest=true; } save(); snd("done");
  const left=s.zs.filter(z=>!s.got.has(z));
  paint(ptab,{scope:s.scope}); for(const z of s.got) cellEl(ptab,z).classList.add("got"); for(const z of left) cellEl(ptab,z).classList.add("bad");
  $('fin').blur();
  panel.innerHTML=`<div class="fin"><p class="eyebrow">${s.mode==="names"?"Name them all":"In order"} · ${esc(scopeName(s.key))}</p><h2>${all?"All of them!":`${s.got.size} of ${s.zs.length}`}</h2>
    <div class="kv"><div><b>${fmt(secs)}</b><span>time</span></div><div><b>${s.mode==="order"?s.miss:s.hints}</b><span>${s.mode==="order"?"misses":"hints"}</span></div><div><b>${S.best[bk]?fmt(S.best[bk]):"–"}</b><span>best time</span></div></div>
    ${isBest&&all?`<p class="cheer center">New best time!</p>`:""}${all&&s.hints?`<p class="muted center">Best times only count without hints.</p>`:""}
    ${left.length?`<p class="muted">Missed, in red: ${left.slice(0,30).map(z=>`<b>${SYM(z)}</b> ${esc(NAME(z))}`).join(", ")}${left.length>30?"…":""}</p>`:""}
    <button class="btn go wide" id="again">Try again</button><button class="btn ghost wide" id="dn">Done</button></div>`;
  $('dn').onclick=endSession; $('again').onclick=()=>{ const k=s.mode, key=s.key; startFill(k,key); }; }

/* ================= explore ================= */
let EX={z:1};
function explore(){ app.innerHTML=`<div class="bar"><button class="x" data-act="home" aria-label="Back"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M14 4 7 11l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ttl">The periodic table</div></div>
  <div class="seg2" role="group" aria-label="Color by"><button data-act="col" data-c="fam" aria-pressed="${S.color!=="mastery"}">Families</button><button data-act="col" data-c="mastery" aria-pressed="${S.color==="mastery"}">What I know</button></div>
  <div class="seg2" role="group" aria-label="Table size"><button data-act="big" data-b="0" aria-pressed="${!S.big}">Whole table</button><button data-act="big" data-b="1" aria-pressed="${!!S.big}">Big, with weights</button></div>
  <div class="extab ${S.big?"big":""}" id="extab">${tableHTML()}</div>
  ${S.color==="mastery"?`<div class="legend"><span data-m="0">Not learned</span><span data-m="1">Learning</span><span data-m="2">Getting there</span><span data-m="3">Mastered</span></div>`
    :`<div class="legend fam">${Object.entries(FAM).map(([k,v])=>`<span class="f-${k}">${v}</span>`).join("")}</div>`}
  <section class="card" id="exd"></section>`;
  paint($('extab'),{color:S.color}); exShow(EX.z);
  $('extab').addEventListener("click",e=>{ const b=e.target.closest(".el"); const z=b?+b.dataset.z:cellAt($('extab'),e.clientX,e.clientY); if(z) exShow(z); }); }
function exShow(z){ EX.z=z; const root=$('extab'); root.querySelectorAll(".el.hl").forEach(b=>b.classList.remove("hl")); cellEl(root,z).classList.add("hl");
  const e=S.el[z], l=LESSONS.find(l=>l.z.includes(z));
  $('exd').innerHTML=`<div class="exd">${tile(z,true)}<div class="exi"><p class="hook">${esc(ELS[z-1][3])}</p>
    <div class="facts"><span>${esc(FAM[famOf(z)])}</span><span>${where(z)}</span><span>Atomic mass ${esc(ELS[z-1][2])}</span></div>
    <p class="muted">${e&&e.n?`You've answered it ${e.n} time${e.n>1?"s":""}, ${Math.round(e.r/e.n*100)}% right.`:"Not learned yet."} In <b>${esc(UNITS[l.u].name)}</b>, lesson ${l.i+1}.</p></div></div>
    <div class="row2"><button class="btn ghost small" data-act="exprev" ${z===1?"disabled":""}>← ${z>1?esc(SYM(z-1)):""}</button><button class="btn ghost small" data-act="exnext" ${z===118?"disabled":""}>${z<118?esc(SYM(z+1)):""} →</button></div>`; }

/* ================= home ================= */
function home(){ const nl=nextLesson(), due=dueList().length, d=S.daily[today()], st=streak(), L=nLearned();
  const hero=nl?(()=>{ const u=UNITS[nl.u]; return `<button class="next" style="--cc:${u.c}" data-act="lesson" data-id="${nl.id}">
      <span class="eyebrow">${L?"Next lesson":"Start here"} · ${esc(u.name)}</span><h2>${esc(lessonTitle(nl))}</h2>
      <div class="syms">${nl.z.map(z=>`<span><small>${z}</small>${SYM(z)}</span>`).join("")}</div>
      <span class="go">${L?"Start lesson":"Learn the first five"}</span></button>`; })()
    :`<button class="next" style="--cc:#2a9d6a" data-act="review"><span class="eyebrow">Every lesson done</span><h2>Keep it fresh</h2><p>${due} element${due===1?"":"s"} due for review today.</p><span class="go">Review</span></button>`;
  app.innerHTML=`
  <div class="brand"><h1>Elements</h1><nav class="tabs" aria-label="Edition"><a href="../">World</a><a href="../usa/">USA</a><a href="../earth/">Earth</a><a href="../math/">Math</a><a href="../games/">Games</a><a href="./" aria-current="page">Elements</a></nav></div>
  <div class="chips"><span class="chip"><b>${L}</b><small>of 118 learned</small></span><span class="chip"><b>${nMastered()}</b><small>mastered</small></span>${st?`<span class="chip"><b>${st}</b><small>day streak</small></span>`:""}</div>
  ${hero}
  <div class="duo">
    <button class="tile" data-act="review" ${L?"":"disabled"}><b>Review</b><span>${L?(due?`${due} due today`:"Nothing due. Practice your weakest."):"Finish a lesson first"}</span></button>
    <button class="tile" data-act="daily"><b>Daily 10</b><span>${d?`Today: ${d.sc} / ${d.n}. Play again for practice.`:"Same 10 questions for everyone today"}</span></button>
    <button class="tile" data-act="fillpick" data-k="names"><b>Name them all</b><span>Type every name you know and watch the table fill</span></button>
    <button class="tile" data-act="fillpick" data-k="order"><b>In order</b><span>Symbols from H to Og, one after another</span></button>
  </div>
  <section class="card"><div class="sechead"><h3>Your table</h3><button class="histbtn" data-act="explore">Explore</button></div>
    <div class="mini" id="mini" data-act="explore">${tableHTML()}</div>
    <div class="legend"><span data-m="0">Not learned</span><span data-m="1">Learning</span><span data-m="2">Getting there</span><span data-m="3">Mastered</span></div></section>
  ${UNITS.map((u,ui)=>{ const nd=u.lessons.filter(l=>S.done[l.id]).length; return `<section class="card unit" style="--cc:${u.c}">
    <div class="uhead"><div><h3>${esc(u.name)}</h3><p class="muted">${esc(u.sub)}</p></div><span class="ucount">${nd}/${u.lessons.length}</span></div>
    <p class="about">${esc(u.about)}</p>
    ${u.lessons.map(l=>{ const st=S.done[l.id]||0, isNext=nl&&nl.id===l.id; return `<button class="lrow ${st?"done":""} ${isNext?"nx":""}" data-act="lesson" data-id="${l.id}">
      <span class="lnum">${st?"✓":l.i+1}</span><span class="lt"><b>${esc(lessonTitle(l))}</b><span>${l.z.map(SYM).join(" · ")}</span></span>${st?`<span class="lst">${"★".repeat(st)}<i>${"★".repeat(3-st)}</i></span>`:""}</button>`; }).join("")}
    </section>`; }).join("")}
  <section class="card"><h3>How it works</h3><div class="how">
    <p><b>Lessons</b> go family by family: the columns at the edges first, then the transition metals in the middle, then the two rows underneath. Each one teaches three to six elements with a hook to remember them by and a silly sentence for the symbols.</p>
    <p><b>Atomic weights</b> are on every card and in the big table in Explore. Lessons and review ask about them too; switch that off at the bottom if you only want names, symbols, positions and numbers.</p>
    <p><b>Review</b> brings each element back just before you'd forget it: a day later, then two, four, eight and sixteen.</p>
    <p><b>Name them all</b> and <b>In order</b> are the real test. When you can fill the whole table, you know it.</p></div></section>
  <div class="foot"><div id="bk" style="width:100%"></div>
    <div class="row" style="justify-content:center"><button class="btn ghost small" data-act="sound">Sounds ${S.sound?"on":"off"}</button><button class="btn ghost small" data-act="wq">Weight questions ${S.wq?"on":"off"}</button><button class="btn ghost small" data-act="reset">Reset progress</button></div>
    <div>Version ${esc(APP_VERSION)}</div></div>`;
  paint($('mini'),{color:"mastery"});
  if(window.GT_BK) GT_BK.ui($('bk'),{beforeBackup:save}); }
function fillPick(kind){ app.innerHTML=`<div class="bar"><button class="x" data-act="home" aria-label="Back"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M14 4 7 11l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ttl">${kind==="names"?"Name them all":"In order"}</div></div>
  <p class="muted">${kind==="names"?"Type element names in any order. Each one drops into its cell. Start with a family you've learned, then go for all 118.":"Type each symbol in order of atomic number. The cell to fill glows."}</p>
  <div class="scopes">${["all",...UNITS.map(u=>u.key)].map(k=>{ const b=S.best[kind+":"+k], u=UNITS.find(u=>u.key===k); return `<button class="tile scope" data-act="fill" data-k="${kind}" data-s="${k}" style="--cc:${u?u.c:"var(--ink)"}"><b>${esc(scopeName(k))}</b><span>${scopeZ(k).length} elements${b?` · best ${fmt(b)}`:""}</span></button>`; }).join("")}</div>`;
  scrollTo(0,0); }
app.addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b||b.disabled) return; const a=b.dataset.act; ac();
  if(a==="lesson") return startLesson(LESSONS.find(l=>l.id===b.dataset.id));
  if(a==="review") return dueList().length||nLearned()?startReview():null;
  if(a==="daily") return startDaily();
  if(a==="fillpick") return fillPick(b.dataset.k);
  if(a==="fill") return startFill(b.dataset.k,b.dataset.s);
  if(a==="explore") return explore();
  if(a==="home"){ home(); return scrollTo(0,0); }
  if(a==="col"){ S.color=b.dataset.c; save(); return explore(); }
  if(a==="big"){ S.big=b.dataset.b==="1"; save(); explore(); if(S.big){ const t=$('extab'), c=cellEl(t,EX.z); t.scrollLeft=Math.max(0,c.offsetLeft-t.clientWidth/2); } return; }
  if(a==="wq"){ S.wq=!S.wq; save(); return home(); }
  if(a==="exprev"&&EX.z>1) return exShow(EX.z-1);
  if(a==="exnext"&&EX.z<118) return exShow(EX.z+1);
  if(a==="sound"){ S.sound=!S.sound; save(); return home(); }
  if(a==="reset"){ if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to erase all progress"; return; } const snd0=S.sound; S=FRESH(); S.sound=snd0; save(); return home(); } });

/* ---------- offline + updates (shared with the other tabs) ---------- */
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")) navigator.serviceWorker.register("../sw.js").catch(()=>{});
async function checkUpdate(){ if(!navigator.onLine||APP_VERSION==="dev"||!play.hidden) return;
  try{ const r=await fetch("../version.json",{cache:"no-store"}); if(!r.ok) return; const v=(await r.json()).v; if(v&&v!==APP_VERSION) $('updBtn').hidden=false; }catch(e){} }
$('updBtn').onclick=async()=>{ $('updBtn').textContent="Updating…"; try{ const reg=await navigator.serviceWorker?.getRegistration(); await reg?.update(); }catch(e){} location.reload(); };
setTimeout(checkUpdate,1500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") checkUpdate(); else save(); });
home();
