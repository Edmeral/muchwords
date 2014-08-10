var content = $('#content');
content.autosize();
$('#title').autosize();


/**
 *  Manging the state of the progress bar on top
*/
var progressBar = new Nanobar({
  bg: '#068894',
  id: 'progressbar'
});

var text = content.val();
var length = text.replace(/^\s+|\s+$/g,"").split(/\s+/).length;
if (text === '') length = 0;
progressBar.go((length / 751) * 100);

content.keyup(function() {
  text = content.val();
  length = text.replace(/^\s+|\s+$/g,"").split(/\s+/).length;
  if (text === '') length = 0;
  progressBar.go((length / 751) * 100);
});

/**
 *  Saving the post without refreshing the page
*/
var submit = $('#submit');
$('#submit').click(function(e) {
  e.preventDefault();

  submit.text('Saving..').removeClass('btn-success').addClass('btn-default');

  $.post('/dashboard', $('form').serialize(), function() {
    submit.text('Saved!');
    submit.removeClass('btn-default').addClass('btn-success');
    setTimeout(function() {
      submit.text('Save');
    }, 2000);
  });

});

/**
 *  Drawing the words calendar
*/

$.getJSON('/dashboard/calendar', function(data) {



});

