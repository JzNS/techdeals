const fs = require('node:fs');
const path = require('node:path');
const {makeCatalog, catalogScript} = require('./catalog-content.cjs');
const preview = !process.argv.includes('--production');
fs.writeFileSync(path.join(__dirname,'../js/products.js'), catalogScript(makeCatalog({preview})));
console.log(preview ? 'Lokale Vorschau mit vorhandenen Bildern und historischen Preisständen erzeugt.' : 'Katalog für Veröffentlichung mit freigegebenen Inhalten erzeugt.');
