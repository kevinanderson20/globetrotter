"""Builds tools/games/strands.js: Strands-style puzzles on a 6-wide, 8-tall board.
Every letter belongs to exactly one theme word or the spangram, the spangram runs from one side of the board
to the opposite side, word paths never cross each other diagonally, and each board lists every other
dictionary word (4+ letters) that can be traced on it, so finding those can earn hints.
    python3 tools/build-strands.py
"""
import random, time, json, itertools, sys
from wordfreq import zipf_frequency
from english_words import get_english_words_set

R, C = 8, 6
# (clue, spangram, candidate theme words). The generator picks words that fill exactly 48 letters.
THEMES = [
 ("Hit the road", "ROADTRIP", "SNACKS PLAYLIST MOTEL DETOUR ATLAS SUNROOF HIGHWAY ROUTE BILLBOARD MILEAGE"),
 ("Deep blue", "SEACREATURES", "SHARK WHALE SQUID OCTOPUS CORAL DOLPHIN STARFISH URCHIN SEAL CRAB OYSTER"),
 ("Capital idea", "CAPITALCITY", "PARIS ROME LIMA OSLO CAIRO TOKYO DELHI BERLIN MADRID LONDON VIENNA ATHENS DUBLIN"),
 ("Rise and shine", "BREAKFAST", "EGGS BACON TOAST WAFFLES PANCAKES CEREAL OATMEAL BAGEL MUFFIN OMELET GRITS"),
 ("Nothing but net", "BASKETBALL", "DUNK REBOUND ASSIST LAYUP DRIBBLE HOOP JUMPER BLOCK STEAL PIVOT FOUL"),
 ("Board meeting", "CHESSGAME", "KING QUEEN ROOK BISHOP KNIGHT PAWN CHECK CASTLE GAMBIT OPENING"),
 ("Sweet tooth", "DESSERTS", "CAKE COOKIE BROWNIE FUDGE SUNDAE PUDDING TART MOUSSE CUPCAKE TRIFLE ECLAIR"),
 ("In full bloom", "FLOWERBED", "ROSE TULIP DAISY LILY ORCHID POPPY LILAC PEONY IRIS DAHLIA VIOLET"),
 ("Under the weather", "FORECAST", "RAIN SNOW SLEET HAIL THUNDER FOGGY SUNNY WINDY CLOUDY DRIZZLE STORM"),
 ("Drawer full", "UTENSILS", "WHISK LADLE SPATULA TONGS GRATER PEELER SIEVE SPOON KNIFE FORK"),
 ("Out of this world", "SOLARSYSTEM", "MARS VENUS EARTH SATURN JUPITER URANUS NEPTUNE MERCURY PLUTO COMET MOON"),
 ("Strike up the band", "INSTRUMENTS", "VIOLIN CELLO FLUTE OBOE HARP TUBA TRUMPET PIANO DRUMS BASSOON CLARINET VIOLA"),
 ("Paint the town", "COLORWHEEL", "ORANGE YELLOW GREEN BLUE INDIGO VIOLET PURPLE MAGENTA TEAL CRIMSON SCARLET"),
 ("Eat your greens", "VEGETABLES", "CARROT ONION LEEK PEAS POTATO CELERY RADISH SPINACH TURNIP CABBAGE KALE BEET"),
 ("Bowl of plenty", "FRUITBOWL", "APPLE MANGO PEACH GRAPE LEMON MELON CHERRY BANANA KIWI PLUM PEAR"),
 ("Paws and claws", "WILDCATS", "LION TIGER JAGUAR PUMA LYNX OCELOT CHEETAH LEOPARD COUGAR BOBCAT SERVAL"),
 ("Return to sender", "POSTOFFICE", "STAMP LETTER PARCEL ENVELOPE MAILBOX POSTCARD COURIER ADDRESS"),
 ("Lights, camera", "MOVIENIGHT", "POPCORN TRAILER SCREEN TICKET SEQUEL CREDITS SNACKS SODA CANDY PREMIERE"),
 ("Fresh powder", "WINTERSPORTS", "SKIING SLALOM SLED LUGE CURLING HOCKEY SKATING BOBSLED BIATHLON"),
 ("Fix it", "HARDWARE", "HAMMER WRENCH PLIERS DRILL CHISEL LEVEL SCREW NAILS CLAMP RATCHET SANDER"),
 ("Fishbowl", "AQUARIUM", "GUPPY TETRA GOLDFISH BETTA GOBY MOLLY PLECO OSCAR DISCUS BARB"),
 ("Old MacDonald", "BARNYARD", "HORSE SHEEP GOAT PIGLET ROOSTER CHICKEN DONKEY TURKEY DUCK LLAMA CALF"),
 ("Connect the dots", "CONSTELLATION", "ORION LYRA DRACO CYGNUS PEGASUS ARIES TAURUS GEMINI VIRGO LIBRA HYDRA CRUX"),
 ("Grande order", "COFFEESHOP", "LATTE MOCHA ESPRESSO CORTADO BARISTA BEANS MUFFIN SCONE DECAF CREAM"),
 ("Green thumb", "GARDENTOOLS", "RAKE SHOVEL TROWEL SHEARS HOSE SPADE SEEDS GLOVES PRUNERS"),
 ("Peak performance", "MOUNTAINS", "EVEREST DENALI ANDES ALPS FUJI ROCKIES RAINIER ATLAS URALS ETNA OLYMPUS"),
 ("Go with the flow", "GREATRIVERS", "NILE AMAZON DANUBE THAMES SEINE VOLGA GANGES YUKON RHINE MEKONG INDUS CONGO"),
 ("Island hopping", "ISLANDS", "HAWAII BALI CRETE SICILY CUBA JAMAICA FIJI MALTA TAHITI IBIZA CAPRI CORSICA"),
 ("Head to toe", "BODYPARTS", "ELBOW KNEE ANKLE WRIST SHOULDER THUMB CHIN NOSE HEEL SPINE LIVER"),
 ("Roll the dice", "BOARDGAMES", "CHESS CLUE RISK SORRY SCRABBLE MONOPOLY CHECKERS TROUBLE OTHELLO BOGGLE"),
 ("Pinkies up", "TEAPARTY", "KETTLE SAUCER TEACUP SCONES SUGAR LEMON HONEY EARLGREY CHAMOMILE CREAM"),
 ("Pick a station", "MUSICGENRES", "JAZZ BLUES ROCK FOLK PUNK DISCO REGGAE OPERA GOSPEL COUNTRY TECHNO SALSA"),
 ("Life's a beach", "SEASHORE", "SAND WAVES TOWEL SHELLS SUNSCREEN BUCKET UMBRELLA SURF KITE COOLER"),
]
NB = [(dr, dc) for dr in (-1, 0, 1) for dc in (-1, 0, 1) if dr or dc]
def nbrs(i):
    r, c = divmod(i, C)
    for dr, dc in NB:
        rr, cc = r + dr, c + dc
        if 0 <= rr < R and 0 <= cc < C: yield rr * C + cc

