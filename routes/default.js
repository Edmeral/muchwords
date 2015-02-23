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
    .post('/login', function(req, res, next) {
      passport.authenticate('login', function(err, user, info) {
        if (err) return next(error);
        if (!user) return res.send(401);
        req.login(user, function(err) {
          if (err) { return next(err); }
          return res.send(200);
        });
      })(req, res, next);
    })

    .get('/logout', function(req, res) {
      req.logout();
      req.flash('logout-message', 'You are logged out succefully');
      res.redirect('/');
    });
};

