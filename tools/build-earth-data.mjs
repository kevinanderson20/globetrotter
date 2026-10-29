// Builds the Earth edition's data from Natural Earth 1:50m physical layers (public domain):
// oceans & seas, rivers, mountain ranges + peaks, deserts & regions. World countries are the backdrop.
import fs from "fs"; import * as d3 from "d3"; import {feature} from "topojson-client"; import {topology} from "topojson-server";
const NE=process.argv[2], OUT=process.argv[3];
const rd=f=>JSON.parse(fs.readFileSync(`${NE}/${f}.geojson`)).features;
const marine=rd("ne_50m_geography_marine_polys"), rivers=rd("ne_50m_rivers_lake_centerlines"), regions=rd("ne_50m_geography_regions_polys"), peaks=rd("ne_50m_geography_regions_elevation_points");
const WL=JSON.parse(fs.readFileSync("world-lo.json")), WM=JSON.parse(fs.readFileSync("meta.json"));
const wfeat=feature(WL,WL.objects.countries).features, contOf=Object.fromEntries(WM.map(m=>[m.id,m.c]));
const slug=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function continentAt(geom){ // continent of the land under (or nearest to) the feature's middle
  const c=d3.geoCentroid({type:"Feature",geometry:geom});
  const fix=(id)=>id==="RUS"&&c[0]>60?"Asia":contOf[id]; // Siberia is in Asia even though Russia counts as Europe
  let hit=wfeat.find(f=>d3.geoContains(f,c)); if(hit) return fix(hit.id);
  let best=null,bd=1e9; wfeat.forEach(f=>{ const d=d3.geoDistance(c,d3.geoCentroid(f)); if(d<bd){bd=d;best=f;} }); return fix(best.id);
}
const CONT_NAME=c=>c==="North America"||c==="South America"?c:c;
const items=[]; const add=(o)=>items.push(o);
const combine=(fs_)=>{ const polys=[], lines=[], pts=[];
  fs_.forEach(f=>{ const g=f.geometry; if(!g) return;
    if(g.type==="Polygon") polys.push(g.coordinates); else if(g.type==="MultiPolygon") polys.push(...g.coordinates);
    else if(g.type==="LineString") lines.push(g.coordinates); else if(g.type==="MultiLineString") lines.push(...g.coordinates);
    else if(g.type==="Point") pts.push(g.coordinates); });
  if(polys.length) return {type:"MultiPolygon",coordinates:polys};
  if(lines.length) return {type:"MultiLineString",coordinates:lines};
  return {type:"Point",coordinates:pts[0]}; };
const missing=[];

// ---- oceans & seas ----
const SEAS={"Oceans":["Pacific Ocean","Atlantic Ocean","Indian Ocean","Arctic Ocean","Southern Ocean"],
 "Around Europe":["Mediterranean Sea","North Sea","Baltic Sea","Black Sea","Caspian Sea","Adriatic Sea","Aegean Sea","Bay of Biscay","English Channel","Norwegian Sea","Barents Sea"],
 "Around the Americas":["Caribbean Sea","Gulf of Mexico","Hudson Bay","Gulf of Alaska","Gulf of California","Beaufort Sea","Labrador Sea","Bering Sea"],
 "Around Asia":["South China Sea","East China Sea","Sea of Japan","Yellow Sea","Philippine Sea","Sea of Okhotsk","Java Sea","Bay of Bengal","Andaman Sea"],
 "Africa, Arabia & Oceania":["Arabian Sea","Red Sea","Persian Gulf","Gulf of Aden","Gulf of Guinea","Mozambique Channel","Coral Sea","Tasman Sea","Timor Sea"]};
