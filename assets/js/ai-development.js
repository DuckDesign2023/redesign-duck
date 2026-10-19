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
     своё фото и описание. Сцена на фото ([data-scene], вид — ai-development.css) играет, когда
     её вкладка становится выбранной, и при первом появлении выбранной вкладки в окне; пока
     играет, не перезапускается. При «уменьшить движение» сцены стоят в итоговом виде */
  (function () {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.dd-ai-edge .dd-ai-tile'));
    var narrow = matchMedia('(max-width: 833.98px)');
    var scenes = { lighthouse: lighthouse };

    /* Lighthouse: кольца по очереди считают от 0 до цифры из разметки, цвет — по порогам */
    function lighthouse(scene, done) {
      var rows = Array.prototype.slice.call(scene.querySelectorAll('.dd-ai-lh__row'));
      var ENTER = 450, STEP = 320, RUN = 1250;
      rows.forEach(function (row) {
        var b = row.querySelector('b');
        if (!row.dataset.goal) row.dataset.goal = parseInt(b.textContent, 10) || 0;
      });
      scene.classList.remove('is-done', 'is-playing');
      void scene.offsetWidth;
      scene.classList.add('is-playing');
      var t0 = performance.now();
      function frame(now) {
        var all = true;
        rows.forEach(function (row, i) {
          var k = Math.min(Math.max((now - t0 - ENTER - i * STEP) / RUN, 0), 1);
          var v = Math.round(row.dataset.goal * (1 - Math.pow(1 - k, 3)));
          if (k < 1) all = false;
          row.style.setProperty('--p', v);
          row.querySelector('b').textContent = v;
          row.dataset.tone = v < 50 ? 'low' : v < 90 ? 'mid' : 'high';
        });
        if (!all) return requestAnimationFrame(frame);
        scene.classList.add('is-done');
        setTimeout(done, 500);
      }
      requestAnimationFrame(frame);
    }

    function play(tile) {
      var scene = tile.querySelector('[data-scene]');
      if (!scene || reduce || scene.dataset.playing) return;
      var run = scenes[scene.dataset.scene];
      if (!run) return;
      scene.dataset.playing = '1';
      run(scene, function () { delete scene.dataset.playing; });
    }
    if (!reduce && 'IntersectionObserver' in window) {
      tiles.forEach(function (tile) {
        var scene = tile.querySelector('[data-scene]');
        if (!scene) return;
        scene.classList.add('is-armed');
        var seen = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting || !tile.classList.contains('is-active')) return;
          seen.disconnect();
          play(tile);
        }, { threshold: .5 });
        seen.observe(scene);
      });
    }

    /* от 834 до 1320 сцена стоит полосой над плашкой описания: высота плашки — в --_plate */
    if ('ResizeObserver' in window) {
      var plates = new ResizeObserver(function (entries) {
        entries.forEach(function (e) { e.target.parentNode.style.setProperty('--_plate', e.target.offsetHeight + 'px'); });
      });
      tiles.forEach(function (tile) {
        var p = tile.querySelector('[data-scene]') && tile.querySelector(':scope > p');
        if (p) plates.observe(p);
      });
    }

    function activate(tile) {
      tiles.forEach(function (t) {
        if (t === tile && !t.classList.contains('is-active')) play(t);
        t.classList.toggle('is-active', t === tile);
      });
    }
    tiles.forEach(function (tile) {
      tile.tabIndex = 0;
      tile.addEventListener('mouseenter', function () { activate(tile); });
      tile.addEventListener('focus', function () { activate(tile); });
      tile.addEventListener('click', function () {
        activate(tile);
        /* на телефоне строки — аккордеон: строка выше схлопнулась, нажатая уехала вверх —
           возвращаем её под шапку */
        if (!narrow.matches) return;
        setTimeout(function () {
          var top = tile.getBoundingClientRect().top;
          if (top < 72) scrollBy({ top: top - 84, behavior: reduce ? 'auto' : 'smooth' });
        }, 480);
      });
    });
  })();

  /* Workflow. Блок закреплён: доля прокрутки дорожки --p сводит слои и выбирает шаг. В низком
     окне и при «уменьшить движение» — шаг у середины окна поднимает свой слой. Подписи слоёв —
     кнопки: нажатие прокручивает к своему шагу */
  function layers(root) {
    var steps = Array.prototype.slice.call(root.querySelectorAll('.dd-ai-lstep'));
    var pin = root.querySelector('.dd-ai-layers__pin');
    var wide = matchMedia('(min-width: 834px) and (min-height: 600px)');
    var phone = matchMedia('(max-width: 833.98px) and (min-height: 560px)');
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
      pinned = !reduce && (wide.matches || phone.matches);
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
    phone.addEventListener('change', mode);
    Array.prototype.forEach.call(root.querySelectorAll('.dd-ai-layers__legend button'), function (btn, i) {
      btn.addEventListener('click', function () {
        if (!pinned) { steps[i].scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); return; }
        var span = root.offsetHeight - pin.offsetHeight;
        var top = scrollY + root.getBoundingClientRect().top - parseFloat(getComputedStyle(pin).top);
        scrollTo({ top: top + span * (i + .5) / steps.length, behavior: 'smooth' });
      });
    });
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

/* Тариф на телефоне: список «что входит» свёрнут до трёх строк, кнопка раскрывает и сворачивает */
(function () {
  'use strict';

  var more = document.querySelector('.dd-ai-plan-more');
  if (!more) return;
  var scope = more.closest('.dd-plan__scope');
  var label = more.querySelector('span');
  var closed = label.textContent;
  more.hidden = false;
  scope.classList.add('is-short');
  more.addEventListener('click', function () {
    var open = scope.classList.toggle('is-short') === false;
    more.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Show less' : closed;
  });
})();

/* Процесс на телефоне: шаги раскрываются по одному, первый открыт сразу. Кнопка-строка есть в
   разметке каждой карточки; от 834 она скрыта стилями */
(function () {
  'use strict';

  var grid = document.querySelector('.dd-ai-p2__grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.children);
  var narrow = matchMedia('(max-width: 833.98px)');
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function open(card) {
    cards.forEach(function (c) {
      c.classList.toggle('is-open', c === card);
      c.querySelector('.dd-ai-p2__toggle').setAttribute('aria-expanded', String(c === card));
    });
  }
  cards.forEach(function (card) {
    card.querySelector('.dd-ai-p2__toggle').addEventListener('click', function () {
      open(card);
      /* сцена шага играет заново — тем же путём, что под указателем */
      card.dispatchEvent(new Event('mouseenter'));
      /* шаг выше схлопнулся, нажатый уехал вверх — возвращаем его под шапку */
      setTimeout(function () {
        var top = card.getBoundingClientRect().top;
        if (narrow.matches && top < 72) scrollBy({ top: top - 84, behavior: calm ? 'auto' : 'smooth' });
      }, 50);
    });
  });
  grid.classList.add('is-accordion');
  open(cards[0]);
})();

