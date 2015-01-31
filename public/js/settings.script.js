$(function() {
    $('body').removeClass('preload');
    var newtimezone = jstz.determine().name();

    if ($('option').text() != newtimezone) {
      var newoption = document.createElement('option');
      $(newoption).attr('value', newtimezone);
      $(newoption).text(newtimezone);
      $('select').append(newoption);
      $('#timezone-message').remove();
    }

    // Enabling save button only when inputs change
    var button = $('button[type=submit]');
    $('input[type=email]').keyup(function() {
      if ($(this).val() != savedEmail)
        button.removeAttr('disabled');
      else
        button.attr('disabled', 'disabled');
    });
    $('select').change(function() {
      button.removeAttr('disabled');
    });
  });