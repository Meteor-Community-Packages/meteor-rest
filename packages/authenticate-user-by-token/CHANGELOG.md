# Changelog

## v2.0.0

### Breaking Changes

- Requires Meteor 3.0+
- Removed Fibers dependency entirely

### Changes

- Made middleware async with proper Express 4 error handling (`try`/`catch` + `next(error)`)
- Replaced `Meteor.users.findOne()` with `Meteor.users.findOneAsync()`
- Renamed package from `simple:authenticate-user-by-token` to `communitypackages:authenticate-user-by-token`

## v1.2.1

- Previous release
