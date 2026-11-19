/* ================= HOCKEY: 5-on-5 arcade hockey against the computer =================
   Top-down rink in feet (85 wide, 200 long). You always attack up the screen.
   You control one skater (the puck carrier when your team has it); the computer plays everyone else.
   No offsides or icing. Three periods, sudden-death overtime, then a shootout (playoff games keep playing overtime).
   Each team dresses its real top two lines and pairs (rosters.js), with ratings that change speed, shots, passing and hits. */
const APP_VERSION="dev";
const LS="globetrotter.hockey.v1";
const $=id=>document.getElementById(id);
const app=$('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const clamp=(v,a,b)=>v<a?a:v>b?b:v, hyp=Math.hypot, rnd=(a,b)=>a+Math.random()*(b-a), PI=Math.PI;

// the Original Six, in their home colors (c jersey, k numbers). Logos stay off: the site is public, so each team shows its city letters.
const TEAMS=[
  {n:"Boston Bruins",ab:"BOS",c:"#111111",k:"#FFB81C"},
  {n:"Chicago Blackhawks",ab:"CHI",c:"#CF0A2C",k:"#ffffff"},
  {n:"Detroit Red Wings",ab:"DET",c:"#CE1126",k:"#ffffff"},
  {n:"Montreal Canadiens",ab:"MTL",c:"#AF1E2D",k:"#ffffff",s:"#192168"},
  {n:"New York Rangers",ab:"NYR",c:"#0038A8",k:"#ffffff",s:"#CE1126"},
  {n:"Toronto Maple Leafs",ab:"TOR",c:"#00205B",k:"#ffffff"}];
/*ROSTERS*/
const hexRGB=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clash=(a,b)=>{ const x=hexRGB(a.c), y=hexRGB(b.c); return hyp(x[0]-y[0],x[1]-y[1],x[2]-y[2])<150; };
// when the colors are too close (two red teams, two blue teams), the visitors wear road whites
const road=t=>({...t, c:"#f4f5f7", k:t.c==="#111111"?"#111111":t.c, rim:t.c==="#111111"?"#FFB81C":t.c, road:true})
// how the computer team plays: skating speed, seconds between decisions, shot spread, goalie skill, checking, faceoffs
const DIFF=[
  {n:"Rookie",  spd:.88, dec:.5,  acc:.15, gk:.80, gsp:11, chk:.28, fo:.38},
  {n:"Pro",     spd:.96, dec:.32, acc:.10, gk:.86, gsp:13, chk:.42, fo:.5},
  {n:"All-Star",spd:1.03,dec:.2,  acc:.065,gk:.905,gsp:15.5,chk:.58, fo:.6}];
const MINE={dec:.3, acc:.1, gk:.86, gsp:13.5};   // your goalie and the teammates the computer runs for you
const LENS=[2,3,5];
const FRESH=()=>({team:0, diff:1, len:3, sound:true, rec:{w:0,l:0,otl:0}, last:[], tot:{gp:0,gf:0,ga:0,sh:0,hits:0}, tips:false, sea:null});
let S=FRESH();
try{ const raw=localStorage.getItem(LS); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
function save(){ try{ localStorage.setItem(LS,JSON.stringify(S)); }catch(e){} }

/* ---------- the rink ---------- */
const RW=85, RL=200, CR=28, GLY=11, PX0=39.5, PX1=45.5, ND=3.5;   // corner radius, goal line, posts, net depth
const PR=1.7, GR=2.15, PKR=.5;                                      // skater, goalie and puck radii
const DOTS=[[42.5,100],[20.5,31],[64.5,31],[20.5,169],[64.5,169],[20.5,80],[64.5,80],[20.5,120],[64.5,120]];
// each team sees the rink as if it attacks up: team 1's view is the rink turned around
const P_=(t,x,y)=>t?[RW-x,RL-y]:[x,y];
const V_=(t,x,y)=>t?[-x,-y]:[x,y];
const NETS=[{x0:PX0,x1:PX1,y0:GLY-ND,y1:GLY},{x0:PX0,x1:PX1,y0:RL-GLY,y1:RL-GLY+ND}];

function boardClamp(o,r){   // keeps a circle inside the boards; returns the inward normal when it touched
  let cx=null, cy=null;
  if(o.y<CR){ if(o.x<CR){cx=CR;cy=CR;} else if(o.x>RW-CR){cx=RW-CR;cy=CR;} }
  else if(o.y>RL-CR){ if(o.x<CR){cx=CR;cy=RL-CR;} else if(o.x>RW-CR){cx=RW-CR;cy=RL-CR;} }
  if(cx!==null){ const dx=o.x-cx, dy=o.y-cy, d=hyp(dx,dy), m=CR-r; if(d>m){ const nx=dx/d, ny=dy/d; o.x=cx+nx*m; o.y=cy+ny*m; return [-nx,-ny]; } return null; }
  if(o.x<r){ o.x=r; return [1,0]; } if(o.x>RW-r){ o.x=RW-r; return [-1,0]; }
  if(o.y<r){ o.y=r; return [0,1]; } if(o.y>RL-r){ o.y=RL-r; return [0,-1]; }
  return null; }
function netHit(o,r,open){   // the nets are solid boxes; for the puck the mouth stays open (crossing the goal line there is a goal)
  for(const n of NETS){ if(open&&o.x>n.x0&&o.x<n.x1&&(n.y0<100?o.y>n.y1-.05:o.y<n.y0+.05)) continue; if(o.x>n.x0-r&&o.x<n.x1+r&&o.y>n.y0-r&&o.y<n.y1+r){
    const L=o.x-(n.x0-r), R=(n.x1+r)-o.x, T=o.y-(n.y0-r), B=(n.y1+r)-o.y, m=Math.min(L,R,T,B);
    if(m===L){ o.x=n.x0-r; return [-1,0]; } if(m===R){ o.x=n.x1+r; return [1,0]; }
    if(m===T){ o.y=n.y0-r; return [0,-1]; } o.y=n.y1+r; return [0,1]; } }
  return null; }
function reflect(o,n,e){ const vn=o.vx*n[0]+o.vy*n[1]; if(vn<0){ o.vx-=(1+e)*vn*n[0]; o.vy-=(1+e)*vn*n[1]; } }
function segDist(px,py,ax,ay,bx,by){ const dx=bx-ax, dy=by-ay, L=dx*dx+dy*dy||1; const t=clamp(((px-ax)*dx+(py-ay)*dy)/L,0,1); return hyp(px-ax-t*dx,py-ay-t*dy); }

/* ---------- sound ---------- */
let AC=null, NB=null;
function ac(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume(); }catch(e){ AC=null; } return AC; }
function nbuf(a){ if(NB) return NB; const n=a.sampleRate*2|0, b=a.createBuffer(1,n,a.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1; return NB=b; }
function burst(a,t,dur,vol,f,type,q){ const s=a.createBufferSource(); s.buffer=nbuf(a); const fl=a.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const gn=a.createGain();
  gn.gain.setValueAtTime(vol,t); gn.gain.exponentialRampToValueAtTime(.001,t+dur); s.connect(fl).connect(gn).connect(a.destination); s.start(t); s.stop(t+dur+.02); }
function tone(a,t,f,dur,vol,type,f2){ const o=a.createOscillator(), gn=a.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(vol,t+.01); gn.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(gn).connect(a.destination); o.start(t); o.stop(t+dur+.02); }
function sfx(k){ if(!S.sound||(G&&G.auto)) return; const a=ac(); if(!a) return; const t=a.currentTime;
  if(k==="stick") burst(a,t,.05,.22,2400,"bandpass",2);
  else if(k==="pass") burst(a,t,.07,.32,1800,"bandpass",1.5);
  else if(k==="shot"){ burst(a,t,.12,.7,1200,"bandpass",.8); tone(a,t,180,.08,.25,"triangle",60); }
  else if(k==="board") burst(a,t,.16,.45,300,"lowpass",.7);
  else if(k==="save") burst(a,t,.11,.55,650,"bandpass",1);
  else if(k==="post"){ tone(a,t,1750,.4,.3,"sine"); tone(a,t,2630,.28,.14,"sine"); }
  else if(k==="drop") tone(a,t,620,.05,.14,"square");
  else if(k==="hit"){ burst(a,t,.22,.85,170,"lowpass",.8); tone(a,t,95,.2,.5,"sine",45); }
  else if(k==="whistle"){ const o=a.createOscillator(), lfo=a.createOscillator(), lg=a.createGain(), gn=a.createGain(); o.frequency.value=2900; lfo.frequency.value=28; lg.gain.value=130; lfo.connect(lg).connect(o.frequency);
    gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(.16,t+.02); gn.gain.setValueAtTime(.16,t+.42); gn.gain.exponentialRampToValueAtTime(.001,t+.58); o.connect(gn).connect(a.destination); o.start(t); lfo.start(t); o.stop(t+.6); lfo.stop(t+.6); }
  else if(k==="horn"||k==="goal"){ const L=k==="goal"?1.7:1; [155,196,233].forEach(f=>{ const o=a.createOscillator(), gn=a.createGain(), lp=a.createBiquadFilter(); o.type="sawtooth"; o.frequency.value=f; lp.type="lowpass"; lp.frequency.value=1300;
      gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(.085,t+.05); gn.gain.setValueAtTime(.085,t+L); gn.gain.exponentialRampToValueAtTime(.001,t+L+.35); o.connect(lp).connect(gn).connect(a.destination); o.start(t); o.stop(t+L+.4); });
    if(k==="goal") burst(a,t+.05,2,.14,900,"bandpass",.4); }
}
function snd(k){ sfx(k); }   // the big moments; the tab bar adds a haptic tap to these

/* ================= the game ================= */
const ROLES=["C","LW","RW","LD","RD","G"];
const PER=["1st","2nd","3rd","OT","SO"];
const perName=per=>per<=3?PER[per-1]:per===4?"OT":`${per-3}OT`;
const perLabel=g=>g.so?"SO":perName(g.per);
const IN={jx:0,jy:0,kx:0,ky:0,a:false,aDown:false,bDown:false,charging:false,ch:0,ot:false};
const SLOT={LW:0,C:1,RW:2,LD:0,RD:1};
// put a team's current line on the ice: the five skater slots take that line's players and ratings
function setLines(t){ const g=G, R=ROSTERS[g.T[t].ab];
  for(const p of g.P){ if(p.t!==t) continue; const d=p.g?R.G:(p.role==="LD"||p.role==="RD")?R.D[g.dl[t]][SLOT[p.role]]:R.F[g.fl[t]][SLOT[p.role]];
    p.num=d[0]; p.name=d[1]; p.ln=lastName(d[1]); p.r=p.g?{gk:d[2]}:{sk:d[2],sh:d[3],ps:d[4],ck:d[5]}; } }
// shifts: forwards change after about 40 seconds of play and the D after 55, at the next faceoff
function lineChange(){ const g=G; let ch=false; for(const t of [0,1]){
  if(g.shF[t]>40){ g.fl[t]^=1; g.shF[t]=0; ch=true; } if(g.shD[t]>55){ g.dl[t]^=1; g.shD[t]=0; ch=true; } setLines(t); } return ch; }
let G=null;

function newGame(opt={}){
  const ti=opt.team!=null?opt.team:S.team; let oi=opt.opp; if(oi==null){ do{ oi=Math.floor(Math.random()*TEAMS.length); }while(oi===ti); }
  const P=[], cl=clash(TEAMS[ti],TEAMS[oi]);
  [0,1].forEach(t=>ROLES.forEach(r=>P.push({t,role:r,g:r==="G",num:0,name:"",ln:"",r:{},x:0,y:0,vx:0,vy:0,fx:0,fy:t?1:-1,wx:0,wy:0,
    stun:0,cd:0,boost:0,hitting:0,chk:0,dec:rnd(0,.3),tt:0,tgt:null,hold:0,jit:rnd(-3,3),on:true,dk:0,bite:0})));
  G={T:[cl&&opt.away?road(TEAMS[ti]):TEAMS[ti], cl&&!opt.away?road(TEAMS[oi]):TEAMS[oi]], ti, oi, P, d:DIFF[opt.diff!=null?opt.diff:S.diff], auto:!!opt.auto,
     season:!!opt.season, playoff:!!opt.playoff, len:opt.len||S.len, fl:[0,0], dl:[0,0], shF:[0,0], shD:[0,0], camX:42.5,
     pk:{x:42.5,y:100,vx:0,vy:0,owner:null,last:null,passTo:null,shot:false,shooter:null,ghost:null,hist:[],still:0,trail:[]},
     per:1, clock:(opt.len||S.len)*60, sc:[0,0], st:[{sh:0,hits:0,fo:0},{sh:0,hits:0,fo:0}], goals:[], state:"faceoff", tm:0, ctl:null, cam:100, ph:[], so:null, shake:0, paused:false};
  G.ctl=P.find(p=>p.t===0&&p.role==="C");
  setLines(0); setLines(1);
  IN.charging=false; IN.aDown=IN.bDown=false; IN.ot=false;
  faceoff(42.5,100,true);
}
const team=(t,sk=true)=>G.P.filter(p=>p.t===t&&p.on&&(!sk||!p.g));
const goalieOf=t=>G.P.find(p=>p.g&&p.t===t);

function faceoff(dx,dy,quiet){ const g=G, pk=g.pk;
  Object.assign(pk,{x:dx,y:dy,vx:0,vy:0,owner:null,passTo:null,shot:false,shooter:null,ghost:null,hist:[],still:0,trail:[]});
  g.state="faceoff"; g.tm=0; g.dropped=false; g.foTap=false; g.ph=[]; if(!g.so) lineChange(); IN.ot=false;
  for(const p of g.P){ if(!p.on) continue; let x,y;
    if(p.g){ x=42.5; y=RL-GLY-2.4; }
    else { const [nx,ny]=P_(p.t,dx,dy), o={C:[0,3.4],LW:[-14,5],RW:[14,5],LD:[-10,17],RD:[10,17]}[p.role]; x=clamp(nx+o[0],5,RW-5); y=clamp(ny+o[1],8,RL-GLY-7); }
    [p.x,p.y]=P_(p.t,x,y); p.vx=p.vy=p.wx=p.wy=0; p.stun=p.cd=p.boost=p.hitting=0; p.fx=0; p.fy=p.t?1:-1; boardClamp(p,PR); }
  if(g.ctl&&!g.ctl.on) g.ctl=team(0)[0]||g.ctl;
  if(!g.auto&&g.ctl!==g.P.find(p=>p.t===0&&p.role==="C")) g.ctl=g.P.find(p=>p.t===0&&p.role==="C");
  if(!quiet) msg("Faceoff");
}
function whistle(text,dot){ const g=G; g.state="whistle"; g.tm=0; g.foDot=dot; const pk=g.pk; pk.owner=null; pk.vx=pk.vy=0; snd("whistle"); if(text) msg(text); }
const nearestDot=(x,y)=>DOTS.slice(1).reduce((b,d)=>hyp(d[0]-x,d[1]-y)<hyp(b[0]-x,b[1]-y)?d:b);

/* ---------- puck handling ---------- */
function release(p){ const pk=G.pk; pk.owner=null; p.cd=G.so?99:.28; p.hold=0; pk.shot=false; pk.ghost=null; pk.passTo=null; }
function take(p){ const g=G, pk=g.pk, wasPass=pk.passTo===p&&p.t===(pk.last&&pk.last.t);
  pk.owner=p; pk.passTo=null; pk.shot=false; pk.ghost=null; p.hold=0;
  if(pk.hist.length&&pk.hist[pk.hist.length-1].t!==p.t) pk.hist=[];
  if(pk.hist[pk.hist.length-1]!==p) pk.hist.push(p); if(pk.hist.length>3) pk.hist.shift();
  pk.last=p; sfx("stick");
  const human=!g.auto&&p===g.ctl;
  if(wasPass&&g.state==="play"){ const n=P_(p.t,p.x,p.y), slot=n[1]<40&&n[1]>GLY+3&&Math.abs(n[0]-42.5)<22;
    if(human&&IN.ot){ IN.ot=false; IN.charging=false; shoot(p,.85,Math.abs(IN.jx)>.3?Math.sign(IN.jx):0,true); return; }
    if(!human&&!(p.t===0&&!g.auto)&&slot&&Math.random()<.45){ shoot(p,.8,0,true); return; } }
  if(p.t!==0||g.auto) IN.ot=false;
  if(g.auto) return;
  if(p.t===0) g.ctl=p;
  else if(g.ctl&&hyp(g.ctl.x-pk.x,g.ctl.y-pk.y)>16) switchCtl(); }
function pass(p,m){ const pk=G.pk; let tx=m.x, ty=m.y; const sp=clamp(hyp(tx-pk.x,ty-pk.y)*1.5+30,42,88);
  for(let i=0;i<2;i++){ const tt=hyp(tx-pk.x,ty-pk.y)/sp; tx=m.x+m.vx*tt*.85; ty=m.y+m.vy*tt*.85; }
  const dx=tx-pk.x, dy=ty-pk.y, d=hyp(dx,dy)||1, err=(1-p.r.ps/100)*.12*(Math.random()*2-1), ca=Math.cos(err), sa=Math.sin(err);
  release(p); pk.vx=(dx*ca-dy*sa)/d*sp*1.08; pk.vy=(dx*sa+dy*ca)/d*sp*1.08; pk.passTo=m; pk.last=p; p.fx=dx/d; p.fy=dy/d; sfx("pass"); }
function shoot(p,power,side,ot){ const g=G, pk=g.pk, gy=p.t===0?GLY:RL-GLY, gl=goalieOf(1-p.t);
  if(!side) side=gl&&gl.x>42.5?-1:1;            // the side the goalie isn't covering
  const tx=42.5+side*(2.2+Math.random()*.5);
  const q=p.t===1?g.d:MINE, acc=((p===g.ctl&&!g.auto)?.075:q.acc)*(1.5-p.r.sh/100);
  let a=Math.atan2(gy-pk.y,tx-pk.x)+(Math.random()*2-1)*acc*(.6+power*.6);
  const sp=(52+power*46)*(.86+p.r.sh/100*.18);
  release(p); pk.vx=Math.cos(a)*sp; pk.vy=Math.sin(a)*sp; pk.shot=true; pk.ot=!!ot; pk.shooter=p; pk.last=p; p.cd=g.so?99:.35; if(ot&&!g.auto) msg("One-timer!","",.7); p.fx=Math.cos(a); p.fy=Math.sin(a); sfx("shot"); }
// near the net the second button is a deke: a quick fake that sends the goalie (and a checker) the wrong way
function canDeke(c){ const n=P_(c.t,c.x,c.y), gd=hyp(n[0]-42.5,n[1]-GLY); return n[1]>GLY+2&&gd<30&&Math.abs(Math.atan2(n[0]-42.5,n[1]-GLY))<1.05; }
function deke(c,dir){ if(c.dk>0) return false; c.dk=.9; dir=dir||(Math.random()<.5?-1:1);
  c.vx+=dir*14*(.7+c.r.sk/300); c.boost=.25;
  const k=goalieOf(1-c.t); if(k&&hyp(k.x-c.x,k.y-c.y)<26){ k.bite=.5+c.r.ps/400; k.biteDir=-dir; }
  for(const o of team(1-c.t)) if(hyp(o.x-c.x,o.y-c.y)<7) o.chk=Math.max(o.chk,.8);
  sfx("stick"); if(c===G.ctl&&!G.auto) msg("Deke!","",.6); return true; }
function laneClear(p,tx,ty,w,skipG){ const pk=G.pk; for(const o of G.P){ if(!o.on||o.t===p.t||(skipG&&o.g)) continue; if(segDist(o.x,o.y,pk.x,pk.y,tx,ty)<w) return false; } return true; }
function bestPass(p){ const g=G, t=p.t, n=P_(t,p.x,p.y); let best=null, bs=1.5;
  for(const m of team(t)){ if(m===p||m.stun>0) continue; const d=hyp(m.x-p.x,m.y-p.y); if(d<9||d>80) continue;
    const M=P_(t,m.x,m.y); let open=99; for(const o of team(1-t)) open=Math.min(open,hyp(o.x-m.x,o.y-m.y));
    if(!laneClear(p,m.x,m.y,3,false)) continue;
    const s=Math.min(open,16)*.7+(n[1]-M[1])*.3-d*.12+(M[1]<75?4:0)+(M[1]<40&&Math.abs(M[0]-42.5)<14?5:0);
    if(s>bs){ bs=s; best=m; } }
  return best; }
function userPassTarget(c){ let ax=IN.jx, ay=IN.jy; if(hyp(ax,ay)<.3){ ax=c.fx; ay=c.fy; } const al=hyp(ax,ay)||1; ax/=al; ay/=al;
  let best=null, bs=-9; for(const m of team(0)){ if(m===c) continue; const dx=m.x-c.x, dy=m.y-c.y, d=hyp(dx,dy)||1; const s=(dx*ax+dy*ay)/d-d/160; if(s>bs){ bs=s; best=m; } }
  return best; }
function switchCtl(){ const g=G, pk=g.pk; let best=null, bd=1e9; for(const m of team(0)){ if(m===g.ctl) continue; const d=hyp(m.x-pk.x,m.y-pk.y); if(d<bd){ bd=d; best=m; } } if(best) g.ctl=best; }
function bodyCheck(h,v){ const g=G; v.stun=.6+(h.r.ck||70)/250; const dx=v.x-h.x, dy=v.y-h.y, d=hyp(dx,dy)||1; v.vx+=dx/d*14; v.vy+=dy/d*14; h.vx*=.5; h.vy*=.5; h.hitting=0;
  if(g.pk.owner===v){ release(v); v.cd=.8; const pk=g.pk; pk.vx=v.vx*.6+rnd(-10,10); pk.vy=v.vy*.6+rnd(-10,10); pk.last=h; }
  g.st[h.t].hits++; g.shake=.25; snd("hit"); }
function poke(p,c){ const pk=G.pk; release(c); c.cd=.5; const dx=p.x-pk.x, dy=p.y-pk.y, d=hyp(dx,dy)||1; pk.vx=dx/d*9+rnd(-7,7); pk.vy=dy/d*9+rnd(-7,7); pk.last=p; sfx("stick"); }

/* ---------- the computer players ---------- */
function maxS(p){ const g=G; if(p.g) return (p.t===1?g.d.gsp:MINE.gsp)*1.12;
  let s=31*(p.t===1?g.d.spd:1)*(.8+p.r.sk/400); if(g.pk.owner===p) s*=.92; if(p.boost>0) s*=1.32; if(p===g.ctl&&IN.charging&&!g.auto) s*=.6; return s; }
function seek(p,tx,ty){ const dx=tx-p.x, dy=ty-p.y, d=hyp(dx,dy), sp=d<.6?0:Math.min(maxS(p),d*2.4); p.wx=d?dx/d*sp:0; p.wy=d?dy/d*sp:0; }
function think(dt){ const g=G, pk=g.pk, own=pk.owner;
  for(const t of [0,1]){
    const mates=team(t), human=(t===0&&!g.auto)?g.ctl:null;
    let chaser=null;
    if(!own||own.t!==t){ const tg=own||pk, hd=human?hyp(human.x-tg.x,human.y-tg.y):1e9;
      const c=mates.filter(p=>p!==human&&p.stun<=0).sort((a,b)=>hyp(a.x-tg.x,a.y-tg.y)-hyp(b.x-tg.x,b.y-tg.y))[0];
      if(c&&(hyp(c.x-tg.x,c.y-tg.y)<hd||hd>12)) chaser=c; }
    for(const p of mates){ if(p===human) continue;
      if(p.stun>0){ p.wx=p.wy=0; continue; }
      if(own===p){ carrierAI(p,dt); continue; }
      if(!own&&pk.passTo===p){ const dx=pk.x-p.x, dy=pk.y-p.y, d=hyp(dx,dy)||1; p.wx=dx/d*Math.min(9,d*2); p.wy=dy/d*Math.min(9,d*2); continue; }
      if(p===chaser){ if(own){ const C=P_(t,own.x,own.y), dx=42.5-C[0], dy=189-C[1], d=hyp(dx,dy)||1; const [x,y]=P_(t,C[0]+dx/d*1.3,C[1]+dy/d*1.3); seek(p,x,y); tryCheck(p,own,dt); }
        else seek(p,pk.x+pk.vx*.3,pk.y+pk.vy*.3); continue; }
      p.tt-=dt; if(p.tt<=0||!p.tgt){ p.tgt=spot(p,t,own); p.tt=.12; }
      seek(p,p.tgt[0],p.tgt[1]); } }
  for(const p of g.P) if(p.g&&p.on) goalieAI(p); }
function spot(p,t,own){ const g=G, pk=g.pk, P=P_(t,pk.x,pk.y), r=p.role, j=p.jit;
  const att=own?own.t===t:(pk.last?pk.last.t===t:false); let x,y;
  if(att){
    if(P[1]<75){ if(r==="C"){ x=42.5+(P[0]-42.5)*.25; y=23+j*.5; } else if(r==="LW"){ x=15+j; y=clamp(P[1]+3,24,58); } else if(r==="RW"){ x=70+j; y=clamp(P[1]+3,24,58); }
      else if(r==="LD"){ x=25+j*.5; y=69; } else { x=60+j*.5; y=69; } }
    else { const fy=clamp(P[1]-16,30,165);
      if(r==="C"){ x=42.5+(P[0]-42.5)*.4; y=fy+5; } else if(r==="LW"){ x=13+j; y=fy; } else if(r==="RW"){ x=72+j; y=fy; }
      else { x=r==="LD"?27:58; y=clamp(P[1]+20,62,180); } } }
  else { const MK={LD:"RW",RD:"LW",C:"C",LW:"RD",RW:"LD"}, m=g.P.find(o=>o.t!==t&&o.on&&o.role===MK[r]);
    if(m&&m!==own){ const M=P_(t,m.x,m.y), dx=42.5-M[0], dy=189-M[1], d=hyp(dx,dy)||1, D=r==="LD"||r==="RD", k=D?5:3.5; x=M[0]+dx/d*k; y=M[1]+dy/d*k; if(D) y=Math.max(y,Math.min(P[1]+6,150)); }
    else { x=42.5+(P[0]-42.5)*.3; y=Math.min(176,P[1]+12); } }
  return P_(t,clamp(x,3,RW-3),clamp(y,3,RL-3)); }
function tryCheck(p,c,dt){ p.chk-=dt; if(p.chk>0) return; if(hyp(p.x-c.x,p.y-c.y)>4.2) return;
  const q=(p.t===1?G.d.chk:.42)*(.7+(p.r.ck-(c.r.sk+c.r.ps)/2+70)/230); p.chk=rnd(.45,1);
  if(Math.random()<q){ if(Math.random()<.45) bodyCheck(p,c); else poke(p,c); } else p.chk+=.3; }
function carrierAI(p,dt){ const g=G, t=p.t, Q=t===1?g.d:MINE, so=!!g.so, n=P_(t,p.x,p.y);
  p.hold+=dt; p.dec-=dt;
  let tx, ty;
  if(so){ if(p.soSide==null) p.soSide=Math.random()<.5?-1:1; tx=42.5+p.soSide*6; ty=22; }
  else if(n[1]>75){ tx=42.5+(n[0]-42.5)*.5; ty=58; }
  else { tx=42.5+(n[0]-42.5)*.3; ty=26; }
  let dx=tx-n[0], dy=ty-n[1]; const dd=hyp(dx,dy)||1; dx/=dd; dy/=dd;
  let press=99, ax=0, ay=0;
  for(const o of g.P){ if(!o.on||o.t===t) continue; const q=P_(t,o.x,o.y), rx=q[0]-n[0], ry=q[1]-n[1], rd=hyp(rx,ry); if(!o.g) press=Math.min(press,rd);
    if(!o.g&&rd<13&&rd>.1&&rx*dx+ry*dy>-2){ const w=(13-rd)/13, s=Math.sign(-rx*dy+ry*dx)||1; ax+=dy*s*w*1.5; ay+=-dx*s*w*1.5; } }
  if(n[0]<7) ax+=.5; if(n[0]>78) ax-=.5;
  let mx=dx+ax, my=dy+ay; const ml=hyp(mx,my)||1; const ms=maxS(p); [p.wx,p.wy]=V_(t,mx/ml*ms,my/ml*ms);
  if(p.dec>0) return; p.dec=Q.dec*rnd(.6,1.4);
  const gd=hyp(n[0]-42.5,n[1]-GLY), ang=Math.abs(Math.atan2(n[0]-42.5,n[1]-GLY));
  if(gd<24&&gd>11&&p.dk<=0&&press>11&&ang<.9&&Math.random()<(so?.35:.3)){ deke(p,Math.random()<.5?-1:1); p.dec=.28; return; }
  if(n[1]>GLY+3&&gd<(so?26:42)&&ang<1.1){ const [gx,gy]=P_(t,42.5,GLY), lane=laneClear(p,gx,gy,2.2,true);
    const pr=so?(gd<19?.9:.2):gd<22?.65:lane?.38:.1;
    if(Math.random()<pr){ shoot(p,clamp(gd/42+rnd(-.1,.35),.3,1),0); return; } }
  if(so) return;
  if(press<6.5||p.hold>4||n[1]<GLY+2||Math.random()<.07){ const m=bestPass(p); if(m){ pass(p,m); return; } if(p.hold>7) shoot(p,.9,0); } }
const gkSkill=k=>.55+k.r.gk*.0038+(k.t===1?[-.035,0,.025][S.diff]:0);
function goalieAI(k){ const g=G, t=k.t, lag=Math.round((.27-gkSkill(k)*.15)*120), h=g.ph[Math.max(0,g.ph.length-1-lag)]||[g.pk.x,g.pk.y];
  const P=P_(t,h[0],h[1]), gx=42.5, gy=RL-GLY; let tx, ty;
  if(P[1]>gy-.3){ tx=P[0]<gx?gx-2.3:gx+2.3; ty=gy-1.3; }
  else { const a=clamp(Math.atan2(P[0]-gx,gy-P[1]),-1.2,1.2), dist=hyp(P[0]-gx,gy-P[1]), dep=clamp(dist*.1,1.3,3.1); tx=gx+Math.sin(a)*dep; ty=gy-Math.cos(a)*dep; }
  let [wx,wy]=P_(t,tx,ty); if(k.bite>0) wx=42.5+k.biteDir*3.2;
  const dx=wx-k.x, dy=wy-k.y, d=hyp(dx,dy), sp=Math.min(maxS(k),d*8); k.wx=d?dx/d*sp:0; k.wy=d?dy/d*sp:0; }

/* ---------- your player ---------- */
function input(dt){ const g=G, c=g.ctl; if(g.auto||!c||!c.on) return;
  let jx=IN.jx, jy=IN.jy; if(IN.kx||IN.ky){ const l=hyp(IN.kx,IN.ky); jx=IN.kx/l; jy=IN.ky/l; }
  IN.vx=jx; IN.vy=jy;
  const ms=maxS(c); c.wx=c.stun>0?0:jx*ms; c.wy=c.stun>0?0:jy*ms;
  const has=g.pk.owner===c, incoming=g.pk.passTo===c&&!g.pk.owner;
  if(IN.aDown){ IN.aDown=false; if(g.so&&g.so.turn===1){} else if(has){ IN.charging=true; IN.ch=0; } else if(incoming){ IN.ot=true; } else if(!g.so){ c.boost=.4; c.hitting=.45; } }
  if(IN.charging){ IN.ch=Math.min(1,IN.ch+dt/.75); if(!IN.a){ IN.charging=false; if(g.pk.owner===c) shoot(c,IN.ch,Math.abs(jx)>.3?Math.sign(jx):0); } }
  if(IN.bDown){ IN.bDown=false; if(has&&canDeke(c)) deke(c,Math.abs(jx)>.3?Math.sign(jx):0); else if(g.so){} else if(has){ const m=userPassTarget(c); if(m) pass(c,m); } else switchCtl(); } }

/* ---------- one physics step ---------- */
function physics(dt){ const g=G, pk=g.pk, L=g.P.filter(p=>p.on);
  for(const p of L){
    if(p.stun>0) p.stun-=dt; if(p.cd>0&&p.cd<50) p.cd-=dt; if(p.dk>0) p.dk-=dt; if(p.bite>0) p.bite-=dt; if(p.boost>0) p.boost-=dt; if(p.hitting>0) p.hitting-=dt;
    const wx=p.stun>0?0:p.wx, wy=p.stun>0?0:p.wy, acc=(p.g?100:p.stun>0?12:78)*(p.boost>0?1.5:1)*dt;
    let ax=wx-p.vx, ay=wy-p.vy; const am=hyp(ax,ay); if(am>acc){ ax*=acc/am; ay*=acc/am; }
    p.vx+=ax; p.vy+=ay; p.x+=p.vx*dt; p.y+=p.vy*dt;
    const bn=boardClamp(p,p.g?GR:PR); if(bn) reflect(p,bn,.1);
    const nn=netHit(p,p.g?GR*.8:PR); if(nn) reflect(p,nn,0);
    let dx, dy; const has=pk.owner===p;
    if(has){ if(p===g.ctl&&!g.auto&&hyp(IN.vx||0,IN.vy||0)>.25){ dx=IN.vx; dy=IN.vy; } else { dx=p.vx; dy=p.vy; if(hyp(dx,dy)<3){ dx=p.fx; dy=p.fy; } } }
    else { dx=pk.x-p.x; dy=pk.y-p.y; if(!p.g&&hyp(p.vx,p.vy)>12&&pk.passTo!==p){ dx=p.vx; dy=p.vy; } }
    const dl=hyp(dx,dy)||1, k=Math.min(1,dt*(has?15:10)); p.fx+=(dx/dl-p.fx)*k; p.fy+=(dy/dl-p.fy)*k; const fl=hyp(p.fx,p.fy)||1; p.fx/=fl; p.fy/=fl; }
  for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++){ const a=L[i], b=L[j], r=(a.g?GR:PR)+(b.g?GR:PR), dx=b.x-a.x, dy=b.y-a.y, d=hyp(dx,dy);
    if(d<r&&d>.001){ const nx=dx/d, ny=dy/d, o=r-d, wa=a.g?.15:b.g?.85:.5;
      a.x-=nx*o*wa; a.y-=ny*o*wa; b.x+=nx*o*(1-wa); b.y+=ny*o*(1-wa);
      const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny; if(rv<0){ a.vx+=rv*nx*.5; a.vy+=rv*ny*.5; b.vx-=rv*nx*.5; b.vy-=rv*ny*.5; }
      if(a.hitting>0&&b.t!==a.t&&!b.g) bodyCheck(a,b); else if(b.hitting>0&&a.t!==b.t&&!a.g) bodyCheck(b,a); } }
  puckStep(dt); }
function puckStep(dt){ const g=G, pk=g.pk, py0=pk.y, live=g.state==="play"||g.state==="so"||g.state==="faceoff";
  if(pk.owner){ const o=pk.owner; pk.x=o.x+o.fx*2.2; pk.y=o.y+o.fy*2.2; pk.vx=o.vx; pk.vy=o.vy; boardClamp(pk,PKR);
    if(live&&crossed(py0)) return;
    netHit(pk,PKR,true);
    const k=goalieOf(1-o.t); if(k&&k.on&&hyp(pk.x-k.x,pk.y-k.y)<GR+PKR+.2){ release(o); o.cd=.45; }
    return; }
  const sp0=hyp(pk.vx,pk.vy); if(sp0>0){ const ns=Math.max(0,sp0-(2.5+sp0*.22)*dt); pk.vx*=ns/sp0; pk.vy*=ns/sp0; }
  const n=Math.max(1,Math.ceil(hyp(pk.vx,pk.vy)*dt/.35)), h=dt/n;
  for(let i=0;i<n;i++){ const py=pk.y; pk.x+=pk.vx*h; pk.y+=pk.vy*h;
    if(live&&crossed(py)) return;
    const bn=boardClamp(pk,PKR); if(bn){ const v=hyp(pk.vx,pk.vy); reflect(pk,bn,.62); if(v>22) sfx("board"); }
    const nn=netHit(pk,PKR,true); if(nn){ const v=hyp(pk.vx,pk.vy); reflect(pk,nn,.45); if(v>30&&(nn[1]!==0)&&Math.min(Math.abs(pk.x-PX0),Math.abs(pk.x-PX1))<1.2) sfx("post"); }
    if(live&&goalieTouch()) return; }
  if(pk.ghost&&hyp(pk.x-pk.ghost.x,pk.y-pk.ghost.y)>5) pk.ghost=null;
  if(!live) return;
  pickup();
  if(!pk.owner&&hyp(pk.vx,pk.vy)<1.5) pk.still+=dt; else pk.still=0;
  if(pk.still>6&&g.state==="play"){ pk.still=0; whistle("Whistle",nearestDot(pk.x,pk.y)); } }
function crossed(py){ const pk=G.pk; if(pk.x<=PX0+.15||pk.x>=PX1-.15) return false;
  if(py>GLY&&pk.y<=GLY){ goal(0); return true; } if(py<RL-GLY&&pk.y>=RL-GLY){ goal(1); return true; } return false; }
function goalieTouch(){ const g=G, pk=g.pk;
  for(const k of g.P){ if(!k.g||!k.on||pk.ghost===k) continue; const dx=pk.x-k.x, dy=pk.y-k.y, d=hyp(dx,dy); if(d>=GR+PKR) continue;
    const sp=hyp(pk.vx,pk.vy), onNet=pk.shot&&pk.shooter&&pk.shooter.t!==k.t;
    if(sp<16){ freeze(k,onNet); return true; }
    const mv=hyp(k.vx,k.vy)/maxS(k), sv=clamp(gkSkill(k)+.09-(sp-65)*.004-mv*.08-(g.so?.12:0)-(pk.ot?.12:0)-(k.bite>0?.22:0),.3,.975);
    if(Math.random()<sv){ if(onNet) g.st[pk.shooter.t].sh++; pk.shot=false; sfx("save");
      if(Math.random()<(sp<45?.55:.3)){ freeze(k,false,true); return true; }
      const nx=dx/(d||1), ny=dy/(d||1); reflect(pk,[nx,ny],.35); pk.vx=pk.vx*.5+rnd(-9,9); pk.vy=pk.vy*.5+rnd(-9,9);
      pk.x=k.x+nx*(GR+PKR+.05); pk.y=k.y+ny*(GR+PKR+.05); pk.last=k; pk.hist=[]; pk.passTo=null;
      if(g.so) soResult(false);
      return true; }
    pk.ghost=k; }
  return false; }
function freeze(k,countShot,saved){ const g=G, pk=g.pk; if(countShot) g.st[pk.shooter.t].sh++; pk.shot=false; pk.x=k.x; pk.y=k.y;
  if(g.so) return soResult(false);
  whistle(saved?"Save!":"Covered",[pk.x<42.5?20.5:64.5,k.t===0?169:31]); }
function pickup(){ const g=G, pk=g.pk; if(pk.owner) return; const sp=hyp(pk.vx,pk.vy); let best=null, bd=9;
  for(const p of g.P){ if(!p.on||p.g||p.stun>0||p.cd>0) continue; const d=hyp(pk.x-(p.x+p.fx*1.2),pk.y-(p.y+p.fy*1.2)); if(d<2.7&&d<bd){ best=p; bd=d; } }
  if(!best) return; const p=best;
  if(sp>40&&pk.passTo!==p&&!(pk.passTo&&pk.passTo.t===p.t&&sp<70)&&Math.random()<.55){
    pk.vx=pk.vx*(-.25+rnd(-.2,.2))+rnd(-8,8); pk.vy=pk.vy*(-.25+rnd(-.2,.2))+rnd(-8,8); p.cd=.25; if(pk.shot&&pk.shooter&&pk.shooter.t!==p.t) pk.shot=false; pk.last=p; sfx("stick"); return; }
  take(p); }
function goal(t){ const g=G, pk=g.pk; if(g.state==="goal"||g.state==="soend") return;
  pk.owner=null; pk.vx=pk.vy=0; pk.y=t===0?GLY-1.6:RL-GLY+1.6; pk.x=clamp(pk.x,PX0+.7,PX1-.7);
  if(g.so) return soResult(true);
  const hs=pk.hist.filter(p=>p.t===t), sc=hs[hs.length-1]||null, ast=hs.slice(0,-1).reverse().slice(0,2);
  g.st[t].sh++; g.sc[t]++; g.goals.push({t,per:g.per,clk:g.clock,n:sc?sc.num:null,nm:sc?sc.name:null,a:ast.map(p=>p.num),an:ast.map(p=>p.name)});
  g.state="goal"; g.tm=0; g.goalT=t; snd("goal");
  msg("GOAL!",`${sc?sc.name:g.T[t].n}${ast.length?` (${ast.map(p=>p.ln).join(", ")})`:""}`,2.6); }

/* ---------- periods, overtime, shootout ---------- */
function update(dt){ const g=G; if(!g||g.paused) return;
  g.ph.push([g.pk.x,g.pk.y]); if(g.ph.length>60) g.ph.shift();
  if(g.shake>0) g.shake-=dt;
  const st=g.state;
  if(st==="faceoff"){ g.tm+=dt; for(const p of g.P){ p.wx=p.wy=0; } for(const p of g.P) if(p.g&&p.on) goalieAI(p); physics(dt);
    if(!g.dropped&&g.tm>1.1){ g.dropped=true; sfx("drop"); if(!g.auto) msg("Tap to win the draw!","",.7); }
    if(g.dropped&&g.tm>1.55) dropPuck();
    return; }
  if(st==="goal"||st==="whistle"||st==="soend"){ g.tm+=dt; for(const p of g.P){ p.wx*=.9; p.wy*=.9; } physics(dt); if(st!=="whistle") { g.pk.vx=g.pk.vy=0; }
    if(st==="goal"&&g.tm>3){ if(g.per>=4) return gameOver(); faceoff(42.5,100); }
    else if(st==="whistle"&&g.tm>1.3) faceoff(g.foDot[0],g.foDot[1]);
    else if(st==="soend"&&g.tm>1.7) soNext();
    return; }
  if(st==="play"){ g.clock-=dt; for(const t of [0,1]){ g.shF[t]+=dt; g.shD[t]+=dt; } if(g.clock<=0){ g.clock=0; return endPeriod(); } }
  if(st==="play"||st==="so"){ think(dt); input(dt); physics(dt);
    if(g.state==="so"){ const so=g.so, pk=g.pk; so.tm+=dt; const behind=so.turn===0?pk.y<GLY-.4:pk.y>RL-GLY+.4;
      if((!pk.owner&&pk.last===so.shooter&&(hyp(pk.vx,pk.vy)<3||behind))||so.tm>12) soResult(false); } } }
function dropPuck(){ const g=G, pk=g.pk; const pU=clamp(1-g.d.fo+(g.foTap?.28:0)+(g.auto?.0:0),.08,.92), w=Math.random()<pU?0:1;
  g.st[w].fo++; const c=g.P.find(p=>p.t===w&&p.role==="C"), dr=Math.random()<.5?"LD":"RD", dman=g.P.find(p=>p.t===w&&p.role===dr);
  const dx=dman.x-pk.x, dy=dman.y-pk.y, d=hyp(dx,dy)||1; pk.vx=dx/d*24+rnd(-3,3); pk.vy=dy/d*24+rnd(-3,3); pk.last=c; pk.hist=[c]; c.cd=.3;
  g.state="play"; hideMsg(); }
function endPeriod(){ const g=G; snd("horn");
  if(g.per>=3&&g.sc[0]!==g.sc[1]) return gameOver();
  if(g.per>=4&&!g.playoff) return startShootout();
  g.state="inter";
  const otLen=g.playoff?g.len:Math.min(5,g.len);
  if(g.auto){ g.per++; g.clock=(g.per>=4?otLen:g.len)*60; faceoff(42.5,100,true); return; }
  const nx=g.per+1, nxl=nx<=3?`Start the ${PER[nx-1]} period`:nx===4?"Start overtime":`Start overtime #${nx-3}`;
  overlay(`<p class="ovk">End of ${g.per<=3?"the "+PER[g.per-1]:perLabel(g)}</p>${scoreLine()}<div class="box">${boxRows()}</div>
    <button class="btn go wide" data-act="nextper">${nxl}</button>
    ${g.per>=3?`<p class="muted">Sudden death. Next goal wins.${g.playoff?" Playoff overtime keeps going until someone scores.":` Still tied after ${otLen} minutes means a shootout.`}</p>`:""}`); }
function nextPeriod(){ const g=G; closeOverlay(); g.per++; g.clock=(g.per>=4?(g.playoff?g.len:Math.min(5,g.len)):g.len)*60; faceoff(42.5,100,true); msg(g.per>=4?(g.per===4?"Overtime":perLabel(g)):`${PER[g.per-1]} period`,"",1.4); }
function startShootout(){ const g=G; g.so={res:[[],[]],turn:0,tm:0}; g.per=5; g.fl=[0,0]; setLines(0); setLines(1); msg("Shootout","Best of three",1.8); setupAttempt(); }
function setupAttempt(){ const g=G, so=g.so, t=so.turn; g.state="so"; so.tm=0;
  for(const p of g.P){ p.on=false; p.vx=p.vy=p.wx=p.wy=0; p.stun=0; p.cd=0; p.soSide=null; }
  const sh=g.P.find(p=>p.t===t&&p.role===["C","LW","RW"][so.res[t].length%3]), k=goalieOf(1-t);
  sh.on=k.on=true; [sh.x,sh.y]=P_(t,42.5,104); sh.fx=0; sh.fy=t?1:-1; [k.x,k.y]=P_(k.t,42.5,RL-GLY-2.4);
  Object.assign(g.pk,{owner:sh,last:sh,hist:[sh],passTo:null,shot:false,ghost:null,vx:0,vy:0,trail:[]}); puckStep(0);
  if(t===0) g.ctl=sh; so.shooter=sh; g.ph=[]; }
function soResult(scored){ const g=G, so=g.so; if(g.state!=="so") return; so.res[so.turn].push(scored?1:0); g.state="soend"; g.tm=0;
  if(scored) snd("goal"); else sfx("save"); msg(scored?"Scores!":"Stopped!","",1.5); }
function soNext(){ const g=G, so=g.so, a=so.res[0], b=so.res[1], A=a.reduce((s,v)=>s+v,0), B=b.reduce((s,v)=>s+v,0), na=a.length, nb=b.length;
  let over=false; if(na<=3&&nb<=3){ if(A>B+(3-nb)||B>A+(3-na)) over=true; } else if(na===nb&&A!==B) over=true;
  if(na===nb&&na>=3&&A!==B) over=true;
  if(over){ const w=A>B?0:1; g.sc[w]++; g.soWin=w; return gameOver(); }
  so.turn=na>nb?1:0; setupAttempt(); }
function gameOver(){ const g=G; if(g.state==="final") return; g.state="final"; snd("horn");
  const w=g.sc[0]>g.sc[1], ty=g.so?"SO":g.per>=4?"OT":"";
  if(g.auto) return;
  let seaNote="";
  if(g.season) seaNote=seasonResult(g,ty);
  else { if(w) S.rec.w++; else if(ty) S.rec.otl++; else S.rec.l++;
    S.last.unshift({w,ty,a:g.sc[0],b:g.sc[1],o:g.oi}); S.last=S.last.slice(0,10);
    const T=S.tot; T.gp++; T.gf+=g.sc[0]; T.ga+=g.sc[1]; T.sh+=g.st[0].sh; T.hits+=g.st[0].hits; }
  save();
  setTimeout(()=>{ if(G!==g) return;
    overlay(`<p class="ovk">${ty==="SO"?"Final · shootout":ty==="OT"?"Final · overtime":"Final"}</p><h2 class="ovh ${w?"win":"loss"}">${w?"You win!":"You lose"}</h2>${scoreLine()}
      <div class="box">${boxRows()}</div>${g.goals.length?`<div class="glist">${g.goals.map(x=>`<div><span class="gdot" style="background:${g.T[x.t].rim||g.T[x.t].c}"></span><b>${x.nm?esc(lastName(x.nm)):esc(g.T[x.t].ab)}</b><span>${x.an&&x.an.length?esc(x.an.map(lastName).join(", ")):"unassisted"}</span><em>${perName(x.per)} ${fmtClk(x.clk)}</em></div>`).join("")}</div>`:""}
      ${g.so?`<p class="muted">Shootout: ${g.so.res[0].map(v=>v?"●":"○").join(" ")} vs ${g.so.res[1].map(v=>v?"●":"○").join(" ")}</p>`:""}
      ${seaNote?`<p class="cheer">${esc(seaNote)}</p>`:""}
      ${g.season?`<button class="btn go wide" data-act="toseason">Back to the season</button>`:`<button class="btn go wide" data-act="again">Play again</button><button class="btn ghost wide" data-act="quit">Home</button>`}`); },1300); }
const fmtClk=s=>{ s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); };
function scoreLine(){ const g=G; return `<div class="fscore"><span style="--tc:${g.T[0].c};--tk:${g.T[0].k}">${esc(g.T[0].ab)}</span><b>${g.sc[0]}</b><i>–</i><b>${g.sc[1]}</b><span style="--tc:${g.T[1].c};--tk:${g.T[1].k}">${esc(g.T[1].ab)}</span></div>`; }
function boxRows(){ const g=G, r=(l,a,b)=>`<div><b>${a}</b><span>${l}</span><b>${b}</b></div>`; return r("Shots",g.st[0].sh,g.st[1].sh)+r("Hits",g.st[0].hits,g.st[1].hits)+r("Faceoffs won",g.st[0].fo,g.st[1].fo); }

