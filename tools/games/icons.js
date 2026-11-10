/* ================= ICONS =================
   One drawn icon set for the Games tab: 24×24, 2px round strokes, currentColor. Game tiles show them white on the game's color. */
const ICON_PATHS={
 crossword:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/><path d="M14.8 3.5h2.7a3 3 0 0 1 3 3v2.7h-5.7zM3.5 14.8h5.7v5.7H6.5a3 3 0 0 1-3-3z" fill="currentColor"/>',
 connections:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="currentColor"/>',
 gem:'<path d="M6.5 4h11l3.5 5.5L12 20.5 3 9.5z"/><path d="M3 9.5h18M9 4l-1.8 5.5L12 20.5l4.8-11L15 4"/>',
 crowd:'<circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.7-3.3 3.1-5 6-5s5.3 1.7 6 5"/><circle cx="17" cy="9.3" r="2.6"/><path d="M17.2 14.5c2.2.3 3.5 1.9 3.8 4.6"/>',
 strands:'<circle cx="5.5" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18.5" cy="6" r="2"/><circle cx="12" cy="19.5" r="2"/><path d="M7.1 7.3l3.3 3.4M13.6 10.7l3.3-3.4M12 14v3.5"/>',
 map:'<path d="M3.5 7l5.5-2.8 6 2.8 5.5-2.8v12.6L15 19.6l-6-2.8-5.5 2.8z"/><path d="M9 4.2v12.6M15 7v12.6"/>',
 route:'<circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8.4 18h6.8a3 3 0 0 0 0-6H8.8a3 3 0 0 1 0-6h6.8"/>',
 globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5S9.7 5.9 12 3.5z"/>',
 borders:'<path d="M4 4h7v7.5H4zM11 4h9v5.5h-9zM11 9.5h9V20h-6.5v-4H11zM4 11.5h9.5V20H4z"/>',
 flag:'<path d="M5 21V3.8"/><path d="M5 4h11.5l-2 4 2 4H5" fill="currentColor" fill-opacity=".25"/>',
 updown:'<path d="M8 19.5V4.5M4 8.5l4-4 4 4"/><path d="M16 4.5v15M12 15.5l4 4 4-4"/>',
 crown:'<path d="M3.5 8l4.3 4.2L12 5l4.2 7.2L20.5 8l-1.8 10.5H5.3z"/><path d="M5.3 18.5h13.4"/>',
 timeline:'<path d="M3 12h18"/><circle cx="6.5" cy="12" r="2.2"/><circle cx="12.5" cy="12" r="2.2"/><circle cx="18.5" cy="12" r="2.2"/><path d="M6.5 9.8V5.5M12.5 14.2v4.3M18.5 9.8V5.5"/>',
 mine:'<circle cx="12" cy="13" r="6"/><path d="M12 3.5V7M12 19v1.5M3.5 13H6M18 13h2.5M6 7l1.7 1.7M18 7l-1.7 1.7M6 19l1.7-1.7M18 19l-1.7-1.7"/><circle cx="10" cy="11" r="1.4" fill="currentColor" stroke="none"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3.5M12 18v3.5M2.5 12H6M18 12h3.5"/>',
 star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.8l-5.3 2.8 1.1-5.8-4.3-4.1 5.9-.8z"/>',
 sudoku:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" stroke-width="1.4"/><path d="M11.2 6.2h1.4v3" stroke-width="1.6"/>',
 grid:'<rect x="3.5" y="3.5" width="4.6" height="4.6" rx="1.3"/><rect x="9.7" y="3.5" width="4.6" height="4.6" rx="1.3" fill="currentColor"/><rect x="15.9" y="3.5" width="4.6" height="4.6" rx="1.3"/><rect x="3.5" y="9.7" width="4.6" height="4.6" rx="1.3"/><rect x="9.7" y="9.7" width="4.6" height="4.6" rx="1.3"/><rect x="15.9" y="9.7" width="4.6" height="4.6" rx="1.3" fill="currentColor"/><rect x="3.5" y="15.9" width="4.6" height="4.6" rx="1.3" fill="currentColor"/><rect x="9.7" y="15.9" width="4.6" height="4.6" rx="1.3"/><rect x="15.9" y="15.9" width="4.6" height="4.6" rx="1.3"/>',
 hash:'<path d="M4.5 9h15M4.5 15h15M10 3.5L8 20.5M16 3.5l-2 17"/>',
 cards:'<rect x="3.5" y="5" width="10.5" height="14.5" rx="2"/><path d="M14 7.4l4.8 1.3a1.8 1.8 0 0 1 1.3 2.2L17.6 20a1.8 1.8 0 0 1-2.2 1.3L12 20.4"/>',
 bolt:'<path d="M13 2.5L4.5 14h6.5L10 21.5 19.5 10H13z"/>',
 palette:'<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.7-.8 1.7-1.7 0-1.3-1.2-1.6-1.2-2.8 0-1 .8-1.7 1.7-1.7h2.3a4 4 0 0 0 4-4C20.5 6.7 16.7 3.5 12 3.5z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="10" cy="7.2" r="1.1" fill="currentColor"/><circle cx="14.8" cy="7.4" r="1.1" fill="currentColor"/>',
 bullseye:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
 ops:'<path d="M5 7.5h5M7.5 5v5M14 7.5h5M5.3 14.3l4.4 4.4M9.7 14.3l-4.4 4.4M14 15h5M14 18h5"/>',
 bulb:'<path d="M9.2 17.5h5.6M10.2 20.5h3.6"/><path d="M12 3.5a5.8 5.8 0 0 0-3.5 10.4c.6.5 1 1.2 1 2v.6h5v-.6c0-.8.4-1.5 1-2A5.8 5.8 0 0 0 12 3.5z"/>',
 dumbbell:'<path d="M2.5 12h2M19.5 12h2M6.5 7.5v9M17.5 7.5v9M4.5 9.5v5M19.5 9.5v5M6.5 12h11"/>',
 fire:'<path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.3 2.4-5.2 3.6-8.5 2.6 1.6 3.7 3.8 3.4 6.3 1-.5 1.8-1.6 2-3 1.9 1.6 4 4.2 4 6.4 0 3-2.6 4.8-6.5 4.8z"/>',
 heart:'<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 play:'<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
 pick:'<path d="M14.5 4.5c2.8.3 4.7 2.2 5 5M3.5 20.5l9-9M12.5 11.5l-3-3c2.5-2.5 6-4 9-4"/>',
 flagfill:'<path d="M6 21V3.8" stroke-width="2.2"/><path d="M6 4h11l-2.2 4L17 12H6z" fill="currentColor"/>'
};
const UIC=(name,cls="ic")=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]||""}</svg>`;
const GAME_ICON={mini:"crossword",groups:"connections",dive:"gem",climb:"crowd",strands:"strands",strandsu:"strands",worldle:"map",worldleu:"map",travle:"route",travleu:"route",
  globle:"globe",globleu:"globe",nbrs:"borders",nbrsu:"borders",flagle:"flag",flagleu:"flag",hilo:"updown",hilou:"updown",queens:"crown",queensu:"crown",timeline:"timeline",timelineu:"timeline",
  mines:"mine",msu:"mine",maptap:"target",maptapu:"target",statele:"star",stateleu:"star",dsudoku:"sudoku",diveu:"gem",climbu:"crowd",
  seq:"grid",num:"hash",match:"cards",react:"bolt",stroop:"palette",schulte:"bullseye",count:"ops",sudoku:"sudoku",lights:"bulb"};
const gIcon=k=>UIC(GAME_ICON[k]||"star");
