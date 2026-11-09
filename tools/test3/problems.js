/* ================= PROBLEM GENERATORS =================
   Each call builds a fresh problem in the structure of one of the three posted templates (sections 7 to 9 of the
   tutor kit), in a new business context, with every number computed here and the model answer written the way the
   posted solutions write it. Normal lookups use the test's z table (ZT); critical t and p-value brackets use the
   test's t table (TT) only, so every number matches what you can find on paper.
   A problem = {tpl, title, setup, parts:[{label, q, steps:[step], model}]}
   A step   = {k:"mc", q, c, a, e, ce?, o}  |  {k:"num", q, ans, alt?, tol, o, mc?}  |  {k:"multi", q, fields:[{l, ans}], tol, o}
*/
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const r4=x=>Math.round((x+Number.EPSILON)*1e4)/1e4;
const r3=x=>Math.round((x+Number.EPSILON)*1e3)/1e3;
const r2=x=>Math.round((x+Number.EPSILON)*100)/100;
const f4=x=>r4(x).toFixed(4);
const fz=x=>(x<0?"−":"")+Math.abs(x).toFixed(2);
const neg=s=>String(s).replace(/^-/,"−");
/* numbers the way a calculator shows them: up to `d` decimals, no trailing zeros */
const fx=(x,d=4)=>neg(String(+(+x).toFixed(d)));
const sig3=x=>{ if(x===0) return 0; const k=Math.max(0,2-Math.floor(Math.log10(Math.abs(x)))); return +x.toFixed(k); };
function mcShuffle(step){ const idx=step.c.map((_,i)=>i); for(let i=idx.length-1;i>0;i--){ const j=rnd(i+1); [idx[i],idx[j]]=[idx[j],idx[i]]; }
  return {...step, c:idx.map(i=>step.c[i]), a:idx.indexOf(step.a), ce:step.ce?idx.map(i=>step.ce[i]):undefined}; }
function uniqOpts(correct, others){ const seen=new Set([correct]); const out=[correct]; others.forEach(o=>{ if(!seen.has(o)&&out.length<4){ seen.add(o); out.push(o); } }); return out; }
/* a multiple-choice step whose wrong options each come with the reason they're wrong */
const mc=(q,right,wrongs,o,e)=>({k:"mc", q, c:[right[0],...wrongs.map(w=>w[0])], a:0, ce:["Right. "+(right[1]||""),...wrongs.map(w=>w[1])], e:e||right[1]||"", o});
/* Calculation steps carry a multiple-choice version (step.mc): the right working plus common wrong setups,
   each written out to its result, so no calculator is needed. Duplicated results are dropped. */
function calc(step, right, wrongs, key=o=>String(o.v)){
  const seen=new Set([key(right)]), out=[right];
  wrongs.forEach(w=>{ if(!w||(w.v!=null&&!isFinite(w.v))) return; const k=key(w); if(!seen.has(k)&&out.length<4){ seen.add(k); out.push(w); } });
  step.mc={c:out.map(o=>o.t), a:0, ce:out.map((o,i)=>i?o.w:"Right setup. "+(right.w||"")), e:right.w||""};
  return step; }
function range(a,b){ const o=[]; for(let i=a;i<=b;i++) o.push(i); return o; }

/* ---------- the z table ---------- */
function phi(z){ // area to the left of z from the table (z rounded to 2 decimals); beyond 3.09 the table's last value
  const a=Math.min(Math.abs(z),3.09); const r=Math.floor(Math.round(a*100)/10), c=Math.round(a*100)%10;
  const v=ZT[Math.min(r,30)][c]; return z<0?r4(1-v):v; }
function zFor(P){ // closest table entry; returns {z, t (table prob used), alt (equally close z or null)}
  if(P<.5){ const s=zFor(1-P); return {z:-s.z, t:s.t, alt:s.alt==null?null:-s.alt, flip:true}; }
  let best=[], bd=Infinity;
  for(let r=0;r<=30;r++) for(let c=0;c<10;c++){ const d=Math.round(Math.abs(ZT[r][c]-P)*1e5); if(d<bd){ bd=d; best=[[r,c]]; } else if(d===bd) best.push([r,c]); }
  const z=(best[0][0]*10+best[0][1])/100; const alt=best.length>1?(best[best.length-1][0]*10+best[best.length-1][1])/100:null;
  return {z, t:ZT[best[0][0]][best[0][1]], alt}; }
/* z for a confidence level, as the posted solution reads it (90% → 1.64, 99% → 2.58 with 2.57 also accepted) */
const ZCRIT={90:{z:1.64,alt:1.65,look:.95,near:".9495 (z = 1.64) and .9505 (z = 1.65)"},95:{z:1.96,alt:null,look:.975,near:".9750, exactly at z = 1.96"},99:{z:2.58,alt:2.57,look:.995,near:".9949 (z = 2.57) and .9951 (z = 2.58)"}};
/* the t table: critical value for a right-tail area, and the bracket a statistic falls in */
const tcrit=(df,area)=>trow(df)[TCOL.indexOf(area)];
function tBracket(df,t){ const row=trow(df), a=Math.abs(t); let k=-1; for(let i=0;i<row.length;i++) if(a>=row[i]) k=i;
  // k = last column whose critical value is <= |t|: one-tail p is below TCOL[k] and above TCOL[k+1]
  return {k, hi:k<0?null:TCOL[k], lo:k+1<TCOL.length?TCOL[k+1]:null, tlo:k<0?null:row[k], thi:k+1<row.length?row[k+1]:null}; }
function bracketText(b,two){ const m=x=>two?r4(2*x):x;
  if(b.k<0) return `p-value > ${pf(m(TCOL[0]))}`;
  if(b.lo==null) return `p-value < ${pf(m(TCOL[TCOL.length-1]))}`;
  return `${pf(m(b.lo))} < p-value < ${pf(m(b.hi))}`; }

