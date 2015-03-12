$(function() {
  var wordsNum = 500;
  var submit = $('#submit');
  var changed = false;

  window.onbeforeunload = function() {
    if (changed)
      return 'You have unsaved changes, are you sure you want to navigate away?';
  };

  function savePost() {
    submit.text('Saving..');
    $.post('/dashboard', $('form').serialize(), function() {
      changed = false;
      submit.text('Saved!');
      setTimeout(function() {
        submit.text('Draft');
      }, 2000);
    });

    return false;
  }

  // Saving the post every 5 seconds, if the content changes
  setInterval(function() {
    if (changed) 
      savePost();
  }, 5000);

  // Defining the circualr progress bar
  $(".dial").knob({ 
    'min':0,
    'max': wordsNum,
    'skin':"tron",
    'thickness': 0.6180339887, // Golden ratio conjugate, it justs looks cool! 
    'step': 0.1, 
    'readOnly': true,
    'displayInput': false              
  });

  // Prevent animations from appearing as the page load
  $('body').removeClass('preload');

  // Text area grows as content grows
  var content = $('#content');
  content.autosize();
  $('#title').autosize();


 // content.one('keyup', function() {
 //   $('body').scrollTo('#content', { duration: 'slow', offset: -50 });
    
    
 //  });

  /**
   *  Manging the state of the progress bar on top
  */
  var progressBar = new Nanobar({
    bg: '#068894',
    id: 'progressbar'
  });

  function textChangeHandler() {
    var text = content.val();
    var length = text.replace(/^\s+|\s+$/g,"").split(/\s+/).length;
    if (text === '') length = 0;
    progressBar.go((length / wordsNum) * 100);
    $('.dial').val(length).trigger('change');
    $('form p').text(length + (length == 1 ? ' word':' words') + '.');
  }

  textChangeHandler();

  content.keyup(function() {
    changed = true;
    textChangeHandler();
  });

  /**
   *  Drawing the words calendar
  */

  // $.getJSON('/dashboard/calendar', function(posts) {
  //   // Get the max number of words
  //   var max = 0;
  //   for (var i in posts) {
  //     if (posts[i][1] > max)
  //       max = posts[i][1];
  //   }

  //   var d1 = max / 4;
  //   var d2 = max / 2;
  //   var d3 = max - d1;

  //   

  //   var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  //   for (var j in posts) {
  //     var quartile = document.createElement('a');
  //     var wordsCount = posts[j][1];
  //     var link = posts[j][2];
  //     var date = new Date(posts[j][0]);
  //     var dateStr = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  //     var cssClass;
  //     var words = 'words';

  //     if (wordsCount == 1) words = 'word';
  //     var title = '<strong>' + wordsCount + ' ' + words + '</strong> on ' + dateStr;
  //     if (wordsCount === 0) 
  //       title = '<strong>No words</strong> on ' + dateStr;

  //     $(quartile).attr('title', title);
  //     if (link && wordsCount) $(quartile).attr('href', '/dashboard/view/' + link);

  //     if (wordsCount === 0) cssClass = 'q0';
  //     else if (wordsCount < d1) cssClass = 'q1';
  //     else if (wordsCount >= d1 && wordsCount < d2) cssClass = 'q2';
  //     else if (wordsCount >= d2 && wordsCount < d3) cssClass = 'q3';
  //     else if (wordsCount >= d3) cssClass = 'q4';

  //     $(quartile).addClass('quartile ' + cssClass);

  //     $(quartile).tipsy({
  //       gravity: 's',
  //       opacity: 0.65,
  //       html: true
  //     });

  //     $('#calendar-grid').append(quartile);
  //   }

    
  //   $('.current-streak').text('Current streak: ' + currentStreak + (currentStreak == 1 ? ' day.':' days.'));
  //   $('.longest-streak').text('Longest streak: ' + longestStreak + (longestStreak == 1 ? ' day.':' days.'));
  //   $('.total-words').text('Total words written: ' + totalWords + '.');
  // });
  
  // Adding to keyboard shortcut to save the post
  $('#content').bind('keydown', 'Ctrl+s', savePost);
  $(document).bind('keydown', 'Ctrl+s', savePost);

  
  $.getJSON('/dashboard/calendar', function(calendar) {

    // Getting the longest and current streaks + total days of writing.   
    var streaks = [];
    var tmpStreak = 0;
    var totalWords = 0;
    for (var i in calendar) {
      if (calendar[i] !== 0) {
        tmpStreak++;
        totalWords += calendar[i];
      }
      else {
        streaks.push(tmpStreak);
        tmpStreak = 0;
      }
    }
    streaks.push(tmpStreak); // Adding the last streak because it's not added in the loop

    var currentStreak = streaks[streaks.length - 1];
    // If the user hasn't written anything today, the current streak
    // shoudln't be equal to 0 instead it should equal the the previous streak
    if (calendar[Object.keys(calendar).sort().pop()] === 0) 
      currentStreak = streaks[streaks.length - 2];
    var longestStreak = Math.max.apply(Math, streaks);

    $('.spinner').hide();
    var stats = [longestStreak, currentStreak, totalWords];

    /*
    * Cal-heatmap
    */
    var cal = new CalHeatMap();

    // Get the next month of the previous year
    var now = new Date();
    var start = new Date(now.getFullYear() - 1, now.getMonth() + 1, now.getDate());

    cal.init({
      start: start,
      itemName: ['word', 'words'],
      itemSelector: '.cal-heatmap',
      data: calendar,
      domain: 'month',
      tooltip: true,
      cellSize: 13,
      subDomainTitleFormat: {
        empty: '0 words on {date}',
        filled: '{count} {name} {connector} {date}'
      },
      legendColors: {
        min: '#f1c40f',
        max: '#d35400'
      },
      legend: [10, 50, 100, 200],
      onClick: function(date, nb) {
        var timestamp = date.getTime() / 1000;
        if (nb !== null)
          window.location.href = window.location.protocol + '//' + window.location.host + '/dashboard/view/' + timestamp;
      },
      afterLoadData: function(data) {
        var newData = {};
        for (var date in data) {
          if (data[date] !== 0) 
            newData[date] = data[date];
        }
        return newData;
      },
      onComplete: function() {
        // $('.cal-heatmap').css('width', $('.cal-heatmap-container').width() + 'px');
        // $('.cal-heatmap').css('margin', 'auto');
        $('#cal-stats').css('display', 'block');
        $('#cal-stats .box strong').each(function(index) {
          $(this).text(stats[index]);
        });
      }
    });
  }); 
});