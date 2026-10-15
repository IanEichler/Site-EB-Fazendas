'use strict';

const originalUrl = 'https://ebfazendas.com.br/imovel/2';
const preferredOrder = [27, 1, 9, 29, 22];
const photoOrder = [...preferredOrder, ...Array.from({ length: 31 }, (_, i) => i + 1).filter(n => !preferredOrder.includes(n))];
const descriptions = {
  1: 'Vista aérea da sede e das estruturas da fazenda',
  4: 'Casa sede da propriedade em Jaciara',
  8: 'Rebanho e bebedouro nas pastagens',
  9: 'Vista aérea do curral e da estrutura pecuária',
  10: 'Curral e pastagens da fazenda',
  11: 'Água e vegetação nativa da propriedade',
  18: 'Estrutura de manejo do gado',
  27: 'Vista panorâmica dos campos e da sede da fazenda em Jaciara',
  29: 'Água cercada por vegetação nativa na fazenda'
};
const photos = photoOrder.map((n, i) => ({
  src: `assets/fazenda-${String(n).padStart(2, '0')}.jpg`,
  alt: descriptions[n] || `Vista ${i + 1} das pastagens e da paisagem da fazenda em Jaciara`
}));
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const twoDigits = value => String(value).padStart(2, '0');
let toastTimer;

function notify(message) {
  clearTimeout(toastTimer);
  $('#toast span').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3400);
}

// The gallery uses the actual 31 photographs from the original property listing.
let heroIndex = 0;
let heroTimer;
function changeHero(direction) {
  heroIndex = (heroIndex + direction + photos.length) % photos.length;
  const image = $('#hero-photo');
  image.classList.add('is-changing');
  clearTimeout(heroTimer);
  heroTimer = setTimeout(() => {
    image.src = photos[heroIndex].src;
    image.alt = photos[heroIndex].alt;
    $('#hero-counter').innerHTML = `${twoDigits(heroIndex + 1)} <i>/ ${photos.length}</i>`;
    image.classList.remove('is-changing');
  }, 170);
}
$('#hero-prev').addEventListener('click', () => changeHero(-1));
$('#hero-next').addEventListener('click', () => changeHero(1));

const gallery = $('#gallery-dialog');
let galleryIndex = 0;
const thumbnailFragment = document.createDocumentFragment();
photos.forEach((photo, index) => {
  const button = document.createElement('button');
  button.className = 'gallery-thumb';
  button.setAttribute('aria-label', `Ver foto ${index + 1}: ${photo.alt}`);
  button.setAttribute('aria-pressed', 'false');
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = '';
  img.loading = 'lazy';
  button.append(img);
  button.addEventListener('click', () => updateGallery(index));
  thumbnailFragment.append(button);
});
$('#gallery-thumbnails').append(thumbnailFragment);

function updateGallery(index) {
  galleryIndex = (index + photos.length) % photos.length;
  const photo = photos[galleryIndex];
  $('#gallery-image').src = photo.src;
  $('#gallery-image').alt = photo.alt;
  $('#gallery-counter').textContent = `${twoDigits(galleryIndex + 1)} / ${photos.length}`;
  $$('.gallery-thumb').forEach((button, i) => {
    button.classList.toggle('active', i === galleryIndex);
    button.setAttribute('aria-pressed', String(i === galleryIndex));
  });
  if (gallery.open) $('.gallery-thumb.active').scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
}

$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  const isHeroGallery = button.classList.contains('gallery-open');
  updateGallery(isHeroGallery ? heroIndex : Number(button.dataset.gallery));
  gallery.showModal();
  document.body.classList.add('modal-open');
  $('.gallery-thumb.active').scrollIntoView({ block: 'nearest', inline: 'center' });
}));
$('.dialog-close').addEventListener('click', () => gallery.close());
$('#gallery-prev').addEventListener('click', () => updateGallery(galleryIndex - 1));
$('#gallery-next').addEventListener('click', () => updateGallery(galleryIndex + 1));
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    updateGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
gallery.addEventListener('click', event => { if (event.target === gallery) gallery.close(); });
gallery.addEventListener('close', () => document.body.classList.remove('modal-open'));

