/* duck.design — главная.
   Лента работ: вид наведения на работу — ?strip=lift|caption|tilt, пока пользователь выбирает;
   без параметра lift. Для tilt скрипт считает наклон работы за курсором (до 7°) и место блика;
   где мыши нет (hover: none) или просят меньше движения — наклона нет. */
(function () {
  var strip = document.querySelector('.dd-strip');
  if (!strip) return;
  var pick = /[?&]strip=(lift|caption|tilt)/.exec(location.search);
  var view = pick ? pick[1] : 'lift';
  strip.setAttribute('data-strip', view);
  if (view !== 'tilt') return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAX = 7;
  strip.addEventListener('pointermove', function (e) {
    var work = e.target.closest ? e.target.closest('.dd-strip__work') : null;
    if (!work) return;
    var r = work.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    var y = (e.clientY - r.top) / r.height;
    work.style.setProperty('--_ry', ((x - .5) * 2 * MAX).toFixed(2) + 'deg');
    work.style.setProperty('--_rx', ((.5 - y) * 2 * MAX).toFixed(2) + 'deg');
    work.style.setProperty('--_gx', (x * 100).toFixed(1) + '%');
    work.style.setProperty('--_gy', (y * 100).toFixed(1) + '%');
  });
  strip.addEventListener('pointerout', function (e) {
    var work = e.target.closest ? e.target.closest('.dd-strip__work') : null;
    if (!work || work.contains(e.relatedTarget)) return;
    work.style.removeProperty('--_rx');
    work.style.removeProperty('--_ry');
  });
})();
