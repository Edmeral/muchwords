var LocalStrategy = require('passport-local');

var User = require('../models/user');

module.exports = function (passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	pasport.use('signup', new LocalStratgy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},

	function(req, username, password, done) {

		process.nextTick(function() {
			user.findOne({ 'username': username }, function(err, user) {

				if(user) return done(err);

				if (user) 
					return done(null, false, req.flash('signup-message', 'User Already registred'));

				else {
					var newUser = new User();

					newUser.username = username;
					newUser.password = newUser.generateHash(password);

					User.save(function(err) {
						if (err) throw err;
						return done(null, user);
					});
				}
			});
		});
	}
	));

	passport.use('login', new LocalStratgy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},

	function(req, username, password, done) {
		User.findOne({ 'username': username}, function(err, user) {
			 if (err) return done(err);

			 if (!user) 
			 	return done(null, false, req.flash('login-message', 'No user with username'));

			 if (!user.validPassword(password))
			 	return done(null, false, req.flash('login-message', 'Incorrect password!'));

			 else
			 	return done(null, user);
		});
	}
	));
};