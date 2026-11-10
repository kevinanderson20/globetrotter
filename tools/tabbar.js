/* ==TABBAR== */
/* The bottom tab bar shared by every tab (tools/tabbar.js, copied in by tools/build_editions.py).
   Outline icons for the other tabs, a filled icon in the tint color for the one you're on. */
(function(){
  const m=location.pathname.match(/\/(usa|earth|math|games|test3)\/(?:index\.html)?$/), cur=m?m[1]:"", root=m?"../":"./";
  const I=(o,f)=>`<svg viewBox="0 0 28 28" aria-hidden="true"><g class="o" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${o}</g><g class="f">${f}</g></svg>`;
  const T=[
    ["",'World',I('<circle cx="14" cy="14" r="10"/><path d="M4 14h20M14 4c3 3 4.5 6.5 4.5 10S17 21 14 24c-3-3-4.5-6.5-4.5-10S11 7 14 4z"/>',
      '<circle cx="14" cy="14" r="11" fill="currentColor"/><path d="M3.5 14h21M14 3.5c3 3 4.5 6.6 4.5 10.5S17 21.5 14 24.5c-3-3-4.5-6.6-4.5-10.5S11 6.5 14 3.5z" fill="none" stroke="var(--glass-solid,#fff)" stroke-width="1.6"/>')],
    ["usa","USA",I('<path d="M6 24V4"/><path d="M6 5h14l-3 4.5 3 4.5H6"/>',
      '<path d="M6 24V4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6.5 4.5h14.5l-3.2 4.8 3.2 4.7H6.5z" fill="currentColor"/>')],
    ["earth","Earth",I('<path d="M3 23l7.5-13 4.5 7 3-4.5L25 23z"/><circle cx="20" cy="7" r="2.2"/>',
      '<path d="M2.5 23.5 10.5 9.5l4.5 7 3-4.6 7.5 11.6z" fill="currentColor"/><circle cx="20.5" cy="6.5" r="2.6" fill="currentColor"/>')],
    ["math","Math",I('<rect x="4" y="4" width="20" height="20" rx="5"/><path d="M9 10h5M11.5 7.5v5M9 18.5h5M16.5 9.5l3 3M19.5 9.5l-3 3M16.5 17h3M16.5 20h3"/>',
      '<rect x="3.5" y="3.5" width="21" height="21" rx="5.5" fill="currentColor"/><path d="M9 10h5M11.5 7.5v5M9 18.5h5M16.5 9.5l3 3M19.5 9.5l-3 3M16.5 17h3M16.5 20h3" fill="none" stroke="var(--glass-solid,#fff)" stroke-width="1.8" stroke-linecap="round"/>')],
    ["games","Games",I('<path d="M8.5 8h11a5.5 5.5 0 0 1 5.3 7l-1.3 4.6a3 3 0 0 1-5 1.3L16 18.5h-4L9.5 21a3 3 0 0 1-5-1.3L3.2 15a5.5 5.5 0 0 1 5.3-7z"/><path d="M9.5 11.5v4M7.5 13.5h4"/><circle cx="18.5" cy="12.5" r=".9" fill="currentColor"/><circle cx="20.5" cy="14.8" r=".9" fill="currentColor"/>',
      '<path d="M8.5 7.5h11a6 6 0 0 1 5.8 7.6L24 19.8a3.2 3.2 0 0 1-5.4 1.4l-2.4-2.6h-4.4l-2.4 2.6A3.2 3.2 0 0 1 4 19.8l-1.3-4.7a6 6 0 0 1 5.8-7.6z" fill="currentColor"/><path d="M9.5 11.5v4M7.5 13.5h4" stroke="var(--glass-solid,#fff)" stroke-width="1.8" stroke-linecap="round"/><circle cx="18.5" cy="12.3" r="1.1" fill="var(--glass-solid,#fff)"/><circle cx="20.6" cy="14.7" r="1.1" fill="var(--glass-solid,#fff)"/>')],
    ["test3","Test 3",I('<path d="M3 21c4 0 5-12 11-12s7 12 11 12"/><path d="M3 24h22"/><path d="M14 9V5"/>',
      '<path d="M2.5 21.5C7 21.5 8 8.5 14 8.5S21 21.5 25.5 21.5V24h-23z" fill="currentColor"/><path d="M14 8.5V4.5M2.5 24.5h23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')]
  ];
  const nav=document.createElement("nav"); nav.className="tabbar"; nav.setAttribute("aria-label","Tabs");
  nav.innerHTML=T.map(([k,n,ic])=>`<a href="${root}${k?k+"/":""}"${k===cur?' aria-current="page"':""}>${ic}<span>${n}</span></a>`).join("");
  document.body.appendChild(nav); document.body.classList.add("has-tabbar");
})();
/* ==/TABBAR== */
