// Builds tools/games/queens.js: a bank of Queens puzzles (one queen per row, column and color region; no two queens touch).
// Each puzzle is accepted only if a step-by-step logic solver (no guessing) solves it, so it has exactly one solution
// and can be finished by reasoning alone. Usage: node tools/build-queens.mjs
import fs from "fs";
let seed=20261109; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x80000000; };
const shuf=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
function queensPlacement(N){ // random permutation with no two queens adjacent
  const col=new Array(N); const go=r=>{ if(r===N) return true; for(const c of shuf([...Array(N).keys()])){ if(col.slice(0,r).includes(c)) continue; if(r&&Math.abs(col[r-1]-c)<=1) continue; col[r]=c; if(go(r+1)) return true; } return false; };
  go(0); return col; }
function regions(N,col){ const reg=new Array(N*N).fill(-1); const fr=[]; col.forEach((c,r)=>{ reg[r*N+c]=r; });
  // grow: repeatedly pick a random region (weighted toward smaller ones) and annex a random neighbouring free cell
  let free=N*N-N; const nb=i=>{ const r=Math.floor(i/N), c=i%N, o=[]; if(r) o.push(i-N); if(r<N-1) o.push(i+N); if(c) o.push(i-1); if(c<N-1) o.push(i+1); return o; };
  const size=new Array(N).fill(1);
  while(free){ const order=[...Array(N).keys()].sort((a,b)=>size[a]-size[b]+(rnd()-.5)*6);
    let done=false; for(const k of order){ const cand=[]; for(let i=0;i<N*N;i++) if(reg[i]===k) for(const j of nb(i)) if(reg[j]<0) cand.push(j);
      if(cand.length){ const j=cand[Math.floor(rnd()*cand.length)]; reg[j]=k; size[k]++; free--; done=true; break; } }
    if(!done) break; }
  return reg; }
/* logic solver: returns {ok, steps, hard} */
function solve(N,reg){ const S=new Array(N*N).fill(0); // 0 unknown, 1 queen, 2 x
  const units=[]; for(let r=0;r<N;r++) units.push([...Array(N).keys()].map(c=>r*N+c)); for(let c=0;c<N;c++) units.push([...Array(N).keys()].map(r=>r*N+c));
  for(let k=0;k<N;k++) units.push([...Array(N*N).keys()].filter(i=>reg[i]===k));
  const R=i=>Math.floor(i/N), C=i=>i%N;
  const place=i=>{ S[i]=1; for(let j=0;j<N*N;j++){ if(j===i||S[j]) continue; if(R(j)===R(i)||C(j)===C(i)||reg[j]===reg[i]||(Math.abs(R(j)-R(i))<=1&&Math.abs(C(j)-C(i))<=1)) S[j]=2; } };
  let hard=0, lvl=0;
  const basic=()=>{ let ch=false; for(const u of units){ if(u.some(i=>S[i]===1)) continue; const un=u.filter(i=>S[i]===0); if(un.length===0) return null; if(un.length===1){ place(un[0]); ch=true; } } return ch; };
  const confine=()=>{ // k regions confined to k rows (or columns) → clear those rows of other regions; also k rows confined to k regions
    let ch=false; const regsU=units.slice(2*N), lines=[units.slice(0,N),units.slice(N,2*N)];
    for(const L of lines){ for(let a=0;a<(1<<N);a++){ const bits=[...Array(N).keys()].filter(b=>a>>b&1); if(bits.length<1||bits.length>3) continue;
      // regions (unsolved) whose candidates lie entirely inside lines `bits`
      const lineSet=new Set(bits.flatMap(b=>L[b]));
      const inside=regsU.filter(u=>!u.some(i=>S[i]===1)&&u.filter(i=>S[i]===0).every(i=>lineSet.has(i)));
      if(inside.length===bits.length){ const keep=new Set(inside.flat()); for(const i of lineSet) if(S[i]===0&&!keep.has(i)){ S[i]=2; ch=true; } }
      // lines whose candidates lie entirely inside a set of regions of equal count
      const unsolvedLines=bits.filter(b=>!L[b].some(i=>S[i]===1)); if(unsolvedLines.length!==bits.length) continue;
      const regs=new Set(bits.flatMap(b=>L[b].filter(i=>S[i]===0).map(i=>reg[i])));
      if(regs.size===bits.length){ for(let i=0;i<N*N;i++) if(S[i]===0&&regs.has(reg[i])&&!lineSet.has(i)){ S[i]=2; ch=true; } } } }
    return ch; };
  const lookahead=()=>{ // a cell whose queen would wipe out some unit is an x
    let ch=false; for(let i=0;i<N*N;i++){ if(S[i]!==0) continue; const save=S.slice(); place(i);
      const dead=units.some(u=>!u.some(j=>S[j]===1)&&!u.some(j=>S[j]===0)); for(let j=0;j<N*N;j++) S[j]=save[j];
      if(dead){ S[i]=2; ch=true; } } return ch; };
  for(let guard=0;guard<500;guard++){ if(S.every(v=>v)) break;
    const b=basic(); if(b===null) return {ok:false}; if(b) continue;
    if(confine()){ lvl=Math.max(lvl,1); continue; }
    if(lookahead()){ lvl=Math.max(lvl,2); hard++; continue; }
    return {ok:false}; }
  const q=S.map((v,i)=>v===1?i:-1).filter(i=>i>=0); if(q.length!==N) return {ok:false};
  return {ok:true, hard, lvl, sol:q}; }
