/* duck.design — дубль главной (index-pin.html): лента шагов листается прокруткой страницы.
   Обёртка .dd-steps-pin получает высоту «секция + путь ленты / скорость», секция в ней прилипает
   (home-pin.css). Пока секция стоит, прокрутка страницы двигает ленту в SPEED раз быстрее,
   а сама лента не прыгает за каждым щелчком колеса, а догоняет нужное место: каждый кадр
   проходит долю EASE от остатка. Обратно тоже: клавиши и горизонтальный свайп листают ленту —
   страница идёт следом. Бегунок в этом режиме скрыт (home-pin.css). Колесо над лентой больше
   не листает её вбок, а прокручивает страницу.
   Подбор на живой странице: ?speed=1.5|2|3 (по умолчанию 2), ?ease=.08….3 (по умолчанию .12;
   меньше — плавнее и с большим хвостом). */
(function () {
  var pin = document.querySelector('.dd-steps-pin');
  if (!pin) return;
  var sec = pin.querySelector('.dd-steps');
  var scroller = sec && sec.querySelector('.dd-steps__scroller');
  if (!scroller) return;
  var wide = window.matchMedia('(min-width: 834px)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var q = new URLSearchParams(location.search);
  var SPEED = Math.min(4, Math.max(1, parseFloat(q.get('speed')) || 2));
  var EASE = Math.min(1, Math.max(.04, parseFloat(q.get('ease')) || .12));
  var GAP = 80; /* низ карточек — в 80 от низа окна (просьба пользователя 21.10.2026; пробовали 60 и 20) */
  var on = false;
  var top = 0;
  var run = 0;

  /* прокрутка страницы, с которой секция стоит; дальше run / SPEED пикселей она листает ленту */
  function start() { return pin.getBoundingClientRect().top + window.scrollY - top; }
  function want() { return Math.min(run, Math.max(0, (window.scrollY - start()) * SPEED)); }

  /* mine — последнее значение, которое поставил сам скрипт: событие прокрутки ленты приходит
     кадром позже, и отличить своё движение от чужого можно только по нему */
  var mine = 0;
  var target = 0;
  var raf = 0;
  function put(x) { mine = x; scroller.scrollLeft = x; }
  function step() {
    var d = target - mine;
    put(Math.abs(d) < .5 ? target : mine + d * EASE);
    raf = mine === target ? 0 : window.requestAnimationFrame(step);
  }
  function sync() {
    if (!on) return;
    target = want();
    if (!raf) raf = window.requestAnimationFrame(step);
  }

  function layout() {
    on = wide.matches && !calm.matches;
    pin.classList.toggle('is-pinned', on);
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    if (!on) { pin.style.height = ''; sec.style.top = ''; return; }
    run = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    /* по низу окна: нижний отступ секции уходит под край окна */
    var cardsEnd = scroller.getBoundingClientRect().bottom - sec.getBoundingClientRect().top;
    top = Math.round(window.innerHeight - GAP - cardsEnd);
    sec.style.top = top + 'px';
    pin.style.height = sec.offsetHeight + Math.round(run / SPEED) + 'px';
    target = want();
    put(target); /* при загрузке и смене размера — сразу на место, без догона */
  }

  window.addEventListener('scroll', sync, { passive: true });
  /* ленту сдвинул не скрипт (клавиши, свайп) — догон отменяется, страница встаёт по ленте */
  scroller.addEventListener('scroll', function () {
    if (!on || Math.abs(scroller.scrollLeft - mine) < 1) return;
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    mine = target = scroller.scrollLeft;
    window.scrollTo({ top: start() + mine / SPEED, behavior: 'instant' });
  }, { passive: true });
  /* колесо уходит странице: обработчик ленты из home.js его не получает */
  sec.addEventListener('wheel', function (e) { if (on) e.stopPropagation(); }, { capture: true, passive: true });

  window.addEventListener('resize', layout);
  wide.addEventListener('change', layout);
  calm.addEventListener('change', layout);
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(sec);
  layout();
})();
