/* ==TABBAR== */
/* The bottom tab bar shared by every tab (tools/tabbar.js, copied in by tools/build_editions.py).
   Outline icons for the other tabs, a filled icon in the tint color for the one you're on. */
(function(){
  const m=location.pathname.match(/\/(usa|earth|math|games|test3)\/(?:index\.html)?$/), cur=m?m[1]:"", root=m?"../":"./";
  const I=(o,f)=>`<svg viewBox="0 0 28 28" aria-hidden="true"><g class="o" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${o}</g><g class="f">${f}</g></svg>`;
  const T=[
    ["",'World',I('<circle cx="14" cy="14" r="10"/><path d="M4 14h20M14 4c3 3 4.5 6.5 4.5 10S17 21 14 24c-3-3-4.5-6.5-4.5-10S11 7 14 4z"/>',
      '<circle cx="14" cy="14" r="11" fill="currentColor"/><path d="M3.5 14h21M14 3.5c3 3 4.5 6.6 4.5 10.5S17 21.5 14 24.5c-3-3-4.5-6.6-4.5-10.5S11 6.5 14 3.5z" fill="none" stroke="var(--glass-solid,#fff)" stroke-width="1.6"/>')],
    ["usa","USA",I('<path d="M6 24V4"/><path d="M6 5h14l-3 4.5 3 4.5H6"/>',
      '<path d="M6 24V4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6.5 4.5h14.5l-3.2 4.8 3.2 4.7H6.5z" fill="currentColor"/>')],
    ["earth","Earth",I('<path d="M3 23l7.5-13 4.5 7 3-4.5L25 23z"/><circle cx="20" cy="7" r="2.2"/>',
      '<path d="M2.5 23.5 10.5 9.5l4.5 7 3-4.6 7.5 11.6z" fill="currentColor"/><circle cx="20.5" cy="6.5" r="2.6" fill="currentColor"/>')],
    ["math","Math",I('<rect x="4" y="4" width="20" height="20" rx="5"/><path d="M9 10h5M11.5 7.5v5M9 18.5h5M16.5 9.5l3 3M19.5 9.5l-3 3M16.5 17h3M16.5 20h3"/>',
      '<rect x="3.5" y="3.5" width="21" height="21" rx="5.5" fill="currentColor"/><path d="M9 10h5M11.5 7.5v5M9 18.5h5M16.5 9.5l3 3M19.5 9.5l-3 3M16.5 17h3M16.5 20h3" fill="none" stroke="var(--glass-solid,#fff)" stroke-width="1.8" stroke-linecap="round"/>')],
    ["games","Games",I('<path d="M8.5 8h11a5.5 5.5 0 0 1 5.3 7l-1.3 4.6a3 3 0 0 1-5 1.3L16 18.5h-4L9.5 21a3 3 0 0 1-5-1.3L3.2 15a5.5 5.5 0 0 1 5.3-7z"/><path d="M9.5 11.5v4M7.5 13.5h4"/><circle cx="18.5" cy="12.5" r=".9" fill="currentColor"/><circle cx="20.5" cy="14.8" r=".9" fill="currentColor"/>',
      '<path d="M8.5 7.5h11a6 6 0 0 1 5.8 7.6L24 19.8a3.2 3.2 0 0 1-5.4 1.4l-2.4-2.6h-4.4l-2.4 2.6A3.2 3.2 0 0 1 4 19.8l-1.3-4.7a6 6 0 0 1 5.8-7.6z" fill="currentColor"/><path d="M9.5 11.5v4M7.5 13.5h4" stroke="var(--glass-solid,#fff)" stroke-width="1.8" stroke-linecap="round"/><circle cx="18.5" cy="12.3" r="1.1" fill="var(--glass-solid,#fff)"/><circle cx="20.6" cy="14.7" r="1.1" fill="var(--glass-solid,#fff)"/>')],
    ["test3","Test 3",I('<path d="M3 21c4 0 5-12 11-12s7 12 11 12"/><path d="M3 24h22"/><path d="M14 9V5"/>',
      '<path d="M2.5 21.5C7 21.5 8 8.5 14 8.5S21 21.5 25.5 21.5V24h-23z" fill="currentColor"/><path d="M14 8.5V4.5M2.5 24.5h23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')]
  ];
  const nav=document.createElement("nav"); nav.className="tabbar"; nav.setAttribute("aria-label","Tabs");
  nav.innerHTML=T.map(([k,n,ic])=>`<a href="${root}${k?k+"/":""}"${k===cur?' aria-current="page"':""}>${ic}<span>${n}</span></a>`).join("");
  document.body.appendChild(nav); document.body.classList.add("has-tabbar");
})();
/* ================= SHELL MOTION =================
   Shared by every tab: a compact title that fades into a top bar once the large title scrolls away,
   haptic taps, numbers that count up, sections that rise in as you scroll, sliding segmented controls,
   and games and lessons that open from the spot you tapped. */
