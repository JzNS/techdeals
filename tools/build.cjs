// Only publish dist, never the source repository.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(__dirname,'check-launch.cjs')], {stdio:'inherit'});
const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) throw new Error('dist existiert bereits. Ausgabe vor neuem Build prüfen und entfernen.');
fs.mkdirSync(dist);
for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) fs.copyFileSync(path.join(root,file),path.join(dist,file));
fs.cpSync(path.join(root,'css'),path.join(dist,'css'),{recursive:true});
fs.mkdirSync(path.join(dist,'js'));
for (const file of ['config.js','products.js','cards.js','main.js','pages.js','legal.js']) fs.copyFileSync(path.join(root,'js',file),path.join(dist,'js',file));
console.log('Veröffentlichungsdateien: dist');
