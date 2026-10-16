/* duck.design — главная. Тогл в заголовке «Here's how to get started» — общий, включает его blocks.js. */

/* Лента шагов: колесо над лентой листает её вбок, пока есть куда (у края колесо отдаётся
   странице); бегунок под лентой показывает долю видимого и прокрутки, тянется мышью и пальцем,
   нажатие по дорожке — прыжок. Когда лента помещается целиком, бегунка нет. */
(function () {
  var sec = document.querySelector('.dd-steps');
  if (!sec) return;
  var scroller = sec.querySelector('.dd-steps__scroller');
  var bar = sec.querySelector('.dd-steps__bar');
  var thumb = sec.querySelector('.dd-steps__thumb');
  if (!scroller || !bar || !thumb) return;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function max() { return scroller.scrollWidth - scroller.clientWidth; }
  function update() {
    var m = max();
    if (m <= 1) { bar.hidden = true; return; }
    bar.hidden = false;
    var trackW = bar.clientWidth;
    var w = Math.max(trackW * scroller.clientWidth / scroller.scrollWidth, 40);
    thumb.style.width = w + 'px';
    thumb.style.transform = 'translateX(' + (scroller.scrollLeft / m) * (trackW - w) + 'px)';
  }
  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  /* колесо: цель копится по шагам колеса, лента догоняет её по кадрам (каждый кадр — 18 % остатка),
     поэтому идёт плавно, а не рывками по шагу колеса; при prefers-reduced-motion — сразу */
  var target = null;
  var raf = 0;
  function tick() {
    var diff = target - scroller.scrollLeft;
    if (Math.abs(diff) < .5) { scroller.scrollLeft = target; target = null; raf = 0; return; }
    scroller.scrollLeft += diff * .18;
    raf = window.requestAnimationFrame(tick);
  }
  scroller.addEventListener('wheel', function (e) {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    var m = max();
    if (m <= 1) return;
    var from = target === null ? scroller.scrollLeft : target;
    if ((from <= 0 && e.deltaY < 0) || (from >= m - 1 && e.deltaY > 0)) return;
    e.preventDefault();
    target = Math.min(m, Math.max(0, from + e.deltaY));
    if (calm.matches) { scroller.scrollLeft = target; target = null; return; }
    if (!raf) raf = window.requestAnimationFrame(tick);
  }, { passive: false });

  var drag = null;
  thumb.addEventListener('pointerdown', function (e) {
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; target = null; }
    drag = { x: e.clientX, left: scroller.scrollLeft };
    thumb.setPointerCapture(e.pointerId);
    bar.classList.add('is-drag');
    e.preventDefault();
  });
  thumb.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var room = bar.clientWidth - thumb.offsetWidth;
    if (room > 0) scroller.scrollLeft = drag.left + (e.clientX - drag.x) * max() / room;
  });
  function end() { drag = null; bar.classList.remove('is-drag'); }
  thumb.addEventListener('pointerup', end);
  thumb.addEventListener('pointercancel', end);
  bar.addEventListener('pointerdown', function (e) {
    if (e.target === thumb) return;
    var r = bar.getBoundingClientRect();
    var w = thumb.offsetWidth;
    var ratio = Math.min(1, Math.max(0, (e.clientX - r.left - w / 2) / (r.width - w)));
    scroller.scrollTo({ left: ratio * max(), behavior: calm.matches ? 'auto' : 'smooth' });
  });
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