/* ================= screen: drawing ================= */
const game=$('game'), cv=$('cv'), cx=cv.getContext('2d');
let CW=0, CH=0, DPR=1, SC=4, OX=0, RINK=null, RINKFOR=-1;
function resize(){ DPR=Math.min(3,window.devicePixelRatio||1); CW=innerWidth; CH=innerHeight; cv.width=Math.round(CW*DPR); cv.height=Math.round(CH*DPR); SC=Math.min(CW/(RW+5),CH/78)*1.5; OX=0; RINK=null; }
function rinkPath(c){ c.beginPath(); c.moveTo(CR,0); c.lineTo(RW-CR,0); c.arc(RW-CR,CR,CR,-PI/2,0); c.lineTo(RW,RL-CR); c.arc(RW-CR,RL-CR,CR,0,PI/2); c.lineTo(CR,RL); c.arc(CR,RL-CR,CR,PI/2,PI); c.lineTo(0,CR); c.arc(CR,CR,CR,PI,1.5*PI); c.closePath(); }
function rinkImage(){ const m=3, D=Math.min(DPR,2), c=document.createElement('canvas'); c.width=Math.ceil((RW+2*m)*SC*D); c.height=Math.ceil((RL+2*m)*SC*D);
  const x=c.getContext('2d'); x.setTransform(SC*D,0,0,SC*D,m*SC*D,m*SC*D);
  const RED="#d43a45", BLUE="#2c5fd0";
  rinkPath(x); const ice=x.createLinearGradient(0,0,RW,0); ice.addColorStop(0,"#e9f1f7"); ice.addColorStop(.5,"#f7fafc"); ice.addColorStop(1,"#e9f1f7"); x.fillStyle=ice; x.fill();
  x.save(); rinkPath(x); x.clip();
  x.fillStyle=RED; x.fillRect(0,99.5,RW,1); x.fillStyle="rgba(255,255,255,.7)"; for(let i=0;i<RW;i+=3) x.fillRect(i+1.2,99.75,1.2,.5);
  x.fillStyle=BLUE; x.fillRect(0,74.5,RW,1); x.fillRect(0,124.5,RW,1);
  x.fillStyle=RED; x.fillRect(0,GLY-.1,RW,.2); x.fillRect(0,RL-GLY-.1,RW,.2);
  x.lineWidth=.2; x.strokeStyle=BLUE; x.beginPath(); x.arc(42.5,100,15,0,2*PI); x.stroke();
  const tc=G?G.T[0].c:"#888"; x.fillStyle=tc; x.globalAlpha=.16; x.beginPath(); x.arc(42.5,100,9,0,2*PI); x.fill(); x.globalAlpha=1;
  x.fillStyle=BLUE; x.beginPath(); x.arc(42.5,100,.55,0,2*PI); x.fill();
  x.strokeStyle=RED; x.fillStyle=RED; for(const [dx,dy] of [[20.5,31],[64.5,31],[20.5,169],[64.5,169]]){ x.beginPath(); x.arc(dx,dy,15,0,2*PI); x.stroke(); x.beginPath(); x.arc(dx,dy,1,0,2*PI); x.fill();
    for(const s of [-1,1]) for(const v of [-1,1]){ x.fillRect(dx+s*2-(s<0?.15:0),dy+v*.75-(v<0?2.4:0),.15,2.4); } }
  for(const [dx,dy] of DOTS.slice(5)){ x.beginPath(); x.arc(dx,dy,.9,0,2*PI); x.fill(); }
  x.fillStyle="rgba(120,180,235,.55)"; x.strokeStyle=RED; x.lineWidth=.15;
  x.beginPath(); x.moveTo(36.5,GLY); x.arc(42.5,GLY,6,0,PI); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(48.5,RL-GLY); x.arc(42.5,RL-GLY,6,PI,2*PI); x.closePath(); x.fill(); x.stroke();
  x.restore();
  for(const n of NETS){ x.fillStyle="rgba(255,255,255,.92)"; x.fillRect(n.x0,n.y0,n.x1-n.x0,n.y1-n.y0); x.strokeStyle="rgba(60,70,80,.25)"; x.lineWidth=.06;
    for(let i=n.x0+.5;i<n.x1;i+=.5){ x.beginPath(); x.moveTo(i,n.y0); x.lineTo(i,n.y1); x.stroke(); } for(let i=n.y0+.5;i<n.y1;i+=.5){ x.beginPath(); x.moveTo(n.x0,i); x.lineTo(n.x1,i); x.stroke(); }
    x.strokeStyle=RED; x.lineWidth=.4; x.beginPath(); const top=n.y0<100; if(top){ x.moveTo(n.x0,n.y1); x.lineTo(n.x0,n.y0+.6); x.quadraticCurveTo(n.x0,n.y0,n.x0+.6,n.y0); x.lineTo(n.x1-.6,n.y0); x.quadraticCurveTo(n.x1,n.y0,n.x1,n.y0+.6); x.lineTo(n.x1,n.y1); }
    else { x.moveTo(n.x0,n.y0); x.lineTo(n.x0,n.y1-.6); x.quadraticCurveTo(n.x0,n.y1,n.x0+.6,n.y1); x.lineTo(n.x1-.6,n.y1); x.quadraticCurveTo(n.x1,n.y1,n.x1,n.y1-.6); x.lineTo(n.x1,n.y0); } x.stroke(); }
  rinkPath(x); x.lineWidth=1.1; x.strokeStyle="#1d2733"; x.stroke(); x.lineWidth=.35; x.strokeStyle="#f0c53a"; x.stroke();
  return c; }
