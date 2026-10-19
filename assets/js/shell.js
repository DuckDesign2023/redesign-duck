/* duck.design — каркас страницы.
   Подвал: на ширине до 1320 колонки ссылок сворачиваются (первая открыта, как в макете).
   Без скрипта все колонки раскрыты, кнопок-переключателей нет. */
(function () {
  document.querySelectorAll('.dd-footer__col').forEach(function (col, i) {
    var btn = col.querySelector('.dd-footer__toggle');
    if (!btn) return;
    function set(open) {
      btn.setAttribute('aria-expanded', open);
      col.classList.toggle('is-collapsed', !open);
    }
    btn.hidden = false;
    set(i === 0);
    btn.addEventListener('click', function () {
      set(btn.getAttribute('aria-expanded') !== 'true');
    });
  });
})();

/* Шапка: выпадающие меню и бургер.
   Пункт с меню — кнопка с aria-expanded, панель .dd-menu стоит в разметке сразу за ней;
   показывает и прячет панель shell.css по значению aria-expanded.
   От 1320: открыто одно меню; его закрывают повторное нажатие, нажатие мимо, Esc, уход фокуса
   с клавиатуры и прокрутка, которая увела панель с экрана. С мышью (просьба пользователя
   19.10.2026) меню открывается наведением на пункт, пункт без меню закрывает его, уход указателя
   из шапки или на затемнение страницы закрывает через 0,2 с; нажатие мышью открытое наведением
   меню не закрывает.
   До 1320: бургер раскрывает меню на весь экран, пункты с меню внутри него — аккордеон,
   открытых может быть несколько; Esc закрывает бургер, Tab ходит по кругу внутри шапки.
   Класс is-open на шапке — «меню открыто»: по нему полоса получает фон, а тёмная шапка
   на это время становится светлой.
   Без скрипта меню открывается средствами CSS — конец раздела «Меню шапки» в shell.css. */
(function () {
  var desktop = window.matchMedia('(min-width: 1320px)');
  var mouse = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.querySelectorAll('.dd-header').forEach(function (header) {
    var burger = header.querySelector('.dd-header__burger');
    var toggles = header.querySelectorAll('.dd-header-item[aria-expanded]');
    var dark = header.classList.contains('dd-on-dark');
    var sticky = header.classList.contains('dd-header--sticky');
    if (!burger) return;

    function isOpen(btn) {
      return btn.getAttribute('aria-expanded') === 'true';
    }
    function openToggle() {
      return header.querySelector('.dd-header-item[aria-expanded="true"]');
    }
    function closeMenus(except) {
      toggles.forEach(function (btn) {
        if (btn !== except) btn.setAttribute('aria-expanded', 'false');
      });
    }
    /* закреплённая шапка (.dd-header--sticky): после прокрутки — класс is-scrolled, полоса
       получает фон и тень; тёмная шапка светлая, пока открыто меню или страница прокручена */
    function paint() {
      var scrolled = sticky && window.scrollY > 0;
      header.classList.toggle('is-scrolled', scrolled);
      if (dark) header.classList.toggle('dd-on-dark', !header.classList.contains('is-open') && !scrolled);
    }
    function update() {
      var open = desktop.matches ? !!openToggle() : isOpen(burger);
      var modal = open && !desktop.matches;
      header.classList.toggle('is-open', open);
      paint();
      /* раскрытый бургер закрывает экран: страница под ним не прокручивается,
         не получает фокус и не читается скринридером */
      document.documentElement.classList.toggle('dd-lock', modal);
      Array.prototype.forEach.call(header.parentNode.children, function (el) {
        if (el !== header) el.inert = modal;
      });
    }
    function closeAll() {
      closeMenus();
      burger.setAttribute('aria-expanded', 'false');
      update();
    }

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (desktop.matches && mouse.matches && e.detail && isOpen(btn)) return;
        var open = !isOpen(btn);
        if (desktop.matches) closeMenus(btn);
        btn.setAttribute('aria-expanded', open);
        update();
      });
    });
    var leave;
    function byMouse(e) {
      return desktop.matches && mouse.matches && e.pointerType === 'mouse';
    }
    header.querySelectorAll('.dd-header__menu > li').forEach(function (item) {
      var btn = item.querySelector('.dd-header-item[aria-expanded]');
      item.addEventListener('pointerenter', function (e) {
        if (!byMouse(e)) return;
        closeMenus(btn);
        if (btn) btn.setAttribute('aria-expanded', 'true');
        update();
      });
    });
    /* затемнение страницы под открытым меню — ::after самой шапки, поэтому указатель на нём
       считается ушедшим из шапки, как и ушедший из окна */
    function away(e) {
      if (!byMouse(e) || !openToggle()) return;
      clearTimeout(leave);
      leave = setTimeout(closeAll, 200);
    }
    header.addEventListener('pointerover', function (e) {
      if (e.target === header) away(e);
      else clearTimeout(leave);
    });
    header.addEventListener('pointerleave', away);
    burger.addEventListener('click', function () {
      if (isOpen(burger)) return closeAll();
      burger.setAttribute('aria-expanded', 'true');
      update();
    });

    header.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var btn = desktop.matches ? openToggle() : isOpen(burger) && burger;
        if (!btn) return;
        closeAll();
        btn.focus();
      }
      if (e.key === 'Tab' && !desktop.matches && isOpen(burger)) {
        var stops = Array.prototype.filter.call(header.querySelectorAll('a[href], button'), function (el) {
          return el.getClientRects().length;
        });
        var edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
        if (document.activeElement !== edge) return;
        e.preventDefault();
        (e.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!desktop.matches || !openToggle()) return;
      if (header.contains(e.target) && e.target.closest('.dd-menu, .dd-header-item[aria-expanded]')) return;
      closeAll();
    });
    header.addEventListener('focusout', function (e) {
      var item = desktop.matches && openToggle() && e.target.closest('.dd-header__menu > li');
      if (item && e.relatedTarget && !item.contains(e.relatedTarget)) closeAll();
    });
    window.addEventListener('scroll', function () {
      var btn = desktop.matches && openToggle();
      if (btn && btn.nextElementSibling.getBoundingClientRect().bottom < 0) closeAll();
      if (sticky) paint();
    }, { passive: true });
    desktop.addEventListener('change', closeAll);
    paint();
  });
})();

