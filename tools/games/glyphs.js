/* ================= GAME ICONS: one line glyph per game, drawn on the game's color ================= */
const GL=(p,extra="")=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${p}</svg>`;
const GLYPH_BASE={
  mini:GL('<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"/><rect x="14.7" y="4" width="5.3" height="5.3" fill="currentColor" stroke="none"/><rect x="4" y="14.7" width="5.3" height="5.3" fill="currentColor" stroke="none"/>'),
  groups:GL('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
  dive:GL('<path d="M6.5 4.5h11L21 9l-9 11L3 9z"/><path d="M3 9h18M9.5 4.5 8 9l4 11 4-11-1.5-4.5"/>'),
  climb:GL('<circle cx="12" cy="7.5" r="3"/><circle cx="5.5" cy="10" r="2.2"/><circle cx="18.5" cy="10" r="2.2"/><path d="M6.5 20a5.5 5.5 0 0 1 11 0M2 19a3.6 3.6 0 0 1 5-3.3M22 19a3.6 3.6 0 0 0-5-3.3"/>'),
  strands:GL('<circle cx="5" cy="6" r="1.6" fill="currentColor"/><circle cx="12" cy="6" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="18.5" r="1.6" fill="currentColor"/><circle cx="5" cy="18.5" r="1.6"/><path d="M5 6h7v6h7v6.5"/>'),
  worldle:GL('<path d="M6 5.5 10.5 4l3 2 4.5-.5 1.5 4-2 3 1.5 4.5-4 3.5-3-1.5-3.5 1-2.5-4 1-3.5L5 10z" fill="currentColor" fill-opacity=".25"/>'),
  travle:GL('<circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="6" r="2.5" fill="currentColor"/><path d="M7.5 16.5c3-1 2-5 5-6s3.5-1.5 4-2.6" stroke-dasharray="2.4 2.6"/>'),
  globle:GL('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>'),
  nbrs:GL('<path d="M12 3.5 16 6v4.5L12 13 8 10.5V6z" fill="currentColor"/><path d="M8 10.5 4 13v4.5L8 20l4-2.5V13M12 13l4-2.5 4 2.5v4.5L16 20l-4-2.5"/>'),
  flagle:GL('<path d="M5 21V4"/><path d="M5 4.5h12.5l-2.2 3.8 2.2 3.7H5" fill="currentColor" fill-opacity=".3"/>'),
  hilo:GL('<path d="M8 19V5M4.5 8.5 8 5l3.5 3.5"/><path d="M16 5v14M12.5 15.5 16 19l3.5-3.5"/>'),
  queens:GL('<path d="M4 17.5 3 7.5l5 4 4-6.5 4 6.5 5-4-1 10z" fill="currentColor" fill-opacity=".25"/><path d="M4.5 20.5h15"/>'),
  timeline:GL('<path d="M3 12h18"/><circle cx="6" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2" fill="currentColor"/><path d="M6 6.5v3M12 14.5v3M18 6.5v3"/>'),
  mines:GL('<circle cx="11" cy="13.5" r="6.5" fill="currentColor" fill-opacity=".25"/><path d="M15.6 8.9 18 6.5M17 4.5l2.5 2.5M19.5 3.5v1.5M21 6h-1.5"/><circle cx="8.8" cy="11.3" r="1.2" fill="currentColor" stroke="none"/>'),
  maptap:GL('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4" fill="currentColor"/>'),
  statele:GL('<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="currentColor" fill-opacity=".25"/>'),
  dsudoku:GL('<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M12 4v16M4 12h16"/><path d="M7 7.6h1.6v2.9M14.8 15.2c.4-.6 1.3-.8 1.9-.4.7.5.6 1.4 0 2l-1.9 1.9h2.4" stroke-width="1.5"/>'),
  seq:GL('<circle cx="6" cy="6" r="1.7"/><circle cx="12" cy="6" r="1.7"/><circle cx="18" cy="6" r="1.7" fill="currentColor"/><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/><circle cx="6" cy="18" r="1.7"/><circle cx="12" cy="18" r="1.7" fill="currentColor"/><circle cx="18" cy="18" r="1.7"/>'),
  num:GL('<path d="M5 8.5 7 7v10M10.5 9a2 2 0 0 1 4 0c0 1.5-1.5 2.5-4 5.5v2.5h4.5M17 7.5h3l-2 3.2a2.4 2.4 0 1 1-1.4 4.6"/>'),
  match:GL('<rect x="3.5" y="5" width="9" height="13" rx="2" transform="rotate(-8 8 11.5)"/><rect x="11.5" y="6" width="9" height="13" rx="2" fill="currentColor" fill-opacity=".3" transform="rotate(8 16 12.5)"/>'),
  react:GL('<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" fill="currentColor" fill-opacity=".25"/>'),
  stroop:GL('<path d="M12 3.5s6 6.3 6 10.5a6 6 0 0 1-12 0c0-4.2 6-10.5 6-10.5z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.6"/>'),
  schulte:GL('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>'),
  count:GL('<rect x="5" y="3.5" width="14" height="17" rx="3"/><rect x="8" y="6.5" width="8" height="3.5" rx="1"/><path d="M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17h.01M12 17h.01M15.5 17h.01" stroke-width="2.6"/>'),
  sudoku:GL('<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>'),
  lights:GL('<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.2.9 2v.2h5.4v-.2c0-.8.3-1.5.9-2A6 6 0 0 0 12 3z" fill="currentColor" fill-opacity=".25"/>')
};
/* unlimited versions share their daily game's icon */
const GLYPH=Object.assign({},GLYPH_BASE,{strandsu:GLYPH_BASE.strands,worldleu:GLYPH_BASE.worldle,travleu:GLYPH_BASE.travle,globleu:GLYPH_BASE.globle,nbrsu:GLYPH_BASE.nbrs,flagleu:GLYPH_BASE.flagle,hilou:GLYPH_BASE.hilo,queensu:GLYPH_BASE.queens,timelineu:GLYPH_BASE.timeline,msu:GLYPH_BASE.mines,maptapu:GLYPH_BASE.maptap,stateleu:GLYPH_BASE.statele,diveu:GLYPH_BASE.dive,climbu:GLYPH_BASE.climb});
