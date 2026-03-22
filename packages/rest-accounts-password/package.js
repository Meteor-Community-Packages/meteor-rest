Package.describe({
  name: 'communitypackages:rest-accounts-password',
  version: '2.0.0',

  // Brief, one-line summary of the package.
  summary: 'Get a login token to use with communitypackages:rest',

  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor-compat/meteor-rest',

  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('3.0');

  api.use([
    'accounts-password',
    'check',
    'communitypackages:json-routes@3.0.0',
    'communitypackages:authenticate-user-by-token@2.0.0',
    'communitypackages:rest-bearer-token-parser@1.1.0',
    'communitypackages:rest-json-error-handler@1.1.0',
  ], 'server');

  api.addFiles('rest-login.js', 'server');
});

Package.onTest(function (api) {
  api.use([
    'accounts-password',
    'check',
    'fetch',
    'communitypackages:rest-accounts-password',
    'communitypackages:authenticate-user-by-token',
    'communitypackages:json-routes',
    'test-helpers',
    'tinytest',
  ]);

  api.addFiles([
    'rest-login-tests.js',
    'auth_tests.js',
  ]);
});
