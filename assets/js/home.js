/* duck.design — главная. Тогл в заголовке «Here's how to get started» — общий, включает его blocks.js. */

/* Лента шагов листается прокруткой страницы (22.10.2026, вариант с дубля главной; бегунка нет).
   Обёртка .dd-steps-pin получает высоту «секция + путь ленты / SPEED», секция в ней прилипает
   (home.css). Пока секция стоит, прокрутка страницы двигает ленту в SPEED раз быстрее, а лента
   не прыгает за щелчком колеса — догоняет нужное место, каждый кадр проходя долю EASE от остатка.
   Прилипает по низу окна: низ карточек в GAP от низа малой высоты окна (100svh), поэтому на телефоне
   положение не меняется, когда прячется адресная строка. При «уменьшить движение» — обычная лента. */
(function () {
  var pin = document.querySelector('.dd-steps-pin');
  var sec = pin && pin.querySelector('.dd-steps');
  var scroller = sec && sec.querySelector('.dd-steps__scroller');
  if (!scroller) return;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var phone = window.matchMedia('(max-width: 833.98px)');
  var SPEED = 2;
  var EASE = .12;
  var on = false, run = 0, top = 0, target = 0, now = 0, raf = 0;

  /* секция встаёт, когда верх обёртки доходит до top; дальше run / SPEED пикселей прокрутки она
     листает ленту. getBoundingClientRect обёртки — на случай, если выше что-то догрузилось */
  function want() {
    var y = -pin.getBoundingClientRect().top + top;
    return Math.min(run, Math.max(0, y * SPEED));
  }
  function put(x) { now = x; scroller.scrollLeft = x; }
  function step() {
    var d = target - now;
    put(Math.abs(d) < .5 ? target : now + d * EASE);
    raf = now === target ? 0 : window.requestAnimationFrame(step);
  }
  function sync() {
    if (!on) return;
    target = want();
    if (!raf) raf = window.requestAnimationFrame(step);
  }
  function layout() {
    on = !calm.matches;
    pin.classList.toggle('is-pinned', on);
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    if (!on) { pin.style.height = ''; sec.style.removeProperty('--_pin-top'); return; }
    run = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    var gap = phone.matches ? 24 : 80;
    var cardsEnd = scroller.getBoundingClientRect().bottom - sec.getBoundingClientRect().top;
    sec.style.setProperty('--_pin-top', 'calc(100svh - ' + Math.round(gap + cardsEnd) + 'px)');
    top = parseFloat(getComputedStyle(sec).top) || 0;
    pin.style.height = sec.offsetHeight + Math.round(run / SPEED) + 'px';
    target = want();
    put(target);
  }

  window.addEventListener('scroll', sync, { passive: true });
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    /* на телефоне высота окна меняется от адресной строки — там пересчёт только при смене ширины */
    if (window.innerWidth !== lastW || !phone.matches) { lastW = window.innerWidth; layout(); }
  });
  phone.addEventListener('change', layout);
  calm.addEventListener('change', layout);
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(sec);
  layout();
})();

/* Сцены двух карточек (.dd-duo): вариант движения из ?duo=1|2|3 (по умолчанию 1) — в data-duo
   секции, пока пользователь выбирает. Сцене — is-armed, если движение разрешено, и is-in, пока
   она видна на треть; ушла из окна целиком — is-in снимается, вход играет заново. */
(function () {
  var duo = document.querySelector('.dd-duo');
  if (!duo) return;
  var v = new URLSearchParams(location.search).get('duo');
  duo.setAttribute('data-duo', /^[123]$/.test(v) ? v : '1');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.intersectionRatio >= .33) e.target.classList.add('is-in');
      else if (!e.isIntersecting) e.target.classList.remove('is-in');
    });
  }, { threshold: [0, .33] });
  duo.querySelectorAll('.dd-duo__scene').forEach(function (s) {
    s.classList.add('is-armed');
    io.observe(s);
  });
})();
