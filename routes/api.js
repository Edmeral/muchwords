var Post = require('../models/post');
var moment = require('moment-timezone');

module.exports = function(app) {
  // To get a json array like the one GitHub uses to draw commits calendar on the user profile
  // Something like this: https://github.com/users/Edmeral/contributions_calendar_data?_=1407428689806
  app
    .get('/dashboard/calendar', isLoggedIn, function(req, res) {
      Post
        .find({'username': req.user.username})
        .sort({ 'date': -1 })
        .limit(366)
        .exec(function(err, posts) {

          if (err) console.log(err);
          var calendar = {};
          var timezone = req.user.timezone;
          
          /* -Begin from this moment minus 365 days.
            - a loop that iterates until this moment
            - For each date we see if there is a post that was written in the same day
            - if there is, get the wordsCount, otherwise set it to 0
            - Get also the id of the post
          */
          
          for (var i = 365; i >= 0; i--) {

            var newMoment = moment().subtract(i, 'days').tz(timezone);
            var timestamp = newMoment.format('X');
            calendar[timestamp] = 0;

            for (var j = 0, l = posts.length; j < l; j++) {

              var date = moment(posts[j].date).tz(timezone);

              if (isSameDay(date, newMoment)) {
                var wordsCount = posts[j].wordsCount;
                var id = posts[j]._id;
                calendar[timestamp] = wordsCount;
              }
            }
          }
          res.json(calendar);
      });

    })
  
  // Getting a json file for all posts sorted by year
  .get('/dashboard/posts', isLoggedIn, function(req, res) {
    Post.find({ 'username': req.user.username }, function(err, posts) {
      if (err) console.log(err);

      var results = {};
      var post = {};

      for (var i = 0; i < posts.length; i++) {
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