/* ================= TEMPLATE 1: sampling distribution of the sample mean ================= */
const T1CTX=[
 {name:"Bottle fill volumes", unit:"ml", u:" ml", one:"bottle", many:"bottles", what:"fill volume", mu:500, sig:[4,5,6], d:1, proc:"a filling line", shape:"fill volumes",
  story:(n,s)=>`A bottling plant checks whether its filling line is properly adjusted. A random sample of ${n} bottles is taken and the fill volume of each is measured. The standard deviation of fill volumes, measured over a long period of time, is ${s} ml.`},
 {name:"Package weights", unit:"g", u:" g", one:"bag", many:"bags", what:"weight", mu:1000, sig:[12,15,18], d:1, proc:"a packing machine", shape:"package weights",
  story:(n,s)=>`A coffee roaster packs bags on an automatic packing machine. To check the machine, a random sample of ${n} bags is weighed. The standard deviation of bag weights over a long period of time is ${s} g.`},
 {name:"Call handling times", unit:"minutes", u:" min", one:"call", many:"calls", what:"handling time", mu:7.5, sig:[2.4,3,3.6], d:2, proc:"the call center", shape:"handling times",
  story:(n,s)=>`A call center monitors how long its agents take to handle a call. A random sample of ${n} calls is drawn from this week's records. Over a long period of time, the standard deviation of handling times has been ${s} minutes.`},
 {name:"Delivery times", unit:"minutes", u:" min", one:"delivery", many:"deliveries", what:"delivery time", mu:42, sig:[6,7,8], d:1, proc:"the delivery route", shape:"delivery times",
  story:(n,s)=>`A courier tracks the time it takes to complete deliveries on one of its routes. A random sample of ${n} deliveries is selected. Over a long period of time, the standard deviation of delivery times on this route has been ${s} minutes.`},
 {name:"Online order values", unit:"dollars", u:"", one:"order", many:"orders", what:"order value", mu:86, sig:[24,30,36], d:2, proc:"the online store", shape:"order values", money:true,
  story:(n,s)=>`An online store studies the value of its orders. A random sample of ${n} orders is selected from last month. The standard deviation of order values, measured over a long period of time, is $${s}.`},
 {name:"Machined part lengths", unit:"mm", u:" mm", one:"part", many:"parts", what:"length", mu:120, sig:[.24,.3,.36], d:3, proc:"a CNC lathe", shape:"part lengths",
  story:(n,s)=>`To check whether a CNC lathe that cuts steel pins is properly adjusted, a random sample of ${n} pins is collected and the length of each is measured. The standard deviation of the lengths, measured over a long period of time, is ${s} mm.`}
];
const money=(ctx,x)=>ctx.money?`$${fx(x,ctx.d)}`:`${fx(x,ctx.d)}${ctx.u}`;
function genT1(){
  const ctx=pick(T1CTX), n=pick([36,49,64,81,100]), rt=Math.sqrt(n), sig=pick(ctx.sig), SE=sig/rt, SEs=sig3(SE), mu=ctx.mu;
  const v=x=>money(ctx,x), D=ctx.d+1; // values carry one more decimal than the context's usual unit
  const kind=Math.random()<.6?"within":pick(["above","below"]);
  // part (a): pick a z with a clean table read, then a distance in the context's units, then recompute z from it
  let d, z, a0;
  for(let k=0;k<50;k++){ const zt=pick([.4,.5,.6,.8,1,1.2,1.25,1.4,1.5,1.6,1.75,1.8,2,2.2,2.25,2.4]); d=+(zt*SE).toFixed(D); z=r2(d/SE); if(Math.abs(z-zt)<.015&&d>0) break; }
  const tab=phi(Math.abs(z));
  let pA, exprA, partA, bodyA, wrongA;
  if(kind==="within"){ pA=r4(2*(tab-.5)); exprA=`P(μ − ${fx(d,D)} ≤ X̄ ≤ μ + ${fx(d,D)})`; partA=`What is the probability that the mean ${ctx.what} x̄ of the sample of ${n} ${ctx.many} will lie within ${v(d)} of the population mean ${ctx.what}?`;
    bodyA=`P(μ − ${fx(d,D)} ≤ X̄ ≤ μ + ${fx(d,D)}) = P(−${z.toFixed(2)} ≤ Z ≤ ${z.toFixed(2)})<br>From the table, P(Z ≤ ${z.toFixed(2)}) = ${f4(tab)}. Hence, due to the symmetry and the rule of complements,<br>P(−${z.toFixed(2)} ≤ Z ≤ ${z.toFixed(2)}) = 2·(${f4(tab)} − .5) = <b>${f4(pA)}</b>`;
    wrongA=[{t:`P(Z ≤ ${z.toFixed(2)}) = ${f4(tab)}`, v:tab, w:"That's only the area to the left of z. The event has two ends: subtract the left tail too."},
            {t:`2 · ${f4(tab)} = ${f4(2*tab)}`, v:r4(2*tab), w:"A probability can't exceed 1: subtract .5 before doubling."},
            {t:`1 − ${f4(tab)} = ${f4(1-tab)}`, v:r4(1-tab), w:"That's one tail outside the band, not the band itself."}]; }
  else { const above=kind==="above"; a0=+(mu+(above?d:-d)).toFixed(D);
    pA=r4(1-tab); exprA=above?`P(X̄ > ${fx(a0,D)})`:`P(X̄ < ${fx(a0,D)})`;
    partA=`The ${ctx.what}s of ${ctx.many} from ${ctx.proc} have mean ${v(mu)}. What is the probability that the mean ${ctx.what} x̄ of the sample of ${n} ${ctx.many} will be ${above?"greater":"less"} than ${v(a0)}?`;
    bodyA=above?`P(X̄ > ${fx(a0,D)}) = P(Z > (${fx(a0,D)} − ${fx(mu,D)})/${fx(SEs,6)}) = P(Z > ${z.toFixed(2)})<br>From the table, P(Z ≤ ${z.toFixed(2)}) = ${f4(tab)}, so by the rule of complements P(Z > ${z.toFixed(2)}) = 1 − ${f4(tab)} = <b>${f4(pA)}</b>`
      :`P(X̄ < ${fx(a0,D)}) = P(Z < (${fx(a0,D)} − ${fx(mu,D)})/${fx(SEs,6)}) = P(Z < −${z.toFixed(2)})<br>From the table, P(Z ≤ ${z.toFixed(2)}) = ${f4(tab)}, so by symmetry and the rule of complements P(Z < −${z.toFixed(2)}) = 1 − ${f4(tab)} = <b>${f4(pA)}</b>`;
    wrongA=[{t:`${f4(tab)} (the table value)`, v:tab, w:above?"That's the area to the left of z; the question asks for the area above.":"That's P(Z < +z). For a negative z use symmetry: 1 − table."},
            {t:`${f4(tab)} − .5 = ${f4(tab-.5)}`, v:r4(tab-.5), w:"That's the area between 0 and z, but the table gives area to the left of z."},
            {t:`2·(1 − ${f4(tab)}) = ${f4(2*(1-tab))}`, v:r4(2*(1-tab)), w:"That counts both tails; the question asks for one side only."}]; }
  const zSigma=r2(d/sig);
  const viz=kind==="within"?`[[normal:0,1|btw=${-z},${z}|cap=${exprA} = P(−${z.toFixed(2)} ≤ Z ≤ ${z.toFixed(2)}) = ${f4(pA)}]]`:kind==="above"?`[[normal:0,1|gt=${z}|cap=P(Z > ${z.toFixed(2)}) = ${f4(pA)}]]`:`[[normal:0,1|lt=${-z}|cap=P(Z < −${z.toFixed(2)}) = ${f4(pA)}]]`;
  const setup=`<p>${ctx.story(n,sig)}</p>`;
  const cltWords=`According to the Central Limit Theorem, if the sample is random and the sample size is large enough (rule of thumb is n ≥ 30), X̄ ~ N(μ, σ/√n) approximately. The sample is random and n = ${n} ≥ 30, so the probability can be found using the normal distribution model.`;
  const modelA=`We need to find ${exprA}.<br>${cltWords}<br>Note: "the standard deviation measured over a long period of time" implies that ${fx(sig,4)} is the "true" standard deviation of the process, or very close to it, that is, σ ≈ ${fx(sig,4)}.<br>The standard error is σ/√n = ${fx(sig,4)}/√${n} = ${fx(sig,4)}/${rt} = ${fx(SEs,6)}<br>z = (x̄ − μ)/(σ/√n) = ${fx(d,D)}/${fx(SEs,6)} = ${z.toFixed(2)}<br>${bodyA}${viz}`;
  const partAsteps=[
    mc("Which probability does this part ask for?",[exprA,"x̄ is the mean of a random sample, so the question is about the random variable X̄ (capital), not a single "+ctx.one+"."],
      kind==="within"?[[`P(μ − ${fx(d,D)} ≤ X ≤ μ + ${fx(d,D)})`,"X is one "+ctx.one+"'s "+ctx.what+". The question is about the sample mean X̄."],[`P(X̄ ≤ μ + ${fx(d,D)})`,"\"Within\" has two ends: below the upper bound AND above the lower bound."],[`P(x̄ = μ)`,"For a continuous X̄, the probability of one exact value is 0; the question asks about a band."]]
      :[[exprA.replace("X̄","X"),"X is one "+ctx.one+"'s "+ctx.what+". The question is about the sample mean X̄."],[kind==="above"?`P(X̄ < ${fx(a0,D)})`:`P(X̄ > ${fx(a0,D)})`,"That's the opposite side of the cutoff."],[`P(X̄ = ${fx(a0,D)})`,"For a continuous X̄ a single value has probability 0."]],["S1","S2"]),
    mc("What justifies using the normal distribution for X̄?",[`The CLT: the sample is random and n = ${n} ≥ 30, so X̄ ~ N(μ, σ/√n) approximately`,"Name the theorem, check its conditions with numbers, then state the distribution."],
      [["The "+ctx.shape+" themselves are normally distributed","Nothing in the problem says the population is normal, and the CLT doesn't need it when n is large."],
       [`With n = ${n} ≥ 30 the ${ctx.many} in the sample are normally distributed`,"The CLT is about the sampling distribution of x̄, not the data in the sample."],
       ["X̄ ~ N(μ, σ) because σ is known","Right family, wrong spread: the standard deviation of X̄ is σ/√n."]],["S3","S1"]),
    calc({k:"num", q:`Standard error of x̄ (σ/√n)`, ans:SE, tol:Math.max(SE*.01,5e-7), o:["S2"]},
      {t:`${fx(sig,4)}/√${n} = ${fx(sig,4)}/${rt} = ${fx(SEs,6)}`, v:SEs, w:"σ/√n: four times the sample size halves the standard error."},
      [{t:`${fx(sig,4)}/${n} = ${fx(sig3(sig/n),6)}`, v:sig3(sig/n), w:"Divide by √n, not n."},{t:`${fx(sig,4)} (σ itself)`, v:sig, w:"σ describes single "+ctx.many+"; the mean of "+n+" varies less: σ/√n."},{t:`${fx(sig,4)}/√${n-1} = ${fx(sig3(sig/Math.sqrt(n-1)),6)}`, v:sig3(sig/Math.sqrt(n-1)), w:"n − 1 belongs in degrees of freedom for t, not in the standard error."}]),
    calc({k:"num", q:`z-score for the cutoff (two decimals)`, ans:kind==="below"?-z:z, alt:kind==="within"?-z:null, tol:.011, o:["C5","S2"]},
      {t:`${fx(d,D)}/${fx(SEs,6)} = ${(kind==="below"?-z:z).toFixed(2).replace("-","−")}`, v:z, w:"Distance from μ divided by the standard error."},
      [{t:`${fx(d,D)}/${fx(sig,4)} = ${zSigma.toFixed(2)}`, v:zSigma, w:"A common error: dividing by σ instead of σ/√n."},{t:`${fx(d,D)}/(${fx(sig,4)}/${n}) = ${r2(d/(sig/n)).toFixed(2)}`, v:r2(d/(sig/n)), w:"Divide σ by √n, not by n."},{t:`${fx(SEs,6)}/${fx(d,D)} = ${r2(SE/d).toFixed(2)}`, v:r2(SE/d), w:"Upside down: divide the distance by the standard error."}]),
    calc({k:"num", q:`The probability (four decimals)`, ans:pA, tol:.0015, o:["C4"]},
      {t:kind==="within"?`2·(${f4(tab)} − .5) = ${f4(pA)}`:`1 − ${f4(tab)} = ${f4(pA)}`, v:pA, w:kind==="within"?"Symmetry: twice the area between 0 and z.":"Complement (and symmetry for a negative z)."}, wrongA)];
  // part (b): does the answer survive a change in the population's shape?
  const bk=pick(["somewhat","somewhat","extreme","small"]), smallN=pick([9,16]);
  const qB=bk==="small"?`Suppose instead that only ${smallN} ${ctx.many} could be sampled, and the population of ${ctx.shape} is strongly skewed. Would the normal model for x̄ used in part (a) still be reliable?`
    :`If the population of ${ctx.shape} has ${bk==="somewhat"?"a somewhat":"an extremely"} skewed distribution, will your answer for part (a) still be valid?`;
  const rightB=bk==="somewhat"?[`Yes: n = ${n} ≥ 30 is large enough, so the CLT handles a somewhat skewed population`,"Random sample and n large enough: moderate skew is no problem."]
    :bk==="extreme"?[`Probably, but with caution: n = ${n} meets the rule of thumb, but n ≥ 30 is least reliable for extremely skewed populations, so check the shape of the sample data`,"The rule of thumb is a guide, not a guarantee; say why you're cautious."]
    :[`No: the population is far from normal and n = ${smallN} is too small for the CLT, so x̄ can't be assumed approximately normal`,"Neither condition holds: not a normal population, not a large sample."];
  const wrongB=bk==="small"?[[`Yes: the CLT always makes x̄ normal`,"The CLT needs n large enough; with a strongly skewed population "+smallN+" is far too few."],[`Yes, if we use σ/√n`,"The formula for the SE doesn't fix the shape of the sampling distribution."],[`It depends only on whether σ is known`,"Knowing σ doesn't make x̄ normal; the shape condition is what fails here."]]
    :[[`No: the CLT requires a normal population`,"The CLT's point is that x̄ is approximately normal for large n whatever the population's shape."],[`No: with any skew the sample mean can't be normal`,"For large n it can, by the CLT."],[bk==="somewhat"?`Yes, because the sample itself becomes normal when n ≥ 30`:`Yes, no caution needed: n ≥ 30 guarantees normality`,bk==="somewhat"?"It's the sampling distribution of x̄ that becomes normal, not the sample.":"n ≥ 30 is a rule of thumb, least reliable for extremely skewed populations: a common error."]];
  const modelB=`To use the normal distribution for modelling the mean, we need the sample to be random, and the population distribution to be approximately normal OR the sample size to be large enough (we use the rule of thumb n ≥ 30). `+
    (bk==="somewhat"?`Since the sample is large enough (n = ${n}), there should be no problem with a somewhat skewed distribution. Hence, our answer to part (a) will still be valid.`
    :bk==="extreme"?`The sample size n = ${n} meets the rule of thumb, but the rule n ≥ 30 is least reliable for strongly skewed populations. With n = ${n} the normal model may still be acceptable, but we would need more caution and would want to check it, for example by looking at the shape of the sample data.`
    :`With only n = ${smallN} the sample is not large enough, and the population is strongly skewed rather than approximately normal. Neither condition holds, so the normal model for x̄ is not reliable and the answer from part (a) would not be valid for this sample.`)+
    `[[clt:skew|n=${bk==="small"?smallN:n}|cap=${bk==="small"?`A strongly skewed population: with n = ${smallN} the sampling distribution of x̄ is still skewed`:`A skewed population: with n = ${n} the sampling distribution of x̄ is close to normal`}]]`;
  // part (c): a decision rule (power), its false-alarm rate, or an x-bar chart
  const ck=pick(["shift","shift","shift","false","chart"]);
  const target=mu, k=ck==="chart"?3:pick([2.5,2.8,3]), lim=+(k*SE).toFixed(D), L=+(target-lim).toFixed(D), U=+(target+lim).toFixed(D);
  let qC, stepsC, modelC;
  if(ck==="false"){
    const zL=r2((L-target)/SE), zU=r2((U-target)/SE), tU=phi(zU), pC=r4(2*(1-tU));
    qC=`The mean ${ctx.what} is supposed to be ${v(target)}. The company decides that ${ctx.proc} will be considered out of control if the mean of a sample of n = ${n} ${ctx.many} is less than ${v(L)} or larger than ${v(U)}. If the process mean is in fact exactly ${v(target)}, what is the probability that this rule will imply that the process is out of control?`;
    stepsC=[
      mc("Which probability is this?",[`P(X̄ < ${fx(L,D)} OR X̄ > ${fx(U,D)}) = P(X̄ < ${fx(L,D)}) + P(X̄ > ${fx(U,D)})`,"The two events are mutually exclusive, so their probabilities add."],
        [[`P(${fx(L,D)} < X̄ < ${fx(U,D)})`,"That's the probability the rule says \"in control\"."],[`P(X̄ < ${fx(L,D)}) × P(X̄ > ${fx(U,D)})`,"Multiplying is for independent events that both happen; here only one can happen."],[`P(X̄ > ${fx(U,D)})`,"The rule also signals below the lower limit: include both tails."]],["P3"]),
      calc({k:"num", q:`z for the upper limit ${fx(U,D)} (two decimals)`, ans:zU, alt:zL, tol:.011, o:["C5","S2"]},{t:`(${fx(U,D)} − ${fx(target,D)})/${fx(SEs,6)} = ${zU.toFixed(2)}`, v:zU, w:"Each limit is about "+k+" standard errors from the mean."},
        [{t:`(${fx(U,D)} − ${fx(target,D)})/${fx(sig,4)} = ${r2((U-target)/sig).toFixed(2)}`, v:r2((U-target)/sig), w:"Divide by σ/√n, not σ."}]),
      calc({k:"num", q:"The probability the rule signals (four decimals)", ans:pC, tol:.0015, o:["C4","QC6"]},{t:`2·(1 − ${f4(tU)}) = ${f4(pC)}`, v:pC, w:"Both tails, by symmetry."},
        [{t:`1 − ${f4(tU)} = ${f4(1-tU)}`, v:r4(1-tU), w:"That's one tail; the rule also signals in the other."},{t:`2·${f4(tU)} − 1 = ${f4(2*tU-1)}`, v:r4(2*tU-1), w:"That's the probability of staying inside the limits."},{t:`${f4(tU)}`, v:tU, w:"That's the area to the left of the upper limit."}]),
      mc("What is this probability, in testing terms?",["The rule's false-alarm rate: the probability of a Type I error","The process is in control, yet the rule says it isn't: rejecting a true H0."],
        [["The power of the rule","Power is the probability of signaling when the mean HAS shifted."],["The probability of a Type II error","A Type II error is missing a real shift."],["The p-value of the test","A p-value is computed from observed data; this is a property of the rule."]],["QC6","H2"])];
    modelC=`We need to find P(X̄ < ${fx(L,D)} OR X̄ > ${fx(U,D)}) = P(X̄ < ${fx(L,D)}) + P(X̄ > ${fx(U,D)}), since the two events are mutually exclusive.<br>As argued before, X̄ is approximately normal with standard error ${fx(SEs,6)}; now the true mean is μ = ${fx(target,D)}.<br>P(X̄ > ${fx(U,D)}) = P(Z > (${fx(U,D)} − ${fx(target,D)})/${fx(SEs,6)}) = P(Z > ${zU.toFixed(2)}) = 1 − ${f4(tU)} = ${f4(1-tU)}<br>By symmetry, P(X̄ < ${fx(L,D)}) = P(Z < ${zL.toFixed(2)}) = ${f4(1-tU)}<br>Hence the probability is 2·${f4(1-tU)} = <b>${f4(pC)}</b>. Even when the process is in control, the rule signals "out of control" with probability ${f4(pC)}: this is its false-alarm (Type I error) rate. The more samples are checked, the more false alarms to expect.[[normal:0,1|out=${zL},${zU}|cap=Both tails beyond ±${zU.toFixed(2)}: ${f4(pC)}]]`;
  } else {
    // a shift big enough that the far tail is essentially zero
    const up=Math.random()<.5; let mu1, zN, zF, tries=0;
    do{ const zn=pick([-2.4,-2,-1.6,-1.2,-.8,-.5,-.3,0,.3,.6,.9]); mu1=up?+(U-zn*SE).toFixed(D):+(L+zn*SE).toFixed(D); zN=up?r2((U-mu1)/SE):r2((L-mu1)/SE); zF=up?r2((L-mu1)/SE):r2((U-mu1)/SE); tries++; }while((Math.abs(zF)<4.5||Math.abs(zN)>2.6)&&tries<60);
    const pN=up?r4(1-phi(zN)):phi(zN), pC=r4(pN);
    const nearExpr=up?`P(X̄ > ${fx(U,D)}) = P(Z > (${fx(U,D)} − ${fx(mu1,D)})/${fx(SEs,6)}) = P(Z > ${fz(zN)})`:`P(X̄ < ${fx(L,D)}) = P(Z < (${fx(L,D)} − ${fx(mu1,D)})/${fx(SEs,6)}) = P(Z < ${fz(zN)})`;
    const nearVal=up?(zN<0?`By symmetry and the rule of complements, P(Z > ${fz(zN)}) = P(Z ≤ ${Math.abs(zN).toFixed(2)}) = ${f4(pN)}`:`By the rule of complements, P(Z > ${fz(zN)}) = 1 − ${f4(phi(zN))} = ${f4(pN)}`)
                       :(zN>0?`From the table, P(Z < ${fz(zN)}) = ${f4(pN)}`:`By symmetry, P(Z < ${fz(zN)}) = 1 − P(Z ≤ ${Math.abs(zN).toFixed(2)}) = 1 − ${f4(phi(-zN))} = ${f4(pN)}`);
    const farExpr=up?`P(X̄ < ${fx(L,D)}) = P(Z < (${fx(L,D)} − ${fx(mu1,D)})/${fx(SEs,6)}) = P(Z < ${fz(zF)}) ≈ 0`:`P(X̄ > ${fx(U,D)}) = P(Z > (${fx(U,D)} − ${fx(mu1,D)})/${fx(SEs,6)}) = P(Z > ${fz(zF)}) ≈ 0`;
    const chartIntro=ck==="chart"?`The company monitors ${ctx.proc} with an x-bar control chart, using samples of n = ${n} ${ctx.many}. The process mean is supposed to be ${v(target)}, with the long-run standard deviation above. (i) Give the center line and the three-sigma control limits. (ii) `:`The mean ${ctx.what} is supposed to be ${v(target)}. The company decides to use the sample mean of ${n} observations to decide whether the process is in control (i.e., there were no changes that may require attention). ${ctx.proc[0].toUpperCase()+ctx.proc.slice(1)} will be considered out of control if the mean of the sample of n = ${n} ${ctx.many} is less than ${v(L)} or larger than ${v(U)}. `;
    qC=chartIntro+`If the true mean ${ctx.what} has shifted to ${v(mu1)}, what is the probability that ${ck==="chart"?"the next sample mean falls outside the control limits":"the test will imply that the process is out of control"}?`;
    stepsC=[];
    if(ck==="chart") stepsC.push({k:"multi", q:"Center line and control limits, μ ± 3σ/√n", fields:[{l:"Center line", ans:target},{l:"LCL", ans:L},{l:"UCL", ans:U}], tol:Math.max(SE*.02,10**-(D)), o:["QC2","S2"]});
    stepsC.push(
      mc("Which probability is this?",[`P(X̄ < ${fx(L,D)} OR X̄ > ${fx(U,D)}) = P(X̄ < ${fx(L,D)}) + P(X̄ > ${fx(U,D)})`,"Mutually exclusive events: add."],
        [[`P(${fx(L,D)} < X̄ < ${fx(U,D)})`,"That's the probability the sample looks in control."],[`P(X̄ > ${fx(U,D)}) only`,"Include both tails, even if one turns out to be ≈ 0."],[`P(X < ${fx(L,D)}) + P(X > ${fx(U,D)})`,"The rule uses the sample mean X̄, not a single "+ctx.one+"."]],["P3"]),
      {k:"multi", q:`z-scores at the true mean ${fx(mu1,D)} (two decimals)`, fields:[{l:`z at ${fx(L,D)}`, ans:r2((L-mu1)/SE)},{l:`z at ${fx(U,D)}`, ans:r2((U-mu1)/SE)}], tol:.011, o:["S2","C5"]},
      calc({k:"num", q:"The probability the process is flagged (four decimals)", ans:pC, tol:.0015, o:["C4","H6"]},{t:`${f4(pN)} + ≈0 = ${f4(pC)}`, v:pC, w:"The near tail plus a far tail that is essentially zero."},
        [{t:`1 − ${f4(pN)} = ${f4(1-pN)}`, v:r4(1-pN), w:"That's the probability of missing the shift (a Type II error)."},{t:`${f4(phi(up?zN:-zN))}`, v:phi(up?zN:-zN), w:"Check the side: the rule flags the tail beyond the limit."},{t:`2·${f4(pN)}`, v:Math.min(.9999,r4(2*pN)), w:"The two tails aren't equal here: the other one is ≈ 0."}]),
      mc("What does this probability measure?",[`The power of the rule when the mean has shifted to ${fx(mu1,D)} (its complement is the Type II error probability)`,"Probability of signaling when the process really changed."],
        [["The false-alarm (Type I error) rate","That's the signal probability when nothing changed."],["The p-value of the sample","A p-value comes from observed data; this is a property of the rule."],["The confidence level of the rule","Confidence levels belong to intervals."]],["H6","QC6"]));
    modelC=(ck==="chart"?`(i) Center line μ = ${fx(target,D)}; control limits μ ± 3σ/√n = ${fx(target,D)} ± 3·${fx(SEs,6)}: LCL = ${fx(L,D)}, UCL = ${fx(U,D)}.<br>(ii) `:"")+
      `We need to find P(X̄ < ${fx(L,D)} OR X̄ > ${fx(U,D)}) = P(X̄ < ${fx(L,D)}) + P(X̄ > ${fx(U,D)}), since the two events are mutually exclusive.<br>As we argued previously, we can use the normal distribution to model X̄, and the standard error when the sample size is ${n} is σ/√n = ${fx(SEs,6)}. Now the true mean is μ = ${fx(mu1,D)}.<br>${nearExpr}<br>${nearVal}<br>${farExpr}<br>Hence P(X̄ < ${fx(L,D)}) + P(X̄ > ${fx(U,D)}) ≈ <b>${f4(pC)}</b><br>In other words, ${pC>.9?"it is extremely likely":pC>.6?"it is likely":pC>.3?"there is a moderate chance":"it is fairly unlikely"} (probability about ${f4(pC)}) that the ${ck==="chart"?"chart":"test"} will imply that the process is out of control. This is the power of the rule at a mean of ${fx(mu1,D)}; ${pC<.5?"a larger sample (smaller standard error) or a bigger shift would raise it.":"its complement, "+f4(1-pC)+", is the probability of a Type II error."}[[normal:0,1|${up?`gt=${zN}`:`lt=${zN}`}|cap=At the shifted mean, the ${up?"upper":"lower"} limit sits at z = ${fz(zN)}; the other limit (z = ${fz(zF)}) is off the chart]]`;
  }
  return {tpl:1, title:ctx.name, setup, parts:[
    {label:"a", q:partA, steps:partAsteps, model:modelA},
    {label:"b", q:qB, steps:[mc("Your answer:",rightB,wrongB,["S3"])], model:modelB},
    {label:"c", q:qC, steps:stepsC, model:modelC}]};
}

