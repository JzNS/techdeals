/* ==========================================================================
   CONFIG  -  only this file has to be edited
   ========================================================================== */

const CONFIG = {

  /* 1) YOUR AMAZON ASSOCIATES TAG (Partner-ID) --------------------------
     Register: https://-partners.amazon.de  ->  "Partner-ID anlegen"
     Format:  deinname-21   (the -21 is the country suffix: DE)
     Every outgoing link is built automatically with this tag.            */
  affiliateTag: "deinname-21",

  /* 2) Amazon marketplace:  amazon.de | amazon.fr | amazon.com | ...     */
  domain: "www.amazon.de",

  /* 3) Shop identity ---------------------------------------------------- */
  siteName: "TechDeals",
  siteLine: "Kabel · Ohrhörer · Powerbanks",
  currency: "\u20ac",

  /* 4) LIVE PRICES ------------------------------------------------------
     Amazon does not allow scraping the site directly from a browser, so
     you have two clean options:

     a) Amazon Product Advertising API (PA-API 5.0) through your own
        backend. Set apiBase to the URL of your endpoint, e.g.
        apiBase: "https://api.yourdomain.de"
        -> the page then requests  <apiBase>/products
        and expects JSON: { "B08D6NCQ1Z": { "price": "9.38",
          "rating": 4.7, "reviews": 32926, "image": "...", "updatedAt":
          "2026-10-05T12:00:00Z" }, ... }

     b) Any JSON file / proxy that returns the same shape. Set apiUrl.

     Leave both empty and the page shows the last verified price from
     products.js and labels it. Nothing breaks either way.               */
  apiBase: "",
  apiUrl: "",
  priceCacheMinutes: 30,        // how often the browser re-fetches
  priceMaxAgeHours: 72          // after that the price is shown as "check on Amazon"
};

/* Build an affiliate link. tag/linkCode/th are required by the Associates
   Operating Agreement; rel="sponsored nofollow" is added in the markup.   */
function affiliateUrl(product) {
  if (product && product.url) return product.url;
  var asin = product && product.asin;
  if (!asin) return "https://" + CONFIG.domain + "/";
  var params = [
    "tag=" + encodeURIComponent(CONFIG.affiliateTag),
    "linkCode=ll1",
    "th=1",
    "psc=1"
  ];
  return "https://" + CONFIG.domain + "/dp/" + asin + "?" + params.join("&");
}

/* Search / category deep link on Amazon (also tagged). */
function amazonSearchUrl(term) {
  var params = [
    "k=" + encodeURIComponent(term),
    "tag=" + encodeURIComponent(CONFIG.affiliateTag),
    "linkCode=ll2"
  ];
  return "https://" + CONFIG.domain + "/s/?" + params.join("&");
}
