const { Cc, Ci, Cu, CC } = require("chrome");
const BookmarksAdapter = require('bookmarks-adapter');
const PasswordsAdapter = require('passwords-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const { defer, resolve, promised } = require('sdk/core/promise');
const SyncMediator = require('sync-mediator');
const KeyServerClient = require("key-server-client");
const _ = require('underscore');
const L = require('logger');
const TEST_BOOKMARK_DATA = require('data').TEST_BOOKMARK_DATA;

Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

function generateTestEmail() {
  return "test+"+Math.floor((1+Math.random())*1000000)+"@test.com";
};

var client = new KeyServerClient();

function setupSyncMediator(email) {
  var deferred = defer();
  email = email || generateTestEmail();
  function createUser(cb) {
    //L.log("creating user");
    return client.createUser({
      email: email
    }).then(cb);
  }

  function getUser() {
    client.getUser({
      email: email
    }).then(function(result) {
      var user = { id: result.kA, token: result.kA };
      deferred.resolve(new SyncMediator(user));
    }, function(err) {
      //L.log('error getting user, trying to create', err);
      // If the user doesn't exist, create and try again
      if (err.message == 'UnknownUser') {
        createUser(function() {
          getUser();
        });
      } else deferred.reject(err);
    });
  }
  getUser();
  return deferred.promise;
}
exports['test pull'] = function(assert, done) {
  setupSyncMediator('test@mozilla.com').
  then(function (sm) {
    return sm.pull().
    then(function (results) {
      //L.log("DONE", results);
      assert.ok(true);
      done();
    });
  })

}

exports['test push and pull'] = function (assert, done) {
  BookmarksAdapter.clearLocalBookmarks();
  PasswordsAdapter.clearLocalPasswords();
  let items = TEST_BOOKMARK_DATA.map(function (item) { return BookmarksItem(item); });
  let syncMediator;
  BookmarksAdapter.updateLocalBookmarks(items).
  then(setupSyncMediator).
  then(function (sm) {
    syncMediator = sm;
    return syncMediator.push();
  }).
  then(function () {
    return syncMediator.pull();
  }).
  then(function () {
    assert.ok(true, "SyncMediator can push bookmarks to server");
    done();
  }).then(null, function(err) {
    assert.fail(err.message);
    done();
  });
  // then(BookmarksAdapter.readLocalBookmarks).
  // then(function (items) {
  //   verifyReadBookmarks(items, TEST_UPDATE_BOOKMARK_DATA);
  //   assert.ok(true, "TODO");
  //   done();
  // });
}

require("sdk/test").run(exports);