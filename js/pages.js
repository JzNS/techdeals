/* ==========================================================================
   SUBPAGES  -  fills every <div data-products='{"cat":"cables","limit":6}'>
   Works on the guide pages and the deals page without extra code per page.
   ========================================================================== */

document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
document.querySelectorAll("[data-shop]").forEach(el => { el.textContent = CONFIG.siteName; });

document.querySelectorAll("[data-products]").forEach(el => {
  let opts = {};
  try { opts = JSON.parse(el.getAttribute("data-products")) || {}; } catch (e) { opts = {}; }
  if (!opts.sort) opts.sort = "reviews";
  tdRender(el, opts);
});

PriceFeed.load().then(() => {
  document.querySelectorAll("[data-products]").forEach(el => {
    let opts = {};
    try { opts = JSON.parse(el.getAttribute("data-products")) || {}; } catch (e) { opts = {}; }
    if (!opts.sort) opts.sort = "reviews";
    tdRender(el, opts);
  });
});
