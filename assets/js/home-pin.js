/* duck.design — дубль главной (index-pin.html): лента шагов листается прокруткой страницы.
   Обёртка .dd-steps-pin получает высоту «секция + длина ленты», секция в ней прилипает
   (home-pin.css). Пока секция стоит, прокрутка страницы переводится в прокрутку ленты 1 : 1.
   Обратно тоже: клавиши и горизонтальный свайп листают ленту — страница идёт следом.
   Бегунок в этом режиме скрыт (home-pin.css). Колесо над лентой больше не листает её вбок,
   а прокручивает страницу. */
(function () {
  var pin = document.querySelector('.dd-steps-pin');
  if (!pin) return;
  var sec = pin.querySelector('.dd-steps');
  var scroller = sec && sec.querySelector('.dd-steps__scroller');
  if (!scroller) return;
  var header = document.querySelector('.dd-header');
  var wide = window.matchMedia('(min-width: 834px)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var on = false;
  var top = 0;
  var run = 0;

  /* прокрутка страницы, с которой секция стоит; дальше run пикселей она листает ленту */
  function start() { return pin.getBoundingClientRect().top + window.scrollY - top; }
  function want() { return Math.min(run, Math.max(0, window.scrollY - start())); }

  function layout() {
    on = wide.matches && !calm.matches;
    pin.classList.toggle('is-pinned', on);
    if (!on) { pin.style.height = ''; sec.style.top = ''; return; }
    run = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    /* по низу окна; если секция помещается под шапкой — под шапкой */
    top = Math.min(header ? header.offsetHeight : 0, window.innerHeight - sec.offsetHeight);
    sec.style.top = top + 'px';
    pin.style.height = sec.offsetHeight + run + 'px';
    sync();
  }

  /* mine — последнее значение, которое поставил сам скрипт: его событие прокрутки ленты
     приходит кадром позже, когда страница уже ушла дальше, и сравнивать надо с ним */
  var mine = 0;
  function sync() {
    if (!on) return;
    mine = want();
    scroller.scrollLeft = mine;
  }

  window.addEventListener('scroll', sync, { passive: true });
  /* ленту сдвинул не скрипт (клавиши, свайп) — страница догоняет её */
  scroller.addEventListener('scroll', function () {
    if (!on || Math.abs(scroller.scrollLeft - mine) < 1) return;
    mine = scroller.scrollLeft;
    window.scrollTo({ top: start() + mine, behavior: 'instant' });
  }, { passive: true });
  /* колесо уходит странице: обработчик ленты из home.js его не получает */
  sec.addEventListener('wheel', function (e) { if (on) e.stopPropagation(); }, { capture: true, passive: true });

  window.addEventListener('resize', layout);
  wide.addEventListener('change', layout);
  calm.addEventListener('change', layout);
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(sec);
  layout();
})();
