### What is this sample? 

Demonstrates using Auth0 to perform account linking between Auth0 Connection and Social Connection using a
regular web application written in Node.js.

* Start with choice of login between Social Connection or Database Connection.
* If you login using Social Connection and have not already linked you DB Connection then you are requested to do so.

### Background and Important Information

The idea behind this flow is that you have an application defined with two connection types. A social connection and
a database connection. We want to allow users that login in with their social connection to have the option to enter
their database connection password whilst logged in, and this will `link` their social connection with their `existing`
database connection. The database connection becomes the primary user profile, and the social connection then becomes a
secondary user profile. In the Auth0 dashboard you will notice after linking accounts, there is only a single user profile
remaining, and it contains user profile information for both connection types.

The database connection MUST have a user registered with an exact matching email address to the social connection
user you are using to test the account linking. THIS IS IMPORTANT. The application will automatically detect whether
a matching database connection profile exists. The idea behind this is that it is possible to correlate a social account with an
 existing database account (profile) by virtue of the fact each shares the same `email address` - AND the logged in social connection
 user has knowledge of the existing database user's password of course!

The application is configurable - you can choose the single social connection type you wish to use (google-oauth2, facebook, twitter etc), and the single Database connection. See details later in this readme on variables configuration.

For the purposes of this readme, we are using `google-oauth2` social connection and a database connection called `DBConn1`. Note, you could easily have an existing custom Database and use that as the database connection. Furthermore, you could have this setup to migrate your users from the custom database to `Auth0` as users login with their database connection. Note, logging in with a password when already logged in with a social connection will have the same effect as a plain database login from the login page. In either instance, users could be migrated too (if you wish to use that configuration option using a custom database connection).

You should be able to get everything set up and running in under 10 minutes. Let's get started!


### Prerequisites

In order to run this example you will need to have `Node.js` installed 

### Setup

Create an [Auth0 Account](https://auth0.com) (if not already done so - free!).


#### From the Auth0 Dashboard

Create a Client.

Client Type should be `Regular Web Application`.

Ensure you add the following to the settings.

Allowed Callback URLs:

```
http://localhost:3000/callback
http://localhost:3000/plcallback
```

Allowed Logout URLs:

```
http://localhost:3000/login,
http://localhost:3000/logout
```

Now, please ensure you set up both a

```
Connection (Connections -> Database -> Create DB Connection)
Google Social Connection (Connections -> Social -> Google)
```

Both of these connection types NEED to be associated with the Client you have created.


Finally, under APIs (enable if not already done so), go to `Auth0 Management API` -> `Non Interactive Clients`

Make sure your Client is `Authorized`.

Next, make sure your application is authorized and contains the following scopes:

* `read:users`
* `update:users`
* `read:users_app_metadata`
* `update:users_app_metadata`
* `read:user_idp_tokens`


That's it for the Dashboard setup!


## How to use it?  

Clone / download this sample project.

Install the dependencies 

```bash
$ npm install 
```

Create a `.env` file in the base of the project (you can simply copy the `.env.sample` that comes with this sample).

* AUTH0_DOMAIN:  Your tenant domain
* AUTH0_CLIENT_ID: Your client id
* AUTH0_CLIENT_SECRET= Your client secret
* AUTH0_DB_CONNECTION= The name of your Auth0DB or Custom DB Name
* AUTH0_LOGIN_CALLBACK_URL= Callback URL - eg. http://localhost:3000/callback
* AUTH0_PASSWORD_CALLBACK_URL=Password Callback URL - eg. http://localhost:3000/plcallback

Example, populated `.env` file:


```
AUTH0_DOMAIN=tenant.auth0.com
AUTH0_CLIENT_ID=AOlRPGxxxxxxjmdvvqUkjZJvEavLhF
AUTH0_CLIENT_SECRET=gknqGPaxxxxxxxxxxx5n3hY9Vo7IiF8ujvJ6UJ56cGZnJMGu
AUTH0_DB_CONNECTION=MY-DB
AUTH0_LOGIN_CALLBACK_URL=http://localhost:3000/callback
AUTH0_PASSWORD_CALLBACK_URL=http://localhost:3000/plcallback
```

Run the app.

```
npm start
```

Or, alternatively you can just use:

````
node ./bin/www
````

The app will be served at `localhost:3000`.


## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