/* ================= TEMPLATE 2: sample proportion and confidence interval ================= */
const T2CTX=[
 {name:"Defect rate", n:[160,320], who:"items", succ:"defective", p:"the true proportion of defective items produced on the line",
  story:(n,x)=>`A quality inspector selects a random sample of ${n} items from a large production run and finds that ${x} of them are defective. The items were selected independently of each other.`,
  claim:"The plant manager says: \"about {c} of our items are defective.\""},
 {name:"Landing page conversion", n:[200,500], who:"visitors", succ:"made a purchase", p:"the true proportion of visitors to the new landing page who make a purchase",
  story:(n,x)=>`An online retailer tests a new landing page. Of ${n} randomly selected visitors who saw the page, ${x} made a purchase. Assume the visitors' decisions were independent of each other.`,
  claim:"The marketing team claims the new page converts about {c} of visitors."},
 {name:"Would recommend", n:[120,400], who:"customers", succ:"would recommend the product", p:"the true proportion of all customers who would recommend the product",
  story:(n,x)=>`A software company surveys a random sample of ${n} of its customers; ${x} say they would recommend the product to a colleague. Assume the responses are independent.`,
  claim:"The sales director believes {c} of customers would recommend the product."},
 {name:"Subscriber churn", n:[150,450], who:"subscribers", succ:"cancelled within a year", p:"the true proportion of subscribers who cancel within a year",
  story:(n,x)=>`A streaming service follows a random sample of ${n} new subscribers for a year; ${x} of them cancelled within the year. Assume the subscribers' decisions were independent.`,
  claim:"The finance team plans on a churn rate of {c}."},
 {name:"On-time deliveries", n:[100,300], who:"deliveries", succ:"arrived on time", p:"the true proportion of the carrier's deliveries that arrive on time",
  story:(n,x)=>`A retailer audits a random sample of ${n} deliveries made by a new carrier; ${x} of them arrived on time. Assume the deliveries' outcomes were independent.`,
  claim:"The carrier advertises that {c} of its deliveries arrive on time."},
 {name:"Late invoices", n:[90,260], who:"invoices", succ:"were paid late", p:"the true proportion of the company's invoices that are paid late",
  story:(n,x)=>`A wholesaler reviews a random sample of ${n} invoices from the past year and finds that ${x} were paid after the due date. Assume the invoices' outcomes were independent.`,
  claim:"The credit manager believes {c} of invoices are paid late."},
 {name:"Job offers accepted", n:[80,220], who:"job offers", succ:"were accepted", p:"the true proportion of the firm's job offers that are accepted",
  story:(n,x)=>`A consulting firm looks at a random sample of ${n} job offers it made; ${x} of them were accepted. Assume the candidates' decisions were independent of each other.`,
  claim:"HR says that about {c} of the firm's offers are accepted."}
];
function genT2(){
  const ctx=pick(T2CTX), CL=pick([90,90,95,95,99]), Z=ZCRIT[CL];
  let n,x,ph; do{ n=ctx.n[0]+rnd(ctx.n[1]-ctx.n[0]+1); ph=.12+Math.random()*.76; x=Math.round(n*ph); }while(x<18||n-x<18);
  const phat=r3(x/n), q1=r3(1-phat), prod=r4(phat*(1-phat)), SE=r4(Math.sqrt(phat*(1-phat)/n)), ME=r3(Z.z*SE), LL=r3(phat-ME), UL=r3(phat+ME);
  const alpha=r2(1-CL/100), a2=r4(alpha/2);
  // the claim in part (d): inside (compatible, not confirmed) or outside (not supported)
  const inside=Math.random()<.55; let c;
  if(inside){ c=r2(LL+(UL-LL)*(.2+Math.random()*.6)); if(c<=LL||c>=UL) c=r2((LL+UL)/2); }
  else{ const side=Math.random()<.5?-1:1; c=r2(side<0?LL-.03-Math.random()*.06:UL+.03+Math.random()*.06); if(c<=.01||c>=.99) c=r2(UL+.04); }
  const cpct=Math.round(c*100)+"%", claim=ctx.claim.replace("{c}",cpct);
  const others=inside?[r2(Math.max(LL+.005,phat-ME*.6)),r2(Math.min(UL-.005,phat+ME*.6))].filter(v=>Math.abs(v-c)>.015):[];
  const setup=`<p>${ctx.story(n,x)}</p>`;
  const zs=Z.z.toFixed(2), zalt=Z.alt?` (${Z.alt.toFixed(2)} is equally close, and also fine if you say which you used)`:"";
  const modelA=`The observed proportion of ${ctx.who} that ${ctx.succ} is a sample proportion p̂. According to the Central Limit Theorem, if the sample is random and the sample size is large enough (rule of thumb for a proportion is n ≥ 30, np̂ ≥ 15, n(1 − p̂) ≥ 15), the sample proportion is approximately normally distributed. We have np̂ = ${x} ≥ 15 and n(1 − p̂) = ${n} − ${x} = ${n-x} ≥ 15. Therefore,<br>p̂ ~ N(p, √(p(1 − p)/n))<br>We do not know the true value of p, but for a population proportion with a sufficiently large sample we can use p̂ to estimate the standard deviation, and hence we can use a normal distribution (as opposed to Student's t-distribution, which we would use for a sample mean when we must use the sample standard deviation).<br>p̂ = ${x}/${n} ≈ ${fx(phat,3)}<br>σ<sub>p̂</sub> ≈ √(p̂(1 − p̂)/n) = √(${fx(phat,3)}·${fx(q1,3)}/${n}) ≈ ${fx(SE,4)}`;
  const modelB=`We use the formula p̂ ± z<sub>α/2</sub>·√(p̂(1 − p̂)/n).<br>α/2 = (1 − CL)/2 = (1 − ${CL/100})/2 = ${pf(a2)}<br>Hence our critical value z<sub>α/2</sub> should be such that the right tail is ${pf(a2)}, that is, P(Z > z<sub>α/2</sub>) = ${pf(a2)}. The table gives P(Z < z<sub>α/2</sub>), which will be 1 − ${pf(a2)} = ${pf(Z.look)}. We look up ${pf(Z.look)} in the standard normal table: ${Z.near}, so z<sub>α/2</sub> = ${zs}${zalt}.<br>UL = ${fx(phat,3)} + ${zs}·${fx(SE,4)} ≈ ${fx(UL,3)}<br>LL = ${fx(phat,3)} − ${zs}·${fx(SE,4)} ≈ ${fx(LL,3)}<br>Hence, we are ${CL}% confident that ${ctx.p} is somewhere between ${fx(LL,3)} and ${fx(UL,3)}.[[ci:${LL},${UL},${phat}|cap=${CL}% interval: ${fx(phat,3)} ± ${fx(ME,3)}]]`;
  const modelC=`It means that if we repeated this experiment indefinitely, collecting random samples of ${n} ${ctx.who} and calculating the ${CL}% confidence intervals the same way, ${CL}% of these intervals would contain the true proportion and ${100-CL}% would not.<br>Note: "there is a ${CL}% probability that the true proportion lies between ${fx(LL,3)} and ${fx(UL,3)}" is NOT correct. The true proportion is not random, and after the sample is collected the interval is not random either.[[cis:20,${CL}|cap=Intervals from 20 repeated samples: about ${CL}% of them cover the true p]]`;
  const modelD=inside?`${fx(c,2)} lies within the confidence interval we constructed (${fx(LL,3)} to ${fx(UL,3)}), so it does not contradict the data: the claim can be correct. This does not show that it is correct: ${others.length?`for instance, ${others.map(o=>fx(o,2)).join(" and ")} are also compatible with the data`:"other values inside the interval are also compatible with the data"}.[[ci:${LL},${UL},${phat}|claim=${c}|cap=The claim ${fx(c,2)} falls inside: compatible, not confirmed]]`
    :`${fx(c,2)} lies outside the confidence interval we constructed (${fx(LL,3)} to ${fx(UL,3)}), so at the ${CL}% confidence level the data do not support the claim: the plausible values of the true proportion are ${c<LL?"all lower":"all higher"} than ${fx(c,2)}.[[ci:${LL},${UL},${phat}|claim=${c}|cap=The claim ${fx(c,2)} falls outside: not supported at ${CL}% confidence]]`;
  const zWrong=CL===90?[1.28,1.96,2.33]:CL===95?[1.64,1.65,2.58]:[2.33,1.96,3.09].filter(v=>v!==Z.z);
  return {tpl:2, title:ctx.name, setup, parts:[
    {label:"a", q:`What distribution can we use to model the proportion of ${ctx.who} that ${ctx.succ}? Justify your answer.`, steps:[
      mc("Which distribution, and why?",[`Normal, by the CLT: random sample with np̂ = ${x} ≥ 15 and n(1 − p̂) = ${n-x} ≥ 15`,"Name the theorem and check the success and failure counts with numbers."],
        [["Student's t, because p is unknown","t is for a sample mean when σ is estimated by s; for a proportion the SE depends only on p, so we use z."],[`Normal, because n = ${n} ≥ 30`,"For a proportion, n ≥ 30 alone isn't enough: check successes and failures too."],["Binomial, so the normal can't be used","The count is binomial, but with enough successes and failures p̂ is approximately normal (CLT)."]],["S5","S3"]),
      {k:"multi", q:"Check the conditions: n·p̂ and n(1 − p̂)", fields:[{l:"n·p̂ (successes)", ans:x},{l:"n(1 − p̂) (failures)", ans:n-x}], tol:.6, o:["S5","D4"]},
      calc({k:"num", q:"p̂ (three decimals)", ans:phat, tol:.0015, o:["S1"]},{t:`${x}/${n} = ${fx(phat,3)}`, v:phat, w:"Successes over sample size."},
        [{t:`${n-x}/${n} = ${fx(q1,3)}`, v:q1, w:"That's the proportion of failures."},{t:`${x}/${n-x} = ${fx(r3(x/(n-x)),3)}`, v:r3(x/(n-x)), w:"Divide by the sample size n, not by the number of failures."}]),
      calc({k:"num", q:"Estimated standard error √(p̂(1 − p̂)/n) (four decimals)", ans:SE, tol:.0006, o:["S5"]},
        {t:`√(${fx(phat,3)}·${fx(q1,3)}/${n}) = √(${fx(prod,4)}/${n}) = ${fx(SE,4)}`, v:SE, w:"Multiply, divide by n, then take the square root, in visible steps."},
        [{t:`${fx(prod,4)}/${n} = ${fx(r4(prod/n),6)}`, v:r4(prod/n), w:"You forgot the square root."},{t:`√(${fx(prod,4)})/${n} = ${fx(r4(Math.sqrt(prod)/n),4)}`, v:r4(Math.sqrt(prod)/n), w:"Divide by n inside the root, not after it."},{t:`√(${fx(phat,3)}/${n}) = ${fx(r4(Math.sqrt(phat/n)),4)}`, v:r4(Math.sqrt(phat/n)), w:"The formula has p̂(1 − p̂), not p̂ alone."}])], model:modelA},
    {label:"b", q:`Construct the ${CL}% confidence interval for ${ctx.p}. Write down all your steps.`, steps:[
      mc("Which table probability do you look up for z_α/2?",[`α = ${fx(alpha,2)}, α/2 = ${pf(a2)} in the right tail, so look up ${pf(Z.look)}`,"The table gives area to the left: 1 − α/2."],
        [[`Look up ${pf(r2(CL/100))}`,"That would put all of α in one tail. A common error: split α between the two tails."],[`Look up ${pf(a2)}`,"The table gives area to the LEFT of z; you need 1 − α/2."],[`Look up ${pf(alpha)}`,"α is the total outside the interval, and the table gives area to the left."]],["E4","C5"]),
      mc(`z_α/2 for ${CL}% confidence:`,[`${zs}${Z.alt?` (or ${Z.alt.toFixed(2)})`:""}`,`From the table: ${Z.near}.`],
        zWrong.slice(0,3).map(w=>[w.toFixed(2),w===1.28?"1.28 leaves .10 in the right tail: that builds an 80% interval.":w===2.33?"2.33 leaves .01 in one tail: a 98% interval.":w===3.09?"Far too large: 3.09 leaves .001 in each tail.":`${w.toFixed(2)} belongs to a different confidence level.`]),["E4","C5"]),
      calc({k:"num", q:"Margin of error, z_α/2 × SE (three decimals)", ans:ME, alt:Z.alt?r3(Z.alt*SE):null, tol:.0015, o:["E4"]},{t:`${zs}·${fx(SE,4)} = ${fx(ME,3)}`, v:ME, w:"Margin of error = critical value × standard error."},
        [{t:`${zs}·${fx(r4(prod/n),6)} = ${fx(r3(Z.z*prod/n),5)}`, v:r3(Z.z*prod/n), w:"Use the standard error (with the square root)."},{t:`${zWrong[0].toFixed(2)}·${fx(SE,4)} = ${fx(r3(zWrong[0]*SE),3)}`, v:r3(zWrong[0]*SE), w:"Wrong critical value for "+CL+"%."},{t:`${fx(SE,4)}/${zs} = ${fx(r3(SE/Z.z),4)}`, v:r3(SE/Z.z), w:"Multiply by the critical value, don't divide."}]),
      {k:"multi", q:"The interval limits (three decimals)", fields:[{l:"LL", ans:LL},{l:"UL", ans:UL}], tol:Z.alt?.003:.002, o:["E4"]},
      mc("Which sentence reports the interval?",[`We are ${CL}% confident that ${ctx.p} is between ${fx(LL,3)} and ${fx(UL,3)}`,"About the parameter, in context, with the confidence level."],
        [[`${CL}% of the ${ctx.who} in the sample are between ${fx(LL,3)} and ${fx(UL,3)}`,"The interval is about the true proportion, not about individual "+ctx.who+"."],[`The sample proportion is between ${fx(LL,3)} and ${fx(UL,3)}`,"We already know p̂ exactly: "+fx(phat,3)+". The interval estimates p."],[`There is a ${CL}% probability that p̂ = ${fx(phat,3)}`,"p̂ is observed; the interval is a statement about p."]],["E1","E4"])], model:modelB},
    {label:"c", q:`Interpret the confidence interval that you constructed. In other words, what does it mean exactly that we are ${CL}% confident?`, steps:[
      mc("Pick the full-credit interpretation:",[`If we repeated the sampling many times with samples of ${n} and built intervals the same way, about ${CL}% of those intervals would contain the true proportion`,"The confidence level describes the procedure."],
        [[`There is a ${CL}% probability that the true proportion is between ${fx(LL,3)} and ${fx(UL,3)}`,"The true proportion is fixed, not random; after sampling, this interval either contains it or doesn't."],[`${CL}% of all ${ctx.who} fall between ${fx(LL,3)} and ${fx(UL,3)}`,"Confuses an interval for a proportion with a range of individual outcomes."],[`${CL}% of samples of ${n} would have a p̂ between ${fx(LL,3)} and ${fx(UL,3)}`,"Confuses the interval with the sampling distribution of p̂."]],["E5"])], model:modelC},
    {label:"d", q:`${claim} Based on your answers to the previous questions, could this be correct?`, steps:[
      mc("Your judgment:",inside?[`Possibly: ${fx(c,2)} is inside the interval, so it's compatible with the data, but not confirmed, since other values are compatible too`,"Inside = compatible, not proven."]:[`The data don't support it: ${fx(c,2)} is outside the ${CL}% interval`,"Outside = not supported at that confidence level."],
        inside?[[`Yes: ${fx(c,2)} is inside the interval, so the claim is correct`,"A common error: a value inside is compatible, not confirmed, like failing to reject H0."],[`No: the claim should equal p̂ = ${fx(phat,3)}`,"p̂ is one estimate; any value inside the interval is compatible."],["We can't say anything without a hypothesis test","The interval already tells us which values are compatible with the data."]]
        :[[`Yes: ${fx(c,2)} is close to the interval, so it's compatible`,"Close isn't inside. At "+CL+"% confidence, values outside aren't supported."],[`The interval proves the claim is false with certainty`,"Intervals don't give certainty; the conclusion holds at the "+CL+"% confidence level."],["We can't say anything without a hypothesis test","The interval already tells us which values are compatible with the data."]],["E5","H3"])], model:modelD}]};
}

