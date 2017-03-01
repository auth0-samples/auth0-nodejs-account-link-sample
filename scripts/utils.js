'use strict';

var request = require("request");
var Q = require("q");

var getAuth0ManagementAPIToken = function () {

  var deferred = Q.defer();

  var body = {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    grant_type: "client_credentials"
  };

  var uri = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;

  var options = {
    method: 'POST',
    url: uri,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  request(options, function (err, response, body) {
    if (err) {
      return deferred.reject(new Error(err));
    }
    var token = JSON.parse(body).access_token;
    return deferred.resolve(token);
  });

  return deferred.promise;

};

var getUserPasswordProfile = function (user, domain, managementToken, connection) {

  var deferred = Q.defer();

  var email = user.emails[0].value;
  var path = `/api/v2/users\?q\=${encodeURIComponent('email:')}"${email}"${encodeURIComponent(' AND ')}${encodeURIComponent('identities.connection:')}"${connection}"&search_engine=v2`;

  var uri = `https://${domain}${path}`;
  console.log(uri);

  var options = {
    method: 'GET',
    url: uri,
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer ' + managementToken,
      'cache-control': 'no-cache'
    }
  };

  request(options, function (err, response, body) {
    if (err) {
      return deferred.reject(new Error(err));
    }

    if (!response.statusCode === 200) {
      return deferred.reject(new Error('Unexpected response code from server: ' + response.statusCode));
    }

    var results = JSON.parse(body);
    return deferred.resolve(!!results.length);
  });

  return deferred.promise;
  kk

};


var hasUserPasswordProfile = function (user, domain, managementToken, connection) {

  if (isUserPasswordProfile(user, connection)) {
    return Q.fcall(function () {
      return true;
    });
  } else if (!user.emails || !user.emails.length) {
    return Q.fcall(function () {
      return false;
    });
  } else {
    return getUserPasswordProfile(user, domain, managementToken, connection);
  }

};

var isUserPasswordProfile = function (user) {
  var expectedConnection = process.env.AUTH0_DB_CONNECTION;
  var primaryIdentity = user.identities[0];
  var connection = primaryIdentity.connection;
  return expectedConnection === connection;
};


var linkAccount = function (user, tokens, existingTokens) {

  var deferred = Q.defer();

  var primaryAccountUserId = user.id;
  var primaryAccountJwt = tokens.idToken;
  var secondaryAccountJwt = existingTokens.idToken;

  // do account linking
  var encodedPrimaryAccountUserId = encodeURIComponent(primaryAccountUserId);
  var path = `/api/v2/users/${encodedPrimaryAccountUserId}/identities`;
  var linkUri = `https://${process.env.AUTH0_DOMAIN}${path}`;

  var options = {
    method: 'POST',
    url: linkUri,
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer ' + primaryAccountJwt,
      'cache-control': 'no-cache'
    },
    body: JSON.stringify({link_with: secondaryAccountJwt})
  };

  request(options, function (err, response, body) {
    if (err) {
      return deferred.reject(new Error(err));
    }

    if (!response.statusCode === 201) {
      return deferred.reject(new Error('Unexpected response code from server: ' + response.statusCode));
    }

    var profileArray = JSON.parse(body);
    var firstProfileEntry = profileArray[0];
    var primaryConnection = firstProfileEntry.connection;
    var expectedPrimaryConnection = process.env.AUTH0_DB_CONNECTION;
    if (!expectedPrimaryConnection === primaryConnection) {
      return deferred.reject(new Error('Error linking accounts - wrong primary connection detected: ' + primaryConnection));

    }
    // Just fetch updated (linked) profile using previously obtained tokens for profile
    var options = {
      method: 'GET',
      url: `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + tokens.accessToken,
        'cache-control': 'no-cache'
      }
    };
    request(options, function (err, response, body) {

      if (err) {
        return deferred.reject(new Error(err));
      }

      if (!response.statusCode === 200) {
        return deferred.reject(new Error('Unexpected response code from server: ' + response.statusCode));
      }
      var newUser = JSON.parse(body);
      return deferred.resolve(newUser);
    });

  });

  return deferred.promise;

};

var handleAccountLink = function (user, req, tokens) {
  console.log(user);
  console.log(tokens);
  if (isUserPasswordProfile(user) && !isLinkedAccount(user)) {
    var existingUser = req.session.user;
    var existingTokens = req.session.user.tokens;
    if (existingUser && !isUserPasswordProfile(existingUser)) {
      return linkAccount(user, tokens, existingTokens);
    }
  }
  // just return the existing user
  return user;
};

var isLinkedAccount = function (user) {
  return user.identities && user.identities.length > 1;
};

module.exports = {
  getAuth0ManagementAPIToken: getAuth0ManagementAPIToken,
  isUserPasswordProfile: isUserPasswordProfile,
  hasUserPasswordProfile: hasUserPasswordProfile,
  handleAccountLink: handleAccountLink,
  getUserPasswordProfile: getUserPasswordProfile
};


