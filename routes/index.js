var Post = require('../models/post');

module.export = function (app){
	app
		.get('/', function(req, res) {
			if (req.isAuthenticated())
				res.redirect('/dashboard');
			
			else
				res.render('index.ejs');
		})

		.get('/dashboard', isLoggedIn, function(req, res) {

			Post.find({ username: req.local.username}, function(err, posts) {
				if (err)
					res.render('index.ejs', { user: req.user, posts: null });

				else 
					res.render('index.ejs', { user: req.user, posts: posts });
			});

		})

		.post('/login', passport.authenticate('login', {
			successRedirect: '/dashboard',
			failureRedirect: '/login',
			failureFlash: true
		}))
		.post('signup', passport.authenticate('signup', {
			successRedirect: '/dashboard',
			failureRedirect: '/signup',
			failureFlash: true
		}))

		.get('/logout', function(req, res) {
			req.logout();
			res.redirect('/');
		});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		next();
	else
		res.redirect('/');
}