const mobile = window.matchMedia('(max-width: 760px)');
const filterDialog = document.querySelector('#mobile-filters-dialog');
const floatingWhatsApp = document.querySelector('.floating-whatsapp');
let filterSidebar, filterPlaceholder, filterOpener, actionObserver, contactSizeObserver;

export function closeMobileUI({restoreFocus = false} = {}) {
  if (filterDialog?.open) filterDialog.close();
  restoreFilterSidebar(restoreFocus);
}

function restoreFilterSidebar(restoreFocus = true) {
  if (filterSidebar && filterPlaceholder?.isConnected) filterPlaceholder.replaceWith(filterSidebar);
  else filterSidebar?.remove();
  filterSidebar?.classList.remove('is-open');
  filterSidebar = null;
  filterPlaceholder = null;
  document.body.classList.remove('filters-open');
  filterOpener?.setAttribute('aria-expanded', 'false');
  if (restoreFocus && filterOpener?.isConnected) filterOpener.focus({preventScroll: true});
  filterOpener = null;
}

export function openMobileFilters() {
  if (!mobile.matches || !filterDialog || filterDialog.open) return;
  filterSidebar = document.querySelector('#catalog-filters');
  if (!filterSidebar) return;
  filterOpener = document.querySelector('.mobile-filter-toggle');
  filterPlaceholder = document.createComment('catalog filters return here');
  filterSidebar.before(filterPlaceholder);
  filterSidebar.classList.remove('motion-pending');
  filterSidebar.dataset.motion = 'visible';
  filterSidebar.classList.add('is-open');
  filterDialog.querySelector('.filters-dialog-body').append(filterSidebar);
  document.body.classList.add('filters-open');
  filterOpener?.setAttribute('aria-expanded', 'true');
  updateMobileFilterCount();
  filterDialog.showModal();
}

export function updateMobileFilterCount() {
  const submit = document.querySelector('#catalog-filters-form button[type="submit"]');
  const count = document.querySelector('#results-count strong')?.textContent;
  if (submit?.firstChild && count) submit.firstChild.textContent = mobile.matches
    ? `Ver ${count} ${count === '1' ? 'propriedade' : 'propriedades'} ` : 'Aplicar filtros ';
  const opener = document.querySelector('.mobile-filter-toggle');
  if (opener) {
    const params = new URLSearchParams(location.search);
    const count = [...params.keys()].filter(key => !['ordem', 'pagina'].includes(key)).length;
    opener.querySelector('.filter-count')?.remove();
    if (count) {
      const badge = document.createElement('span');
      badge.className = 'filter-count';
      badge.textContent = count;
      opener.append(badge);
    }
  }
}

export function resetMobileFilters(button) {
  if (!filterDialog?.open || !filterDialog.contains(button)) return false;
  const form = document.querySelector('#catalog-filters-form');
  for (const input of form.elements) {
    if (input.tagName === 'SELECT') input.selectedIndex = 0;
    else if (input.type === 'checkbox') input.checked = false;
    else if (input.tagName === 'INPUT') input.value = '';
  }
  document.querySelector('#catalog-sort').value = 'relevancia';
  form.dispatchEvent(new Event('change', {bubbles: true}));
  return true;
}

export function refreshMobileExperience() {
  actionObserver?.disconnect();
  contactSizeObserver?.disconnect();
  document.body.style.removeProperty('--mobile-contact-height');
  const directLink = document.querySelector('.direct-whatsapp, .investment-card .whatsapp-link');
  floatingWhatsApp.href = directLink?.href || 'https://wa.me/5566999181362';
  floatingWhatsApp.hidden = false;
  updateMobileFilterCount();
  if (!mobile.matches) return;
  if (document.body.dataset.route === 'property') {
    floatingWhatsApp.hidden = true;
    const bar = document.querySelector('.mobile-contact');
    if (bar && 'ResizeObserver' in window) {
      contactSizeObserver = new ResizeObserver(() => {
        document.body.style.setProperty('--mobile-contact-height', `${Math.ceil(bar.getBoundingClientRect().height)}px`);
      });
      contactSizeObserver.observe(bar);
    }
    return;
  }
  if (!('IntersectionObserver' in window)) return;
  const visible = new Set();
  actionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    floatingWhatsApp.hidden = visible.size > 0;
  }, {threshold: 0});
  document.querySelectorAll('#view a.button[href^="https://wa.me/"], .home-hero, .home-search-section')
    .forEach(element => actionObserver.observe(element));
}

filterDialog?.addEventListener('close', () => restoreFilterSidebar());
filterDialog?.addEventListener('click', event => {
  if (event.target === filterDialog || event.target.closest('.filters-close')) filterDialog.close();
});
document.addEventListener('submit', event => {
  if (event.target.id === 'catalog-filters-form' && filterDialog?.open) closeMobileUI({restoreFocus: true});
});
document.addEventListener('click', event => {
  const toggle = event.target.closest('[data-advanced-search]');
  if (toggle) {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    const fields=document.querySelector('#home-advanced-fields');
    if(fields){fields.hidden=!open;fields.classList.toggle('is-open',open);}
    toggle.querySelector('span').textContent = open ? 'Menos filtros' : 'Mais filtros';
  }
  const menu = document.querySelector('.main-nav');
  if (mobile.matches && menu.classList.contains('open') && !event.target.closest('.global-header'))
    document.querySelector('.menu-toggle').click();
});

// Horizontal gestures change photos; vertical gestures and pinch zoom stay native.
let touchStart;
const gallery = document.querySelector('.gallery-stage');
gallery?.addEventListener('pointerdown', event => {
  touchStart = event.isPrimary && event.pointerType === 'touch' && !event.target.closest('button')
    ? {x: event.clientX, y: event.clientY, id: event.pointerId} : null;
}, {passive: true});
gallery?.addEventListener('pointercancel', () => { touchStart = null; }, {passive: true});
gallery?.addEventListener('pointerup', event => {
  if (!touchStart || touchStart.id !== event.pointerId) return;
  const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4)
    document.querySelector(dx < 0 ? '#gallery-next' : '#gallery-prev').click();
}, {passive: true});

mobile.addEventListener('change', () => {
  if (!mobile.matches) closeMobileUI();
  refreshMobileExperience();
});
