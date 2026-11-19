#!/usr/bin/env python3
"""Builds the offline Bible for the Verses page from the Berean Standard Bible (public domain).

Source: the BSB in USFM, github.com/usfm-bible/examples.bsb (a markup-only fork of the official BSB text).
    python3 tools/bsb_data.py /path/to/examples.bsb

Writes verses/bible/<USFM>.json, one per book:
  {"name": "Proverbs", "ch": [ chapter, ... ]}
  chapter = list of lines; a line is [kind, ...] where kind is
    "h"  section heading:        ["h", "A Gentle Answer Turns Away Wrath"]
    "d"  psalm title:            ["d", [[0, "Of David."]]]
    "p"  prose paragraph,  "q1"/"q2"/"q3" poetry lines,  "pc" centred
                                 ["q1", [[1, "A gentle answer turns away wrath,"]], ...]   (spans of [verse, text])
    "b"  a blank line between stanzas
Footnotes, cross-references and word-level markup are left out.
"""
import json, os, re, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/bsb/ex"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "verses", "bible")
USFM = "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split()

def clean(t):
    t = re.sub(r"\\f\s.*?\\f\*", "", t)                     # footnotes
    t = re.sub(r"\\x\s.*?\\x\*", "", t)                     # cross-references
    t = re.sub(r"\\\+?w\s+([^|\\]*?)(?:\|[^\\]*)?\\\+?w\*", r"\1", t)   # \w word|attrs\w*
    t = re.sub(r"\\\+?[a-z]+\d*\*", "", t)                  # closing character markers
    t = re.sub(r"\\\+?(?:wj|add|nd|qs|sc|it|bd|em|k|tl|pn|ord|sig|bk|qt|dc|lit|sls|ior)\s", "", t)
    t = t.replace("ʼ", "’").replace("\u00a0", " ")
    return re.sub(r"\s+", " ", t)

PARA = {"p": "p", "m": "p", "pi": "p", "pi1": "p", "pi2": "p", "pmo": "p", "pm": "p", "pmc": "p", "pmr": "p", "nb": "p", "mi": "p",
        "li": "p", "li1": "p", "li2": "p", "lim": "p", "lim1": "p", "pr": "p", "cls": "p", "po": "p", "ph": "p",
        "q": "q1", "q1": "q1", "q2": "q2", "q3": "q3", "q4": "q3", "qm": "q1", "qm1": "q1", "qm2": "q2", "qr": "q2", "qc": "pc", "pc": "pc", "qa": "h"}

def book(path):
    raw = open(path, encoding="utf-8").read()
    name = re.search(r"\\h\s+(.+)", raw).group(1).strip()
    chapters, ch, line, verse = [], None, None, 0
    def newline(kind):
        nonlocal line
        line = [kind, []]; ch.append(line)
    def add(text):
        nonlocal line
        text = clean(text)
        if not text.strip(): return
        if line is None or line[0] in ("h", "b"): newline("p")
        spans = line[1]
        if spans and spans[-1][0] == verse: spans[-1][1] = (spans[-1][1] + " " + text).replace("  ", " ")
        else: spans.append([verse, text.strip() if not spans else text.lstrip()])
    for tok in re.split(r"(?=\\(?:c|v|s\d?|ms\d?|mr|r|d|b|p|m|pi\d?|pmo|pm|pmc|pmr|nb|mi|li\d?|lim\d?|pr|cls|po|ph|q\d?|qm\d?|qr|qc|pc|qa|mt\d?|toc\d|h|id|ide|rem|sp|iex|ie|is\d?|ip|cl)\b)", raw):
        m = re.match(r"\\([a-z]+\d*)\s?(.*)", tok, re.S)
        if not m: continue
        mk, rest = m.group(1), m.group(2)
        if mk == "c":
            ch = []; chapters.append(ch); line = None; verse = 0
            continue
        if ch is None: continue
        if mk in ("s", "s1", "s2", "s3", "ms", "ms1", "ms2", "sp"):
            t = clean(rest).strip()
            if t: ch.append(["h", t]); line = ch[-1]
            continue
        if mk in ("r", "mr", "rem", "cl"): continue
        if mk == "d":
            newline("d"); add(rest); continue
        if mk == "b":
            ch.append(["b"]); line = ch[-1]; continue
        if mk == "v":
            vm = re.match(r"(\d+)(?:-\d+)?\s?(.*)", rest, re.S)
            verse = int(vm.group(1))
            if line is None or line[0] in ("h", "b", "d"): newline("p")
            add(vm.group(2)); continue
        if mk in PARA:
            k = PARA[mk]
            if k == "h":
                t = clean(rest).strip()
                if t: ch.append(["h", t]); line = ch[-1]
                continue
            newline(k); add(rest); continue
    # tidy: drop empty lines, trailing blanks, and empty spans
    out = []
    for c in chapters:
        lines = [l for l in c if l[0] in ("h", "b") or any(s[1].strip() for s in l[1])]
        for l in lines:
            if l[0] not in ("h", "b"): l[1] = [[v, t.strip()] for v, t in l[1] if t.strip()]
        while lines and lines[-1][0] == "b": lines.pop()
        while lines and lines[0][0] == "b": lines.pop(0)
        out.append(lines)
    return name, out

os.makedirs(OUT, exist_ok=True)
files = sorted(f for f in os.listdir(SRC) if f.endswith(".usfm"))
total = verses = 0
for code in USFM:
    f = next(x for x in files if x[2:5] == code)
    name, chs = book(os.path.join(SRC, f))
    n = len({(ci, s[0]) for ci, c in enumerate(chs) for l in c if l[0] not in ("h", "b") for s in l[1] if s[0]})
    verses += n
    p = os.path.join(OUT, code + ".json")
    with open(p, "w", encoding="utf-8") as fh: json.dump({"name": name, "ch": chs}, fh, ensure_ascii=False, separators=(",", ":"))
    total += os.path.getsize(p)
print(f"66 books, {sum(1 for _ in USFM)} files, {verses} verses, {total/1e6:.1f} MB")
