$(function() {

  function savePost() {
    submit.text('Saving..').removeClass('btn-success').addClass('btn-default');

    $.post('/dashboard', $('form').serialize(), function() {
      submit.text('Saved!');
      submit.removeClass('btn-default').addClass('btn-success');
      setTimeout(function() {
        submit.text('Save');
      }, 2000);
    });
  }

  // Managing the circualr progress bar
  $(".dial").knob({ 
    'min':0,
    'max':100,
    'skin':"tron",
    'thickness': 0.1,
    'step': 0.1, 
    'readOnly': true,
    'displayInput': false              
  });

  // Prevent animations from appearing as the page load
  $('body').removeClass('preload');
  var content = $('#content');
  content.autosize();
  $('#title').autosize();


  content.one('keyup', function() {
    $('body').scrollTo('#content', { duration: 'slow', offset: -50 });
    
    
  });
  /**
   *  Manging the state of the progress bar on top
  */
  var progressBar = new Nanobar({
    bg: '#068894',
    id: 'progressbar'
  });

  var text = content.val();
  var length = text.replace(/^\s+|\s+$/g,"").split(/\s+/).length;
  var previousLength = length;
  if (text === '') length = 0;
  progressBar.go((length / 751) * 100);
  $('.dial').val((length / 751) * 100).trigger('change');
  $('form p').text(length + (length == 1 ? ' word':' words') + '.');

  content.keyup(function() {
    text = content.val();
    length = text.replace(/^\s+|\s+$/g,"").split(/\s+/).length;
    if (text === '') length = 0;
    progressBar.go((length / 751) * 100);
    $('.dial').val((length / 751) * 100).trigger('change');
    $('form p').text(length + (length == 1 ? ' word':' words') + '.');
    savePost(); 
  });

  /**
   *  Saving the post without refreshing the page
  */
  var submit = $('#submit');
  $('#submit').click(function(e) {
    e.preventDefault();
    savePost();
  });

  /**
   *  Drawing the words calendar
  */

  $.getJSON('/dashboard/calendar', function(posts) {
    // Get the max number of words
    var max = 0;
    for (var i in posts) {
      if (posts[i][1] > max)
        max = posts[i][1];
    }

    var d1 = max / 4;
    var d2 = max / 2;
    var d3 = max - d1;

    $('.spinner').hide();

    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (var j in posts) {
      var quartile = document.createElement('a');
      var wordsCount = posts[j][1];
      var link = posts[j][2];
      var date = new Date(posts[j][0]);
      var dateStr = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      var cssClass;
      var words = 'words';

      if (wordsCount == 1) words = 'word';
      var title = '<strong>' + wordsCount + ' ' + words + '</strong> on ' + dateStr;
      if (wordsCount === 0) 
        title = '<strong>No words</strong> on ' + dateStr;

      $(quartile).attr('title', title);
      if (link) $(quartile).attr('href', '/dashboard/view/' + link);

      if (wordsCount === 0) cssClass = 'q0';
      else if (wordsCount < d1) cssClass = 'q1';
      else if (wordsCount >= d1 && wordsCount < d2) cssClass = 'q2';
      else if (wordsCount >= d2 && wordsCount < d3) cssClass = 'q3';
      else if (wordsCount >= d3) cssClass = 'q4';

      $(quartile).addClass('quartile ' + cssClass);

      $(quartile).tipsy({
        gravity: 's',
        opacity: 0.65,
        html: true
      });

      $('#calendar-grid').append(quartile);
    }

    // Geting the longest and current streaks + total days of writing.   
    var streaks = [];
    var tmpStreak = 0;
    for (i = posts.length - 1; i >= 0; i--) {
      if (posts[i][1]) tmpStreak++;
      else {
        streaks.push(tmpStreak);
        tmpStreak = 0;
      }
    }
    var currentStreak = streaks[0];
    // If the user hasn't written anything today, the current strak
    // shoudln't be equall to 0 instead it shoudl equal the the previous streak
    if (posts[posts.length - 1][1] === 0) currentStreak = streaks[1];
    var longestStreak = Math.max.apply(Math, streaks);
    $('.current-streak').text('Current streak: ' + currentStreak + (currentStreak == 1 ? ' day.':' days.'));
    $('.longest-streak').text('Longest streak: ' + longestStreak + (longestStreak == 1 ? ' day.':' days.'));
    $('.total-words').text('Total words written: ' + totalWords + '.');
  });
});