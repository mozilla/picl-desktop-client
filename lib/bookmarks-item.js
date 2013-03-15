const {components, Cc, Ci, Cu} = require("chrome");
const L = require('logger');
const { defer, resolve, promised } = require('sdk/core/promise');
const group = function (array) { return promised(Array).apply(null, array); };
const BookmarksGuidService = require('bookmarks-guid-service');
const ios = Cc["@mozilla.org/network/io-service;1"]
              .getService(Ci.nsIIOService);
const BookmarksStore = require('bookmarks-store');
Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

const DESCRIPTION_ANNO     = "bookmarkProperties/description";
const SIDEBAR_ANNO         = "bookmarkProperties/loadInSidebar";
const QUERY_ANNO           = "Places/SmartBookmark";

function getAnnoForItem(annoName) {
  var anno = (this.annos || []).filter(function (anno) { return anno.name === annoName; })[0];
  if (anno) return anno.content;
  else return null;
}

function BookmarksItem(itemInfo) {
  let bookmarksItem = Object.create(BookmarksItem.prototype);
  Object.keys(itemInfo).forEach(function (key) {
    bookmarksItem[key] = itemInfo[key];
  });
  bookmarksItem.getAnnoForItem = getAnnoForItem.bind(bookmarksItem);
  return bookmarksItem;
}

BookmarksItem.existsInPlaces = function(guid) {
  return BookmarksGuidService.getLocalIdForGuid(guid).
  then(function (localId) {
    return localId !== undefined;
  });
}

BookmarksItem.prototype.toJSON = function toJSON() {
  var result = {
    id: this.id,
    parentid: this.parentid,
    parentName: ((BookmarksStore.getItemForId(this.parentid) || {}).title || ""),
    localType: this.localType,
    // dateAdded: this.dateAdded,
    // lastModified: this.lastModified,
    pos: this.pos
  },
  description = this.getDescription(),
  loadInSidebar = this.getLoadInSidebar();



  if (this.title !== null) result.title = this.title;
  if (this.bmkUri !== null) result.bmkUri = this.bmkUri;
  if (this.keyword !== null) result.keyword = this.keyword;
  if (description !== null) result.description = description;
  if (loadInSidebar) result.loadInSidebar = true;
  if (this.isFolder()) {
    result.children = this.children ||
      BookmarksStore.getChildrenForParentid(this.id).map(function (child) { return child.id; });
  }

  if (this.isLivemark()) {
    result.feedUri = this.getFeedUri();
    result.siteUri = this.getSiteUri();
  }
  if (this.isQuery()) {
    result.queryId = this.getQueryId();
    result.folderName = this.title; // TODO: not sure what should go here
  }
  result.type = this.getPrettyType();
  if (this.tags) result.tags = this.tags;
  else {
    let tags = BookmarksStore.getTagsForUri(this.bmkUri);
    if (tags.length > 0) {
      result.tags = tags.join(", ");
    }
  }
  return result;
}

BookmarksItem.prototype.isLivemark = function() {
  return this.getFeedUri() != null;
}

BookmarksItem.prototype.isFolder = function() {
  return this.localType === PlacesUtils.bookmarks.TYPE_FOLDER && !this.isLivemark();
}

BookmarksItem.prototype.isBookmark = function() {
  return this.localType === PlacesUtils.bookmarks.TYPE_BOOKMARK && !this.isQuery();
}

BookmarksItem.prototype.isQuery = function() {
  return this.localType === PlacesUtils.bookmarks.TYPE_BOOKMARK && (this.bmkUri && this.bmkUri.indexOf("place:") == 0);
}

BookmarksItem.prototype.isSeparator = function() {
  return this.localType === PlacesUtils.bookmarks.TYPE_SEPARATOR;
}

BookmarksItem.prototype.getDescription = function() {
  return this.description || this.getAnnoForItem(DESCRIPTION_ANNO);
}

BookmarksItem.prototype.getLoadInSidebar = function() {
  return this.loadInSidebar || this.getAnnoForItem(SIDEBAR_ANNO) !== null;
}

BookmarksItem.prototype.getFeedUri = function() {
  return this.feedUri || this.getAnnoForItem(PlacesUtils.LMANNO_FEEDURI);
}

BookmarksItem.prototype.getSiteUri = function() {
  return this.siteUri || this.getAnnoForItem(PlacesUtils.LMANNO_SITEURI);
}