(function(){
  const D=document, B=D.body, RM=matchMedia("(prefers-reduced-motion: reduce)");
  /* where the last tap landed, so opening screens can grow out of it */
  D.addEventListener("pointerdown",e=>{ const r=D.documentElement.style; r.setProperty("--tapx",e.clientX+"px"); r.setProperty("--tapy",e.clientY+"px"); },{capture:true,passive:true});

  /* haptics: a real tick on iPhone (iOS 18 switch trick), a short buzz on Android */
  const hl=D.createElement("label"), hi=D.createElement("input"); hi.type="checkbox"; hi.setAttribute("switch",""); hi.tabIndex=-1;
  hl.setAttribute("aria-hidden","true"); hl.style.cssText="position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9px;top:0";
  hl.appendChild(hi); B.appendChild(hl); hl.addEventListener("click",e=>e.stopPropagation());
  const haptic=()=>{ try{ if(navigator.vibrate&&!/iP(hone|ad|od)/.test(navigator.userAgent)) navigator.vibrate(8); else hl.click(); }catch(e){} };
  window.GT_HAPTIC=haptic;
  let lastTap=null, lastAt=0;
  D.addEventListener("pointerdown",e=>{ lastTap=e.target.closest("button,[role=button],a,.mc,.qc,.cell,.tile"); lastAt=performance.now(); },{capture:true,passive:true});
  /* answer feedback: the thing you tapped springs on a right answer and shakes on a wrong one */
  function react(kind){ if(RM.matches||!lastTap||!lastTap.isConnected||performance.now()-lastAt>700) return; if(lastTap.closest(".tabbar,.pad,.kb,.dspad,.ckeys,.msboard,.qboard")) return;
    const el=lastTap, c=kind==="no"?"fb-no":"fb-ok"; el.classList.remove("fb-ok","fb-no"); void el.offsetWidth; el.classList.add(c); setTimeout(()=>el.classList.remove(c),520); }
  if(typeof window.snd==="function"){ const o=window.snd; window.snd=function(k){ haptic(); if(k==="ok"||k==="no") react(k); return o.apply(this,arguments); }; }

  /* tab bar: a tick on tap, and the tab you land on gives a small bounce */
  const tb=D.querySelector(".tabbar");
  if(tb){ tb.addEventListener("click",e=>{ const a=e.target.closest("a"); if(!a) return; haptic(); try{ sessionStorage.setItem("gt-tab-pop","1"); }catch(x){} if(a.getAttribute("aria-current")==="page"){ e.preventDefault(); scrollTo({top:0,behavior:RM.matches?"auto":"smooth"}); } });
    try{ if(sessionStorage.getItem("gt-tab-pop")){ sessionStorage.removeItem("gt-tab-pop"); tb.classList.add("arrived"); } }catch(x){} }

  /* compact title bar */
  const nb=D.createElement("div"); nb.className="navc"; nb.setAttribute("aria-hidden","true"); nb.innerHTML="<span></span>"; B.appendChild(nb);
  let h1=null; const io=new IntersectionObserver(es=>{ for(const e of es) if(e.target===h1) nb.classList.toggle("on",!e.isIntersecting&&e.boundingClientRect.top<60); },{rootMargin:"-56px 0px 0px 0px"});
  function bindTitle(){ const h=[...D.querySelectorAll(".brand h1")].find(x=>x.offsetParent!==null&&!x.closest("[hidden]")); if(h===h1) return; if(h1) io.unobserve(h1); h1=h||null; nb.classList.remove("on"); if(h1){ nb.firstChild.textContent=h1.textContent.trim(); io.observe(h1); } }

  /* numbers count up when they first appear */
  const CNT=".card.center .big,.ring b,.stat b,.mtres span";
  function countUp(el){ if(RM.matches||el.dataset.counted) return; el.dataset.counted="1";
    const tn=[...el.childNodes].find(n=>n.nodeType===3&&/\d/.test(n.data)); if(!tn) return;
    const m=tn.data.match(/^(\D*?)(\d{1,3}(?:,\d{3})+|\d+)(.*)$/s); if(!m||/^[:.]\d/.test(m[3])||/\d$/.test(m[1])) return;
    const to=+m[2].replace(/,/g,""); if(!(to>=2)||to>1e7) return; const comma=m[2].includes(",")||to>=10000, fmt=v=>comma?v.toLocaleString("en-US"):String(v);
    const t0=performance.now(), dur=Math.min(900,420+to*12);
    const step=t=>{ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); tn.data=m[1]+fmt(Math.round(to*e))+m[3]; if(k<1&&tn.isConnected) requestAnimationFrame(step); };
    tn.data=m[1]+fmt(0)+m[3]; requestAnimationFrame(step); }

  /* sections below the fold rise in as they scroll into view */
  const SR=".sec,.card,.mode,.tile,.deck,.trick,.glist,.cbtn,.mcard,.hcard,.part,.step";
  const sio=new IntersectionObserver(es=>{ for(const e of es) if(e.isIntersecting){ e.target.classList.add("in"); sio.unobserve(e.target); } },{rootMargin:"0px 0px -6% 0px"});
  function reveal(root){ if(RM.matches) return; const vh=innerHeight;
    root.querySelectorAll(SR).forEach(el=>{ if(el.dataset.sr||el.closest(".sr:not(.in)")||el.closest(".gplay,.play:not(.home),.sheet")) return; el.dataset.sr="1"; const r=el.getBoundingClientRect(); if(!r.height||r.top<vh-10) return; el.classList.add("sr"); sio.observe(el); }); }

  /* segmented controls: a thumb that slides to the chosen option, even across re-renders */
  const SEG=".levels,.seg,.seg2,.seg3", last=new Map();
  function segKey(c){ const b=c.querySelector("button"); return (b&&(b.dataset.act||b.dataset.k||b.dataset.v||b.textContent)||"")+"|"+c.className; }
  function segs(root){ root.querySelectorAll(SEG).forEach(c=>{ const on=c.querySelector('button[aria-pressed="true"]'); if(!on) return;
      let th=c.querySelector(":scope>.segthumb"); const key=segKey(c), fresh=!th;
      if(fresh){ th=D.createElement("i"); th.className="segthumb"; th.setAttribute("aria-hidden","true"); c.prepend(th); c.classList.add("hasthumb"); }
      const x=on.offsetLeft, y=on.offsetTop, w=on.offsetWidth, h=on.offsetHeight, prev=last.get(key);
      if(fresh&&prev&&!RM.matches&&(prev.x!==x||prev.w!==w)){ th.style.transition="none"; th.style.transform=`translate(${prev.x}px,${prev.y}px)`; th.style.width=prev.w+"px"; th.style.height=prev.h+"px"; void th.offsetWidth; th.style.transition=""; }
      th.style.transform=`translate(${x}px,${y}px)`; th.style.width=w+"px"; th.style.height=h+"px"; last.set(key,{x,y,w,h}); }); }

  /* watch every re-render */
  let q=0, added=[];
  function flush(){ q=0; bindTitle(); const roots=added.splice(0); for(const n of roots){ if(!n.isConnected) continue; reveal(n); n.querySelectorAll&&n.querySelectorAll(CNT).forEach(el=>{ if(el.offsetParent!==null) countUp(el); }); if(n.matches&&n.matches(CNT)) countUp(n); } segs(D); }
  new MutationObserver(ms=>{ for(const m of ms){ if(m.type==="childList") m.addedNodes.forEach(n=>{ if(n.nodeType===1) added.push(n); }); else if(m.target.nodeType===1) added.push(m.target); } if(!q) q=requestAnimationFrame(flush); })
    .observe(B,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","aria-pressed"]});
  added.push(B); flush();
  addEventListener("resize",()=>segs(D));
})();
/* ==/TABBAR== */
