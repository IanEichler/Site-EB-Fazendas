import {cp, mkdir, readFile, rm, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, 'dist');
// Only the generated directory inside this project may be replaced.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error('Diretório de saída inválido.');
}

const publicFiles = [
  'index.html', 'styles.css', 'site.css', 'brown.css', 'typography.css',
  'motion.css', 'mobile.css', 'site.js', 'motion.js', 'mobile.js'
];
const properties = JSON.parse(await readFile(path.join(root, 'data/properties.json'), 'utf8'));
const photos = properties.flatMap(property => property.fotos.map(photo => photo.local));
const required = new Set([...publicFiles, 'assets/logo-original.png', ...photos, ...properties.map(property => property.cover)]);
for (const relative of required) {
  if (typeof relative !== 'string') throw new Error('Um imóvel está sem arquivo local.');
  const source = path.resolve(root, relative);
  const withinRoot = path.relative(root, source);
  if (withinRoot.startsWith('..') || path.isAbsolute(withinRoot)) throw new Error(`Caminho inválido: ${relative}`);
  if (!(await stat(source)).isFile()) throw new Error(`Arquivo não encontrado: ${relative}`);
}

console.log(`Saída verificada: ${output}`);
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
for (const file of publicFiles) await cp(path.join(root, file), path.join(output, file));
for (const directory of ['assets', 'data']) {
  await cp(path.join(root, directory), path.join(output, directory), {recursive: true});
}
// Vercel serves this document for unknown URLs; the app renders its own 404 view.
await cp(path.join(root, 'index.html'), path.join(output, '404.html'));
console.log(`Build concluído: ${properties.length} propriedades e ${photos.length} fotos locais.`);
