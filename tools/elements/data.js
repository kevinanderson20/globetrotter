/* ---------- the 118 elements ----------
   [symbol, name, standard atomic weight (or, in brackets, the mass number of a long-lived isotope), memory hook]
   Index + 1 is the atomic number. Weights are CIAAW abridged standard atomic weights (2024 table, checked Nov 2026);
   elements with no standard weight show a bracketed mass number instead. */
const ELS=[
 ["H","Hydrogen","1.008","The lightest element. Stars like the Sun run on it."],
 ["He","Helium","4.0026","Floats party balloons and makes voices squeaky."],
 ["Li","Lithium","6.94","Powers phone and electric car batteries."],
 ["Be","Beryllium","9.0122","Light, stiff metal used for the Webb space telescope's mirrors."],
 ["B","Boron","10.81","In borax laundry booster and heat-proof kitchen glass."],
 ["C","Carbon","12.011","Diamonds, pencil graphite and every living thing."],
 ["N","Nitrogen","14.007","78% of the air you breathe."],
 ["O","Oxygen","15.999","The 21% of air your body needs."],
 ["F","Fluorine","18.998","Fluoride in toothpaste. The most reactive element."],
 ["Ne","Neon","20.180","Glows red-orange in neon signs."],
 ["Na","Sodium","22.990","Na is from Latin natrium. Half of table salt, NaCl."],
 ["Mg","Magnesium","24.305","Burns with a blinding white flash in fireworks."],
 ["Al","Aluminum","26.982","Soda cans and kitchen foil."],
 ["Si","Silicon","28.085","Computer chips. Think Silicon Valley."],
 ["P","Phosphorus","30.974","Its name means light-bearer. On the side of matchboxes."],
 ["S","Sulfur","32.06","Yellow crystals at volcanoes. Its compounds smell like rotten eggs."],
 ["Cl","Chlorine","35.45","Keeps swimming pools clean. The other half of salt."],
 ["Ar","Argon","39.95","Almost 1% of air. Fills the gap in double-pane windows."],
 ["K","Potassium","39.098","K is from Latin kalium. Bananas are full of it."],
 ["Ca","Calcium","40.078","Strong bones and teeth. Milk and chalk."],
 ["Sc","Scandium","44.956","Makes light, strong aluminum for bike frames and bats."],
 ["Ti","Titanium","47.867","Strong and light: aircraft and hip replacements."],
 ["V","Vanadium","50.942","Vanadium steel makes tough wrenches."],
 ["Cr","Chromium","51.996","Shiny chrome on cars and faucets."],
 ["Mn","Manganese","54.938","Hardens steel. Don't mix it up with magnesium."],
 ["Fe","Iron","55.845","Fe is from Latin ferrum. Steel, and the iron in your blood."],
 ["Co","Cobalt","58.933","Cobalt blue glass and battery parts."],
 ["Ni","Nickel","58.693","In coins and stainless steel."],
 ["Cu","Copper","63.546","Cu is from Latin cuprum. Wires and the color of pennies."],
 ["Zn","Zinc","65.38","Coats steel so it won't rust (galvanizing)."],
 ["Ga","Gallium","69.723","Melts in your hand, at about 30 °C."],
 ["Ge","Germanium","72.630","Named for Germany. Used in early transistors."],
 ["As","Arsenic","74.922","The classic poison of mystery novels."],
 ["Se","Selenium","78.971","Named for the Moon (Selene)."],
 ["Br","Bromine","79.904","One of only two elements that are liquid at room temperature."],
 ["Kr","Krypton","83.798","Its name means the hidden one. Used in some flash lamps."],
 ["Rb","Rubidium","85.468","From Latin for deep red, the color of its spectral lines."],
 ["Sr","Strontium","87.62","Makes fireworks red."],
 ["Y","Yttrium","88.906","Named for Ytterby, the Swedish village that named four elements."],
 ["Zr","Zirconium","91.222","Cubic zirconia, the diamond look-alike."],
 ["Nb","Niobium","92.906","In the superconducting magnets of MRI machines."],
 ["Mo","Molybdenum","95.95","Toughens steel for tools and engine parts."],
 ["Tc","Technetium","[98]","The first man-made element. Used in medical scans."],
 ["Ru","Ruthenium","101.07","Named for Ruthenia, an old Latin name for Russia."],
 ["Rh","Rhodium","102.91","Rose-colored salts. Cleans car exhaust in catalytic converters."],
 ["Pd","Palladium","106.42","Catalytic converters and white-gold jewelry."],
 ["Ag","Silver","107.87","Ag is from Latin argentum. Argentina is named for silver."],
 ["Cd","Cadmium","112.41","NiCd rechargeable batteries and bright yellow paint."],
 ["In","Indium","114.82","Indium tin oxide makes touchscreens work."],
 ["Sn","Tin","118.71","Sn is from Latin stannum. Tin cans are tin-plated steel."],
 ["Sb","Antimony","121.76","Sb is from Latin stibium. Used in fire retardants."],
 ["Te","Tellurium","127.60","Named for Earth (Latin tellus). Used in solar panels."],
 ["I","Iodine","126.90","Added to table salt and dabbed on cuts."],
 ["Xe","Xenon","131.29","Bright car headlights and spacecraft ion engines."],
 ["Cs","Cesium","132.91","Cesium atomic clocks define the second."],
 ["Ba","Barium","137.33","A barium drink makes your gut show up on X-rays."],
 ["La","Lanthanum","138.91","Its name means to lie hidden. Used in camera lenses."],
 ["Ce","Cerium","140.12","Makes the spark in lighter flints."],
 ["Pr","Praseodymium","140.91","The green twin. Tints welders' goggles."],
 ["Nd","Neodymium","144.24","Makes the strongest permanent magnets."],
 ["Pm","Promethium","[145]","Radioactive, named for Prometheus, who stole fire."],
 ["Sm","Samarium","150.36","Samarium-cobalt magnets in headphones and guitar pickups."],
 ["Eu","Europium","151.96","Named for Europe. Glows red on euro banknotes under UV light."],
 ["Gd","Gadolinium","157.25","Helps MRI scans show more detail."],
 ["Tb","Terbium","158.93","Green glow in screens. Another Ytterby element."],
 ["Dy","Dysprosium","162.50","Means hard to get. In electric car motor magnets."],
 ["Ho","Holmium","164.93","Named for Stockholm (Latin Holmia)."],
 ["Er","Erbium","167.26","Boosts the light in fiber-optic internet cables."],
 ["Tm","Thulium","168.93","Named for Thule, the far north of old maps."],
 ["Yb","Ytterbium","173.05","Runs some of the most precise clocks ever built."],
 ["Lu","Lutetium","174.97","Named for Lutetia, the old Roman name for Paris."],
 ["Hf","Hafnium","178.49","Named for Copenhagen (Latin Hafnia). Nuclear reactor control rods."],
 ["Ta","Tantalum","180.95","Tiny capacitors inside phones."],
 ["W","Tungsten","183.84","W is from wolfram. Old light bulb filaments; the highest melting point of any metal."],
 ["Re","Rhenium","186.21","Named for the river Rhine. Jet engine blades."],
 ["Os","Osmium","190.23","The densest element."],
 ["Ir","Iridium","192.22","Means rainbow. A layer of it marks the asteroid that ended the dinosaurs."],
 ["Pt","Platinum","195.08","Jewelry and catalytic converters."],
 ["Au","Gold","196.97","Au is from Latin aurum, shining dawn."],
 ["Hg","Mercury","200.59","Hg is from hydrargyrum, liquid silver. Old thermometers."],
 ["Tl","Thallium","204.38","Means green shoot, for its bright green spectral line. Very toxic."],
 ["Pb","Lead","207.2","Pb is from Latin plumbum, as in plumbing."],
 ["Bi","Bismuth","208.98","Pink stomach medicine and rainbow staircase crystals."],
 ["Po","Polonium","[209]","Marie Curie named it for her homeland, Poland."],
 ["At","Astatine","[210]","Means unstable. The rarest element found in nature."],
 ["Rn","Radon","[222]","A radioactive gas that can seep into basements."],
 ["Fr","Francium","[223]","Named for France. Extremely rare and radioactive."],
 ["Ra","Radium","[226]","Found by the Curies. Once painted on glowing watch dials."],
 ["Ac","Actinium","[227]","Means ray. Glows pale blue in the dark."],
 ["Th","Thorium","232.04","Named for Thor, the Norse god of thunder."],
 ["Pa","Protactinium","231.04","Means before actinium, because it decays into actinium."],
 ["U","Uranium","238.03","Fuels nuclear power plants. Named for the planet Uranus."],
 ["Np","Neptunium","[237]","Comes right after uranium, as Neptune comes after Uranus."],
 ["Pu","Plutonium","[244]","Named for Pluto. Powers deep-space probes."],
 ["Am","Americium","[243]","Sits inside most home smoke detectors."],
 ["Cm","Curium","[247]","Named for Marie and Pierre Curie."],
 ["Bk","Berkelium","[247]","Named for Berkeley, California."],
 ["Cf","Californium","[251]","Named for California."],
 ["Es","Einsteinium","[252]","Named for Albert Einstein. First found in H-bomb fallout."],
 ["Fm","Fermium","[257]","Named for physicist Enrico Fermi."],
 ["Md","Mendelevium","[258]","Named for Dmitri Mendeleev, who made the periodic table."],
 ["No","Nobelium","[259]","Named for Alfred Nobel of the Nobel Prizes."],
 ["Lr","Lawrencium","[266]","Named for Ernest Lawrence, who invented the cyclotron."],
 ["Rf","Rutherfordium","[267]","Named for Ernest Rutherford, who found the atom's nucleus."],
 ["Db","Dubnium","[268]","Named for Dubna, the Russian town where it was made."],
 ["Sg","Seaborgium","[269]","Named for Glenn Seaborg while he was still alive."],
 ["Bh","Bohrium","[270]","Named for Niels Bohr and his model of the atom."],
 ["Hs","Hassium","[269]","Named for the German state of Hesse (Latin Hassia)."],
 ["Mt","Meitnerium","[278]","Named for Lise Meitner, who helped discover nuclear fission."],
 ["Ds","Darmstadtium","[281]","Named for Darmstadt, the German city where it was made."],
 ["Rg","Roentgenium","[282]","Named for Wilhelm Röntgen, who discovered X-rays."],
 ["Cn","Copernicium","[285]","Named for Copernicus, who put the Sun at the center."],
 ["Nh","Nihonium","[286]","From Nihon, Japanese for Japan."],
 ["Fl","Flerovium","[289]","Named for Georgy Flyorov's lab in Dubna."],
 ["Mc","Moscovium","[290]","Named for Moscow."],
 ["Lv","Livermorium","[293]","Named for Livermore, California."],
 ["Ts","Tennessine","[294]","Named for Tennessee."],
 ["Og","Oganesson","[294]","Named for Yuri Oganessian. The heaviest element known."]
];

