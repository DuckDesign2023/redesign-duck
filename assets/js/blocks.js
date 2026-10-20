/* duck.design — блоки страниц.
   Без скрипта блоки рабочие: стрелок ленты отзывов и вкладок тизера нет, ответы FAQ раскрыты.
   Переключатель срока в тарифе работает без скрипта. */

/* Срок тарифа и вкладки сравнения (Pricing, Promo): ряду ставится data-dir — в какую сторону
   ушла плашка выбора, по нему pricing.css пускает передний край плашки первым. Без скрипта края
   едут вместе */
(function () {
  document.querySelectorAll('.dd-price-terms__row, .dd-price-compare__tabs').forEach(function (row) {
    var radios = Array.prototype.slice.call(row.querySelectorAll('input[type="radio"]'));
    var was = radios.findIndex(function (r) { return r.checked; });
    row.addEventListener('change', function (e) {
      var now = radios.indexOf(e.target);
      if (now < 0 || now === was) return;
      row.dataset.dir = now > was ? 'right' : 'left';
      was = now;
    });
  });
})();

/* Лента отзывов: стрелки листают её на одну карточку. Стрелка у края ленты выключена
   (aria-disabled — фокус на ней остаётся). Класс is-end на блоке — «лента докручена до конца»:
   по нему blocks.css убирает градиент у правого края. Под лентой — точки-указатель (видны до 834),
   текущая — по доле прокрутки; лента помещается целиком — точек нет. */
(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.dd-testimonials').forEach(function (block) {
    var scroller = block.querySelector('.dd-testimonials__scroller');
    var track = block.querySelector('.dd-testimonials__track');
    var prev = block.querySelector('.dd-testimonials__prev');
    var next = block.querySelector('.dd-testimonials__next');
    if (!scroller || !track || !prev || !next) return;
    var n = track.children.length;
    var dots = document.createElement('div');
    dots.className = 'dd-testimonials__dots';
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = new Array(n + 1).join('<i></i>');
    scroller.after(dots);

    function step() {
      var card = track.firstElementChild;
      if (!card) return 0;
      return card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
    }
    function update() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var atStart = scroller.scrollLeft <= 1;
      var atEnd = scroller.scrollLeft >= max - 1;
      prev.setAttribute('aria-disabled', atStart);
      next.setAttribute('aria-disabled', atEnd);
      block.classList.toggle('is-end', atEnd);
      dots.hidden = max <= 1;
      if (dots.hidden) return;
      var at = Math.round(Math.min(1, Math.max(0, scroller.scrollLeft / max)) * (n - 1));
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('is-on', i === at); });
    }
    function go(btn, dir) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        scroller.scrollBy({ left: dir * step(), behavior: calm.matches ? 'auto' : 'smooth' });
      });
    }

    go(prev, -1);
    go(next, 1);
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (window.ResizeObserver) new ResizeObserver(update).observe(scroller);
    update();
  });
})();

/* Тизер портфолио. Вкладки категорий: нажатие и стрелки влево-вправо, Home, End выбирают
   вкладку и показывают её ряд работ; фокус по Tab стоит только на выбранной.
   Лента работ (до 834): пока ряд не помещается, по центру стоит средняя работа, а лента
   получает фокус, чтобы её можно было листать с клавиатуры. */
(function () {
  document.querySelectorAll('.dd-works').forEach(function (block) {
    var tabs = Array.prototype.slice.call(block.querySelectorAll('[role="tab"]'));
    var ribbons = Array.prototype.slice.call(block.querySelectorAll('.dd-works__ribbon'));

    function fit(ribbon) {
      var over = ribbon.scrollWidth - ribbon.clientWidth;
      if (over > 1) {
        ribbon.tabIndex = 0;
        if (!ribbon.dataset.centred) {
          ribbon.scrollLeft = over / 2;
          ribbon.dataset.centred = '1';
        }
      } else {
        ribbon.removeAttribute('tabindex');
        delete ribbon.dataset.centred;
      }
    }
    function fitAll() { ribbons.forEach(fit); }

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      if (tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      fitAll();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        select(tabs[(to + tabs.length) % tabs.length], true);
      });
    });

    window.addEventListener('resize', fitAll);
    fitAll();
  });
})();

