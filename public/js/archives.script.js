$.getJSON('/dashboard/posts', function(posts) {
  for (var year in posts) {
    var calDiv = $(document.createElement('div'));
    var title = $(document.createElement('h4'));
    title.text(year);
    calDiv.addClass('cal-heatmap year' + year);
    calDiv.append(title);
    calDiv.append(document.createElement('hr'));
    $('body').append(calDiv);

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
      onClick: function(date, nb) {
        var timestamp = date.getTime() / 1000;
        if (nb !== null)
          window.location.href = window.location.protocol + '//' + window.location.host + '/dashboard/view/' + timestamp;
      }
    });
  }
});