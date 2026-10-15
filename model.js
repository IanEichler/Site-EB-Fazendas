export const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icon = name => `<svg${name === 'whatsapp' ? ' class="icon-whatsapp"' : ''} aria-hidden="true"><use href="#i-${name}"/></svg>`;
export const num = value => new Intl.NumberFormat('pt-BR').format(value);
export const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const states = {MT:'Mato Grosso', MS:'Mato Grosso do Sul', GO:'Goiás'};
export const featured = [2,4,7,11,12,15];
export const type = p => p.tipoImovel?.nome || 'Propriedade';
export const apt = p => p.aptidao?.nome || 'Consultar aptidão';
export const title = p => `${type(p)} em ${p.cidade.nome}`;
export const ref = p => `EB${String(p.id).padStart(3,'0')}`;
export const link = p => `/imovel/${p.id}`;
export const original = p => `https://ebfazendas.com.br/imovel/${p.id}`;
export const propertyUrl = (p, origin) => new URL(link(p), origin).href;
export const wa = (message = 'Olá! Gostaria de conversar com a equipe EB Fazendas.') => `https://wa.me/5566999181362?text=${encodeURIComponent(message)}`;
export const propertyInterest = (p, origin) => `Olá! Tenho interesse nesta propriedade: ${title(p)} · ${ref(p)}\n${propertyUrl(p, origin)}`;
export function price(p, decimal = false) {
  if (!p.valor) return 'Valor sob consulta';
  const digits = decimal && p.tipoPrecificacao?.exibirDecimal ? 2 : 0;
  return [p.tipoPrecificacao?.prefixo || '', new Intl.NumberFormat('pt-BR', {minimumFractionDigits:digits, maximumFractionDigits:digits}).format(p.valor), p.tipoPrecificacao?.sufixo || ''].filter(Boolean).join(' ');
}
export function photoList(p) {
  const list = p.fotos.map((photo,i) => ({src:photo.local, thumb:photo.thumb || photo.local, alt:`Foto ${i+1} de ${title(p)}, ${p.cidade.uf}`}));
  const cover = p.id === 2 ? 'assets/fazenda-27.jpg' : p.cover;
  return [...list.filter(photo=>photo.src===cover), ...list.filter(photo=>photo.src!==cover)];
}
export function coverImage(p) {
  const image = p.cardImage;
  return `<picture>${image ? `<source type="image/webp" srcset="${e(image.small)} 480w, ${e(image.large)} 800w" sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1100px) 45vw, 420px">` : ''}<img src="${e(p.cover)}" alt="${e(title(p))}, ${e(p.cidade.uf)}" width="${image?.width || 1280}" height="${image?.height || 720}" loading="lazy" decoding="async"></picture>`;
}
export function card(p) {
  return `<article class="property-card"><div class="card-image"><a href="${link(p)}" aria-label="Conhecer ${e(title(p))}">${coverImage(p)}<span class="card-photo-count">${icon('grid')} ${p.fotos.length} fotos</span></a><span class="property-badge">${e(p.aptidao?.nome || type(p))}</span><button class="card-save" data-save="${p.id}" data-title="${e(title(p))}" aria-label="Salvar: ${e(title(p))}" aria-pressed="false">${icon('heart')}</button></div><div class="card-content"><p class="card-location">${icon('pin')}${e(p.cidade.nome)} · ${e(p.cidade.uf)}</p><h3><a href="${link(p)}">${e(title(p))}</a></h3><div class="card-facts"><span>${icon('area')}<strong>${num(p.area)} <small>ha</small></strong></span><span class="card-reference">Ref. ${ref(p)}</span></div><div class="card-value"><strong class="${p.tipoPrecificacao?.id===2 ? 'soy-price' : ''}">${e(price(p))}</strong>${p.vendido ? '<span>Vendido</span>' : ''}</div><a class="card-detail-button" href="${link(p)}" aria-label="Ver detalhes de ${e(title(p))}">Conhecer propriedade ${icon('up-right')}</a></div></article>`;
}
