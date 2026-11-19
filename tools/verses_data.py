#!/usr/bin/env python3
"""Builds the study data for the private Verses page from Tyndale Open Resources (CC BY-SA 4.0).

Source: the Tyndale Open Resources XML, as published by Tyndale House Publishers
(https://tyndaleopenresources.com, mirrored at github.com/TyndaleDigitalProduct/CrossTrails/data/tor_xml).

    python3 tools/verses_data.py /path/to/tor_xml

Writes:
  verses/data/<USFM>.json  one per book: the book summary (purpose, author, date, setting) and every study note,
                           each split into short points, with the verses it points to
  verses/data/dict.json    a short definition for each Tyndale Open Bible Dictionary article

Changes made to the originals (as CC BY-SA asks us to say): notes are split at their bullet marks into separate
points, the phrase a point comments on becomes its label, cross-references are collected into a list, and
dictionary articles are cut to their opening sentence or two (cross-reference articles are replaced by the opening of
the section they point to).
"""
import html, json, os, re, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/tor/ct/data/tor_xml"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "verses", "data")
USFM = "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split()
TOR = "Gen Exod Lev Num Deut Josh Judg Ruth ISam IISam IKgs IIKgs IChr IIChr Ezra Neh Esth Job Ps Pr Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jon Mic Nah Hab Zeph Hagg Zech Mal Matt Mark Luke John Acts Rom ICor IICor Gal Eph Phil Col IThes IIThes ITim IITim Titus Phlm Heb Jas IPet IIPet IJn IIJn IIIJn Jude Rev".split()
NAMES = "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Songs|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation".split("|")
assert len(USFM) == len(TOR) == len(NAMES) == 66
BI = {t: i for i, t in enumerate(TOR)}
# a few other spellings that turn up inside the notes' own cross-references
ALIAS = {"Prov": "Pr", "Psa": "Ps", "Pss": "Ps", "Phlp": "Phil", "Jonah": "Jon", "Obd": "Obad", "Zec": "Zech", "Hag": "Hagg", "Ezk": "Ezek", "Jn": "John", "Mk": "Mark", "Lk": "Luke", "Mt": "Matt", "Rv": "Rev", "Jam": "Jas", "Phm": "Phlm", "Tit": "Titus", "Deu": "Deut", "Gn": "Gen", "Ex": "Exod", "Lv": "Lev", "Nm": "Num", "Dt": "Deut", "Jdg": "Judg", "Est": "Esth", "Ecc": "Eccl", "Sng": "Song", "Lm": "Lam", "Dn": "Dan", "Hs": "Hos", "Jl": "Joel", "Am": "Amos", "Mi": "Mic", "Na": "Nah", "Hb": "Hab", "Zp": "Zeph", "Ml": "Mal"}

def ref(s):
    """'Pr.15.17' / 'Gen.1.1-2.3' / 'Ps.23' / 'Pr.15.17-18' -> (book index, c1, v1, c2, v2); v None = whole chapter"""
    m = re.match(r"^([A-Za-z0-9]+)\.(\d+)(?:\.(\d+))?(?:-(?:(\d+)\.)?(\d+))?$", s.strip())
    if not m: return None
    b = re.sub(r"^([123])(?=[A-Z])", lambda d: "I" * int(d.group(1)), m.group(1))   # 1Sam -> ISam
    b = ALIAS.get(b, b)
    if b not in BI: return None
    c1, v1 = int(m.group(2)), (int(m.group(3)) if m.group(3) else None)
    if m.group(5) is None: c2, v2 = c1, v1
    elif m.group(4): c2, v2 = int(m.group(4)), int(m.group(5))
    elif v1 is None: c2, v2 = int(m.group(5)), None          # Ps.1-2 (chapters)
    else: c2, v2 = c1, int(m.group(5))
    if (c2, v2 or 999) < (c1, v1 or 0): return None
    return BI[b], c1, v1, c2, v2

