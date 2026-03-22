JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseBearerToken);
JsonRoutes.Middleware.use(JsonRoutes.Middleware.authenticateMeteorUserByToken);

// Handle errors specifically for the login routes correctly
JsonRoutes.ErrorMiddleware.use('/users/login', RestMiddleware.handleErrorAsJson);
JsonRoutes.ErrorMiddleware.use('/users/register', RestMiddleware.handleErrorAsJson);

JsonRoutes.add('options', '/users/login', function (req, res) {
  JsonRoutes.sendResult(res);
});

JsonRoutes.add('post', '/users/login', async function (req, res) {
  var options = req.body;

  const NonEmptyString = Match.Where(x => {
    check(x, String);
    return x.length > 0;
  });

  var user;
  if (options.email) {
    check(options, {
      email: String,
      password: String,
      code: Match.Optional(NonEmptyString),
    });
    user = await Meteor.users.findOneAsync({ 'emails.address': options.email });
  } else {
    check(options, {
      username: String,
      password: String,
      code: Match.Optional(NonEmptyString),
    });
    user = await Meteor.users.findOneAsync({ username: options.username });
  }

  if (!user) {
    throw new Meteor.Error('not-found',
      'User with that username or email address not found.');
  }

  var result = await Accounts._checkPasswordAsync(user, options.password);
  check(result, {
    userId: String,
    error: Match.Optional(Meteor.Error),
  });

  if (result.error) {
    throw result.error;
  }

  if (Accounts._check2faEnabled?.(user)) {
    if (!options.code) {
      Accounts._handleError('2FA code must be informed', true, 'no-2fa-code');
    }
    if (
      !Accounts._isTokenValid(
        user.services.twoFactorAuthentication.secret,
        options.code
      )
    ) {
      Accounts._handleError('Invalid 2FA code', true, 'invalid-2fa-code');
    }
  }

  var stampedLoginToken = Accounts._generateStampedLoginToken();
  check(stampedLoginToken, {
    token: String,
    when: Date,
  });

  await Accounts._insertLoginToken(result.userId, stampedLoginToken);

  var tokenExpiration = Accounts._tokenExpiration(stampedLoginToken.when);
  check(tokenExpiration, Date);

  JsonRoutes.sendResult(res, {
    data: {
      id: result.userId,
      token: stampedLoginToken.token,
      tokenExpires: tokenExpiration,
    },
  });

});

JsonRoutes.add('options', '/users/register', function (req, res) {
  JsonRoutes.sendResult(res);
});

JsonRoutes.add('post', '/users/register', async function (req, res) {
  if(Accounts._options.forbidClientAccountCreation) {
    JsonRoutes.sendResult(res, {code: 403});
  } else {
    var options = req.body;

    check(options, {
      username: Match.Optional(String),
      email: Match.Optional(String),
      password: String,
    });

    var userOptions = {password: options.password};
    if (options.username) userOptions.username = options.username;
    if (options.email) userOptions.email = options.email;

    var userId = await Accounts.createUserAsync(userOptions);

    // Log in the new user and send back a token
    var stampedLoginToken = Accounts._generateStampedLoginToken();
    check(stampedLoginToken, {
      token: String,
      when: Date,
    });

    // This adds the token to the user
    await Accounts._insertLoginToken(userId, stampedLoginToken);

    var tokenExpiration = Accounts._tokenExpiration(stampedLoginToken.when);
    check(tokenExpiration, Date);

    // Return the same things the login method returns
    JsonRoutes.sendResult(res, {
      data: {
        token: stampedLoginToken.token,
        tokenExpires: tokenExpiration,
        id: userId,
      },
    });
  }
});