let last=0, acc=0;
function frame(ts){ requestAnimationFrame(frame); if(game.hidden||!G){ last=ts; return; }
  let dt=Math.min(.05,(ts-(last||ts))/1000); last=ts;
  if(!G.paused&&G.state!=="inter"&&G.state!=="final"){ acc+=dt; while(acc>=1/120){ update(1/120); acc-=1/120; } } else acc=0;
  camera(dt); draw(); hud(); }
function camera(dt){ const g=G, vh=CH/SC; let ty=g.state==="goal"?(g.goalT===0?GLY:RL-GLY):g.pk.y; ty+=vh*.08;
  const lo=-4+(CH/2-64)/SC, hi=RL+4-(CH*.7-CH/2)/SC; ty=clamp(ty,lo,hi); g.cam+=(ty-g.cam)*Math.min(1,dt*5);
  const vw=CW/SC; let tx=g.state==="goal"?42.5:g.pk.x+g.pk.vx*.15; tx=vw>=RW+6?42.5:clamp(tx,vw/2-3,RW+3-vw/2); g.camX+=(tx-g.camX)*Math.min(1,dt*4.5); }
function draw(){ const g=G; cx.setTransform(DPR,0,0,DPR,0,0); cx.fillStyle="#0c141d"; cx.fillRect(0,0,CW,CH);
  if(!RINK||RINKFOR!==g.ti){ RINK=rinkImage(); RINKFOR=g.ti; }
  const sh=g.shake>0?(Math.random()*2-1)*5*g.shake/.25:0, sx=x=>(x-g.camX)*SC+CW/2+sh*.5, sy=y=>(y-g.cam)*SC+CH/2+sh;
  cx.drawImage(RINK,sx(-3),sy(-3),(RW+6)*SC,(RL+6)*SC);
  const pk=g.pk, L=g.P.filter(p=>p.on).sort((a,b)=>a.y-b.y), human=!g.auto&&g.ctl&&g.ctl.on&&!(g.so&&g.so.turn===1);
  // the teammate a pass would go to
  if(human&&pk.owner===g.ctl&&g.state==="play"){ const m=userPassTarget(g.ctl); if(m){ cx.strokeStyle="rgba(255,210,63,.75)"; cx.lineWidth=2; cx.setLineDash([4,4]); cx.beginPath(); cx.arc(sx(m.x),sy(m.y),PR*SC+6,0,2*PI); cx.stroke(); cx.setLineDash([]); } }
  if(human){ const c=g.ctl, X=sx(c.x), Y=sy(c.y), r=PR*SC; cx.fillStyle="rgba(255,210,63,.28)"; cx.beginPath(); cx.arc(X,Y,r+7,0,2*PI); cx.fill(); cx.strokeStyle="#ffd23f"; cx.lineWidth=3; cx.beginPath(); cx.arc(X,Y,r+6,0,2*PI); cx.stroke(); }
  for(const p of L) drawPlayer(p,sx,sy);
  // puck
  pk.trail.push([pk.x,pk.y]); if(pk.trail.length>7) pk.trail.shift();
  const v=hyp(pk.vx,pk.vy); if(!pk.owner&&v>30){ cx.lineCap="round"; for(let i=1;i<pk.trail.length;i++){ cx.strokeStyle=`rgba(20,25,30,${i/pk.trail.length*.28})`; cx.lineWidth=Math.max(2,PKR*SC*1.4)*i/pk.trail.length; cx.beginPath(); cx.moveTo(sx(pk.trail[i-1][0]),sy(pk.trail[i-1][1])); cx.lineTo(sx(pk.trail[i][0]),sy(pk.trail[i][1])); cx.stroke(); } }
  const pr=Math.max(3.2,PKR*SC*1.15); cx.fillStyle="rgba(0,0,0,.2)"; cx.beginPath(); cx.arc(sx(pk.x)+1,sy(pk.y)+1.5,pr,0,2*PI); cx.fill(); cx.fillStyle="#111"; cx.beginPath(); cx.arc(sx(pk.x),sy(pk.y),pr,0,2*PI); cx.fill();
  if(human){ const c=g.ctl, X=sx(c.x), Y=sy(c.y), r=PR*SC;
    cx.fillStyle="#ffd23f"; cx.beginPath(); cx.moveTo(X,Y-r-9); cx.lineTo(X-5,Y-r-16); cx.lineTo(X+5,Y-r-16); cx.closePath(); cx.fill();
    if(IN.charging){ cx.strokeStyle="#ff7a2f"; cx.lineWidth=4; cx.beginPath(); cx.arc(X,Y,r+11,-PI/2,-PI/2+IN.ch*2*PI); cx.stroke(); }
    if(Y<70||Y>CH-8||X<0||X>CW){ const ax=clamp(X,14,CW-14), ay=clamp(Y,74,CH-14), a=Math.atan2(Y-ay,X-ax)||(-PI/2); cx.save(); cx.translate(ax,ay); cx.rotate(a); cx.fillStyle="#ffd23f"; cx.beginPath(); cx.moveTo(10,0); cx.lineTo(-5,-8); cx.lineTo(-5,8); cx.closePath(); cx.fill(); cx.restore(); } } }
