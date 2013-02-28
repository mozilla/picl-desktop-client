const StorageServerClient = require('storage-server-client');
const PasswordsAdapter = require('passwords-adapter');
const BookmarksAdapter = require('bookmarks-adapter');
const L = require('logger');

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
  this.ssClient.readCollection({ collection: BOOKMARKS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull bookmarks success", result);
    try {
      BookmarksAdapter.clearLocalBookmarks();
      BookmarksAdapter.updateLocalBookmarks(result.items);
    } catch(e) {
      L.log("Error updating local bookmarks", e.message);
    }
  }).
  then(null, function (err) {
    if (err.code === 404) L.log("Collection not found", PASSWORDS_COLLECTION_NAME);
    else L.log("Pull bookmarks error", err);
  });
}

function pullPasswords() {
  L.log("Pulling passwords from server");
  this.ssClient.readCollection({ collection: PASSWORDS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull passwords success", result);
    try {
      PasswordsAdapter.clearLocalPasswords();
      PasswordsAdapter.updateLocalPasswords(result.items);
    } catch(e) {
      L.log("Error updating local passwords", e.message);
    }
  }).
  then(null, function (err) {
    if (err.code === 404) L.log("Collection not found", PASSWORDS_COLLECTION_NAME);
    else L.log("Pull passwords error", err);
  });
}

SyncMediator.prototype.pull = function() {
  pullPasswords.call(this);
  pullBookmarks.call(this);
};

function pushBookmarks() {
  var localBookmarks = BookmarksAdapter.readLocalBookmarks();
  if (localBookmarks.length > 0) {
    L.log("Pushing local bookmarks", localBookmarks);
    this.ssClient.updateCollection({ collection: BOOKMARKS_COLLECTION_NAME, items: localBookmarks }).
    then(function (result) {
      L.log("Push bookmarks success", result);
    }).
    then(null, function(err) {
      L.log("Push bookmarks error", err);
    });
  }
  else {
    L.log("Local bookmarks empty");
  }
}

function pushPasswords() {
  var localPasswords = PasswordsAdapter.readLocalPasswords();
  if (localPasswords.length > 0) {
    L.log("Pushing local passwords", localPasswords);
    this.ssClient.updateCollection({ collection: PASSWORDS_COLLECTION_NAME, items: localPasswords }).
    then(function (result) {
      L.log("Push passwords success", result);
    }).
    then(null, function(err) {
      L.log("Push passwords error", err);
    });
  }
  else {
    L.log("Local passwords empty");
  }
}

SyncMediator.prototype.push = function() {
  pushPasswords.call(this);
  pushBookmarks.call(this);
};

module.exports = SyncMediator;