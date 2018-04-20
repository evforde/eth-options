// dependencies
const express = require('express');
const router = express.Router();

// public endpoints
router.get('/', function(req, res, next) {
  res.sendFile('main.html', { root: 'src/views' });
});

router.get('/unfulfilled', function(req, res, next) {
    // could add authentication here... if authetnicated:
  res.sendFile('unfulfilled_options.html', { root: 'src/views' });
});




module.exports = router;
