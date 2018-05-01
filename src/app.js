// libraries
const http         = require('http');
const express      = require('express');
const session      = require('express-session');
const bodyParser   = require('body-parser');
const web3         = require('web3');
const cookieParser = require('cookie-parser')
const logger       = require('morgan');
const path         = require('path');

// back end dependencies
const authMiddleware = require("./middlewares/auth-middleware.js");
const views          = require('./routes/views.js');
const api            = require('./routes/api.js');

// initialize express app
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(session({
  secret: 'MIGeMA0GCSqGSIb3DQEBAQUAA4GFADCBwAKBgHu8A19UsKk97bkS9BWZozXT1BGTkZn2qB+WcAmU7Y4u3+DN9WTR4sItFSre5JVG9ZkdZmxz3In9elKaPJLFatYjTWtsHSbwYMFKhlHkFjD2LXYAlcsEDVPapoJC429CoUFFywlEpB8sPbdA+v4xKZZvlT3RNxlfu+NrzBdj6yutAgMBAAr=',
  resave: 'false',
  saveUninitialized: 'true'
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// authenticate users
app.use(authMiddleware());

// register unauthenticated routes first
app.use('/api', api);
app.use('/static', express.static('public'));

// restrict unauthenticated users to only / view
app.use(function(req, res, next) {
  if (req.user || req.url === '/') {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/');
  }
});
app.use('/', views);

// 404 route
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// route error handler
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.send({
    status: err.status,
    message: err.message,
  });
});

// port config
const port = process.env.PORT || 7545;
const server = http.Server(app);
server.listen(port, function() {
  console.log('Server running on port: ' + port);
});

// // for performance reasons on heroku
// setInterval(function() {
//     http.get("http://stylex.herokuapp.com");
// }, 300000); // every 5 minutes (300000)
