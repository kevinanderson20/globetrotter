/* ================= PROBLEM GENERATORS =================
   Each call builds a fresh problem in the structure of one of the three posted templates,
   in a new business context, with every number computed here and the model answer written
   the way the posted solutions write it. Normal lookups use the test's table (ZT) only.
   A problem = {tpl, title, setup, parts:[{label, q, steps:[step], model}]}
   A step   = {k:"mc", q, c, a, e, o}  |  {k:"num", q, ans, alt?, tol, pct?, o}  |  {k:"multi", q, fields:[{l, ans}], tol, o}
*/
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const r4=x=>Math.round((x+Number.EPSILON)*1e4)/1e4;
const r2=x=>Math.round((x+Number.EPSILON)*100)/100;
const f4=x=>r4(x).toFixed(4);
const fz=x=>(x<0?"−":"")+Math.abs(x).toFixed(2);
const fnum=x=>{ const v=r4(x); return (v<0?"−":"")+String(Math.abs(v)); };
const fact=n=>n<=1?1:n*fact(n-1);
const C=(n,k)=>fact(n)/(fact(k)*fact(n-k));
function mcShuffle(step){ const idx=step.c.map((_,i)=>i); for(let i=idx.length-1;i>0;i--){ const j=rnd(i+1); [idx[i],idx[j]]=[idx[j],idx[i]]; }
  return {...step, c:idx.map(i=>step.c[i]), a:idx.indexOf(step.a), ce:step.ce?idx.map(i=>step.ce[i]):undefined}; }
function uniqOpts(correct, others){ const seen=new Set([correct]); const out=[correct]; others.forEach(o=>{ if(!seen.has(o)&&out.length<4){ seen.add(o); out.push(o); } }); return out; }
const list=v=>v.length===1?`X = ${v[0]}`:`X = ${v.slice(0,-1).join(", ")} or ${v[v.length-1]}`;

/* ---------- normal table ---------- */
function phi(z){ // area to the left of z from the table (z already at 2 decimals)
  const a=Math.min(Math.abs(z),3.09); const r=Math.floor(Math.round(a*100)/10), c=Math.round(a*100)%10;
  const v=ZT[Math.min(r,30)][c]; return z<0?r4(1-v):v; }
function zFor(P){ // closest table entry; returns {z, t (table prob used), alt (equally close z or null)}
  if(P<.5){ const s=zFor(1-P); return {z:-s.z, t:s.t, alt:s.alt==null?null:-s.alt, flip:true}; }
  let best=[], bd=Infinity;
  for(let r=0;r<=30;r++) for(let c=0;c<10;c++){ const d=Math.round(Math.abs(ZT[r][c]-P)*1e5); if(d<bd){ bd=d; best=[[r,c]]; } else if(d===bd) best.push([r,c]); }
  const z=(best[0][0]*10+best[0][1])/100; const alt=best.length>1?(best[best.length-1][0]*10+best[best.length-1][1])/100:null;
  return {z, t:ZT[best[0][0]][best[0][1]], alt}; }

