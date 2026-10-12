(function(){
var CC_ROOT=document.querySelector('.cc-logitech');
var CC_BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function CC_Y(){return -CC_ROOT.getBoundingClientRect().top;}
/* слайдер иллюстраций: шаг — один кадр, радиокнопки по числу позиций, автопрокрутка 3.5 с, пауза при наведении и reduced-motion */
(function(){
  var box=document.querySelector('[data-slider]'); if(!box) return;
  var track=box.querySelector('.slider__track'), dots=box.querySelector('.slider__dots'), slides=[].slice.call(track.children);
  var pos=0, n=1, timer=null, still=false;   /* правка 9: автопрокрутка всегда */
  function step(){ return slides[1].offsetLeft-slides[0].offsetLeft; }
  function count(){ var vis=Math.max(1,Math.round((track.clientWidth-2*slides[0].offsetLeft+parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap))/step())); return Math.max(1,slides.length-vis+1); }
  function build(){ n=count(); dots.innerHTML=''; for(var i=0;i<n;i++){ var r=document.createElement('input'); r.type='radio'; r.name='slide'; r.value=i; r.setAttribute('aria-label','Slide '+(i+1)); r.checked=(i===pos); r.addEventListener('change',function(){ go(+this.value,true); }); dots.appendChild(r); } }
  function go(i,manual){ pos=(i+n)%n; track.scrollTo({left:pos*step(),behavior:'smooth'}); var r=dots.children[pos]; if(r) r.checked=true; if(manual) restart(); }
  function restart(){ clearInterval(timer); if(still) return; timer=setInterval(function(){ go(pos+1); },3500); }
  box.addEventListener('mouseenter',function(){ clearInterval(timer); }); box.addEventListener('mouseleave',restart);
  var t; track.addEventListener('scroll',function(){ clearTimeout(t); t=setTimeout(function(){ var p=Math.round(track.scrollLeft/step()); if(p!==pos&&p<n){ pos=p; var r=dots.children[pos]; if(r) r.checked=true; } },120); },{passive:true});
  addEventListener('resize',build); build(); restart();
})();
/* тост — отдельный элемент, едет параллаксом относительно центра экрана (правка 3) */
(function(){
  var t=document.querySelector('[data-parallax]'); if(!t) return;
  function tick(){ var r=t.parentElement.getBoundingClientRect(); var c=r.top+r.height*0.35-innerHeight/2; var lim=Math.min(120,innerWidth*0.08); var y=Math.max(-lim,Math.min(lim,-c*0.12)); t.style.transform='translateY('+y.toFixed(1)+'px)'; }
  addEventListener('scroll',function(){requestAnimationFrame(tick)},{passive:true}); addEventListener('resize',tick); tick();
})();
})();
