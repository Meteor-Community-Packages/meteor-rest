/* global JsonRoutes:false - from communitypackages:json-routes package */
/* global paths:true */
/* global pathInfo:true */

// publish all API methods
Meteor.publish('api-routes', function () {
  var self = this;

  // Deduplicate routes across paths
  paths = {};

  JsonRoutes.routes.forEach(function (route) {
    pathInfo = paths[route.path] || { methods: [], path: route.path };

    pathInfo.methods.push(route.method);

    paths[route.path] = pathInfo;
  });

  Object.entries(paths).forEach(function ([path, pathInfo]) {
    self.added('api-routes', path, pathInfo);
  });

  self.ready();
});
