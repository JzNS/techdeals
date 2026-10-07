/* ==========================================================================
   LIVE PRICES  -  reads an optional feed and merges it into PRODUCTS.
   Fails silently: without a feed the catalog keeps its last verified price.
   ========================================================================== */

const PriceFeed = (function () {

  const KEY = "td_price_cache_v1";

  /* js/live.js writes window.LIVE_DATA - refreshed by tools/refresh_prices.py */
  function staticFeed() {
    return (typeof window.LIVE_DATA === "object" && window.LIVE_DATA) ? window.LIVE_DATA : null;
  }

  function endpoint() {
    if (CONFIG.apiUrl) return CONFIG.apiUrl;
    if (CONFIG.apiBase) return CONFIG.apiBase.replace(/\/+$/, "") + "/products";
    return "";
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data: data }));
    } catch (e) { /* private mode - ignore */ }
  }

  /* merge { ASIN: {price,rating,reviews,image} } into PRODUCTS */
  function merge(patch) {
    if (!patch) return 0;
    let n = 0;
    PRODUCTS.forEach(p => {
      const hit = patch[p.asin];
      if (!hit) return;
      if (hit.price !== undefined && hit.price !== null && String(hit.price).length) {
        p.price = String(hit.price).replace(/[^\d.,]/g, "");
      }
      if (hit.rating) p.rating = Number(hit.rating) || p.rating;
      if (hit.reviews) p.reviews = Number(String(hit.reviews).replace(/[^\d]/g, "")) || p.reviews;
      if (hit.image) p.image = hit.image;
      if (hit.listPrice) p.listPrice = String(hit.listPrice).replace(/[^\d.,]/g, "");
      p.checkedAt = hit.updatedAt ? String(hit.updatedAt).slice(0, 10) : new Date().toISOString().slice(0, 10);
      n++;
    });
    return n;
  }

  /* 1) cached feed  2) fresh fetch  -  returns a source label */
  function load() {
    return new Promise(function (resolve) {
      const url = endpoint();
      const cache = readCache();
      if (staticFeed() && merge(staticFeed())) resolve("live");
      const fresh = cache && (Date.now() - cache.at) < CONFIG.priceCacheMinutes * 60000;

      if (cache && merge(cache.data)) {
        resolve(fresh ? "cache" : "cache-stale");
      }
      if (!url) { resolve("catalog"); return; }

      fetch(url, { cache: "no-store" })
        .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
        .then(json => {
          const body = json && json.products ? json.products : json;
          const n = merge(body);
          writeCache(body);
          resolve(n ? "live" : "catalog");
        })
        .catch(() => resolve(cache ? "cache" : "catalog"));
    });
  }

  /* true when the shown price is older than priceMaxAgeHours */
  function tooOld(product) {
    if (!product.checkedAt) return true;
    const d = new Date(product.checkedAt + "T00:00:00");
    if (isNaN(d)) return true;
    return (Date.now() - d.getTime()) > CONFIG.priceMaxAgeHours * 3600000;
  }

  return { load: load, merge: merge, tooOld: tooOld, endpoint: endpoint };
})();
