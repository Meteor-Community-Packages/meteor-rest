if (Meteor.isServer) {
  JsonRoutes.ErrorMiddleware.use(
    '/handle-error',
    RestMiddleware.handleErrorAsJson
  );

  JsonRoutes.add('get', 'handle-error', function () {
    var error = new Meteor.Error('not-found', 'Not Found');
    error.statusCode = 404;
    throw error;
  });
} else { // Meteor.isClient
  Tinytest.addAsync('Middleware - JSON Error Handling - ' +
    'handle standard Connect error with JSON response', async function (test) {
    var response = await fetch(Meteor.absoluteUrl('/handle-error'));
    var data = await response.json();
    test.equal(response.status, 404);
    test.equal(data.error, 'not-found');
    test.equal(data.reason, 'Not Found');
  });
}
