// Archived data is visible only on the developer's local machine.
const TD_LOCAL_PREVIEW = typeof location !== 'undefined' &&
  (location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname));
const TD_PRICE_MAX_AGE = 24 * 60 * 60 * 1000;
let tdExternalImagesEnabled = TD_LOCAL_PREVIEW;

function tdTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
  return Date.parse(value);
}
function tdFreshContent(p, now = Date.now()) {
  const time = tdTimestamp(p.updatedAt);
  return Number.isFinite(time) && time <= now && now - time < TD_PRICE_MAX_AGE;
}
function tdApprovedContent(p) {
  if (p.contentSource === 'local-preview') return TD_LOCAL_PREVIEW;
  if (p.contentSource === 'publisher') return p.rightsReference && p.rightsConfirmed === true;
  return p.contentSource === 'amazon-creators-api' && affiliateEnabled() && tdFreshContent(p);
}
function tdImageUrl(p) {
  if (!tdApprovedContent(p) || typeof p.image !== 'string') return '';
  if (p.contentSource === 'publisher') {
    return /^assets\/products\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|avif)$/.test(p.image) ? p.image : '';
  }
  try {
    const url = new URL(p.image);
    return url.protocol === 'https:' && url.hostname === 'm.media-amazon.com' &&
      !url.username && !url.password && !url.port && url.pathname.startsWith('/images/I/') ? url.href : '';
  } catch (_) { return ''; }
}
function tdPriceValue(p) {
  if (!tdApprovedContent(p) || (p.contentSource !== 'local-preview' && !tdFreshContent(p))) return null;
  if (p.currency && p.currency !== 'EUR') return null;
  const text = String(p.price ?? '').trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(text)) return null;
  const number = Number(text.replace(',', '.'));
  return Number.isFinite(number) && number > 0 ? number : null;
}
function tdPriceDate(p) {
  if (p.contentSource === 'local-preview') {
    // Preserve the original observation date. Never invent a recent timestamp.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.checkedAt || '') || !Number.isFinite(Date.parse(p.checkedAt)) || new Date(p.checkedAt).toISOString().slice(0,10) !== p.checkedAt) return '';
    return TD_LANG === 'de' ? p.checkedAt.split('-').reverse().join('.') : new Date(p.checkedAt).toLocaleDateString(TD_LOCALE, {timeZone:'UTC',day:'numeric',month:'short',year:'numeric'});
  }
  const time = tdTimestamp(p.updatedAt);
  return Number.isFinite(time) ? new Date(time).toLocaleString(TD_LOCALE, {timeZone:'Europe/Berlin'}) + (TD_LANG === 'de' ? ' Uhr (Berlin)' : ' (Berlin time)') : '';
}
function tdImageMarkup(p) {
  const url = tdImageUrl(p);
  const category = CATEGORIES[p.category] || {name:'Technik'};
  if (!url) return '<span class="na">' + tdEsc(category.name) + '</span>';
  if (!url.startsWith('https:') || tdExternalImagesEnabled) {
    return '<img src="' + tdEsc(url) + '" alt="' + tdEsc(tdProductName(p)) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">';
  }
  return '<button type="button" class="image-load" data-load-product-images>Produktbilder laden<span>Von Amazon · Datenübertragung erst nach Klick</span></button>';
}
function tdPriceMarkup(p) {
  const number = tdPriceValue(p);
  if (number === null || !tdPriceDate(p)) return '<div class="price"><span class="none">Aktueller Preis bei Amazon</span></div>';
  const label = tdText(p.contentSource === 'local-preview' ? 'Erfasst am' : 'Preisstand');
  const accessiblePrice = number.toLocaleString(TD_LOCALE, {style:'currency',currency:'EUR'});
  return '<div class="price"><span class="p">' + tdEsc(accessiblePrice) + '</span></div>' +
    '<p class="price-note">' + label + ': ' + tdEsc(tdPriceDate(p)) + '<br>Inkl. MwSt., ggf. Versandkosten · <a href="faq.html#prices">Preisinfo</a></p>';
}
function tdRefreshProductViews() {
  if (typeof render === 'function') { render(); renderHero(); }
  document.querySelectorAll('[data-products]').forEach(el => {
    let opts = {}; try { opts = JSON.parse(el.dataset.products); } catch (_) {}
    tdRender(el, opts);
  });
}
function tdInitProductContent() {
  if (!document.getElementById('grid') && !document.querySelector('[data-products]')) return;
  const hasPreview = TD_LOCAL_PREVIEW && PRODUCTS.some(p => p.contentSource === 'local-preview');
  if (hasPreview) {
    const notice = document.createElement('div');
    notice.className = 'preview-notice';
    notice.textContent = 'Lokale Vorschau: Bilder und Preise aus dem vorhandenen Katalog. Preisstände sind historische Angaben, keine aktuellen Angebote. Amazon-Bilder werden extern geladen. Für die Veröffentlichung eine freigegebene Datenquelle verwenden.';
    const main = document.getElementById('content');
    if (main) main.prepend(notice);
  }
  const remoteImages = PRODUCTS.some(p => tdImageUrl(p).startsWith('https:'));
  if (remoteImages && !TD_LOCAL_PREVIEW) {
    const control = document.createElement('div');
    control.className = 'image-controls';
    control.innerHTML = '<p>Produktbilder werden von Amazon geladen. Dabei erhält Amazon insbesondere Ihre IP-Adresse und Browserinformationen. Die Auswahl gilt nur für diese geöffnete Seite. <a href="datenschutz.html">Datenschutz</a></p><button type="button" class="btn btn-o btn-sm" data-load-product-images>Amazon-Bilder laden</button><button type="button" class="btn btn-line btn-sm" data-hide-product-images hidden>Weitere Bildabrufe stoppen</button>';
    const main = document.getElementById('content');
    if (main) main.prepend(control);
  }
  document.addEventListener('click', event => {
    const load = event.target.closest('[data-load-product-images]');
    const hide = event.target.closest('[data-hide-product-images]');
    if (!load && !hide) return;
    tdExternalImagesEnabled = Boolean(load);
    tdRefreshProductViews();
    document.querySelectorAll('.image-controls [data-load-product-images]').forEach(el => el.hidden = tdExternalImagesEnabled);
    document.querySelectorAll('[data-hide-product-images]').forEach(el => el.hidden = !tdExternalImagesEnabled);
  });
  document.addEventListener('error', event => {
    if (event.target.tagName !== 'IMG') return;
    const fallback = document.createElement('span');
    fallback.className = 'na';
    fallback.textContent = tdText('Bild nicht verfügbar · bei Amazon ansehen');
    event.target.replaceWith(fallback);
  }, true);
  // Expire prices and API content on an already-open page as well.
  if (PRODUCTS.some(p => p.contentSource !== 'local-preview' && p.updatedAt)) setInterval(tdRefreshProductViews, 60000);
}
