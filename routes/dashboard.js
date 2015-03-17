var Post = require('../models/post');
var User = require('../models/user');
var moment = require('moment-timezone');

module.exports = function(app) {
  app
    .get('/dashboard', isLoggedIn, function(req, res) {

        Post.findOne({ 'username': req.user.username})
          .sort({ date: -1 })
          .exec(function(err, post) {

            if (err) console.log(err);

            var content = '';
            // if the latest post date field and today's date are equal
            // then the user has already written something today
            if (post !== null && isSameDay(moment(), moment(post.date), req.user.timezone)) 
              content = post.content;
              
            res.render('dashboard/dashboard.ejs', { content: content });
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
        
      res.redirect('/');
    })

  // For displaying an individual post
  .get('/dashboard/view/:timestamp', isLoggedIn, function(req, res) {
    Post.find({
      username: req.user.username,
      date: { $gte: moment.unix(req.params.timestamp).tz(req.user.timezone).startOf('day'),
              $lt: moment.unix(req.params.timestamp).tz(req.user.timezone).endOf('day')
            }
      }, function(err, post) {

      if (err) console.log(err);

      if (post && post.length > 0) {
        var content = post[0].content;
        var wordsCount = post[0].wordsCount + ' word' + (post[0].wordsCount == 1 ? '':'s');
        var date = moment(post[0].date).format('dddd, MMM Do YYYY');
        res.render('dashboard/view.ejs', { content: content, date: date, wordsCount: wordsCount });
      }
      else 
        res.redirect('/');
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
    res.render('dashboard/archives.ejs');
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
