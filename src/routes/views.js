// dependencies
const express = require("express");
const router = express.Router();

router.get("/", function(req, res, next) {
  res.render("index");
});

router.get("/index", function(req, res, next) {
  res.redirect("/");
});

router.get("/dashboard", function(req, res, next) {
  res.render("dashboard", { user: req.user });
});

router.get("/unfulfilled", function(req, res, next) {
  // could add authentication here... if authetnicated:
  res.render("unfulfilled_options", { user: req.user });
});




module.exports = router;