/* ================= TEMPLATE 1: distribution from a table ================= */
const T1CTX=[
 {name:"Items per order", total:[200,100], vals:[1,2,3,4,5], kind:"set",
  setup:(N)=>`An online store reviewed ${N} recent orders and counted how many items each one contained. The table summarizes the counts. One of these ${N} orders is selected at random; let X be the number of items in the selected order.`,
  head:["Items","Orders"], ev:w=>`the selected order contains ${w} items`, unit:"items",
  interp:(E,N)=>`An average number of items in an order in this set of ${N} orders is ${E} items.`,
  partial:E=>`On average, ${E} items.`, will:E=>`The selected order will contain ${E} items.`, most:E=>`${E} items is the most likely number of items in an order.`},
 {name:"Cars sold per day", total:[100,50], vals:[0,1,2,3,4], kind:"run",
  setup:(N)=>`A car dealership recorded how many cars it sold on each of the last ${N} days. Use these frequencies as the probabilities for a future day, and let X be the number of cars sold on a randomly chosen day.`,
  head:["Cars sold","Days"], ev:w=>`the dealership sells ${w} cars on a day`, unit:"cars",
  interp:E=>`Over many days, the dealership sells on average ${E} cars per day.`,
  partial:E=>`On average, ${E} cars.`, will:E=>`The dealership will sell ${E} cars tomorrow.`, most:E=>`Selling ${E} cars is the most likely outcome on a day.`},
 {name:"Satisfaction ratings", total:[250,200], vals:[1,2,3,4,5], kind:"set",
  setup:(N)=>`A hotel chain asked ${N} guests to rate their stay from 1 (poor) to 5 (excellent). One of these ${N} guests is selected at random; let X be the rating that guest gave.`,
  head:["Rating","Guests"], ev:w=>`the selected guest gave a rating ${w}`.replace("rating at","rating of at"), evNum:true, unit:"points",
  interp:(E,N)=>`An average rating given by a guest in this group of ${N} guests is ${E} points.`,
  partial:E=>`On average, ${E} points.`, will:E=>`The selected guest will give a rating of ${E}.`, most:E=>`${E} is the rating guests are most likely to give.`},
 {name:"Service calls per day", total:[50,100], vals:[0,1,2,3,4,5], kind:"run",
  setup:(N)=>`An appliance repair company logged the number of service calls it received on each of the last ${N} days. Use these frequencies as probabilities for a future day; let X be the number of service calls on a day.`,
  head:["Calls","Days"], ev:w=>`the company receives ${w} service calls on a day`, unit:"calls",
  interp:E=>`Over many days, the company receives on average ${E} service calls per day.`,
  partial:E=>`On average, ${E} calls.`, will:E=>`The company will receive ${E} calls tomorrow.`, most:E=>`${E} calls is the most likely number on a day.`},
 {name:"Walk-in rooms per night", total:[100,50], vals:[0,1,2,3,4], kind:"run",
  setup:(N)=>`A hotel recorded how many rooms were booked by walk-in guests on each of the last ${N} nights. Use these frequencies as probabilities for a future night; let X be the number of walk-in rooms booked on a night.`,
  head:["Rooms","Nights"], ev:w=>`walk-in guests book ${w} rooms on a night`, unit:"rooms",
  interp:E=>`Over many nights, walk-in guests book on average ${E} rooms per night.`,
  partial:E=>`On average, ${E} rooms.`, will:E=>`Walk-in guests will book ${E} rooms tonight.`, most:E=>`${E} rooms is the most likely number of walk-in bookings.`},
 {name:"Returns per week", total:[50,100], vals:[0,1,2,3,4], kind:"run",
  setup:(N)=>`A boutique counted the product returns it received in each of the last ${N} weeks. Use these frequencies as probabilities for a future week; let X be the number of returns in a week.`,
  head:["Returns","Weeks"], ev:w=>`the boutique receives ${w} returns in a week`, unit:"returns",
  interp:E=>`Over many weeks, the boutique receives on average ${E} returns per week.`,
  partial:E=>`On average, ${E} returns.`, will:E=>`The boutique will receive ${E} returns next week.`, most:E=>`${E} returns is the most likely weekly number.`},
 {name:"Credit cards per applicant", total:[200,250], vals:[0,1,2,3,4,5], kind:"set",
  setup:(N)=>`A bank reviewed ${N} loan applications and recorded how many credit cards each applicant holds. One of these ${N} applicants is selected at random; let X be the number of credit cards the selected applicant holds.`,
  head:["Cards","Applicants"], ev:w=>`the selected applicant holds ${w} credit cards`, unit:"cards",
  interp:(E,N)=>`An average number of credit cards held by an applicant in this group of ${N} applicants is ${E} cards.`,
  partial:E=>`On average, ${E} cards.`, will:E=>`The selected applicant will hold ${E} cards.`, most:E=>`${E} cards is the most likely number an applicant holds.`}
];
function makeCounts(k,N){
  for(let tries=0;tries<200;tries++){
    const peak=1+rnd(k-2), w=[];
    for(let i=0;i<k;i++) w.push(Math.max(.15, 1-Math.abs(i-peak)*(.28+Math.random()*.25))+Math.random()*.3);
    const small=Math.random()<.5?0:k-1; w[small]=Math.random()<.35?0:.04+Math.random()*.06;
    const s=w.reduce((a,b)=>a+b,0); const c=w.map(x=>Math.floor(x/s*N)); let rem=N-c.reduce((a,b)=>a+b,0); c[peak]+=rem;
    if(c.every(x=>x>=0)&&c.filter(x=>x>0).length>=k-1&&new Set(c).size>=k-1) return c;
  }
  return Array(k).fill(N/k);
}
function genT1(){
  const ctx=pick(T1CTX), N=pick(ctx.total);
  let vals=ctx.vals.slice(); if(vals.length>5&&Math.random()<.5) vals=vals.slice(0,5);
  const k=vals.length, cnt=makeCounts(k,N), P=cnt.map(c=>c/N);
  const E=P.reduce((s,p,i)=>s+p*vals[i],0), Er=r4(E);
  const dev=vals.map(x=>r4(x-E)), sq=dev.map(d=>r4(d*d)), prod=sq.map((q,i)=>r4(q*P[i]));
  const V=vals.reduce((s,x,i)=>s+P[i]*(x-E)*(x-E),0), SD=Math.sqrt(V);
  // (c) event with a boundary to handle
  const lo=vals[0], hi=vals[k-1]; let ev;
  const kind=pick(["lt","ge","le","btw"]);
  if(kind==="lt"){ const m=vals[1+rnd(k-2)+ (k>3?1:0)]||vals[2]; ev={sym:`P(X < ${m})`, w:`fewer than ${m}`, v:vals.filter(x=>x<m), wrong:[vals.filter(x=>x<=m), vals.filter(x=>x>m), vals.filter(x=>x<m-1)]}; }
  else if(kind==="ge"){ const m=vals[1+rnd(k-2)]; ev={sym:`P(X ≥ ${m})`, w:`at least ${m}`, v:vals.filter(x=>x>=m), wrong:[vals.filter(x=>x>m), vals.filter(x=>x<=m), vals.filter(x=>x<m)]}; }
  else if(kind==="le"){ const m=vals[1+rnd(k-2)]; ev={sym:`P(X ≤ ${m})`, w:`at most ${m}`, v:vals.filter(x=>x<=m), wrong:[vals.filter(x=>x<m), vals.filter(x=>x>=m), vals.filter(x=>x>m)]}; }
  else { const a=vals[rnd(k-2)], b=a+2; ev={sym:`P(${a} < X ≤ ${b})`, w:`more than ${a} but at most ${b}`, v:vals.filter(x=>x>a&&x<=b), wrong:[vals.filter(x=>x>=a&&x<=b), vals.filter(x=>x>a&&x<b), vals.filter(x=>x>=a&&x<b)]}; }
  if(ctx.evNum) ev.w=ev.w.replace("fewer than","lower than").replace("more than","higher than");
  const pv=ev.v.reduce((s,x)=>s+P[vals.indexOf(x)],0);
  const tbl=`<table class="dt"><tr><th>${ctx.head[0]}</th><th>${ctx.head[1]}</th></tr>${vals.map((x,i)=>`<tr><td>${x}</td><td>${cnt[i]}</td></tr>`).join("")}</table>`;
  const sumE=vals.map((x,i)=>`${x}×${fnum(P[i])}`).join(" + ");
  const opts=uniqOpts(list(ev.v), ev.wrong.filter(w=>w.length).map(list));
  const interpOpts=[ctx.interp(Er,N), ctx.partial(Er), ctx.will(Er), ctx.most(Er)];
  const parts=[
   {label:"a", q:"Is X a discrete or continuous random variable? Explain.",
    steps:[mcShuffle({k:"mc", q:"Discrete or continuous?", c:[`Discrete: X takes a finite number of values (specifically, ${k}), which can be listed.`, `Continuous: X can take any value between ${lo} and ${hi}.`, `Discrete: the probabilities sum to 1.`, `Continuous: E[X] does not have to be a whole number.`], a:0, e:"Decide by the set of values X can take, with a one-sentence reason.", o:["P1","D1"]})],
    model:`X assumes a finite number of values (specifically, ${k}), and therefore it is discrete.`},
   {label:"b", q:"Use the information in the table to find the probability distribution for X.",
    steps:[{k:"multi", q:`Divide each count by ${N}. Enter P(x):`, fields:vals.map((x,i)=>({l:`P(${x})`, ans:P[i]})), tol:.0006, o:["P2","D2"]}],
    model:`We have a total of ${N} observations, so divide each count by ${N}:<table class="dt"><tr><th>x</th>${vals.map(x=>`<td>${x}</td>`).join("")}</tr><tr><th>P(x)</th>${P.map(p=>`<td>${fnum(p)}</td>`).join("")}</tr></table>Check: each is between 0 and 1, and they sum to 1.`},
   {label:"c", q:`Find the probability that ${ctx.ev(ev.w)}, that is, ${ev.sym}.`,
    steps:[mcShuffle({k:"mc", q:`Which values of X make ${ev.sym} true?`, c:opts, a:0, e:"Watch strict versus non-strict inequalities: \"fewer than\" and \"more than\" exclude the boundary, \"at least\" and \"at most\" include it.", o:["D1","P3"]}),
           {k:"num", q:`${ev.sym} = ?`, ans:pv, tol:.0006, o:["P3"]}],
    model:`${ev.sym} = ${ev.v.map(x=>`P(X = ${x})`).join(" + ")} = ${ev.v.map(x=>fnum(P[vals.indexOf(x)])).join(" + ")} = ${fnum(pv)}<br>We may add because different values of X are mutually exclusive events.`},
   {label:"d", q:"Find the expected value of X and practically interpret the result.",
    steps:[{k:"num", q:"E[X] = Σ x·P(x) = ?", ans:E, tol:.006, o:["D3"]},
           mcShuffle({k:"mc", q:"Which interpretation earns full credit?", c:interpOpts, a:0, ce:["Full credit: an average, what it's averaged over, context and units.","Partial: it says average, but not of what. That's where the meaning of E[X] lives.","No credit: E[X] is not a prediction of one result.","No credit: E[X] is not the most likely value; it may not even be a possible value."], e:"E[X] is an average over the set (or over many repetitions), never a prediction.", o:["D3"]})],
    model:`E[X] = Σ x·P(x) = ${sumE} = ${fnum(E)}<br>Interpretation: ${ctx.interp(Er,N)}`},
   {label:"e", q:"Find the standard deviation of X.",
    steps:[{k:"num", q:"Var(X) = Σ (x − E[X])²·P(x) = ?", ans:V, tol:.006, o:["D3"]},
           {k:"num", q:"SD(X) = √Var(X) = ?", ans:SD, tol:.006, o:["D3"]}],
    model:`<table class="dt sm"><tr><th>x</th><th>P(x)</th><th>x − E[X]</th><th>(x − E[X])²</th><th>P(x)(x − E[X])²</th></tr>${vals.map((x,i)=>`<tr><td>${x}</td><td>${fnum(P[i])}</td><td>${fnum(dev[i])}</td><td>${f4(sq[i])}</td><td>${f4(prod[i])}</td></tr>`).join("")}</table>Var(X) = ${prod.map(f4).join(" + ")} = ${f4(V)}<br>SD(X) = √${f4(V)} = ${f4(SD)} ${ctx.unit}`}
  ];
  return {tpl:1, title:ctx.name, setup:ctx.setup(N)+tbl, parts};
}