BookmarksItem.prototype.getQueryId = function() {
  return this.queryId || this.getAnnoForItem(QUERY_ANNO);
}

BookmarksItem.prototype.getPrettyType = function() {
  if (this.isBookmark()) {
    return 'bookmark';
  }
  else if (this.isQuery()) {
    return 'query';
  }
  else if (this.isFolder()) {
    return 'folder';
  }
  else if (this.isLivemark()) {
    return 'livemark';
  }
  else if (this.isSeparator()) {
    return 'separator';
  }
  else {
    return 'unknown';
  }
}

function createFolderAsync(bookmarksItem, localParentId) {
  //L.log("about to create folder", bookmarksItem, localParentId);
  let promise = resolve(PlacesUtils.bookmarks.createFolder(localParentId, bookmarksItem.title, bookmarksItem.pos));
  return promise.
  then(function (newLocalId) {
    bookmarksItem.localId = newLocalId;
    return bookmarksItem.saveDescriptionInPlaces();
  }).
  then(function () {
    return bookmarksItem.localId;
  });
}

function createFolder(bookmarksItem, localParentId) {
  //L.log("about to create folder", bookmarksItem, localParentId);
  let newLocalId = PlacesUtils.bookmarks.createFolder(localParentId, bookmarksItem.title, bookmarksItem.pos);
  bookmarksItem.localId = newLocalId;
  bookmarksItem.saveDescriptionInPlaces();
  return bookmarksItem.localId;
}


// TODO: handle tags (but their already working somewhat)
function createBookmarkAsync(bookmarksItem, localParentId) {
  //L.log("about to create bookmark", bookmarksItem, localParentId);
  let uri = ios.newURI(bookmarksItem.bmkUri, null, null);
  let promise = resolve(PlacesUtils.bookmarks.insertBookmark(localParentId,
    uri, bookmarksItem.pos, bookmarksItem.title));
  return promise.
  then(function (newLocalId) {
    bookmarksItem.localId = newLocalId;
    return bookmarksItem.saveDescriptionInPlaces();
  }).
  then(function () {
    return bookmarksItem.saveLoadInSidebarInPlaces();
  }).
  then(function () {
    return bookmarksItem.saveKeywordInPlaces();
  }).
  then(function () {
    if (bookmarksItem.isQuery()) {
      return bookmarksItem.saveQueryInPlaces();
    }
  }).
  then(function () {
    return bookmarksItem.localId;
  });
}

// TODO: handle tags (but their already working somewhat)
function createBookmark(bookmarksItem, localParentId) {
  //L.log("about to create bookmark", bookmarksItem, localParentId);
  let uri = ios.newURI(bookmarksItem.bmkUri, null, null);
  let newLocalId = PlacesUtils.bookmarks.insertBookmark(localParentId, uri, bookmarksItem.pos, bookmarksItem.title);
  bookmarksItem.localId = newLocalId;
  bookmarksItem.saveDescriptionInPlaces();
  bookmarksItem.saveLoadInSidebarInPlaces();
  bookmarksItem.saveKeywordInPlaces();
  if (bookmarksItem.isQuery()) {
    bookmarksItem.saveQueryInPlaces();
  }
  return bookmarksItem.localId;
}

function createSeparatorAsync(bookmarksItem, localParentId) {
  //L.log("about to create separator", bookmarksItem, localParentId);
  let promise = resolve(PlacesUtils.bookmarks.insertSeparator(localParentId, bookmarksItem.pos));
  return promise.
  then(function (newLocalId) {
    bookmarksItem.localId = newLocalId;
    return newLocalId;
  });
}

function createSeparator(bookmarksItem, localParentId) {
  //L.log("about to create separator", bookmarksItem, localParentId);
  let newLocalId = PlacesUtils.bookmarks.insertSeparator(localParentId, bookmarksItem.pos);
  bookmarksItem.localId = newLocalId;
  return newLocalId;
}

function createLivemarkAsync(bookmarksItem, localParentId) {
  let deferred = defer(),
      feedUri = ios.newURI(bookmarksItem.feedUri, null, null),
      siteUri = ios.newURI(bookmarksItem.siteUri, null, null);
  PlacesUtils.livemarks.addLivemark({
    title: bookmarksItem.title,
    parentId: localParentId,
    index: bookmarksItem.pos,
    feedURI: feedUri,
    siteURI: siteUri,
    guid: bookmarksItem.id
  }, function (aStatus, aLivemark) {
    if (components.isSuccessCode(aStatus)) deferred.resolve(aLivemark.id);
    else deferred.reject({ message: "Failed to create livemark, error code: " + aStatus });
  });
  return deferred.promise;
}

