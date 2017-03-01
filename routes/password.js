var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

var utils = require('./../scripts/utils');


router.get('/', ensureLoggedIn, function (req, res, next) {
  var user = (req.session.user) ? req.session.user : req.user;
  if (!user) {
    req.logout();
    return res.redirect('/');
  } else if (!user.emails || !user.emails.length) {
    return res.redirect('/portal/home');
  } else if (utils.isUserPasswordProfile(user)) {
    return res.redirect('/portal/home');
  } else {
    var hasUserPasswordProfile = req.session.hasUserPasswordProfile;
    if (!hasUserPasswordProfile) {
      return res.redirect('/portal/home');
    } else {

      var options = {
        user: user,
        email: user.emails[0].value,
        clientId: process.env.AUTH0_CLIENT_ID,
        domain: process.env.AUTH0_DOMAIN,
        passwordConnection: process.env.AUTH0_DB_CONNECTION,
        callback: process.env.AUTH0_PASSWORD_CALLBACK_URL,
        state: '12345'
      };
      res.render('password', options);
    }
  }

});

module.exports = router;
