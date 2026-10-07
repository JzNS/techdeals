const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {makeCatalog, catalogScript} = require('./catalog-content.cjs');
const {normalizeResponse} = require('./import-creators.cjs');
const root = path.resolve(__dirname,'..');
function context(host, affiliate = false) {
  const ctx = vm.createContext({URL, TD_LANG:'de', TD_LOCALE:'de-DE', tdText:value=>value, tdLanguageUrl:value=>value, tdTranslate:()=>{}, location:{hostname:host,protocol:'https:'}});
  for (const file of ['config','products','product-content','cards']) {
    let code = fs.readFileSync(path.join(root,'js',file+'.js'),'utf8');
    if (file === 'config' && affiliate) code = code.replace("affiliateTag: ''", "affiliateTag: 'test-21'");
    vm.runInContext(code,ctx);
  }
  return ctx;
}
const local = context('127.0.0.1');
assert(vm.runInContext('PRODUCTS.length > 0 && PRODUCTS.every(p => tdCard(p).includes("<img") && tdPriceValue(p) !== null)', local));
assert(vm.runInContext('PRODUCTS.every(p => !tdCard(p).includes("save") && !tdCard(p).includes("30 Tagen"))',local));
assert(vm.runInContext('tdCard(PRODUCTS[0]).includes("06.10.2026")',local));
for (const host of ['techdeals.de','localhost.example','192.168.1.10']) {
  assert(vm.runInContext('PRODUCTS.every(p => !tdCard(p).includes("<img") && tdPriceValue(p) === null)',context(host)));
}
const publicCatalog = makeCatalog({preview:false});
assert(publicCatalog.products.every(p => p.contentSource !== 'local-preview' && !p.image && !p.price));
assert(!catalogScript(publicCatalog).includes('m.media-amazon.com'));
const published = context('techdeals.de',true);
vm.runInContext(`const sample={asin:'B08D6NCQ1Z',title:'<script>alert(1)</script>',contentSource:'amazon-creators-api',price:'8.91',currency:'EUR',updatedAt:new Date().toISOString(),image:'https://m.media-amazon.com/images/I/sample.jpg'};`,published);
assert(vm.runInContext('tdPriceValue(sample) === 8.91 && !tdImageMarkup(sample).includes("<img") && tdImageMarkup(sample).includes("data-load-product-images")',published));
assert(vm.runInContext('!tdCard(sample).includes("<script>")',published));
vm.runInContext('tdExternalImagesEnabled = true;',published);
assert(vm.runInContext('tdImageMarkup(sample).includes("<img") && tdImageMarkup(sample).includes("no-referrer")',published));
assert(vm.runInContext('tdPriceValue({...sample,updatedAt:new Date(Date.now()-86400001).toISOString()}) === null',published));
assert(vm.runInContext('tdImageUrl({...sample,updatedAt:new Date(Date.now()-86400001).toISOString()}) === ""',published));
assert(vm.runInContext('tdPriceValue({...sample,updatedAt:new Date(Date.now()+60000).toISOString()}) === null',published));
assert(vm.runInContext('tdPriceValue({...sample,price:"9.999"}) === null && tdPriceValue({...sample,currency:"USD"}) === null',published));
assert(vm.runInContext('tdImageUrl({...sample,image:"https://m.media-amazon.com.evil.test/images/I/x.jpg"}) === ""',published));
const fetchedAt = new Date().toISOString();
const response = {itemResults:{items:[{asin:'B08D6NCQ1Z',detailPageURL:'https://www.amazon.de/dp/B08D6NCQ1Z?tag=test-21&linkCode=ogi',images:{primary:{large:{url:'https://m.media-amazon.com/images/I/test.jpg'}}},offersV2:{listings:[{condition:{value:'New'},isBuyBoxWinner:true,price:{money:{amount:8.91,currency:'EUR'}}}]}}]}};
const imported = normalizeResponse(response,fetchedAt);
assert.equal(imported[0].price,8.91);
assert.equal(imported[0].updatedAt,fetchedAt);
const restricted = structuredClone(response);
restricted.itemResults.items[0].offersV2.listings[0].dealDetails={accessType:'PRIME_EXCLUSIVE'};
assert.equal(normalizeResponse(restricted,fetchedAt)[0].price,null);
assert.throws(()=>normalizeResponse(response,'2026-10-06'));
assert.throws(()=>normalizeResponse(response,new Date(Date.now()-86400001).toISOString()));
console.log('PASS: lokale Bilder/Preisstände, öffentliche Vorschau-Sperre, Freigabe externer Bilder, Ablaufzeiten, Preise/URLs, API-Import und Angebotseinschränkungen.');
