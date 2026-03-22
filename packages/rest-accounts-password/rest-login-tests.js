if (Meteor.isServer) {
  Meteor.methods({
    clearUsers: async function () {
      if (await Meteor.users.find().countAsync() > 100) {
        throw new Error('a lot of users. are you running this in prod??');
      }

      await Meteor.users.removeAsync({});
    },

    getUser: async function (username) {
      return await Meteor.users.findOneAsync({username: username});
    },
  });
} else {
  var loginEndpoint = '/users/login';
  var registerEndpoint = '/users/register';

  Tinytest.addAsync('REST Accounts Password - register and login over HTTP', async function (test) {
    await Meteor.callAsync('clearUsers');

    // Test invalid registration input
    var response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({}),
    });
    var data = await response.json();
    test.equal(data.reason, 'Match failed');

    // Register a new user
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'newuser',
        password: 'test',
        email: 'newuser@example.com',
      }),
    });
    test.isTrue(response.ok);
    data = await response.json();
    var userId = data.id;

    // Make sure results have the right shape
    check(data, {
      token: String,
      tokenExpires: String,
      id: String,
    });

    // Login with password via DDP
    await new Promise((resolve, reject) => {
      Meteor.loginWithPassword('newuser', 'test', function (err) {
        try {
          test.equal(err, undefined);
          test.equal(Meteor.userId(), userId);
          resolve();
        } catch (e) { reject(e); }
      });
    });

    // Login via REST
    response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'newuser',
        password: 'test',
      }),
    });
    test.isTrue(response.ok);
    data = await response.json();
    test.equal(data.id, userId);

    // Register second user (bug fix #21 - two accounts with empty emails)
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'seconduser',
        password: 'test',
      }),
    });
    test.isTrue(response.ok);

    // Login with form-urlencoded (bug fix #2)
    response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: 'username=seconduser&password=test',
    });
    test.isTrue(response.ok);

    // Register third user and verify correct login
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'thirduser',
        password: 'test',
      }),
    });
    test.isTrue(response.ok);
    data = await response.json();
    userId = data.id;

    response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'thirduser',
        password: 'test',
      }),
    });
    test.isTrue(response.ok);
    data = await response.json();
    test.equal(data.id, userId);

    // Test registering with existing username
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'newuser',
        password: 'test',
        email: 'newuser2@example.com',
      }),
    });
    test.isFalse(response.ok);
    data = await response.json();
    test.isTrue(data.reason.length > 0);

    // Test registering with existing email
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'newuser2',
        password: 'test',
        email: 'newuser@example.com',
      }),
    });
    test.isFalse(response.ok);
    data = await response.json();
    test.isTrue(data.reason.length > 0);

    // Register with no username (allowed by accounts-password)
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        password: 'test',
        email: 'newusernopassword@example.com',
      }),
    });
    test.isTrue(response.ok);
    data = await response.json();
    check(data, {
      token: String,
      tokenExpires: String,
      id: String,
    });

    // Register with no email (allowed by accounts-password)
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'newusernoemail',
        password: 'test',
      }),
    });
    test.isTrue(response.ok);
    data = await response.json();
    check(data, {
      token: String,
      tokenExpires: String,
      id: String,
    });

    // Make sure we need an email or a username
    response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        password: 'test',
      }),
    });
    data = await response.json();
    test.equal(data.reason, 'Need to set a username or email');
  });
}
