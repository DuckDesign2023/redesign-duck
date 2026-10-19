/* duck.design — страница Portfolio.
   Большой отзыв: стрелки меняют отзыв растворением (просьба пользователя 19.10.2026) — класс
   is-fade кладёт слайды в одну клетку, виден is-current. Стрелка у края выключена (aria-disabled —
   фокус на ней остаётся); пока отзыв один, выключены обе. На тач-экране отзыв меняется смахиванием.
   Без скрипта стрелок нет, отзывы листаются прокруткой. */
(function () {
  document.querySelectorAll('.dd-folio-review').forEach(function (card) {
    var scroller = card.querySelector('.dd-folio-review__scroller');
    var prev = card.querySelector('.dd-folio-review__prev');
    var next = card.querySelector('.dd-folio-review__next');
    if (!scroller || !prev || !next) return;
    var slides = Array.prototype.slice.call(scroller.children);
    var at = 0;

    function show(i) {
      at = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach(function (s, j) { s.classList.toggle('is-current', j === at); });
      prev.setAttribute('aria-disabled', at === 0);
      next.setAttribute('aria-disabled', at === slides.length - 1);
    }
    function go(btn, dir) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        show(at + dir);
      });
    }

    card.classList.add('is-fade');
    scroller.setAttribute('aria-live', 'polite');
    go(prev, -1);
    go(next, 1);

    /* смахивание: сдвиг пальца вбок больше 40 и больше, чем по вертикали */
    var x0 = null, y0 = 0;
    scroller.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    scroller.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1));
    }, { passive: true });

    show(0);
  });
})();

/* Цифры: тумблеры включаются, когда ряд впервые поднялся над нижней пятой окна
   (на телефоне ряд выше окна — порог долей высоты там не сработал бы) */
(function () {
  var list = document.querySelector('.dd-folio-stats');
  if (!list || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  list.classList.add('is-armed');
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    list.classList.add('is-on');
    io.disconnect();
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(list);
})();
