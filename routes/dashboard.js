var Post = require('../models/post');
var User = require('../models/user');
var moment = require('moment-timezone');
var calendarHandler = require('../routes/api').calendarHandler;

module.exports = function(app) {
  app
    .get('/dashboard', isLoggedIn, calendarHandler, function(req, res) {
        // so that we can choose which page to redirect to after deleting a post
        req.session.return_to = '/dashboard'; 
        Post.findOne({ 'username': req.user.username})
          .sort({ date: -1 })
          .exec(function(err, post) {

            if (err) console.log(err);

            var content = '';
            // if the latest post date field and today's date are equal
            // then the user has already written something today
            if (post !== null && isSameDay(moment(), moment(post.date), req.user.timezone)) 
              content = post.content;
            
            var tour = false;
            if (req.query.tour == 'true')
              tour  = true;
            res.render('dashboard/dashboard.ejs', { 
              content: content,
              calendar: JSON.stringify(req.calendar),
              deleteMessage: req.flash('delete-message'),
              deleteError: req.flash('delete-error'),
              tour: tour
            });
          });
      })

    // Adding a new post, or updating one
    .post('/dashboard', isLoggedIn, function(req, res) {

      var content = req.body.content;
      var wordsCount = content.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
      if (content === '') wordsCount = 0;
      
      Post
        .findOne({ 'username': req.user.username })
        .sort({ date: -1 })
        .exec(function(err, post) {

          if (err) console.log(err);

          // Checking if there is already a post that was written today we don't need to create
          // a new one, we just update it
          if (post !== null && isSameDay(moment(), moment(post.date), req.user.timezone)) {

            post.content = content;
            post.wordsCount = wordsCount;

            post.save(function(err) {
              if (err) console.log(err);
            });
          }

          else {
            var newPost = new Post();

            newPost.username = req.user.username;
            newPost.content = content;
            newPost.wordsCount = wordsCount;

            newPost.save(function(err) {
              if (err) console.log(err);
            });
          }
        });

      res.redirect('/dashboard');
    })

  // For displaying an individual post
  .get('/dashboard/view/:timestamp', isLoggedIn, function(req, res) {
    Post.findOne({
      username: req.user.username,
      date: { $gte: moment.unix(req.params.timestamp).tz(req.user.timezone).startOf('day'),
              $lt: moment.unix(req.params.timestamp).tz(req.user.timezone).endOf('day')
            }
      }, function(err, post) {

      if (err) console.log(err);

      if (post !== null) {
        var content = post.content;
        var wordsCount = post.wordsCount + ' word' + (post.wordsCount == 1 ? '':'s');
        var date = moment(post.date).format('dddd, MMM Do YYYY');
        res.render('dashboard/view.ejs', { 
          content: content, 
          date: date, 
          wordsCount: wordsCount,
          id: post._id });
      }
      else 
        res.redirect('/dashboard');
    });
  })

  .get('/dashboard/settings', isLoggedIn, function(req, res) {
    res.render('dashboard/settings.ejs', {
      email: req.user.email || '',
      timezone: req.user.timezone
    });
  })
  .post('/dashboard/settings', isLoggedIn, function(req, res) {
    var email = req.body.email;
    var timezone = req.body.timezone;

    User.findOne({'username': req.user.username}, function(err, user) {

      var message = 'There was an error!';
      if (err) console.log(err);

      else {
        user.email = req.body.email || user.email;
        user.timezone = req.body.timezone || user.timezone;
        user.save(function(err) {
          if (!err) message = 'New settings saved successfully!';
          res.render('dashboard/settings.ejs', {
            message: message,
            email: email,
            timezone: timezone
          });
        });
      }
    });
  })

  .get('/dashboard/archives', isLoggedIn, function(req, res) {
    // so that we can choose which page to redirect to after deleting a post
    req.session.return_to = '/dashboard/archives';
    res.render('dashboard/archives.ejs', {
      deleteMessage: req.flash('delete-message'),
      deleteError: req.flash('delete-error')
    });
  })

  .get('/dashboard/delete/:id', isLoggedIn, function(req, res) {
    Post.remove({ _id: req.params.id, username: req.user.username }, function(err, removed) {
      if (err) {
        req.flash('delete-message', 'An error occurred while deleting the post');
        req.flash('delete-error', true);
        return res.redirect(req.session.return_to);
      }
      if (removed.result.n === 0) {
        req.flash('delete-message', 'Error: Can\'t delete this post!');
        req.flash('delete-error', true);
        return res.redirect(req.session.return_to);
      }
      req.flash('delete-message', 'Post deleted successfully!');
      res.redirect(req.session.return_to);
    });
  })

  .put('/dashboard/edit/:id', isLoggedIn, function(req, res) {
    Post.update({ _id: req.params.id, username: req.user.username }, { content: req.body.content }, function(err) {
      if (err) console.log(err);
      res.send('OK');
    });
  });

};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    next();
  else
    res.redirect('/');
}

function isSameDay(moment1, moment2, timezone) {
  var m1 = moment1;
  var m2 = moment2;
  return m1.tz(timezone).isSame(m2.tz(timezone), 'day');
}