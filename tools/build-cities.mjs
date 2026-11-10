// Builds games/cities.json for Map Tap: for every country, its capital and its largest cities (GeoNames, via the
// all-the-cities package), skipping districts of a bigger city.   node tools/build-cities.mjs <node_modules dir>
import fs from "fs"; import { createRequire } from "module";
const require=createRequire(process.argv[2]+"/");
const all=require("all-the-cities"), wc=require("world-countries");
const geo=JSON.parse(fs.readFileSync("games/geo.json","utf8"));
const by3={}; wc.forEach(c=>by3[c.cca3]=c); by3.XKX=wc.find(c=>c.cca2==="XK");
const KM=(a,b)=>{ const r=Math.PI/180, dp=(b[1]-a[1])*r, dl=(b[0]-a[0])*r, h=Math.sin(dp/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dl/2)**2; return 12742*Math.asin(Math.sqrt(h)); };
const byCC={}; all.forEach(c=>{ if(!/^PPL(C|A|A2|A3|A4|)$/.test(c.featureCode)) return; (byCC[c.country]=byCC[c.country]||[]).push(c); });
const EN={"Köln":"Cologne","Århus":"Aarhus","Göteborg":"Gothenburg","Genève":"Geneva","Zürich":"Zurich","Thessaloníki":"Thessaloniki","Pátra":"Patras","Panamá":"Panama City","Fès":"Fez","Juárez":"Ciudad Juárez","León de los Aldama":"León","Montréal":"Montreal","Hamhŭng":"Hamhung","Sinŭiju":"Sinuiju","Daşoguz":"Dashoguz","Türkmenabat":"Turkmenabat","Basrah":"Basra","Kota Bharu":"Kota Bharu"}; // common English names
const out={};
for(const g of geo.c){ const w=by3[g.id]; if(!w) continue; const list=(byCC[w.cca2]||[]).sort((a,b)=>b.population-a.population);
  const cap=list.find(c=>c.featureCode==="PPLC"), picked=[];
  const add=c=>{ const p=c.loc.coordinates; if(picked.some(q=>KM(q.p,p)<45)) return; if(/[0-9]|District|Arrondissement|Borough|Municipality|Sector|[āēīōūĀĒĪŌŪţŢŏ\u1E00-\u1EFF]/i.test(c.name)) return; picked.push({n:EN[c.name]||c.name,p,pop:c.population}); };
  if(cap) add(cap);
  for(const c of list){ if(picked.length>=6) break; if(c.population<(picked.length<2?20000:150000)) break; add(c); }
  if(picked.length) out[g.id]=picked.map(c=>[c.n,+c.p[0].toFixed(3),+c.p[1].toFixed(3),c.pop]); }
fs.writeFileSync("games/cities.json",JSON.stringify(out));
console.log(Object.keys(out).length,"countries",Object.values(out).flat().length,"cities",fs.statSync("games/cities.json").size);
for(const k of ["USA","FRA","CHN","IND","BRA","NGA","JPN","GBR","AUS","EGY","VAT","MCO","LUX"]) console.log(k,(out[k]||[]).map(c=>c[0]+":"+c[3]).join(", "));
