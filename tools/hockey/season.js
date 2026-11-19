/* ================= SEASON: 10 games against the other five teams, then a top-four playoff =================
   Each game day has three games. You play yours (or sim it); the other two are simulated from team ratings.
   Standings: 2 points a win, 1 for an overtime or shootout loss. Playoffs: 1 v 4 and 2 v 3, best of three, then a best-of-three final. */
const SEA_GAMES=10;
function seaSchedule(){ // a double round robin by the circle method: 5 rounds of 3 games, then the same with home and away swapped
  const t=[0,1,2,3,4,5], R=[];
  for(let r=0;r<5;r++){ const day=[]; for(let i=0;i<3;i++){ const a=t[i], b=t[5-i]; day.push(r%2?[b,a]:[a,b]); } R.push(day); t.splice(1,0,t.pop()); }
  const days=R.concat(R.map(d=>d.map(([h,a])=>[a,h])));   // each opponent once in each half
  return days.map(d=>d.map(([h,a])=>({h,a,r:null}))); }
function newSeason(){ S.sea={team:S.team, diff:S.diff, len:S.len, day:0, sched:seaSchedule(), stats:{}, phase:"reg", po:null, champ:null}; save(); }

/* ---------- simulated games ---------- */
const POW=TEAMS.map(t=>teamPower(t.ab)), POWAV={off:POW.reduce((s,p)=>s+p.off,0)/6, def:POW.reduce((s,p)=>s+p.def,0)/6};
function pois(l){ const L=Math.exp(-l); let k=0, p=1; do{ k++; p*=Math.random(); }while(p>L); return k-1; }
function pickW(arr,w){ const tot=arr.reduce((s,x)=>s+w(x),0); let r=Math.random()*tot; for(const x of arr){ r-=w(x); if(r<=0) return x; } return arr[arr.length-1]; }
function credit(sea,ab,name,kind){ const k=ab+"|"+name, o=sea.stats[k]||(sea.stats[k]={ab,n:name,g:0,a:0}); o[kind]++; }
function simScorers(sea,ti,n){ const R=ROSTERS[TEAMS[ti].ab], sk=[...R.F.flat().map(p=>({p,w:Math.pow(p[3]/80,5)})),...R.D.flat().map(p=>({p,w:Math.pow(p[3]/80,5)*.35}))];
  for(let i=0;i<n;i++){ const s=pickW(sk,x=>x.w); credit(sea,TEAMS[ti].ab,s.p[1],"g");
    const rest=sk.filter(x=>x!==s), na=Math.random()<.82?(Math.random()<.65?2:1):0;
    for(let j=0;j<na;j++){ const a=pickW(rest,x=>Math.pow(x.p[4]/80,5)); credit(sea,TEAMS[ti].ab,a.p[1],"a"); rest.splice(rest.indexOf(a),1); } } }
function simGame(sea,h,a,playoff){ const H=POW[h], A=POW[a], k=x=>Math.pow(x,6);
  const lh=3.05*k(H.off/POWAV.off)/k(A.def/POWAV.def)*1.05, la=3.05*k(A.off/POWAV.off)/k(H.def/POWAV.def)*.95;
  let gh=pois(lh), ga=pois(la), ty="";
  simScorers(sea,h,gh); simScorers(sea,a,ga);
  if(gh===ga){ const hw=Math.random()<lh/(lh+la);
    if(playoff||Math.random()<.58){ ty="OT"; if(hw){ gh++; simScorers(sea,h,1); } else { ga++; simScorers(sea,a,1); } }
    else { ty="SO"; if(hw) gh++; else ga++; } }
  return {h:gh,a:ga,ty}; }

/* ---------- standings ---------- */
function standings(sea){ const T=TEAMS.map((_,t)=>({t,gp:0,w:0,l:0,otl:0,pts:0,gf:0,ga:0}));
  for(const day of sea.sched) for(const g of day){ if(!g.r) continue; const H=T[g.h], A=T[g.a], hw=g.r.h>g.r.a;
    H.gp++; A.gp++; H.gf+=g.r.h; H.ga+=g.r.a; A.gf+=g.r.a; A.ga+=g.r.h;
    const W=hw?H:A, L=hw?A:H; W.w++; W.pts+=2; if(g.r.ty){ L.otl++; L.pts++; } else L.l++; }
  return T.sort((x,y)=>y.pts-x.pts||y.w-x.w||(y.gf-y.ga)-(x.gf-x.ga)||y.gf-x.gf); }
