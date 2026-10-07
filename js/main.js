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
  if (sortMode === "name") items.sort((a,b) => a.title.localeCompare(b.title));
  return items;
}

function render() {
  const items = visible();
  grid.innerHTML = items.length
    ? items.map(tdCard).join("")
    : '<div class="empty"><b>Nothing matches &quot;' + tdEsc(query) + '&quot;.</b><br>' +
      '<a href="' + amazonSearchUrl(query || "USB-C cable") + '" target="_blank" rel="sponsored nofollow noopener noreferrer">' +
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

}
if (clearEl) clearEl.addEventListener("click", () => { query = ""; searchEl.value = ""; render(); });

/* #cables / #earbuds / #powerbanks deep links activate the matching tab */
(function fromHash() {
  const id = (location.hash || "").replace("#", "");
  const hit = tabs.filter(t => t.dataset.cat === id)[0];
  if (hit) { tabs.forEach(t => t.classList.remove("active")); hit.classList.add("active"); activeCat = hit.dataset.cat; }
})();

function renderHero() {
  if (heroImgs) heroImgs.innerHTML = PRODUCTS.slice(0, 4).map(p => '<div class="hero-product"><span>' + tdEsc(p.title) + '</span></div>').join('');
}

(function init() {
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-shop]").forEach(el => { el.textContent = CONFIG.siteName; });
  renderHero();
  render();
  if (stampEl) stampEl.textContent = "Preise, Verfügbarkeit und Verkäufer bitte auf Amazon prüfen.";
})();
