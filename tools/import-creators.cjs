// Import a real GetItems response. This is not a live API client and holds no credentials.
const fs = require('node:fs');
const path = require('node:path');
const {fresh} = require('./catalog-content.cjs');
function normalizeResponse(response, fetchedAt, now = Date.now()) {
  if (!fresh(fetchedAt,now)) throw new Error('Tatsächliche Abrufzeit mit Zeitzone angeben; Daten müssen jünger als 24 Stunden sein.');
  const items = response.itemResults?.items || response.itemsResult?.items;
  if (!Array.isArray(items) || !items.length) throw new Error('Keine Produkte in der Creators-API-Antwort.');
  return items.map(item => {
    if (!/^[A-Z0-9]{10}$/.test(item.asin)) throw new Error('Ungültige ASIN');
    const url = new URL(item.detailPageURL);
    if (url.protocol !== 'https:' || url.hostname !== 'www.amazon.de' || url.username || url.password || url.port || !url.pathname.includes('/dp/' + item.asin) || !/^[a-zA-Z0-9-]+-21$/.test(url.searchParams.get('tag') || '')) throw new Error(item.asin + ': deutsche API-Partner-URL fehlt.');
    const listings = item.offersV2?.listings || [];
    // Avoid subscription-only/Prime-only and used offers being presented as unrestricted prices.
    const offer = listings.filter(p => p.condition?.value === 'New' && !p.type && !p.violatesMAP &&
      (!p.dealDetails?.accessType || p.dealDetails.accessType === 'ALL') && p.price?.money?.currency === 'EUR')
      .sort((a,b) => Number(b.isBuyBoxWinner) - Number(a.isBuyBoxWinner))[0];
    const image = item.images?.primary?.large?.url || item.images?.primary?.medium?.url || '';
    if (image) {
      const img = new URL(image);
      if (img.protocol !== 'https:' || img.hostname !== 'm.media-amazon.com' || img.username || img.password || img.port || !img.pathname.startsWith('/images/I/')) throw new Error(item.asin + ': ungültige Bildquelle.');
    }
    return {asin:item.asin, contentSource:'amazon-creators-api', image, price:offer?.price?.money?.amount ?? null, currency:'EUR', updatedAt:fetchedAt, detailPageURL:url.href};
  });
}
if (require.main === module) {
  const [input, fetchedAt] = process.argv.slice(2);
  if (!input || !fetchedAt) { console.error('Aufruf: node tools/import-creators.cjs <antwort.json> <tatsächliche-abrufzeit-ISO-mit-zeitzone>'); process.exitCode=1; }
  else {
    const products = normalizeResponse(JSON.parse(fs.readFileSync(input,'utf8')), fetchedAt);
    fs.writeFileSync(path.join(__dirname,'../data/amazon-content.json'),JSON.stringify({products},null,2)+'\n');
    console.log(products.length + ' API-Produkte importiert. Danach node tools/generate-products.cjs ausführen.');
  }
}
module.exports = {normalizeResponse};
