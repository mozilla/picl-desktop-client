const StorageServerClient = require('storage-server-client');
const PasswordsAdapter = require('passwords-adapter');
const BookmarksAdapter = require('bookmarks-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const PlacesAdapter = require('places-adapter');
const TabsAdapter = require('tabs-adapter');
const { setInterval, clearInterval } = require('timers');
const L = require('logger');
const { defer, resolve, promised } = require('sdk/core/promise');
const group = function (array) { return promised(Array).apply(null, array); };

const PASSWORDS_COLLECTION_NAME = "passwords";
const BOOKMARKS_COLLECTION_NAME = "bookmarks";
const TABS_COLLECTION_NAME = "tabs";

const SYNCED_COLLECTIONS = [ PASSWORDS_COLLECTION_NAME, BOOKMARKS_COLLECTION_NAME, TABS_COLLECTION_NAME ];

function SyncMediator(user) {
  if (user) {
    this.user = user;
    this.ssClient = new StorageServerClient({ userId: user.id, token: user.token });
  }
  this.collectionsInfo = { collections: {} };
}

SyncMediator.prototype.pullTabs = function () {
  L.log("Pulling tabs from server");
  return this.ssClient.readCollection({ collection: TABS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull tabs success");// result);
    return TabsAdapter.update(result.items).
    then(function () {
      return result;
    });
  }).
  then(null, function (err) {
    if (err.code === 404) L.log("Collection not found", TABS_COLLECTION_NAME);
    else L.log("Pull tabs error", err.message, err.stack);
  });
}

SyncMediator.prototype.pullBookmarks = function() {
  L.log("Pulling bookmarks from server");
  return this.ssClient.readCollection({ collection: BOOKMARKS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull bookmarks success");//, result);
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

SyncMediator.prototype.pushTabs = function () {
  var self = this;
  L.log("Pushing tabs to server");
  return TabsAdapter.read().
  then(function (tabsInfo) {
    return self.ssClient.updateCollection({ collection: TABS_COLLECTION_NAME, items: [ tabsInfo ] }).
    then(function (result) {
      L.log("Push tabs success", result);
      return result.version;
    });
  }).
  then(null, function (err) {
    L.log("Push tabs error", err.message, err.stack);
    throw err;
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

SyncMediator.prototype.pullCollection = function(collectionName) {
  let pullFunctionName = 'pull'+(collectionName.charAt(0).toUpperCase() + collectionName.slice(1));
  if (typeof(this[pullFunctionName]) !== 'function') {
    L.log("No pull function for "+pullFunctionName, this[pullFunctionName]);
    return resolve(null);
  }
  return this[pullFunctionName]();
}

SyncMediator.prototype.maybePullCollection = function(collectionName, serverVersion) {
  var self = this;
  //L.log("maybe pull", self.collectionsInfo.collections[collectionName], serverVersion);
  if (!(collectionName in this.collectionsInfo.collections) || self.collectionsInfo.collections[collectionName] < serverVersion) {
    return self.pullCollection(collectionName).then(function (result) {
      //L.log("maybePull", result);
      if (result) self.updateCollectionsInfo(collectionName, result.version);
    });
  }
  return resolve(null);
};

SyncMediator.prototype.maybePull = function() {
  //L.log("In maybePull");
  var self = this;
  return self.ssClient.getCollectionsInfo().
  then(function (collectionsInfo) {
    //L.log("Got collectionsInfo", collectionsInfo, self.collectionsInfo);
    var serverCollectionNames = Object.keys(collectionsInfo.collections) || [];
    var promises = [];
    serverCollectionNames.forEach(function (collectionName) {
      promises.push(self.maybePullCollection(collectionName, collectionsInfo.collections[collectionName]));
    });
    return group(promises);
  }).
  then(function () {
    //L.log("maybePull done");
  }).
  then(null, function (err) {
    L.log("maybePull error:", err.message, err.stack);
    throw err;
  });
}

SyncMediator.prototype.pushCollection = function (collectionName) {
  let pushFunctionName = 'push'+(collectionName.charAt(0).toUpperCase() + collectionName.slice(1));
  if (typeof(this[pushFunctionName]) !== 'function') {
    L.log("Unimplemented push functon for collection: "+collectionName);
    return resolve(null);
  }
  return this[pushFunctionName]();
}

SyncMediator.prototype.maybePushCollection = function (collectionName) {
  //L.log("Maybe push on "+ collectionName);
  let self = this;
  var adapter = require(collectionName+'-adapter');
  // push if we have changes for there is no collection info for this collection yet on the server
  if (adapter.hasChanges() || !self.existsCollectionsInfoForCollection(collectionName)) {
    adapter.clearHasChanges();
    this.pushCollection(collectionName).then(function (version) {
      self.updateCollectionsInfo(collectionName, version);
    }).then(null, function (err) {
      L.log("SyncMediator.maybePushCollection error", err.message, err.stack);
      throw err;
    });
  }
}

SyncMediator.prototype.maybePush = function () {
  var self = this;
  var promises = [];
  SYNCED_COLLECTIONS.forEach(function (collectionName) {
    promises.push(self.maybePushCollection(collectionName));
  });
  return group(promises);
};

SyncMediator.prototype.updateCollectionsInfo = function(collectionName, version) {
  this.collectionsInfo.collections[collectionName] = version;
}

SyncMediator.prototype.existsCollectionsInfoForCollection = function(collectionName) {
  //L.log(collectionName, this.collectionsInfo.collections[collectionName]);
  return typeof(this.collectionsInfo.collections[collectionName]) === 'number';
}

var pullPollerId = null;
var pushPollerId = null;

SyncMediator.prototype.startPolling = function() {
  let self = this;
  if (pullPollerId === null) {
    this.maybePull().then(function () {
      pullPollerId = setInterval(self.maybePull.bind(self), 3632);
      pushPollerId = setInterval(self.maybePush.bind(self), 1146);
    });
    SYNCED_COLLECTIONS.forEach(function (collectionName) {
      let adapter = require(collectionName+'-adapter');
      adapter.startTracking();
    });
  }
}

SyncMediator.prototype.stopPolling = function() {
  if (pullPollerId !== null) {
    clearInterval(pullPollerId);
    clearInterval(pushPollerId);
    SYNCED_COLLECTIONS.forEach(function (collectionName) {
      let adapter = require(collectionName+'-adapter');
      adapter.stopTracking();
    });
    pullPollerId = null;
    pushPollerId = null;
  }
}

module.exports = SyncMediator;