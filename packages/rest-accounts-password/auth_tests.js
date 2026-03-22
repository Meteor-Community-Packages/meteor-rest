if (Meteor.isServer) {
  JsonRoutes.add('get', 'accounts-auth-user', function (req, res) {
    JsonRoutes.sendResult(res, {data: req.userId});
  });
} else { // Meteor.isClient
  Tinytest.addAsync('Middleware - Authenticate User By Token - set req.userId', async function (test) {
    await Meteor.callAsync('clearUsers');

    // Register a user
    var response = await fetch('/users/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'test',
        email: 'test@test.com',
        password: 'test',
      }),
    });
    test.isTrue(response.ok);
    var data = await response.json();
    test.isTrue(Match.test(data, {
      id: String,
      token: String,
      tokenExpires: String,
    }));

    var token = data.token;
    var userId = data.id;

    // Verify the token authenticates correctly
    response = await fetch('/accounts-auth-user', {
      headers: {Authorization: 'Bearer ' + token},
    });
    test.isTrue(response.ok);
    data = await response.json();
    test.equal(data, userId);
  });
}
