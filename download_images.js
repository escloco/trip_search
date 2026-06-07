// Downloads the real photo for each researched listing (per destinations/*/notes.md),
// straight from each property's own page. Saves to images/<island>-<idx>.<ext>.
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const listings = [
  // PAROS
  {key:'paros-1', url:'https://www.rentavilla.com/property/naoussa-townhouse-2047'},
  {key:'paros-2', url:'https://www.bookingparos.com/villa-one.php?villa=295'},
  {key:'paros-3', url:'https://www.bookingparos.com/villa-one.php?villa=318'},
  {key:'paros-4', url:'https://www.bookingparos.com/villa-one.php?villa=22'},
  {key:'paros-5', url:'https://www.airbnb.com/rooms/49189828'},
  {key:'paros-6', url:'https://www.airbnb.com/rooms/2890446'},
  // KOUFONISIA
  {key:'koufonisia-1', url:'https://www.airbnb.com/rooms/43601632'},
  {key:'koufonisia-2', url:'https://www.booking.com/hotel/gr/paradise-resort-koufonisia.en-us.html'},
  {key:'koufonisia-3', url:'https://www.agoda.com/aeolos-hotel/hotel/all/koufonisia-gr.html'},
  // SIFNOS
  {key:'sifnos-1', url:'https://www.airbnb.com/rooms/654207765196990456'},
  {key:'sifnos-2', url:'https://www.airbnb.com/rooms/34526514'},
  // MILOS
  {key:'milos-1', url:'https://www.airbnb.com/rooms/54109304'},
  {key:'milos-2', url:'https://www.airbnb.com/rooms/610406257838603733'},
];

const SKIP = /logo|icon|sprite|placeholder|avatar|favicon|flag|warning_bar|product-\d|60x60|1x1|blank|loading|pixel|spacer/i;

const abs = (src, base) => { try { return new URL(src, base).href; } catch { return null; } };

function pickFromHtml(html, base){
  const cands = [];
  const metaRe = /<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/gi;
  let m;
  while ((m = metaRe.exec(html))) { const c = /content=["']([^"']+)["']/i.exec(m[0]); if (c) cands.push(c[1]); }
  const imgRe = /(?:data-src|data-lazy-src|src|data-original)=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)["']/gi;
  while ((m = imgRe.exec(html))) cands.push(m[1]);
  const seen = new Set(); const out = [];
  for (const c of cands) { const u = abs(c, base); if (!u || SKIP.test(u) || seen.has(u)) continue; seen.add(u); out.push(u); }
  return out;
}

async function fetchText(url){
  const r = await fetch(url, {headers:{'User-Agent':UA,'Accept-Language':'en-US,en;q=0.9'}, redirect:'follow'});
  if (!r.ok) throw new Error('HTTP '+r.status);
  return await r.text();
}

async function download(url, destNoExt){
  const r = await fetch(url, {headers:{'User-Agent':UA, 'Referer':url}, redirect:'follow'});
  if (!r.ok) throw new Error('img HTTP '+r.status);
  const ct = (r.headers.get('content-type')||'').toLowerCase();
  let ext = 'jpg';
  if (ct.includes('webp')) ext='webp'; else if (ct.includes('png')) ext='png';
  else if (ct.includes('jpeg')||ct.includes('jpg')) ext='jpg';
  else { const mm=/\.(jpe?g|png|webp)/i.exec(url); if(mm) ext=mm[1].toLowerCase().replace('jpeg','jpg'); }
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 3000) throw new Error('too small ('+buf.length+'b)');
  const dest = destNoExt+'.'+ext;
  fs.writeFileSync(dest, buf);
  return {ext, bytes:buf.length, src:url};
}

(async () => {
  fs.mkdirSync('images', {recursive:true});
  const manifest = {};
  for (const L of listings) {
    try {
      const html = await fetchText(L.url);
      const cands = pickFromHtml(html, L.url);
      if (!cands.length) throw new Error('no image candidates');
      let saved=null, lastErr=null;
      for (const c of cands.slice(0,10)) { try { saved=await download(c, path.join('images', L.key)); break; } catch(e){ lastErr=e; } }
      if (!saved) throw lastErr || new Error('all candidates failed');
      manifest[L.key] = L.key+'.'+saved.ext;
      console.log(`OK   ${L.key.padEnd(13)} ${saved.ext} ${(saved.bytes/1024).toFixed(0)}KB  <- ${saved.src.slice(0,72)}`);
    } catch (e) {
      console.log(`FAIL ${L.key.padEnd(13)} ${e.message}  (${L.url})`);
    }
  }
  fs.writeFileSync('images/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('\nManifest:', JSON.stringify(manifest));
})();
