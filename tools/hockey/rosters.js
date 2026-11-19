/* ---------- rosters: each team's top two forward lines, top two defense pairs and starting goalie ----------
   Lines as of November 19, 2026 (NHL.com, Inside the Rink and Daily Faceoff projected lineups; numbers from hockey-reference rosters).
   Ratings are my own estimates out of 99: skating, shot, passing, checking. Goalies have one rating.
   Format: [number, name, skating, shot, passing, checking] in order LW, C, RW and LD, RD. */
const ROSTERS={
  BOS:{F:[[[10,"JJ Peterka",88,80,78,65],[18,"Pavel Zacha",80,80,82,72],[88,"David Pastrňák",86,96,86,66]],
          [[11,"Casey Mittelstadt",82,76,82,60],[28,"Elias Lindholm",80,76,82,70],[39,"Morgan Geekie",78,82,74,74]]],
       D:[[[27,"Hampus Lindholm",78,66,76,80],[73,"Charlie McAvoy",84,76,84,90]],[[91,"Nikita Zadorov",74,68,66,94],[17,"Will Borgen",76,60,66,82]]],
       G:[1,"Jeremy Swayman",88]},
  CHI:{F:[[[80,"Roman Kantserov",84,82,76,58],[98,"Connor Bedard",88,94,90,60],[59,"Tyler Bertuzzi",76,80,76,84]],
          [[11,"Oliver Moore",92,74,74,60],[91,"Frank Nazar",90,82,80,62],[88,"Patrick Kane",76,86,92,50]]],
       D:[[[72,"Alex Vlasic",78,64,74,82],[28,"Ian Cole",70,58,66,86]],[[44,"Wyatt Kaiser",80,62,70,72],[55,"Artyom Levshunov",80,74,78,74]]],
       G:[30,"Spencer Knight",84]},
  DET:{F:[[[93,"Alex DeBrincat",82,90,82,60],[92,"Marco Kasper",80,76,76,82],[58,"Emmitt Finnie",82,74,72,74]],
          [[28,"Michael Brandsegg-Nygård",82,80,70,76],[18,"Andrew Copp",78,72,74,78],[23,"Lucas Raymond",84,84,88,62]]],
       D:[[[8,"Ben Chiarot",72,64,64,88],[53,"Moritz Seider",82,74,82,90]],[[20,"Albert Johansson",80,64,74,66],[72,"Justin Faulk",74,72,74,80]]],
       G:[80,"Daniil Tarasov",84]},
  MTL:{F:[[[13,"Cole Caufield",86,95,78,54],[14,"Nick Suzuki",84,82,92,66],[20,"Juraj Slafkovský",82,84,80,86]],
          [[76,"Zachary Bolduc",82,80,72,74],[24,"Phillip Danault",76,72,78,80],[85,"Alexandre Texier",80,76,78,64]]],
       D:[[[48,"Lane Hutson",92,76,94,52],[53,"Noah Dobson",80,80,86,72]],[[21,"Kaiden Guhle",82,64,70,88],[45,"Alexandre Carrier",76,60,70,78]]],
       G:[32,"Jacob Fowler",86]},
  NYR:{F:[[[94,"Gabe Perreault",84,80,86,56],[93,"Mika Zibanejad",80,88,84,70],[13,"Alexis Lafrenière",84,84,80,72]],
          [[24,"Tye Kartye",80,70,66,82],[10,"J.T. Miller",78,82,88,86],[16,"Pavel Dorofeyev",82,88,74,64]]],
       D:[[[44,"Vladislav Gavrikov",74,62,70,88],[23,"Adam Fox",82,74,94,66]],[[26,"Marcus Pettersson",74,60,70,78],[4,"Braden Schneider",76,64,64,88]]],
       G:[33,"Dylan Garand",82]},
  TOR:{F:[[[53,"Easton Cowan",84,76,82,74],[34,"Auston Matthews",84,98,86,78],[96,"Jack Roslovic",80,76,78,62]],
          [[20,"Nick Paul",78,72,70,82],[91,"John Tavares",72,84,84,70],[92,"Gavin McKenna",90,86,90,62]]],
       D:[[[22,"Jake McCabe",76,64,68,88],[43,"Darren Raddysh",74,82,76,70]],[[44,"Morgan Rielly",80,72,86,62],[8,"Chris Tanev",70,52,66,86]]],
       G:[72,"Sergei Bobrovsky",87]}
};
const ROSTER_DATE="November 19, 2026";
const lastName=n=>{ const p=n.split(" "); return p.length>1?p.slice(1).join(" "):n; };
// how good a team is overall, for simulated games: attack from forwards' shooting and passing, defense from the D and the goalie
function teamPower(ab){ const r=ROSTERS[ab], F=r.F.flat(), D=r.D.flat(), av=a=>a.reduce((s,v)=>s+v,0)/a.length;
  return {off:av(F.map(p=>p[3]*.6+p[4]*.3+p[2]*.1))+av(D.map(p=>p[4]))*.1, def:av(D.map(p=>p[5]*.5+p[2]*.5))*.4+r.G[2]*.6}; }
