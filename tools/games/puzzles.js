/* ================= WORD PUZZLES: original puzzles written for this app =================
   MINIS: 5×5 crosswords. g = rows ("#" is a black square); c = a clue for every answer.
   GROUPS: 16 words in 4 groups of 4, listed easiest (1) to trickiest (4).
   One of each is the daily puzzle; all of them stay playable from the archive. Add more anywhere in the lists. */
const MINIS=[
 {g:["#met#","board","anger","delay","#yet#"], c:{MET:"Came across",BOARD:"Get on, as a plane",ANGER:"Rage",DELAY:"Word no traveler wants to see on the departures screen",YET:"So far",BAD:"Opposite of good",MONEY:"What an ATM hands out",EAGLE:"Two under par, in golf",TREAT:"Halloween handout",DRY:"Like a desert, or a deadpan wit"}},
 {g:["#put#","final","alike","noted","#ten#"], c:{PUT:"Placed",FINAL:"Last exam of the term",ALIKE:"Similar",NOTED:"Well-known",TEN:"A perfect score, often",FAN:"Ceiling spinner",PILOT:"First episode of a TV series",UNITE:"Come together",TAKEN:"Already spoken for",LED:"Was out in front"}},
 {g:["#liar","manga","under","scene","text#"], c:{LIAR:"Pinocchio, famously",MANGA:"Japanese comics",UNDER:"Beneath",SCENE:"Part of an act in a play",TEXT:"Message on a phone",MUST:"Have-to item",LANCE:"Jousting weapon",INDEX:"List at the back of a book",AGENT:"Secret ___ (spy)",RARE:"Like a steak with a red center"}},
 {g:["one##","went#","extra","#teen","##red"], c:{ONE:"Single",WENT:"Left",EXTRA:"Background actor in a crowd scene",TEEN:"Someone aged 13 to 19",RED:"Color of a fire truck",OWE:"Be in debt",NEXT:"\"Who's ___?\"",ENTER:"Keyboard key that starts a new line",TREE:"Oak or maple",AND:"Plus"}},
 {g:["own##","deep#","dream","#edge","##set"], c:{OWN:"Possess",DEEP:"Like the end of the pool with the diving board",DREAM:"Something you have while asleep",EDGE:"A cliff has a steep one",SET:"Part of a tennis match",ODD:"Strange",WERE:"\"If I ___ you...\"",NEEDS:"Requires",PAGE:"One side of a sheet in a book",MET:"Greeted at the airport, say"}},
 {g:["##how","#soda","study","pass#","are##"], c:{HOW:"\"___ are you?\"",SODA:"Fizzy drink",STUDY:"Hit the books",PASS:"Hall ___ (school slip)",ARE:"\"You ___ here\" (map words)",SPA:"Place for a massage",STAR:"Twinkler in the night sky",HOUSE:"Home",ODDS:"Bookmaker's numbers",WAY:"Path"}},
 {g:["##for","#lane","could","ugly#","pot##"], c:{FOR:"In favor of",LANE:"Bowling alley strip",COULD:"Was able to",UGLY:"Far from pretty",POT:"Stew holder",CUP:"World ___ (soccer tournament)",LOGO:"Brand symbol",FAULT:"Serve that misses, in tennis",ONLY:"Sole",RED:"Seeing ___ (furious)"}},
 {g:["##for","#have","lived","iron#","per##"], c:{FOR:"Pro",HAVE:"Own",LIVED:"Resided",IRON:"Wrinkle remover",PER:"For each",LIP:"Part of the mouth",HIRE:"Bring on staff",FAVOR:"Party bag goodie",OVEN:"Pizza cooker",RED:"Like a cardinal's feathers"}},
 {g:["#arm#","proof","argue","round","#wet#"], c:{ARM:"Limb",PROOF:"Evidence",ARGUE:"Debate",ROUND:"Shaped like a ball",WET:"Damp",PAR:"Golf standard",ARROW:"A bow's partner",ROGUE:"Scoundrel",MOUNT:"Climb onto, as a horse",FED:"Gave dinner to"}},
 {g:["#met#","pearl","argue","yield","#try#"], c:{MET:"Encountered",PEARL:"Gem from an oyster",ARGUE:"Bicker",YIELD:"Give way",TRY:"Attempt",PAY:"Salary",MERIT:"Deserve",EAGER:"Keen",TRULY:"\"Yours ___\" (letter sign-off)",LED:"Headed the parade"}},
 {g:["##who","#said","third","rose#","yet##"], c:{WHO:"\"___'s there?\"",SAID:"Spoke",THIRD:"Bronze medal place",ROSE:"Thorny flower",YET:"Not ___ (still to come)",TRY:"Score in rugby",SHOE:"Sneaker, for one",WAIST:"Where a belt goes",HIRE:"Employ",ODD:"Like the number 7"}},
 {g:["act##","root#","motor","#lane","##led"], c:{ACT:"Perform on stage",ROOT:"Carrot part you eat",MOTOR:"Engine",LANE:"Swimming pool division",LED:"Conducted",ARM:"Sleeve filler",COOL:"Chill",TOTAL:"Sum",TONE:"Quality of a voice",RED:"Ruby's color"}},
 {g:["##who","#then","share","pale#","ate##"], c:{WHO:"Doctor ___ (time-traveling TV hero)",THEN:"Back ___ (in those days)",SHARE:"Split with others",PALE:"Light in color",ATE:"Had dinner",SPA:"Resort with mud baths",THAT:"Not this",WHALE:"Ocean giant",HERE:"\"Present!\" at roll call",ONE:"Uno"}},
 {g:["#cab#","polar","arise","naked","#led#"], c:{CAB:"Taxi",POLAR:"Kind of bear or ice cap",ARISE:"Get up",NAKED:"___ eye (unaided vision)",LED:"Guided",PAN:"Sweep a camera sideways",CORAL:"Reef builder",ALIKE:"Like two peas in a pod",BASED:"___ on a true story",RED:"Stop light color"}}
];
const GROUPS=[
 [["Kitchen tools","WHISK LADLE SPATULA GRATER"],["Planets","VENUS SATURN NEPTUNE MARS"],["Chocolate ___","CHIP BAR MILK CAKE"],["Start with a body part","ARMY LEGEND SHINE EARTH"]],
 [["Dog breeds","POODLE BEAGLE PUG HUSKY"],["Card games","POKER BRIDGE SNAP RUMMY"],["___bell","DOOR BLUE DUMB BAR"],["Hidden animals","SCATTER BEARD PLANT SCOWL"]],
 [["Breakfast foods","PANCAKE WAFFLE BAGEL MUFFIN"],["Ways to cook an egg","POACHED SCRAMBLED FRIED BOILED"],["Steal","SWIPE PINCH LIFT NICK"],["___cake","CUP CHEESE SPONGE CARROT"]],
 [["Colors","TEAL IVORY LILAC CORAL"],["Landforms","CANYON MESA VALLEY DELTA"],["Greek letters","ALPHA BETA GAMMA OMEGA"],["Abandon","MAROON STRAND DESERT DITCH"]],
 [["Precipitation","RAIN SNOW HAIL SLEET"],["Royalty","KING QUEEN PRINCE DUKE"],["Chess pieces","KNIGHT BISHOP ROOK PAWN"],["___storm","BRAIN THUNDER FIRE SAND"]],
 [["Coffee drinks","LATTE MOCHA ESPRESSO CAPPUCCINO"],["Shades of brown","TAN BEIGE KHAKI TAUPE"],["Units of time","SECOND HOUR DECADE CENTURY"],["Very small","TEENY PUNY MINUTE WEE"]],
 [["Sea creatures","SHARK WHALE DOLPHIN SQUID"],["Card suits","HEART SPADE CLUB DIAMOND"],["Golf terms","EAGLE BIRDIE BOGEY PUTT"],["Things with shells","TURTLE SNAIL TACO EGG"]],
 [["Instruments","GUITAR VIOLIN TRUMPET FLUTE"],["Parts of a tree","BARK BRANCH LEAF TRUNK"],["Dog sounds","WOOF YAP HOWL GROWL"],["___ beer","ROOT GINGER CRAFT DRAFT"]],
 [["Vegetables","CARROT BROCCOLI CELERY SPINACH"],["Car parts","WHEEL HORN TRUNK MIRROR"],["Animals with horns","RHINO GOAT RAM BULL"],["___stick","CANDLE LIP JOY DRUM"]],
 [["Shapes","CIRCLE SQUARE TRIANGLE OVAL"],["School subjects","MATH HISTORY SCIENCE MUSIC"],["Things with screens","PHONE TV LAPTOP TABLET"],["___work","HOME FRAME TEAM ART"]],
 [["Insects","BEETLE MOTH GNAT LOCUST"],["Things that sting","BEE WASP NETTLE SCORPION"],["Sports","SOCCER TENNIS CRICKET RUGBY"],["___ market","STOCK SUPER BLACK FLEA"]],
 [["Pasta","PENNE LINGUINE RAVIOLI FUSILLI"],["Italian cities","ROME VENICE MILAN NAPLES"],["___ pie","APPLE PORK HUMBLE CUTIE"],["Hidden numbers","OFTEN CANINE LONELY WEIGHT"]],
 [["Birds","ROBIN SPARROW PARROT FINCH"],["Archery","ARROW BOW TARGET BULLSEYE"],["Shake","TREMBLE SHIVER QUAKE QUIVER"],["___bar","CROW SAND SNACK CANDY"]],
 [["Months","JUNE AUGUST APRIL JULY"],["Walk","STROLL HIKE AMBLE MARCH"],["Could be","CAN MIGHT MUST MAY"],["___fish","SWORD CAT STAR JELLY"]]
];