/* where each element sits: [group column 1-18, row]. Rows 1-7 are the periods; rows 9 and 10 are the
   lanthanide and actinide rows printed under the table (row 8 is the gap). */
function cellOf(z){
  if(z===1) return [1,1]; if(z===2) return [18,1];
  if(z<=10) return z<=4?[z-2,2]:[z+8,2];
  if(z<=18) return z<=12?[z-10,3]:[z,3];
  if(z<=36) return [z-18,4]; if(z<=54) return [z-36,5];
  if(z>=57&&z<=71) return [z-54,9]; if(z>=89&&z<=103) return [z-86,10];
  if(z<=86) return z<=56?[z-54,6]:[z-68,6];
  return z<=88?[z-86,7]:[z-100,7]; }

/* families, for colors and for "which family" hints */
const FAM={alk:"Alkali metal",ear:"Alkaline earth metal",tra:"Transition metal",pst:"Post-transition metal",met:"Metalloid",non:"Nonmetal",hal:"Halogen",nob:"Noble gas",lan:"Lanthanide",act:"Actinide"};
function famOf(z){ const L=(...a)=>a.includes(z);
  if(L(3,11,19,37,55,87)) return "alk"; if(L(4,12,20,38,56,88)) return "ear"; if(L(2,10,18,36,54,86,118)) return "nob";
  if(L(9,17,35,53,85,117)) return "hal"; if(L(5,14,32,33,51,52)) return "met"; if(L(1,6,7,8,15,16,34)) return "non";
  if(z>=57&&z<=71) return "lan"; if(z>=89&&z<=103) return "act";
  if(L(13,31,49,50,81,82,83,84,113,114,115,116)) return "pst"; return "tra"; }
