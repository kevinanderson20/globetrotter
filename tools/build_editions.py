"""Builds the USA and Earth editions from the World edition's index.html.

All three editions run the same app code. Each edition swaps in its own data:
  usa/    the 50 states. Census regions stand in for continents, Census divisions for regions.
  earth/  oceans & seas, rivers, mountains & peaks, deserts & regions (Natural Earth 1:50m).
Run from the repo root after changing index.html:  python3 tools/build_editions.py
"""
import re, os

SRC = open('index.html', encoding='utf-8').read()


def sub_json(s, el_id, payload):
    tag = f'<script type="application/json" id="{el_id}">'
    a = s.index(tag) + len(tag); b = s.index('</script>', a)
    return s[:a] + payload + s[b:]


def rep(text, a, b, n=None):
    c = text.count(a)
    assert c >= 1 and (n is None or c == n), (a[:70], c)
    return text.replace(a, b)


def swap_block(app, start, end_marker, new):
    a = app.index(start); b = app.index(end_marker, a)
    return app[:a] + new + app[b:]


def build(folder, title, tabs, data_map, data_meta, conts, alias, ls_key, open_key, all_key,
          backup, seed, share, unit, units, region_word, extra_head=(), extra_app=()):
    s = SRC
    for el in ("hi", "lo"):
        s = sub_json(s, el, data_map)
    s = sub_json(s, "meta", data_meta)
    k = s.rindex('<script>'); head, app = s[:k], s[k:]   # never touch the d3 library text
    # page shell
    head = rep(head, '<title>Globetrotter</title>', f'<title>{title}</title>', 1)
    for icon in ('icon-180.png', 'icon-192.png', 'manifest.webmanifest'):
        head = rep(head, f'href="{icon}"', f'href="../{icon}"', 1)
    head = rep(head, '<a href="./" aria-current="page">World</a><a href="usa/">USA</a><a href="earth/">Earth</a>', tabs, 1)
    head = rep(head, 'Every country in a region', f'Every {unit} in a {region_word}', 1)
    for a, b in extra_head:
        head = rep(head, a, b)
    # data and settings
    app = swap_block(app, 'const CONTS=[', '/* how this edition paints', conts)
    app = swap_block(app, 'const ALIAS={', 'const NAMEKEYS', alias)
    app = rep(app, 'const LS="globetrotter.v1";', f'const LS="{ls_key}";', 1)
    app = rep(app, 'open:"North America"', f'open:"{open_key}"')
    app = rep(app, '"World"', f'"{all_key}"')
    app = rep(app, '"GLOBE1:"', f'"{backup}:"')
    app = rep(app, '/^GLOBE1:/', f'/^{backup}:/')
    app = rep(app, 'including GLOBE1: at', f'including {backup}: at')
    app = rep(app, '"globetrotter-"+key', f'"{seed}"+key', 1)
    app = rep(app, '`Globetrotter ${practice?', f'`{share} ${{practice?', 1)
    app = rep(app, 'navigator.serviceWorker.register("sw.js")', 'navigator.serviceWorker.register("../sw.js")', 1)
    for a, b in extra_app:
        app = b(app) if callable(b) else rep(app, a, b)
    # words
    app = rep(app, 'countr${up.length===1?"y":"ies"}', f'{unit}${{up.length===1?"":"s"}}', 1)
    app = app.replace(' countries', ' ' + units).replace(' country', ' ' + unit)
    app = app.replace(' a continent', f' a {region_word}').replace('How well you know the world', f'How well you know the {units}')
    os.makedirs(folder, exist_ok=True)
    out = head + app
    open(f'{folder}/index.html', 'w', encoding='utf-8').write(out)
    print(f'{folder}/index.html', len(out))


def tighten_frames(app):  # states are small: shrink the minimum zoom spans used when framing
    return re.sub(r'(frame(?:Ids|Features)\([^;]*?),\s*([\d.]+)\s*,\s*([\d.]+)\)',
                  lambda m: f'{m.group(1)},{m.group(2)},{max(3, round(float(m.group(3)) / 3))})', app)