/* ================= TEMPLATE 3: one-sample hypothesis test for a mean ================= */
const T3CTX=[
 {name:"Delivery time vs promise", pop:"delivery times", mu:30, s:[4,5,6,7], d:1, unit:"minutes", one:"delivery", many:"deliveries", par:"the true mean delivery time of the service", dir:">",
  story:(n,xb,s)=>`A food delivery service promises an average delivery time of {mu} minutes. A consumer group times a random sample of ${n} deliveries: x̄ = ${xb} minutes, s = ${s} minutes.`,
  claim:{">":"whether the average delivery takes longer than the promised {mu} minutes","<":"whether the average delivery is faster than the promised {mu} minutes","≠":"whether the average delivery time differs from the promised {mu} minutes"},
  ha:{">":"the average delivery takes longer than {mu} minutes","<":"the average delivery is faster than {mu} minutes","≠":"the average delivery time differs from {mu} minutes"}},
 {name:"Fill weight vs label", pop:"fill weights", mu:500, s:[6,8,10], d:1, unit:"grams", one:"box", many:"boxes", par:"the true mean fill weight of the boxes", dir:"<",
  story:(n,xb,s)=>`Boxes of cereal are labeled {mu} g. A state inspector weighs a random sample of ${n} boxes: x̄ = ${xb} g, s = ${s} g.`,
  claim:{"<":"whether the boxes are underfilled on average",">":"whether the boxes are overfilled on average","≠":"whether the mean fill weight differs from the label"},
  ha:{"<":"the boxes are underfilled on average (mean below {mu} g)",">":"the boxes are overfilled on average (mean above {mu} g)","≠":"the mean fill weight differs from {mu} g"}},
 {name:"Satisfaction vs target", pop:"satisfaction scores", mu:80, s:[8,10,12], d:1, unit:"points", one:"customer", many:"customers", par:"the true mean satisfaction score of all customers", dir:">",
  story:(n,xb,s)=>`A hotel chain's target is an average satisfaction score of {mu} (out of 100). After a renovation, a random sample of ${n} guests gives x̄ = ${xb}, s = ${s}.`,
  claim:{">":"whether the average satisfaction score now exceeds the target of {mu}","<":"whether the average satisfaction score is now below the target of {mu}","≠":"whether the average satisfaction score differs from {mu}"},
  ha:{">":"the average satisfaction score exceeds {mu}","<":"the average satisfaction score is below {mu}","≠":"the average satisfaction score differs from {mu}"}},
 {name:"Days to pay vs terms", pop:"payment times", mu:30, s:[5,6,8], d:1, unit:"days", one:"invoice", many:"invoices", par:"the true mean number of days customers take to pay an invoice", dir:">",
  story:(n,xb,s)=>`A supplier's payment terms are {mu} days. A random sample of ${n} recent invoices shows customers took x̄ = ${xb} days to pay, s = ${s} days.`,
  claim:{">":"whether customers take longer than the {mu}-day terms on average","<":"whether customers pay faster than the {mu}-day terms on average","≠":"whether the average time to pay differs from the {mu}-day terms"},
  ha:{">":"customers take longer than {mu} days to pay on average","<":"customers pay in fewer than {mu} days on average","≠":"the average time to pay differs from {mu} days"}},
 {name:"Fund return vs benchmark", pop:"monthly returns", mu:.8, s:[1.2,1.5,1.8], d:2, unit:"%", one:"month", many:"months", par:"the fund's true mean monthly return", dir:">",
  story:(n,xb,s)=>`A fund manager claims to beat a benchmark that returns {mu}% per month. A random sample of ${n} monthly returns gives x̄ = ${xb}%, s = ${s}%.`,
  claim:{">":"whether the fund's mean monthly return beats the {mu}% benchmark","<":"whether the fund's mean monthly return falls short of the {mu}% benchmark","≠":"whether the fund's mean monthly return differs from the {mu}% benchmark"},
  ha:{">":"the fund's mean monthly return is above {mu}%","<":"the fund's mean monthly return is below {mu}%","≠":"the fund's mean monthly return differs from {mu}%"}},
 {name:"Ticket resolution vs SLA", pop:"resolution times", mu:8, s:[1.5,2,2.5], d:2, unit:"hours", one:"ticket", many:"tickets", par:"the true mean time to resolve a support ticket", dir:"<",
  story:(n,xb,s)=>`An IT help desk's service-level agreement promises that tickets are resolved in {mu} hours on average. After adding staff, a random sample of ${n} tickets gives x̄ = ${xb} hours, s = ${s} hours.`,
  claim:{"<":"whether the average resolution time is now below {mu} hours",">":"whether the average resolution time exceeds the {mu} hours promised","≠":"whether the average resolution time differs from {mu} hours"},
  ha:{"<":"the average resolution time is below {mu} hours",">":"the average resolution time exceeds {mu} hours","≠":"the average resolution time differs from {mu} hours"}}
];
function genT3(){
  const ctx=pick(T3CTX), dir=Math.random()<.15?"≠":Math.random()<.75?ctx.dir:(ctx.dir===">"?"<":">");
  const two=dir==="≠", sign=dir==="<"?-1:1, alpha=pick([.1,.05,.05,.01]), aCol=two?alpha/2:alpha;
  let n,df,s,xb,t,crit,b,reject, tries=0;
  do{ tries++;
    n=10+rnd(20); df=n-1; s=pick(ctx.s); crit=tcrit(df,aCol);
    const row=trow(df), wantReject=Math.random()<.62;
    // choose a target |t| strictly inside one bracket, on the right side of the critical value
    const cols=range(-1,5).filter(k=>{ const lo=k<0?.35:row[k], hi=row[k+1]; return wantReject?lo>=crit:hi<=crit+1e-9; });
    if(!cols.length) continue;
    const k=pick(cols), lo=k<0?.35:row[k], hi=row[k+1], tt=lo+(hi-lo)*(.25+Math.random()*.5);
    const sgn=two?(Math.random()<.5?-1:1):sign;
    xb=+(ctx.mu+sgn*tt*s/Math.sqrt(n)).toFixed(ctx.d);
    t=r3((xb-ctx.mu)/(s/Math.sqrt(n))); b=tBracket(df,t);
    reject=two?Math.abs(t)>crit:sign*t>crit;
    const margin=Math.min(...trow(df).map(v=>Math.abs(Math.abs(t)-v)));
    if(margin>.02&&Math.abs(Math.abs(t)-crit)>.02&&(sign*t>0||two)&&b.k<6) break;
  }while(tries<200);
  const mu=ctx.mu, fm=x=>fx(x,ctx.d), rt=Math.sqrt(n), SE=r4(s/rt), Hs=x=>x.replace(/\{mu\}/g,fm(mu));
  const setup=`<p>${Hs(ctx.story(n,fm(xb),fm(s)))}</p>`;
  const H0=`H0: μ = ${fm(mu)}`, HA=`HA: μ ${dir} ${fm(mu)}`, tail=two?"two-tailed":dir===">"?"right-tailed":"left-tailed";
  const ruleTxt=two?`|t| > ${crit}`:dir===">"?`t > ${crit}`:`t < −${crit}`;
  const tTxt=fx(t,3), absT=fx(Math.abs(t),3);
  const cmp=two?(reject?`|${tTxt}| = ${absT} > ${crit}`:`|${tTxt}| = ${absT} < ${crit}`):dir===">"?(reject?`${tTxt} > ${crit}`:`${tTxt} < ${crit}`):(reject?`${tTxt} < −${crit}`:`${tTxt} > −${crit}`);
  const ha=Hs(ctx.ha[dir]), levelPct=Math.round(alpha*100)+"%";
  const concl=reject?`Since ${cmp}, the observed t-statistic is in the rejection region, so we reject H0. At the ${levelPct} significance level, there is enough evidence to conclude that ${ha}.`
    :`Since ${cmp}, the observed t-statistic is not in the rejection region, so we fail to reject H0. At the ${levelPct} significance level, there is not enough evidence to conclude that ${ha}.`;
  const br=bracketText(b,two), pDir=two?`2·P(T > ${absT})`:dir===">"?`P(T > ${tTxt})`:`P(T < ${tTxt})`;
  const symm=dir==="<"?`By symmetry, P(T < ${tTxt}) = P(T > ${absT}). `:"";
  const tabLine=symm+(b.k<0?`The smallest critical value in the ${df} d.f. row is ${trow(df)[0]} (area .1), and ${absT} < ${trow(df)[0]}, so the ${two?"one-tail area is above .1":"p-value is above .1"}`
    :b.lo==null?`${absT} is beyond the last column (${trow(df)[6]}, area .0005)`
    :`Using the table with ${df} d.f., P(T > ${b.tlo}) = ${pf(b.hi)} and P(T > ${b.thi}) = ${pf(b.lo)}`);
  const upper=b.k<0?(two?.2:.1):(two?r4(2*b.hi):b.hi);
  const extreme=two?`a t-statistic at least as far from 0 as ${tTxt} (in either direction)`:dir===">"?`a t-statistic of ${tTxt} or larger`:`a t-statistic of ${tTxt} or smaller`;
  const pInterp=b.k<0?`If the null hypothesis were true (μ = ${fm(mu)}), the probability of obtaining a sample of ${n} ${ctx.many} with ${extreme} would be greater than ${pf(upper)}: such a result is not surprising under H0. Equivalently, we would reject the null only at a significance level above the p-value, which is more than ${pf(upper)}, so not at any of the usual levels (.10, .05, .01).`
    :`If the null hypothesis were true (μ = ${fm(mu)}), the probability of obtaining a sample of ${n} ${ctx.many} with ${extreme} would be ${b.lo==null?`below ${pf(two?r4(2*TCOL[6]):TCOL[6])}`:`between ${pf(two?r4(2*b.lo):b.lo)} and ${pf(upper)}`}. Equivalently, we would reject the null hypothesis for any value of α larger than ${pf(upper)} (the upper bound of the p-value).`;
  const wrongCrit=uniqOpts(crit,[tcrit(Math.min(df+1,30),aCol),tcrit(df,two?alpha:alpha/2),tcrit(df,alpha===.1?.05:.1),two?1.96:alpha===.05?1.645:alpha===.1?1.282:2.326].filter(v=>v!==undefined)).slice(1);
  const critWhy=v=>v===tcrit(Math.min(df+1,30),aCol)?`That's the row for ${Math.min(df+1,30)} d.f.; use n − 1 = ${df}.`:v===tcrit(df,two?alpha:alpha/2)?(two?`That column puts all of α in one tail; a two-tailed test needs α/2 = ${pf(aCol)} in each.`:`That's the two-tailed value (column α/2); this test is one-tailed: column ${pf(alpha)}.`):[1.96,1.645,1.282,2.326].includes(v)?"That's a z value: with σ unknown, use the t table.":"Wrong column: the tail area is "+pf(aCol)+".";
  const tWrongs=[{t:`(${fm(xb)} − ${fm(mu)})/(${fm(s)}/${n}) = ${fx(r3((xb-mu)/(s/n)),3)}`, v:r3((xb-mu)/(s/n)), w:"Divide s by √n, not n."},
    {t:`(${fm(xb)} − ${fm(mu)})/${fm(s)} = ${fx(r3((xb-mu)/s),3)}`, v:r3((xb-mu)/s), w:"Use the standard error s/√n, not s: a common error."},
    {t:`(${fm(mu)} − ${fm(xb)})/(${fm(s)}/√${n}) = ${fx(-t,3)}`, v:-t, w:"The order is x̄ − μ0; the sign matters for a one-tailed test."},
    {t:`(${fm(xb)} − ${fm(mu)})/(${fm(s)}/√${n-1}) = ${fx(r3((xb-mu)/(s/Math.sqrt(n-1))),3)}`, v:r3((xb-mu)/(s/Math.sqrt(n-1))), w:"√n in the standard error; n − 1 is for the degrees of freedom."}];
  // the p-value bracket options: the right one, its neighbor, the backwards reading, a single number
  const nb=b.k<0?tBracket(df,trow(df)[1]+.01):tBracket(df,Math.max(.4,b.k>=1?trow(df)[b.k-1]+.01:trow(df)[0]-.1));
  const brOpts=uniqOpts(br,[bracketText(nb,two),bracketText(tBracket(df,trow(df)[Math.min(5,b.k+1)]+.01),two),b.k<0?"p-value = .1":`p-value = ${pf(two?r4(2*b.hi):b.hi)} exactly`,"p-value > .25"]).slice(1);
  const hWrong=[[`H0: μ ${dir} ${fm(mu)}, HA: μ = ${fm(mu)}`,"The research claim goes in the alternative; H0 holds the equality."],[`H0: x̄ = ${fm(mu)}, HA: x̄ ${dir} ${fm(mu)}`,"Hypotheses are about the parameter μ, never the statistic x̄: we already know x̄."],
    [two?`H0: μ = ${fm(mu)}, HA: μ > ${fm(mu)}`:`H0: μ = ${fm(mu)}, HA: μ ≠ ${fm(mu)}`,two?"The question asks whether it differs, in either direction: two-tailed.":"The question has a direction, so the test is one-tailed in that direction."]];
  const modelA=`Our parameter of interest is μ = ${ctx.par}. We want to check ${Hs(ctx.claim[dir])}. Hence, we use a ${tail} test.<br>${H0}<br>${HA}`;
  const modelB=`To use a z-statistic for the population mean, we need to know the population standard deviation σ (plus the additional conditions). We do not know σ (we only have the sample standard deviation s = ${fm(s)}); hence we cannot use a z-statistic. We use a t-statistic with n − 1 = ${df} degrees of freedom instead.`;
  const modelC=`To use a t-statistic, we need the sample to be random (stated in the problem), AND one of the following:<br>– sample sufficiently large (n ≥ 30): not satisfied, we have n = ${n}<br>– population approximately normally distributed<br>Hence, to use a t-statistic, we must have the ${ctx.pop} approximately normally distributed.`;
  const modelD=`We use a ${tail} test, hence we need t such that the area of ${two?"each tail is α/2 = "+pf(aCol):"the "+(dir===">"?"right":"left")+" tail is equal to "+pf(alpha)}: ${two?`P(T > t) = ${pf(aCol)}`:dir===">"?`P(T > t) = ${pf(alpha)}`:`P(T < −t) = ${pf(alpha)}`}. We need n − 1 = ${df} degrees of freedom. We look up the t-score with right-tail probability ${pf(aCol)} and d.f. = ${df} in the table: t<sub>${pf(aCol)}</sub> = ${crit}.<br>Hence, we will reject the null if ${two?`the observed t-score is larger than ${crit} or smaller than −${crit}`:dir===">"?`the observed t-score is larger than ${crit}`:`the observed t-score is smaller than −${crit}`}. In other words, the rejection region is <b>${ruleTxt}</b>.[[tdist:${df}|${two?`two=${crit}`:dir===">"?`gt=${crit}`:`lt=${-crit}`}|cap=Rejection region: ${ruleTxt} (${df} d.f., α = ${pf(alpha)})]]`;
  const modelE=`t = (x̄ − μ)/(s/√n) = (${fm(xb)} − ${fm(mu)})/(${fm(s)}/√${n}) = ${fx(r4(xb-mu),ctx.d+1)}/${fx(SE,4)} ≈ ${tTxt}<br>${concl}[[tdist:${df}|${two?`two=${crit}`:dir===">"?`gt=${crit}`:`lt=${-crit}`}|obs=${t}|cap=t = ${tTxt} ${reject?"lands in":"falls outside"} the rejection region]]`;
  const modelF=`We calculated that t ≈ ${tTxt}. Since the test is ${tail}, the p-value is equal to ${pDir}.<br>${tabLine}. Hence, <b>${br}</b>.<br>Interpretation: ${pInterp}[[tt:${df},${Math.abs(t)}|cap=Row ${df}: ${absT} sits ${b.k<0?"below the first column":b.lo==null?"beyond the last column":`between ${b.tlo} and ${b.thi}`}]]`;
  const decRight=reject?[`Reject H0: ${concl.replace(/^Since [^,]+, the observed t-statistic is in the rejection region, so we reject H0\. /,"")}`,"Comparison, decision, significance level, context."]:[`Fail to reject H0: ${concl.replace(/^Since [^,]+, the observed t-statistic is not in the rejection region, so we fail to reject H0\. /,"")}`,"Comparison, decision, significance level, context; never \"accept H0\"."];
  return {tpl:3, title:ctx.name, setup, parts:[
    {label:"a", q:`Set up the appropriate null and alternative hypotheses to test ${Hs(ctx.claim[dir])}.`, steps:[
      mc("The hypotheses:",[`${H0}, ${HA}`,"Equality in H0, the research claim in HA, about μ."],hWrong,["H1"]),
      mc("Which tail(s) does the test use?",[tail[0].toUpperCase()+tail.slice(1),"It matches the direction of HA."],[["Right-tailed","Check the direction of HA."],["Left-tailed","Check the direction of HA."],["Two-tailed","Check the direction of HA."]].filter(w=>w[0].toLowerCase()!==tail),["H1"])], model:modelA},
    {label:"b", q:"Can you test this hypothesis using a z-statistic? Why or why not?", steps:[
      mc("Your answer:",[`No: σ is unknown (only s = ${fm(s)} is given), so we use t with ${df} d.f.`,"z needs the population standard deviation."],
        [[`Yes: s = ${fm(s)} is close enough to σ`,"Replacing σ with s adds uncertainty; that's exactly why t is used."],[`Yes: n = ${n} is large enough for the CLT`,"Sample size doesn't make σ known; with s you need t."],["No: the sample isn't random","The problem says the sample is random; the issue is that σ is unknown."]],["E3","H4"])], model:modelB},
    {label:"c", q:"You consider testing your hypothesis using a t-statistic. What assumptions are necessary for such a test to be valid?", steps:[
      mc("The assumptions:",[`A random sample, and since n = ${n} < 30, the population of ${ctx.pop} must be approximately normal`,"Random, and either n ≥ 30 or an approximately normal population; check which one holds."],
        [[`Only that the sample is random`,"With n < 30 the test also relies on an approximately normal population."],[`n ≥ 30 is required, so the t-test can't be used here`,"A common error: n < 30 doesn't rule out t when the population is approximately normal."],["σ must be known and the sample data must be exactly normal","σ unknown is the reason for t; the population (not the sample) should be approximately normal."]],["E3","S3"])], model:modelC},
    {label:"d", q:`Say the assumptions in (c) are satisfied. Formulate the rejection region for the test. Use α = ${alpha}.`, steps:[
      mc(`Critical value from the t table (${df} d.f.)`,[String(crit),`Row n − 1 = ${df}, column ${pf(aCol)}${two?" (α/2, two-tailed)":""}.`],wrongCrit.slice(0,3).map(v=>[String(v),critWhy(v)]),["H5"]),
      mc("The rejection region:",[ruleTxt,"Matches the tail of HA."],
        [[two?`t > ${crit}`:dir===">"?`t < −${crit}`:`t > ${crit}`,"That's the wrong tail for this alternative."],[two?`|t| > ${tcrit(df,alpha)}`:`|t| > ${crit}`,two?"For a two-tailed test use α/2 in each tail.":"A one-tailed test rejects in one direction only."],[two?`|t| < ${crit}`:dir===">"?`t < ${crit}`:`t > −${crit}`,"That's the region where we fail to reject."]],["H5","H2"])], model:modelD},
    {label:"e", q:"Calculate the test statistic and state your conclusion.", steps:[
      calc({k:"num", q:"Test statistic t (three decimals)", ans:t, tol:.012, o:["H4"]},{t:`(${fm(xb)} − ${fm(mu)})/(${fm(s)}/√${n}) = ${fx(r4(xb-mu),ctx.d+1)}/${fx(SE,4)} = ${tTxt}`, v:t, w:"Distance from μ0 in standard errors."},tWrongs),
      mc("Decision and conclusion:",decRight,
        reject?[[`Accept HA: this proves that ${ha}`,"A test controls error rates; it doesn't prove anything, and the answer needs the comparison and α."],[`Reject H0: the sample mean ${fm(xb)} is ${dir===">"?"greater":dir==="<"?"less":"different"} ${dir==="≠"?"from":"than"} ${fm(mu)}`,"That's a fact about the sample we knew before testing; conclude about μ."],[`Fail to reject H0 at the ${levelPct} level`,`${absT} is beyond the critical value ${crit}: it's in the rejection region.`]]
          :[[`Accept H0: the true mean is ${fm(mu)}`,"Failing to reject isn't evidence that H0 is true: never \"accept H0\"."],[`Reject H0 at the ${levelPct} level`,`${absT} hasn't passed the critical value ${crit}: it's not in the rejection region.`],[`The sample mean ${fm(xb)} is ${dir===">"?"greater":dir==="<"?"less":"different"} ${dir==="≠"?"from":"than"} ${fm(mu)}, so ${ha}`,"A difference in the sample isn't enough; the test says whether it's beyond chance."]],["H4","H5"])], model:modelE},
    {label:"f", q:"What is the approximate p-value associated with this test? Interpret it.", steps:[
      mc("The p-value, from the t table:",[br,b.k<0?`${absT} is below every critical value in the row.`:`${absT} lies between ${b.tlo} and ${b.thi} in row ${df}${two?"; double both areas for two tails":""}.`],brOpts.slice(0,3).map(o=>[o,/exactly/.test(o)?"From the table you can only bracket the p-value, not pin it down.":"Find |t| in row "+df+": the p-value lies between the two column areas around it (bigger t, smaller area)."]),["H3"]),
      mc("Which interpretation earns full credit?",[b.k<0?`If μ were ${fm(mu)}, a t-statistic at least this extreme would occur with probability above ${pf(upper)}`:`If μ were ${fm(mu)}, a t-statistic at least this extreme would occur with probability ${b.lo==null?"below "+pf(two?r4(2*TCOL[6]):TCOL[6]):"between "+pf(two?r4(2*b.lo):b.lo)+" and "+pf(upper)}`,"Computed assuming H0 is true."],
        [[`The probability that H0 is true is ${b.k<0?"above "+pf(upper):"below "+pf(upper)}`,"A p-value is computed assuming H0 is true, so it can't be the probability that H0 is true."],["The probability that the result happened by chance","Not a correct reading: the p-value assumes H0 and describes how extreme the data are."],[`The probability of making a mistake by ${reject?"rejecting":"not rejecting"} H0`,"That's an error rate (α or β), not the p-value."]],["H3"])], model:modelF}]};
}
const GEN={1:genT1,2:genT2,3:genT3};