const myGame=sea=>sea.sched[sea.day]&&sea.sched[sea.day].find(g=>g.h===sea.team||g.a===sea.team);
function finishDay(sea){ for(const g of sea.sched[sea.day]) if(!g.r) g.r=simGame(sea,g.h,g.a,false);
  sea.day++; if(sea.day>=SEA_GAMES) startPlayoffs(sea); }

/* ---------- playoffs ---------- */
function startPlayoffs(sea){ const st=standings(sea).map(r=>r.t); sea.seed=st; sea.phase="po";
  sea.po={round:0, series:[{a:st[0],b:st[3],w:[0,0],g:[]},{a:st[1],b:st[2],w:[0,0],g:[]}], final:null}; }
const seriesDone=s=>s.w[0]>=2||s.w[1]>=2;
const seriesWinner=s=>s.w[0]>=2?s.a:s.w[1]>=2?s.b:null;
const activeSeries=sea=>sea.po?(sea.po.round===0?sea.po.series:[sea.po.final]).filter(s=>s&&!seriesDone(s)):[];
const mySeries=sea=>activeSeries(sea).find(s=>s.a===sea.team||s.b===sea.team);
const seriesHome=s=>s.g.length===1?s.b:s.a;    // the higher seed hosts games 1 and 3
function addSeriesGame(s,r,h){ const aIsHome=h===s.a, ga=aIsHome?r.h:r.a, gb=aIsHome?r.a:r.h; s.g.push({h,ga,gb,ty:r.ty}); s.w[ga>gb?0:1]++; }
function poAdvance(sea){ const po=sea.po;
  if(po.round===0&&po.series.every(seriesDone)){ const w=po.series.map(seriesWinner).sort((x,y)=>sea.seed.indexOf(x)-sea.seed.indexOf(y)); po.final={a:w[0],b:w[1],w:[0,0],g:[]}; po.round=1; }
  else if(po.round===1&&seriesDone(po.final)){ sea.champ=seriesWinner(po.final); sea.phase="done"; } }
function simPlayoffDay(sea,skipMine){ for(const s of activeSeries(sea)){ if(skipMine&&(s.a===sea.team||s.b===sea.team)) continue; const h=seriesHome(s), aw=h===s.a?s.b:s.a; addSeriesGame(s,simGame(sea,h,aw,true),h); } poAdvance(sea); }

/* ---------- your games ---------- */
function seaNextOpp(sea){ if(sea.phase==="reg"){ const g=myGame(sea); return g?{opp:g.h===sea.team?g.a:g.h, away:g.a===sea.team, playoff:false}:null; }
  const s=mySeries(sea); if(!s) return null; const h=seriesHome(s); return {opp:s.a===sea.team?s.b:s.a, away:h!==sea.team, playoff:true, s}; }
function playSeasonGame(){ const sea=S.sea, n=seaNextOpp(sea); if(!n) return; play({team:sea.team, opp:n.opp, away:n.away, season:true, playoff:n.playoff, len:sea.len, diff:sea.diff}); }
// called when your season game ends: store the score, credit the scorers, play out the rest of the day
function seasonResult(g,ty){ const sea=S.sea; if(!sea) return ""; const me=sea.team, n=seaNextOpp(sea); if(!n) return "";
  const myGoals=g.sc[0], theirs=g.sc[1], hR=n.away?theirs:myGoals, aR=n.away?myGoals:theirs, r={h:hR,a:aR,ty};
  for(const x of g.goals){ const ab=TEAMS[x.t===0?me:n.opp].ab; if(x.nm) credit(sea,ab,x.nm,"g"); (x.an||[]).forEach(a=>credit(sea,ab,a,"a")); }
  if(sea.phase==="reg"){ myGame(sea).r=r; finishDay(sea);
    if(sea.phase==="po") return mySeries(sea)?"Regular season done. You made the playoffs!":"Regular season done. You missed the playoffs.";
    const st=standings(sea), i=st.findIndex(x=>x.t===me), R=st[i]; return `${R.w}-${R.l}-${R.otl}, ${ord(i+1)} place`; }
  const s=n.s, h=seriesHome(s); addSeriesGame(s,r,h); simPlayoffDay(sea,true);
  if(sea.phase==="done") return sea.champ===me?"You won the championship!":`${TEAMS[sea.champ].n} won the final.`;
  if(seriesDone(s)) return seriesWinner(s)===me?"You won the series! On to the final.":"Your season is over.";
  const mw=s.a===me?s.w[0]:s.w[1], tw=s.a===me?s.w[1]:s.w[0]; return mw===tw?`Series tied ${mw}-${tw}`:mw>tw?`You lead the series ${mw}-${tw}`:`You trail the series ${mw}-${tw}`; }
