// dependencies
const express = require('express');
const router = express.Router();

// public endpoints
router.get('/', function(req, res, next) {
  // TODO(eforde): if authed, send right to dashboard
  res.sendFile('index.html', { root: 'src/views' });
});

router.get('/dashboard', function(req, res, next) {
  if (!req.user) {
    res.redirect('/');
    return;
  }
  res.sendFile('dashboard.html', { root: 'src/views' });
});

router.get('/unfulfilled', function(req, res, next) {
  // could add authentication here... if authetnicated:
  res.sendFile('unfulfilled_options.html', { root: 'src/views' });
});




module.exports = router;