# ---------------- USA ----------------
build('usa', 'Globetrotter USA',
      '<a href="../">World</a><a href="./" aria-current="page">USA</a><a href="../earth/">Earth</a>',
      open('tools/us-map.json').read(), open('tools/us-meta.json').read(),
      '''const CONTS=[
  {key:"West",short:"W",tok:"c-sa",groups:[["Pacific",["Pacific"]],["Mountain West",["Mountain West"]]]},
  {key:"Midwest",short:"MW",tok:"c-na",groups:[["Great Lakes",["Great Lakes"]],["Great Plains",["Great Plains"]]]},
  {key:"South",short:"S",tok:"c-af",groups:[["South Central",["South Central"]],["Deep South",["Deep South"]],["South Atlantic",["South Atlantic"]]]},
  {key:"Northeast",short:"NE",tok:"c-eu",groups:[["Mid-Atlantic",["Mid-Atlantic"]],["New England",["New England"]]]}
];
''', 'const ALIAS={WA:["washingtonstate"],NY:["newyorkstate"]};\n',
      'globetrotter.usa.v1', 'West', 'All 50', 'GLOBEUSA1', 'globetrotter-usa-', 'Globetrotter USA',
      'state', 'states', 'region',
      extra_head=[('aria-label="World map"', 'aria-label="Map of the United States"'),
                  ('#mmap{width:100%;aspect-ratio:2.05/1;', '#mmap{width:100%;aspect-ratio:1.6/1;')],
      extra_app=[('const worldFrame=()=>({lon:11,lat:8,s:worldScale});', 'const worldFrame=()=>frameIds(IDS.filter(i=>i!=="AK"&&i!=="HI"),1.04,10);'),
                 ('scaleExtent([.6,80])', 'scaleExtent([.2,80])'),
                 ('AREA[id]*6371*6371<3000', 'AREA[id]*6371*6371<4000'),
                 ('Math.exp(-mi/900)', 'Math.exp(-mi/250)'),
                 ("No land borders. It's surrounded by water.", "It doesn't border any other state."),
                 ('const mProj=d3.geoEqualEarth().rotate([-11,0]);', 'const mProj=d3.geoAlbersUsa();'),
                 ('const h=Math.round(w/2.05);', 'const h=Math.round(w/1.6);'),
                 ('mProj.fitExtent([[3,3],[w-3,h-3]],sphere); const pp=d3.geoPath(mProj,g);', 'mProj.fitExtent([[6,6],[w-6,h-6]],{type:"FeatureCollection",features:IDS.map(id=>F.lo[id])}); const pp=d3.geoPath(mProj,g);'),
                 ('g.beginPath(); pp(sphere); g.fillStyle=css.sea; g.fill();\n  g.beginPath(); OTHER.lo.forEach(f=>pp(f)); g.fillStyle=css["land-off"]; g.fill();', 'g.fillStyle=css.sea; g.fillRect(0,0,w,h);'),
                 (None, tighten_frames)])

# ---------------- Earth ----------------
build('earth', 'Globetrotter Earth',
      '<a href="../">World</a><a href="../usa/">USA</a><a href="./" aria-current="page">Earth</a>',
      open('tools/earth-map.json').read(), open('tools/earth-meta.json').read(),
      '''const CONTS=[
  {key:"Oceans & Seas",short:"OS",tok:"c-eu",groups:[["Oceans",["Oceans"]],["Seas around Europe",["Around Europe"]],["Seas around the Americas",["Around the Americas"]],["Seas around Asia",["Around Asia"]],["Seas of Africa, Arabia & Oceania",["Africa, Arabia & Oceania"]]]},
  {key:"Rivers",short:"RV",tok:"c-oc",groups:[["Rivers of Africa",["Africa"]],["Rivers of the Americas",["The Americas"]],["Rivers of Asia",["Asia"]],["Rivers of Europe & Oceania",["Europe & Oceania"]]]},
  {key:"Mountains",short:"MT",tok:"c-sa",groups:[["Ranges of Asia",["Ranges of Asia"]],["Ranges of Europe",["Ranges of Europe"]],["Ranges of the Americas",["Ranges of the Americas"]],["Ranges of Africa, Oceania & Antarctica",["Ranges of Africa, Oceania & Antarctica"]],["Famous peaks",["Famous peaks"]]]},
  {key:"Deserts & Regions",short:"DR",tok:"c-af",groups:[["Deserts",["Deserts"]],["Plains, plateaus & basins",["Plains, plateaus & basins"]],["Peninsulas & regions",["Peninsulas & regions"]]]}
];
''', 'const ALIAS={};\n',
      'globetrotter.earth.v1', 'Oceans & Seas', 'Everything', 'GLOBEEARTH1', 'globetrotter-earth-', 'Globetrotter Earth',
      'place', 'places', 'category',
      extra_head=[('aria-label="World map"', 'aria-label="Map of the Earth"'),
                  ('<button class="tile" id="nbBtn">', '<button class="tile" id="nbBtn" hidden>'),
                  ('.trio{grid-template-columns:repeat(3,1fr);gap:8px}', '.trio{grid-template-columns:repeat(2,1fr);gap:8px}')],
      extra_app=[('const ED={base:()=>null, under:()=>false, otherFill:"land-off"};',
                  'const ED={base:id=>KIND[id]==="line"?["base",.55]:KIND[id]==="point"?null:"skip", under:id=>BY[id].c==="Oceans & Seas", otherFill:"land"};'),
                 ('Which country is glowing?', 'Which place is highlighted?')])
