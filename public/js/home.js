$(function() {
  // Getting the timezone
  $('#timezone').val(jstz.determine().name());

  // Scrolling to the explain area when clicking arrows
  $('#bar a').click(function() {
    $('body').scrollTo('#explain', { duration: 'medium', easing: 'swing'});
    return false;
  });

  /*
   * Setting up the login modal
  */
  var loginModal = $('.login-modal');

  $('#login a').click(function() {
    loginModal.addClass('is-visible');
    $('.login-modal input[type=text]').focus();
    return false;
  });

  $('.close-modal').click(function() {
    loginModal.removeClass('is-visible');
  });

  // Only closing modal if we click oustside the login box
  loginModal.click(function(event) {
    if ($(event.target).is(loginModal))
      loginModal.removeClass('is-visible');
  });

  // Closing modal when clicking ESC button
  $(document).keyup(function(event) {
    if (event.which == 27)
      loginModal.removeClass('is-visible');
  });
});

/*
* Handling Submit event
*/
var form = $('.login-modal form');
form.submit(function(event) {
  event.preventDefault();
  $.post('/login', { 
    username: $('.login-modal input[type=text]').val(),
    password: $('.login-modal input[type=password]').val()
  })
      .done(function() {
        window.location.href = window.location.protocol + '//' + window.location.host + '/dashboard';
      })
      .fail(function() {
        form.shake();
      });
});