/* ================= SPEED DRILLS: one-step items, generated fresh each time ================= */
function numOpts(correct, others, fmt){ const seen=new Set([fmt(correct)]); const out=[correct];
  others.forEach(o=>{ if(o==null||!isFinite(o)) return; const k=fmt(o); if(!seen.has(k)&&out.length<4){ seen.add(k); out.push(o); } });
  let bump=1; while(out.length<4){ const o=correct+bump*(Math.random()<.5?-.01:.01)*(1+rnd(9)); const k=fmt(o); if(!seen.has(k)&&o>0){ seen.add(k); out.push(o); } bump++; }
  return out; }
/* the structure drill (kit section 10): a short scenario, one question about it, no computing.
   About one in three is a near miss where a condition fails. */
const SCEN=[
 {s:"A bank wants to know whether the average wait at its drive-through has risen above 4 minutes. It times a random sample of 18 customers: x̄ = 4.6 minutes, s = 1.1 minutes.", par:"μ = the mean drive-through wait for all customers", kind:"mean", method:"test: H0: μ = 4, HA: μ > 4", zt:"t with 17 d.f.: σ is unknown, only s is given", cond:"Random sample; n = 18 < 30, so wait times must be approximately normal", ok:true},
 {s:"An airline wants to estimate the share of its passengers who check a bag. In a random sample of 400 passengers, 236 checked a bag.", par:"p = the proportion of all the airline's passengers who check a bag", kind:"proportion", method:"confidence interval for p", zt:"z: it's a proportion, the SE depends only on p", cond:"Random; n·p̂ = 236 ≥ 15 and n(1 − p̂) = 164 ≥ 15", ok:true},
 {s:"A packaging line has a long-run standard deviation of 3 g. An engineer samples 49 packages to estimate the current mean weight.", par:"μ = the mean weight of all packages from the line", kind:"mean", method:"confidence interval for μ", zt:"z: σ = 3 g is known from the long run", cond:"Random; n = 49 ≥ 30", ok:true},
 {s:"A retailer posts a satisfaction survey on its homepage; 6,200 visitors answer, and the average score is 7.9 out of 10. It wants to estimate the average satisfaction of all customers.", par:"μ = the mean satisfaction of all customers", kind:"mean", method:"confidence interval for μ", zt:"t: σ is unknown", cond:"Fails: the sample is self-selected, not random, and a large n doesn't fix that", ok:false},
 {s:"An accountant wants to estimate the average invoice amount. She draws a random sample of 12 invoices; invoice amounts are known to be strongly right-skewed (a few very large ones).", par:"μ = the mean amount of all invoices", kind:"mean", method:"confidence interval for μ", zt:"t: σ is unknown", cond:"Fails: n = 12 is small and the population is strongly skewed, not approximately normal", ok:false},
 {s:"A clinic wants to know whether fewer than 10% of appointments are no-shows. In a random sample of 60 appointments, 4 were no-shows.", par:"p = the proportion of all appointments that are no-shows", kind:"proportion", method:"test: H0: p = .10, HA: p < .10", zt:"z (it's a proportion), if the conditions held", cond:"Fails: only 4 successes, n·p̂ = 4 < 15", ok:false},
 {s:"A chain surveys employee morale by asking 3 employees at each of 10 stores and treats the 30 answers as a random sample of all employees.", par:"μ = the mean morale score of all employees", kind:"mean", method:"confidence interval for μ", zt:"t: σ is unknown", cond:"Fails: employees from the same store aren't independent observations", ok:false},
 {s:"A web team claims a redesign does NOT change the average time on page of 95 seconds. A random sample of 22 visits: x̄ = 101 s, s = 14 s. They want to check whether the time changed.", par:"μ = the mean time on page after the redesign", kind:"mean", method:"test: H0: μ = 95, HA: μ ≠ 95", zt:"t with 21 d.f.: σ is unknown", cond:"Random; n = 22 < 30, so times must be approximately normal", ok:true},
 {s:"A lender wants to show that the average credit score of approved applicants is at least 700... it takes a random sample of 26 approved applicants: x̄ = 712, s = 31, and wants evidence that the mean exceeds 700.", par:"μ = the mean credit score of all approved applicants", kind:"mean", method:"test: H0: μ = 700, HA: μ > 700", zt:"t with 25 d.f.: σ is unknown", cond:"Random; n = 26 < 30, so scores must be approximately normal", ok:true},
 {s:"A supervisor adjusts a filling machine every time a sample mean lands above or below the center line of the x-bar chart, even when it is well inside the control limits.", par:"μ = the process mean fill", kind:"mean", method:"control chart (a test of \"in control\" for each sample)", zt:"z: limits use the known σ/√n", cond:"Fails: this is tampering with common-cause variation, which adds variation", ok:false, qc:true},
 {s:"A plant reports Cpk = 1.5 for a process whose control chart shows several points outside the limits last month.", par:"μ, σ = the process mean and standard deviation", kind:"mean", method:"capability index", zt:"(no test: a capability calculation)", cond:"Fails: capability is only meaningful for a process in statistical control", ok:false, qc:true},
 {s:"A subscription app wants to estimate the proportion of users who upgrade to premium. In a random sample of 250 users, 45 upgraded.", par:"p = the proportion of all users who upgrade", kind:"proportion", method:"confidence interval for p", zt:"z: it's a proportion", cond:"Random; n·p̂ = 45 ≥ 15 and n(1 − p̂) = 205 ≥ 15", ok:true},
 {s:"A hospital times a random sample of 40 ER visits to estimate the average wait. Waits are moderately right-skewed. x̄ = 52 min, s = 18 min.", par:"μ = the mean ER wait for all visits", kind:"mean", method:"confidence interval for μ", zt:"t with 39 d.f.: σ is unknown", cond:"Random; n = 40 ≥ 30, fine for a moderately skewed population", ok:true},
 {s:"A loyalty program measures the same 25 customers' monthly spending in each of 12 months and treats the 300 values as a random sample of customer-months.", par:"μ = the mean monthly spending per customer", kind:"mean", method:"confidence interval for μ", zt:"t: σ is unknown", cond:"Fails: repeated measurements on the same customers aren't independent", ok:false}
];
function drillScen(){ const S0=pick(SCEN), others=SCEN.filter(x=>x!==S0), kind=pick(S0.qc?["cond","cond","method"]:["par","kind","method","zt","cond","cond"]);
  const pool=k=>uniqOpts(S0[k],shuf(others.map(o=>o[k]))).slice(1,4);
  const Q={par:"What is the parameter of interest?", kind:"Is the statistic a mean or a proportion?", method:"Interval or test (and if a test, which hypotheses)?", zt:"z or t, and why?", cond:"Do the conditions hold?"};
  if(kind==="kind") return {q:`${S0.s} ${Q.kind}`, c:["A mean (x̄)","A proportion (p̂)","Both","Neither"].sort((a,b)=>(b.includes(S0.kind==="mean"?"mean":"proportion")?1:0)-(a.includes(S0.kind==="mean"?"mean":"proportion")?1:0)), a:0, e:S0.kind==="mean"?"The data are measurements averaged into x̄.":"The data are yes/no outcomes counted into p̂.", o:["S1"]};
  const objs={par:["S1"], method:["E1","H1"], zt:["E3","H4"], cond:S0.qc?["QC1"]:["S3"]}[kind];
  return {q:`${S0.s} ${Q[kind]}`, c:[S0[kind],...pool(kind)], a:0, e:S0[kind]+".", o:objs}; }
