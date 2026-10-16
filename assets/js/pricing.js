/* duck.design — Pricing. Ниже три движения: значки первого экрана, таблица «Why hiring…»
   и маркер «Every plan package deal».
   Значки по краям первого экрана тянутся к мыши (просьба пользователя
   16.10.2026, выбор из трёх видов), стили — pricing.css. Чем ближе мышь, тем дальше значок
   выдвигается: --_pull от 0 до 1 на радиусе 32 em значка. Только от 1320, с мышью
   и без prefers-reduced-motion; без скрипта значки только выезжают при загрузке */
(() => {
  const mq = matchMedia('(min-width: 1320px) and (hover: hover) and (prefers-reduced-motion: no-preference)');
  const badges = [...document.querySelectorAll('.dd-price-badge')];
  let x = 0, y = 0, frame = 0;

  const draw = () => {
    frame = 0;
    for (const b of badges) {
      const r = b.getBoundingClientRect();
      const reach = parseFloat(getComputedStyle(b).fontSize) * 32;
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
      b.style.setProperty('--_pull', Math.max(0, 1 - d / reach).toFixed(3));
    }
  };

  addEventListener('pointermove', (e) => {
    if (!mq.matches || e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    frame ||= requestAnimationFrame(draw);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    for (const b of badges) b.style.setProperty('--_pull', '0');
  });
})();

/* Таблица «Why hiring…» (просьба пользователя 16.10.2026): подсчёт значков и блик по тёмной
   колонке, стили — pricing.css. Играет один раз, когда таблица впервые поднимается над нижней
   пятой окна: is-armed — исходное положение, is-on — запуск */
(() => {
  const block = document.querySelector('.dd-price-why');
  if (!block) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  block.classList.add('is-armed');
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    requestAnimationFrame(() => block.classList.add('is-on'));
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(block.querySelector('.dd-price-why__table'));
})();

/* «Every plan package deal» (просьба пользователя 16.10.2026): маркер по пунктам, стили —
   pricing.css. Пунктам ставится --_n — номер по порядку чтения. Играет один раз, когда список
   впервые поднимается над нижней пятой окна. Отклик иконок под мышью скрипта не требует */
(() => {
  const block = document.querySelector('.dd-price-deal');
  if (!block) return;
  const list = block.querySelector('.dd-price-deal__list');
  [...list.children].forEach((li, i) => li.style.setProperty('--_n', i));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  block.classList.add('is-armed');
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    requestAnimationFrame(() => block.classList.add('is-on'));
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(list);
})();
