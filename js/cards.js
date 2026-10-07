function tdEsc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function tdCard(p) {
 const cat = CATEGORIES[p.category] || {name:'Technik'};
 return '<article class="card"><div class="thumb"><span class="na">' + tdEsc(cat.name) + '</span></div><div class="body"><span class="adtag">Anzeige · Amazon-Link</span><h3 class="title">' + tdEsc(p.title) + '</h3><p>Produktdetails, Preis, Versandkosten und Verfügbarkeit im Händlerangebot prüfen.</p><a class="btn btn-o btn-sm btn-block buy" href="' + tdEsc(affiliateUrl(p)) + '" target="_blank" rel="sponsored nofollow noopener noreferrer">Bei Amazon ansehen</a><div class="foot">ASIN ' + tdEsc(p.asin) + '</div></div></article>';
}
function tdRender(el, opts = {}) { let items = PRODUCTS.filter(p => !opts.cat || opts.cat === 'all' || p.category === opts.cat); if(opts.limit) items=items.slice(0,opts.limit); el.classList.add('grid'); el.innerHTML=items.length ? items.map(tdCard).join('') : '<p>Keine Produkte in dieser Kategorie.</p>'; }
