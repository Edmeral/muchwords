$(function() {
  var wordsNum = 500;
  var submit = $('#submit');
  var changed = false;

  window.onbeforeunload = function() {
    if (changed)
      return 'You have unsaved changes, are you sure you want to navigate away?';
  };

  function savePost() {
    changed = false;
    submit.text('Saving..');
    $.post('/dashboard', $('form').serialize(), function() {
      if(!changed) {
        submit.text('Saved!');
        setTimeout(function() {
          submit.text('Draft');
        }, 2000);
      }
    });

    return false;
  }

  // Saving the post every 5 seconds, if the content changes
  setInterval(function() {
    if (changed) 
      savePost();
  }, 5000);

  // Defining the circular progress bar
  $(".dial").knob({ 
    'min':0,
    'max': wordsNum,
    'skin':"tron",
    'thickness': 0.6180339887, // Golden ratio conjugate, it just looks cool! 
    'step': 0.1, 
    'readOnly': true,
    'displayInput': false              
  });

  // Prevent animations from appearing as the page load
  $('body').removeClass('preload');

  // Text area grows as content grows
  var content = $('#content');
  content.autosize();


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

  // Adding to keyboard shortcut to save the post
  $('#content').bind('keydown', 'Ctrl+s', savePost);
  $(document).bind('keydown', 'Ctrl+s', savePost);

  /*
   * Drawing the calendar
  */
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