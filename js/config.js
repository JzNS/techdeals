// Activate only with a confirmed Amazon PartnerNet ID.
const CONFIG = Object.freeze({siteName: 'TechDeals', siteUrl: 'https://techdeals.de', affiliateTag: ''});
function affiliateEnabled() { return /^[a-zA-Z0-9-]+-21$/.test(CONFIG.affiliateTag) && CONFIG.affiliateTag !== 'deinname-21'; }
function amazonLink(path) { const url = new URL(path, 'https://www.amazon.de'); if (affiliateEnabled()) url.searchParams.set('tag', CONFIG.affiliateTag); return url.href; }
function affiliateUrl(p) {
  if (p?.contentSource === 'amazon-creators-api' && affiliateEnabled() && p.detailPageURL) {
    try {
      const url = new URL(p.detailPageURL);
      if (url.protocol === 'https:' && url.hostname === 'www.amazon.de' && !url.username && !url.password && !url.port && url.pathname.includes('/dp/' + p.asin) && url.searchParams.get('tag') === CONFIG.affiliateTag) return url.href;
    } catch (_) {}
  }
  return amazonLink(p && /^[A-Z0-9]{10}$/.test(p.asin) ? '/dp/' + p.asin : '/');
}
function amazonSearchUrl(term) { return amazonLink('/s?k=' + encodeURIComponent(term)); }