function drawPlayer(p,sx,sy){ const g=G, T=g.T[p.t], X=sx(p.x), Y=sy(p.y), r=(p.g?GR:PR)*SC, down=p.stun>.15;
  cx.fillStyle="rgba(10,25,40,.18)"; cx.beginPath(); cx.ellipse(X+r*.22,Y+r*.35,r*1.05,r*.8,0,0,2*PI); cx.fill();
  const fx=p.fx, fy=p.fy, px=-fy, py=fx, hx=X+px*r*.55, hy=Y+py*r*.55, L=(p.g?2.6:3)*SC, bx=hx+fx*L, by=hy+fy*L;
  if(!down){ cx.lineCap="round"; cx.strokeStyle="#3a2b1f"; cx.lineWidth=Math.max(2,.3*SC); cx.beginPath(); cx.moveTo(hx,hy); cx.lineTo(bx,by); cx.stroke();
    cx.lineWidth=Math.max(3,.5*SC); cx.beginPath(); cx.moveTo(bx,by); cx.lineTo(bx-px*.9*SC,by-py*.9*SC); cx.stroke(); }
  cx.save(); cx.translate(X,Y); if(down){ cx.rotate(Math.atan2(p.vy,p.vx)||0); cx.scale(1.25,.72); cx.globalAlpha=.85; }
  if(p.g){ const gc=T.rim||T.c; cx.fillStyle=T.road?"#dfe3e8":"#f4f6f8"; cx.strokeStyle=gc; cx.lineWidth=Math.max(3,.5*SC); cx.beginPath(); cx.arc(0,0,r-1.5,0,2*PI); cx.fill(); cx.stroke(); cx.fillStyle=gc; }
  else { cx.fillStyle=T.c; cx.strokeStyle=T.road?T.rim:(T.s||"rgba(255,255,255,.95)"); cx.lineWidth=T.road?1.6:2; cx.beginPath(); cx.arc(0,0,r,0,2*PI); cx.fill(); cx.stroke(); cx.fillStyle=T.k; }
  cx.font=`800 ${Math.round(r*(p.g?.9:1.02))}px Figtree,system-ui,sans-serif`; cx.textAlign="center"; cx.textBaseline="middle"; cx.fillText(p.num,0,r*.06);
  cx.restore(); }

