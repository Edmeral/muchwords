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

    // Enabling save button when inputs change
    var button = $('button[type=submit]');
    $('input[type=email]').one('keyup', function() {
        button.removeAttr('disabled');
    });
    $('select').one('change', function() {
      button.removeAttr('disabled');
    });
  });