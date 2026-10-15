import {cp, mkdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderDocument} from './document.mjs';
import {e} from './model.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, 'dist');
// Only the generated directory inside this project may be replaced.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error('Diretório de saída inválido.');
}

const publicFiles = [
  'index.html', 'styles.css', 'site.css', 'brown.css', 'typography.css',
  'motion.css', 'mobile.css', 'hero.css', 'refinements.css', 'site.js', 'motion.js', 'mobile.js',
  'model.js', 'pages.js', 'seo.js'
];
const properties = JSON.parse(await readFile(path.join(root, 'data/properties.json'), 'utf8'));
const photos = properties.flatMap(property => property.fotos.map(photo => photo.local));
const previews = properties.flatMap(property => property.cardImage ? [property.cardImage.small, property.cardImage.large] : []);
const thumbnails = properties.flatMap(property => property.fotos.map(photo => photo.thumb || photo.local));
const required = new Set([...publicFiles, 'assets/logo-original.png', 'assets/hero/paisagem-campo-social.jpg', 'assets/hero/paisagem-campo-800.webp', 'assets/hero/paisagem-campo-1600.webp', ...photos, ...previews, ...thumbnails, ...properties.map(property => property.cover)]);
for (const relative of required) {
  if (typeof relative !== 'string') throw new Error('Um imóvel está sem arquivo local.');
  const source = path.resolve(root, relative);
  const withinRoot = path.relative(root, source);
  if (withinRoot.startsWith('..') || path.isAbsolute(withinRoot)) throw new Error(`Caminho inválido: ${relative}`);
  if (!(await stat(source)).isFile()) throw new Error(`Arquivo não encontrado: ${relative}`);
}

const configuredOrigin = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
if (process.env.VERCEL && !configuredOrigin) throw new Error('Defina SITE_URL ou habilite as variáveis de sistema da Vercel para gerar os links públicos.');
const base = new URL(configuredOrigin ? (/^https?:\/\//.test(configuredOrigin) ? configuredOrigin : `https://${configuredOrigin}`) : 'http://localhost:3000');
if (!['http:','https:'].includes(base.protocol) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw new Error('SITE_URL deve ser apenas a origem pública, como https://www.seudominio.com.br.');
const origin = base.origin;
const noindex = process.env.VERCEL_ENV === 'preview' || ['localhost','127.0.0.1'].includes(base.hostname);
const template = await readFile(path.join(root,'index.html'),'utf8');

console.log(`Saída verificada: ${output}`);
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
for (const file of publicFiles) await cp(path.join(root, file), path.join(output, file));
for (const directory of ['assets', 'data']) {
  await cp(path.join(root, directory), path.join(output, directory), {recursive: true});
}
const routes = ['/', '/propriedades', '/quero-vender', '/contato', ...properties.map(property=>`/imovel/${property.id}`)];
for (const pathname of routes) {
  const file = path.join(output,pathname.slice(1),'index.html');
  await mkdir(path.dirname(file),{recursive:true});
  const {html} = renderDocument(template,properties,{pathname,origin,noindex});
  await writeFile(file,html);
}
await writeFile(path.join(output,'404.html'),renderDocument(template,properties,{pathname:'/pagina-nao-encontrada',origin,noindex:true}).html);
await writeFile(path.join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${e(new URL(route,origin).href)}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(output,'robots.txt'),`User-agent: *\n${noindex ? 'Disallow: /' : 'Allow: /'}\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Build concluído: ${routes.length} páginas com HTML próprio, ${properties.length} propriedades e ${photos.length} fotos locais. Origem: ${origin}`);