/* ---------- HUD, messages, overlays ---------- */
function hud(){ const g=G, s=[g.sc[0],g.sc[1],g.per,Math.ceil(g.clock),g.st[0].sh,g.st[1].sh,g.so?g.so.res.map(r=>r.join("")).join("|"):""].join(",");
  if(s!==hud.l){ hud.l=s; $('s0').textContent=g.sc[0]; $('s1').textContent=g.sc[1];
    $('per').textContent=g.so?`SO ${g.so.res[0].reduce((a,b)=>a+b,0)}–${g.so.res[1].reduce((a,b)=>a+b,0)}`:`${perLabel(g)} ${fmtClk(g.clock)}`;
    $('sog').textContent=`Shots ${g.st[0].sh} – ${g.st[1].sh}`; }
  const has=g.pk.owner===g.ctl||(g.pk.passTo===g.ctl&&!g.pk.owner), cpuSO=g.so&&g.so.turn===1, fo=g.state==="faceoff";
  const dk=g.pk.owner===g.ctl&&canDeke(g.ctl);
  const la=fo?"Draw":cpuSO?"":has?"Shoot":g.so?"Shoot":"Check", lb=fo?"Draw":cpuSO?"":dk?"Deke":g.so?"":has?"Pass":"Switch";
  const who=g.ctl&&g.ctl.on&&!cpuSO?`#${g.ctl.num} ${g.ctl.ln}`:""; if(who!==hud.w){ hud.w=who; $('who').textContent=who; $('who').hidden=!who; }
  if(la!==hud.a){ hud.a=la; $('bA').textContent=la; $('bA').classList.toggle("off",!la); }
  if(lb!==hud.b){ hud.b=lb; $('bB').textContent=lb; $('bB').classList.toggle("off",!lb); }
  $('bA').style.setProperty("--c",IN.charging?IN.ch:0); }
