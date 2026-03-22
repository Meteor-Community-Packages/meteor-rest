var EventEmitter = Npm.require('events').EventEmitter;

// This file describes something like Subscription in
// meteor/meteor/packages/ddp/livedata_server.js, but instead of sending
// over a socket it puts together an HTTP response
HttpSubscription = function (options) {
  // Object where the keys are collection names, and then the keys are _ids
  this.responseData = {};

  this.connection = new HttpConnection(options.request);
  this.userId = options.userId;
};

// So that we can listen to ready event in a reasonable way
Meteor._inherits(HttpSubscription, EventEmitter);

Object.assign(HttpSubscription.prototype, {
  added: function (collection, id, fields) {
    var self = this;

    check(collection, String);
    if (id instanceof Mongo.Collection.ObjectID) id = id + '';
    check(id, String);

    self._ensureCollectionInRes(collection);

    // Make sure to ignore the _id in fields
    var {_id, ...rest} = fields;
    var addedDocument = Object.assign({_id: id}, rest);
    self.responseData[collection][id] = addedDocument;
  },

  changed: function (collection, id, fields) {
    var self = this;

    check(collection, String);
    if (id instanceof Mongo.Collection.ObjectID) id = id + '';
    check(id, String);

    self._ensureCollectionInRes(collection);

    var existingDocument = this.responseData[collection][id];
    var {_id, ...fieldsNoId} = fields;
    Object.assign(existingDocument, fieldsNoId);

    // Delete all keys that were undefined in fields (except _id)
    Object.entries(fields).forEach(function ([key, value]) {
      if (value === undefined) {
        delete existingDocument[key];
      }
    });
  },

  removed: function (collection, id) {
    var self = this;

    check(collection, String);
    if (id instanceof Mongo.Collection.ObjectID) id = id + '';
    check(id, String);

    self._ensureCollectionInRes(collection);

    delete self.responseData[collection][id];

    if (Object.keys(self.responseData[collection]).length === 0) {
      delete self.responseData[collection];
    }
  },

  ready: function () {
    this.emit('ready', this._generateResponse());
  },

  onStop: function () {
    // no-op in HTTP
  },

  error: function (error) {
    throw error;
  },

  _ensureCollectionInRes: function (collection) {
    this.responseData[collection] = this.responseData[collection] || {};
  },

  _generateResponse: function () {
    var output = {};

    Object.entries(this.responseData).forEach(function ([collectionName, documents]) {
      output[collectionName] = Object.values(documents);
    });

    return output;
  },
});