for(const [grp,names] of Object.entries(SEAS)) for(const n of names){
  const fs_=marine.filter(f=>(f.properties.name_en||f.properties.name)===n); if(!fs_.length){ missing.push(n); continue; }
  const geom=combine(fs_), cla=fs_[0].properties.featurecla, typ=cla[0].toUpperCase()+cla.slice(1);
  add({id:slug(n),n,c:"Oceans & Seas",s:grp,d:grp==="Oceans"?"Ocean":`${typ} · ${grp.replace("Around","around")}`,q:"the "+n,w:d3.geoArea({type:"Feature",geometry:geom}),geom});
}
// ---- rivers ----
const RIV=[["Nile River",["Nile","White Nile","Albert Nile","Mountain Nile","Victoria Nile"]],["Blue Nile",["Blue Nile","Abay"]],["Congo River",["Congo","Lualaba"]],["Niger River",["Niger"]],["Zambezi River",["Zambezi"]],["Orange River",["Orange"]],["Limpopo River",["Limpopo"]],
 ["Amazon River",["Amazonas"]],["Paraná River",["Paraná"]],["Orinoco River",["Orinoco"]],["Mississippi River",["Mississippi"]],["Missouri River",["Missouri"]],["Ohio River",["Ohio"]],["Rio Grande",["Rio Grande"]],["St. Lawrence River",["St. Lawrence"]],["Mackenzie River",["Mackenzie"]],["Yukon River",["Yukon"]],["Columbia River",["Columbia"]],
 ["Yangtze River",["Yangtze","Tongtian"]],["Yellow River",["Huang","Yellow"]],["Mekong River",["Mekong","Za"]],["Ganges River",["Ganges"]],["Indus River",["Indus","Shiquan"]],["Brahmaputra River",["Brahmaputra","Dihang"]],["Ob River",["Ob"]],["Yenisei River",["Yenisey"]],["Lena River",["Lena"]],["Amur River",["Amur"]],["Tigris River",["Tigris","Dicle"]],["Euphrates River",["Euphrates","Al Furat","Firat"]],["Irrawaddy River",["Ayeyarwady"]],
 ["Danube River",["Danube"]],["Rhine River",["Rhine","Rhein"]],["Volga River",["Volga"]],["Dnieper River",["Dnieper","Dnepre"]],["Seine River",["Seine"]],["Thames River",["Thames"]],["Loire River",["Loire"]],["Elbe River",["Elbe"]],["Po River",["Po"]],["Murray River",["Murray"]],["Darling River",["Darling","Barwon"]]];
for(const [n,src,flt] of RIV){
  let fs_=rivers.filter(f=>src.includes(f.properties.name_en||f.properties.name)&&f.properties.featurecla==="River"); if(flt) fs_=fs_.filter(flt);
  if(!fs_.length){ missing.push(n); continue; }
  const geom=combine(fs_), cont=continentAt(geom);
  add({id:slug(n),n,c:"Rivers",s:cont==="Oceania"||cont==="Europe"?"Europe & Oceania":/America/.test(cont)?"The Americas":cont,d:`River · ${cont}`,q:"the "+n,w:d3.geoLength({type:"Feature",geometry:geom}),geom});
}
// ---- mountains ----
const RANGES=[["Himalayas"],["Karakoram"],["Hindu Kush"],["Tian Shan"],["Kunlun Mountains"],["Altai Mountains"],["Zagros Mountains"],["Western Ghats"],
 ["Alps"],["Pyrenees"],["Carpathian Mountains"],["Caucasus Mountains"],["Ural Mountains"],["Scandinavian Mountains"],["Dinaric Alps"],["Balkan Mountains"],
 ["Rocky Mountains"],["Andes"],["Appalachian Mountains"],["Sierra Nevada",f=>d3.geoCentroid(f)[0]<-100],["Cascade Range"],["Alaska Range"],["Sierra Madre Occidental"],["Sierra Madre Oriental"],["Brooks Range"],
 ["Atlas Mountains"],["Ethiopian Highlands"],["Drakensberg"],["Great Dividing Range"],["Southern Alps/Kā Tiritiri o te Moana","Southern Alps"],["Transantarctic Mountains"]];
for(const [src,disp] of RANGES.map(r=>[r[0],typeof r[1]==="string"?r[1]:r[0],typeof r[1]==="function"?r[1]:r[2]].slice(0,2).concat([typeof r[1]==="function"?r[1]:null]))){}
for(const r of RANGES){
  const src=r[0], disp=typeof r[1]==="string"?r[1]:src, flt=typeof r[1]==="function"?r[1]:null;
  let fs_=regions.filter(f=>(f.properties.NAME_EN||f.properties.NAME)===src&&f.properties.FEATURECLA==="Range/mtn"); if(flt) fs_=fs_.filter(flt);
  if(!fs_.length){ missing.push(src); continue; }
  const geom=combine(fs_); let cont=continentAt(geom); if(src==="Transantarctic Mountains") cont="Antarctica";
  const grp= cont==="Asia"?"Ranges of Asia": cont==="Europe"?"Ranges of Europe": (cont==="North America"||cont==="South America")?"Ranges of the Americas":"Ranges of Africa, Oceania & Antarctica";
  add({id:slug(disp),n:disp,c:"Mountains",s:grp,d:`Mountain range · ${cont}`,q:/s$/.test(disp)||disp==="Karakoram"||disp==="Hindu Kush"||disp==="Tian Shan"?"the "+disp:"the "+disp,w:d3.geoArea({type:"Feature",geometry:geom}),geom});
}
const PEAKS=[["Mount Everest"],["K2"],["Cerro Aconcagua","Aconcagua"],["Denali"],["Mount Kilimanjaro"],["Gora Elbrus","Mount Elbrus"],["Mont Blanc"],["Mount Kenya"],["Vinson Massif"],["Puncak Jaya"],["Mount Kosciuszko"],["Mount Whitney"],["Chimborazo"],["Mount Elbert"],["Mount Washington"],["Jebel Toubkal","Toubkal"],["Gunung Kinabalu","Mount Kinabalu"],["Mount Hood"],["Mount Shasta"],["Grand Teton"]];
PEAKS.forEach(([src,disp],i)=>{ disp=disp||src; const f=peaks.find(x=>x.properties.name===src); if(!f){ missing.push(src); return; }
  const cont=src==="Vinson Massif"?"Antarctica":continentAt(f.geometry), el=f.properties.elevation;
  add({id:slug(disp),n:disp,c:"Mountains",s:"Famous peaks",d:`Mountain peak · ${cont}`,q:disp,w:el,geom:f.geometry}); });
