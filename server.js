var express = require('express');
var app = express();
var port = process.env.PORT || 1994;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

mongoose.connect(require('./config/db').url);

app
	.use(morgan('dev'))
	.use(cookieParser())
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json())
	.use(express.static(__dirname + '/public'))

	.set('view engine', 'ejs')

	.use(session({ secret: 'topsecret', 
								 saveUninitialized: true,
                 resave: true }))
	.use(passport.initialize())
	.use(passport.session())
	.use(flash());

require('./config/passport')(passport);
require('./routes/default')(app, passport);
require('./routes/dashboard')(app);
// require('./routes/api')(app, passport);

app.listen(port);
console.log('Head out to http://localhost:' + port);
