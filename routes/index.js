var express = require('express');
var passport = require('passport');
var router = express.Router();

var utils = require('./../scripts/utils');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_LOGIN_CALLBACK_URL
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express', env: env});
});

router.get('/login',
  function (req, res) {
    res.render('login', {env: env});
  });

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/callback', passport.authenticate('auth0', {failureRedirect: '/url-if-something-fails'}), function (req, res) {
  // res.redirect(req.session.returnTo || '/portal/home');
  res.redirect('/portal/home');
});

router.get('/plcallback', passport.authenticate('auth0', {failureRedirect: '/url-if-something-fails'}), function (req, res) {
  // we want the NEW profile (if exists) - not the one in the session
  var dbUser = req.user;
  var dbUserTokens = req.user.tokens;
  utils.handleAccountLink(dbUser, req, dbUserTokens).then(function (user) {
    req.session.user = user;
    req.session.tokens = dbUserTokens;
    res.redirect(req.session.returnTo || '/portal/home');
  }, function (err) {
    console.error(err);
    res.redirect('/portal/password');
  });
});


module.exports = router;