def label(r):
    b, c1, v1, c2, v2 = r
    nm = "Psalm" if b == 18 and c1 == c2 else NAMES[b]
    if v1 is None: return f"{nm} {c1}" + (f"-{c2}" if c2 != c1 else "")
    if (c2, v2) == (c1, v1): return f"{nm} {c1}:{v1}"
    if c2 == c1: return f"{nm} {c1}:{v1}-{v2}"
    return f"{nm} {c1}:{v1}-{c2}:{v2}"

def text(h):
    """markup -> plain text: small-caps divine name becomes LORD, tags dropped, spaces tidied"""
    h = re.sub(r'<span class="(?:sn-excerpt-divine-name|divine-name|divine-name-ital|sc|sn-excerpt-sc|sn-ref-sc)">(.*?)</span>', lambda m: re.sub(r"<[^>]+>", "", m.group(1)).upper(), h, flags=re.S)
    h = re.sub(r"<[^>]+>", "", h)
    h = html.unescape(h).replace(" ", " ")
    return re.sub(r"\s+", " ", h).strip()

def note_points(body, own):
    """one study note -> [[label, text], ...] and the verses it refers to"""
    body = re.sub(r'<span class="sn-ref">.*?</span>\s*', "", body, count=1, flags=re.S)
    rel = []
    for href in re.findall(r'href="\?bref=([^"]+)"', body):
        r = ref(href)
        if r and r[0] != own[0] or (r and (r[1], r[2] or 0) > (own[3], own[4] or 999) or r and (r[3], r[4] or 999) < (own[1], own[2] or 0)):
            lb = label(r)
            if lb not in rel: rel.append(lb)
    pts = []
    for seg in re.split(r"\s*•\s*", body):
        seg = seg.strip()
        if not text(seg): continue
        lab = ""
        m = re.match(r'^<span class="sn-excerpt[^"]*">(.*?)</span>\s*:?\s*', seg, re.S)
        if m:
            lab = text(m.group(1)).rstrip(":").strip()
            seg = seg[m.end():]
        t = text(seg)
        if t.startswith(":"): t = t[1:].strip()
        if t or lab: pts.append([lab, t])
    return pts, rel

BAD = []
SPLIT = re.compile(r"(?<=[.!?”])\s+(?=(?:<[^>]+>)*[A-Z“(])")
def citations():
    """every sentence in the study notes and theme articles that points at a verse: target -> [(from, sentence)]"""
    cited = {}
    base = os.path.join(SRC, "Tyndale Open Study Notes")
    for fn, kind in (("ThemeNotes.xml", "theme"), ("StudyNotes.xml", "note")):
        s = open(os.path.join(base, fn), encoding="utf-8").read()
        for attrs, body in re.findall(r"<item ([^>]*)>(.*?)</item>", s, re.S):
            name = re.search(r'(?<![a-z])name="([^"]+)"', attrs).group(1)
            t = re.search(r"<title>(.*?)</title>", body, re.S)
            src_ref = ref(name) if kind == "note" else None
            src = text(t.group(1)) if kind == "theme" and t else (label(src_ref) if src_ref else None)
            if not src: continue
            for para in re.findall(r"<p[^>]*>(.*?)</p>", body, re.S):
                para = re.sub(r'<span class="sn-ref">.*?</span>\s*', "", para, count=1, flags=re.S)
                for sent in (x for chunk in re.split(r"\s*•\s*", para) for x in SPLIT.split(chunk)):
                    hrefs = re.findall(r'href="\?bref=([^"]+)"', sent)
                    if not hrefs: continue
                    st = text(sent).lstrip("• ").strip()
                    if len(st) < 30 or len(st) > 320: continue
                    prose = re.sub(r"\(?(?:[1-3]?\s?[A-Z][a-z]{0,6}\.?\s)?\d+(?::\d+)?(?:[-–]\d+(?::\d+)?)?[,;)]?", " ", st)
                    words = len(re.findall(r"[A-Za-z]{3,}", prose))
                    if words < 7: continue                                   # a bare list of references
                    st = st.lstrip("(").strip() if st.startswith("(") and st.count("(") > st.count(")") else st
                    for h in hrefs:
                        r = ref(h)
                        if not r or r[2] is None: continue
                        if r[1] != r[3] or (r[4] - r[2]) > 2: continue            # only pointers at a verse or two
                        if src_ref and src_ref[0] == r[0] and (src_ref[1], src_ref[2] or 0) <= (r[1], r[2]) <= (src_ref[3], src_ref[4] or 999): continue
                        cited.setdefault(r[0], []).append([r[1], r[2], r[4], kind, src, st, words - 4 * len(hrefs) + (3 if kind == "theme" else 0)])
    return cited

