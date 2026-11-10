// Builds games/states.json for Statele from the USA tab's data (tools/us-map.json, tools/us-meta.json):
// each state's outline (silhouette), a shared US map (Albers USA, Alaska and Hawaii inset), centre, borders,
// and the closest border-to-border distance between every pair of states.   node tools/build-games-states.mjs
import fs from "fs"; import vm from "vm";
const html=fs.readFileSync("index.html","utf8");
const ctx={console}; vm.createContext(ctx);
for(const m of html.matchAll(/<script>(\/\/ https:\/\/(?:d3js\.org|github\.com\/topojson)[\s\S]*?)<\/script>/g)) vm.runInContext(m[1],ctx);
const d3=ctx.d3, topojson=ctx.topojson;
const META=JSON.parse(fs.readFileSync("tools/us-meta.json","utf8"));
const T=JSON.parse(fs.readFileSync("tools/us-map.json","utf8"));
const feats={}; topojson.feature(T,T.objects.countries).features.forEach(f=>feats[f.id]=f);
const fix=f=>{ const g=f.geometry; const polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;
  polys.forEach(p=>p.forEach(r=>{ if(d3.geoArea({type:"Polygon",coordinates:[r]})>2*Math.PI) r.reverse(); })); return f; };
const R=6371, W=1000;
const all={type:"FeatureCollection",features:META.map(m=>fix(feats[m.id]))};
const proj=d3.geoAlbersUsa().fitExtent([[10,10],[W-10,620]],all);
const ringsOf=g=>g.type==="Polygon"?[g.coordinates]:g.coordinates;
function pathOf(geom,pr,tol,dec,minA=0){ const k=10**dec; let s="", pts=[];
  const flush=()=>{ if(pts.length>=3){ let ar=0; for(let i=0;i<pts.length;i++){ const q=pts[i],r=pts[(i+1)%pts.length]; ar+=q[0]*r[1]-r[0]*q[1]; }
      if(Math.abs(ar)/2>=minA) s+="M"+pts.map(p=>Math.round(p[0]*k)/k+","+Math.round(p[1]*k)/k).join("L")+"Z"; } pts=[]; };
  const c={ moveTo(x,y){ flush(); pts.push([x,y]); }, lineTo(x,y){ const l=pts[pts.length-1]; if(l&&Math.hypot(x-l[0],y-l[1])<tol) return; pts.push([x,y]); }, closePath(){ flush(); }, arc(){}, rect(){} };
  d3.geoPath(pr,c)(geom); flush(); return s; }
const out=[];
for(const m of META){ const f=fix(feats[m.id]); const polys=ringsOf(f.geometry); const areas=polys.map(p=>d3.geoArea({type:"Polygon",coordinates:p}));
  const mi=areas.indexOf(Math.max(...areas)), mc=d3.geoCentroid({type:"Polygon",coordinates:polys[mi]});
  const rad=Math.sqrt(areas[mi]*R*R/Math.PI);
  const keep=polys.filter(p=>d3.geoDistance(d3.geoCentroid({type:"Polygon",coordinates:p}),mc)*R<Math.max(400,rad*4));
  const shape={type:"MultiPolygon",coordinates:keep};
  const sp=d3.geoAzimuthalEqualArea().rotate([-mc[0],-mc[1]]).fitExtent([[4,4],[396,396]],shape);
  const sh=pathOf(shape,sp,1.4,0,6)||pathOf(shape,sp,0.2,1,0);
  const wp=pathOf(f.geometry,proj,0.8,1,0.5)||pathOf(f.geometry,proj,0.2,1,0);
  const bb=d3.geoPath(proj).bounds(f); const cp=d3.geoPath(proj).centroid({type:"Feature",geometry:{type:"Polygon",coordinates:polys[mi]}});
  out.push({id:m.id,n:m.n,c:m.c,b:m.b,ll:[+mc[0].toFixed(3),+mc[1].toFixed(3)],km2:Math.round(areas.reduce((a,b)=>a+b,0)*R*R),sh,wp,bb:bb.flat().map(v=>Math.round(v)),cp:cp.map(v=>Math.round(v)),al:[m.id]}); }
const toV=([lo,la])=>{ const r=Math.PI/180, cl=Math.cos(la*r); return [cl*Math.cos(lo*r),cl*Math.sin(lo*r),Math.sin(la*r)]; };
const PTS=out.map(o=>{ const pts=[]; for(const poly of ringsOf(feats[o.id].geometry)) for(const ring of poly) for(let i=0;i<ring.length;i++){ const a=ring[i], b=ring[(i+1)%ring.length], d=d3.geoDistance(a,b)*R, n=Math.max(1,Math.ceil(d/10)), it=d3.geoInterpolate(a,b); for(let k=0;k<n;k++) pts.push(toV(it(k/n))); } return pts; });
const MD=[];
for(let i=0;i<out.length;i++) for(let j=i+1;j<out.length;j++){ if(out[i].b.includes(out[j].id)){ MD.push(0); continue; }
  let best=-2; const A=PTS[i], B=PTS[j], sa=Math.max(1,Math.floor(A.length/400)), sb=Math.max(1,Math.floor(B.length/400)); let bi=0,bj=0;
  for(let x=0;x<A.length;x+=sa) for(let y=0;y<B.length;y+=sb){ const p=A[x],q=B[y], d=p[0]*q[0]+p[1]*q[1]+p[2]*q[2]; if(d>best){ best=d; bi=x; bj=y; } }
  for(let x=Math.max(0,bi-sa*4);x<Math.min(A.length,bi+sa*4+1);x++) for(let y=Math.max(0,bj-sb*4);y<Math.min(B.length,bj+sb*4+1);y++){ const p=A[x],q=B[y], d=p[0]*q[0]+p[1]*q[1]+p[2]*q[2]; if(d>best) best=d; }
  MD.push(Math.round(Math.acos(Math.min(1,best))*R)); }
fs.writeFileSync("games/states.json",JSON.stringify({w:W,c:out,md:MD}));
console.log(out.length,"states",fs.statSync("games/states.json").size);