const DRILLS={
 method:{title:"Spot the method", sub:"Parameter, statistic, interval or test, z or t, conditions", gen:drillScen},
 se:{title:"Standard error", sub:"σ/√n and √(p̂(1 − p̂)/n) in your head", gen(){
   if(Math.random()<.6){ const n=pick([16,25,36,49,64,81,100,144]), rt=Math.sqrt(n), se=pick([.5,1,1.5,2,2.5,3,4,5]), sig=se*rt;
     const c=numOpts(se,[sig/n,sig,se*2,sig/(n-1)],x=>fx(x,4));
     return {q:`σ = ${fx(sig,2)}, n = ${n}. Standard error of x̄?`, c:c.map(x=>fx(x,4)), a:0, e:`σ/√n = ${fx(sig,2)}/${rt} = ${fx(se,4)}.`, o:["S2"]}; }
   const p=pick([.1,.2,.25,.4,.5]), n=pick([100,400,900]), se=r4(Math.sqrt(p*(1-p)/n));
   const c=numOpts(se,[r4(p*(1-p)/n),r4(Math.sqrt(p/n)),r4(Math.sqrt(p*(1-p))/Math.sqrt(n)*2)],x=>fx(x,4));
   return {q:`p̂ = ${p}, n = ${n}. √(p̂(1 − p̂)/n) = ?`, c:c.map(x=>fx(x,4)), a:0, e:`√(${p}·${fx(1-p,2)}/${n}) = √${fx(r4(p*(1-p)),4)}/${Math.sqrt(n)} = ${fx(se,4)}.`, o:["S5"]}; }},
 crit:{title:"Critical values", sub:"z for a confidence level, t from the table", gen(){
   if(Math.random()<.35){ const CL=pick([90,95,99]), Z=ZCRIT[CL];
     return {q:`z_α/2 for a ${CL}% confidence interval?`, c:uniqOpts(`${Z.z.toFixed(2)}${Z.alt?` (or ${Z.alt.toFixed(2)})`:""}`,["1.28","1.96","2.33","1.64 (or 1.65)","2.58 (or 2.57)","3.09"]).slice(0,4), a:0, e:`α/2 = ${pf(r4((1-CL/100)/2))} → look up ${pf(Z.look)}: ${Z.near}.`, o:["E4","C5"]}; }
   const n=8+rnd(23), df=n-1, kind=pick(["right","left","two","ci"]), al=pick([.1,.05,.01]), area=kind==="two"?al/2:kind==="ci"?al/2:al, v=tcrit(df,area);
   const q=kind==="ci"?`A ${Math.round((1-al)*100)}% CI for μ, σ unknown, n = ${n}. Which t?`:kind==="two"?`Two-tailed test, α = ${al}, n = ${n}. Critical t?`:`${kind==="right"?"Right":"Left"}-tailed test, α = ${al}, n = ${n}. Critical value?`;
   const right=kind==="left"?`−${v}`:kind==="two"?`±${v}`:String(v);
   const wr=[tcrit(Math.min(n,30),area),tcrit(df,kind==="two"||kind==="ci"?al:al/2),tcrit(df,area===.1?.05:.1)].map(x=>kind==="left"?`−${x}`:kind==="two"?`±${x}`:String(x));
   if(kind==="left") wr.push(String(v));
   return {q, c:uniqOpts(right,wr).slice(0,4), a:0, e:`Row n − 1 = ${df}, column ${pf(area)}${kind==="two"||kind==="ci"?" (α/2)":""}${kind==="left"?"; negative for a left tail":""}.`, o:["H5","E3"]}; }},
 pval:{title:"p-value brackets", sub:"Find t in its row, read the two tail areas", gen(){
   const n=8+rnd(23), df=n-1, row=trow(df), two=Math.random()<.3, k=rnd(6), t=r3(row[k]+(row[k+1]-row[k])*(.3+Math.random()*.4)), b=tBracket(df,t);
   const right=bracketText(b,two), nb1=bracketText(tBracket(df,row[Math.max(0,k-1)]+.001),two), nb2=bracketText(tBracket(df,row[Math.min(6,k+1)]+.001),two);
   return {q:`${two?"Two":"Right"}-tailed t-test, ${df} d.f., t = ${fx(t,3)}. The p-value is:`, c:uniqOpts(right,[nb1,nb2,`p-value = ${pf(two?r4(2*b.hi):b.hi)}`,"p-value > .25"]).slice(0,4), a:0, e:`Row ${df}: ${fx(t,3)} is between ${b.tlo} (${pf(b.hi)}) and ${b.thi} (${pf(b.lo)})${two?"; double both for two tails":""}.`, o:["H3"], v:`[[tt:${df},${t}]]`}; }},
 hyp:{title:"Write the hypotheses", sub:"Claim → H0 and HA, about μ or p", gen(){
   const items=[["a new checkout cuts the average wait below 6 minutes","μ","6","<"],["the average order now exceeds $40","μ","40",">"],["more than 30% of visitors click the banner","p",".30",">"],["the mean fill differs from the 350 ml label","μ","350","≠"],["fewer than 5% of parts are defective","p",".05","<"],["the average commute is longer than 25 minutes","μ","25",">"],["the share of on-time flights has changed from 80%","p",".80","≠"],["the average call is shorter than 7 minutes","μ","7","<"]];
   const [claim,par,v,d]=pick(items), stat=par==="μ"?"x̄":"p̂";
   return {q:`Test the claim that ${claim}.`, c:[`H0: ${par} = ${v}, HA: ${par} ${d} ${v}`,`H0: ${par} ${d} ${v}, HA: ${par} = ${v}`,`H0: ${stat} = ${v}, HA: ${stat} ${d} ${v}`,`H0: ${par} = ${v}, HA: ${par} ${d==="≠"?">":d==="<"?"≠":"<"} ${v}`], a:0, e:"Equality in H0, the claim in HA, about the parameter, with the direction of the claim.", o:["H1"]}; }},
 ztable:{title:"Table reading", sub:"z → area, area → z, with symmetry", gen(){
   const kind=pick(["below","above","negbelow","between","inverse"]);
   const r=3+rnd(23), c=rnd(10), z=(r*10+c)/100, t=ZT[r][c], zs=z.toFixed(2), f=x=>x.toFixed(4);
   if(kind==="inverse"){ const P=pick([.9,.95,.975,.99,.995]); const zf=zFor(P);
     const c4=numOpts(zf.z,[zf.z+.01*(1+rnd(3)),r2(P),zf.z-.1,zFor(P-(1-P)).z],x=>x.toFixed(2));
     return {q:`Which z has ${pf(P)} of the area to its LEFT?`, c:c4.map(x=>x.toFixed(2)), a:0, e:`The probability closest to ${pf(P)} in the table: ${f(zf.t)} at z = ${zf.z.toFixed(2)}${zf.alt!=null?` (or ${zf.alt.toFixed(2)})`:""}.`, o:["C4","C5"]}; }
   let q,ans,e;
   if(kind==="below"){ q=`P(Z < ${zs}) = ?`; ans=t; e=`Row ${zs.slice(0,3)}, column .0${zs[3]}: area to the left.`; }
   else if(kind==="above"){ q=`P(Z > ${zs}) = ?`; ans=r4(1-t); e=`Complement: 1 − ${f(t)}.`; }
   else if(kind==="negbelow"){ q=`P(Z < −${zs}) = ?`; ans=r4(1-t); e=`Symmetry: 1 − P(Z < ${zs}) = 1 − ${f(t)}.`; }
   else { q=`P(−${zs} < Z < ${zs}) = ?`; ans=r4(2*(t-.5)); e=`2·(${f(t)} − .5).`; }
   const c4=numOpts(ans,[r4(1-ans), t, r4(t-.5), r4(2*t-1+.01)],f);
   return {q, c:c4.map(f), a:0, e, o:["C4"], v:kind==="between"?`[[normal:0,1|btw=-${z},${z}]]`:kind==="below"?`[[normal:0,1|lt=${z}]]`:kind==="above"?`[[normal:0,1|gt=${z}]]`:`[[normal:0,1|lt=-${z}]]`}; }},
 charts:{title:"Control charts & capability", sub:"Limits, the p-chart floor, Cpk", gen(){
   const kind=pick(["xbar","p","cpk","fa"]);
   if(kind==="xbar"){ const n=pick([4,9,16,25]), rt=Math.sqrt(n), se=pick([1,2,3,.5]), sig=se*rt, mu=pick([100,250,500,40]);
     return {q:`x-bar chart: μ = ${mu}, σ = ${fx(sig,2)}, samples of n = ${n}. The 3-sigma limits are:`, c:uniqOpts(`${fx(mu-3*se,2)} and ${fx(mu+3*se,2)}`,[`${fx(mu-3*sig,2)} and ${fx(mu+3*sig,2)}`,`${fx(mu-se,2)} and ${fx(mu+se,2)}`,`${fx(mu-3*sig/n,2)} and ${fx(mu+3*sig/n,2)}`,`${fx(mu-2*se,2)} and ${fx(mu+2*se,2)}`]), a:0, e:`SE = ${fx(sig,2)}/√${n} = ${fx(se,2)}; ${mu} ± 3(${fx(se,2)}).`, o:["QC2","S2"]}; }
   if(kind==="p"){ const pb=pick([.01,.02,.03]), n=pick([50,100]), se=r4(Math.sqrt(pb*(1-pb)/n)), lcl=r4(pb-3*se), ucl=r4(pb+3*se);
     return {q:`p chart: p̄ = ${pb}, n = ${n}. p̄ − 3·${fx(se,4)} = ${fx(lcl,4)}. The LCL is:`, c:["0",fx(lcl,4),fx(pb,2),fx(ucl,4)], a:0, e:"A proportion can't be negative, so a negative lower limit is set to 0.", o:["QC3"]}; }
   if(kind==="fa") return {q:"An in-control process charted with 3-sigma limits: the false-alarm probability per sample is about:", c:[".0026",".05",".27",".9974"], a:0, e:"2(1 − .9987) = .0026, about 1 in 385 samples.", o:["QC6"]};
   const lsl=pick([90,180,490]), w=pick([20,30]), usl=lsl+w, sig=pick([2,2.5,3]), mu=+(lsl+w/2+pick([-3,-2,2,3])).toFixed(1);
   const a1=r2((usl-mu)/(3*sig)), a2=r2((mu-lsl)/(3*sig)), cpk=Math.min(a1,a2), cp=r2(w/(6*sig));
   return {q:`Specs ${lsl} to ${usl}, μ = ${mu}, σ = ${sig}. Cpk = ?`, c:uniqOpts(fx(cpk,2),[fx(Math.max(a1,a2),2),fx(cp,2),fx(r2(cpk/2),2),fx(r2(cpk+.3),2)]).slice(0,4), a:0, e:`(${usl} − ${mu})/(3·${sig}) = ${fx(a1,2)} and (${mu} − ${lsl})/(3·${sig}) = ${fx(a2,2)}; Cpk is the smaller.`, o:["QC4"]}; }}
};
