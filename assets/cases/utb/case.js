(function(){
var CC_ROOT=document.querySelector('.cc-utb');
var CC_BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function CC_Y(){return -CC_ROOT.getBoundingClientRect().top;}
/* слайдер постов: шаг — один кадр, радиокнопки по числу позиций, автопрокрутка 3.5 с всегда (правило кейса), пауза при наведении */
(function(){
  var box=document.querySelector('[data-slider]'); if(!box) return;
  var track=box.querySelector('.slider__track'), dots=box.querySelector('.slider__dots'), slides=[].slice.call(track.children);
  var pos=0, n=1, timer=null;
  function step(){ return slides[1].offsetLeft-slides[0].offsetLeft; }
  function count(){ var gap=parseFloat(getComputedStyle(track).columnGap)||0; var vis=Math.max(1,Math.round((track.clientWidth-2*slides[0].offsetLeft+gap)/step())); return Math.max(1,slides.length-vis+1); }
  function build(){ n=count(); if(pos>=n) pos=0; dots.innerHTML=''; for(var i=0;i<n;i++){ var r=document.createElement('input'); r.type='radio'; r.name='slide'; r.value=i; r.setAttribute('aria-label','Slide '+(i+1)); r.checked=(i===pos); r.addEventListener('change',function(){ go(+this.value,true); }); dots.appendChild(r); } }
  function go(i,manual){ pos=(i+n)%n; track.scrollTo({left:pos*step(),behavior:'smooth'}); var r=dots.children[pos]; if(r) r.checked=true; if(manual) restart(); }
  function restart(){ clearInterval(timer); timer=setInterval(function(){ go(pos+1); },3500); }
  box.addEventListener('mouseenter',function(){ clearInterval(timer); }); box.addEventListener('mouseleave',restart);
  var t; track.addEventListener('scroll',function(){ clearTimeout(t); t=setTimeout(function(){ var p=Math.round(track.scrollLeft/step()); if(p!==pos&&p<n){ pos=p; var r=dots.children[pos]; if(r) r.checked=true; } },120); },{passive:true});
  addEventListener('resize',build); build(); restart();
})();
/* лента обложек на шве едет влево вместе с прокруткой: от −8 % до −38 % своей ширины, пока шов проходит экран */
(function(){
  var box=document.querySelector('[data-scrollride]'); if(!box) return;
  var row=box.firstElementChild;
  function tick(){ var r=box.getBoundingClientRect(); var p=(innerHeight-r.top)/(innerHeight+r.height); p=Math.max(0,Math.min(1,p)); row.style.transform='translateX('+(-(8+30*p)*row.scrollWidth/100/2).toFixed(1)+'px)'; }
  addEventListener('scroll',function(){ requestAnimationFrame(tick); },{passive:true}); addEventListener('resize',tick); tick();
})();
})();
