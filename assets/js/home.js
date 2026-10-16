/* duck.design — главная.
   Лента работ: --_open 0…1 на .dd-strip по прокрутке — работы раскрываются за первые 320 px
   прокрутки после того, как лента вошла в окно (на 1440 она в первом экране — раскрытие с первого
   движения колеса). Вид раскрытия — ?strip=fan|flip, пока пользователь выбирает; без параметра fan.
   При prefers-reduced-motion скрипт молчит — лента раскрыта стилем. */
(function () {
  var strip = document.querySelector('.dd-strip');
  if (!strip) return;
  var pick = /[?&]strip=(fan|flip)/.exec(location.search);
  strip.setAttribute('data-strip', pick ? pick[1] : 'fan');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var LEN = 320;
  var start = 0;
  var queued = false;

  function measure() {
    var top = strip.getBoundingClientRect().top + window.pageYOffset;
    start = Math.max(0, top - window.innerHeight * 0.9);
  }
  function paint() {
    queued = false;
    var p = (window.pageYOffset - start) / LEN;
    strip.style.setProperty('--_open', Math.min(1, Math.max(0, p)).toFixed(3));
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(paint);
  }

  measure();
  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); paint(); });
})();