function msg(big,small="",dur=1.2){ const m=$('msg'); m.innerHTML=`${esc(big)}${small?`<small>${esc(small)}</small>`:""}`; m.classList.add("on"); clearTimeout(msg.t); msg.t=setTimeout(hideMsg,dur*1000); }
function hideMsg(){ $('msg').classList.remove("on"); }
function overlay(html){ const o=$('ov'); o.innerHTML=`<div class="ovc">${html}</div>`; o.hidden=false; }
function closeOverlay(){ $('ov').hidden=true; }
function pause(){ const g=G; if(!g||g.state==="final"||g.state==="inter"||g.paused) return; g.paused=true; IN.a=false; IN.charging=false;
  overlay(`<p class="ovk">Paused</p>${scoreLine()}<p class="muted">${g.so?"Shootout":`${g.per<=3?PER[g.per-1]+" period":perLabel(g)} · ${fmtClk(g.clock)} left`}</p>
    <button class="btn go wide" data-act="resume">Resume</button><button class="btn ghost wide" data-act="quit">${g.season?"Quit game (it won't count)":"Quit game"}</button><button class="btn ghost small" data-act="snd">Sound ${S.sound?"on":"off"}</button>`); }

/* ---------- controls ---------- */
const zone=$('stickzone'), stick=$('stick'), knob=$('knob'); let SP=null;
function restStick(){ const r=zone.getBoundingClientRect(); stick.style.setProperty("--x",(r.width*.42)+"px"); stick.style.setProperty("--y",(r.height-118)+"px"); stick.classList.remove("on"); knob.style.transform=""; }
zone.addEventListener("pointerdown",e=>{ if(SP) return; e.preventDefault(); ac(); try{ zone.setPointerCapture(e.pointerId); }catch(_){} const r=zone.getBoundingClientRect();
  SP={id:e.pointerId,ox:e.clientX,oy:e.clientY,r}; stick.style.setProperty("--x",(e.clientX-r.left)+"px"); stick.style.setProperty("--y",(e.clientY-r.top)+"px"); stick.classList.add("on"); IN.jx=IN.jy=0; });