def crosses(a, b, diag):
    """moving a->b diagonally may not cross an existing diagonal step (the X shape)"""
    ra, ca = divmod(a, C); rb, cb = divmod(b, C)
    if ra == rb or ca == cb: return False
    p, q = ra * C + cb, rb * C + ca
    return (min(p, q), max(p, q)) in diag

def subset_ok(size, lens):
    """can `size` be made from some of the remaining word lengths?"""
    reach = {0}
    for L in lens: reach |= {x + L for x in reach if x + L <= size}
    return size in reach

def regions(free):
    seen, out = set(), []
    for s in free:
        if s in seen: continue
        st, comp = [s], 0; seen.add(s)
        while st:
            u = st.pop(); comp += 1
            for v in nbrs(u):
                if v in free and v not in seen: seen.add(v); st.append(v)
        out.append(comp)
    return out

def build(spangram, words, rnd, deadline):
    grid = [None] * (R * C); diag = set(); paths = {}
    def place_path(word, start, end_side=None, start_side=None):
        """depth-first search for a path spelling `word` from `start` over free cells"""
        path = [start]; used = {start}
        def go():
            if time.time() > deadline: return False
            if len(path) == len(word):
                if end_side and not end_side(path[-1]): return False
                return True
            u = path[-1]
            opts = [v for v in nbrs(u) if grid[v] is None and v not in used and not crosses(u, v, diag)]
            # fewest onward options first keeps the remaining board in one piece; a little randomness for variety
            opts.sort(key=lambda v: (sum(1 for w in nbrs(v) if grid[w] is None and w not in used), rnd.random()))
            for v in opts:
                path.append(v); used.add(v)
                if go(): return True
                path.pop(); used.discard(v)
            return False
        return path if go() else None
    def commit(word, path):
        for i, v in enumerate(path): grid[v] = word[i]
        for a, b in zip(path, path[1:]):
            ra, ca = divmod(a, C); rb, cb = divmod(b, C)
            if ra != rb and ca != cb: diag.add((min(a, b), max(a, b)))
    def undo(word, path):
        for v in path: grid[v] = None
        for a, b in zip(path, path[1:]): diag.discard((min(a, b), max(a, b)))
    # spangram: side to opposite side
    L = len(spangram)
    orient = ["lr"] if L < 8 else rnd.sample(["lr", "tb"], 2)
    for o in orient:
        starts = [r * C for r in range(R)] if o == "lr" else list(range(C))
        rnd.shuffle(starts)
        end_side = (lambda v: v % C == C - 1) if o == "lr" else (lambda v: v // C == R - 1)
        for st in starts[:6]:
            p = place_path(spangram, st, end_side)
            if p:
                commit(spangram, p); paths[spangram] = p
                if fill(words, grid, diag, paths, rnd, deadline, place_path, commit, undo): return grid, paths
                undo(spangram, p); del paths[spangram]
            if time.time() > deadline: return None
    return None

def fill(words, grid, diag, paths, rnd, deadline, place_path, commit, undo):
    free = {i for i in range(R * C) if grid[i] is None}
    if not words: return not free
    lens = [len(w) for w in words]
    for comp in regions(free):
        if not subset_ok(comp, lens): return False
    # start the next word in the tightest free cell
    cell = min(free, key=lambda v: (sum(1 for w in nbrs(v) if grid[w] is None), rnd.random()))
    for w in sorted(words, key=lambda w: (-len(w), rnd.random())):
        for word in (w, w[::-1]):
            for _ in range(2):
                p = place_path(word, cell)
                if not p: break
                commit(word, p); paths[w] = p if word == w else p[::-1]
                rest = [x for x in words if x != w]
                if fill(rest, grid, diag, paths, rnd, deadline, place_path, commit, undo): return True
                undo(word, p); del paths[w]
                if time.time() > deadline: return False
    return False

def choose_sets(span, cands, rnd):
    need = R * C - len(span)
    cands = [w for w in cands.split() if 4 <= len(w) <= 9]
    sets = []
    for k in range(5, 10):
        for combo in itertools.combinations(cands, k):
            if sum(map(len, combo)) == need: sets.append(combo)
    rnd.shuffle(sets)
    # prefer more, shorter words (feels like the real puzzles: 6 to 8 theme words)
    sets.sort(key=lambda s: -len(s) if 6 <= len(s) <= 8 else 0)
    return sets

BLOCK = set("""ANAL ANUS ARSE BOOB BOOBS BUTT CRAP DAMN DICK DYKE FART HELL HOMO JIZZ KIKE PISS POOP PORN PUBE RAPE SEMEN SEXY SHAG SLUT SPIC TITS TURD TWAT WANK WHORE NAZI COCK CUNT FUCK SHIT BITCH BASTARD PENIS VAGINA NIGGER FAGGOT RETARD""".split())
NAMEY = set("""ALAN ASTOR BRET BURT CASS CATE COLI DALI ERIC ERIN GLEN DEAN DONNA MARK BILL JACK BALI BRAD ALEC LOMA BALLY GOTTA""".split()) - {"MARK","BILL","JACK"}
def dictionary():
    """common, lowercase dictionary words only: no names, places or abbreviations, nothing rude"""
    lower_web2 = {w for w in get_english_words_set(["web2"], lower=False, alpha=True) if w.islower()}
    lower_gcide = {w for w in get_english_words_set(["gcide"], lower=False, alpha=True) if w.islower()}
    words = set()
    for w in lower_web2 & lower_gcide:   # in both dictionaries, so odd entries like "alan" or "cate" drop out
        if 4 <= len(w) <= 12 and zipf_frequency(w, "en") >= 2.7: words.add(w.upper())
    for w in lower_web2 | lower_gcide:   # very common words are fine from either
        if 4 <= len(w) <= 12 and zipf_frequency(w, "en") >= 3.6: words.add(w.upper())
    words -= NAMEY
    return words - BLOCK

def words_on_board(grid, dic):
    prefixes = set()
    for w in dic:
        for i in range(1, len(w)): prefixes.add(w[:i])
    found = set()
    def go(path, s):
        if s in dic and len(s) >= 4: found.add(s)
        if s not in prefixes: return
        u = path[-1]
        for v in nbrs(u):
            if v not in path: path.append(v); go(path, s + grid[v]); path.pop()
    for i in range(R * C): go([i], grid[i])
    return found

def main():
    rnd = random.Random(20261108)
    dic = dictionary(); print("dictionary", len(dic), file=sys.stderr)
    out = []
    for clue, span, cands in THEMES:
        t0 = time.time(); got = None
        for combo in choose_sets(span, cands, rnd)[:60]:
            res = build(span, list(combo), rnd, time.time() + 6)
            if res: got = (combo, res); break
            if time.time() - t0 > 120: break
        if not got: print("FAILED", clue, file=sys.stderr); continue
        combo, (grid, paths) = got
        theme = [span] + list(combo)
        extra = sorted(words_on_board(grid, dic) - set(theme))
        out.append({"c": clue, "g": "".join(grid), "s": span, "w": [[w, paths[w]] for w in theme], "x": " ".join(extra)})
        print(f"{clue:22s} {span:14s} {len(combo)} words, {len(extra)} hint words, {time.time()-t0:.1f}s", file=sys.stderr)
    with open("tools/games/strands.js", "w") as f:
        f.write("/* Strands puzzles, generated by tools/build-strands.py: g = 48 letters row by row (6 wide), w = [word, cell indexes] with the spangram first, x = other words on the board */\n")
        f.write("const STRANDS=" + json.dumps(out, separators=(",", ":")) + ";\n")
    print(len(out), "puzzles", file=sys.stderr)

if __name__ == "__main__": main()
