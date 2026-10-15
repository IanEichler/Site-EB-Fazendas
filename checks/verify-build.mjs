import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
const properties=JSON.parse(await readFile(path.join(output,'data/properties.json'),'utf8'));
const routes=['/','/propriedades','/quero-vender','/contato',...properties.map(p=>`/imovel/${p.id}`)];
const refs=new Set();
const titles=new Set();
const decode=value=>value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
for(const route of routes){
  const html=await readFile(path.join(output,route.slice(1),'index.html'),'utf8');
  assert.ok(!html.includes('Preparando novos horizontes'),route);
  const canonical=new URL(decode(html.match(/rel="canonical" href="([^"]+)"/)[1]));
  assert.equal(canonical.pathname,route);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route);
  const title=html.match(/<title>(.*?)<\/title>/)[1];
  assert.ok(!titles.has(title),`Título repetido: ${title}`);
  titles.add(title);
  const schema=JSON.parse(html.match(/id="page-schema">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@graph'][1].url,canonical.href);
  assert.ok(html.includes('property="og:image"'),route);
  for(const [,raw] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const value=decode(raw);
    if(value.startsWith('#'))continue;
    const url=new URL(value,canonical);
    if(url.origin!==canonical.origin)continue;
    // The base element makes all relative public assets resolve from the root.
    const resolved=/^[a-z]+:/i.test(value)||value.startsWith('/')?url:new URL(value,canonical.origin+'/');
    refs.add(decodeURIComponent(resolved.pathname));
  }
  for(const [,srcset] of html.matchAll(/srcset="([^"]+)"/g))for(const candidate of srcset.split(','))refs.add('/'+candidate.trim().split(/\s+/)[0]);
}
for(const p of properties){
  for(const file of [p.cover,p.cardImage.small,p.cardImage.large,...p.fotos.flatMap(photo=>[photo.local,photo.thumb])])refs.add('/'+file);
}
for(const relative of refs){
  const file=path.join(output,relative.slice(1),path.extname(relative)?'':'index.html');
  assert.ok((await stat(file)).isFile(),relative);
}
for(const file of ['model.js','pages.js','seo.js','site.js','motion.js','mobile.js']){
  const script=await readFile(path.join(output,file),'utf8');
  for(const [,dependency] of script.matchAll(/from ['"](\.[^'"]+)['"]/g))assert.ok((await stat(path.resolve(output,dependency))).isFile(),dependency);
}
const sitemap=await readFile(path.join(output,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,routes.length);
const notFound=await readFile(path.join(output,'404.html'),'utf8');
assert.ok(notFound.includes('name="robots" content="noindex,follow"'));
for(const file of ['server.mjs','build.mjs','document.mjs','package.json'])assert.equal(await stat(path.join(output,file)).then(()=>true,()=>false),false,file);
const config=JSON.parse(await readFile(path.join(root,'vercel.json'),'utf8'));
for(const rewrite of config.rewrites){
  const destination=rewrite.destination.replace(':id',String(properties[0].id));
  assert.ok((await stat(path.join(output,destination.slice(1)))).isFile(),destination);
}
console.log(`Verificado: ${routes.length} páginas completas, títulos únicos, metadados, sitemap, módulos e ${refs.size} referências locais.`);
