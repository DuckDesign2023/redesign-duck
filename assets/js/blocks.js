/* duck.design — блоки страниц.
   Без скрипта блоки рабочие: стрелок ленты отзывов и вкладок тизера нет, ответы FAQ раскрыты.
   Переключатель срока в тарифе скрипта не требует. */

/* Лента отзывов: стрелки листают её на одну карточку. Стрелка у края ленты выключена
   (aria-disabled — фокус на ней остаётся). Класс is-end на блоке — «лента докручена до конца»:
   по нему blocks.css убирает градиент у правого края. */
(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.dd-testimonials').forEach(function (block) {
    var scroller = block.querySelector('.dd-testimonials__scroller');
    var track = block.querySelector('.dd-testimonials__track');
    var prev = block.querySelector('.dd-testimonials__prev');
    var next = block.querySelector('.dd-testimonials__next');
    if (!scroller || !track || !prev || !next) return;

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
