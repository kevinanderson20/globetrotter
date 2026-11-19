/* ================= TOP ANSWERS: a survey game in the classic TV format =================
   Three rounds (single, double, triple points), three strikes a round, then Fast Money: five questions in 25 seconds.
   The questions are original surveys written for this app (tools/games/feud_data*.js). */
const FEUD_RAW=`/*FEUD_DATA*/`;
const FQ=FEUD_RAW.trim().split("\n").map(ln=>{ const [q,rest]=ln.split("|");
  return {q, a:rest.split(";").map(x=>{ const [d,p,al]=x.split(":"); return {d, p:+p, al:[d,...(al?al.split(","):[])]}; })}; });
const FD_MULT=[1,2,3], FD_FM_SECS=25, FD_FM_GOAL=100;

/* matching typed answers: plurals, small typos and partial phrases all count */
const FD_STOP=new Set("a an the my your his her their our some to of for at in on with and or is be it its i you they them".split(" "));
const fdStem=w=>w.length>4?w.replace(/ies$/,"y").replace(/(ing|ed|es|s)$/,""):w.length>3?w.replace(/s$/,""):w;
const fdTok=s=>String(s).toLowerCase().replace(/[’'.]/g,"").replace(/&/g," and ").replace(/[^a-z0-9 ]+/g," ").split(/\s+/).filter(w=>w&&!FD_STOP.has(w)).map(fdStem);
function fdLev(a,b){ if(a===b) return 0; const m=a.length, n=b.length; if(!m||!n) return m||n; let p=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[n]; }
function fdScore(guess,ans){ const g=fdTok(guess); if(!g.length) return 0; const gs=g.join(" "); let best=0;
  for(const al of ans.al){ const t=fdTok(al); if(!t.length) continue; const ts=t.join(" ");
    if(gs===ts) return 100;
    if(t.every(w=>g.includes(w))) best=Math.max(best,80+t.length);
    else if(g.length<=2&&g.every(w=>w.length>=4&&t.includes(w))) best=Math.max(best,60);
    else { const tol=ts.length>=8?2:ts.length>=5?1:0; if(tol&&Math.abs(gs.length-ts.length)<=2&&fdLev(gs,ts)<=tol) best=Math.max(best,70);
      else if(g.length===1&&g[0].length>=5) for(const w of t) if(w.length>=5&&fdLev(g[0],w)<=1){ best=Math.max(best,55); break; } } }
  return best; }
/* the best matching answer on this board: [index, already shown?] or null */
function fdFind(guess,q,shown){ let bi=-1, bs=0; q.a.forEach((a,i)=>{ const s=fdScore(guess,a); if(s>bs||(s===bs&&s&&!shown[i]&&shown[bi])){ bs=s; bi=i; } });
  return bi<0||!bs?null:[bi,!!shown[bi]]; }

/* sounds: the ding is the app's own; the buzzer is a harsh two-tone square wave */
function fdBuzz(){ if(!S.sound) return; try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended") actx.resume(); const t=actx.currentTime, out=actx.createGain(); out.gain.setValueAtTime(.0001,t); out.gain.exponentialRampToValueAtTime(.09,t+.02); out.gain.setValueAtTime(.09,t+.5); out.gain.exponentialRampToValueAtTime(.0001,t+.62); out.connect(actx.destination);
  [110,117].forEach(f=>{ const o=actx.createOscillator(); o.type="square"; o.frequency.value=f; o.connect(out); o.start(t); o.stop(t+.65); }); }catch(e){} }
function fdDing(big){ if(!S.sound) return; snd("ok"); if(big) setTimeout(()=>snd("ok"),110); }
const fdVib=p=>{ try{ navigator.vibrate&&navigator.vibrate(p); }catch(e){} };

function fdPick(rng,avoid=new Set()){ const pool=FQ.map((_,i)=>i).filter(i=>!avoid.has(i));
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  const main=pool.filter(i=>FQ[i].a.length>=6).slice(0,3), fm=pool.filter(i=>!main.includes(i)).slice(0,5); return {main,fm}; }
function fdStatus(){ S.fd=S.fd||{}; const d=S.fd[today()]; if(!d) return "";
  return d.over?`Today's done · ${d.total} pts`:d.phase==="fm"?`Today's #${dayIndex()+1} · round 4`:`Today's #${dayIndex()+1} · round ${d.r+1}`; }

function startFeud(opt={}){
  const daily=!opt.unlimited, gid=daily?"feud":"feudu", key=today();
  S.fd=S.fd||{};
  if(daily&&S.fd[key]&&S.fd[key].over) return fdResults();
  let st;
  if(daily&&S.fd[key]) st=S.fd[key];
  else { const seen=new Set(S.fdSeen||[]); const p=fdPick(daily?seeded("globetrotter-feud-v1-"+key):Math.random,daily?new Set():seen);
    st={main:p.main,fm:p.fm,r:0,shown:[],strikes:0,bank:0,total:0,rs:[],phase:"main",fma:[],fmi:0,left:FD_FM_SECS*10};
    if(daily){ S.fd[key]=st; save(); } else { S.fdSeen=[...(S.fdSeen||[]),...p.main,...p.fm].slice(-200); save(); } }
  begin(gid,daily?`Family Feud #${dayIndex()+1}`:"Unlimited Family Feud"); stage.className="gstage scroll fdstage";
  const persist=()=>{ if(daily) save(); };
  let busy=false;
  const q=()=>FQ[st.main[st.r]];
  function info(){ $('ginfo').innerHTML=`<span class="fdtot" aria-label="Score ${st.total}">${st.total.toLocaleString()}</span>`; }

  /* ---------- the main rounds ---------- */
  function board(){ const Q=q(), n=Q.a.length, rows=Math.ceil(n/2), mult=FD_MULT[st.r];
    const tile=i=>{ if(i>=n) return `<div class="fdt fdx" aria-hidden="true"></div>`; const a=Q.a[i], s=st.shown[i];
      return `<div class="fdt${s?" up":""}${s==="m"?" miss":""}" data-i="${i}" aria-label="${s?`${esc(a.d)}, ${a.p} points`:`Answer ${i+1}, hidden`}">
        <div class="fdf"><span class="fdn">${i+1}</span></div><div class="fdb"><span class="fda">${esc(a.d)}</span><span class="fdp">${a.p}</span></div></div>`; };
    const order=[]; for(let r=0;r<rows;r++){ order.push(r, r+rows); }
    info();
    stage.innerHTML=`<div class="fd">
      <div class="fdhud"><span class="fdround">Round ${st.r+1}<small>${mult===1?"Single":mult===2?"Double":"Triple"} points</small></span>
        <div class="fdbank" aria-live="polite"><small>Bank</small><b>${st.bank}</b></div>
        <span class="fdstrikes" aria-label="${st.strikes} of 3 strikes">${[0,1,2].map(k=>`<i class="${k<st.strikes?"on":""}">${FD_X}</i>`).join("")}</span></div>
      <div class="fdboard"><div class="fdq">${esc(Q.q)}</div><div class="fdgrid" style="--rows:${rows}">${order.map(tile).join("")}</div></div>
      ${roundOver()?`<div class="fdend"><p>${st.strikes>=3?"Three strikes.":"You found them all!"} Round score <b>${st.bank} × ${mult} = ${st.bank*mult}</b></p>
        <button class="btn go wide" id="fdnext">${st.r<2?`Round ${st.r+2}`:"Fast Money"}</button></div>`
      :`<form class="fdin" id="fdform" autocomplete="off"><input id="fdg" type="text" enterkeyhint="go" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Your answer"><button class="btn go" type="submit">Guess</button></form>
        <button class="btn ghost small fdgive" id="fdgive" type="button">Reveal the board</button>`}
    </div>`;
    const f=$('fdform');
    if(f){ f.onsubmit=e=>{ e.preventDefault(); const g=$('fdg').value.trim(); if(!g||busy) return; guess(g); };
      $('fdgive').onclick=()=>{ if(busy) return; st.strikes=3; endRound(); };
      setTimeout(()=>{ const i=$('fdg'); if(i&&!matchMedia("(hover: none)").matches) i.focus(); },60); }
    const nx=$('fdnext'); if(nx) nx.onclick=next;
  }
  const roundOver=()=>st.strikes>=3||q().a.every((_,i)=>st.shown[i]);
  function flip(i,miss){ const el=stage.querySelector(`.fdt[data-i="${i}"]`); if(!el) return; el.classList.add("up"); if(miss) el.classList.add("miss"); el.setAttribute("aria-label",`${q().a[i].d}, ${q().a[i].p} points`); }
  function guess(g){
    const Q=q(), hit=fdFind(g,Q,st.shown); const inp=$('fdg');
    if(hit&&hit[1]){ toast("Already on the board"); inp.value=""; inp.focus(); return; }
    if(hit){ const i=hit[0]; st.shown[i]=1; st.bank+=Q.a[i].p; persist(); busy=true; inp.value="";
      flip(i); fdDing(i===0); fdVib(12); flash();
      const bk=stage.querySelector(".fdbank b"); if(bk){ bk.textContent=st.bank; bk.parentNode.classList.remove("pop"); void bk.offsetWidth; bk.parentNode.classList.add("pop"); }
      later(()=>{ busy=false; if(roundOver()) endRound(); else inp.focus(); },i===0?700:450); return; }
    st.strikes++; persist(); inp.value=""; strike(st.strikes);
    if(st.strikes>=3) later(endRound,1200); else inp.focus();
  }
  function strike(n){ fdBuzz(); fdVib([40,60,40]); busy=true;
    const o=document.createElement("div"); o.className="fdbig"; o.setAttribute("aria-hidden","true"); o.innerHTML=Array.from({length:n},()=>FD_X).join(""); stage.appendChild(o);
    stage.querySelectorAll(".fdstrikes i").forEach((x,k)=>x.classList.toggle("on",k<n)); stage.querySelector(".fdboard")?.classList.add("shake");
    later(()=>{ o.remove(); stage.querySelector(".fdboard")?.classList.remove("shake"); busy=false; },1050); }
  function endRound(){ const Q=q(); busy=true; const hidden=Q.a.map((_,i)=>i).filter(i=>!st.shown[i]);
    hidden.forEach((i,k)=>later(()=>{ st.shown[i]="m"; flip(i,true); if(S.sound) snd("tick"); },350+k*420));
    later(()=>{ busy=false; const pts=st.bank*FD_MULT[st.r]; if(st.rs[st.r]==null){ st.rs[st.r]=pts; st.total+=pts; } persist(); board(); },400+hidden.length*420); }
  function next(){ if(st.r<2){ st.r++; st.shown=[]; st.strikes=0; st.bank=0; persist(); board(); scrollTo(0,0); } else { st.phase="fm"; persist(); fmIntro(); } }

  /* ---------- Fast Money ---------- */
  function fmIntro(){ info();
    stage.innerHTML=`<div class="fd"><div class="fdboard fdfm"><div class="fdlogo">Fast Money</div>
      <p class="fdfmt">Five questions. ${FD_FM_SECS} seconds. Give the answer most people would.</p>
      <p class="fdfmt">Score <b>${FD_FM_GOAL}</b> points or more to win.</p></div>
      <button class="btn go wide" id="fdgo">Start the clock</button></div>`;
    $('fdgo').onclick=fmPlay; }
  function fmPlay(){ let t0=performance.now(), left0=st.left;
    const ask=()=>{ if(st.fmi>=5||st.left<=0) return fmReveal(); const Q=FQ[st.fm[st.fmi]];
      stage.innerHTML=`<div class="fd"><div class="fdclock" aria-live="off"><b id="fdsec">${Math.ceil(st.left/10)}</b><i><span id="fdbar"></span></i></div>
        <div class="fdboard fdfm"><span class="fdqn">Question ${st.fmi+1} of 5</span><div class="fdq">${esc(Q.q)}</div></div>
        <form class="fdin" id="fdform" autocomplete="off"><input id="fdg" type="text" enterkeyhint="next" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Your answer"><button class="btn go" type="submit">Next</button></form>
        <button class="btn ghost small fdgive" id="fdpass" type="button">Pass</button></div>`;
      $('fdform').onsubmit=e=>{ e.preventDefault(); answer($('fdg').value.trim()); };
      $('fdpass').onclick=()=>answer("");
      const i=$('fdg'); i.focus(); setTimeout(()=>i.focus(),50); };
    const answer=a=>{ st.fma[st.fmi]=a; st.fmi++; persist(); if(S.sound) snd("tick"); ask(); };
    const tick=()=>{ const el=$('fdsec'); st.left=Math.max(0,left0-Math.floor((performance.now()-t0)/100));
      if(el){ el.textContent=Math.ceil(st.left/10); const b=$('fdbar'); if(b) b.style.transform=`scaleX(${st.left/(FD_FM_SECS*10)})`; el.parentNode.classList.toggle("low",st.left<=50); }
      if(st.left%10===0&&st.left<=50&&st.left>0&&S.sound&&tick.last!==st.left){ tick.last=st.left; snd("tick"); }
      if(st.left<=0){ while(st.fmi<5){ st.fma[st.fmi]=st.fma[st.fmi]||""; st.fmi++; } persist(); fdBuzz(); return fmReveal(); }
      if(st.fmi<5) later(tick,100); };
    ask(); later(tick,100);
  }
  function fmReveal(){ st.phase="reveal"; persist(); info();
    const rows=st.fm.map((qi,k)=>{ const Q=FQ[qi], a=st.fma[k]||"", hit=a?fdFind(a,Q,[]):null; return {Q,a,pts:hit?Q.a[hit[0]].p:0,top:Q.a[0]}; });
    stage.innerHTML=`<div class="fd"><div class="fdboard fdfm"><div class="fdlogo">Fast Money</div>
      <div class="fdrows">${rows.map((r,k)=>`<div class="fdrow" data-k="${k}"><span class="fdrq">${esc(r.Q.q)}</span><span class="fdra">${esc(r.a?r.a.toUpperCase():"(PASS)")}</span><span class="fdrp">${r.pts}</span><span class="fdrt">Top answer: ${esc(r.top.d)} (${r.top.p})</span></div>`).join("")}</div>
      <div class="fdfmtot"><small>Total</small><b id="fdft">0</b></div></div>
      <div id="fdafter"></div></div>`;
    let sum=0;
    rows.forEach((r,k)=>later(()=>{ const el=stage.querySelector(`.fdrow[data-k="${k}"]`); el.classList.add("up"); if(!r.pts) el.classList.add("zero");
      later(()=>{ el.classList.add("pts"); sum+=r.pts; $('fdft').textContent=sum; if(r.pts){ fdDing(r.pts>=25); fdVib(10); } else fdBuzz(); },650); },500+k*1500));
    later(()=>{ st.fmpts=sum; const win=sum>=FD_FM_GOAL; st.total=(st.rs||[]).reduce((a,b)=>a+(b||0),0)+sum+(win?100:0); st.win=win; st.over=1; persist(); info();
      if(win){ confetti(); fdDing(true); }
      $('fdafter').innerHTML=`<div class="fdend"><p>${win?`You beat ${FD_FM_GOAL}! <b>+100 bonus</b>`:`${sum} points. ${FD_FM_GOAL} wins.`}</p><button class="btn go wide" id="fddone">See your score</button></div>`;
      $('fddone').onclick=()=>finish(gid,st.total,{sub:`Rounds ${st.rs.map(x=>x||0).join(" + ")} · Fast Money ${sum}${win?" + 100 bonus":""}`,share:fdShare(st,daily),html:fdCard(st),...(daily?{nextG:"feudu",nextLabel:"Play unlimited Family Feud"}:{})}); },500+5*1500+700);
  }
  if(st.over) return fdResults();
  if(st.phase==="reveal") return fmReveal();
  if(st.phase==="fm") return st.fmi>0||st.left<FD_FM_SECS*10?fmPlay():fmIntro();
  board();
}
const FD_X='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 18 82 82M82 18 18 82" stroke="currentColor" stroke-width="20" stroke-linecap="round"/></svg>';
function fdShare(st,daily){ const rounds=st.main.map((qi,r)=>{ const n=FQ[qi].a.length, got=st.rs[r]!=null?Math.round((st.rs[r]/FD_MULT[r])):0; return `R${r+1} ${st.rs[r]||0}`; }).join(" · ");
  const fm=st.fm.map((qi,k)=>{ const a=st.fma[k]||"", h=a?fdFind(a,FQ[qi],[]):null; return !h?"⬜":h[0]===0?"🟩":"🟨"; }).join("");
  return `Family Feud${daily?` #${dayIndex()+1}`:""}\n${rounds}\nFast Money ${fm} ${st.fmpts||0}${st.win?" 🏆":""}\nTotal ${st.total}`; }
function fdCard(st){ return `<section class="card"><h3>Your game</h3><dl class="fdsum">${st.main.map((qi,r)=>`<dt>Round ${r+1} · ×${FD_MULT[r]}</dt><dd><span>${esc(FQ[qi].q)}</span><b>${st.rs[r]||0}</b></dd>`).join("")}
  <dt>Fast Money</dt><dd><span>${st.win?"Won the bonus":"Needed "+FD_FM_GOAL}</span><b>${(st.fmpts||0)+(st.win?100:0)}</b></dd></dl></section>`; }
function fdResults(){ const st=S.fd[today()];
  show(`${bar("Family Feud")}
  <section class="card center" style="--c:var(--nm)"><div class="eyebrow" style="font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)">Family Feud #${dayIndex()+1}</div>
    <div class="big">${st.total}</div><p class="muted">points</p><p class="cheer" style="color:var(--ink-2)">New surveys tomorrow</p></section>
  ${fdCard(st)}
  ${SHARE_ROW}
  <button class="btn wide" data-act="play" data-g="feudu">Play unlimited Family Feud</button>
  <button class="btn ghost wide" data-act="home">Home</button>`);
  wireShare(fdShare(st,true)); }