def build_notes():
    s = open(os.path.join(SRC, "Tyndale Open Study Notes", "StudyNotes.xml"), encoding="utf-8").read()
    books = {i: [] for i in range(66)}
    bad = 0
    for name, refs, body in re.findall(r'<item name="([^"]+)"[^>]*>\s*<refs>(.*?)</refs>\s*<body>(.*?)</body>', s, re.S):
        r = ref(name) or ref(refs)      # the name holds a section note's full range; refs only its first verses
        if not r: bad += 1; BAD.append(name); continue
        pts, rel = note_points(body, r)
        if pts: books[r[0]].append([r[1], r[2], r[3], r[4], pts, rel[:6]])
    sm = open(os.path.join(SRC, "Tyndale Open Study Notes", "BookIntroSummaries.xml"), encoding="utf-8").read()
    summ = {}
    for refs, body in re.findall(r"<item [^>]*>.*?<refs>(.*?)</refs>\s*<body>(.*?)</body>", sm, re.S):
        r = ref(refs.split(";")[0].strip())
        if not r: continue
        d, key = {}, None
        for cls, p in re.findall(r'<p class="([^"]+)">(.*?)</p>', body, re.S):
            if cls == "intro-sidebar-h1": key = text(p).lower()
            elif key and cls.startswith("intro-sidebar-body"): d[key] = (d.get(key, "") + " " + text(p)).strip()
        summ[r[0]] = d
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for i in range(66):
        notes = sorted(books[i], key=lambda n: (n[0], n[1] or 0, -(n[2] * 1000 + (n[3] or 999))))
        seen, cites = set(), []
        for c in sorted(CITED.get(i, []), key=lambda c: (c[0], c[1], -c[6])):
            k = (c[0], c[1], c[5])
            if k in seen: continue
            seen.add(k)
            if sum(1 for x in cites if x[0] == c[0] and x[1] == c[1]) >= 6: continue   # up to six explanations per verse
            cites.append(c[:6])
        data = {"book": NAMES[i], "about": summ.get(i, {}), "notes": notes, "cited": cites}
        p = os.path.join(OUT, USFM[i] + ".json")
        with open(p, "w", encoding="utf-8") as f: json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        total += os.path.getsize(p)
    print(f"notes: {sum(len(b) for b in books.values())} in 66 books, {total/1e6:.1f} MB, {bad} unreadable refs {BAD[:8]}, {len(summ)} summaries")

def sentences(t, n=2, cap=260):
    parts = [p for p in re.split(r"(?<=[.!?])\s+(?=[A-Z“\"(])", t)
             if not p.startswith("See ") and not re.search(r"important to understand|this article|discussed (below|above)", p)]
    out = ""
    for p in parts[:n]:
        if out and len(out) + len(p) > cap: break
        out = (out + " " + p).strip()
    if len(out) > cap + 60: out = out[:cap].rsplit(" ", 1)[0] + "…"
    return out

