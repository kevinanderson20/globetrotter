// Builds games/flags.json for Flagle and Higher or Lower: every country's flag (SVG, from the flag-icons package, minified),
// its capital (world-countries package) and its 2025 population estimate (UN World Population Prospects, via the
// datasets/population CSV on GitHub). Run with the packages installed: node tools/build-flags.mjs <node_modules dir> <population.csv>
import fs from "fs"; import { createRequire } from "module";
const [nm,popCsv]=process.argv.slice(2); const require=createRequire(nm+"/");
const {optimize}=require("svgo"); const wc=require("world-countries");
const geo=JSON.parse(fs.readFileSync("games/geo.json","utf8"));
const by3={}; wc.forEach(c=>by3[c.cca3]=c); by3.XKX=wc.find(c=>c.cca2==="XK");
const pop={}; fs.readFileSync(popCsv,"utf8").split("\n").forEach(l=>{ const m=l.match(/,([A-Z]{3}),2025,(\d+)/); if(m) pop[m[1]]=+m[2]; });
pop.TWN=23400000; // Taiwan is not in the World Bank/UN table; Ministry of the Interior figure, 2025
const out={f:{},cap:{},pop:{}};
for(const c of geo.c){ const w=by3[c.id]; if(!w){ console.error("no data",c.id); continue; }
  const svg=fs.readFileSync(`${nm}/flag-icons/flags/4x3/${w.cca2.toLowerCase()}.svg`,"utf8");
  out.f[c.id]=optimize(svg,{multipass:true,floatPrecision:2,plugins:["preset-default","prefixIds"]}).data.replaceAll("prefix__",c.id+"_");  // unique ids, so two flags on one page never clash
  out.cap[c.id]=(w.capital||[])[0]||""; if(pop[c.id]) out.pop[c.id]=pop[c.id]; }
fs.writeFileSync("games/flags.json",JSON.stringify(out)); console.error("flags",Object.keys(out.f).length,"pop",Object.keys(out.pop).length);