function countSol(N,reg,limit){ let n=0; const used=new Array(N).fill(false), ureg=new Array(N).fill(false), col=[];
  const go=r=>{ if(n>=limit) return; if(r===N){ n++; return; }
    for(let c=0;c<N;c++){ if(used[c]) continue; const g=reg[r*N+c]; if(ureg[g]) continue; if(r&&Math.abs(col[r-1]-c)<=1) continue;
      used[c]=ureg[g]=true; col[r]=c; go(r+1); used[c]=ureg[g]=false; } };
  go(0); return n; }
function connected(N,reg,k){ const cells=[]; for(let i=0;i<N*N;i++) if(reg[i]===k) cells.push(i); if(!cells.length) return false;
  const seen=new Set([cells[0]]), q=[cells[0]]; while(q.length){ const i=q.pop(), r=Math.floor(i/N), c=i%N;
    for(const j of [r?i-N:-1,r<N-1?i+N:-1,c?i-1:-1,c<N-1?i+1:-1]) if(j>=0&&reg[j]===k&&!seen.has(j)){ seen.add(j); q.push(j); } }
  return seen.size===cells.length; }
function makePuzzle(N){ const col=queensPlacement(N), reg=regions(N,col), qcell=new Set(col.map((c,r)=>r*N+c));
  let cnt=countSol(N,reg,200);
  for(let it=0;it<4000&&cnt>1;it++){ const i=Math.floor(rnd()*N*N); if(qcell.has(i)) continue; const r=Math.floor(i/N), c=i%N;
    const nbs=[r?i-N:-1,r<N-1?i+N:-1,c?i-1:-1,c<N-1?i+1:-1].filter(j=>j>=0&&reg[j]!==reg[i]); if(!nbs.length) continue;
    const old=reg[i], nw=reg[nbs[Math.floor(rnd()*nbs.length)]]; reg[i]=nw;
    if(!connected(N,reg,old)){ reg[i]=old; continue; }
    const c2=countSol(N,reg,200); if(c2<=cnt) cnt=c2; else reg[i]=old; }
  return cnt===1?{col,reg}:null; }
const L="ABCDEFGHIJ";
const out=[]; const want=JSON.parse(process.env.WANT||"[[7,90],[8,180],[9,130]]");
for(const [N,count] of want){ let got=0, tries=0;
  while(got<count&&tries<400000){ tries++; if(tries%2000===0) console.error("..",N,tries,got); const P=makePuzzle(N); if(!P) continue; const col=P.col, reg=P.reg; const s=solve(N,reg);
    if(!s.ok) continue; if(s.hard>6) continue; // keep it fun: at most a few look-ahead steps
    if(N>=8&&s.lvl<1) continue; // larger boards need at least one real deduction beyond singles
    const sol=col.map((c,r)=>r*N+c); if(s.sol.join()!==sol.join()) throw "mismatch";
    out.push({N, g:reg.map(k=>L[k]).join(""), s:col.join(""), lvl:s.lvl}); got++; }
  console.error(N,got,tries); }
shuf(out);
fs.writeFileSync("tools/games/queens.js",`/* Queens puzzle bank, built by tools/build-queens.mjs. g = region letter per cell (row by row), s = queen column per row. */\nconst QUEENS=${JSON.stringify(out.map(p=>[p.N,p.g,p.s]))};\n`);
console.error("total",out.length);
