/* duck.design — работы портфолио (Portfolio, тизер Pricing), как на живом сайте.
   Картинка открывается крупно в окне просмотра; стрелки на экране и на клавиатуре листают
   работы той же категории (data-gallery), Esc и щелчок мимо работы закрывают окно.
   Ролик Motion: обложка меняется на плеер YouTube, ролик играет без звука по кругу, как на сайте.
   Без скрипта ссылка картинки открывает файл, ссылка ролика — YouTube в новом окне. */
(function () {
  var dialog, img, count, prev, next, group = [], at = 0;

  function icon(id) {
    return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'dd-lightbox';
    dialog.setAttribute('aria-label', 'Work preview');
    dialog.innerHTML =
      '<img class="dd-lightbox__img" alt="">' +
      '<p class="dd-lightbox__count" aria-live="polite"></p>' +
      '<button class="dd-lightbox__btn dd-lightbox__close" type="button" aria-label="Close">' + icon('dd-cross') + '</button>' +
      '<button class="dd-lightbox__btn dd-lightbox__prev" type="button" aria-label="Previous work">' + icon('dd-chevron-left') + '</button>' +
      '<button class="dd-lightbox__btn dd-lightbox__next" type="button" aria-label="Next work">' + icon('dd-chevron-right') + '</button>';
    document.body.appendChild(dialog);
    img = dialog.querySelector('.dd-lightbox__img');
    count = dialog.querySelector('.dd-lightbox__count');
    prev = dialog.querySelector('.dd-lightbox__prev');
    next = dialog.querySelector('.dd-lightbox__next');

    dialog.querySelector('.dd-lightbox__close').addEventListener('click', function () { dialog.close(); });
    prev.addEventListener('click', function () { show(at - 1); });
    next.addEventListener('click', function () { show(at + 1); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
    dialog.addEventListener('close', function () { img.removeAttribute('src'); });
  }

  function show(i) {
    if (!group.length) return;
    at = (i + group.length) % group.length;
    var a = group[at];
    var thumb = a.querySelector('img');
    img.src = a.href;
    img.alt = thumb ? thumb.alt : '';
    img.style.background = getComputedStyle(a).getPropertyValue('--bg') || '';
    count.textContent = (at + 1) + ' / ' + group.length;
    prev.hidden = next.hidden = count.hidden = group.length < 2;
  }

  function open(a) {
    if (!dialog) build();
    var name = a.getAttribute('data-gallery');
    group = Array.prototype.slice.call(document.querySelectorAll('a.dd-work[data-gallery="' + name + '"]'));
    show(group.indexOf(a));
    dialog.showModal();
  }

  function play(a) {
    var id = a.getAttribute('data-yt');
    var frame = document.createElement('iframe');
    frame.className = 'dd-work dd-work--frame';
    frame.src = 'https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&mute=1&loop=1&playlist=' + id + '&rel=0&playsinline=1&modestbranding=1';
    frame.title = a.getAttribute('aria-label').replace('Play video: ', '');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    a.replaceWith(frame);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.dd-work');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('data-yt')) {
      e.preventDefault();
      play(a);
    } else if (a.hasAttribute('data-gallery') && window.HTMLDialogElement) {
      e.preventDefault();
      open(a);
    }
  });
})();
