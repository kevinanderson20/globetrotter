/* ================= GAME ICONS =================
   Each game gets its own app icon: a colored gradient tile with layered art on top (white, tinted and accent shapes),
   48×48, drawn by hand. The gradient sits on the svg itself, so no ids are shared between copies of an icon. */
const GICO=(a,b,art)=>`<svg class="gico" viewBox="0 0 48 48" aria-hidden="true" style="background:linear-gradient(160deg,${a},${b})">${art}</svg>`;
const GW="#fff", GW7="rgba(255,255,255,.72)", GW4="rgba(255,255,255,.42)", GW2="rgba(255,255,255,.22)", GSH="rgba(0,0,30,.18)";
const GLYPH_BASE={
  /* Mini crossword: a white grid with two black squares and a letter */
  mini:GICO("#5b9bff","#2b5fe0",`<rect x="10" y="11" width="28" height="28" rx="5" fill="${GSH}"/><rect x="10" y="9" width="28" height="28" rx="5" fill="${GW}"/>
    <path d="M19.3 9v28M28.7 9v28M10 18.3h28M10 27.7h28" stroke="#c9d6f5" stroke-width="1.4"/>
    <path d="M28.7 9H33a5 5 0 0 1 5 5v4.3h-9.3zM10 27.7h9.3V37H15a5 5 0 0 1-5-5z" fill="#1d2f6b"/>
    <text x="14.65" y="16.4" font-size="7.5" font-weight="800" text-anchor="middle" fill="#2b5fe0" font-family="-apple-system,system-ui,sans-serif">A</text>`),
  /* Connections: four colored tiles */
  groups:GICO("#a77dff","#6a3ce0",`<g fill="${GSH}"><rect x="9" y="11" width="14" height="14" rx="4"/><rect x="25" y="11" width="14" height="14" rx="4"/><rect x="9" y="27" width="14" height="14" rx="4"/><rect x="25" y="27" width="14" height="14" rx="4"/></g>
    <rect x="9" y="9" width="14" height="14" rx="4" fill="#ffd54a"/><rect x="25" y="9" width="14" height="14" rx="4" fill="#7ee08f"/><rect x="9" y="25" width="14" height="14" rx="4" fill="#78bcff"/><rect x="25" y="25" width="14" height="14" rx="4" fill="#ff93bd"/>`),
  /* Krillion: a gem sinking past bubbles */
  dive:GICO("#32c7ea","#0a63b0",`<circle cx="12" cy="13" r="2.4" fill="${GW4}"/><circle cx="16.5" cy="8.5" r="1.4" fill="${GW4}"/><circle cx="37" cy="36" r="1.8" fill="${GW4}"/>
    <path d="M17 13h14l6 8-13 16-13-16z" fill="${GW}"/><path d="M11 21h26L24 37z" fill="#bfeaff"/><path d="M17 13l3.5 8L24 13l3.5 8L31 13" fill="none" stroke="#8fd5f5" stroke-width="1.3" stroke-linejoin="round"/><path d="M20.5 21 24 37l3.5-16" fill="none" stroke="#8fd5f5" stroke-width="1.3"/>`),
  /* Reverse Krillion: peaks with a flag on the summit */
  climb:GICO("#ffb547","#f0601e",`<path d="M4 40 17 20l6 9 6-11 15 22z" fill="${GW7}"/><path d="M4 40 17 20l13 20z" fill="${GW}"/><path d="M17 20l-3.4 5.2 2 1.4 1.4-1.2 1.6 1.4 1.6-1.2z" fill="#ffd8a8"/>
    <path d="M29 18V7" stroke="${GW}" stroke-width="2" stroke-linecap="round"/><path d="M29.6 7.4h8l-2.2 3 2.2 3h-8z" fill="#c73c0c"/>`),
  /* Strands: letters joined into a snake */
  strands:GICO("#ffd75e","#f29c00",`<path d="M13 13h11v11h11v11" fill="none" stroke="${GW}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="13" cy="13" r="5" fill="${GW}"/><circle cx="24" cy="13" r="5" fill="${GW}"/><circle cx="24" cy="24" r="5" fill="${GW}"/><circle cx="35" cy="24" r="5" fill="${GW}"/><circle cx="35" cy="35" r="5" fill="#2f7bf5"/><circle cx="13" cy="35" r="4" fill="${GW4}"/>`),
  /* Worldle: a country outline on a faint grid */
  worldle:GICO("#3edc9c","#0b9467",`<path d="M8 16h32M8 24h32M8 32h32M16 8v32M24 8v32M32 8v32" stroke="${GW2}" stroke-width="1"/>
    <path d="M14 11.5l7.5 2.5 4-3 6.5 3.2 2.6 6.3-2.4 3.6 3.4 4.6-4.4 6.3-6.2-1-3.3 4.2-5-3.2-.8-6-4.3-3.4 1.5-6.4z" fill="${GSH}" stroke="${GSH}" stroke-width="2" stroke-linejoin="round" transform="translate(0 1.6)"/>
    <path d="M14 11.5l7.5 2.5 4-3 6.5 3.2 2.6 6.3-2.4 3.6 3.4 4.6-4.4 6.3-6.2-1-3.3 4.2-5-3.2-.8-6-4.3-3.4 1.5-6.4z" fill="${GW}" stroke="${GW}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="25" cy="24" r="2.2" fill="#0b9467"/>`),
  /* Travle: a dotted route between two pins */
  travle:GICO("#4fe3cf","#0b8c86",`<path d="M14 33c0-8 20-4 20-14" fill="none" stroke="${GW}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.1 5.4"/>
    <path d="M14 39s-6-6.2-6-10.4a6 6 0 0 1 12 0C20 32.8 14 39 14 39z" fill="${GW}"/><circle cx="14" cy="28.6" r="2.3" fill="#0b8c86"/>
    <path d="M34 25s-6-6.2-6-10.4a6 6 0 0 1 12 0C40 18.8 34 25 34 25z" fill="#ffe066"/><circle cx="34" cy="14.6" r="2.3" fill="#0b8c86"/>`),
  /* Globle: a globe with a hot spot */
  globle:GICO("#ff9a5c","#e2364f",`<circle cx="24" cy="25.6" r="15" fill="${GSH}"/><circle cx="24" cy="24" r="15" fill="${GW}"/>
    <g fill="none" stroke="#ffd2c6" stroke-width="1.4"><path d="M9 24h30"/><ellipse cx="24" cy="24" rx="6.5" ry="15"/><path d="M11 16.5h26M11 31.5h26"/></g>
    <circle cx="29" cy="29" r="9" fill="#ff6a3d" opacity=".18"/><circle cx="29" cy="29" r="6" fill="#ff6a3d" opacity=".32"/><circle cx="29" cy="29" r="3.4" fill="#f03d2a"/>`),
  /* Neighbors: countries that share borders */
  nbrs:GICO("#b4ec51","#4a9a0c",`<g stroke="#5aa816" stroke-width="1.6" stroke-linejoin="round"><path d="M8 9h15v11l-4 4H8z" fill="${GW}"/><path d="M23 9h17v13H29l-6-2z" fill="${GW7}"/>
    <path d="M19 24l4-4 6 2h11v17H19z" fill="${GW4}"/><path d="M8 24h11v15H8z" fill="${GW7}"/></g><circle cx="15" cy="16" r="2.4" fill="#4a9a0c"/>`),
  /* Flagle: a waving flag */
  flagle:GICO("#ff7b7b","#d42424",`<path d="M13 9v31" stroke="${GW}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M14 10c5-3 9 3 14 0s7-1 9 0v15c-2-1-4-3-9 0s-9-3-14 0z" fill="${GW}"/><path d="M14 18.2c5-3 9 3 14 0s7-1 9 0v-1c-2-1-4-3-9 0" fill="none"/>
    <path d="M14 15c5-3 9 3 14 0s7-1 9 0v5c-2-1-4-3-9 0s-9-3-14 0z" fill="#ffb4b4"/>`),
  /* Higher or Lower: one arrow up, one down */
  hilo:GICO("#69aefc","#2459e6",`<path d="M17 9l9 10h-5.5v18h-7V19H8z" fill="${GW}"/><path d="M31 39l-9-10h5.5V11h7v18H40z" fill="${GW4}"/>`),
  /* Queens: a gold crown on a board */
  queens:GICO("#c58cff","#8b2fe0",`<g fill="${GW2}"><rect x="8" y="8" width="16" height="16" rx="3"/><rect x="24" y="24" width="16" height="16" rx="3"/></g>
    <path d="M11 33l-2-14 8 6 7-11 7 11 8-6-2 14z" fill="#ffd54a"/><path d="M11 33h26v4H11z" fill="#f5b400"/><circle cx="24" cy="13" r="2.2" fill="#ffd54a"/><circle cx="9" cy="18.5" r="1.8" fill="#ffd54a"/><circle cx="39" cy="18.5" r="1.8" fill="#ffd54a"/>`),
  /* Timeline: cards placed along a line */
  timeline:GICO("#ffbe7a","#ea5a0c",`<path d="M6 30h36" stroke="${GW7}" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="7" y="13" width="10" height="12" rx="2.5" fill="${GW7}"/><rect x="19" y="9" width="10" height="16" rx="2.5" fill="${GW}"/><rect x="31" y="15" width="10" height="10" rx="2.5" fill="${GW7}"/>
    <circle cx="12" cy="30" r="3" fill="${GW}"/><circle cx="24" cy="30" r="3.4" fill="#fff3d6" stroke="${GW}" stroke-width="1.6"/><circle cx="36" cy="30" r="3" fill="${GW}"/><path d="M21.5 14h5M21.5 18h3.5" stroke="#ea5a0c" stroke-width="1.6" stroke-linecap="round"/>`),
  /* Minesweeper: a mine and a flag */
  mines:GICO("#9aa8bd","#3f4a5e",`<path d="M24 8v5M24 35v5M8 24h5M35 24h5M12.7 12.7l3.5 3.5M31.8 31.8l3.5 3.5M12.7 35.3l3.5-3.5M31.8 16.2l3.5-3.5" stroke="#141a26" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="24" cy="24" r="11" fill="#141a26"/><circle cx="20" cy="20" r="3.4" fill="${GW}" opacity=".9"/><circle cx="17.8" cy="25.5" r="1.2" fill="${GW}" opacity=".35"/>`),
  /* Map Tap: a pin dropped on a target */
  maptap:GICO("#ff86c3","#d0216f",`<ellipse cx="24" cy="36" rx="14" ry="5" fill="none" stroke="${GW4}" stroke-width="2"/><ellipse cx="24" cy="36" rx="7" ry="2.5" fill="none" stroke="${GW7}" stroke-width="2"/>
    <path d="M24 36s-9-9.5-9-16a9 9 0 0 1 18 0c0 6.5-9 16-9 16z" fill="${GW}"/><circle cx="24" cy="20" r="3.6" fill="#d0216f"/>`),
  /* Statele: a state shape with a star */
  statele:GICO("#7fb6ff","#1c47c9",`<path d="M12 10h12v9h12l2 3-1 8-6 5-3 5-4-4-4 1-3-6-6-2-1-4h1z" fill="${GSH}" transform="translate(0 1.5)"/><path d="M12 10h12v9h12l2 3-1 8-6 5-3 5-4-4-4 1-3-6-6-2-1-4h1z" fill="${GW}"/>
    <path d="M24 21.5l1.8 3.6 4 .6-2.9 2.8.7 4L24 30.6l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#ff4d4d"/>`),
  /* Daily sudoku: a 6×6 with digits */
  dsudoku:GICO("#45c9ff","#0369b0",`<rect x="9" y="10.5" width="30" height="30" rx="5" fill="${GSH}"/><rect x="9" y="9" width="30" height="30" rx="5" fill="${GW}"/>
    <path d="M19 9v30M29 9v30M9 19h30M9 29h30" stroke="#b8dcf2" stroke-width="1.3"/>
    <g font-family="-apple-system,system-ui,sans-serif" font-weight="800" font-size="8" text-anchor="middle" fill="#0369b0"><text x="14" y="17">3</text><text x="34" y="27">5</text><text x="24" y="37">1</text></g><rect x="20" y="20" width="8" height="8" rx="1.6" fill="#0369b0" opacity=".16"/>`),
  /* Sequence memory: lit tiles */
  seq:GICO("#ee86ff","#a11fbd",`<g fill="${GW2}">${[0,1,2].flatMap(r=>[0,1,2].map(c=>`<rect x="${9+c*10.5}" y="${9+r*10.5}" width="9" height="9" rx="2.4"/>`)).join("")}</g>
    <rect x="9" y="9" width="9" height="9" rx="2.4" fill="${GW}"/><rect x="19.5" y="19.5" width="9" height="9" rx="2.4" fill="${GW}"/><rect x="30" y="19.5" width="9" height="9" rx="2.4" fill="${GW7}"/><rect x="30" y="30" width="9" height="9" rx="2.4" fill="${GW}"/>`),
  /* Number memory */
  num:GICO("#b59cff","#6a2fe0",`<rect x="7" y="14" width="34" height="20" rx="6" fill="${GW}"/><text x="24" y="29.5" font-family="-apple-system,system-ui,sans-serif" font-weight="800" font-size="14" text-anchor="middle" fill="#6a2fe0" letter-spacing="1">123</text>
    <rect x="15" y="37" width="18" height="3" rx="1.5" fill="${GW4}"/>`),
  /* Card match: two cards, one face up */
  match:GICO("#ff7a95","#c3123d",`<rect x="8" y="12" width="17" height="24" rx="3.5" fill="${GW4}" transform="rotate(-10 16.5 24)"/>
    <rect x="21" y="11" width="18" height="26" rx="3.5" fill="${GW}" transform="rotate(6 30 24)"/><path d="M30 31s-5-3-5-6.6a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 3.6-5 6.6-5 6.6z" fill="#e8264f" transform="rotate(6 30 24)"/>`),
  /* Reaction time: a bolt */
  react:GICO("#ffe14a","#f0a000",`<path d="M27 6 12 27h10l-3 15 17-23H26z" fill="${GSH}" transform="translate(1 1.5)"/><path d="M27 6 12 27h10l-3 15 17-23H26z" fill="${GW}"/><path d="M27 6 12 27h10l4-21z" fill="#fff7c7"/>`),
  /* Color clash: overlapping inks */
  stroop:GICO("#3a4458","#141a26",`<g style="mix-blend-mode:screen"><circle cx="19" cy="19.5" r="9" fill="#ff3b5c"/><circle cx="29" cy="19.5" r="9" fill="#34d058"/><circle cx="24" cy="28.5" r="9" fill="#3b82ff"/></g>`),
  /* Number hunt: a target with numbers around */
  schulte:GICO("#5fe6ff","#0a8bb8",`<circle cx="24" cy="24" r="14" fill="${GW}"/><circle cx="24" cy="24" r="9.5" fill="#bdefff"/><circle cx="24" cy="24" r="5" fill="${GW}"/><circle cx="24" cy="24" r="2.2" fill="#0a8bb8"/>
    <path d="M36 12 26 22" stroke="#0a3d55" stroke-width="2.4" stroke-linecap="round"/><path d="M36 12l1-4M36 12l4-1" stroke="#0a3d55" stroke-width="2" stroke-linecap="round"/>`),
  /* Countdown: the four operators */
  count:GICO("#5ee38f","#109447",`<rect x="9" y="9" width="13" height="13" rx="3.5" fill="${GW}"/><rect x="26" y="9" width="13" height="13" rx="3.5" fill="${GW7}"/><rect x="9" y="26" width="13" height="13" rx="3.5" fill="${GW7}"/><rect x="26" y="26" width="13" height="13" rx="3.5" fill="${GW}"/>
    <path d="M12.5 15.5h6M15.5 12.5v6M29.5 15.5h6M12.8 29.8l5.4 5.4M18.2 29.8l-5.4 5.4M29.5 32.5h6" stroke="#109447" stroke-width="2.2" stroke-linecap="round"/><circle cx="32.5" cy="29.6" r="1.2" fill="#109447"/><circle cx="32.5" cy="35.4" r="1.2" fill="#109447"/>`),
  /* Mini sudoku */
  sudoku:GICO("#9aa6ff","#4136d6",`<rect x="9" y="10.5" width="30" height="30" rx="5" fill="${GSH}"/><rect x="9" y="9" width="30" height="30" rx="5" fill="${GW}"/>
    <path d="M24 9v30M9 19h30M9 29h30" stroke="#c5c9f5" stroke-width="1.3"/><path d="M16.5 9v30M31.5 9v30" stroke="#e4e6fb" stroke-width="1"/>
    <g font-family="-apple-system,system-ui,sans-serif" font-weight="800" font-size="7.5" text-anchor="middle" fill="#4136d6"><text x="12.8" y="16.8">6</text><text x="28" y="26.8">2</text><text x="20.2" y="36.8">4</text><text x="35.2" y="36.8">1</text></g>`),
  /* Lights out: a glowing bulb on a dark tile */
  lights:GICO("#334160","#0e1424",`<circle cx="24" cy="20" r="13" fill="#ffd54a" opacity=".18"/><circle cx="24" cy="20" r="9.5" fill="#ffd54a" opacity=".25"/>
    <path d="M24 10a8 8 0 0 0-4.8 14.4c.8.6 1.3 1.6 1.3 2.6V29h7v-2c0-1 .5-2 1.3-2.6A8 8 0 0 0 24 10z" fill="#ffe27a"/><path d="M20.5 32h7M21.5 35.5h5" stroke="#cdd6e8" stroke-width="2.2" stroke-linecap="round"/><path d="M21 15.5a4 4 0 0 1 3-1.8" stroke="${GW}" stroke-width="1.8" stroke-linecap="round" fill="none"/>`)
};
/* unlimited versions share their daily game's icon (the row adds an infinity badge) */
const GLYPH=Object.assign({},GLYPH_BASE,{strandsu:GLYPH_BASE.strands,worldleu:GLYPH_BASE.worldle,travleu:GLYPH_BASE.travle,globleu:GLYPH_BASE.globle,nbrsu:GLYPH_BASE.nbrs,flagleu:GLYPH_BASE.flagle,hilou:GLYPH_BASE.hilo,queensu:GLYPH_BASE.queens,timelineu:GLYPH_BASE.timeline,msu:GLYPH_BASE.mines,maptapu:GLYPH_BASE.maptap,stateleu:GLYPH_BASE.statele,diveu:GLYPH_BASE.dive,climbu:GLYPH_BASE.climb});
