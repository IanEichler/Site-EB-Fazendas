import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPages} from '../pages.js';
import {renderDocument} from '../document.mjs';
import {propertyInterest, propertyUrl, link, ref} from '../model.js';

const properties = JSON.parse(await readFile(new URL('../data/properties.json',import.meta.url),'utf8'));
const template = await readFile(new URL('../index.html',import.meta.url),'utf8');
const origin = 'https://novo-site.example';

test('contato e compartilhamento mantêm o visitante no domínio do novo site', () => {
  for (const property of properties) {
    assert.equal(propertyUrl(property,origin),origin+link(property));
    assert.ok(propertyInterest(property,origin).includes(origin+link(property)));
    const html=createPages(properties,{origin}).detail(property);
    const contacts=[...html.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)];
    assert.ok(contacts.length);
    for (const [,href] of contacts) {
      const message=new URL(href).searchParams.get('text');
      assert.ok(message.includes(origin+link(property)));
      assert.ok(!message.includes('https://ebfazendas.com.br/imovel/'));
    }
  }
});

test('todos os imóveis têm conteúdo, canonical e prévia no HTML inicial', () => {
  const titles=new Set();
  for (const property of properties) {
    const {html,status,meta}=renderDocument(template,properties,{pathname:link(property),origin});
    assert.equal(status,200);
    assert.ok(html.includes(`REF. ${ref(property)}`));
    assert.ok(html.includes(`rel="canonical" href="${origin+link(property)}"`));
    assert.ok(html.includes(`property="og:image" content="${origin}/${property.cover}"`));
    assert.ok(html.includes('<main id="view" tabindex="-1"><div class="property-trail'));
    assert.ok(!html.includes('Preparando novos horizontes'));
    const schema=JSON.parse(html.match(/id="page-schema">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@graph'][1].url,origin+link(property));
    titles.add(meta.title);
  }
  assert.equal(titles.size,properties.length);
});

test('filtros preservam favoritos, área e a unidade dos preços', () => {
  const pages=createPages(properties,{origin,favorites:[2]});
  assert.deepEqual(pages.filtered(new URLSearchParams('favoritos=1')).map(p=>p.id),[2]);
  assert.ok(pages.filtered(new URLSearchParams('areaMax=500')).every(p=>p.area<=500));
  const reais=pages.filtered(new URLSearchParams('valorMin=1'));
  assert.ok(reais.length>0);
  assert.ok(reais.every(p=>p.tipoPrecificacao.id===1));
  const filtered=createPages(properties,{origin,search:'?q=EB002'}).catalog();
  assert.equal((filtered.match(/class="property-card"/g)||[]).length,1);
  assert.ok(filtered.includes('1</strong> propriedade encontrada'));
});

test('contato mantém o imóvel escolhido e páginas desconhecidas retornam 404 sem indexação', () => {
  const contact=renderDocument(template,properties,{pathname:'/contato',search:'?imovel=2',origin});
  assert.equal(contact.status,200);
  assert.ok(contact.html.includes('inquiry-property'));
  assert.ok(contact.html.includes(encodeURIComponent(origin+'/imovel/2')));
  const missing=renderDocument(template,properties,{pathname:'/imovel/999999',origin});
  assert.equal(missing.status,404);
  assert.ok(missing.html.includes('name="robots" content="noindex,follow"'));
  const preview=renderDocument(template,properties,{origin,noindex:true});
  assert.ok(preview.html.includes('name="robots" content="noindex,follow"'));
});

test('conteúdo vindo do catálogo é escapado no HTML e nos dados estruturados', () => {
  const property=structuredClone(properties.find(p=>p.id===2));
  property.cidade.nome='Cidade </script><script>alert(1)</script>';
  const {html}=renderDocument(template,[property],{pathname:'/imovel/2',origin});
  assert.ok(!html.includes('<script>alert(1)</script>'));
  const schema=JSON.parse(html.match(/id="page-schema">([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'][1].name.includes(property.cidade.nome));
});