zone.addEventListener("pointermove",e=>{ if(!SP||e.pointerId!==SP.id) return; e.preventDefault(); const R=46; let dx=e.clientX-SP.ox, dy=e.clientY-SP.oy, d=hyp(dx,dy);
  if(d>R){ SP.ox+=dx/d*(d-R); SP.oy+=dy/d*(d-R); dx=e.clientX-SP.ox; dy=e.clientY-SP.oy; d=R; stick.style.setProperty("--x",(SP.ox-SP.r.left)+"px"); stick.style.setProperty("--y",(SP.oy-SP.r.top)+"px"); }
  knob.style.transform=`translate(${dx}px,${dy}px)`; const m=d/R; if(m<.12){ IN.jx=IN.jy=0; } else { const k=Math.min(1,(m-.12)/.7); IN.jx=dx/d*k; IN.jy=dy/d*k; } });
const endStick=e=>{ if(!SP||e.pointerId!==SP.id) return; SP=null; IN.jx=IN.jy=0; restStick(); };
zone.addEventListener("pointerup",endStick); zone.addEventListener("pointercancel",endStick);
function btn(el,down,up){ el.addEventListener("pointerdown",e=>{ e.preventDefault(); ac(); try{ el.setPointerCapture(e.pointerId); }catch(_){} el.classList.add("down"); down(); });
  const u=e=>{ el.classList.remove("down"); up&&up(); }; el.addEventListener("pointerup",u); el.addEventListener("pointercancel",u); }
