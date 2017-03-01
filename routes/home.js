var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

var utils = require('./../scripts/utils');

/* GET user profile. */
router.get('/', ensureLoggedIn, function (req, res, next) {

  // TODO - these flows work on basis Social email is avaialble and can match DB username / email
  // TODO - Some migrations for example may require searching for a field by Social ID (in legacy DataStore potentially) in addition to email search options
  var hasPasswordLogin = utils.isUserPasswordProfile(req.user, process.env.AUTH0_DB_CONNECTION);

  req.session.user = req.user;

  utils.getAuth0ManagementAPIToken()
    .then(function (token) {
      console.log(token);
      req.session.token = token;
      utils.hasUserPasswordProfile(req.session.user, process.env.AUTH0_DOMAIN, token, process.env.AUTH0_DB_CONNECTION)
        .then(function (hasUserPasswordProfile) {
          var user = req.session.user;
          req.session.hasUserPasswordProfile = hasUserPasswordProfile;
          console.log(user);
          var email = (user.emails && user.emails.length) ? user.emails[0].value : '';
          console.log(email);

          var options = {
            user: req.user,
            email: email,
            passwordConnection: process.env.AUTH0_DB_CONNECTION,
            passwordLogin: !hasPasswordLogin && hasUserPasswordProfile
          };

          res.render('home', options);

        }, function (err) {
          console.error(err);
          res.render('error', {
            message: err.message,
            error: err
          });

        })
    }, function (err) {
      console.error(err);
      res.render('error', {
        message: err.message,
        error: err
      });
    });


});

module.exports = router;
