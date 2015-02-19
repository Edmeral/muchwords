var loginModal = $('.login-modal');

$('#login a').click(function() {
  loginModal.addClass('is-visible');
  $('.login-modal input[type=text]').focus();
});

$('.close-modal').click(function() {
  loginModal.removeClass('is-visible');
});

loginModal.click(function(event) {
  if ($(event.target).is(loginModal))
    loginModal.removeClass('is-visible');
}); 