def build_dict():
    d = os.path.join(SRC, "TyndaleOpenBibleDictionary", "Articles")
    arts = {}
    for f in sorted(os.listdir(d)):
        s = open(os.path.join(d, f), encoding="utf-8").read()
        for attrs, body in re.findall(r"<item ([^>]*)>(.*?)</item>", s, re.S):
            if 'typename="Article"' not in attrs: continue
            name = re.search(r'(?<![a-z])name="([^"]+)"', attrs).group(1)
            t = re.search(r"<title>(.*?)</title>", body, re.S)
            arts[name] = {"title": text(t.group(1)).replace("*", "") if t else name, "body": body}
    P = re.compile(r'<p(?: class="([^"]*)")?([^>]*)>(.*?)</p>', re.S)
    def first_para(body, after=None):
        ps = P.findall(body)
        start = 0
        if after:
            want = after.lower()
            for i, (cls, extra, p) in enumerate(ps):
                if (cls or "").startswith(("h2", "h3", "h4")) and (f'id="{after}"' in extra or text(p).lower() == want):
                    start = i + 1; break
            else: return None
        for cls, extra, p in ps[start:]:
            cls = cls or ""
            if cls.startswith(("h1", "h2", "h3", "h4", "toc", "preview")):
                if after and start and cls.startswith(("h2", "h3")): break     # ran past the section
                continue
            t = text(p)
            if len(t) > 25 and not t.lower().startswith("see "): return t
        return None
    out, alt = {}, {}
    for name, a in arts.items():
        ps = re.findall(r'<p class="[^"]+">(.*?)</p>', a["body"], re.S)
        body_txt = [text(p) for p in ps]
        lead = next((t for t in body_txt[1:] if t), "")
        defn, q = None, 2
        m = re.match(r'^See\s+(.*)$', lead) if len(body_txt) <= 3 else None
        if m:
            link = re.search(r'\?item=([A-Za-z0-9]+)_Article', a["body"])
            sub = re.search(r"\(([^)]+)\)", m.group(1))
            if link and link.group(1) in arts:
                tgt = arts[link.group(1)]
                sd = sub and first_para(tgt["body"], sub.group(1))
                defn, q = (sd, 1) if sd else (first_para(tgt["body"]), 0)    # 0: points at a whole, broader article
        else:
            defn = first_para(a["body"])
        if not defn: continue
        defn = re.sub(r"\s*\((?:[1-3]?\s?[A-Z][a-z]+\.? \d+[:\d,;\s–-]*)+\)", "", defn)   # drop runs of verse references
        title = a["title"]
        key = title.lower().replace("’", "'")
        out[key] = [title, sentences(defn), None, q]
        plain = re.sub(r"\s*\([^)]*\)\s*$", "", key)        # "solomon (person)" is also "solomon"
        if plain != key: alt.setdefault(plain, [re.sub(r"\s*\([^)]*\)\s*$", "", title), sentences(defn), None, q])
    for k, v in alt.items(): out.setdefault(k, v)
    # how often each headword turns up across the study notes: the app prefers distinctive words as "key terms"
    corpus = re.sub(r"<[^>]+>", " ", open(os.path.join(SRC, "Tyndale Open Study Notes", "StudyNotes.xml"), encoding="utf-8").read()).lower()
    wc = {}
    for w in re.findall(r"[a-z']+", corpus): wc[w] = wc.get(w, 0) + 1
    for k, v in out.items():
        v[1] = " ".join(x for x in re.split(r"(?<=[.!?])\s+", v[1]) if not x.startswith("See ") and "important to understand" not in x) or v[1]
        v[2] = wc.get(k, 0) if " " not in k else corpus.count(k)
    p = os.path.join(OUT, "dict.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"dictionary: {len(out)} of {len(arts)} articles, {os.path.getsize(p)/1e6:.2f} MB")

def build_themes():
    """theme title -> its opening two sentences: the "bigger picture" for any verse the theme discusses"""
    s = open(os.path.join(SRC, "Tyndale Open Study Notes", "ThemeNotes.xml"), encoding="utf-8").read()
    out = {}
    for attrs, body in re.findall(r"<item ([^>]*)>(.*?)</item>", s, re.S):
        t = re.search(r"<title>(.*?)</title>", body, re.S)
        if not t: continue
        paras = [text(p) for cls, p in re.findall(r'<p class="([^"]*)"[^>]*>(.*?)</p>', body, re.S) if not cls.startswith(("theme-h", "h", "theme-refs", "theme-ref"))]
        lead = next((p for p in paras if len(p) > 60 and not p.startswith(("See ", "Key ", "Passages"))), "")
        if lead: out[text(t.group(1))] = sentences(lead, 2, 320)
    p = os.path.join(OUT, "themes.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"themes: {len(out)}, {os.path.getsize(p)/1e3:.0f} KB")

CITED = citations()
build_themes()
build_notes()
build_dict()
