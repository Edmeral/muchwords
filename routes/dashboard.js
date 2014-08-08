var Post = require('../models/post');
var moment = require('moment');

module.exports = function(app) {
  app
    .get('/dashboard', isLoggedIn, function(req, res) {

        Post.find({ 'username': req.user.username}, function(err, posts) {
          if (err)
            res.render('dashboard.ejs', { user: req.user, posts: null });

          else {
            
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
              if (!moment(posts[length - 1].date).isSame(moment(), 'day'))  
                noPostToday = true;                             
            } 

            var content = '';
            if(!noPostToday) 
              content = posts[length - 1].content;
            
            res.render('dashboard.ejs', { 
              user: req.user, 
              posts: posts,
              noPosts: noPosts,
              noPostToday: noPostToday,
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

        /* -Begin from this moment minus 366 days.
          - a loop that iterates until this moment
          - For each date we see if there is a post that was written in the same day
          - if there is, get the wordsCount, otherwise set it to 0
        */
       
        for (var i = 365; i >= 0; i--) {

          var newMoment = thisMoment.subtract(i, 'days');
          console.log(i, newMoment);
          var item = [newMoment.toDate(), 0];

          for (var j = 0, l = posts.length; j < l; j++) {

            var date = posts[j].date;
            var wordsCount = posts[j].wordsCount;

            if (isSameDay(moment(date), newMoment))
              item = [date, wordsCount];

          }
          calendar.push(item);
        }

        res.json(calendar);
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