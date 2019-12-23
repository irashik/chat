var log = require('./lib/log')(module);

log.debug('auth is run');

documents.submit_btn.eddEventListener("click", validate);



function validate() {
    log.debug('validate is run');
       
    
    
    document.forms['login-form'].on('submit', function() {
    var form = $(this);
    $('.error', form).html('');
    $(":submit", form).button("loading");
    $.ajax({
      url: "/login",
      data: form.serialize(),
      method: "POST",
      complete: function() {
        $(":submit", form).button("reset");
      },
      
      statusCode: {
        200: function() {
          form.html("Вы вошли на сайт").addClass('alert-success');
          window.location.href = "/chat"; //redirect to chat page
        },
        403: function(jqXHR) {
          var error = JSON.parse(jqXHR.responseText);
          $('.error', form).html(error.message);
        }
      }
    });
    
    return false;
  });
  
  
  
  
}





