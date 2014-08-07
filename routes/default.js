module.exports = function (app, passport){
	app
		.get('/', function(req, res) {
			if (req.isAuthenticated())
				res.redirect('/dashboard');

			else
				res.render('index.ejs', {
					signupMessage: req.flash('signup-message'),
					loginMessage: req.flash('login-message'),
					logoutMessage: req.flash('logout-message')
				 });
		})

		.post('/signup', passport.authenticate('signup', {
			successRedirect: '/dashboard',
			failureRedirect: '/',
			failureFlash: true
		}))
		.post('/login', passport.authenticate('login', {
			successRedirect: '/dashboard',
			failureRedirect: '/',
			failureFlash: true
		}))

		.get('/logout', function(req, res) {
			req.logout();
			req.flash('logout-message', 'You are logged out succefully');
			res.redirect('/');
		});
};

