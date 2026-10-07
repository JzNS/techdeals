// Activate only with a confirmed Amazon PartnerNet ID.
const CONFIG = Object.freeze({siteName: 'TechDeals', siteUrl: 'https://techdeals.de', affiliateTag: ''});
function affiliateEnabled() { return /^[a-zA-Z0-9-]+-21$/.test(CONFIG.affiliateTag) && CONFIG.affiliateTag !== 'deinname-21'; }
function amazonLink(path) { const url = new URL(path, 'https://www.amazon.de'); if (affiliateEnabled()) url.searchParams.set('tag', CONFIG.affiliateTag); return url.href; }
function affiliateUrl(p) { return amazonLink(p && /^[A-Z0-9]{10}$/.test(p.asin) ? '/dp/' + p.asin : '/'); }
function amazonSearchUrl(term) { return amazonLink('/s?k=' + encodeURIComponent(term)); }
