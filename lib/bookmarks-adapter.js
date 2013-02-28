const { Cc, Ci, Cu, CC } = require("chrome");
const L = require('logger');
const uuidGenerator = Cc["@mozilla.org/uuid-generator;1"]
                        .getService(Ci.nsIUUIDGenerator);
const ios = Cc["@mozilla.org/network/io-service;1"]
              .getService(Ci.nsIIOService);
const storage = require("sdk/simple-storage").storage;

storage.bookmarkItemIdToUUIDMapping = storage.bookmarkItemIdToUUIDMapping || {};

Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

function getBookmarkUUIDForItemId(itemId) {
  if (storage.bookmarkItemIdToUUIDMapping[itemId]) return storage.bookmarkItemIdToUUIDMapping[itemId];
  var uuid = uuidGenerator.generateUUID().toString();
  storage.bookmarkItemIdToUUIDMapping[itemId] = uuid;
  return uuid;
}

function getBookmarkItemIdForUUID(uuid) {
  var itemId,
      keys = Object.keys(storage.bookmarkItemIdToUUIDMapping);
  keys.forEach(function (key){
    if (storage.bookmarkItemIdToUUIDMapping[key] === uuid) itemId = key;
  });
  return itemId;
}

function Bookmark(bookmarkInfo) {
  let bookmark = Object.create(Bookmark.prototype);
  bookmark.bookmarkIndex = bookmarkInfo.bookmarkIndex;
  bookmark.title = bookmarkInfo.title;
  bookmark.uri = bookmarkInfo.uri;
  bookmark.id = getBookmarkUUIDForItemId(bookmarkInfo.itemId);
  //bookmark.tags = bookmarkInfo.tags;
  return bookmark;
}

Bookmark.prototype.toJSON = function toJSON() {
  return {
    bookmarkIndex: this.bookmarkIndex,
    title: this.title,
    uri: this.uri,
    id: this.id
  };
}

function bookmarkToJSON(value) Bookmark(value).toJSON()

function updateLocalBookmarks(bookmarks) {
  var uri;
  bookmarks.forEach(function (bookmarkInfo) {
    var itemId = getBookmarkItemIdForUUID(bookmarkInfo.id);
    uri = ios.newURI(bookmarkInfo.uri, null, null);
    if (false && itemId) {
      L.log("updating item: ", bookmarkInfo);
      PlacesUtils.bookmarks.setItemIndex(itemId, bookmarkInfo.bookmarkIndex);
      PlacesUtils.bookmarks.setItemTitle(itemId, bookmarkInfo.title);
      PlacesUtils.bookmarks.changeBookmarkURI(itemId, uri);
    } else {
      L.log("adding item: ", bookmarkInfo);
      var newItemId = PlacesUtils.bookmarks.insertBookmark(PlacesUtils.bookmarks.toolbarFolder,
        uri, bookmarkInfo.bookmarkIndex, bookmarkInfo.title);
      storage.bookmarkItemIdToUUIDMapping[newItemId] = bookmarkInfo.id;
    }
  });
  L.log("update done, local state now:", readLocalBookmarks(), storage.bookmarkItemIdToUUIDMapping);
}

function clearLocalBookmarks() {
  var nodeIds = [];
  var result = PlacesUtils.getFolderContents(PlacesUtils.bookmarks.toolbarFolder);
  var rootNode = result.root;
  // iterate over the immediate children of this folder and dump to console
  for (var i = 0; i < rootNode.childCount; i ++) {
    var node = rootNode.getChild(i);
    if (PlacesUtils.nodeIsBookmark(node)) {
      //L.logWithDepth("deleting", node, 1);
      nodeIds.push(node.itemId);
    }
  }
  // close a container after using it!
  rootNode.containerOpen = false;
  nodeIds.map(function(id) { PlacesUtils.bookmarks.removeItem(id); });
  L.log("clear done, local state now:", readLocalBookmarks());
}

function readLocalBookmarks() {
  var bookmarkNodes = [];
  var result = PlacesUtils.getFolderContents(PlacesUtils.bookmarks.toolbarFolder);
  var rootNode = result.root;
  // iterate over the immediate children of this folder and dump to console
  for (var i = 0; i < rootNode.childCount; i ++) {
    var node = rootNode.getChild(i);
    if (PlacesUtils.nodeIsBookmark(node)) {
      //L.logWithDepth(node, 1);
      bookmarkNodes.push(node);
    }
  }
  // close a container after using it!
  rootNode.containerOpen = false;
  return bookmarkNodes.map(bookmarkToJSON);
}

module.exports = {
  updateLocalBookmarks: updateLocalBookmarks,
  readLocalBookmarks: readLocalBookmarks,
  clearLocalBookmarks: clearLocalBookmarks
};


