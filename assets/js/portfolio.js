/* duck.design — страница Portfolio.
   Большой отзыв: стрелки листают карточку на один отзыв. Стрелка у края выключена
   (aria-disabled — фокус на ней остаётся); пока отзыв один, выключены обе.
   Без скрипта стрелок нет, отзывы листаются прокруткой. */
(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.dd-folio-review').forEach(function (card) {
    var scroller = card.querySelector('.dd-folio-review__scroller');
    var prev = card.querySelector('.dd-folio-review__prev');
    var next = card.querySelector('.dd-folio-review__next');
    if (!scroller || !prev || !next) return;

    function update() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      prev.setAttribute('aria-disabled', scroller.scrollLeft <= 1);
      next.setAttribute('aria-disabled', scroller.scrollLeft >= max - 1);
      if (max > 1) scroller.tabIndex = 0;
      else scroller.removeAttribute('tabindex');
    }
    function go(btn, dir) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        scroller.scrollBy({ left: dir * scroller.clientWidth, behavior: calm.matches ? 'auto' : 'smooth' });
      });
    }

    go(prev, -1);
    go(next, 1);
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
