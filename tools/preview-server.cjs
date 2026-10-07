const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif'};
const server = http.createServer((req,res) => {
  try {
    const name = decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\//,'') || 'index.html';
    const target = path.resolve(root,name);
    const relative = path.relative(root,target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !/^(?:[^/\\]+\.html|(?:css|js|assets)\/)/.test(name) || !types[path.extname(target)] || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200,{'Content-Type':types[path.extname(target)],'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
    fs.createReadStream(target).pipe(res);
  } catch (_) { res.writeHead(400); res.end(); }
});
server.listen(4173,'127.0.0.1',()=>console.log('Lokale Vorschau: http://127.0.0.1:4173/'));
