import {e} from './model.js';
import {createPages} from './pages.js';
import {pageMetadata} from './seo.js';

export function renderDocument(template, properties, {pathname='/', search='', origin='http://localhost:3000', noindex=false}={}) {
  const meta = pageMetadata(pathname,properties,origin);
  const pages = createPages(properties,{origin,search});
  const content = meta.route === 'property' ? pages.detail(meta.property)
    : meta.route === 'home' ? pages.home()
    : meta.route === 'catalog' ? pages.catalog()
    : meta.route === 'sell' ? pages.contact(true)
    : meta.route === 'contact' ? pages.contact()
    : pages.notFound();
  const robots = noindex || meta.route === '404' || new URLSearchParams(search).has('favoritos') ? 'noindex,follow' : 'index,follow';
  const tags = {
    'og:type':'website', 'og:site_name':'EB Fazendas', 'og:locale':'pt_BR',
    'og:title':meta.title, 'og:description':meta.description, 'og:url':meta.url,
    'og:image':meta.image, 'og:image:alt':meta.imageAlt,
    'og:image:width':meta.imageWidth, 'og:image:height':meta.imageHeight
  };
  const metadata = `<link rel="canonical" href="${e(meta.url)}"><meta name="robots" content="${robots}"><meta name="site-environment" content="${noindex ? 'preview' : 'production'}">`
    + Object.entries(tags).map(([property,content])=>`<meta property="${property}" content="${e(content)}">`).join('')
    + `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(meta.title)}"><meta name="twitter:description" content="${e(meta.description)}"><meta name="twitter:image" content="${e(meta.image)}">`
    + `<script type="application/ld+json" id="page-schema">${JSON.stringify(meta.schema).replace(/</g,'\\u003c')}</script>`;
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/,`<title>${e(meta.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${e(meta.description)}">`)
    .replace('</head>',`${metadata}</head>`)
    .replace('<body id="top">',`<body id="top" data-route="${meta.route}">`)
    .replace(/<main id="view"[^>]*>[\s\S]*?<\/main>/,()=>`<main id="view" tabindex="-1">${content}</main>`)
    .replace('<div id="mobile-detail"></div>',()=>`<div id="mobile-detail">${meta.property ? pages.mobileBar(meta.property) : ''}</div>`)
    .replace(`data-nav="${meta.route}"`,`data-nav="${meta.route}" aria-current="page"`);
  return {html, status:meta.route === '404' ? 404 : 200, meta};
}
