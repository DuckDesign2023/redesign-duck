/* duck.design — страница Careers (/careers/).
   1. Окно вакансии: карточка открывает своё окно (<dialog>) с полным текстом живой страницы;
      Apply закрывает окно, выбирает вакансию в поле позиции и ведёт к форме.
   2. Форма заявки: проверка и тексты — как у Contact Form 7 на живой странице (схема формы 8357):
      обязательные поля, адрес почты, итог под кнопкой. Сервера у вёрстки нет — форма никуда
      не отправляет: при верных данных показывает ответ CF7 об отправке и очищается. В теме
      отправку делает CF7. */
(function () {
  /* ---------- окно вакансии ---------- */
  document.querySelectorAll('.dd-car-job__open').forEach(function (btn) {
    var dlg = document.getElementById(btn.getAttribute('aria-controls'));
    if (!dlg || !dlg.showModal) return;
    btn.addEventListener('click', function () { dlg.showModal(); });
    dlg.querySelector('.dd-car-dlg__close').addEventListener('click', function () { dlg.close(); });
    /* щелчок по затемнению вокруг окна закрывает его */
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    var apply = dlg.querySelector('.dd-car-dlg__apply');
    var select = document.querySelector('.dd-car-form select[name="menu-698"]');
    if (!apply || !select) return;
    apply.addEventListener('click', function () {
      select.value = apply.getAttribute('data-apply');
      dlg.close();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('formcareer').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      select.focus({ preventScroll: true });
    });
  });

  /* ---------- форма заявки ---------- */
  var form = document.querySelector('.dd-car-form__form');
  if (!form) return;
  var status = form.querySelector('.dd-car-form__status');
  var MSG = {
    required: 'Please fill out this field.',
    email: 'Please enter an email address.',
    invalid: 'One or more fields have an error. Please check and try again.',
    sent: 'Thank you for your message. It has been sent.'
  };

  function error(input) {
    var v = input.value.trim();
    if (input.required && !v) return MSG.required;
    if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return MSG.email;
    return '';
  }

  function show(input, text) {
    var tip = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (!tip) return;
    tip.textContent = text;
    tip.hidden = !text;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll('input[aria-describedby]'));

  /* после первой ошибки поле проверяется заново при вводе */
  fields.forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') show(input, error(input));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    fields.forEach(function (input) {
      var text = error(input);
      show(input, text);
      if (text && !first) first = input;
    });
    if (first) {
      status.textContent = MSG.invalid;
      first.focus();
      return;
    }
    form.reset();
    status.textContent = MSG.sent;
  });
})();
