/* ==BACKUP== */
/* One backup for the whole app: every tab (World, USA, Earth, Math, Brain) keeps its progress in this
   phone's storage under a "globetrotter." key, so one code carries all of it to a new phone.
   Codes start with GTZ1: (compressed) or GT1: (plain). Copy the code, or save it as a file. */
const GT_BK=(()=>{
  const PFX="globetrotter.";
  const b64=u8=>{ let s=""; for(let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s); };
  const unb64=t=>{ const s=atob(t), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u; };
  function collect(){ const d={}; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith(PFX)) d[k]=localStorage.getItem(k); } }catch(e){} return d; }
  async function make(){
    const json=JSON.stringify({v:1,at:Date.now(),d:collect()});
    if(window.CompressionStream&&window.DecompressionStream){ try{
      const buf=await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
      return "GTZ1:"+b64(new Uint8Array(buf)); }catch(e){} }
    return "GT1:"+btoa(unescape(encodeURIComponent(json))); }
  async function read(code){
    code=String(code||"").replace(/\s+/g,""); let json;
    if(code.startsWith("GTZ1:")){ if(!window.DecompressionStream) throw new Error("old");
      json=await new Response(new Blob([unb64(code.slice(5))]).stream().pipeThrough(new DecompressionStream("gzip"))).text(); }
    else if(code.startsWith("GT1:")) json=decodeURIComponent(escape(atob(code.slice(4))));
    else return null;
    const o=JSON.parse(json); if(!o||typeof o.d!=="object") throw new Error("bad"); return o; }
  function apply(o){ Object.entries(o.d).forEach(([k,v])=>{ if(k.startsWith(PFX)&&typeof v==="string") localStorage.setItem(k,v); });
    // until the page reloads, stop this tab from saving its old in-memory progress over what was just restored
    const set=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(String(k).startsWith(PFX)) return; return set.call(this,k,v); }; }
  const TABS=[["globetrotter.v1","World"],["globetrotter.usa.v1","USA"],["globetrotter.earth.v1","Earth"],["globetrotter.math.v1","Math"],["globetrotter.brain.v1","Brain"]];
  const tabsIn=d=>TABS.filter(([k])=>d[k]).map(([,n])=>n);
  const CSS=`.gtbk{display:grid;gap:10px}.gtbk .gtrow{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.gtbk .gtpane{display:grid;gap:10px;background:var(--surface-2);border-radius:14px;padding:12px;font-size:14px;color:var(--ink-2)}
.gtbk textarea{width:100%;min-height:84px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font:12px ui-monospace,Menlo,monospace;padding:8px;resize:vertical;box-sizing:border-box}
.gtbk .gtmsg{font-size:14px;font-weight:700;min-height:18px}.gtbk .gtmsg.ok{color:var(--good)}.gtbk .gtmsg.no{color:var(--bad)}
.gtbk .gtfile{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}`;
  /* the backup/restore panel; opts.legacy(code) can restore an older single-tab code */
  function ui(box,opts={}){
    if(!document.getElementById("gtbkcss")){ const st=document.createElement("style"); st.id="gtbkcss"; st.textContent=CSS; document.head.appendChild(st); }
    box.classList.add("gtbk");
    box.innerHTML=`<div class="gtrow"><button class="btn ghost" data-g="bk" type="button">Back up progress</button><button class="btn ghost" data-g="rs" type="button">Restore</button></div>
    <div class="gtpane" data-p="bk" hidden><span>One code holds your progress from every tab: World, USA, Earth, Math and Brain. Keep it in Notes, email it to yourself, or save it as a file. On a new phone, open the app, tap Restore and paste it.</span>
      <textarea readonly data-t="code" aria-label="Backup code">Making your code…</textarea>
      <div class="gtrow"><button class="btn" data-g="copy" type="button">Copy code</button><button class="btn ghost" data-g="file" type="button">Save as file</button></div><span class="gtmsg" data-m="bk"></span></div>
    <div class="gtpane" data-p="rs" hidden><span>Paste a backup code, or open a backup file. It replaces the progress on this phone for the tabs in the backup.</span>
      <textarea data-t="in" placeholder="Paste code here" aria-label="Paste backup code"></textarea>
      <div class="gtrow"><button class="btn" data-g="go" type="button">Restore progress</button><button class="btn ghost" data-g="open" type="button">Open a file</button><input class="gtfile" type="file" accept=".txt,text/plain" data-t="f"></div><span class="gtmsg" data-m="rs"></span></div>`;
    const q=s=>box.querySelector(s), msg=(w,t,k)=>{ const m=q(`[data-m="${w}"]`); m.textContent=t; m.className="gtmsg "+(k||""); };
    let code="";
    const fileName=()=>{ const d=new Date(); return `globetrotter-backup-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}.txt`; };
    box.addEventListener("click",async e=>{ const b=e.target.closest("[data-g]"); if(!b) return; const g=b.dataset.g;
      if(g==="bk"){ q('[data-p="rs"]').hidden=true; const p=q('[data-p="bk"]'); p.hidden=!p.hidden; if(p.hidden) return;
        opts.beforeBackup&&opts.beforeBackup(); msg("bk","");
        code=await make(); q('[data-t="code"]').value=code;
        const tabs=tabsIn(collect()); msg("bk",tabs.length?`Includes: ${tabs.join(", ")}`:"Nothing to back up yet.","ok"); }
      if(g==="rs"){ q('[data-p="bk"]').hidden=true; const p=q('[data-p="rs"]'); p.hidden=!p.hidden; msg("rs",""); }
      if(g==="copy"){ const t=q('[data-t="code"]');
        try{ await navigator.clipboard.writeText(t.value); b.textContent="Copied"; setTimeout(()=>b.textContent="Copy code",1500); }catch(err){ t.focus(); t.select(); msg("bk","Select all and copy the code.",""); } }
      if(g==="file"){ const blob=new Blob([code],{type:"text/plain"}), name=fileName();
        try{ const f=new File([blob],name,{type:"text/plain"}); if(navigator.canShare&&navigator.canShare({files:[f]})){ await navigator.share({files:[f],title:"Globetrotter backup"}); return; } }catch(err){ if(err&&err.name==="AbortError") return; }
        const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500);
        msg("bk","Saved. Look for it in your Downloads or Files.","ok"); }
      if(g==="open") q('[data-t="f"]').click();
      if(g==="go") restore(q('[data-t="in"]').value);
    });
    q('[data-t="f"]').addEventListener("change",async e=>{ const f=e.target.files&&e.target.files[0]; if(!f) return; const t=await f.text(); q('[data-t="in"]').value=t.trim(); restore(t); e.target.value=""; });
    async function restore(raw){
      raw=String(raw||"").trim(); if(!raw){ msg("rs","Paste a code first.","no"); return; }
      try{ const o=await read(raw);
        if(!o){ if(opts.legacy&&opts.legacy(raw)){ msg("rs","Progress restored.","ok"); return; } throw new Error("bad"); }
        const tabs=tabsIn(o.d); if(!tabs.length) throw new Error("empty");
        apply(o); msg("rs",`Restored: ${tabs.join(", ")}. Reloading…`,"ok"); setTimeout(()=>location.reload(),900); }
      catch(err){ msg("rs",err&&err.message==="old"?"This phone's browser is too old to open that code. Update iOS or Android and try again.":err&&err.message==="empty"?"That backup has no progress in it.":"That code didn't work. Copy the whole thing, starting with GTZ1: or GT1:.","no"); } }
  }
  return {make,read,apply,ui,collect};
})();
/* ==/BACKUP== */
