var Post = require('../models/post');
var moment = require('moment');
var time = require('time');

module.exports = function(app) {
  app
    .get('/dashboard', isLoggedIn, function(req, res) {

        Post.find({ 'username': req.user.username})
          .sort({ date: 1 })
          .exec(function(err, posts) {
          if (err)
            res.render('dashboard/dashboard.ejs', { user: req.user, posts: null });

          else {
            var totalWords = 0;
            for (var i = 0, l = posts.length; i < l; i++) {
              totalWords += posts[i].wordsCount;
            }

            var noPosts = false; 
            var noPostToday = false;

            var length = posts.length;
            if (length === 0) {
              noPosts = true;
              noPostToday = true;
            }
            else {
              // if the latest post date field and today's date are not equal
              // then the user hasn't yet written anything today
              var lastPostDate = new time.Date(posts[length - 1].date.toString());
              var now = new time.Date();
              now.setTimezone(req.user.timezone);
              lastPostDate.setTimezone(req.user.timezone);

              if (!(isSameDay(moment(now), moment(lastPostDate))))  
                noPostToday = true;                             
            } 

            var content = '';
            if(!noPostToday) 
              content = posts[length - 1].content;
            
            res.render('dashboard/dashboard.ejs', { 
              user: req.user, 
              posts: posts,
              noPosts: noPosts,
              noPostToday: noPostToday,
              totalWords: totalWords,
              content: content
            });
          }
        });
      })

    .post('/dashboard',isLoggedIn, function(req, res) {

      var content = req.body.content;
      var wordsCount = content.replace(/^\s+|\s+$/g,"").split(/\s+/).length;
      if (content === '') wordsCount = 0;
      
      Post.find({ 'username': req.user.username }, function(err, posts) {

        if (err) console.log(err);

        else {
          // Checking if there is already a post that was written today we don't need to create
          // a new one, we just update it
          if (posts.length > 0 && isSameDay(moment(posts[posts.length - 1].date), moment())) {
            var id = posts[posts.length - 1]._id;
            Post.findById(id, function(err, post) {
              if (err) console.log(err);
              else {
                post.content = content;
                post.wordsCount = wordsCount;

                post.save(function(err) {
                  if (err) console.log(err);
                });
              }
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
        }
      });

      res.redirect('/');

    })
   
  // To get a json array like the one GitHub uses to draw commits calendar on the user profile
  // https://github.com/users/Edmeral/contributions_calendar_data?_=1407428689806
  .get('/dashboard/calendar', isLoggedIn, function(req, res) {
    Post
      .find({'username': req.user.username})
      .sort({ 'date': -1 })
      .limit(366)
      .exec(function(err, posts) {

        if (err) console.log(err);
        var calendar = [];

        /* -Begin from this moment minus 365 days.
          - a loop that iterates until this moment
          - For each date we see if there is a post that was written in the same day
          - if there is, get the wordsCount, otherwise set it to 0
          - Get also the id of the post
        */
        
        for (var i = 365; i >= 0; i--) {

          var newMoment = moment().subtract(i, 'days');
          var item = [newMoment.format('YYYY-MM-DD'), 0, ''];

          for (var j = 0, l = posts.length; j < l; j++) {

            var date = moment(posts[j].date);
            var wordsCount = posts[j].wordsCount;
            var id = posts[j]._id;

            if (isSameDay(date, newMoment))
              item = [date.format('YYYY-MM-DD'), wordsCount, id];

          }
          calendar.push(item);
        }

        res.json(calendar);
    });

  })
  
  // For displaying an individual post
  .get('/dashboard/view/:id', isLoggedIn, function(req, res) {
    Post.find({'_id': req.params.id, 'username': req.user.username}, function(err, post) {

      if(err) console.log(err);

      if (post) {
        var content = post[0].content.replace(/\n/g, "<br />");
        res.render('dashboard/view.ejs', { post: content});
      }
      else 
        res.redirect('/');
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