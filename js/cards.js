function tdEsc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function tdProductName(p) {
 const title = String(tdText(p.displayName || p.title || 'Produkt')).trim();
 if (title.length <= 64) return title;
 const shorter = title.slice(0, 61).replace(/\s+\S*$/, '');
 return (shorter || title.slice(0,61)) + '…';
}
function tdCard(p) {
 const link = tdEsc(affiliateUrl(p));
 const category = CATEGORIES[p.category] || {name:'Technik'};
 const specs = Array.isArray(p.displaySpecs) ? '<p class="product-summary">' + p.displaySpecs.map(value => tdEsc(tdText(value))).join(' · ') + '</p>' : '';
 return '<article class="card"><div class="thumb">' + tdImageMarkup(p) + '</div><div class="body"><div class="card-meta"><span>' + tdEsc(tdText(category.name)) + '</span><span class="adtag">' + tdText('Anzeige') + '</span></div><h3 class="title"><a href="' + link + '" target="_blank" rel="sponsored nofollow noopener noreferrer">' + tdEsc(tdProductName(p)) + '</a></h3>' + specs + tdPriceMarkup(p) + '<a class="btn btn-o btn-sm btn-block buy" href="' + link + '" target="_blank" rel="sponsored nofollow noopener noreferrer">' + tdText('Bei Amazon ansehen') + ' <span aria-hidden="true">↗</span></a><details class="product-details"><summary>' + tdText('Produktdetails') + '</summary><p data-original-title>' + tdEsc(p.title) + '</p><small>ASIN: ' + tdEsc(p.asin) + '</small></details></div></article>';
}
function tdRender(el, opts = {}) { let items = PRODUCTS.filter(p => !opts.cat || opts.cat === 'all' || p.category === opts.cat); if(opts.limit) items=items.slice(0,opts.limit); el.classList.add('grid'); el.innerHTML=items.length ? items.map(tdCard).join('') : '<p>' + tdText('Keine Produkte in dieser Kategorie.') + '</p>'; tdTranslate(el); }
