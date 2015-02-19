var loginModal = $('.login-modal');

$('#login a').click(function() {
  loginModal.addClass('is-visible');
  $('.login-modal input[type=text]').focus();
});

$('.close-modal').click(function() {
  loginModal.removeClass('is-visible');
});

// Only closing modal if we click oustside theh login box
loginModal.click(function(event) {
  if ($(event.target).is(loginModal))
    loginModal.removeClass('is-visible');
});

// Closing modal when clicking ESC button
$(document).keyup(function(event) {
  if (event.which == 27)
    loginModal.removeClass('is-visible');
})

