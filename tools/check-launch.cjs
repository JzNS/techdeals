const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'launch-config.json'), 'utf8'));
const errors = [];
for (const [key, value] of Object.entries(config)) {
  if (key !== 'domain' && value !== true) errors.push('Noch zu bestätigen: ' + key);
}
for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root,file), 'utf8');
  if (/data-launch-blocker|your-domain\.com|Lengenfeld|§ 5 TMG|ec\.europa\.eu\/consumers\/odr/.test(html)) errors.push(file + ': offene oder veraltete Angaben');
  for (const target of ['impressum.html','datenschutz.html','affiliate-disclosure.html']) {
    if (!html.includes('href="'+target+'"')) errors.push(file + ': Link fehlt: ' + target);
  }
  if (/<(?:script|img)[^>]+src=["']https?:/i.test(html)) errors.push(file + ': externe Ressource');
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Technische Voraussetzungen geprüft. Keine juristische Freigabe.');