/* FAQ: вопрос — кнопка. Нажатие раскрывает и сворачивает ответ; вопросы друг друга не закрывают. */
(function () {
  document.querySelectorAll('.dd-faq__toggle, .dd-qa__toggle').forEach(function (btn) {
    var item = btn.closest('.dd-faq__item, .dd-qa');
    if (!item) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      item.classList.toggle('is-open', open);
    });
  });
})();

/* Шесть плиток преимуществ (просьба пользователя 16.10.2026): иконки по очереди выпрыгивают,
   стили — blocks.css. Плиткам ставится --_n — номер; is-armed / is-on — один раз, когда ряд
   впервые поднимается над нижней пятой окна. При reduce и без IntersectionObserver иконки стоят */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  document.querySelectorAll('.dd-benefits').forEach(function (block) {
    block.querySelectorAll('.dd-benefit').forEach(function (tile, i) { tile.style.setProperty('--_n', i); });
    block.classList.add('is-armed');
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      requestAnimationFrame(function () { block.classList.add('is-on'); });
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(block);
  });
})();

/* Переключатель с уткой (.dd-switch) — главная, AI Design и призыв AI Development. Включается (is-on), когда заголовок
   поднялся выше середины окна — полоса от 28 % до 42 % высоты; выключается, когда заголовок ушёл
   из окна, чтобы включиться при следующем проходе. Без наблюдателя и при prefers-reduced-motion — включён. */
(function () {
  var calm = !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.dd-switch').forEach(function (sw) {
    if (calm) {
      sw.classList.add('is-static', 'is-on');
      return;
    }
    var head = sw.closest('h1, h2, .dd-display') || sw;
    new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) sw.classList.add('is-on');
    }, { rootMargin: '-28% 0px -58% 0px' }).observe(head);
    new IntersectionObserver(function (entries) {
      if (entries.every(function (e) { return !e.isIntersecting; })) sw.classList.remove('is-on');
    }).observe(head);
  });
})();

/* Декор в заголовке ([data-head-on]: искра .dd-spark, плашка стека AI Development) — включается так же,
   как тумблер: заголовок в полосе 28–42 % окна — is-on, ушёл из окна — сброс. is-armed (исходный вид)
   ставится, только если движение разрешено: без скрипта и при reduce декор стоит итоговым.
   Вариант искры — из ?spark=1|2|3 (по умолчанию 1), пока пользователь выбирает. */
(function () {
  var v = new URLSearchParams(location.search).get('spark');
  document.querySelectorAll('.dd-spark').forEach(function (s) {
    s.setAttribute('data-v', /^[123]$/.test(v) ? v : '1');
  });
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-head-on]').forEach(function (el) {
    var head = el.closest('h1, h2') || el;
    el.classList.add('is-armed');
    new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) el.classList.add('is-on');
    }, { rootMargin: '-28% 0px -58% 0px' }).observe(head);
    new IntersectionObserver(function (entries) {
      if (entries.every(function (e) { return !e.isIntersecting; })) el.classList.remove('is-on');
    }).observe(head);
  });
})();

/* Переключатель в заголовке первого экрана About (.dd-about-hero__toggle) — включается один раз,
   через 2 с после загрузки страницы (просьба пользователя 19.10.2026). Вид — about.css.
   При prefers-reduced-motion не трогаем: стоит включённым, как в разметке. */
(function () {
  var sw = document.querySelector('.dd-about-hero__toggle');
  if (!sw || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sw.classList.add('is-armed');
  function start() {
    setTimeout(function () { sw.classList.add('is-on'); }, 2000);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
