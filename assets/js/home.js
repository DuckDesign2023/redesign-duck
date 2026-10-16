/* duck.design — главная.
   Тогл в заголовке «Here's how to get started»: включается (is-on), когда заголовок проходит
   середину окна — полоса от 40 % до 60 % высоты; выключается, когда заголовок ушёл из окна,
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
  }, { rootMargin: '-40% 0px -40% 0px' }).observe(head);
  new IntersectionObserver(function (entries) {
    if (entries.every(function (e) { return !e.isIntersecting; })) sw.classList.remove('is-on');
  }).observe(head);
})();
