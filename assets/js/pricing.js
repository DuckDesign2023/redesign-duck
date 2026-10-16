/* duck.design — Pricing: значки по краям первого экрана тянутся к мыши (просьба пользователя
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
