/* duck.design — главная. Временный выбор вида движения сетки услуг: ?services=a|b|c (без
   параметра a). Для c — поднимает карточки по очереди, когда сетка впервые входит в окно. */
(function () {
  var grid = document.querySelector('.dd-services');
  if (!grid) return;
  var pick = /[?&]services=([abc])/.exec(location.search);
  var view = pick ? pick[1] : 'a';
  grid.setAttribute('data-services', view);
  if (view !== 'c') return;
  var items = grid.querySelectorAll('.dd-services__list li');
  for (var i = 0; i < items.length; i++) items[i].style.setProperty('--_i', i);
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    grid.classList.add('is-in');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    if (!entries.some(function (e) { return e.isIntersecting; })) return;
    grid.classList.add('is-in');
    io.disconnect();
  }, { rootMargin: '0px 0px -15% 0px' });
  io.observe(grid.querySelector('.dd-services__list'));
})();
