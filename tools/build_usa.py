"""Builds usa/index.html (Globetrotter USA) from the World edition's index.html.

The USA edition runs the same app code with the 50 states as its data:
Census regions play the part of continents and Census divisions the part of regions.
Run from the repo root after changing index.html:  python3 tools/build_usa.py
"""
import json, re, os
src = open('index.html', encoding='utf-8').read()
us_map = open('tools/us-map.json', encoding='utf-8').read()
us_meta = open('tools/us-meta.json', encoding='utf-8').read()

def sub_json(s, el_id, payload):
    a = s.index(f'<script type="application/json" id="{el_id}">') + len(f'<script type="application/json" id="{el_id}">')
    b = s.index('</script>', a)
    return s[:a] + payload + s[b:]

s = src
for el in ("hi", "lo"):
    s = sub_json(s, el, us_map)
s = sub_json(s, "meta", us_meta)

# Split into head+HTML, libraries, and the app script (the last <script>), so text swaps never touch d3.
k = s.rindex('<script>'); head, app = s[:k], s[k:]

def rep(text, a, b, n=None):
    c = text.count(a)
    assert c >= 1 and (n is None or c == n), (a[:60], c)
    return text.replace(a, b)

# ---------- page shell ----------
head = rep(head, '<title>Globetrotter</title>', '<title>Globetrotter USA</title>', 1)
head = rep(head, 'href="icon-180.png"', 'href="../icon-180.png"', 1)
head = rep(head, 'href="icon-192.png"', 'href="../icon-192.png"', 1)
head = rep(head, 'href="manifest.webmanifest"', 'href="../manifest.webmanifest"', 1)
head = rep(head, '<a href="./" aria-current="page">World</a><a href="usa/">USA</a>', '<a href="../">World</a><a href="./" aria-current="page">USA</a>', 1)
head = rep(head, 'Every country in a region', 'Every state in a region', 1)
head = rep(head, 'aria-label="World map"', 'aria-label="Map of the United States"', 1)
head = rep(head, '#mmap{width:100%;aspect-ratio:2.05/1;', '#mmap{width:100%;aspect-ratio:1.6/1;', 1)

# ---------- data and settings ----------
a = app.index('const CONTS=['); b = app.index('const CONT=', a)
app = app[:a] + '''const CONTS=[
  {key:"West",short:"W",tok:"c-sa",groups:[["Pacific",["Pacific"]],["Mountain West",["Mountain West"]]]},
  {key:"Midwest",short:"MW",tok:"c-na",groups:[["Great Lakes",["Great Lakes"]],["Great Plains",["Great Plains"]]]},
  {key:"South",short:"S",tok:"c-af",groups:[["South Central",["South Central"]],["Deep South",["Deep South"]],["South Atlantic",["South Atlantic"]]]},
  {key:"Northeast",short:"NE",tok:"c-eu",groups:[["Mid-Atlantic",["Mid-Atlantic"]],["New England",["New England"]]]}
];
''' + app[b:]
a = app.index('const ALIAS={'); b = app.index('const NAMEKEYS', a)
app = app[:a] + 'const ALIAS={WA:["washingtonstate"],NY:["newyorkstate"]};\n' + app[b:]
app = rep(app, 'const LS="globetrotter.v1";', 'const LS="globetrotter.usa.v1";', 1)
app = rep(app, 'open:"North America"', 'open:"West"')
app = rep(app, '"World"', '"All 50"')
app = rep(app, 'const worldFrame=()=>({lon:11,lat:8,s:worldScale});', 'const worldFrame=()=>frameIds(IDS.filter(i=>i!=="AK"&&i!=="HI"),1.04,10);', 1)
app = rep(app, 'scaleExtent([.6,80])', 'scaleExtent([.2,80])', 1)
app = rep(app, 'AREA[id]*6371*6371<3000', 'AREA[id]*6371*6371<4000', 1)
app = rep(app, 'Math.exp(-mi/900)', 'Math.exp(-mi/250)', 1)
app = rep(app, '"globetrotter-"+key', '"globetrotter-usa-"+key', 1)
app = rep(app, '`Globetrotter ${practice?', '`Globetrotter USA ${practice?', 1)
app = rep(app, "No land borders. It's surrounded by water.", "It doesn't border any other state.", 1)
app = rep(app, '"GLOBE1:"', '"GLOBEUSA1:"'); app = rep(app, '/^GLOBE1:/', '/^GLOBEUSA1:/'); app = rep(app, 'including GLOBE1: at', 'including GLOBEUSA1: at')
app = rep(app, 'navigator.serviceWorker.register("sw.js")', 'navigator.serviceWorker.register("../sw.js")', 1)
# home mastery map: Albers USA with Alaska and Hawaii insets
app = rep(app, 'const mProj=d3.geoEqualEarth().rotate([-11,0]);', 'const mProj=d3.geoAlbersUsa();', 1)
app = rep(app, 'const h=Math.round(w/2.05);', 'const h=Math.round(w/1.6);', 1)
app = rep(app, 'mProj.fitExtent([[3,3],[w-3,h-3]],sphere); const pp=d3.geoPath(mProj,g);', 'mProj.fitExtent([[6,6],[w-6,h-6]],{type:"FeatureCollection",features:IDS.map(id=>F.lo[id])}); const pp=d3.geoPath(mProj,g);', 1)
app = rep(app, 'g.beginPath(); pp(sphere); g.fillStyle=css.sea; g.fill();\n  g.beginPath(); OTHER.lo.forEach(f=>pp(f)); g.fillStyle=css["land-off"]; g.fill();', 'g.fillStyle=css.sea; g.fillRect(0,0,w,h);', 1)
# states are small: tighten the minimum zoom spans used when framing
def tighten(m):
    return f'{m.group(1)},{m.group(2)},{max(3, round(float(m.group(3)) / 3))})'
app = re.sub(r'(frame(?:Ids|Features)\([^;]*?),\s*([\d.]+)\s*,\s*([\d.]+)\)', tighten, app)

# ---------- words ----------
app = rep(app, 'countr${up.length===1?"y":"ies"}', 'state${up.length===1?"":"s"}', 1)
app = rep(app, 'countr${due===1?"y":"ies"}', 'state${due===1?"":"s"}') if 'countr${due===1' in app else app
app = app.replace(' countries', ' states').replace(' country', ' state').replace('>New state', '>New state')
app = app.replace(' a continent', ' a region').replace('How well you know the world', 'How well you know the states')

out = head + app
os.makedirs('usa', exist_ok=True)
open('usa/index.html', 'w', encoding='utf-8').write(out)
print('usa/index.html', len(out))
