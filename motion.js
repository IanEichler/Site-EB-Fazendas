/* Progressive motion: content remains visible without JavaScript or animation support. */
const content = document.querySelector('#view');
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const selectors = [
  '.center-section-heading', '.section-heading', '.home-search-wrap',
  '.home-search-footnote', '.category-tabs', '.property-card',
  '.section-bottom-action', '.service-grid article', '.help-copy', '.help-image',
  '.home-contact-copy', '.direct-contact-panel', '.catalog-intro > div',
  '.catalog-sidebar', '.catalog-toolbar', '.sell-banner', '.highlight',
  '.overview-copy', '.investment-card', '.photo-tile', '.features-intro',
  '.feature-accordions details', '.video-banner', '.detail-location > div',
  '.detail-bottom-cta', '.contact-copy', '.seller-copy', '.not-found'
].join(',');
let observer;
let tracked = new WeakSet();
const running = new Set();

function play(element, frames, options) {
  if (preference.matches || !element?.isConnected || !element.animate) return;
  const animation = element.animate(frames, options);
  running.add(animation);
  const cleanup = () => running.delete(animation);
  animation.addEventListener('finish', cleanup, {once: true});
  animation.addEventListener('cancel', cleanup, {once: true});
}

function reveal(element) {
  if (element.dataset.motion === 'visible') return;
  element.dataset.motion = 'visible';
  element.classList.remove('motion-pending');
  const siblings = [...element.parentElement.children].filter(child => child.matches(selectors));
  const compact = window.matchMedia('(max-width: 760px)').matches;
  const stagger = siblings.length > 1 ? (siblings.indexOf(element) % 3) * (compact ? 40 : 75) : 0;
  play(element, [
    {opacity: 0, transform: `translate3d(0, ${compact ? 16 : 24}px, 0)`},
    {opacity: 1, transform: 'translate3d(0, 0, 0)'}
  ], {duration: compact ? 480 : 680, delay: stagger, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards'});
  observer?.unobserve(element);
}

function observe(root) {
  if (preference.matches || !observer || !(root instanceof Element)) return;
  const targets = root.matches(selectors) ? [root, ...root.querySelectorAll(selectors)] : [...root.querySelectorAll(selectors)];
  for (const element of targets) {
    if (tracked.has(element)) continue;
    tracked.add(element);
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom <= 0) {
      element.dataset.motion = 'visible';
      continue;
    }
    element.dataset.motion = 'pending';
    if (bounds.top < window.innerHeight - 24 && bounds.bottom > 0) reveal(element);
    else {
      element.classList.add('motion-pending');
      observer.observe(element);
    }
  }
}

function beginPage() {
  observer?.disconnect();
  for (const animation of running) animation.cancel();
  tracked = new WeakSet();
  if (preference.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
  }, {threshold: 0.06, rootMargin: '0px 0px -24px 0px'});
  observe(content);
}

if (content) {
  beginPage();
  // The site uses client-side navigation; new pages and filtered cards receive motion too.
  new MutationObserver(records => {
    if (records.some(record => record.target === content)) beginPage();
    else for (const record of records) {
      for (const node of record.removedNodes) {
        if (!(node instanceof Element)) continue;
        observer?.unobserve(node);
        node.querySelectorAll('[data-motion]').forEach(element => observer?.unobserve(element));
      }
      for (const node of record.addedNodes) observe(node);
    }
  }).observe(content, {childList: true, subtree: true});

  // Keyboard users see the destination immediately, even before it intersects the viewport.
  document.addEventListener('focusin', event => {
    const pending = event.target.closest('.motion-pending');
    if (pending) reveal(pending);
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-save]');
    if (!button) return;
    play(button.querySelector('svg'), [
      {transform: 'scale(1)'}, {transform: 'scale(1.3)', offset: .45}, {transform: 'scale(1)'}
    ], {duration: 380, easing: 'cubic-bezier(.22, 1, .36, 1)'});
  });
  document.addEventListener('load', event => {
    const image = event.target;
    if (image.id !== 'gallery-image' || !document.querySelector('#gallery-dialog').open) return;
    play(image, [{opacity: .35, transform: 'scale(.985)'}, {opacity: 1, transform: 'scale(1)'}], {
      duration: 300, easing: 'ease-out'
    });
  }, true);

  preference.addEventListener('change', () => {
    observer?.disconnect();
    for (const animation of running) animation.cancel();
    content.querySelectorAll('.motion-pending').forEach(element => {
      element.classList.remove('motion-pending');
      element.dataset.motion = 'visible';
    });
    if (!preference.matches) beginPage();
  });
}
