import {title, ref, price, num, states, link} from './model.js';

export function pageMetadata(pathname, properties, origin) {
  const path = pathname.replace(/\/$/, '') || '/';
  const property = properties.find(p => link(p) === path);
  const definitions = {
    '/': ['home', 'EB Fazendas · Uma boa terra muda tudo.', 'Encontre fazendas e sítios em Mato Grosso, Mato Grosso do Sul e Goiás. Conheça as oportunidades e converse com a equipe EB Fazendas.'],
    '/propriedades': ['catalog', 'Fazendas e sítios à venda · EB Fazendas', 'Explore o catálogo da EB Fazendas. Filtre por cidade, estado, aptidão, área e investimento para encontrar sua próxima propriedade rural.'],
    '/quero-vender': ['sell', 'Venda sua propriedade · EB Fazendas', 'Quer vender uma fazenda ou sítio? Converse com a equipe EB Fazendas sobre a localização, a estrutura e o potencial da sua propriedade.'],
    '/contato': ['contact', 'Fale com a equipe · EB Fazendas', 'Converse com a EB Fazendas para comprar, vender ou agendar uma visita. Atendimento por WhatsApp, telefone e e-mail, em Cuiabá, Mato Grosso.']
  };
  const [route, pageTitle, description] = property
    ? ['property', `${title(property)} · ${ref(property)} · EB Fazendas`, `${title(property)}, ${states[property.cidade.uf]}. ${num(property.area)} hectares. ${price(property)}. Conheça as fotos e os detalhes e agende uma visita com a EB Fazendas.`]
    : definitions[path] || ['404', 'Página não encontrada · EB Fazendas', 'Explore as propriedades disponíveis no catálogo da EB Fazendas.'];
  const url = new URL(path, origin).href;
  const image = new URL(property?.cover || 'assets/hero/paisagem-campo-social.jpg', origin).href;
  const breadcrumbs = [
    {name:'Início', url:new URL('/', origin).href},
    ...(property ? [{name:'Propriedades', url:new URL('/propriedades', origin).href}] : []),
    ...(path !== '/' ? [{name:property ? title(property) : pageTitle.split(' · ')[0], url}] : [])
  ];
  const schema = {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'Organization', '@id':new URL('/#organization',origin).href, name:'EB Fazendas', url:new URL('/',origin).href,
        logo:new URL('/assets/logo-original.png',origin).href, telephone:'+5566999181362', email:'ebfazendas@estanciabahia.com.br',
        sameAs:['https://www.instagram.com/ebfazendas/']},
      {'@type':'WebPage', '@id':url, url, name:pageTitle, description, inLanguage:'pt-BR', image,
        publisher:{'@id':new URL('/#organization',origin).href}},
      {'@type':'BreadcrumbList', itemListElement:breadcrumbs.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:item.url}))}
    ]
  };
  return {route, property, path, title:pageTitle, description, url, image, imageAlt:property ? title(property) : 'Paisagem do campo brasileiro · EB Fazendas', imageWidth:property?.cardImage?.width || 1600, imageHeight:property?.cardImage?.height || 900, schema};
}

export function applyMetadata(meta, {search=''}={}) {
  document.title = meta.title;
  function tag(selector, attributes) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
      document.head.append(element);
    }
    for (const [key,value] of Object.entries(attributes)) element.setAttribute(key,value);
  }
  tag('meta[name="description"]', {name:'description',content:meta.description});
  tag('link[rel="canonical"]', {rel:'canonical',href:meta.url});
  const values = {'og:type':'website','og:site_name':'EB Fazendas','og:locale':'pt_BR','og:title':meta.title,'og:description':meta.description,'og:url':meta.url,'og:image':meta.image,'og:image:alt':meta.imageAlt,'og:image:width':meta.imageWidth,'og:image:height':meta.imageHeight};
  for (const [property,content] of Object.entries(values)) tag(`meta[property="${property}"]`,{property,content});
  for (const [name,content] of Object.entries({'twitter:card':'summary_large_image','twitter:title':meta.title,'twitter:description':meta.description,'twitter:image':meta.image})) tag(`meta[name="${name}"]`,{name,content});
  const restricted = meta.route === '404' || new URLSearchParams(search).has('favoritos') || document.head.querySelector('meta[name="site-environment"]')?.content === 'preview';
  tag('meta[name="robots"]', {name:'robots',content:restricted ? 'noindex,follow' : 'index,follow'});
  let schema = document.getElementById('page-schema');
  if (!schema) {schema=document.createElement('script');schema.id='page-schema';schema.type='application/ld+json';document.head.append(schema);}
  schema.textContent = JSON.stringify(meta.schema);
}
