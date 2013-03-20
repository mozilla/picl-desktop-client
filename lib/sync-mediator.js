const StorageServerClient = require('storage-server-client');
const PasswordsAdapter = require('passwords-adapter');
const BookmarksAdapter = require('bookmarks-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const PlacesAdapter = require('places-adapter');
const L = require('logger');
const { defer, resolve, promised } = require('sdk/core/promise');
const group = function (array) { return promised(Array).apply(null, array); };

const PASSWORDS_COLLECTION_NAME = "passwords";
const BOOKMARKS_COLLECTION_NAME = "bookmarks";

function SyncMediator(user) {
  if (user) {
    this.user = user;
    this.ssClient = new StorageServerClient({ userId: user.id, token: user.token });
  }
}

function pullBookmarks() {
  L.log("Pulling bookmarks from server");
  var items;
  return this.ssClient.readCollection({ collection: BOOKMARKS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull bookmarks success");
    items = result.items;
    let bookmarks = items.map(function (item) { return BookmarksItem(item); });
    //L.log("results", bookmarks);
    try {
      BookmarksAdapter.clearLocalBookmarks();
      return BookmarksAdapter.updateLocalBookmarks(bookmarks).
      then(function () {
        return items;
      });
    } catch(e) {
      L.log("Error updating local bookmarks", e.message);
      return null;
    }
  }).
  // Debugging code for printing out bookmarks after they've been added
  // then(function () {
  //   return BookmarksAdapter.readLocalBookmarks().
  //   then(function (bookmarks) {
  //     L.log("JSON", JSON.stringify(bookmarks));
  //   });
  // }).
  then(null, function (err) {
    if (err.code === 404) L.log("Collection not found", BOOKMARKS_COLLECTION_NAME);
    else L.log("Pull bookmarks error", err.message);
  });
}

function pullPasswords() {
  L.log("Pulling passwords from server");
  return this.ssClient.readCollection({ collection: PASSWORDS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull passwords success");
    //L.log(result);
    try {
      PasswordsAdapter.clearLocalPasswords();
      PasswordsAdapter.updateLocalPasswords(result.items);
      return result.items;
    } catch(e) {
      L.log("Error updating local passwords", e.message);
      return null;
    }
  }).
  then(null, function (err) {
    if (err.code === 404) L.log("Collection not found", PASSWORDS_COLLECTION_NAME);
    else L.log("Pull passwords error", err);
    return null;
  });
}

SyncMediator.prototype.pull = function() {
  return group([
    pullPasswords.call(this),
    pullBookmarks.call(this)
  ]).
  then(function (results) {
    L.log("Pull completed");
    return results;
  }).
  then(null, function (err) {
    L.log("Pull error", err.message);
  });
};

function pushBookmarks() {
  var self = this;
  return BookmarksAdapter.readLocalBookmarks().
  then(function (localBookmarks) {
    if (localBookmarks.length > 0) {
      L.log("Pushing local bookmarks");//, localBookmarks);
      //L.log("JSON", JSON.stringify(localBookmarks));
      return self.ssClient.updateCollection({ collection: BOOKMARKS_COLLECTION_NAME, items: localBookmarks }).
      then(function (result) {
        L.log("Push bookmarks success", result);
        return;
      });
    }
    else {
      L.log("Local bookmarks empty");
      return resolve(null);
    }
  }).
  then(null, function(err) {
    L.log("Push bookmarks error", err.message);
    throw err;
  });
}

function pushPasswords() {
  var localPasswords = PasswordsAdapter.readLocalPasswords();
  if (localPasswords.length > 0) {
    L.log("Pushing local passwords");//, localPasswords);
    return this.ssClient.updateCollection({ collection: PASSWORDS_COLLECTION_NAME, items: localPasswords }).
    then(function (result) {
      L.log("Push passwords success", result);
    }).
    then(null, function(err) {
      L.log("Push passwords error", err.message);
      throw err;
    });
  }
  else {
    return resolve(null);
    L.log("Local passwords empty");
  }
}

SyncMediator.prototype.push = function() {
  return group([
    pushPasswords.call(this),
    pushBookmarks.call(this)
  ]).
  then(function () {
    L.log("Push completed");
  }).
  then(null, function (err) {
    L.log("Push error", err.message);
  });
};

SyncMediator.prototype.clear = function() {
  PasswordsAdapter.clearLocalPasswords();
  BookmarksAdapter.clearLocalBookmarks();
}

module.exports = SyncMediator;