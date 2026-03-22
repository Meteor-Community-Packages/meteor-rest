# Changelog

## v2.0.0

### Breaking Changes

- Requires Meteor 3.0+

### Changes

- Dropped `underscore` dependency
- Made route handlers async
- Replaced sync Meteor/Accounts APIs with async versions:
  - `Meteor.users.findOne()` -> `Meteor.users.findOneAsync()`
  - `Accounts._checkPassword()` -> `Accounts._checkPasswordAsync()`
  - `Accounts._insertLoginToken()` is now natively async in Meteor 3
  - `Accounts.createUserAsync()` for user registration
- Migrated tests from `http`/`testAsyncMulti` to `fetch`/`Tinytest.addAsync`
- Updated test expectations for Meteor 3's generic duplicate-user error messages
- Renamed package from `simple:rest-accounts-password` to `communitypackages:rest-accounts-password`

## v1.2.2

- Previous release
