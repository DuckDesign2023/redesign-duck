/* duck.design — главная. Временный выбор вида движения значков у кнопки «See all services»:
   ?icons=a|b|c (без параметра a). */
(function () {
  var row = document.querySelector('.dd-services__more');
  if (!row) return;
  var pick = /[?&]icons=([abc])/.exec(location.search);
  row.setAttribute('data-icons', pick ? pick[1] : 'a');
})();
