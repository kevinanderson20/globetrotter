// Builds the USA edition's map + state data: 50 states (Census 1:10m via us-atlas), neighbors from shared borders,
// Census regions/divisions, and the rest of the world as context land.
const fs=require('fs');
const {feature,neighbors,merge}=require('topojson-client');
const {topology}=require('topojson-server');
const S=require('./node_modules/us-atlas/states-10m.json');
const WL=JSON.parse(fs.readFileSync('world-lo.json'));
const FIPS={"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"};
const DIV={"New England":["CT","ME","MA","NH","RI","VT"],"Mid-Atlantic":["NJ","NY","PA"],"Great Lakes":["IL","IN","MI","OH","WI"],"Great Plains":["IA","KS","MN","MO","NE","ND","SD"],
 "South Atlantic":["DE","MD","VA","WV","NC","SC","GA","FL"],"Deep South":["KY","TN","MS","AL"],"South Central":["AR","LA","OK","TX"],"Mountain West":["AZ","CO","ID","MT","NV","NM","UT","WY"],"Pacific":["AK","CA","HI","OR","WA"]};
const REG={"Northeast":["New England","Mid-Atlantic"],"Midwest":["Great Lakes","Great Plains"],"South":["South Atlantic","Deep South","South Central"],"West":["Mountain West","Pacific"]};
const divOf={}, regOf={}; for(const [d,l] of Object.entries(DIV)) l.forEach(s=>divOf[s]=d); for(const [r,l] of Object.entries(REG)) l.forEach(d=>DIV[d].forEach(s=>regOf[s]=r));
const G=S.objects.states.geometries, nb=neighbors(G);
const meta=[], feats=[], others=[];
G.forEach((g,i)=>{ const id=FIPS[g.id]; const f=feature(S,g);
  if(!id){ others.push({type:"Feature",properties:{},geometry:f.geometry}); return; }
  feats.push({type:"Feature",id,properties:{},geometry:f.geometry});
  meta.push({id,n:g.properties.name,c:regOf[id],s:divOf[id],b:nb[i].map(j=>FIPS[G[j].id]).filter(Boolean)});
});
// rest of the world (context): every world country except the USA, plus the world's "other" land
const wc=feature(WL,WL.objects.countries).features.filter(f=>f.id!=="USA"), wo=feature(WL,WL.objects.other).features;
[...wc,...wo].forEach(f=>others.push({type:"Feature",properties:{},geometry:f.geometry}));
const t=topology({countries:{type:"FeatureCollection",features:feats},other:{type:"FeatureCollection",features:others}},1e5);
fs.writeFileSync('us-map.json',JSON.stringify(t)); fs.writeFileSync('us-meta.json',JSON.stringify(meta));
console.log(meta.length, fs.statSync('us-map.json').size);
console.log(meta.filter(m=>['AK','HI','MI','CO','ME','TN','MO'].includes(m.id)).map(m=>m.id+':'+m.b.join('/')).join('  '));