function createLivemark(bookmarksItem, localParentId) {
  let feedUri = ios.newURI(bookmarksItem.feedUri, null, null),
      siteUri = ios.newURI(bookmarksItem.siteUri, null, null);
  let newLocalId = PlacesUtils.livemarks.createLivemarkFolderOnly(localParentId, bookmarksItem.title, siteUri, feedUri, index);
  bookmarksItem.localId = newLocalId;
}

BookmarksItem.prototype.saveDescriptionInPlaces = function(description) {
  description = description || this.getDescription();
  if (description) { // TODO: need something better than this to handle deleted descriptions
    PlacesUtils.annotations.setItemAnnotation(
      this.localId, DESCRIPTION_ANNO, description, 0,
      PlacesUtils.annotations.EXPIRE_NEVER);
  }
  else {
    PlacesUtils.annotations.removeItemAnnotation(this.localId, DESCRIPTION_ANNO);
  }
}

BookmarksItem.prototype.saveDescriptionInPlacesAsync = function(description) {
  return resolve(this.saveDescriptionInPlaces(description));
};

BookmarksItem.prototype.saveLoadInSidebarInPlaces = function(loadInSidebar) {
  loadInSidebar = loadInSidebar || this.getLoadInSidebar();
  if (loadInSidebar) {
    PlacesUtils.annotations.setItemAnnotation(
      this.localId, SIDEBAR_ANNO, true, 0,
      PlacesUtils.annotations.EXPIRE_NEVER);
  }
  else {
    PlacesUtils.annotations.removeItemAnnotation(this.localId, SIDEBAR_ANNO);
  }
};

BookmarksItem.prototype.saveLoadInSidebarInPlacesAsync = function(loadInSidebar) {
  return resolve(this.saveLoadInSidebarInPlaces(loadInSidebar));
};

BookmarksItem.prototype.saveKeywordInPlaces = function(keyword) {
  keyword = keyword || this.keyword;
  // Empty keyword clears it
  PlacesUtils.bookmarks.setKeywordForBookmark(this.localId, keyword);
}

BookmarksItem.prototype.saveKeywordInPlacesAsync = function(keyword) {
  return resolve(this.saveKeywordInPlaces(keyword));
}

BookmarksItem.prototype.saveQueryInPlaces = function(queryId) {
  queryId = queryId || this.queryId;
  if (queryId) { // need something better than this to handle deletions
    PlacesUtils.annotations.setItemAnnotation(
      this.localId, QUERY_ANNO, queryId, 0,
      PlacesUtils.annotations.EXPIRE_NEVER);
  }
}

BookmarksItem.prototype.saveQueryInPlacesAsync = function(queryId) {
  return resolve(this.saveQueryInPlaces(query));
}

BookmarksItem.prototype.createInPlaces = function() {
  var self = this;
  return BookmarksGuidService.getLocalIdForGuid(self.parentid).
  then(function (localParentId) {
    //L.log("creating item for parent", localParentId);
    if (self.isFolder()) {
      return createFolderAsync(self, localParentId);
    }
    else if (self.isBookmark() || self.isQuery()) {
      return createBookmarkAsync(self, localParentId);
    }
    else if (self.isLivemark()) {
      return createLivemarkAsync(self, localParentId);
    }
    else if (self.isSeparator()) {
      return createSeparatorAsync(self, localParentId);
    }
  }).
  then(function (localId) {
    //L.log("done creating item, about to set guid for local id", localId, self.id);
    // After creating item, update its local guid to match the
    // remote guid
    return BookmarksGuidService.setGuidForLocalId(self.id, localId).
    then(function () {
      //L.log("set guid for created id", self, localId);
      return;
    });
  });
};

BookmarksItem.prototype.updateInPlaces = function() {

};

BookmarksItem.prototype.deleteInPlaces = function() {

};


module.exports = {
  BookmarksItem: BookmarksItem,
  DESCRIPTION_ANNO: DESCRIPTION_ANNO,
  SIDEBAR_ANNO: SIDEBAR_ANNO,
  QUERY_ANNO: QUERY_ANNO
};