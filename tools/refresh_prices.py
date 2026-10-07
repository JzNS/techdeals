# -*- coding: utf-8 -*-
"""
TechDeals - Produkt-Pflege
==========================

Alles, was du zum Pflegen anfassen musst:

  data/catalog.json   Master-Liste. Neue Produkte = ASIN dazu, Rest kommt automatisch.
  tools/refresh.bat   Doppelklick -> zieht Preise/Bilder/Bewertungen von amazon.de
                      und schreibt js/products.js + js/live.js neu.

Neues Produkt:
  1. Amazon-oeffnen, ASIN aus der URL kopieren  (amazon.de/dp/<10 Zeichen>)
  2. In data/catalog.json unter "products" ein Objekt einfuegen:
       { "asin": "B08D6NCQ1Z", "category": "cables" }
     (Titel, Preis, Bild, Sterne koennen drinstehen - werden aber ueberschrieben)
  3. refresh.bat laufen lassen. Fertig.

Kategorien in data/catalog.json unter "categories" anlegen, sonst "all".
"""

import datetime as dt
import gzip
import io
import json
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "data", "catalog.json")
LIVE_JSON = os.path.join(ROOT, "data", "live.json")
OUT_JS = os.path.join(ROOT, "js", "products.js")
OUT_LIVE = os.path.join(ROOT, "js", "live.js")

MARKET = "www.amazon.de"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36")
DELAY = 1.5

HTML_HEAD = """// ============================================================
//  Automatisch erzeugt - nicht von Hand editieren.
//  Quelle: data/catalog.json  +  amazon.de  (tools/refresh_prices.py)
//  Stand: %s
// ============================================================
"""


def fetch(asin):
    url = "https://%s/dp/%s?th=1&psc=1" % (MARKET, asin)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip",
        "Connection": "close",
    })
    resp = urllib.request.urlopen(req, timeout=30)
    raw = resp.read()
    if resp.headers.get("Content-Encoding") == "gzip":
        raw = gzip.decompress(raw)
    return resp.geturl(), raw.decode("utf-8", "ignore")


def clean(value):
    if not value:
        return None
    value = (value.replace("&nbsp;", " ").replace("&euro;", " ")
                 .replace("&#39;", "'").replace("&amp;", "&")
                 .replace("&quot;", '"').replace("&rsquo;", "'"))
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value or None


def digits(value):
    if value is None:
        return None
    value = re.sub(r"[^0-9.,]", "", str(value))
    if "," in value:
        value = value.replace(".", "").replace(",", ".")
    return value


def parse(html):
    out = {}

    m = re.search(r'id="productTitle"[^>]*>\s*([^<]+)', html)
    out["title"] = clean(m.group(1)) if m else None

    i = html.find("corePrice_feature_div")
    seg = html[i:i + 4000] if i > 0 else html
    m = (re.search(r'a-offscreen">\s*([0-9.,]+)', seg)
         or re.search(r'a-price-whole">\s*([0-9.,]+)', html)
         or re.search(r'"priceAmount":\s*([0-9.]+)', html))
    out["price"] = digits(m.group(1)) if m else None

    m = re.search(r'a-text-price[^>]*>\s*(?:<span[^>]*>)?\s*([0-9.,]+)\s*<', html)
    if m:
        out["listPrice"] = digits(m.group(1))

    m = re.search(r'priceToPay[^a-zA-Z][^>]*>\s*([0-9.,]+)\s*<', html)
    if m and not out.get("price"):
        out["price"] = digits(m.group(1))

    m = re.search(r'([0-9.,]+)\s*(?:von|out of)\s*5 Sternen', html)
    out["rating"] = digits(m.group(1)) if m else None

    m = (re.search(r'id="acrCustomerReviewText"[^>]*>\s*\(?([0-9.,]+)', html)
         or re.search(r'aria-label="([0-9.,]+) Bewertungen', html))
    out["reviews"] = digits(m.group(1)) if m else None

    m = re.search(r'id="availability"[^>]*>\s*<span[^>]*>\s*([^<]+)', html)
    out["availability"] = clean(m.group(1)) if m else None

    m = re.search(r"([0-9K+.]+)\s*bought in past month", html)
    if m:
        out["bought"] = clean(m.group(1))

    m = re.search(r"Best Sellers Rank.{0,600}?#([0-9.,]+)\s+in\s+([^<(]{3,60})", html, re.S)
    if m:
        out["rank"] = clean("#" + m.group(1) + " in " + m.group(2))

    if re.search(r"Amazon(&#39;|&rsquo;|')s Choice", html):
        out["award"] = "Amazon's Choice"
    elif re.search(r">\s*Bestseller\s*<", html):
        out["award"] = "Bestseller"

    urls = re.findall(r'"hiRes"\s*:\s*"(https:[^"]+)"', html)
    if not urls:
        urls = re.findall(r'"large"\s*:\s*"(https:[^"]+)"', html)
    uniq = []
    for u in urls:
        u = u.replace("\\/", "/")
        if u not in uniq:
            uniq.append(u)
    out["images"] = uniq[:6]
    out["image"] = uniq[0] if uniq else None

    return dict((k, v) for k, v in out.items() if v not in (None, [], "", {}))


