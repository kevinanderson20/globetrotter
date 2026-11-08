// Builds games/geo.json for Worldle and Travle from the World tab's own data:
// country names, borders and aliases from index.html, outlines from map-hi.json (Natural Earth).
//   node tools/build-games-geo.mjs
import fs from "fs"; import vm from "vm";
const html=fs.readFileSync("index.html","utf8");
const ctx={console}; vm.createContext(ctx);
for(const m of html.matchAll(/<script>(\/\/ https:\/\/(?:d3js\.org|github\.com\/topojson)[\s\S]*?)<\/script>/g)) vm.runInContext(m[1],ctx);
const d3=ctx.d3, topojson=ctx.topojson;
if(!d3||!topojson) throw new Error("could not load d3/topojson from index.html");
const META=JSON.parse(html.match(/<script type="application\/json" id="meta">([\s\S]*?)<\/script>/)[1]);
const ALIAS=vm.runInContext("("+html.match(/const ALIAS=(\{[\s\S]*?\});/)[1]+")",ctx);
const ids=new Set(META.map(m=>m.id));
const T=JSON.parse(fs.readFileSync("map-hi.json","utf8"));
const feats={}; topojson.feature(T,T.objects.countries).features.forEach(f=>{ if(ids.has(f.id)) feats[f.id]=f; });
const fix=f=>{ const g=f.geometry; if(!g||!/Polygon/.test(g.type)) return f; const polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;
  polys.forEach(p=>p.forEach(r=>{ if(d3.geoArea({type:"Polygon",coordinates:[r]})>2*Math.PI) r.reverse(); })); return f; };
const R=6371;
// --- Travle connections (travle.earth/extra_info): bridges/tunnels added, Ceuta/Melilla removed
const B={}; META.forEach(m=>B[m.id]=new Set((m.b||[]).filter(x=>ids.has(x))));
const link=(a,b)=>{ B[a].add(b); B[b].add(a); }, cut=(a,b)=>{ B[a].delete(b); B[b].delete(a); };
link("FRA","GBR"); link("DNK","SWE"); cut("ESP","MAR");
const out=[]; let shapeBytes=0, worldBytes=0;
// world map for Travle: Mercator, 2000px wide
const W=2000, proj=d3.geoMercator().scale(W/(2*Math.PI)).translate([W/2,W/2*0.95]).clipExtent([[0,-200],[W,1700]]);
function ringsOf(g){ return g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[]; }
// draw through d3 so antimeridian cutting and clipping are handled, thinning points and dropping specks as we go
function pathOf(geom,pr,tol,dec,minA=0){ const k=10**dec; let s="", pts=[];
  const flush=()=>{ if(pts.length>=3){ let ar=0; for(let i=0;i<pts.length;i++){ const q=pts[i],r=pts[(i+1)%pts.length]; ar+=q[0]*r[1]-r[0]*q[1]; }
      if(Math.abs(ar)/2>=minA) s+="M"+pts.map(p=>Math.round(p[0]*k)/k+","+Math.round(p[1]*k)/k).join("L")+"Z"; } pts=[]; };
  const ctx={ moveTo(x,y){ flush(); pts.push([x,y]); }, lineTo(x,y){ const l=pts[pts.length-1]; if(l&&Math.hypot(x-l[0],y-l[1])<tol) return; pts.push([x,y]); }, closePath(){ flush(); }, arc(){}, rect(){} };
  d3.geoPath(pr,ctx)(geom); flush(); return s; }
// the source map has Vatican City as a zero-area sliver; trace its walls by hand (wound clockwise for d3)
feats.VAT.geometry={type:"Polygon",coordinates:[[[12.4457,41.9034],[12.4465,41.9015],[12.4495,41.9005],[12.4530,41.9002],[12.4560,41.9008],[12.4584,41.9030],[12.4572,41.9065],[12.4528,41.9075],[12.4480,41.9068],[12.4457,41.9034]]]};
for(const m of META){ const f=fix(feats[m.id]); if(!f){ console.warn("no shape",m.id); continue; }
  const polys=ringsOf(f.geometry); const areas=polys.map(p=>d3.geoArea({type:"Polygon",coordinates:p}));
  const HOME={DNK:[9.3,56.2]}; // Greenland is Denmark's biggest piece, but the country people picture is Jutland
  let mi=areas.indexOf(Math.max(...areas)); if(HOME[m.id]){ let bd=9; polys.forEach((p,i)=>{ const d=d3.geoDistance(d3.geoCentroid({type:"Polygon",coordinates:p}),HOME[m.id]); if(d<bd){ bd=d; mi=i; } }); }
  const main=polys[mi], mc=d3.geoCentroid({type:"Polygon",coordinates:main});
  const total=areas.reduce((a,b)=>a+b,0)*R*R;
  // Worldle silhouette: the main landmass plus nearby islands, equal-area projection centred on the country
  const rad=Math.sqrt(areas[mi]*R*R/Math.PI);
  const keep=polys.filter((p,i)=>{ const c=d3.geoCentroid({type:"Polygon",coordinates:p}); return d3.geoDistance(c,mc)*R<Math.max(900,rad*5); });
  const shape={type:"MultiPolygon",coordinates:keep};
  const sp=d3.geoAzimuthalEqualArea().rotate([-mc[0],-mc[1]]).fitExtent([[4,4],[396,396]],shape);
  const sh=pathOf(shape,sp,1.8,0,8)||pathOf(shape,sp,0.2,1,0); shapeBytes+=sh.length;
  // Travle map outline (all parts), projected to the shared world map
  const wp=pathOf(f.geometry,proj,2.2,0,2)||pathOf(f.geometry,proj,0.3,1,0); worldBytes+=wp.length;
  const bb=d3.geoPath(proj).bounds({type:"Feature",geometry:{type:"MultiPolygon",coordinates:polys}});
  const cp=proj(mc);
  out.push({id:m.id,n:m.n,c:m.c,b:[...B[m.id]],ll:[+mc[0].toFixed(3),+mc[1].toFixed(3)],km2:Math.round(total),sh,wp,bb:bb.flat().map(v=>Math.round(v)),cp:cp.map(v=>Math.round(v)),al:ALIAS[m.id]||[]}); }
fs.writeFileSync("games/geo.json",JSON.stringify({w:W,c:out}));
console.log(out.length,"countries; shapes",shapeBytes,"world",worldBytes,"file",fs.statSync("games/geo.json").size);
