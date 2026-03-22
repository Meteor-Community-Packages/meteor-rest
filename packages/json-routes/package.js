Package.describe({
  name: 'communitypackages:json-routes',
  version: '3.1.0',

  // Brief, one-line summary of the package.
  summary: 'The simplest way to define server-side routes that return JSON',

  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor-compat/meteor-rest',

  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Npm.depends({
  express: '4.18.2',
  'body-parser': '1.20.2',
  'connect-query': '1.0.0',
});

Package.onUse(function (api) {
  api.versionsFrom('3.0');

  api.use([
    'webapp',
  ], 'server');

  api.addFiles([
    'json-routes.js',
    'middleware.js',
  ], 'server');

  api.export([
    'JsonRoutes',
    'RestMiddleware',
  ], 'server');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('test-helpers');
  api.use('communitypackages:json-routes');
  api.use('fetch');
  api.addFiles('json-routes-tests.js');
});
