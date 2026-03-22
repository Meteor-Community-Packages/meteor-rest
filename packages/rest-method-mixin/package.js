Package.describe({
  name: 'communitypackages:rest-method-mixin',
  version: '1.1.1',
  // Brief, one-line summary of the package.
  summary: 'Mixin for communitypackages:rest with ValidatedMethod',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/meteor-compat/meteor-rest',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('3.0');
  api.use('ecmascript');
  api.use('communitypackages:rest@2.0.0');
  api.addFiles('rest-method-mixin.js');
  api.export('RestMethodMixin');
});

Package.onTest(function(api) {
  api.use([
    'ecmascript',
    'tinytest',
    'communitypackages:rest-method-mixin',
    'mdg:validated-method@1.0.0',
    'test-helpers',
    'fetch'
  ]);
  api.addFiles('rest-method-mixin-tests.js');
});
