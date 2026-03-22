var SUCCESS_STATUS_CODE = 200;

if (Meteor.isServer) {
  JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseBearerToken);

  JsonRoutes.add('get', 'parse-bearer-token', function (req, res) {
    JsonRoutes.sendResult(res, {data: req.authToken});
  });

  JsonRoutes.add('post', 'parse-bearer-token', function (req, res) {
    JsonRoutes.sendResult(res, {data: req.authToken});
  });
} else { // Meteor.isClient
  var token = 'testToken';

  Tinytest.addAsync('Middleware - Bearer Token Parser - parse valid headers', async function (test) {
    var response = await fetch(Meteor.absoluteUrl('/parse-bearer-token'), {
      headers: {authorization: 'Bearer ' + token},
    });
    var data = await response.json();
    test.equal(response.status, SUCCESS_STATUS_CODE);
    test.equal(data, token);
  });

  Tinytest.addAsync('Middleware - Bearer Token Parser - parse valid query param', async function (test) {
    var response = await fetch(Meteor.absoluteUrl('/parse-bearer-token?access_token=' + token));
    var data = await response.json();
    test.equal(response.status, SUCCESS_STATUS_CODE);
    test.equal(data, token);
  });
}
