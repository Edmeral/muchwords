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
  });