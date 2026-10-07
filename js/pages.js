document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
document.querySelectorAll('[data-shop]').forEach(el => el.textContent = CONFIG.siteName);
document.querySelectorAll('[data-products]').forEach(el => {
  let opts = {}; try { opts = JSON.parse(el.dataset.products); } catch (_) {}
  tdRender(el, opts);
});
