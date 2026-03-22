# Changelog

## v2.0.0

### Breaking Changes

- Requires Meteor 3.0+

### Changes

- Dropped `underscore` dependency across all files (`rest.js`, `http-subscription.js`, `list-api.js`); replaced with ES6 equivalents (`Object.assign`, `forEach`, `Object.entries`, `Array.isArray`, `Number.isNaN`, `Array.includes`, `Object.keys`, `Object.values`, etc.)
- Made all route handlers async
- `await handler.apply()` for publish and method handlers (may be async in Meteor 3)
- `cursor.fetch()` replaced with `await cursor.fetchAsync()` in `httpPublishCursor`
- Converted `_.each` loops over cursors to `for` loops for proper async/await
- Migrated tests: server-side methods use async collection APIs, client-side tests use `fetch`/`Tinytest.addAsync`
- Renamed package from `simple:rest` to `communitypackages:rest`

## v1.2.1

- Previous release
