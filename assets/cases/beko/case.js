(function(){
var CC_ROOT=document.querySelector('.cc-beko');
var CC_BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function CC_Y(){return -CC_ROOT.getBoundingClientRect().top;}
/* v7 · движение от прокрутки. ?reveal=all — все ходы в конечном положении (для полноснимка). */
(function(){
  var q=new URLSearchParams(location.search);
  var all=q.get('reveal')==='all', still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* стикеры стены: по одному после загрузки; ?reveal=all — все сразу; ?stk=N — первые N (для кадров) */
  var walls=[].slice.call(document.querySelectorAll('.wall'));
  var nStk=q.get('stk')||q.get('stkt'); /* stk=N — первые N по DOM; stkt=N — те, чья очередь появления (--i) меньше N */
  walls.forEach(function(w){ if(nStk!==null){ [].forEach.call(w.querySelectorAll('.stk'),function(el,i){ var k=q.get('stkt')!==null?parseInt(el.style.getPropertyValue('--i')):i; if(k<+nStk){ el.style.opacity=1; el.style.transform='none'; } }); } else if(all){ w.classList.add('now'); } else { setTimeout(function(){ w.classList.add('go'); },300); } });
  function prog(el){ var r=el.getBoundingClientRect(); return Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height))); }

  var mails=[].slice.call(document.querySelectorAll('[data-mailscroll]'));
  var rides=[].slice.call(document.querySelectorAll('[data-ride]'));
  var wall=document.querySelector('[data-wall]'), wallRows=wall?[].slice.call(wall.querySelectorAll('.row')):[];
  var line=document.querySelector('.line');
  var paras=[].slice.call(document.querySelectorAll('[data-parallax]'));
  function tick(){
    /* стена: стикеры заполняют шкалу слева направо, пока первый экран уходит вверх */
    /* письмо листается внутри окна, пока ячейка идёт через окно браузера */
    mails.forEach(function(box){ var im=box.querySelector('img'), p=all?0.42:(still?0:prog(box.parentNode)); var d=im.offsetHeight-box.offsetHeight; im.style.transform='translateY('+(-Math.max(0,d)*Math.max(0,Math.min(1,(p-0.15)/0.7))).toFixed(1)+'px)'; });
    /* бенто на фото: едет быстрее прокрутки — внизу окна стоит ниже (фон виден), по мере прокрутки наезжает на фото */
    var narrow=matchMedia('(max-width:900px)').matches; /* на планшете вертикально и телефоне бенто стоит на месте */
    if(!still) paras.forEach(function(el){ if(narrow){ el.style.transform='none'; return; } var p=all?0.5:prog(el.parentNode), a=parseFloat(el.dataset.parallax)||0; el.style.transform='translateY('+((0.5-p)*a).toFixed(1)+'px)'; });
    /* стена работ: ряды едут в разные стороны, пока стена идёт через окно */
    if(wall){ var pw=all?0.5:prog(wall); wallRows.forEach(function(row,i){ var dir=i%2?1:-1; row.style.transform='translateX('+(dir*(pw-0.5)*420).toFixed(1)+'px)'; }); }
    /* строка кампании: коллаж внутри букв едет вверх */
    if(line){ var pl=all?0.5:prog(line); line.style.setProperty('--bgy',(pl*-600).toFixed(0)+'px'); }
    /* ленты финала едут вдоль своей диагонали */
    if(!still) rides.forEach(function(box){ var p=prog(box); [].forEach.call(box.children,function(row){
      var s=parseFloat(getComputedStyle(row).getPropertyValue('--start'))||0, d=parseFloat(getComputedStyle(row).getPropertyValue('--span'))||0;
      row.style.setProperty('--t',(-(s+d*p)).toFixed(1)+'px'); }); });
  }
  addEventListener('scroll',function(){ requestAnimationFrame(tick); },{passive:true}); addEventListener('resize',tick); addEventListener('load',tick); tick();
})();
/* выноски результатов: от панели вправо, прямым углом к экрану ноутбука — как в v5 */
(function(){
  var sec=document.querySelector('.s8'); if(!sec) return;
  var svg=sec.querySelector('.leaders'), fig=sec.querySelector('.scene--results'), calls=[].slice.call(sec.querySelectorAll('.callout'));
  var T=[[0.55,0.34],[0.55,0.50]]; /* доли кадра: экран ноутбука 0,53–0,78 × 0,30–0,55; лимоны 0,42–0,50 × 0,38–0,45 — линии выше и ниже */
  var panel=sec.querySelector('.results-panel');
  function draw(){
    if(getComputedStyle(svg).display==='none') return;
    var s=svg.parentNode.getBoundingClientRect(), f=fig.getBoundingClientRect(), out='';
    calls.forEach(function(c,i){ var r=c.getBoundingClientRect(), sx=panel.getBoundingClientRect().right-s.left, sy=r.top+r.height/2-s.top, ex=sx+34,
      tx=f.left-s.left+f.width*T[i][0], ty=f.top-s.top+f.height*T[i][1];
      out+='<path d="M'+sx.toFixed(1)+' '+sy.toFixed(1)+'H'+ex.toFixed(1)+'V'+ty.toFixed(1)+'H'+tx.toFixed(1)+'"/><circle cx="'+tx.toFixed(1)+'" cy="'+ty.toFixed(1)+'" r="4.5"/>'; });
    svg.setAttribute('viewBox','0 0 '+s.width.toFixed(0)+' '+s.height.toFixed(0)); svg.innerHTML=out;
  }
  addEventListener('resize',draw); addEventListener('load',draw); draw();
})();