// Save a property on this device; storage may be unavailable in private contexts.
const favorite = $('#favorite');
let isFavorite = false;
try { isFavorite = localStorage.getItem('eb-fazendas-favorite-2') === 'true'; } catch {}
function renderFavorite() {
  favorite.setAttribute('aria-pressed', String(isFavorite));
  favorite.setAttribute('aria-label', isFavorite ? 'Remover propriedade dos favoritos' : 'Salvar propriedade');
  favorite.querySelector('span').textContent = isFavorite ? 'Salvo' : 'Salvar';
}
renderFavorite();
favorite.addEventListener('click', () => {
  isFavorite = !isFavorite;
  try { localStorage.setItem('eb-fazendas-favorite-2', String(isFavorite)); } catch {}
  renderFavorite();
  notify(isFavorite ? 'Propriedade salva nos seus favoritos.' : 'Propriedade removida dos favoritos.');
});
$('#share').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(originalUrl);
    notify('Link do imóvel copiado. Pronto para compartilhar.');
  } catch {
    const link = document.createElement('a');
    link.href = `https://wa.me/?text=${encodeURIComponent(`Conheça esta fazenda em Jaciara: ${originalUrl}`)}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  }
});

// The video player is only loaded when requested, and stops when the dialog closes.
const videoDialog = $('#video-dialog');
$$('[data-video]').forEach(button => button.addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/-jVXfUX8YTQ?autoplay=1&rel=0';
  iframe.title = 'Vídeo original da fazenda em Jaciara — EB Fazendas';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  $('#video-container').replaceChildren(iframe);
  videoDialog.showModal();
  document.body.classList.add('modal-open');
}));
$('.video-close').addEventListener('click', () => videoDialog.close());
videoDialog.addEventListener('click', event => { if (event.target === videoDialog) videoDialog.close(); });
videoDialog.addEventListener('close', () => {
  $('#video-container').replaceChildren();
  document.body.classList.remove('modal-open');
});

// Mobile navigation.
const menuToggle = $('.menu-toggle');
function closeMenu() {
  $('#main-nav').classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  menuToggle.querySelector('use').setAttribute('href', '#i-menu');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  $('#main-nav').classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menuToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
});
$$('.main-nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

// Contact form prepares a message for the visitor to review and send in WhatsApp.
const contactForm = $('#contact-form');
const phoneInput = contactForm.elements.phone;
phoneInput.addEventListener('input', () => {
  phoneInput.setCustomValidity('');
  const digits = phoneInput.value.replace(/\D/g, '').slice(0, 11);
  let value = digits;
  if (digits.length > 2) value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length > 6) {
    const split = digits.length === 11 ? 7 : 6;
    value = `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`;
  }
  phoneInput.value = value;
});
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const digits = phoneInput.value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    phoneInput.setCustomValidity('Informe um telefone com DDD e 10 ou 11 dígitos.');
    phoneInput.reportValidity();
    return;
  }
  phoneInput.setCustomValidity('');
  const data = new FormData(contactForm);
  const lines = [
    'Olá, equipe EB Fazendas!',
    '',
    `Meu nome é ${String(data.get('name')).trim()}.`,
    `Telefone: ${String(data.get('phone')).trim()}`,
  ];
  const email = String(data.get('email')).trim();
  if (email) lines.push(`E-mail: ${email}`);
  lines.push('', String(data.get('message')).trim(), '', `Imóvel: Fazenda em Jaciara · Ref. EB002`, originalUrl);
  window.open(`https://wa.me/5566999181362?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
  notify('Mensagem preparada para você revisar no WhatsApp.');
});

$('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-motion');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    $$('.reveal').forEach(element => revealObserver.observe(element));
  }
  const sectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        $$('.section-nav>div:first-child>a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    }
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  ['propriedade', 'galeria', 'caracteristicas', 'localizacao'].forEach(id => sectionObserver.observe(document.getElementById(id)));
}
