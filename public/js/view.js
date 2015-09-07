$('#delete').click(function(e) {
  if (!confirm('Are you sure?'))
    e.preventDefault();
});

$('#edit').click(function(e) {
  e.preventDefault();
  var post = $('p:eq(2)').text();
  $('p:eq(2)').hide(0);
  $('form').show(0);

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
    $.ajax({
      url: '/dashboard/' + id, 
      type: 'PUT',
      data: $('form').serialize()
    })
     .done(function() {
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

});
