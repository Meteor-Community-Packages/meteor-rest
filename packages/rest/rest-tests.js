if (Meteor.isServer) {
  JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseBearerToken);
  JsonRoutes.Middleware.use(
    JsonRoutes.Middleware.authenticateMeteorUserByToken
  );
  JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson);

  var Widgets = new Mongo.Collection('widgets');

  Meteor.publish('widgets', function () {
    return Widgets.find();
  });

  var Doodles = new Mongo.Collection('doodles');

  Meteor.methods({
    'reset-db': async function () {
      await Widgets.removeAsync({});

      for (var index = 0; index < 10; index++) {
        await Widgets.insertAsync({
          index: index,
        });
      }

      await Doodles.removeAsync({});

      for (var index = 0; index < 10; index++) {
        await Doodles.insertAsync({
          index: index,
        });
      }

      await Doodles.insertAsync({
        _id: '123',
        index: 11,
      });
    },
  });

  Meteor.publish('doodles-and-widgets', function () {
    return [
      Widgets.find(),
      Doodles.find(),
    ];
  });

  Meteor.publish('widgets-manual', async function () {
    var self = this;

    await Widgets.find().forEachAsync(function (widget) {
      self.added('widgets', widget._id, widget);
    });

    self.ready();
  });

  Meteor.publish('widgets-custom-url', function () {
    return Widgets.find();
  }, {

    url: 'i-love-widgets',
    httpMethod: 'post',
  });

  Meteor.publish('widgets-above-index', function (index) {
    return Widgets.find({index: {$gt: parseInt(index, 10)}});
  }, {

    url: 'widgets-with-index-above/:0',
  });

  Meteor.publish('widgets-above-index-custom-args', function (index) {
    return Widgets.find({index: {$gt: parseInt(index, 10)}});
  }, {

    getArgsFromRequest: function (request) {
      return [parseInt(request.query.index, 10)];
    },
  });

  Meteor.publish('widgets-authorized', function () {
    if (this.userId) {
      return Widgets.find();
    } else {
      this.ready();
    }
  });

  Meteor.methods({
    'return-five': function () {
      return 5;
    },
  });

  SimpleRest.setMethodOptions('return-five-url', {
    url: '/my-custom-url'
  });

  Meteor.methods({
    'return-five-url': function () {
      return 5;
    },
  });

  Tinytest.add('Simple REST - setMethodOptions errors', function (test) {
    // Setting options then passing them again should fail
    SimpleRest.setMethodOptions('should-error', {
      url: '/my-custom-url'
    });

    test.throws(function () {
      Meteor.method('should-error', function () {
        return null;
      }, { url: '/should-error' });
    }, /already passed/);

    // Setting method options when the method is already defined should fail
    Meteor.methods({
      'already-defined': function () {
        return null;
      }
    });

    test.throws(function () {
      SimpleRest.setMethodOptions('already-defined', {
        url: '/my-custom-url'
      });
    }, /options before/);
  });

  Meteor.method('return-five-auth', function () {
    if (this.userId) {
      return 5;
    } else {
      return 0;
    }
  });

  Meteor.method('status-code', function () {
    this.setHttpStatusCode(222);
  });

  Meteor.method('throws-error', function () {
    throw new Error('Bad');
  });

  Meteor.method('throws-meteor-error', function () {
    throw new Meteor.Error('foo-bar', 'Foo');
  });

  Meteor.method('throws-sanitized-error', function () {
    var error = new Error('Bad');
    error.sanitizedError = new Meteor.Error('foo-bar', 'Foo');
    throw error;
  });

  Meteor.method('throws-error-custom', function () {
    var error = new Error('Bad');
    error.data = {ding: 'dong'};
    error.statusCode = 499;
    throw error;
  });

  Meteor.method('throws-meteor-error-custom', function () {
    var error = new Meteor.Error('foo-bar', 'Foo');
    error.data = {ding: 'dong'};
    error.statusCode = 499;
    throw error;
  });

  Meteor.method('throws-sanitized-error-custom', function () {
    var error = new Error('Bad');
    error.data = {ding: 'ding'};
    error.statusCode = 999;
    error.sanitizedError = new Meteor.Error('foo-bar', 'Foo');
    error.sanitizedError.data = {ding: 'dong'};
    error.sanitizedError.statusCode = 499;
    throw error;
  });

  Meteor.method('add-all-arguments', function (a, b, c) {
    return a + b + c;
  });

  Meteor.method('add-arguments-from-url', function (a, b) {
    return a + b;
  }, {

    url: '/add-arguments-from-url/:a/:b',
    getArgsFromRequest: function (request) {
      var a = request.params.a;
      var b = request.params.b;

      return [parseInt(a, 10), parseInt(b, 10)];
    },

    httpMethod: 'get',
  });

  Tinytest.add('Simple REST - ' +
               'routes exist for mutator methods', function (test) {
    var mutatorMethodPaths = [
      '/widgets',
      '/widgets/:_id',
      '/doodles',
      '/doodles/:_id',
    ];

    mutatorMethodPaths.forEach(function (path) {
      test.isTrue(!!JsonRoutes.routes.find(function (r) { return r.path === path; }));
    });
  });

  Widgets.allow({
    insert: function () {
      return true;
    },

    update: function () {
      return true;
    },

    remove: function () {
      return true;
    },
  });

  Doodles.allow({
    insert: function () {
      return false;
    },

    update: function () {
      return false;
    },

    remove: function () {
      return false;
    },
  });
} else {
  // Using fetch API

  async function postJson(url, data) {
    return await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  Tinytest.addAsync('Simple REST - getting a publication', async function (test) {
    await postJson('/methods/reset-db');

    var response = await fetch('/publications/widgets');
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(Object.keys(data.widgets).length, 10);

    response = await fetch('/publications/widgets-manual');
    data = await response.json();
    test.equal(response.status, 200);
    test.equal(Object.keys(data.widgets).length, 10);
  });

  Tinytest.addAsync('Simple REST - getting a publication with multiple cursors', async function (test) {
    var response = await fetch('/publications/doodles-and-widgets');
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(Object.keys(data.widgets).length, 10);
    test.equal(Object.keys(data.doodles).length, 11);
  });

  Tinytest.addAsync('Simple REST - getting a publication with custom URL', async function (test) {
    var response = await postJson('/i-love-widgets');
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(Object.keys(data.widgets).length, 10);
  });

  Tinytest.addAsync('Simple REST - getting a publication with URL arguments', async function (test) {
    var response = await fetch('/widgets-with-index-above/4');
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(Object.keys(data.widgets).length, 5);
  });

  Tinytest.addAsync('Simple REST - getting a publication with query arguments', async function (test) {
    var response = await fetch('/publications/widgets-above-index-custom-args?index=4');
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(Object.keys(data.widgets).length, 5);
  });

  Tinytest.addAsync('Simple REST - getting a publication with authorization', async function (test) {
    await Meteor.callAsync('clearUsers');

    var response = await postJson('/users/register', {
      username: 'test',
      email: 'test@test.com',
      password: 'test',
    });
    var regData = await response.json();
    test.isTrue(response.ok);
    test.isTrue(Match.test(regData, {
      id: String,
      token: String,
      tokenExpires: String,
    }));

    var token = regData.token;

    response = await fetch('/publications/widgets-authorized', {
      headers: { Authorization: 'Bearer ' + token },
    });
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(Object.keys(data.widgets).length, 10);
  });

  Tinytest.addAsync('Simple REST - calling method', async function (test) {
    var response = await postJson('/methods/return-five');
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(data, 5);
  });

  Tinytest.addAsync('Simple REST - setMethodOptions', async function (test) {
    var response = await postJson('/my-custom-url');
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(data, 5);
  });

  Tinytest.addAsync('Simple REST - calling method with auth', async function (test) {
    // Re-register for a fresh token
    await Meteor.callAsync('clearUsers');
    var regResponse = await postJson('/users/register', {
      username: 'test',
      email: 'test@test.com',
      password: 'test',
    });
    var regData = await regResponse.json();
    var token = regData.token;

    var response = await fetch('/methods/return-five-auth', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(data, 5);
  });

  Tinytest.addAsync('Simple REST - calling method with wrong auth', async function (test) {
    var response = await fetch('/methods/return-five-auth', {
      method: 'POST',
      headers: { Authorization: 'Bearer foo' },
    });
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(data, 0);
  });

  Tinytest.addAsync('Simple REST - method error', async function (test) {
    var response = await postJson('/methods/throws-error');
    var data = await response.json();
    test.isTrue(!response.ok);
    test.equal(data.error, 'internal-server-error');
    test.equal(response.status, 500);
  });

  Tinytest.addAsync('Simple REST - method meteor error', async function (test) {
    var response = await postJson('/methods/throws-meteor-error');
    var data = await response.json();
    test.isTrue(!response.ok);
    test.equal(data.reason, 'Foo');
    test.equal(response.status, 400);
  });

  Tinytest.addAsync('Simple REST - method error with meteor error', async function (test) {
    var response = await postJson('/methods/throws-sanitized-error');
    var data = await response.json();
    test.isTrue(!response.ok);
    test.equal(data.reason, 'Foo');
    test.equal(response.status, 400);
  });

  Tinytest.addAsync('Simple REST - method error custom', async function (test) {
    var response = await postJson('/methods/throws-error-custom');
    var data = await response.json();
    test.isTrue(!response.ok);
    test.equal(data.error, 'internal-server-error');
    test.equal(response.status, 499);
  });

  Tinytest.addAsync('Simple REST - method meteor error custom', async function (test) {
    var response = await postJson('/methods/throws-meteor-error-custom');
    var data = await response.json();
    test.isTrue(!response.ok);
    test.equal(data.data.ding, 'dong');
    test.equal(response.status, 499);
  });

  Tinytest.addAsync('Simple REST - method error with meteor error custom', async function (test) {
    var response = await postJson('/methods/throws-sanitized-error-custom');
    var data = await response.json();
    test.isTrue(!response.ok);
    test.equal(data.data.ding, 'dong');
    test.equal(response.status, 499);
  });

  Tinytest.addAsync('Simple REST - method status code', async function (test) {
    var response = await postJson('/methods/status-code');
    test.equal(response.status, 222);
  });

  Tinytest.addAsync('Simple REST - mutator methods', async function (test) {
    // Reset DB first
    await postJson('/methods/reset-db');

    // Insert a widget
    var response = await postJson('/widgets', [{index: 10}]);
    test.isTrue(response.ok);

    // Insert a doodle (should fail - not allowed)
    response = await postJson('/doodles', [{index: 10}]);
    var data = await response.json();
    test.equal(data.reason, 'Access denied');

    // Verify widget count
    response = await fetch('/publications/widgets');
    data = await response.json();
    test.equal(Object.keys(data.widgets).length, 11);
    var widgets = data.widgets;

    // Patch a widget
    var _id = Object.values(widgets)[0]._id;
    response = await fetch('/widgets/' + _id, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({specialKey: 'Over 9000!'}),
    });
    data = await response.json();
    test.isTrue(response.ok);
    test.equal(data, 1);

    // Patch a doodle (should fail)
    response = await fetch('/doodles/123', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({specialKey: 'Over 9000!'}),
    });
    data = await response.json();
    test.equal(data.reason, 'Access denied');

    // Verify the special key was saved
    response = await fetch('/publications/widgets');
    data = await response.json();
    test.isTrue(!!data.widgets.find(function (w) { return w.specialKey === 'Over 9000!'; }));

    // Delete a widget
    response = await fetch('/widgets/' + Object.values(widgets)[0]._id, {
      method: 'DELETE',
    });
    test.isTrue(response.ok);

    // Delete a doodle (should fail)
    response = await fetch('/doodles/123', {
      method: 'DELETE',
    });
    data = await response.json();
    test.equal(data.reason, 'Access denied');
  });

  // Tests with JQuery
  Tinytest.addAsync('Simple REST - calling method with JQuery', async function (test) {
    var data = await new Promise(function (resolve) {
      $.ajax({
        method: 'post',
        url: '/methods/add-all-arguments',
        data: JSON.stringify([1, 2, 3]),
        contentType: 'application/json',
        success: resolve,
      });
    });
    test.equal(data, 6);
  });

  Tinytest.addAsync('Simple REST - ' +
                 'calling method with JQuery with custom getArgsFromRequest', async function (test) {
    var data = await new Promise(function (resolve) {
      $.ajax({
        method: 'get',
        url: '/add-arguments-from-url/2/3',
        success: resolve,
      });
    });
    test.equal(data, 5);
  });

  Tinytest.addAsync('Simple REST - getting publication with JQuery', async function (test) {
    var data = await new Promise(function (resolve) {
      $.get('/publications/widgets', resolve);
    });
    test.equal(data.widgets.length, 10);
  });
}
