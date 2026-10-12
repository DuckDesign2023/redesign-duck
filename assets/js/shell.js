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
   с клавиатуры и прокрутка, которая увела панель с экрана.
   До 1320: бургер раскрывает меню на весь экран, пункты с меню внутри него — аккордеон,
   открытых может быть несколько; Esc закрывает бургер, Tab ходит по кругу внутри шапки.
   Класс is-open на шапке — «меню открыто»: по нему полоса получает фон, а тёмная шапка
   на это время становится светлой.
   Без скрипта меню открывается средствами CSS — конец раздела «Меню шапки» в shell.css. */
(function () {
  var desktop = window.matchMedia('(min-width: 1320px)');

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
      btn.addEventListener('click', function () {
        var open = !isOpen(btn);
        if (desktop.matches) closeMenus(btn);
        btn.setAttribute('aria-expanded', open);
        update();
      });
    });
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