const periodOf=z=>z<=2?1:z<=10?2:z<=18?3:z<=36?4:z<=54?5:z<=86?6:7;
const groupOf=z=>(z>=57&&z<=71)||(z>=89&&z<=103)?null:cellOf(z)[0];

/* ---------- the lesson trail: 7 units, 22 lessons of 4 to 6 elements, each with a silly sentence
   whose words start with the symbols in order ---------- */
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const UNITS=[
 {key:"p13", name:"Rows 1–3", sub:"The first 18, the ones everyone learns first", c:"#2a9d6a", lessons:[
   {z:range(1,5),  m:"Happy HEns LIke BEans, Baked"},
   {z:range(6,10), m:"Cats Never Order Fancy NEcklaces"},
   {z:range(11,14),m:"NAncy's MaGic ALligator SIngs"},
   {z:range(15,18),m:"Purple Seals CLap ARound"}]},
 {key:"p4", name:"Row 4", sub:"Potassium to krypton, the first transition metals", c:"#3f67d8", lessons:[
   {z:range(19,24),m:"Kind CAts SCare TIny Vicious CRabs"},
   {z:range(25,30),m:"MaNy FErrets COpy NIne CUte ZaNies"},
   {z:range(31,36),m:"GAllant GEese ASk SEven BRave KRakens"}]},
 {key:"p5", name:"Row 5", sub:"Rubidium to xenon", c:"#8b54d0", lessons:[
   {z:range(37,42),m:"RuBber SiRens Yell; ZoRro NiBbles MOzzarella"},
   {z:range(43,48),m:"TeCh RUlers RHyme, PanDas AGree, CuDdle"},
   {z:range(49,54),m:"INky SNails SoB, TElling Insects XEnon jokes"}]},
 {key:"p6", name:"Row 6", sub:"Cesium to radon, with gold, mercury and lead", c:"#ec7f19", lessons:[
   {z:[55,56,72,73,74,75],m:"CoSy BAts HalF TAlk, Wildly REhearsing"},
   {z:range(76,80),m:"OStriches IRritate PreTty AUnts HuGely"},
   {z:range(81,86),m:"TaLl PlumBers BIke POorly AT RaiN"}]},
 {key:"lan", name:"Lanthanides", sub:"The first row under the table", c:"#0f9ea0", lessons:[
   {z:range(57,61),m:"LAzy CEllos PRactice NoDding PoeMs"},
   {z:range(62,66),m:"SMall EUropeans GuarD TaBby DYnamos"},
   {z:range(67,71),m:"HOt ERrands TeMpt Yogi Bear's LUnch"}]},
 {key:"p7", name:"Row 7", sub:"Francium to oganesson, mostly made in labs", c:"#de3f58", lessons:[
   {z:[87,88,104,105,106,107],m:"FRiendly RAbbits ReFuse DumB SuGary BHajis"},
   {z:range(108,112),m:"HorSes MusT DaSh, RacinG CaNyons"},
   {z:range(113,118),m:"NigHt FLamingos MarCh, LoVing TaSty OGres"}]},
 {key:"act", name:"Actinides", sub:"The second row under the table", c:"#7a5c3e", lessons:[
   {z:range(89,93),m:"ACtive THieves PAss Under NePtune"},
   {z:range(94,98),m:"PUppies AMaze CalM BaKers' CaFés"},
   {z:range(99,103),m:"ElveS FarM MuDdy NOodle LizaRds"}]}
];
const LESSONS=[]; UNITS.forEach((u,ui)=>u.lessons.forEach((l,li)=>LESSONS.push(Object.assign(l,{u:ui,i:li,id:u.key+"-"+(li+1)}))));
