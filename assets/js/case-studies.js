/* duck.design — архив кейсов: фильтр по отраслям. Кнопка ряда показывает карточки своей отрасли
   (data-industry), «All» — все. Без скрипта ряда фильтра нет (CSS), видны все карточки. */
(function () {
  var tabs = document.querySelectorAll('.dd-arch-filter__tab');
  var cards = document.querySelectorAll('.dd-arch-card');
  var empty = document.getElementById('arch-empty');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var value = tab.getAttribute('data-filter');
      var shown = 0;
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t === tab)); });
      cards.forEach(function (card) {
        card.hidden = value !== 'All' && card.getAttribute('data-industry') !== value;
        if (!card.hidden) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });
})();