const ord=n=>n+(["th","st","nd","rd"][(n%100-20)%10]||["th","st","nd","rd"][n%100]||"th");

/* ---------- the season screen ---------- */
const NICK={BOS:"Bruins",CHI:"Blackhawks",DET:"Red Wings",MTL:"Canadiens",NYR:"Rangers",TOR:"Maple Leafs"};
const chip=t=>{ const x=TEAMS[t]; return `<span class="tchip"><i style="--c:${x.c};--k:${x.k}">${esc(x.ab)}</i>${esc(NICK[x.ab])}</span>`; };
function seasonScreen(){ const sea=S.sea; if(!sea){ newSeason(); return seasonScreen(); }
  const me=sea.team, st=standings(sea), n=seaNextOpp(sea), D=DIFF[sea.diff].n;
  let top="";
  if(sea.phase==="reg"&&n){ top=`<section class="card nextg"><p class="ovk" style="text-align:left">Game ${sea.day+1} of ${SEA_GAMES} · ${n.away?"away":"home"}</p>
      <div class="match"><div class="side"><span class="jersey" style="--c:${TEAMS[me].c};--k:${TEAMS[me].k}">${TEAMS[me].ab}</span><b>${esc(TEAMS[me].n)}</b><small>You</small></div><span class="vs">${n.away?"at":"vs"}</span>
        <div class="side"><span class="jersey" style="--c:${TEAMS[n.opp].c};--k:${TEAMS[n.opp].k}">${TEAMS[n.opp].ab}</span><b>${esc(TEAMS[n.opp].n)}</b><small>${seaRec(st,n.opp)}</small></div></div>
      <div class="row2"><button class="btn go" data-act="sea-play">Play</button><button class="btn ghost" data-act="sea-sim">Sim game</button></div></section>`; }
  else if(sea.phase==="po"){ const s=n&&n.s;
    top=s?`<section class="card nextg"><p class="ovk" style="text-align:left">${sea.po.round===0?"Semifinal":"Final"} · game ${s.g.length+1} · ${n.away?"away":"home"}</p>
      <div class="match"><div class="side"><span class="jersey" style="--c:${TEAMS[me].c};--k:${TEAMS[me].k}">${TEAMS[me].ab}</span><b>${esc(TEAMS[me].n)}</b><small>${s.a===me?s.w[0]:s.w[1]} wins</small></div><span class="vs">${n.away?"at":"vs"}</span>
        <div class="side"><span class="jersey" style="--c:${TEAMS[n.opp].c};--k:${TEAMS[n.opp].k}">${TEAMS[n.opp].ab}</span><b>${esc(TEAMS[n.opp].n)}</b><small>${s.a===me?s.w[1]:s.w[0]} wins</small></div></div>
      <div class="row2"><button class="btn go" data-act="sea-play">Play</button><button class="btn ghost" data-act="sea-sim">Sim game</button></div><p class="muted center">Best of three. Playoff overtime has no shootout.</p></section>`
      :`<section class="card nextg"><p class="ovk" style="text-align:left">Playoffs</p><p class="muted">${sea.seed.indexOf(me)>3?"You missed the playoffs this time.":"You've been knocked out."} Watch the rest play out.</p>
      <div class="row2"><button class="btn go" data-act="sea-simpo">Sim next game</button><button class="btn ghost" data-act="sea-simall">Sim to the end</button></div></section>`; }
  else if(sea.phase==="done"){ const c=sea.champ, x=TEAMS[c];
    top=`<section class="card champ"><p class="ovk">Champions</p><span class="jersey" style="--c:${x.c};--k:${x.k}">${x.ab}</span><h2 class="ovh ${c===me?"win":""}">${esc(x.n)}</h2>
      <p class="muted">${c===me?"You won it all!":"Better luck next season."}</p><button class="btn go wide" data-act="sea-new">Start a new season</button></section>`; }
  const last=sea.phase==="reg"&&sea.day>0?sea.sched[sea.day-1]:null;
  app.innerHTML=`<div class="bar"><button class="x" data-act="home" aria-label="Back"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M14 4 7 11l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ttl">Season · ${esc(TEAMS[me].n)}</div></div>
  ${top}
  ${sea.po?bracket(sea):""}
  <section class="card"><h3>Standings</h3><table class="stand"><thead><tr><th></th><th>Team</th><th>GP</th><th>W</th><th>L</th><th>OTL</th><th>Pts</th><th>+/-</th></tr></thead><tbody>
    ${st.map((r,i)=>`<tr class="${r.t===me?"me":""} ${i===4?"cut":""}"><td>${i+1}</td><td>${chip(r.t)}</td><td>${r.gp}</td><td>${r.w}</td><td>${r.l}</td><td>${r.otl}</td><td class="pts">${r.pts}</td><td>${r.gf-r.ga>0?"+":""}${r.gf-r.ga}</td></tr>`).join("")}
  </tbody></table><p class="muted">Top four make the playoffs. ${D} difficulty, ${sea.len}-minute periods.</p></section>
  ${last?`<section class="card"><h3>Last game day</h3><div class="res">${last.map(g=>`<div class="${g.h===me||g.a===me?"me":""}"><span>${chip(g.a)}</span><b>${g.r.a} – ${g.r.h}${g.r.ty?" "+g.r.ty:""}</b><span>${chip(g.h)}</span></div>`).join("")}</div><p class="muted">Away team on the left.</p></section>`:""}
  ${leaders(sea)}
  <section class="card"><h3>${esc(TEAMS[me].n)} lines</h3>${linesHtml(TEAMS[me].ab)}</section>
  <button class="btn ghost wide" data-act="sea-quit">End this season</button>`;
  scrollTo(0,0); }
