/* ==========================================================================
   CARDS  -  shared renderer for the homepage, guides and deal pages
   ========================================================================== */

function tdNum(v) {
  if (v === null || v === undefined || v === "") return null;
  let s = String(v).trim();
  // Tausender-Punkte: "32.944" -> 32944
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return parseFloat(s.replace(/\./g, ""));
  // Komma-Dezimal: "8,91" -> 8.91
  s = s.replace(",", ".").replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function tdEsc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function tdStars(rating) {
  const pct = Math.max(0, Math.min(100, (Number(rating) / 5) * 100));
  return '<span class="stars" role="img" aria-label="' + tdEsc(rating) + ' out of 5 stars">' +
         '<span class="bg">\u2605\u2605\u2605\u2605\u2605</span>' +
         '<span class="fill" style="width:' + pct + '%">\u2605\u2605\u2605\u2605\u2605</span></span>';
}

/* Amazon-style price: currency + cents superscript, whole number large */
function tdPrice(p) {
  const value = tdNum(p.price);
  if (PriceFeed.tooOld(p)) {
    return '<span class="price"><span class="none">Aktueller Preis bei Amazon</span></span>';
  }
  if (value === null) {
    return '<span class="price"><span class="none">Preis auf Anfrage</span></span>';
  }
  const cur = CONFIG.currency;
  const whole = Math.floor(value);
  const cents = String(Math.round(Math.round((value - whole) * 100))).padStart(2, "0");
  let html = '<span class="price"><span class="p">' +
    '<span class="cur">' + cur + '</span><span class="w">' + whole + '</span><span class="c">' + cents + '</span></span>';
  const list = tdNum(p.listPrice);
  if (list !== null && list > value) {
    html += '<span class="was">' + cur + String(list.toFixed(2)).replace(".", ",") + '</span>' +
            '<span class="save">-' + Math.round((1 - value / list) * 100) + '%</span>';
  }
  return html + "</span>";
}

function tdBadge(badge) {
  if (!badge) return "";
  if (/deal|low|hot/i.test(badge)) return '<span class="badge hot">' + tdEsc(badge) + "</span>";
  if (/rated|pick/i.test(badge))   return '<span class="badge alt">' + tdEsc(badge) + "</span>";
  return '<span class="badge">' + tdEsc(badge) + "</span>";
}

function tdCard(p) {
  const cat = CATEGORIES[p.category] || { name: "Tech" };
  const link = affiliateUrl(p);
  const reviews = Number(p.reviews || 0).toLocaleString("de-DE");

  return '' +
  '<article class="card">' +
    tdBadge(p.badge) +
    '<a class="thumb" href="' + link + '" target="_blank" rel="sponsored nofollow noopener" ' +
      'title="' + tdEsc(p.title) + '">' +
      (p.image
        ? '<img src="' + tdEsc(p.image) + '" alt="' + tdEsc(p.title) + '" loading="lazy" ' +
          'onerror="this.outerHTML=\'<span class=&quot;na&quot;>Bild nicht verf\u00fcgbar \u2013 bei Amazon ansehen</span>\'">'
        : '<span class="na">Kein Bild</span>') +
    '</a>' +
    '<div class="body">' +
      '<span class="adtag">Anzeige \u00b7 ' + tdEsc(cat.name) + '</span>' +
      '<h3 class="title"><a href="' + link + '" target="_blank" rel="sponsored nofollow noopener">' +
        tdEsc(p.title) + '</a></h3>' +
      (p.rating
        ? '<div class="rate">' + tdStars(p.rating) + tdEsc(p.rating) +
          ' <a class="reviews" href="' + link + '#customerReviews" target="_blank" ' +
          'rel="sponsored nofollow noopener">' + reviews + ' ratings</a></div>'
        : '<div class="rate">&nbsp;</div>') +
      (p.specs && p.specs.length
        ? '<div class="specs">' + p.specs.map(s => "<span>" + tdEsc(s) + "</span>").join("") + "</div>"
        : "") +
      tdPrice(p) +
      '<div class="delivery"><small>Verkauf &amp; Versand über Amazon · Rückgabe innerhalb von 30 Tagen</small></div>' +
      '<a class="btn btn-o btn-sm btn-block buy" href="' + link +
        '" target="_blank" rel="sponsored nofollow noopener">Zum Angebot bei Amazon</a>' +
      (function(){var d=p.checkedAt?new Date(p.checkedAt+"T00:00:00"):null;var days=d&&!isNaN(d)?Math.floor((Date.now()-d.getTime())/864e5):99;var label=days<=1?"heute gepr\u00fcft":days<=3?"vor "+days+" Tagen gepr\u00fcft":"Preis vom "+tdEsc(p.checkedAt||"\u2013")+" \u2014 aktuell auf Amazon";return '<div class="foot">ASIN '+tdEsc(p.asin)+' &middot; '+label+'</div>';})() +
    "</div>" +
  "</article>";
}

/* render a filtered list into any container
   opts: { cat, limit, sort: "reviews"|"rating"|"discount"|"price-asc", dealsOnly } */
function tdRender(el, opts) {
  if (!el) return;
  opts = opts || {};
  let items = PRODUCTS.filter(p => !opts.cat || opts.cat === "all" || p.category === opts.cat);

  if (opts.dealsOnly) {
    items = items.filter(p => {
      const now = tdNum(p.price), was = tdNum(p.listPrice);
      return now !== null && was !== null && was > now;
    });
  }
  if (opts.sort === "reviews")  items.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  if (opts.sort === "rating")   items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (opts.sort === "price-asc")items.sort((a, b) => (tdNum(a.price) ?? Infinity) - (tdNum(b.price) ?? Infinity));
  if (opts.sort === "discount") items.sort((a, b) => {
    const da = 1 - (tdNum(a.price) / tdNum(a.listPrice)), db = 1 - (tdNum(b.price) / tdNum(b.listPrice));
    return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
  });

  if (opts.limit) items = items.slice(0, opts.limit);

  el.className = "grid" + (el.className && el.className.indexOf("grid") === -1 ? " " + el.className : "");
  el.innerHTML = items.length
    ? items.map(tdCard).join("")
    : '<div class="empty"><b>Nothing in this selection right now.</b><br>' +
      '<a href="' + amazonSearchUrl(opts.term || "USB-C") + '" target="_blank" rel="sponsored nofollow noopener">' +
      'Search on Amazon \u2197</a></div>';
}