/* лента баннеров и продукта: шаг — один кадр (ширины разные), радиокнопки по кадрам, автопрокрутка 3,5 с всегда (правило кейса), пауза при наведении */
(function(){
  var box=document.querySelector('[data-strip]'); if(!box) return;
  var track=box.querySelector('.cc-strip__track'), dots=box.querySelector('.strip__dots'), slides=[].slice.call(track.children);
  var pos=0, n=1, timer=null;
  function maxLeft(){ return track.scrollWidth-track.clientWidth; }
  function count(){ var m=maxLeft(), k=0; slides.forEach(function(sl){ if(sl.offsetLeft<=m+1) k++; }); return Math.max(1,k); }
  function build(){ n=count(); if(pos>=n) pos=0; dots.innerHTML=''; for(var i=0;i<n;i++){ var r=document.createElement('input'); r.type='radio'; r.name='cc-strip'; r.value=i; r.setAttribute('aria-label','Frame '+(i+1)); r.checked=(i===pos); r.addEventListener('change',function(){ go(+this.value,true); }); dots.appendChild(r); } }
  function go(i,manual){ pos=(i+n)%n; track.scrollTo({left:Math.min(slides[pos].offsetLeft,maxLeft()),behavior:'smooth'}); var r=dots.children[pos]; if(r) r.checked=true; if(manual) restart(); }
  function restart(){ clearInterval(timer); timer=setInterval(function(){ go(pos+1); },3500); }
  box.addEventListener('mouseenter',function(){ clearInterval(timer); }); box.addEventListener('mouseleave',restart);
  var t; track.addEventListener('scroll',function(){ clearTimeout(t); t=setTimeout(function(){ var x=track.scrollLeft, best=0; slides.forEach(function(sl,i){ if(Math.abs(sl.offsetLeft-x)<Math.abs(slides[best].offsetLeft-x)) best=i; }); if(best!==pos&&best<n){ pos=best; var r=dots.children[pos]; if(r) r.checked=true; } },120); },{passive:true});
  addEventListener('resize',build); build(); restart();
})();

/* живая шкала стресса: клик по шкале ставит оранжевый стикер читателя (один, хранится у него в браузере) */
(function(){
  var sc=document.getElementById('stress'); if(!sc) return;
  var cols=['#2AA9B8','#2E6ED9','#6F4BC9','#1FA37A','#3C8CE7'], seed=11;
  function r(){ seed=(seed*9301+49297)%233280; return seed/233280; }
  for(var i=0;i<34;i++){ var d=document.createElement('i'); d.className='dot'; d.style.left=(7+r()*86)+'%'; d.style.top=(78+r()*95)+'px'; d.style.background=cols[Math.floor(r()*cols.length)]; sc.appendChild(d); }
  var mine=null, foot=document.querySelector('.board .foot small');
  function put(x,y){ if(!mine){ mine=document.createElement('i'); mine.className='dot dot--mine'; sc.appendChild(mine); } mine.style.left=x+'%'; mine.style.top=y+'px'; if(foot) foot.textContent='Your sticker is up. Take a breath. You’re not alone.'; }
  try{ var s=JSON.parse(localStorage.getItem('beko-sticker')||'null'); if(s) put(s.x,s.y); }catch(e){}
  sc.addEventListener('click',function(e){ var b=sc.getBoundingClientRect(); var x=Math.max(3,Math.min(97,(e.clientX-b.left)/b.width*100)), y=Math.max(70,Math.min(180,e.clientY-b.top)); put(x,y); try{ localStorage.setItem('beko-sticker',JSON.stringify({x:x,y:y})); }catch(err){} });
})();
})();
