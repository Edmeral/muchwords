// Hiding the delete post message after a while
setTimeout(function() {
  $('.cal-container .alert').hide(500);
}, 2000);

function clickHandler(date, nb) {
  var timestamp = date.getTime() / 1000;
  if (nb !== null)
    window.location.href = window.location.protocol + '//' + window.location.host + '/dashboard/view/' + timestamp;
}

$(function() {
  $.getJSON('/dashboard/posts', function(posts) {
    // posts is empty
    if (Object.keys(posts).length === 0) {
      $('.cal-container').append('You haven\'t wrote anything yet! Start <a href="/dashboard">writing</a>.');
    }

    for (var year in posts) {
      var calContainer = $('.cal-container');
      var calDiv = $(document.createElement('div'));
      var title = $(document.createElement('h4'));
      title.text(year);
      calDiv.addClass('cal-heatmap year' + year);
      calContainer.append(title);
      calContainer.append(document.createElement('hr'));
      calContainer.append(calDiv);
      $('body').append(calContainer);

      var cal = new CalHeatMap();
      var start = new Date(year);

      cal.init({
        start: start,
        itemName: ['word', 'words'],
        itemSelector: '.year' + year,
        data: posts[year],
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
        onClick: clickHandler
      });
    }
  });

});
