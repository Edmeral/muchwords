var Post = require('../models/post');
var moment = require('moment-timezone');

module.exports = function(app) {
  app
    .get('/dashboard', isLoggedIn, function(req, res) {

        Post.find({ 'username': req.user.username})
          .sort({ date: 1 })
          .exec(function(err, posts) {

            

            if (err)
              console.log(err);
            
            var totalWords = 0;
            var activeDays = 0;

            for (var i = 0, l = posts.length; i < l; i++) {
              totalWords += posts[i].wordsCount;

              if (posts[i].content !== '')
                activeDays++;
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
              if (!isSameDay(moment(), moment(posts[length - 1].date), req.user.timezone))  
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
              content: content,
              activeDays: activeDays
            });
          });
      })

    // Adding a new post, or updating one
    .post('/dashboard', isLoggedIn, function(req, res) {

      var content = req.body.content;
      var wordsCount = content.replace(/^\s+|\s+$/g,"").split(/\s+/).length;
      if (content === '') wordsCount = 0;
      
      Post
        .find({ 'username': req.user.username })
        .sort({ 'date': 1 })
        .exec(function(err, posts) {

        if (err) console.log(err);

        else {
          // Checking if there is already a post that was written today we don't need to create
          // a new one, we just update it
          if (posts.length > 0 && isSameDay(moment(posts[posts.length - 1].date), moment(), req.user.timezone)) {
            var id = posts[posts.length - 1]._id;

            Post.findById(id, function(err, post) {
              post.content = content;
              post.wordsCount = wordsCount;

              post.save(function(err) {
                if (err) console.log(err);
              });
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

  // For displaying an individual post
  .get('/dashboard/view/:id', isLoggedIn, function(req, res) {
    Post.find({'_id': req.params.id, 'username': req.user.username}, function(err, post) {

      if (err) console.log(err);

      if (post) {
        var content = post[0].content.replace(/\n/g, "<br />");
        res.render('dashboard/view.ejs', { content: content, post: post[0] });
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

function isSameDay(moment1, moment2, timezone) {
  var m1 = moment1;
  var m2 = moment2;
  return m1.tz(timezone).isSame(m2.tz(timezone), 'day');
}
