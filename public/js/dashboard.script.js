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

  // Getting the longest and current streaks + total days of writing.
  function isTheDayAfter(date1, date2) {
    return (date1.getDate() + 1 == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear());
  }

  function isTheSameDay(date1, date2) {
    return (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear());
  }

  var timestamps = Object.keys(calendar);
  var streaks = [];
  var tmpStreak = 1;
  var tmpDate = new Date(timestamps[0] * 1000);
  var totalWords = calendar[timestamps[0]];

  for (var i = 1; i < timestamps.length; i++) {

    totalWords += calendar[timestamps[i]];
    var date = new Date(timestamps[i] * 1000);

    if (isTheDayAfter(tmpDate, date)) 
      tmpStreak++;
    else {
      streaks.push(tmpStreak);
      tmpStreak = 1;
    }
    tmpDate = date;
  }

  streaks.push(tmpStreak); // Adding the last streak because it's not added in the loop

  var lastDate = new Date(timestamps[timestamps.length - 1] * 1000);
  var today = new Date();
  var currentStreak = 0;
  // If the user wrote today or hasn't written anything today, but wrote something the day before
  // the current streak shoudln't be equal to 0 instead it should equal the last streak
  if (isTheSameDay(lastDate, today) || isTheDayAfter(lastDate, today))
    currentStreak = streaks[streaks.length - 1];
  
  var longestStreak = Math.max.apply(Math, streaks);

  $('.spinner').hide();
  var stats = [longestStreak, currentStreak, totalWords];

  if ($.isEmptyObject(calendar))
    stats = [0, 0, 0];

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
        // Displaying "1 day" instead of "1 days"
        if (index == 1 && stats[index] == 1) 
          $(this).next().text('day');
      });
    }
  });
  
  if (typeof Shepherd != 'undefined') {
    console.log(Shepherd);
    var tour  = new Shepherd.Tour({
       defaults: {
        classes: 'shepherd-theme-arrows'
       }
    });

      tour.addStep('welcome', {
      text: ['Shepherd is a javascript library for guiding users through your app. It uses <a href="http://github.hubspot.com/tether/">Tether</a>, another open source library, to position all of its steps.', 'Tether makes sure your steps never end up off screen or cropped by an overflow. Try resizing your browser to see what we mean.'],
      attachTo: '#cal-stats',
      classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
      buttons: [
        {
          text: 'Exit',
          classes: 'shepherd-button-secondary',
          action: tour.cancel
        }, {
          text: 'Next',
          action: tour.next,
          classes: 'shepherd-button-example-primary'
        }
      ]
    });

    tour.start();
  }

  
});