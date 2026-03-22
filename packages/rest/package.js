Package.describe({
  name: 'communitypackages:rest',
  version: '2.0.0',

  // Brief, one-line summary of the package.
  summary: 'The easiest way to add a REST API to your Meteor app',

  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor-compat/meteor-rest',

  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('3.0');

  api.use([
    'check',
    'ddp',
    'ejson',
    'meteor',
    'mongo',
    'webapp',
    'communitypackages:json-routes@3.0.0',
  ], 'server');

  api.use([
    'accounts-base',
  ], 'server', {weak: true});

  api.addFiles([
    'http-connection.js',
    'http-subscription.js',
    'rest.js',
    'list-api.js',
  ], 'server');

  api.export('SimpleRest');
});

Package.onTest(function (api) {
  api.use([
    'check',
    'fetch',
    'jquery',
    'mongo',
    'random',
    'communitypackages:json-routes',
    'communitypackages:rest',
    'communitypackages:rest-accounts-password',
    'communitypackages:rest-json-error-handler',
    'test-helpers',
    'tinytest',
  ]);

  api.addFiles('rest-tests.js');
});
