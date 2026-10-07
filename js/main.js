/* ==========================================================================
   HOMEPAGE  -  tabs, search, sorting. Cards come from js/cards.js
   ========================================================================== */

const grid    = document.getElementById("grid");
const tabs    = Array.prototype.slice.call(document.querySelectorAll(".tab"));
const sortSel = document.getElementById("sort");
const countEl = document.getElementById("count");
const stampEl = document.getElementById("stamp");
const searchEl= document.getElementById("search");
const heroImgs= document.getElementById("heroImgs");
const clearEl = document.getElementById("clearSearch");

let activeCat = "all";
let sortMode  = "default";
let query     = "";

function visible() {
  let items = PRODUCTS.filter(p => activeCat === "all" || p.category === activeCat);
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(p =>
      (p.title + " " + (p.specs || []).join(" ") + " " + p.asin).toLowerCase().indexOf(q) !== -1);
  }
  if (sortMode === "price-asc")  items.sort((a, b) => (tdNum(a.price) ?? Infinity) - (tdNum(b.price) ?? Infinity));
  if (sortMode === "price-desc") items.sort((a, b) => (tdNum(b.price) ?? -1) - (tdNum(a.price) ?? -1));
  if (sortMode === "rating")     items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (sortMode === "reviews")    items.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
  return items;
}

function render() {
  const items = visible();
  grid.innerHTML = items.length
    ? items.map(tdCard).join("")
    : '<div class="empty"><b>Nothing matches &quot;' + tdEsc(query) + '&quot;.</b><br>' +
      '<a href="' + amazonSearchUrl(query || "USB-C cable") + '" target="_blank" rel="sponsored nofollow noopener">' +
      'Search this on Amazon \u2197</a></div>';
  if (countEl) countEl.textContent = items.length + " of " + PRODUCTS.length + " products";
  if (clearEl) clearEl.style.display = query ? "inline-block" : "none";
}

tabs.forEach(tab => tab.addEventListener("click", () => {
  tabs.forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  activeCat = tab.dataset.cat;
  render();
}));

if (sortSel) sortSel.addEventListener("change", () => { sortMode = sortSel.value; render(); });

if (searchEl) {
  searchEl.addEventListener("input", () => { query = searchEl.value.trim(); render(); });
  searchEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && query) window.open(amazonSearchUrl(query), "_blank", "noopener");
  });
}
if (clearEl) clearEl.addEventListener("click", () => { query = ""; searchEl.value = ""; render(); });

/* #cables / #earbuds / #powerbanks deep links activate the matching tab */
(function fromHash() {
  const id = (location.hash || "").replace("#", "");
  const hit = tabs.filter(t => t.dataset.cat === id)[0];
  if (hit) { tabs.forEach(t => t.classList.remove("active")); hit.classList.add("active"); activeCat = hit.dataset.cat; }
})();

function renderHero() {
  if (!heroImgs) return;
  const picks = PRODUCTS.filter(p => p.badge).sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 4);
  heroImgs.innerHTML = picks.map(p =>
    '<a href="' + affiliateUrl(p) + '" target="_blank" rel="sponsored nofollow noopener">' +
    '<img src="' + tdEsc(p.image) + '" alt="' + tdEsc(p.title) + '" loading="lazy">' +
    "<span>" + tdEsc(p.title.split("\u2013")[0].trim()) + "</span></a>").join("");
}

(function init() {
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-shop]").forEach(el => { el.textContent = CONFIG.siteName; });
  renderHero();
  render();
  PriceFeed.load().then(src => {
    render();
    if (!stampEl) return;
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    stampEl.innerHTML = src === "live"
      ? "Prices <b>live from Amazon</b>, last checked " + time
      : String(src).indexOf("cache") === 0
        ? "Prices from <b>local cache</b> \u00b7 connect the PA-API endpoint in js/config.js for live updates"
        : "Prices <b>last verified</b> on the Amazon product pages \u00b7 current price is the one shown on Amazon";
  });
})();
