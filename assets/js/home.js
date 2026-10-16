/* duck.design — главная.
   Тогл в заголовке «Here's how to get started»: включается (is-on), когда заголовок поднялся
   выше середины окна — полоса от 28 % до 42 % высоты (16.10.2026 пользователь просил «позже»,
   было 40–60 %); выключается, когда заголовок ушёл из окна,
   чтобы включиться при следующем проходе. Без наблюдателя и при prefers-reduced-motion — включён. */
(function () {
  var sw = document.querySelector('.dd-switch');
  if (!sw) return;
  var head = sw.closest('.dd-display') || sw;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sw.classList.add('is-static', 'is-on');
    return;
  }
  new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) sw.classList.add('is-on');
  }, { rootMargin: '-28% 0px -58% 0px' }).observe(head);
  new IntersectionObserver(function (entries) {
    if (entries.every(function (e) { return !e.isIntersecting; })) sw.classList.remove('is-on');
  }).observe(head);
})();

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

  scroller.addEventListener('wheel', function (e) {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    var m = max();
    if (m <= 1) return;
    if ((scroller.scrollLeft <= 0 && e.deltaY < 0) || (scroller.scrollLeft >= m - 1 && e.deltaY > 0)) return;
    e.preventDefault();
    scroller.scrollLeft += e.deltaY;
  }, { passive: false });

  var drag = null;
  thumb.addEventListener('pointerdown', function (e) {
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
