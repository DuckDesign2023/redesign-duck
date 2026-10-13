/* duck.design — страница AI Design: видео в карточках возможностей и стрелки ленты.
   Видео играет один раз: под указателем, по фокусу с клавиатуры или по нажатию; заново —
   только когда доиграло. При prefers-reduced-motion — только по нажатию, видео первого экрана стоит. */
(function () {
  'use strict';

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  var hero = document.querySelector('.dd-aid-hero__bg video');
  if (hero && calm.matches) {
    hero.removeAttribute('autoplay');
    hero.pause();
  }

  document.querySelectorAll('.dd-aid-cap__media').forEach(function (media) {
    var video = media.querySelector('video');
    var button = media.querySelector('.dd-aid-cap__play');
    if (!video || !button) return;

    function play() {
      if (!video.paused && !video.ended) return;
      video.currentTime = 0;
      var started = video.play();
      if (started && started.catch) started.catch(function () {});
    }

    video.addEventListener('playing', function () { media.classList.add('is-playing'); });
    video.addEventListener('ended', function () { media.classList.remove('is-playing'); });
    video.addEventListener('pause', function () { media.classList.remove('is-playing'); });

    button.addEventListener('click', play);
    media.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse' && !calm.matches) play();
    });
  });

  var scroller = document.querySelector('.dd-aid-caps__scroller');
  var prev = document.querySelector('.dd-aid-caps__prev');
  var next = document.querySelector('.dd-aid-caps__next');
  if (!scroller || !prev || !next) return;

  function step() {
    var card = scroller.querySelector('.dd-aid-cap');
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
