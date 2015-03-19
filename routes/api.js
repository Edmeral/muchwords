var Post = require('../models/post');
var moment = require('moment-timezone');

module.exports.calendarHandler = calendarHandler;

module.exports.default = function(app) {
  // To get a json array like the one GitHub uses to draw commits calendar on the user profile
  // Something like this: https://github.com/users/Edmeral/contributions_calendar_data?_=1407428689806
  app
    .get('/dashboard/calendar', isLoggedIn, calendarHandler, function(req, res) {
      res.json(req.calendar);
    })
  
  // Getting a json file for all posts sorted by year
  .get('/dashboard/posts', isLoggedIn, function(req, res) {
    Post.find({ 'username': req.user.username }, function(err, posts) {
      if (err) console.log(err);

      var results = {};
      var post = {};

      for (var i = 0; i < posts.length; i++) {
        if (posts[i].wordsCount === 0) continue;
        var newMoment = moment(posts[i].date).tz(req.user.timezone);
        var timestamp = newMoment.format('X');
        var year = newMoment.year();
        if (!(year in results))
          results[year] = {};
        results[year][timestamp] = posts[i].wordsCount;
      }
      res.json(results);
    });
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    next();
  else
    res.redirect('/');
}

function isSameDay(moment1, moment2) {
  return moment1.isSame(moment2, 'day');
}

function calendarHandler(req, res, next) {
  Post
    .find({ username: req.user.username })
    .sort({ date: -1 })
    .limit(366)
    .exec(function(err, posts) {

      if (err) console.log(err);
      var calendar = {};
      var timezone = req.user.timezone;

      for (var j = 0, l = posts.length; j < l; j++) {
        var timestamp = moment(posts[j].date).tz(timezone).format('X');
        var wordsCount = posts[j].wordsCount;
        if (wordsCount !== 0)
          calendar[timestamp] = wordsCount;
      }
      
      req.calendar = calendar;
      next();
    });
}