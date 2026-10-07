/* ==========================================================================
   HOMEPAGE  -  tabs, search, sorting. Cards come from js/cards.js
   ========================================================================== */

const grid    = document.getElementById("grid");
const tabs    = Array.prototype.slice.call(document.querySelectorAll(".tab[data-cat]"));
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
      (p.title + " " + tdProductName(p) + " " + (p.displayName || '') + " " + (p.displaySpecs || p.specs || []).map(tdText).join(" ") + " " + p.asin).toLowerCase().indexOf(q) !== -1);
  }
  if (sortMode === "name") items.sort((a,b) => tdProductName(a).localeCompare(tdProductName(b),TD_LOCALE));
  if (sortMode === "price-asc" || sortMode === "price-desc") {
    items.sort((a,b) => {
      const first = tdPriceValue(a), second = tdPriceValue(b);
      if (first === null) return second === null ? 0 : 1;
      if (second === null) return -1;
      return sortMode === "price-asc" ? first - second : second - first;
    });
  }
  return items;
}

function render() {
  const items = visible();
  grid.innerHTML = items.length
    ? items.map(tdCard).join("")
    : '<div class="empty"><b>' + (TD_LANG === 'en' ? 'No products found for “' + tdEsc(query) + '”.' : 'Keine Produkte für „' + tdEsc(query) + '“ gefunden.') + '</b><br>' +
      '<a href="' + amazonSearchUrl(query || "USB-C cable") + '" target="_blank" rel="sponsored nofollow noopener noreferrer">' +
      'Auf Amazon suchen \u2197</a></div>';
  tdTranslate(grid);
  if (countEl) countEl.textContent = TD_LANG === 'en' ? items.length + ' of ' + PRODUCTS.length + ' products' : items.length + " von " + PRODUCTS.length + " Produkten";
  if (clearEl) clearEl.style.display = query ? "inline-block" : "none";
}

tabs.forEach(tab => tab.addEventListener("click", () => {
  tabs.forEach(t => { t.classList.remove("active"); t.setAttribute('aria-pressed','false'); });
  tab.classList.add("active");
  tab.setAttribute('aria-pressed','true');
  activeCat = tab.dataset.cat;
  render();
}));

if (sortSel) sortSel.addEventListener("change", () => { sortMode = sortSel.value; render(); });

if (searchEl) {
  searchEl.addEventListener("input", () => { query = searchEl.value.trim(); render(); });
  searchEl.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); document.getElementById('content').scrollIntoView({behavior:'smooth'}); } });
}
document.getElementById('searchBtn')?.addEventListener('click', () => { query = searchEl.value.trim(); render(); document.getElementById('content').scrollIntoView({behavior:'smooth'}); });
if (clearEl) clearEl.addEventListener("click", () => { query = ""; searchEl.value = ""; render(); });

/* #cables / #earbuds / #powerbanks deep links activate the matching tab */
function fromHash() {
  const id = (location.hash || "").replace("#", "");
  const hit = tabs.filter(t => t.dataset.cat === id)[0];
  if (hit) { tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed','false'); }); hit.classList.add('active'); hit.setAttribute('aria-pressed','true'); activeCat = hit.dataset.cat; }
}
fromHash();
window.addEventListener('hashchange', () => { fromHash(); render(); });

function renderHero() {
  const picks = ['cables','earbuds','powerbanks'].map(category => PRODUCTS.find(p => p.category === category)).filter(Boolean);
  if (heroImgs) heroImgs.innerHTML = picks.map(p => '<div class="hero-product">' + tdImageMarkup(p) + '<a href="' + tdEsc(affiliateUrl(p)) + '" target="_blank" rel="sponsored nofollow noopener noreferrer"><span>' + tdEsc(tdProductName(p)) + '</span></a></div>').join('');
  if (heroImgs) tdTranslate(heroImgs);
}

(function init() {
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-shop]").forEach(el => { el.textContent = CONFIG.siteName; });
  renderHero();
  render();
  if (stampEl) stampEl.textContent = "Preisstand steht am Produkt. Den aktuellen Preis, Versandkosten und Verkäufer bitte auf Amazon prüfen.";
  tdInitProductContent();
})();