// ---- deserts & regions ----
const DR={"Deserts":["Sahara","Rub' al Khali|Rub' al Khali (Empty Quarter)","Gobi Desert","Kalahari Desert","Namib|Namib Desert","Atacama Desert","Great Victoria Desert","Great Sandy Desert","Thar Desert","Taklamakan|Taklamakan Desert","Karakum Desert","Syrian Desert","Sonoran Desert","Chihuahuan Desert","Libyan Desert"],
 "Plains, plateaus & basins":["Great Plains","Pampas","Sahel","Kazakh Steppe","North European Plain","Tibetan Plateau","Deccan Plateau","Altiplano","Colorado Plateau","Amazon basin|Amazon Basin","Congo basin|Congo Basin","Great Basin","Great Rift Valley","Gran Chaco","Llanos"],
 "Peninsulas & regions":["Scandinavia","Balkans","Iberian Peninsula","Arabian Peninsula","Indian subcontinent|Indian Subcontinent","Korean Peninsula","Malay Peninsula","Yucatan Peninsula|Yucatán Peninsula","Kamchatka Peninsula","horn of Africa|Horn of Africa","Baja California Peninsula","Anatolia","Siberia","Patagonia","Mesopotamia","Lapland","Crimean Peninsula|Crimea"]};
const NOART=new Set(["Scandinavia","Anatolia","Siberia","Patagonia","Mesopotamia","Lapland","Crimea"]);
const KIND_WORD={"Desert":"Desert","Plain":"Plain","Plateau":"Plateau","Basin":"Basin","Valley":"Valley","Lowland":"Lowland","Pen/cape":"Peninsula","Peninsula":"Peninsula","Geoarea":"Region"};
for(const [grp,names] of Object.entries(DR)) for(const spec of names){
  const [src,disp0]=spec.split("|"), disp=disp0||src;
  const fs_=regions.filter(f=>(f.properties.NAME_EN||f.properties.NAME)===src); if(!fs_.length){ missing.push(src); continue; }
  const geom=combine(fs_), cont=continentAt(geom), cla=fs_[0].properties.FEATURECLA;
  let word=KIND_WORD[cla]||"Region"; if(/Peninsula/.test(disp)) word="Peninsula"; if(["Scandinavia","Balkans","Indian Subcontinent","Horn of Africa"].includes(disp)) word="Region"; if(disp==="Great Plains"||disp==="Pampas"||disp==="Llanos"||disp==="Kazakh Steppe") word=disp==="Kazakh Steppe"?"Steppe":"Grassland plain";
  add({id:slug(disp),n:disp,c:"Deserts & Regions",s:grp,d:`${word} · ${cont}`,q:NOART.has(disp)?disp:"the "+disp,w:d3.geoArea({type:"Feature",geometry:geom}),geom});
}
// ---- write ----
const feats=items.map(o=>({type:"Feature",id:o.id,properties:{},geometry:o.geom}));
const others=wfeat.map(f=>({type:"Feature",properties:{},geometry:f.geometry})).concat(feature(WL,WL.objects.other).features.map(f=>({type:"Feature",properties:{},geometry:f.geometry})));
const t=topology({countries:{type:"FeatureCollection",features:feats},other:{type:"FeatureCollection",features:others}},1e5);
fs.writeFileSync(`${OUT}/earth-map.json`,JSON.stringify(t));
fs.writeFileSync(`${OUT}/earth-meta.json`,JSON.stringify(items.map(({geom,...m})=>({...m,b:[],w:+m.w.toFixed(6)}))));
const cnt={}; items.forEach(o=>cnt[o.c+" / "+o.s]=(cnt[o.c+" / "+o.s]||0)+1);
console.log(items.length,"items", fs.statSync(`${OUT}/earth-map.json`).size,"bytes"); console.log(cnt); console.log("missing:",missing);
console.log(items.filter(o=>o.c==="Rivers").map(o=>o.n+"→"+o.s).join(", "));
