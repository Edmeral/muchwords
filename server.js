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
var MongoStore = require('connect-mongo')(session);

var DBUrl = require('./config/db').url;
mongoose.connect(DBUrl);

app
  .use(morgan('dev'))
  .use(cookieParser())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(__dirname + '/public'), { maxeage: 43200000 })

  .set('view engine', 'ejs')

  .use(session({ secret: process.env.SESSION_SECRET || 'topsecret',
                 saveUninitialized: true,
                 resave: true,
                 store: new MongoStore({
                  mongooseConnection: mongoose.connection
                 })
                }))
  .use(passport.initialize())
  .use(passport.session())
  .use(flash());

require('./config/passport')(passport);
require('./routes/default')(app, passport);
require('./routes/dashboard')(app);
require('./routes/api').default(app);

app.listen(port);
console.log('Head out to http://localhost:' + port);