const seaRec=(st,t)=>{ const r=st.find(x=>x.t===t); return `${r.w}-${r.l}-${r.otl}`; };
function bracket(sea){ const po=sea.po, me=sea.team;
  const row=(s,lbl)=>{ if(!s) return `<div class="series"><small>${lbl}</small><div><span class="muted">Waiting for the semifinals</span></div></div>`; const w=seriesWinner(s);
    return `<div class="series"><small>${lbl}</small>${[[s.a,s.w[0]],[s.b,s.w[1]]].map(([t,n])=>`<div class="${w===t?"won":w!=null?"out":""}">${chip(t)}${t===me?" <em class=\"muted\">you</em>":""}<b>${n}</b></div>`).join("")}</div>`; };
  return `<section class="card"><h3>Playoffs</h3><div class="bracket">${row(po.series[0],"Semifinal · 1 v 4")}${row(po.series[1],"Semifinal · 2 v 3")}${row(po.final,"Final")}</div></section>`; }
function leaders(sea){ const L=Object.values(sea.stats).map(o=>({...o,p:o.g+o.a})).sort((x,y)=>y.p-x.p||y.g-x.g).slice(0,8);
  if(!L.length) return "";
  return `<section class="card"><h3>Scoring leaders</h3><div class="lead"><div class="hd"><span></span><span>Player</span><span></span><b>G</b><b>A</b><b>P</b></div>
    ${L.map((o,i)=>`<div><span>${i+1}</span><span>${esc(o.n)}</span><em>${esc(o.ab)}</em><b>${o.g}</b><b>${o.a}</b><b>${o.p}</b></div>`).join("")}</div></section>`; }
function linesHtml(ab){ const R=ROSTERS[ab], nm=p=>`${esc(lastName(p[1]))}`;
  return `<div class="lines">${R.F.map((l,i)=>`<div><b>Line ${i+1}</b> ${l.map(nm).join(" – ")}</div>`).join("")}${R.D.map((l,i)=>`<div><b>Pair ${i+1}</b> ${l.map(nm).join(" – ")}</div>`).join("")}<div><b>Goalie</b> ${nm(R.G)}</div>
    <div class="muted" style="font-size:12px">Real lines as of ${ROSTER_DATE}. Ratings are estimates.</div></div>`; }
function seasonAct(a,b){ const sea=S.sea;
  if(a==="sea-play") return playSeasonGame();
  if(a==="sea-sim"){ const n=seaNextOpp(sea); if(!n) return;
    if(sea.phase==="reg"){ const g=myGame(sea); g.r=simGame(sea,g.h,g.a,false); finishDay(sea); }
    else { const h=seriesHome(n.s), aw=h===n.s.a?n.s.b:n.s.a; addSeriesGame(n.s,simGame(sea,h,aw,true),h); simPlayoffDay(sea,true); } }
  else if(a==="sea-simpo"){ simPlayoffDay(sea,false); }
  else if(a==="sea-simall"){ let k=0; while(sea.phase==="po"&&k++<20) simPlayoffDay(sea,false); }
  else if(a==="sea-new"){ newSeason(); }
  else if(a==="sea-quit"){ if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to end the season"; return; } S.sea=null; save(); return home(); }
  save(); seasonScreen(); }
