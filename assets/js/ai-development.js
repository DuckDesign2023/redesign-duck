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
    var narrow = matchMedia('(max-width: 833.98px)');
    function activate(tile) {
      tiles.forEach(function (t) { t.classList.toggle('is-active', t === tile); });
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

  /* Workflow. От 834 блок закреплён: доля прокрутки дорожки --p сводит слои и выбирает шаг.
     Уже и при «уменьшить движение» — шаг у середины окна поднимает свой слой */
  function layers(root) {
    var steps = Array.prototype.slice.call(root.querySelectorAll('.dd-ai-lstep'));
    var pin = root.querySelector('.dd-ai-layers__pin');
    var wide = matchMedia('(min-width: 834px) and (min-height: 600px)');
    var phone = matchMedia('(max-width: 833.98px) and (min-height: 560px)');
    var list = root.querySelector('.dd-ai-layers__steps');
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
    function swiped() { return list.scrollWidth - list.clientWidth > 1; }
    function swipe() {
      var max = list.scrollWidth - list.clientWidth;
      if (max > 1) activate(Math.round(list.scrollLeft / max * (steps.length - 1)));
    }
    function mode() {
      pinned = !reduce && (wide.matches || (phone.matches && document.documentElement.dataset.flow === 'pin'));
      root.classList.toggle('is-pinned', pinned);
      if (!pinned) root.style.removeProperty('--p');
      queue();
    }

    activate(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!pinned && !swiped() && entry.isIntersecting) activate(steps.indexOf(entry.target));
      });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach(function (s) { io.observe(s); });

    wide.addEventListener('change', mode);
    phone.addEventListener('change', mode);
    document.addEventListener('dd-flow', function () { list.scrollLeft = 0; mode(); activate(0); });
    list.addEventListener('scroll', swipe, { passive: true });
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

/* Указатель ленты: точки под лентой, текущая вытянута. Стоит под отзывами и под шагами
   workflow. Когда лента помещается целиком, указателя нет */
(function () {
  'use strict';

  function dots(scroller, n) {
    if (!scroller) return;
    var box = document.createElement('div');
    box.className = 'dd-ai-swipe';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = new Array(n + 1).join('<i></i>');
    scroller.after(box);

    function update() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      box.hidden = max <= 1;
      if (box.hidden) return;
      var at = Math.round(Math.min(1, Math.max(0, scroller.scrollLeft / max)) * (n - 1));
      Array.prototype.forEach.call(box.children, function (d, i) { d.classList.toggle('is-on', i === at); });
    }

    scroller.addEventListener('scroll', update, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(update).observe(scroller);
    document.addEventListener('dd-flow', update);
    update();
  }

  dots(document.querySelector('.dd-testimonials__scroller'), document.querySelectorAll('.dd-testimonial').length);
  dots(document.querySelector('.dd-ai-layers__steps'), document.querySelectorAll('.dd-ai-lstep').length);
})();

/* ВАРИАНТЫ НА ВЫБОРЕ (13.10.2026, временно): workflow на телефоне — ?flow=swipe (шаги листаются
   пальцем) или ?flow=pin (блок закреплён, шаги сменяются по прокрутке). После выбора удалить
   вместе с переключателем .dd-ai-pick и лишним видом в стилях */
(function () {
  'use strict';

  var root = document.documentElement;
  var values = ['swipe', 'pin'];
  var labels = ['Листать пальцем', 'Закреп по прокрутке'];
  var pick = document.createElement('div');
  pick.className = 'dd-ai-pick';
  pick.setAttribute('role', 'group');
  pick.setAttribute('aria-label', 'Workflow: варианты');
  var buttons = values.map(function (value, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = labels[i];
    b.addEventListener('click', function () { choose(value); });
    pick.append(b);
    return b;
  });
  function choose(value) {
    if (values.indexOf(value) < 0) value = values[0];
    root.dataset.flow = value;
    buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(values[i] === value)); });
    document.dispatchEvent(new Event('dd-flow'));
  }
  choose(new URLSearchParams(location.search).get('flow'));
  document.body.append(pick);
})();

