var Post = require('../models/post');
var moment = require('moment-timezone');

module.exports = function(app) {
  // To get a json array like the one GitHub uses to draw commits calendar on the user profile
  // https://github.com/users/Edmeral/contributions_calendar_data?_=1407428689806
  app
    .get('/dashboard/calendar', isLoggedIn, function(req, res) {
      Post
        .find({'username': req.user.username})
        .sort({ 'date': -1 })
        .limit(366)
        .exec(function(err, posts) {

          if (err) console.log(err);
          var calendar = [];
          var timezone = req.user.timezone;
          /* -Begin from this moment minus 365 days.
            - a loop that iterates until this moment
            - For each date we see if there is a post that was written in the same day
            - if there is, get the wordsCount, otherwise set it to 0
            - Get also the id of the post
          */
          
          for (var i = 365; i >= 0; i--) {

            var newMoment = moment().subtract(i, 'days').tz(timezone);
            var item = [newMoment.format('YYYY-MM-DD'), 0, ''];

            for (var j = 0, l = posts.length; j < l; j++) {

              var date = moment(posts[j].date).tz(timezone);

              if (isSameDay(date, newMoment)) {
                var wordsCount = posts[j].wordsCount;
                var id = posts[j]._id;
                item = [date.format('YYYY-MM-DD'), wordsCount, id];
              }
            }
            calendar.push(item);
          }
          res.json(calendar);
      });

    })
  
  // Getting a json file for all posts
  .get('/dashboard/posts', isLoggedIn, function(req, res) {
    Post.find({ 'username': req.user.username }, function(err, posts) {
      if (err) console.log(err);

      var results = [];
      var post = {};

      for (var i = 0; i < posts.length; i++) {
        post.id = posts[i]._id;
        post.date = posts[i].date;
        results.push(post);
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