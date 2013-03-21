const StorageServerClient = require('storage-server-client');
const PasswordsAdapter = require('passwords-adapter');
const BookmarksAdapter = require('bookmarks-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const PlacesAdapter = require('places-adapter');
const { setInterval, clearInterval } = require('timers');
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
  this.collectionsInfo = { collections: {} };
}

SyncMediator.prototype.pullBookmarks = function() {
  L.log("Pulling bookmarks from server");
  return this.ssClient.readCollection({ collection: BOOKMARKS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull bookmarks success");// result);
    let bookmarks = result.items.map(function (item) { return BookmarksItem(item); });
    //L.log("results", bookmarks);
    try {
      BookmarksAdapter.stopTracking();
      BookmarksAdapter.clearLocalBookmarks();
      return BookmarksAdapter.updateLocalBookmarks(bookmarks).
      then(function () {
        BookmarksAdapter.startTracking();
        return result;
      });
    } catch(e) {
      L.log("Error updating local bookmarks", e.message, err.stack);
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
    else L.log("Pull bookmarks error", err.message, err.stack);
  });
}

SyncMediator.prototype.pullPasswords = function() {
  L.log("Pulling passwords from server");
  return this.ssClient.readCollection({ collection: PASSWORDS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull passwords success");
    //L.log(result);
    try {
      PasswordsAdapter.stopTracking();
      PasswordsAdapter.clearLocalPasswords();
      PasswordsAdapter.updateLocalPasswords(result.items);
      PasswordsAdapter.startTracking();
      return result;
    } catch(e) {
      L.log("Error updating local passwords", e.message);
      return null;
    }
  }).
  then(null, function (err) {
    if (err.code === 404) L.log("Collection not found", PASSWORDS_COLLECTION_NAME);
    else L.log("Pull passwords error", err, err.stack);
    return null;
  });
}

SyncMediator.prototype.pull = function() {
  return group([
    this.pullPasswords(),
    this.pullBookmarks()
  ]).
  then(function (results) {
    L.log("Pull completed");
    return results;
  }).
  then(null, function (err) {
    L.log("Pull error", err.message, err.stack);
  });
};

SyncMediator.prototype.pushBookmarks = function() {
  var self = this;
  return BookmarksAdapter.readLocalBookmarks().
  then(function (localBookmarks) {
    if (localBookmarks.length > 0) {
      L.log("Pushing local bookmarks");//, localBookmarks);
      //L.log("JSON", JSON.stringify(localBookmarks));
      return self.ssClient.updateCollection({ collection: BOOKMARKS_COLLECTION_NAME, items: localBookmarks }).
      then(function (result) {
        L.log("Push bookmarks success", result);
        return result.version;
      });
    }
    else {
      L.log("Local bookmarks empty");
      return resolve(null);
    }
  }).
  then(null, function(err) {
    L.log("Push bookmarks error", err.message, err.stack);
    throw err;
  });
}

SyncMediator.prototype.pushPasswords = function() {
  var localPasswords = PasswordsAdapter.readLocalPasswords();
  if (localPasswords.length > 0) {
    L.log("Pushing local passwords");//, localPasswords);
    return this.ssClient.updateCollection({ collection: PASSWORDS_COLLECTION_NAME, items: localPasswords }).
    then(function (result) {
      L.log("Push passwords success", result);
      return result.version;
    }).
    then(null, function(err) {
      L.log("Push passwords error", err.message, err.stack);
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
    this.pushPasswords(),
    this.pushBookmarks()
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

SyncMediator.prototype.maybePullCollection = function(collectionName, serverVersion) {
  var self = this;
  //L.log("maybe pull", self.collectionsInfo.collections[collectionName], serverVersion);
  if (!(collectionName in this.collectionsInfo.collections) || self.collectionsInfo.collections[collectionName] < serverVersion) {
    let pullFunctionName = 'pull'+(collectionName.charAt(0).toUpperCase() + collectionName.slice(1));
    if (self[pullFunctionName]) {
      return self[pullFunctionName]().
      then(function (result) {
        let info = {};
        info[collectionName] = result.version;
        self.updateCollectionsInfo(info);
      });
    }
    else L.log("No pull function for "+pullFunctionName, self[pullFunctionName]);
  }
  return resolve(null);
}

SyncMediator.prototype.maybePull = function() {
  //L.log("In maybePull");
  var self = this;
  self.ssClient.getCollectionsInfo().
  then(function (collectionsInfo) {
    //L.log("Got collectionsInfo", collectionsInfo, self.collectionsInfo);
    var collectionNames = Object.keys(collectionsInfo.collections) || [];
    var promises = [];
    collectionNames.forEach(function (collectionName) {
      promises.push(self.maybePullCollection(collectionName, collectionsInfo.collections[collectionName]));
    });
    return group(promises);
  }).
  then(function () {
    //L.log("maybePull done");
  }).
  then(null, function (err) {
    L.log("maybePull error:", err.message, err.stack);
  });
}

SyncMediator.prototype.maybePush = function() {
  var self = this;
  //L.log("Bookmarks hasChanges", BookmarksAdapter.hasChanges());
  if (BookmarksAdapter.hasChanges()) {
    BookmarksAdapter.clearHasChanges();
    this.pushBookmarks().
    then(function (version) {
      self.updateCollectionsInfo({ bookmarks: version });
    });
  }
  if (PasswordsAdapter.hasChanges()) {
    PasswordsAdapter.clearHasChanges();
    this.pushPasswords().
    then(function (version) {
      self.updateCollectionsInfo({ passwords: version });
    });
  }
};

// collectionsInfo should be a hash of collection names => version numbers
SyncMediator.prototype.updateCollectionsInfo = function(collectionsInfo) {
  var self = this;
  Object.keys(collectionsInfo).forEach(function (name) {
    L.log("Updating collections info", name, collectionsInfo[name]);
    self.collectionsInfo.collections[name] = collectionsInfo[name];
  });
}

var pullPollerId = null;
var pushPollerId = null;

SyncMediator.prototype.startPolling = function() {
  if (pullPollerId === null) {
    this.maybePull();
    pullPollerId = setInterval(this.maybePull.bind(this), 5532);
    pushPollerId = setInterval(this.maybePush.bind(this), 1000);
    BookmarksAdapter.startTracking();
    PasswordsAdapter.startTracking();
  }
}

SyncMediator.prototype.stopPolling = function() {
  if (pullPollerId !== null) {
    clearInterval(pullPollerId);
    clearInterval(pushPollerId);
    BookmarksAdapter.stopTracking();
    PasswordsAdapter.stopTracking();
    pollerId = null;
  }
}

module.exports = SyncMediator;