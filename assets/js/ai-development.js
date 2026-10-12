/* ==========================================================================
   duck.design — страница AI Development.
   Без скрипта: видео первого экрана играет само, workflow идёт обычной прокруткой,
   в «The engineering edge» выбрана первая строка.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Видео первого экрана: при «уменьшить движение» стоит кадр-заставка */
  var heroVideo = document.querySelector('.dd-ai-hero__bg video');
  if (heroVideo && reduce) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }

  /* «The engineering edge»: строка под указателем, в фокусе или нажатая показывает справа
     своё фото и описание */
  (function () {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.dd-ai-edge .dd-ai-tile'));
    function activate(tile) {
      tiles.forEach(function (t) { t.classList.toggle('is-active', t === tile); });
    }
    tiles.forEach(function (tile) {
      tile.tabIndex = 0;
      tile.addEventListener('mouseenter', function () { activate(tile); });
      tile.addEventListener('focus', function () { activate(tile); });
      tile.addEventListener('click', function () { activate(tile); });
    });
  })();

  /* Workflow. От 834 блок закреплён: доля прокрутки дорожки --p сводит слои и выбирает шаг.
     Уже и при «уменьшить движение» — шаг у середины окна поднимает свой слой */
  function layers(root) {
    var steps = Array.prototype.slice.call(root.querySelectorAll('.dd-ai-lstep'));
    var pin = root.querySelector('.dd-ai-layers__pin');
    var wide = matchMedia('(min-width: 834px) and (min-height: 600px)');
    var pinned = false;
    var queued = false;
    var current = -1;

    function activate(i) {
      if (i === current) return;
      current = i;
      root.dataset.active = i + 1;
      steps.forEach(function (s, n) {
        s.classList.toggle('is-active', n === i);
        s.classList.toggle('is-past', n < i);
      });
    }
    function measure() {
      queued = false;
      if (!pinned) return;
      var span = root.offsetHeight - pin.offsetHeight;
      var p = span > 0 ? (parseFloat(getComputedStyle(pin).top) - root.getBoundingClientRect().top) / span : 0;
      p = Math.min(1, Math.max(0, p));
      root.style.setProperty('--p', p.toFixed(4));
      activate(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    }
    function queue() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    }
    function mode() {
      pinned = wide.matches && !reduce;
      root.classList.toggle('is-pinned', pinned);
      if (!pinned) root.style.removeProperty('--p');
      queue();
    }

    activate(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!pinned && entry.isIntersecting) activate(steps.indexOf(entry.target));
      });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach(function (s) { io.observe(s); });

    wide.addEventListener('change', mode);
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    mode();
  }

  var flow = document.querySelector('.dd-ai-layers');
  if (flow) layers(flow);

  /* Сцены карточек процесса: играют один раз, когда карточка вошла в окно, и заново под
     указателем. Пока сцена не доиграла, новый запуск не начинается */
  (function () {
    var arts = Array.prototype.slice.call(document.querySelectorAll('.dd-ai-art[data-play]'));
    if (!arts.length || reduce || !document.body.getAnimations) return;

    function play(art) {
      if (art.classList.contains('is-playing')) return;
      art.classList.add('is-playing');
      var done = function () { art.classList.remove('is-playing'); };
      Promise.all(art.getAnimations({ subtree: true }).map(function (a) { return a.finished; })).then(done, done);
    }

    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        seen.unobserve(entry.target);
        play(entry.target);
      });
    }, { threshold: .6 });

    arts.forEach(function (art) {
      seen.observe(art);
      art.closest('.dd-ai-p2__card').addEventListener('mouseenter', function () { play(art); });
    });
  })();
})();

/* Стек: движение знака — один раз за наведение на ячейку; пока играет, не перезапускается */
(function () {
  'use strict';

  var grid = document.querySelector('.dd-ai-s3__grid');
  if (!grid || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  Array.prototype.forEach.call(grid.children, function (li) {
    li.addEventListener('mouseenter', function () { li.classList.add('is-playing'); });
    li.querySelector('svg').addEventListener('animationend', function () { li.classList.remove('is-playing'); });
  });
})();
