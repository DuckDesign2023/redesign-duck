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
