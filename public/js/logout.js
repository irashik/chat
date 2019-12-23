
// обработчик кнопки logout
logout.onclick = function() {

//нужно отправить пост запрос на logout
let xhr = new XMLHttpRequest();
xhr.open('POST', '/logout', false);
xhr.send();


};

