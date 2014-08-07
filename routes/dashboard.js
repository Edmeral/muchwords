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

						if (posts.length === 0) {
							noPosts = true;
							noPostToday = true;
						}
						else {
							// if the latest post date field and today's date are not equal
							// then the user hasn't yet written anything today
							if (!moment(posts[0].date).isSame(moment(), 'day'))  
								noPostToday = true; 														
						} 

						// An array like the one GitHub uses to draw commits calendar on the user profile
						// https://github.com/users/Edmeral/contributions_calendar_data?_=1407428689806
						var postsCalendate = []; 

						res.render('dashboard.ejs', { 
							user: req.user, 
							posts: posts,
							noPosts: noPosts,
							noPostToday: noPostToday
						});
					}
				});
			})

		.post('/dashboard',isLoggedIn, function(req, res) {

			// var title = req.body.title; I don't need this right now
			var content = req.body.content;

			var newPost = new Post();

			newPost.username = req.user.username;
			newPost.title = title;
			newPost.content = content;
			newPost.wordsCount = content.split(/[\s,;\.:<>"%~#&!*_=@\$\^\?\|\\\{\}\-\+\[\]\(\)\/]+/).length;

			newPost.save(function(err) {
				if (err) console.log(err);
			});

			res.redirect('/');
		});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		next();
	else
		res.redirect('/');
}