const tapDraw=()=>{ if(G&&G.state==="faceoff"&&G.dropped) G.foTap=true; };
btn($('bA'),()=>{ IN.a=true; IN.aDown=true; tapDraw(); },()=>{ IN.a=false; });
btn($('bB'),()=>{ IN.bDown=true; tapDraw(); });
const KEYS={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]}, held=new Set();
function keyVec(){ IN.kx=0; IN.ky=0; held.forEach(k=>{ IN.kx+=KEYS[k][0]; IN.ky+=KEYS[k][1]; }); }
document.addEventListener("keydown",e=>{ if(game.hidden) return; const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(KEYS[k]){ held.add(k); keyVec(); e.preventDefault(); }
  else if(k===" "){ e.preventDefault(); if(!IN.a){ IN.a=true; IN.aDown=true; tapDraw(); } }
  else if(k==="j"||k==="Shift"||k==="k"){ IN.bDown=true; tapDraw(); }
  else if(k==="Escape"||k==="p"){ G&&G.paused?resume():pause(); } });
document.addEventListener("keyup",e=>{ const k=e.key.length===1?e.key.toLowerCase():e.key; if(KEYS[k]){ held.delete(k); keyVec(); } else if(k===" ") IN.a=false; });
$('gpause').addEventListener("click",pause);
function resume(){ if(!G) return; G.paused=false; closeOverlay(); }
$('ov').addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b) return; const a=b.dataset.act;
  if(a==="resume") resume(); else if(a==="nextper") nextPeriod(); else if(a==="again"){ closeOverlay(); play(); } else if(a==="quit"){ const se=G&&G.season; leave(); if(se) seasonScreen(); }
  else if(a==="toseason"){ leave(); seasonScreen(); }
  else if(a==="tips"){ S.tips=true; save(); closeOverlay(); G.paused=false; }
  else if(a==="snd"){ S.sound=!S.sound; save(); b.textContent=`Sound ${S.sound?"on":"off"}`; } });
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden"){ pause(); save(); } });
game.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});
addEventListener("resize",()=>{ resize(); if(!game.hidden) restStick(); });

function play(opt){ ac(); newGame(opt||{}); game.hidden=false;
  [0,1].forEach(t=>{ const el=$('t'+t); el.textContent=G.T[t].ab; el.style.setProperty("--tc",G.T[t].c); el.style.setProperty("--tk",G.T[t].k); }); document.body.classList.add("playing"); resize(); restStick(); hud.l=hud.a=hud.b=hud.w=null; G.cam=100;
  if(!S.tips){ G.paused=true; overlay(`<p class="ovk">How to play</p><div class="tips">
    <div><b>Skate</b><span>Drag anywhere on the left side.</span></div>
    <div><b>Shoot</b><span>Tap for a wrist shot, hold for a slapshot. Push the stick left or right to pick a corner.</span></div>
    <div><b>Pass</b><span>Goes to the teammate with the dashed ring, the one you're skating toward. Press Shoot while a pass is on its way for a one-timer.</span></div>
    <div><b>Deke</b><span>Close to the net the Pass button turns into Deke. It fakes the goalie the wrong way, so shoot right after.</span></div>
    <div><b>Defense</b><span>Check bursts forward and knocks the puck loose. Switch jumps to the skater nearest the puck.</span></div>
    <div><b>Faceoffs</b><span>Tap a button the moment the puck drops.</span></div></div>
    <button class="btn go wide" data-act="tips">Got it</button>`); }
  else msg("1st period","",1.3); }
function leave(){ closeOverlay(); game.hidden=true; document.body.classList.remove("playing"); G=null; home(); }

/*SEASON*/

/* ================= home ================= */
function home(){ const t=TEAMS[S.team], R=S.rec, T=S.tot;
  app.innerHTML=`
  <div class="brand"><h1>Hockey</h1><nav class="tabs" aria-label="Edition"><a href="../">World</a><a href="../usa/">USA</a><a href="../earth/">Earth</a><a href="../math/">Math</a><a href="../games/">Games</a><a href="./" aria-current="page">Hockey</a></nav></div>
  <section class="card hero">
    <div class="match"><div class="side"><span class="jersey" style="--c:${t.c};--k:${t.k}">${esc(t.ab)}</span><b>${esc(t.n)}</b><small>You</small></div>
      <span class="vs">vs</span><div class="side"><span class="jersey q">?</span><b>Random opponent</b><small>Computer · ${DIFF[S.diff].n}</small></div></div>
    <button class="btn go wide" data-act="play">Quick game</button>
    <button class="btn wide seab" data-act="season">${S.sea?`Season · ${S.sea.phase==="reg"?`game ${S.sea.day+1} of ${SEA_GAMES}`:S.sea.phase==="po"?"playoffs":"finished"} · ${esc(TEAMS[S.sea.team].ab)}`:"Start a season"}</button>
    <p class="muted center">5 on 5 · three ${S.len}-minute periods · seasons are 10 games plus a top-four playoff</p></section>
  <section class="card"><h3>Your record</h3>
    <div class="kv"><div><b>${R.w}</b><span>wins</span></div><div><b>${R.l}</b><span>losses</span></div><div><b>${R.otl}</b><span>OT losses</span></div></div>
    ${S.last.length?`<div class="lastres">${S.last.map(x=>`<span class="${x.w?"w":x.ty?"o":"l"}" title="vs ${esc(TEAMS[x.o].n)}">${x.w?"W":x.ty?"OTL":"L"} ${x.a}–${x.b}</span>`).join("")}</div>`:`<p class="muted">Play your first game to start your record.</p>`}
    ${T.gp?`<p class="muted">${T.gp} games · ${T.gf} goals for, ${T.ga} against · ${(T.sh/T.gp).toFixed(1)} shots and ${(T.hits/T.gp).toFixed(1)} hits a game</p>`:""}</section>
  <section class="card"><h3>Your team</h3>${linesHtml(t.ab)}<div class="teams">${TEAMS.map((x,i)=>`<button class="tmb" data-act="team" data-i="${i}" aria-pressed="${S.team===i}" style="--c:${x.c};--k:${x.k}"><i>${esc(x.ab)}</i><span>${esc(x.n)}</span></button>`).join("")}</div></section>
  <section class="card"><h3>Computer difficulty</h3><div class="seg3" role="group" aria-label="Difficulty">${DIFF.map((d,i)=>`<button data-act="diff" data-i="${i}" aria-pressed="${S.diff===i}">${d.n}</button>`).join("")}</div>
    <h3>Period length</h3><div class="seg3" role="group" aria-label="Period length">${LENS.map(l=>`<button data-act="len" data-i="${l}" aria-pressed="${S.len===l}">${l} min</button>`).join("")}</div></section>
  <section class="card"><h3>How to play</h3><div class="tips">
    <div><b>Skate</b><span>Drag anywhere on the left half of the screen. You always attack up the ice.</span></div>
    <div><b>With the puck</b><span>Shoot: tap for a wrist shot, hold for a slapshot, push left or right to aim. Pass goes to the teammate with the dashed ring.</span></div>
    <div><b>One-timers and dekes</b><span>Press Shoot while a pass is coming to you to fire it right off the pass. Close to the net, Pass becomes Deke: it fakes the goalie the wrong way, so shoot right after.</span></div>
    <div><b>Without it</b><span>Check bursts forward and knocks the puck loose. Switch moves you to the skater nearest the puck.</span></div>
    <div><b>Rules</b><span>No offsides or icing. The clock stops on whistles and goals. Sudden-death overtime, then a best-of-three shootout.</span></div>
    <div><b>Keyboard</b><span>Arrows or WASD to skate, Space to shoot or check, J to pass or switch, P to pause.</span></div></div></section>
  <div class="foot"><div id="bk" style="width:100%"></div>
    <div class="row" style="justify-content:center"><button class="btn ghost small" data-act="sound">Sounds ${S.sound?"on":"off"}</button><button class="btn ghost small" data-act="reset">Reset record</button></div>
    <div>Version ${esc(APP_VERSION)}</div></div>`;
  if(window.GT_BK) GT_BK.ui($('bk'),{beforeBackup:save}); }
app.addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b) return; const a=b.dataset.act, y=scrollY;
  if(a==="play") return play();
  if(a==="season") return seasonScreen();
  if(a==="home") return home(), scrollTo(0,0);
  if(a.startsWith("sea-")) return seasonAct(a,b);
  if(a==="team"){ S.team=+b.dataset.i; } else if(a==="diff"){ S.diff=+b.dataset.i; } else if(a==="len"){ S.len=+b.dataset.i; } else if(a==="sound"){ S.sound=!S.sound; }
  else if(a==="reset"){ if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to erase your record"; return; } const k=S; S=FRESH(); S.team=k.team; S.diff=k.diff; S.len=k.len; S.sound=k.sound; S.tips=k.tips; }
  else return;
  save(); home(); scrollTo(0,y); });

/* ---------- offline + updates (shared with the other tabs) ---------- */
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")) navigator.serviceWorker.register("../sw.js").catch(()=>{});
async function checkUpdate(){ if(!navigator.onLine||APP_VERSION==="dev"||!game.hidden) return;
  try{ const r=await fetch("../version.json",{cache:"no-store"}); if(!r.ok) return; const v=(await r.json()).v; if(v&&v!==APP_VERSION) $('updBtn').hidden=false; }catch(e){} }
$('updBtn').onclick=async()=>{ $('updBtn').textContent="Updating…"; try{ const reg=await navigator.serviceWorker?.getRegistration(); await reg?.update(); }catch(e){} location.reload(); };
setTimeout(checkUpdate,1500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") checkUpdate(); });

window.HK={get G(){ return G; }, newGame, update, play, sim(sec){ newGame({auto:true}); const n=sec*120; for(let i=0;i<n&&G.state!=="final";i++) update(1/120); return G; }};
resize(); requestAnimationFrame(frame); home();
