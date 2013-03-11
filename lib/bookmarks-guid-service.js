const {Cc, Ci, Cu} = require("chrome");
const { defer, resolve } = require('sdk/core/promise');
const L = require('logger');
const PlacesAdapter = require('places-adapter');

const GET_IDS_FOR_GUIDS_QUERY =
    "SELECT id AS b_id, guid AS b_guid FROM moz_bookmarks WHERE moz_bookmarks.guid IN (:guids)";
var GET_IDS_FOR_GUIDS_STMT = PlacesAdapter.createAsyncStatement(GET_IDS_FOR_GUIDS_QUERY);

const SET_GUID_FOR_ID_QUERY =
    "UPDATE moz_bookmarks SET guid = :guid WHERE id = :item_id";
var SET_GUID_FOR_ID_STMT = PlacesAdapter.createAsyncStatement(SET_GUID_FOR_ID_QUERY);

let kSpecialIds = {

  // Special IDs. Note that mobile can attempt to create a record on
  // dereference; special accessors are provided to prevent recursion within
  // observers.
  guids: ["menu", "places", "tags", "toolbar", "unfiled"], // removed mobile

  // Create the special mobile folder to store mobile bookmarks.
  // createMobileRoot: function createMobileRoot() {
  //   let root = PlacesUtils.placesRootId;
  //   let mRoot = PlacesUtils.bookmarks.createFolder(root, "mobile", -1);
  //   PlacesUtils.annotations.setItemAnnotation(
  //     mRoot, MOBILEROOT_ANNO, 1, 0, PlacesUtils.annotations.EXPIRE_NEVER);
  //   PlacesUtils.annotations.setItemAnnotation(
  //     mRoot, EXCLUDEBACKUP_ANNO, 1, 0, PlacesUtils.annotations.EXPIRE_NEVER);
  //   return mRoot;
  // },

  // findMobileRoot: function findMobileRoot(create) {
  //   // Use the (one) mobile root if it already exists.
  //   let root = PlacesUtils.annotations.getItemsWithAnnotation(MOBILEROOT_ANNO, {});
  //   if (root.length != 0)
  //     return root[0];

  //   if (create)
  //     return this.createMobileRoot();

  //   return null;
  // },

  // Accessors for IDs.
  isSpecialGUID: function isSpecialGUID(g) {
    return this.guids.indexOf(g) != -1;
  },

  specialIdForGUID: function specialIdForGUID(guid, create) {
    // if (guid == "mobile") {
    //   return this.findMobileRoot(create);
    // }
    return this[guid];
  },

  // Don't bother creating mobile: if it doesn't exist, this ID can't be it!
  specialGUIDForId: function specialGUIDForId(id) {
    for each (let guid in this.guids)
      if (this.specialIdForGUID(guid, false) == id)
        return guid;
    return null;
  },

  get menu()    PlacesUtils.bookmarksMenuFolderId,
  get places()  PlacesUtils.placesRootId,
  get tags()    PlacesUtils.tagsFolderId,
  get toolbar() PlacesUtils.toolbarFolderId,
  get unfiled() PlacesUtils.unfiledBookmarksFolderId,
  //get mobile()  this.findMobileRoot(true),
};

var guidToIdMap = {};
kSpecialIds.guids.forEach(function (guid) {
  guidToIdMap[guid] = kSpecialIds[guid];
});

function getLocalIdsForGUIDs(guids) {

}

function getLocalIdForGUID(guid) {

}

function getGUIDForLocalId(localId) {

}

function setGUIDForLocalId(localId, guid) {

}

function isSpecialGUID(guid) {
  return kSpecialIds.isSpecialGUID(guid);
}

module.exports = {
  getLocalIdForGUID: getLocalIdForGUID,
  getLocalIdsForGUIDs: getLocalIdsForGUIDs,
  getGUIDForLocalId: getGUIDForLocalId,
  setGUIDForLocalId: setGUIDForLocalId,
  isSpecialGUID: isSpecialGUID
};