def spec_hint(info):
    """Aus dem Amazon-Titel kurze Tech-Daten bauen (max. 3 Chips)."""
    t = info.get("title") or ""
    found = []
    for pat in [r"\b(240|140|100|67|66|45|40|35|33|30|27|25|20|18|12)W\b",
                r"\b(\d{1,3}(?:,\d{3})?)\s*mAh\b",
                r"\b(PD ?3\.[01]|PD|USB 4|Thunderbolt|GaN|LDAC|aptX|IPX[4-8]|IP6[78])\b",
                r"\b(\d)\s*(?:m|meter)\b"]:
        m = re.search(pat, t, re.I)
        if m:
            v = clean(m.group(0))
            if v and v not in found:
                found.append(v)
        if len(found) >= 3:
            break
    return found


def write_outputs(products, live, stamp):
    cats = json.load(open(CATALOG, encoding="utf-8"))["categories"]

    with io.open(OUT_JS, "w", encoding="utf-8") as fh:
        fh.write(HTML_HEAD % stamp + "\n")
        fh.write("const CATEGORIES = " + json.dumps(cats, ensure_ascii=False, indent=2) + ";\n\n")
        fh.write("const PRODUCTS = [\n")
        rows = []
        for p in products:
            rows.append("  " + json.dumps(p, ensure_ascii=False, indent=2).replace("\n", "\n  "))
        fh.write(",\n".join(rows))
        fh.write("\n];\n")

    with io.open(OUT_LIVE, "w", encoding="utf-8") as fh:
        fh.write(HTML_HEAD % stamp + "\n")
        fh.write("window.LIVE_DATA = ")
        fh.write(json.dumps(live, ensure_ascii=False, indent=2))
        fh.write(";\n")


def main(only=None):
    master = json.load(open(CATALOG, encoding="utf-8"))
    products = master["products"]
    live = {}
    if os.path.exists(LIVE_JSON):
        try:
            live = json.load(open(LIVE_JSON, encoding="utf-8"))
        except Exception:
            live = {}

    todo = [p for p in products if not only or p.get("asin") in only]
    print("Katalog: %d Produkte, %d werden bei amazon.de abgefragt\n" % (len(products), len(todo)))
    now = dt.datetime.now(dt.timezone.utc)
    stamp = now.strftime("%Y-%m-%d %H:%M UTC")
    ok = bad = 0

    for n, p in enumerate(todo, 1):
        asin = p.get("asin")
        try:
            final, html = fetch(asin)
            info = parse(html)
            if not info.get("price") and not info.get("image"):
                raise RuntimeError("keine Daten (Amazon hat blockiert) - spaeter erneut versuchen")
            info["updatedAt"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
            info["page"] = final.split("?")[0]
            live[asin] = info
            ok += 1
            print("  [%2d/%d] ok   %-11s %7s EUR  %s/5  %8s Stimmen  %s" % (
                n, len(todo), asin, info.get("price", "-"), info.get("rating", "-"),
                info.get("reviews", "-"), (info.get("title") or "")[:46]))
        except Exception as exc:
            bad += 1
            print("  [%2d/%d] FEHLER %-11s %s" % (n, len(todo), asin, exc))
        if n < len(todo):
            time.sleep(DELAY)

    # Katalog mit den frischen Daten anreichern
    for p in products:
        hit = live.get(p.get("asin"))
        if not hit:
            continue
        for key in ("title", "image", "price"):
            if hit.get(key):
                p[key] = hit[key]
        if hit.get("listPrice") and not p.get("listPrice"):
            p["listPrice"] = hit["listPrice"]
        if hit.get("rating"):
            p["rating"] = float(hit["rating"])
        if hit.get("reviews"):
            p["reviews"] = int(re.sub(r"\D", "", str(hit["reviews"])))
        if not p.get("specs"):
            p["specs"] = spec_hint(hit)
        if hit.get("award"):
            p["badge"] = hit["award"]
        p["checkedAt"] = now.strftime("%Y-%m-%d")

    master["meta"]["updated"] = stamp
    with io.open(CATALOG, "w", encoding="utf-8") as fh:
        json.dump(master, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    with io.open(LIVE_JSON, "w", encoding="utf-8") as fh:
        json.dump(live, fh, ensure_ascii=False, indent=2, sort_keys=True)
        fh.write("\n")

    write_outputs(products, live, stamp)
    print("\ngeschrieben: js/products.js, js/live.js, data/live.json, data/catalog.json")
    print("Ergebnis: %d ok, %d Fehler" % (ok, bad))
    if bad:
        print("Tipp: einfach nochmal laufen lassen - erfolgreiche Werte bleiben erhalten.")
    return 0 if not bad else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or None))
