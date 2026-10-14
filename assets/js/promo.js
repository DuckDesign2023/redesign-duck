/* duck.design — промо-страница: стрелки ленты историй клиентов.
   Листают по одной карточке и выключаются у края; без скрипта лента листается пальцем
   и с клавиатуры. При prefers-reduced-motion — без плавной прокрутки. */
(function () {
  'use strict';

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var scroller = document.querySelector('.dd-promo-stories__scroller');
  var prev = document.querySelector('.dd-promo-stories__prev');
  var next = document.querySelector('.dd-promo-stories__next');
  if (!scroller || !prev || !next) return;

  function step() {
    var card = scroller.querySelector('.dd-promo-story');
    var gap = parseFloat(getComputedStyle(card.parentNode).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }
  function sync() {
    var max = scroller.scrollWidth - scroller.clientWidth - 1;
    prev.setAttribute('aria-disabled', scroller.scrollLeft <= 0 ? 'true' : 'false');
    next.setAttribute('aria-disabled', scroller.scrollLeft >= max ? 'true' : 'false');
  }
  function go(dir) {
    scroller.scrollBy({ left: dir * step(), behavior: calm.matches ? 'auto' : 'smooth' });
  }
  prev.addEventListener('click', function () { if (prev.getAttribute('aria-disabled') !== 'true') go(-1); });
  next.addEventListener('click', function () { if (next.getAttribute('aria-disabled') !== 'true') go(1); });
  scroller.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
