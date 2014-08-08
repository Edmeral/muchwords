var content = $('#content');
content.autosize();
$('#title').autosize();

var progressBar = new Nanobar({
  bg: '#34495e',
  id: 'progress-bar'
});

var submit = $('#submit');
$('#submit').click(function(e) {
  e.preventDefault();

  submit.text('Saving..').removeClass('btn-success').addClass('btn-default');

  $.post('./dashboard', $('form').serialize(), function() {
    submit.text('Saved!');
    submit.removeClass('btn-default').addClass('btn-success')
    setTimeout(function() {
      submit.text('Save');
    }, 2000);
  });

});