/* ================= TEMPLATE 2: binomial ================= */
const T2CTX=[
 {name:"Coupon redemptions", p:[.3,.2,.4], who:["customer","customers"], yes:["redeems the coupon","redeem the coupon"], no:["does not redeem the coupon","do not redeem the coupon"],
  intro:(n,p)=>`A retailer finds that ${Math.round(p*100)}% of customers who receive a mailed coupon redeem it. ${n} customers receive the coupon. Assume each customer redeems with the same probability, independently of the others.`, xs:"customers who redeem the coupon", succ:"redemptions"},
 {name:"On-time deliveries", p:[.9,.85,.8], who:["delivery","deliveries"], yes:["arrives on time","arrive on time"], no:["arrives late","arrive late"],
  intro:(n,p)=>`A courier delivers ${Math.round(p*100)}% of its packages on time. Consider the next ${n} deliveries, and assume each one is on time with the same probability, independently of the others.`, xs:"deliveries that arrive on time", succ:"on-time deliveries"},
 {name:"First-contact resolution", p:[.75,.7,.8], who:["call","calls"], yes:["is resolved on first contact","are resolved on first contact"], no:["is not resolved on first contact","are not resolved on first contact"],
  intro:(n,p)=>`A help desk resolves ${Math.round(p*100)}% of calls on first contact. Consider the next ${n} calls; assume each call is resolved on first contact with the same probability, independently of the others.`, xs:"calls resolved on first contact", succ:"calls resolved on first contact"},
 {name:"Defective units", p:[.1,.15,.2], who:["unit","units"], yes:["is defective","are defective"], no:["is not defective","are not defective"],
  intro:(n,p)=>`A large production run contains ${Math.round(p*100)}% defective units. An inspector draws a sample of ${n} units. Because the run is large, assume each sampled unit is defective with the same probability, independently of the others.`, xs:"defective units in the sample", succ:"defective units"},
 {name:"Passenger show-ups", p:[.85,.9,.8], who:["passenger","passengers"], yes:["shows up","show up"], no:["is a no-show","are no-shows"],
  intro:(n,p)=>`An airline finds that ${Math.round(p*100)}% of ticketed passengers on a commuter route show up for their flight. A small plane has ${n} tickets sold. Assume each passenger shows up with the same probability, independently of the others.`, xs:"passengers who show up", succ:"passengers showing up"},
 {name:"Job offers", p:[.7,.6,.75], who:["candidate","candidates"], yes:["accepts the offer","accept the offer"], no:["declines the offer","decline the offer"],
  intro:(n,p)=>`A firm finds that ${Math.round(p*100)}% of candidates accept its job offers. It makes offers to ${n} candidates. Assume each candidate accepts with the same probability, independently of the others.`, xs:"candidates who accept the offer", succ:"acceptances"},
 {name:"Loan defaults", p:[.1,.2,.15], who:["borrower","borrowers"], yes:["defaults","default"], no:["repays the loan","repay the loan"],
  intro:(n,p)=>`A lender estimates that ${Math.round(p*100)}% of its small-business borrowers default. Consider ${n} new borrowers; assume each defaults with the same probability, independently of the others.`, xs:"borrowers who default", succ:"defaults"},
 {name:"Survey responses", p:[.3,.25,.35], who:["invitee","invitees"], yes:["responds to the survey","respond to the survey"], no:["does not respond","do not respond"],
  intro:(n,p)=>`Past campaigns show that ${Math.round(p*100)}% of people invited to a customer survey respond. ${n} customers are invited. Assume each responds with the same probability, independently of the others.`, xs:"invitees who respond", succ:"responses"}
];
function genT2(){
  const ctx=pick(T2CTX), n=4+rnd(3), p=pick(ctx.p), q=r2(1-p), ps=String(p), qs=String(q);
  const pm=x=>C(n,x)*Math.pow(p,x)*Math.pow(q,n-x);
  const term=x=>{ const c=C(n,x), a=r4(Math.pow(p,x)), b=r4(Math.pow(q,n-x)), v=r4(pm(x));
    const pieces=[c!==1?`${c}`:null, x>0?`${ps}${x>1?sup(x):""}`:null, n-x>0?`${qs}${n-x>1?sup(n-x):""}`:null].filter(Boolean).join(" × ");
    return {v, line:`P(X = ${x}) = ${n}!/(${x}!·${n-x}!) × ${ps}${sup(x)} × ${qs}${sup(n-x)} = ${pieces} = ${f4(v)}`}; };
  const W=(c,s)=>c===1?`${ctx.who[0]} ${s[0]}`:`${ctx.who[1]} ${s[1]}`;
  const Xdef=`Let X = number of ${ctx.xs} out of ${n}.`;
  // (a) all or none
  const hiP=p>.5; const allNone=hiP?n:0; // ask about the likely end, so answers are not tiny
  const ta=term(allNone);
  const aQ=allNone===n?`All ${n} ${ctx.who[1]} ${ctx.yes[1]}.`:`None of the ${n} ${ctx.who[1]} ${ctx.yes[1]} (all ${ctx.no[1]}).`;
  // (b) exactly k failures
  const kf=hiP?1+rnd(2):n-1-rnd(2), xb=n-kf, tb=term(xb); // phrased through failures, so X has to be converted
  const bQ=kf<=2?`Exactly ${kf===1?"one":"two"} ${kf===1?ctx.who[0]:ctx.who[1]} ${kf===1?ctx.no[0]:ctx.no[1]}.`:`Exactly ${kf} of the ${n} ${ctx.who[1]} ${ctx.no[1]}.`;
  // (c) at least / at most / at least 1
  let cK=hiP?pick(["ge","ge","le"]):pick(["le","le","ge1"]), cv, cQ, cSym, cWrong;
  if(cK==="ge"){ const m=n-1-rnd(2); cv=range(m,n); cQ=`At least ${m} of the ${n} ${ctx.who[1]} ${ctx.yes[1]}.`; cSym=`P(X ≥ ${m})`; cWrong=[range(m+1,n), range(0,m), [m]]; }
  else if(cK==="le"&&hiP){ const m=n-1; cv=range(0,m); cQ=`At most ${m} of the ${n} ${ctx.who[1]} ${ctx.yes[1]}.`; cSym=`P(X ≤ ${m})`; cWrong=[range(0,m-1), [m], range(m,n)]; }
  else if(cK==="le"){ const m=1+rnd(2); cv=range(0,m); cQ=`At most ${m} of the ${n} ${ctx.who[1]} ${ctx.yes[1]}.`; cSym=`P(X ≤ ${m})`; cWrong=[range(0,m-1), range(m,n), range(1,m)]; }
  else { cv=range(1,n); cQ=`At least one of the ${n} ${ctx.who[1]} ${ctx.yes[0]}.`; cSym=`P(X ≥ 1)`; cWrong=[[1], range(2,n), [0]]; }
  let cAns, cModel;
  if(cK==="le"&&hiP){ const tn=term(n); cAns=r4(1-tn.v); cModel=`${cSym} = P(X = 0) + ... + P(X = ${n-1}). Quicker by the complement: the only value left out is X = ${n}.<br>${cSym} = 1 − P(X = ${n})<br>P(X = ${n}) = ${ps}${sup(n)} = ${f4(tn.v)}<br>${cSym} = 1 − ${f4(tn.v)} = ${f4(cAns)}`; }
  else if(cK==="ge1"){ const t0=term(0); cAns=r4(1-t0.v); cModel=`The complement of "at least one" is "none":<br>P(X ≥ 1) = 1 − P(X = 0)<br>${t0.line}<br>P(X ≥ 1) = 1 − ${f4(t0.v)} = ${f4(cAns)}`; }
  else { const ts=cv.map(term); cAns=r4(ts.reduce((s,t)=>s+t.v,0)); cModel=`${cSym} = ${cv.map(x=>`P(X = ${x})`).join(" + ")}<br>${ts.map(t=>t.line).join("<br>")}<br>${cSym} = ${ts.map(t=>f4(t.v)).join(" + ")} = ${f4(cAns)}`; }
  // (d) more than a but fewer than b
  const a=Math.max(0,Math.min(n-3,Math.round(n*p)-2+rnd(2))), b=a+3, dv=range(a+1,b-1), td=dv.map(term), dAns=r4(td.reduce((s,t)=>s+t.v,0));
  const dSym=`P(${a} < X < ${b})`;
  const dQ=`More than ${a} but fewer than ${b} of the ${n} ${ctx.who[1]} ${ctx.yes[1]}.`;
  const E=r4(n*p);
  const opt=(v,wr)=>uniqOpts(list(v), wr.filter(w=>w.length).map(list));
  const interp=`If this experiment were repeated infinitely many times, on average ${fnum(E)} of the ${n} ${ctx.who[1]} would ${ctx.yes[1]}.`;
  const parts=[
   {label:"a", q:aQ,
    steps:[mcShuffle({k:"mc", q:"Which justification of the model earns full credit?", c:[
        `${Xdef} X is the number of successes in ${n} identical, independent trials with the same probability of success, so X ~ B(${n}, ${ps}).`,
        `X is binomial because each ${ctx.who[0]} has two possible outcomes.`,
        `X ~ B(${n}, ${ps}).`,
        `${Xdef} Since it is a probability problem, X ~ B(${ps}, ${n}).`], a:0,
        ce:["Full credit: X defined, structure named, parameters given.","No credit for the justification: two outcomes is only one of the four assumptions.","Partial: the model is stated but nothing shows why it fits.","Not a reason, and the parameters are in the wrong order: B(n, p)."],
        e:"Define X in words, name the structure, then X ~ B(n, p).", o:["D1","D4"]}),
      mcShuffle({k:"mc", q:`Which values of X?`, c:uniqOpts(list([allNone]), [list([allNone===n?0:n]), list(allNone===n?range(1,n):range(0,1)), allNone===n?`X ≥ 1`:`X ≤ 1`]), a:0, e:allNone===n?"All of them succeed: X = n.":"None succeed: X = 0.", o:["D5"]}),
      {k:"num", q:`P(X = ${allNone}) = ?`, ans:ta.v, tol:.0015, o:["D5","P5"]}],
    model:`${Xdef} Since this random variable can be represented as a number of successes in ${n} identical independent trials, X ~ B(${n}, ${ps}).<br>P(X = ${allNone}) = ${allNone===n?`${ps}${sup(n)}`:`${qs}${sup(n)}`} = ${f4(ta.v)}`},
   {label:"b", q:bQ,
    steps:[mcShuffle({k:"mc", q:"Which value of X?", c:uniqOpts(list([xb]), [list([kf]), `X ≤ ${kf}`, `X ≥ ${xb}`, list([Math.max(0,xb-1)])]), a:0, e:`X counts ${ctx.xs}. ${kf} failure${kf>1?"s":""} out of ${n} leaves ${xb} successes.`, o:["D5"]}),
           {k:"num", q:`P(X = ${xb}) = ?`, ans:tb.v, tol:.0015, o:["D5","P5"]}],
    model:`${kf} ${kf===1?ctx.who[0]:ctx.who[1]} that ${kf===1?ctx.no[0]:ctx.no[1]} out of ${n} means X = ${xb}.<br>${tb.line}`},
   {label:"c", q:cQ,
    steps:[mcShuffle({k:"mc", q:`Which values of X?`, c:opt(cv,cWrong), a:0, e:"\"At least\" and \"at most\" include the boundary.", o:["D5","P3"]}),
           ...(cK==="ge1"?[mcShuffle({k:"mc", q:"Quickest route?", c:["1 − P(X = 0)",`P(X = 1)`,`${n} × ${ps}`,`P(X = 0)`], a:0, e:"The complement of \"at least one\" is \"none\".", o:["P3"]})]:[]),
           {k:"num", q:`${cSym} = ?`, ans:cAns, tol:.002, o:["D5","P3","P4"]}],
    model:cModel},
   {label:"d", q:dQ,
    steps:[mcShuffle({k:"mc", q:`Which values of X?`, c:opt(dv,[range(a,b), range(a,b-1), range(a+1,b)]), a:0, e:"Both inequalities are strict for a discrete X.", o:["D5","P3"]}),
           mcShuffle({k:"mc", q:"Why may you add these probabilities?", c:["The values of X are mutually exclusive events","The trials are independent","X is binomial","Each probability is less than 1"], a:0, e:"Mutual exclusivity justifies adding across values; independence justifies multiplying inside each term.", o:["P4"]}),
           {k:"num", q:`${dSym} = ?`, ans:dAns, tol:.002, o:["D5","P3"]}],
    model:`${dSym} = ${dv.map(x=>`P(X = ${x})`).join(" + ")}<br>${td.map(t=>t.line).join("<br>")}<br>${dSym} = ${td.map(t=>f4(t.v)).join(" + ")} = ${f4(dAns)}`},
   {label:"e", q:`Find the expected number of ${ctx.xs} and practically interpret it.`,
    steps:[{k:"num", q:"E[X] = np = ?", ans:E, tol:.006, o:["D3"]},
           mcShuffle({k:"mc", q:"Which interpretation earns full credit?", c:[interp, `On average, ${fnum(E)} ${ctx.succ}.`, `${fnum(E)} of the ${n} ${ctx.who[1]} will ${ctx.yes[1]}.`, `${fnum(E)} is the most likely number of ${ctx.succ}.`], a:0,
             ce:["Full credit: average, over many repetitions, in context.","Partial: an average of what? Say it's over many repetitions of the experiment.","No credit: a prediction of one result. A count can't even be a decimal.","No credit: E[X] is not the most likely value."], e:"An average over many repetitions of the same experiment.", o:["D3"]})],
    model:`E[X] = np = ${n} × ${ps} = ${fnum(E)}<br>Interpretation: ${interp}`}
  ];
  return {tpl:2, title:ctx.name, setup:ctx.intro(n,p)+" Find the following probabilities:", parts};
}
function range(a,b){ const o=[]; for(let i=a;i<=b;i++) o.push(i); return o; }
function sup(k){ return String(k).split("").map(d=>"⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join(""); }

/* ================= TEMPLATE 3: normal ================= */
const T3CTX=[
 {name:"Cereal fill weights", mu:500, sd:4, step:1, unit:"g", int:false,
  setup:"A cereal maker fills boxes on an automated line. Fill weights are approximately normal with a mean of 500 g and a standard deviation of 4 g.",
  above:x=>`What percentage of boxes weigh more than ${x} g?`, below:x=>`What percentage of boxes weigh less than ${x} g?`, between:(a,b)=>`What percentage of boxes weigh between ${a} and ${b} g?`,
  sAbove:(x,p)=>`About ${p}% of boxes weigh more than ${x} g.`, sBelow:(x,p)=>`About ${p}% of boxes weigh less than ${x} g.`, sBetween:(a,b,p)=>`About ${p}% of boxes weigh between ${a} and ${b} g.`,
  cuts:[{q:"The plant re-fills the lightest 5% of boxes. Below what weight is a box re-filled?", P:.05, name:"5th percentile", why:"5% lie below it", c:x=>`Boxes lighter than about ${x} g are re-filled.`},
        {q:"Quality control pulls the heaviest 10% of boxes for a calibration check. Above what weight is a box pulled?", P:.9, name:"90th percentile", why:"10% lie above it, so 90% lie below it", c:x=>`Boxes heavier than about ${x} g are pulled.`}]},
 {name:"Lead-time demand", mu:400, sd:50, step:5, unit:"units", int:true,
  setup:"A distributor's demand for a part during the replenishment lead time is approximately normal with a mean of 400 units and a standard deviation of 50 units.",
  above:x=>`If the distributor reorders when stock falls to ${x} units, what is the probability of a stockout (lead-time demand above ${x})?`, below:x=>`What is the probability that lead-time demand is below ${x} units?`, between:(a,b)=>`What is the probability that lead-time demand is between ${a} and ${b} units?`,
  sAbove:(x,p)=>`About ${p}% of replenishment cycles would stock out with a reorder point of ${x} units.`, sBelow:(x,p)=>`Lead-time demand is below ${x} units in about ${p}% of cycles.`, sBetween:(a,b,p)=>`Lead-time demand is between ${a} and ${b} units in about ${p}% of cycles.`,
  cuts:[{q:"What reorder point gives a 95% service level (stock covers lead-time demand 95% of the time)?", P:.95, name:"95th percentile", why:"P(demand ≤ reorder point) = 0.95", c:x=>`A reorder point of about ${Math.ceil(x)} units gives a 95% service level.`},
        {q:"What reorder point gives a 90% service level?", P:.9, name:"90th percentile", why:"P(demand ≤ reorder point) = 0.90", c:x=>`A reorder point of about ${Math.ceil(x)} units gives a 90% service level.`},
        {q:"What reorder point gives a 99% service level?", P:.99, name:"99th percentile", why:"P(demand ≤ reorder point) = 0.99", c:x=>`A reorder point of about ${Math.ceil(x)} units gives a 99% service level.`}]},
 {name:"Delivery times", mu:45, sd:6, step:1, unit:"minutes", int:false,
  setup:"Delivery times on a restaurant's fixed route are approximately normal with a mean of 45 minutes and a standard deviation of 6 minutes.",
  above:x=>`What percentage of deliveries take longer than ${x} minutes?`, below:x=>`What percentage of deliveries take less than ${x} minutes?`, between:(a,b)=>`What percentage of deliveries take between ${a} and ${b} minutes?`,
  sAbove:(x,p)=>`About ${p}% of deliveries take longer than ${x} minutes.`, sBelow:(x,p)=>`About ${p}% of deliveries take less than ${x} minutes.`, sBetween:(a,b,p)=>`About ${p}% of deliveries take between ${a} and ${b} minutes.`,
  cuts:[{q:"The restaurant wants to promise a delivery time it meets 90% of the time. What time should it promise?", P:.9, name:"90th percentile", why:"90% of deliveries take less than it", c:x=>`It should promise about ${x} minutes.`},
        {q:"Drivers whose deliveries are among the fastest 15% get a bonus. Under what time does a delivery qualify?", P:.15, name:"15th percentile", why:"15% lie below it", c:x=>`Deliveries under about ${x} minutes qualify.`}]},
 {name:"Daily line output", mu:1200, sd:80, step:10, unit:"units", int:true,
  setup:"Daily output of a bottling line is approximately normal with a mean of 1,200 units and a standard deviation of 80 units.",
  above:x=>`What percentage of days produce more than ${x} units?`, below:x=>`What percentage of days produce fewer than ${x} units?`, between:(a,b)=>`What percentage of days produce between ${a} and ${b} units?`,
  sAbove:(x,p)=>`About ${p}% of days produce more than ${x} units.`, sBelow:(x,p)=>`About ${p}% of days produce fewer than ${x} units.`, sBetween:(a,b,p)=>`About ${p}% of days produce between ${a} and ${b} units.`,
  cuts:[{q:"Management labels the lowest 10% of days \"low-output days\". Below what output is a day labeled?", P:.1, name:"10th percentile", why:"10% lie below it", c:x=>`Days with fewer than about ${Math.round(x)} units are low-output days.`},
        {q:"The plant earns a bonus on its best 20% of days. What is the lowest output that earns it?", P:.8, name:"80th percentile", why:"20% lie above it, so 80% lie below it", c:x=>`About ${Math.round(x)} units or more earns the bonus.`}]},
 {name:"Aptitude test scores", mu:500, sd:100, step:10, unit:"points", int:true,
  setup:"Scores on an employer's aptitude test are approximately normal with a mean of 500 and a standard deviation of 100.",
  above:x=>`What percentage of applicants score above ${x}?`, below:x=>`What percentage of applicants score below ${x}?`, between:(a,b)=>`What percentage of applicants score between ${a} and ${b}?`,
  sAbove:(x,p)=>`About ${p}% of applicants score above ${x}.`, sBelow:(x,p)=>`About ${p}% of applicants score below ${x}.`, sBetween:(a,b,p)=>`About ${p}% of applicants score between ${a} and ${b}.`,
  cuts:[{q:"The firm interviews only applicants in the top 15%. What is the lowest score that gets an interview?", P:.85, name:"85th percentile", why:"15% lie above it, so 85% lie below it", c:x=>`The lowest score that gets an interview is about ${Math.round(x)}.`},
        {q:"Applicants in the bottom 25% are not considered. What is the highest score that is still screened out?", P:.25, name:"25th percentile", why:"25% lie below it", c:x=>`Scores below about ${Math.round(x)} are screened out.`}]},
 {name:"Machined part lengths", mu:120, sd:2, step:.5, unit:"mm", int:false,
  setup:"Lengths of a machined part are approximately normal with a mean of 120 mm and a standard deviation of 2 mm.",
  above:x=>`What percentage of parts are longer than ${x} mm?`, below:x=>`What percentage of parts are shorter than ${x} mm?`, between:(a,b)=>`What percentage of parts are between ${a} and ${b} mm long?`,
  sAbove:(x,p)=>`About ${p}% of parts are longer than ${x} mm.`, sBelow:(x,p)=>`About ${p}% of parts are shorter than ${x} mm.`, sBetween:(a,b,p)=>`About ${p}% of parts are between ${a} and ${b} mm.`,
  cuts:[{q:"The longest 2.5% of parts are rejected. Above what length is a part rejected?", P:.975, name:"97.5th percentile", why:"2.5% lie above it, so 97.5% lie below it", c:x=>`Parts longer than about ${x} mm are rejected.`},
        {q:"The shortest 5% of parts are reworked. Below what length is a part reworked?", P:.05, name:"5th percentile", why:"5% lie below it", c:x=>`Parts shorter than about ${x} mm are reworked.`}]}
];
function nx(ctx,zlo,zhi,sign){ // a value of x, on the grid, whose z lands in [zlo, zhi] on the given side
  for(let t=0;t<200;t++){ const z0=zlo+Math.random()*(zhi-zlo); const x=Math.round((ctx.mu+sign*z0*ctx.sd)/ctx.step)*ctx.step;
    const z=r2((x-ctx.mu)/ctx.sd); if(Math.abs(z)>=zlo&&Math.abs(z)<=zhi) return {x:+x.toFixed(2), z}; }
  return {x:ctx.mu+sign*ctx.sd, z:sign*1}; }
const pctS=p=>String(r2(p*100));
function zLine(x,ctx,z){ return `z = (x − μ)/σ = (${x} − ${ctx.mu})/${ctx.sd} = ${fz(z)}`; }
function genT3(){
  const ctx=pick(T3CTX);
  // (a) cutoff
  const cut=pick(ctx.cuts), zf=zFor(cut.P), xc=r2(ctx.mu+zf.z*ctx.sd), xAlt=zf.alt!=null?r2(ctx.mu+zf.alt*ctx.sd):null;
  const tol=Math.max(.011*ctx.sd+.02, ctx.int?.6:0);
  const lookup=cut.P<.5?`${cut.name}: ${cut.why}. The table only has positive z, so look up ${r2(1-cut.P)}: the closest table probability is ${f4(zf.t)} at z = ${fz(-zf.z)}${zf.alt!=null?` (or ${fz(-zf.alt)})`:""}. By symmetry the ${cut.name} has z = ${fz(zf.z)}.`
    :`We need the ${cut.name} (${cut.why}). The closest table probability to ${cut.P} is ${f4(zf.t)}, for z = ${fz(zf.z)}${zf.alt!=null?` (${fz(zf.alt)} is equally close; either is fine if you say which)`:""}.`;
  const pctOpts=uniqOpts(`The ${cut.name}`, [`The ${pctName(1-cut.P)}`, `P(X > ${Math.round(cut.P*100)})`, `μ + ${Math.round(cut.P*100)}%`]);
  // (b) above or below
  const bk=pick(["aboveHi","belowLo","belowHi","aboveLo"]);
  let bq,bAns,bModel,bz,bx,bSent;
  if(bk==="aboveHi"||bk==="belowHi"){ const v=nx(ctx,.5,2.2,1); bx=v.x; bz=v.z; }
  else { const v=nx(ctx,.5,2.2,-1); bx=v.x; bz=v.z; }
  const t=phi(Math.abs(bz)), az=fz(Math.abs(bz));
  if(bk==="aboveHi"){ bAns=r4(1-t); bq=ctx.above(bx); bModel=`P(X > ${bx}) = 1 − P(Z < ${az}) = 1 − ${f4(t)} = ${f4(bAns)}`; bSent=ctx.sAbove(bx,pctS(bAns)); }
  else if(bk==="belowHi"){ bAns=t; bq=ctx.below(bx); bModel=`P(X < ${bx}) = P(Z < ${az}) = ${f4(t)}`; bSent=ctx.sBelow(bx,pctS(bAns)); }
  else if(bk==="belowLo"){ bAns=r4(1-t); bq=ctx.below(bx); bModel=`By symmetry, P(X < ${bx}) = P(Z < ${fz(bz)}) = 1 − P(Z < ${az}) = 1 − ${f4(t)} = ${f4(bAns)}`; bSent=ctx.sBelow(bx,pctS(bAns)); }
  else { bAns=t; bq=ctx.above(bx); bModel=`By symmetry, P(X > ${bx}) = P(Z > ${fz(bz)}) = P(Z < ${az}) = ${f4(t)}`; bSent=ctx.sAbove(bx,pctS(bAns)); }
  // (c) between: either both above the mean, or straddling it
  let c1,c2;
  if(Math.random()<.5){ c1=nx(ctx,.3,1.1,1); c2=nx(ctx,1.2,2.3,1); }
  else { c1=nx(ctx,.4,1.6,-1); c2=nx(ctx,.4,1.8,1); }
  const p1=phi(c1.z), p2=phi(c2.z), cAns=r4(p2-p1);
  const p1txt=c1.z<0?`P(X < ${c1.x}) = P(Z < ${fz(c1.z)}) = 1 − P(Z < ${fz(-c1.z)}) = 1 − ${f4(phi(-c1.z))} = ${f4(p1)}`:`P(X < ${c1.x}) = P(Z < ${fz(c1.z)}) = ${f4(p1)}`;
  const parts=[
   {label:"a", q:cut.q,
    steps:[mcShuffle({k:"mc", q:"What are you looking for?", c:pctOpts, a:0, e:`${cut.why}.`, o:["C5"]}),
           {k:"num", q:"z from the table = ?", ans:zf.z, alt:zf.alt, tol:.0051, o:["C4","C5"]},
           {k:"num", q:`x = μ + zσ = ? (${ctx.unit})`, ans:xc, alt:xAlt, tol, o:["C5","C6"]}],
    model:`${lookup}<br>x = μ + zσ = ${ctx.mu} + (${fz(zf.z)})(${ctx.sd}) = ${fnum(xc)} ${ctx.unit}${xAlt!=null?` (with z = ${fz(zf.alt)}: ${fnum(xAlt)})`:""}<br>${cut.c(xc)}`},
   {label:"b", q:bq,
    steps:[{k:"num", q:"z = (x − μ)/σ = ?", ans:bz, tol:.0051, o:["C5"]},
           {k:"num", q:"Probability (as a decimal) = ?", ans:bAns, tol:.0015, pct:true, o:["C4","P3"]}],
    model:`${zLine(bx,ctx,bz)}<br>The table gives P(Z < ${az}) = ${f4(t)}.<br>${bModel}<br>${bSent}`},
   {label:"c", q:ctx.between(c1.x,c2.x),
    steps:[{k:"num", q:`z for ${c1.x} = ?`, ans:c1.z, tol:.0051, o:["C5"]},
           {k:"num", q:`z for ${c2.x} = ?`, ans:c2.z, tol:.0051, o:["C5"]},
           {k:"num", q:"Probability (as a decimal) = ?", ans:cAns, tol:.0015, pct:true, o:["C4","P3"]}],
    model:`P(${c1.x} < X < ${c2.x}) = P(X < ${c2.x}) − P(X < ${c1.x})<br>${zLine(c2.x,ctx,c2.z)} → P(X < ${c2.x}) = ${f4(p2)}<br>${zLine(c1.x,ctx,c1.z)} → ${p1txt}<br>P(${c1.x} < X < ${c2.x}) = ${f4(p2)} − ${f4(p1)} = ${f4(cAns)}<br>${ctx.sBetween(c1.x,c2.x,pctS(cAns))}`}
  ];
  return {tpl:3, title:ctx.name, setup:ctx.setup, parts};
}
function pctName(P){ const v=r2(P*100); const s=String(v); const last=Math.floor(v)%10, two=Math.floor(v)%100;
  const suf=(Number.isInteger(v)&&!(two>=11&&two<=13))?(last===1?"st":last===2?"nd":last===3?"rd":"th"):"th"; return `${s}${suf} percentile`; }
const GEN={1:genT1,2:genT2,3:genT3};

/* ================= SPEED DRILLS: one-step items, generated fresh each time ================= */
function numOpts(correct, others, fmt){ const seen=new Set([fmt(correct)]); const out=[correct];
  others.forEach(o=>{ if(o==null||!isFinite(o)) return; const k=fmt(o); if(!seen.has(k)&&out.length<4){ seen.add(k); out.push(o); } });
  let bump=1; while(out.length<4){ const o=correct+bump*(Math.random()<.5?-.01:.01)*(1+rnd(9)); const k=fmt(o); if(!seen.has(k)&&o>0){ seen.add(k); out.push(o); } bump++; }
  return out; }
const DRILLS={
 words:{title:"Words → X", sub:"Translate the wording before any math", gen(){
   const ctx=pick(T2CTX), n=4+rnd(3), what=`X = number of ${ctx.xs} out of ${n}`;
   const kind=pick(["ge","le","gt","lt","fail","btw","one","top","bot"]);
   let q,v,wrong,e,o=["D5"];
   if(kind==="ge"){ const k=1+rnd(n-1); q=`At least ${k}`; v=range(k,n); wrong=[range(k+1,n),range(0,k),range(0,k-1)]; e="\"At least\" includes the number itself."; }
   else if(kind==="le"){ const k=1+rnd(n-2); q=`At most ${k}`; v=range(0,k); wrong=[range(0,k-1),range(k,n),range(k+1,n)]; e="\"At most\" includes the number itself."; }
   else if(kind==="gt"){ const k=1+rnd(n-2); q=`More than ${k}`; v=range(k+1,n); wrong=[range(k,n),range(0,k),range(0,k-1)]; e="\"More than\" leaves the number itself out."; }
   else if(kind==="lt"){ const k=2+rnd(n-2); q=`Fewer than ${k}`; v=range(0,k-1); wrong=[range(0,k),range(k,n),range(1,k-1)]; e="\"Fewer than\" leaves the number itself out."; }
   else if(kind==="fail"){ const k=1+rnd(2); q=`Exactly ${k===1?"one":"two"} ${k===1?ctx.who[0]:ctx.who[1]} ${k===1?ctx.no[0]:ctx.no[1]}`; v=[n-k]; wrong=[[k],range(n-k,n),range(0,k)]; e=`X counts successes, so ${k} failure${k>1?"s":""} out of ${n} means X = ${n-k}.`; }
   else if(kind==="btw"){ const a=rnd(n-2), b=a+3; q=`More than ${a} but fewer than ${b}`; v=range(a+1,b-1); wrong=[range(a,b),range(a,b-1),range(a+1,b)]; e="Both are strict: leave out both ends."; }
   else if(kind==="one"){ return {q:`${what}. Fastest way to get P(at least one)?`, c:["1 − P(X = 0)","P(X = 1)",`P(X = 1) + ... + P(X = ${n}), term by term`,`1 − P(X = ${n})`], a:0, e:"The opposite of \"at least one\" is \"none\".", o:["P3","D5"]}; }
   else { const k=pick([5,10,15,20,25]); const top=kind==="top"; const name=top?pctName((100-k)/100):pctName(k/100);
     return {q:top?`Normal X. \"The lowest value that still makes the top ${k}%\" is the...`:`Normal X. \"The highest value that is still in the bottom ${k}%\" is the...`,
       c:[name, top?pctName(k/100):pctName((100-k)/100), `P(X > ${k})`, `μ ${top?"+":"−"} ${k}%`], a:0, e:top?`${k}% lie above it, so ${100-k}% lie below it.`:`${k}% lie below it.`, o:["C5"]}; }
   return {q:`${what}. \"${q}\" means:`, c:uniqOpts(list(v), wrong.filter(w=>w.length).map(list)), a:0, e, o}; }},
 ztable:{title:"Table reading", sub:"z → area, area → z, with symmetry", gen(){
   const kind=pick(["below","above","negbelow","negabove","inverse","inverse"]);
   const r=3+rnd(23), c=rnd(10), z=(r*10+c)/100, t=ZT[r][c], zs=z.toFixed(2);
   const f=x=>x.toFixed(4);
   if(kind==="inverse"){ const P=pick([.8,.85,.9,.95,.975,.99,.75,.7,.6]); const zf=zFor(P);
     const c4=numOpts(zf.z,[zf.z+.01*(1+rnd(3)),-zf.z,r2(P),zf.z-.1],x=>x.toFixed(2));
     return {q:`Which z has about ${Math.round(P*1000)/10}% of the area to its LEFT?`, c:c4.map(x=>x.toFixed(2).replace("-","−")), a:0, e:`Find the probability closest to ${P} inside the table: ${f(zf.t)} at z = ${zf.z.toFixed(2)}${zf.alt!=null?` (or ${zf.alt.toFixed(2)})`:""}.`, o:["C4","C5"]}; }
   let q,ans,e;
   if(kind==="below"){ q=`P(Z < ${zs}) = ?`; ans=t; e=`Read row ${zs.slice(0,3)}, column 0.0${zs[3]}: the table gives area to the left.`; }
   else if(kind==="above"){ q=`P(Z > ${zs}) = ?`; ans=r4(1-t); e=`Complement: 1 − ${f(t)} = ${f(1-t)}.`; }
   else if(kind==="negbelow"){ q=`P(Z < −${zs}) = ?`; ans=r4(1-t); e=`Symmetry: P(Z < −${zs}) = 1 − P(Z < ${zs}) = 1 − ${f(t)} = ${f(1-t)}.`; }
   else { q=`P(Z > −${zs}) = ?`; ans=t; e=`Symmetry: the area right of −${zs} equals the area left of ${zs}: ${f(t)}.`; }
   const c4=numOpts(ans,[r4(1-ans), ZT[Math.min(30,r+1)][c], r4(t-.5), ZT[r][(c+1)%10]],f);
   return {q, c:c4.map(f), a:0, e, o:["C4"]}; }},
 coef:{title:"Binomial pieces", sub:"C(n, x), powers and the setup", gen(){
   const kind=pick(["c","c","c","setup"]);
   if(kind==="c"){ const n=4+rnd(3), x=1+rnd(n-1), v=C(n,x);
     const c4=numOpts(v,[n*x, fact(n)/fact(x), x===1?n+1:C(n,x-1)+ (C(n,x-1)===v?1:0), v+n],x=>String(x));
     return {q:`C(${n}, ${x}) = ?`, c:c4.map(String), a:0, e:`${n}!/(${x}!·${n-x}!) = ${fact(n)}/(${fact(x)}·${fact(n-x)}) = ${v}. Not ${n} × ${x}.`, o:["D5"]}; }
   const n=4+rnd(3), x=1+rnd(n-1), p=pick([.1,.2,.3,.7,.8,.9,.85,.75]), q=r2(1-p);
   const ok=`${C(n,x)} × ${p}${sup(x)} × ${q}${sup(n-x)}`;
   return {q:`X ~ B(${n}, ${p}). Which expression is P(X = ${x})?`, c:uniqOpts(ok,[`${n*x} × ${p}${sup(x)} × ${q}${sup(n-x)}`, `${C(n,x)} × ${p}${sup(n-x)} × ${q}${sup(x)}`, `${p}${sup(x)} × ${q}${sup(n-x)}`]), a:0, e:`C(${n}, ${x}) = ${C(n,x)}, then p to the number of successes (${x}) and 1 − p to the number of failures (${n-x}).`, o:["D5","P5"]}; }}
};
