// libraries
const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser')

// back end dependencies

// local dependencies
const views = require('./routes/views')

// initialize express app
const app = express();

// set POST request body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up sessions
app.use(session({
  secret: 'session-secret',
  resave: 'false',
  saveUninitialized: 'true'
}));



// set routes
app.use('/', views);
// app.use('/api', api);
app.use('/static', express.static('public'));

// usage
// app.get('/endpoint', callback_function(req, res) {
//
//     req.redirect('another_endpoint');
// })






// 404 route
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// route error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    status: err.status,
    message: err.message,
  });
});

// port config
const port = process.env.PORT || 3000;
const server = http.Server(app);
server.listen(port, function() {
  console.log('Server running on port: ' + port);
});


// // for performance reasons on heroku
// setInterval(function() {
//     http.get("http://stylex.herokuapp.com");
// }, 300000); // every 5 minutes (300000)
