(function(){
var CC_ROOT=document.querySelector('.cc-lebara');
var CC_BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function CC_Y(){return -CC_ROOT.getBoundingClientRect().top;}
/* Lebara v7 · движение полотна. Страница читается без JS: исходное состояние — статичные кадры в потоке.
   JS добавляет: разрез складывается в телефон и прилипает (r1), экраны меняются по текстам (r2), лента состояний едет
   вбок (r3). Разворот «плитка → баннер» (r5) снят 16.09 вместе с секцией.
   ?reveal=all и prefers-reduced-motion — без движения. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;


  // варианты на выбор (16.09, серия v12): ?bn=1|2|3 баннеры, ?bg=0|1|2 фон поля, ?s7=map|old разворот App & Website
  const q = k => (location.search.match(new RegExp('[?&]' + k + '=([\\w.-]+)')) || [])[1];
  ['bn', 'bg', 's7'].forEach(k => { const v = q(k); if (v) CC_ROOT.dataset[k] = v; });
  // 17.09: масштаб сцен на узких ширинах — ширина сцены / 1280 (карта и веер планшета — уменьшенные копии десктопа)
  const setZ = () => { const w = ($('.in') || document.body).clientWidth; CC_ROOT.style.setProperty('--z', Math.min(1, w / 1280).toFixed(4)); };
  setZ(); addEventListener('resize', setZ);

  const reveal = /(^|[?&])reveal=all\b/.test(location.search);
  // в витрине case-shell страница стоит в iframe во всю высоту и сама не прокручивается — там только статичные кадры
  let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  const still = reveal  || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { CC_ROOT.classList.add('still'); return; }
  const wide = () => innerWidth > 1180;
  CC_ROOT.classList.add('js');

  const xp = $('.xp'), plane = $('.xp__plane'), ph = $('#ph-a'), s1 = $('.s1');
  const s4 = $('.s4'), pin = $('.s4__pin'), track = $('.ribbon__track');
  let xpBase = null;

  function measure() {
    if (xp) { const t = xp.style.transform; xp.style.transform = 'none'; const r = xp.getBoundingClientRect(); xpBase = {x: r.left + scrollX, y: r.top + CC_Y()}; xp.style.transform = t; }
    if (s4 && pin && wide()) {
      pin.style.height = innerHeight + 'px';
      const travel = Math.max(0, track.scrollWidth - innerWidth);
      s4.style.height = (innerHeight + travel) + 'px';
      s4.dataset.travel = travel;
    } else if (s4) { s4.style.height = ''; pin.style.height = ''; track.style.transform = ''; }
  }

  function frame() {
    const y = CC_Y(), vh = innerHeight;
    // r1 · разрез → телефон: за первые 720 px прокрутки модули опускаются, изометрия поворачивается во фронт,
    // корпус переезжает на место прилипшего телефона; в конце разрез прячется, телефон показывается
    if (xp && ph && wide()) {
      const p = clamp(y / 720), e = ease(p);
      xp.style.setProperty('--lift', (1 - e).toFixed(4));
      xp.style.setProperty('--gap', (12 * (1 - e)).toFixed(3) + 'px');
      xp.style.setProperty('--tilt', (1 - e).toFixed(4));
      xp.style.setProperty('--k', (.92 + .08 * e).toFixed(4));
      const pr = ph.getBoundingClientRect();
      const zoom = parseFloat(getComputedStyle(ph).zoom) || 1;
      const dx = pr.left - (xpBase.x - scrollX), dy = pr.top - (xpBase.y - y);
      xp.style.transform = `translate3d(${(dx * e).toFixed(1)}px,${(dy * e).toFixed(1)}px,0)`;
      const done = p >= 1 && zoom === 1;
      xp.style.visibility = done ? 'hidden' : '';
      ph.style.visibility = done ? '' : 'hidden';
    } else if (xp && ph) { xp.style.transform = ''; xp.style.visibility = ''; ph.style.visibility = ''; }

    // r3 · лента: вертикальная прокрутка раздела двигает ленту вбок
    if (s4 && wide()) {
      const r = s4.getBoundingClientRect(), travel = +s4.dataset.travel || 0;
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      track.style.transform = `translate3d(${(-travel * p).toFixed(1)}px,0,0)`;
    }

    ticking = false;
  }

  // r2 · экран в прилипшем телефоне меняется по таймеру с одинаковым шагом (16.09: «одинаковый тайминг между картами»),
  // пока разворот в окне: главный экран → период → кольца → …; кроссфейд вторым слоем
  if (ph) {
    const img = $('.dev__img', ph);
    const cycle = [['scr-main', 'app'], ['scr-usage-1', 'web'], ['scr-usage-2', 'web']];
    const q = img.src.includes('?') ? img.src.slice(img.src.indexOf('?')) : '';
    const next = img.cloneNode(); next.className = 'dev__img dev__img--next'; next.style.cssText = '--off:0px'; img.parentNode.appendChild(next);
    let i = 0, timer = null;
    const step = () => {
      i = (i + 1) % cycle.length;
      const [src, kind] = cycle[i];
      next.src = `${CC_BASE}img/v7/${src}.webp` + q;
      const go = () => { next.classList.add('is-on'); ph.classList.toggle('dev--web', kind === 'web'); ph.classList.toggle('dev--app', kind !== 'web');
        setTimeout(() => { img.src = next.src; next.classList.remove('is-on'); }, 480); };
      next.complete ? go() : next.addEventListener('load', go, {once: true});
    };
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting && !timer) timer = setInterval(step, 2600);
      if (!en.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }), {threshold: 0});
    io.observe($('.story'));
  }

  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', () => { measure(); frame(); });
  addEventListener('load', () => { measure(); frame(); });
  measure(); frame();
})();
})();
