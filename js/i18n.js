// Explicit choice wins; otherwise use the browser's preferred language.
// Language stays in the URL, with no cookies or browser storage.
const TD_LANG = (() => {
  const requested = new URLSearchParams(location.search).get('lang');
  return ['de', 'en'].includes(requested) ? requested : /^de(?:-|$)/i.test(navigator.language || 'en') ? 'de' : 'en';
})();
const TD_LOCALE = TD_LANG === 'de' ? 'de-DE' : 'en-GB';
document.documentElement.lang = TD_LANG;
function tdText(value) {
  if (TD_LANG !== 'en') return value;
  if (TD_EN[value]) return TD_EN[value];
  if (value.endsWith(' | TechDeals')) return tdText(value.slice(0, -12)) + ' | TechDeals';
  return value;
}
function tdLanguageUrl(value, lang = TD_LANG) {
  const url = new URL(value, location.href);
  if (url.origin !== location.origin || !(/\.html$/.test(url.pathname) || url.pathname.endsWith('/'))) return value;
  url.searchParams.set('lang', lang);
  return url.pathname + url.search + url.hash;
}
function tdTranslate(root) {
  if (TD_LANG === 'en') {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script, style, [data-original-title], [data-language-switch]')) continue;
      const original = node.nodeValue.trim();
      node.nodeValue = node.nodeValue.replace(original, tdText(original));
    }
    root.querySelectorAll('[placeholder], [aria-label], [title], meta[content]').forEach(el => {
      for (const attr of ['placeholder', 'aria-label', 'title', 'content']) {
        const original = el.getAttribute(attr);
        if (original && TD_EN[original]) el.setAttribute(attr, TD_EN[original]);
      }
    });
  }
  root.querySelectorAll('a[href]').forEach(el => {
    const href = el.getAttribute('href');
    if (!href || href.startsWith('#') || el.closest('[data-language-switch]')) return;
    el.setAttribute('href', tdLanguageUrl(href));
  });
}
document.addEventListener('DOMContentLoaded', () => {
  tdTranslate(document);
  document.querySelectorAll('[data-language-switch] a').forEach(el => {
    const lang = el.hreflang;
    el.href = tdLanguageUrl(location.href, lang);
    el.classList.toggle('active', lang === TD_LANG);
    if (lang === TD_LANG) el.setAttribute('aria-current', 'true');
  });
  // Keep the current section when switching language after a category change.
  window.addEventListener('hashchange', () => {
    document.querySelectorAll('[data-language-switch] a').forEach(el => { el.href = tdLanguageUrl(location.href, el.hreflang); });
  });
});