/* Движение — три общих приёма, снятых с правок пользователя 16.10.2026 (раздел «Язык движения»
   в DESIGN.md). Включаются атрибутом в разметке, вид и кадры — в стилях блока. При
   prefers-reduced-motion и без скрипта всё стоит в итоговом виде.
   data-wake    — блок «просыпается» один раз: is-armed (исходное положение), а когда блок впервые
                  поднимается над нижней пятой окна — is-on. [data-wake-item] внутри получают
                  --_n — номер по порядку, для шага каскада.
   data-replay  — сцена играет раз за наведение: is-playing, пока не доиграли её конечные анимации;
                  пока играет, не перезапускается. Значение — селектор хозяина наведения
                  (ближайший предок), пусто — сама сцена.
   data-flow    — ряд вкладок: черта выбранной перетекает к новой, передний край первым (как плашка
                  срока на Pricing). Выбранная — с :checked внутри или aria-pressed="true".
                  Ряду — is-flow, края черты — --_fl / --_fr, сторона — data-dir; стили — base.css */
(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-wake]').forEach(function (block) {
    block.querySelectorAll('[data-wake-item]').forEach(function (el, i) { el.style.setProperty('--_n', i); });
    if (calm || !('IntersectionObserver' in window)) return;
    block.classList.add('is-armed');
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      requestAnimationFrame(function () { block.classList.add('is-on'); });
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(block);
  });

  if (!calm && document.body.getAnimations) {
    document.querySelectorAll('[data-replay]').forEach(function (scene) {
      var host = scene.getAttribute('data-replay') ? scene.closest(scene.getAttribute('data-replay')) : scene;
      (host || scene).addEventListener('mouseenter', function () {
        if (scene.classList.contains('is-playing')) return;
        scene.classList.add('is-playing');
        var done = function () { scene.classList.remove('is-playing'); };
        var runs = scene.getAnimations({ subtree: true }).filter(function (a) {
          return a.effect && a.effect.getComputedTiming().iterations !== Infinity;
        });
        Promise.all(runs.map(function (a) { return a.finished; })).then(done, done);
      });
    });
  }

  document.querySelectorAll('[data-flow]').forEach(function (row) {
    var left = null;
    function tab() {
      var on = row.querySelector('input:checked, [aria-pressed="true"]');
      return on && (on.closest('label') || on);
    }
    function place(still) {
      var t = tab();
      if (!t) return;
      var l = t.offsetLeft;
      if (!still && left !== null && l !== left) row.dataset.dir = l > left ? 'right' : 'left';
      row.classList.toggle('is-still', !!still || calm);
      row.style.setProperty('--_fl', l + 'px');
      row.style.setProperty('--_fr', (row.offsetWidth - l - t.offsetWidth) + 'px');
      left = l;
    }
    row.classList.add('is-flow');
    place(true);
    row.addEventListener('change', function () { place(); });
    new MutationObserver(function () { place(); }).observe(row, { subtree: true, attributeFilter: ['aria-pressed'] });
    if (window.ResizeObserver) new ResizeObserver(function () { place(true); }).observe(row);
  });
})();
