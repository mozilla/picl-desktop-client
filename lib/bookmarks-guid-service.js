const {Cc, Ci, Cu} = require("chrome");
const { defer, resolve } = require('sdk/core/promise');
const L = require('logger');
const PlacesAdapter = require('places-adapter');
Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

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
    return kSpecialIds.guids.indexOf(g) != -1;
  },

  specialIdForGUID: function specialIdForGUID(guid, create) {
    // if (guid == "mobile") {
    //   return this.findMobileRoot(create);
    // }
    return kSpecialIds[guid];
  },

  // Don't bother creating mobile: if it doesn't exist, this ID can't be it!
  specialGUIDForId: function specialGUIDForId(id) {
    for each (let guid in kSpecialIds.guids)
      if (kSpecialIds.specialIdForGUID(guid, false) == id)
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

var idToGuidMap = {};
var guidToIdMap = {};


kSpecialIds.guids.forEach(function (guid) {
  idToGuidMap[kSpecialIds[guid]] = guid;
  guidToIdMap[guid] = kSpecialIds[guid];
});

function getLocalIdsForGuids(guids) {
  var stmt = GET_IDS_FOR_GUIDS_STMT;
  var guidsParam = guids.map(function(guid) { return "'"+guid+"'";}).join(',');
  var params = stmt.newBindingParamsArray();
  let bp = params.newBindingParams();
  bp.bindByName('guids', guidsParam);
  params.addParams(bp);
  stmt.bindParameters(params);
  return PlacesAdapter.runAsyncQuery(stmt, function (row, results) {
    let localId = row.getResultByName('b_id'),
        guid = row.getResultByName('b_guid');
    if (localId) {
      guidToIdMap[guid] = localId;
      results[guid] = localId;
    } else {
      L.log("Can't find id for guid: ", localId);
    }
  }, {}).
  then(function (results) {
    return results;
  });
}

function getLocalIdForGuid(guid) {
  if (guid in guidToIdMap) {
    return resolve(guidToIdMap[guid]);
  }
  else {
    return getLocalIdsForGuids([guid]).
    then(function (guidMap) {
      return guidMap[guid];
    });
  }
}

// TODO: handle case this puppy isn't in the map
function getGuidForLocalId(localId) {
  return resolve(idToGuidMap[localId]);
}

function setGuidForLocalId(guid, localId) {
  var stmt = SET_GUID_FOR_ID_STMT;
  var params = stmt.newBindingParamsArray();
  let bp = params.newBindingParams();
  bp.bindByName('guid', guid);
  params.addParams(bp);
  bp = params.newBindingParams();
  bp.bindByName('item_id', localId);
  params.addParams(bp);
  stmt.bindParameters(params);
  return PlacesAdapter.runAsyncQuery(stmt, function (row, results) {
  }, {}).
  then(function() {
    // update guid -> id map
    guidToIdMap[guid] = localId;
    return;
  });
}

// TODO: make sure localId isn't undefined or null here
function cacheGuidForLocalId(guid, localId) {
  let specialGUID = kSpecialIds.specialGUIDForId(localId);
  if (specialGUID) {
    return specialGUID;
  }
  idToGuidMap[localId] = guid;
  return guid;
}

module.exports = {
  getLocalIdForGuid: getLocalIdForGuid,
  getLocalIdsForGuids: getLocalIdsForGuids,
  getGuidForLocalId: getGuidForLocalId,
  setGuidForLocalId: setGuidForLocalId,
  isSpecialGUID: kSpecialIds.isSpecialGUID,
  specialGUIDForId: kSpecialIds.specialGUIDForId,
  cacheGuidForLocalId: cacheGuidForLocalId
};