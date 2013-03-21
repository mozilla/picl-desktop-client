const {Cc, Ci, Cu} = require("chrome");
const { defer, resolve, promised } = require('sdk/core/promise');
const group = function (array) { return promised(Array).apply(null, array); };
const L = require('logger');
const PlacesAdapter = require('places-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const BookmarksStore = require('bookmarks-store');
const BookmarksGuidService = require('bookmarks-guid-service');
const topoSort = require('topo-sort');

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm", this);
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import("resource://services-common/utils.js");

const Utils = CommonUtils;

const DESCRIPTION_ANNO     = require('places-adapter').DESCRIPTION_ANNO;
const SIDEBAR_ANNO         = require('places-adapter').SIDEBAR_ANNO;
const QUERY_ANNO           = require('places-adapter').QUERY_ANNO;
const ALLBOOKMARKS_ANNO    = require('places-adapter').ALLBOOKMARKS_ANNO;

const MOBILEROOT_ANNO      = require('places-adapter').MOBILEROOT_ANNO
const MOBILE_ANNO          = require('places-adapter').MOBILE_ANNO;
const EXCLUDEBACKUP_ANNO   = require('places-adapter').EXCLUDEBACKUP_ANNO;
const ORGANIZERQUERY_ANNO  = require('places-adapter').ORGANIZERQUERY_ANNO;

// TODO:
//  - Try to get all these SQL strings out of here

const FILTER_BLACKLISTED_BOOKMARKS =
    "AND (places.url IS NULL OR (" +
    "(places.url NOT LIKE 'about:%') AND " +
    "(places.url NOT LIKE 'https://addons.mozilla.org/%/mobile%')" +
    "))";

const BOOKMARK_QUERY_SELECT =
    "SELECT places.url AS p_url," +
    " bookmark.guid AS b_guid," +
    " bookmark.id AS b_id," +
    " bookmark.title AS b_title," +
    " bookmark.type AS b_type," +
    " bookmark.parent AS b_parent," +
    " bookmark.dateAdded AS b_added," +
    " bookmark.lastModified AS b_modified," +
    " bookmark.position AS b_position," +
    " keyword.keyword AS k_keyword," +
    " anno.name AS a_name, " +
    " anno.content AS a_content, ";

const SYNCED_ANNOS = ["'"+DESCRIPTION_ANNO+"'",
                      "'"+SIDEBAR_ANNO+"'",
                      "'"+QUERY_ANNO+"'",
                      "'"+PlacesUtils.LMANNO_FEEDURI+"'",
                      "'"+PlacesUtils.LMANNO_SITEURI+"'"];

const BOOKMARK_QUERY_TRAILER =
    "FROM ((((moz_bookmarks AS bookmark " +
    " LEFT OUTER JOIN moz_keywords AS keyword "+
    " ON keyword.id = bookmark.keyword_id) " +
    " LEFT OUTER JOIN moz_places AS places " +
    " ON places.id = bookmark.fk) " +
    " LEFT OUTER JOIN moz_favicons AS favicon " +
    " ON places.favicon_id = favicon.id) " +
    " LEFT OUTER JOIN (moz_items_annos AS item_annos " +
    " LEFT OUTER JOIN moz_anno_attributes AS anno_attrs " +
    " ON item_annos.anno_attribute_id = anno_attrs.id " +
    " ) AS anno " +
    " ON anno.item_id = bookmark.id) " +
    // Bookmark folders don't have a places entry.
    // " WHERE (places.hidden IS NULL " +
    // " OR places.hidden <> 1) " +
    // FILTER_BLACKLISTED_BOOKMARKS +
    // This gives us a better chance of adding a folder before
    // adding its contents and hence avoiding extra iterations below.
    " WHERE anno.name IS NULL OR anno.name IN ("+SYNCED_ANNOS.join(',')+") " +
    "ORDER BY bookmark.id";

const BOOKMARK_QUERY =
    BOOKMARK_QUERY_SELECT +
    //" favicon.data AS f_data," +
    " favicon.mime_type AS f_mime_type," +
    " favicon.url AS f_url," +
    " favicon.guid AS f_guid " +
    BOOKMARK_QUERY_TRAILER;

// row speaks mozIStorageRow
// results should be in the form of { }
function processReadBookmarksQueryRow(row, results) {
  var oneResult,
      localId = row.getResultByName('b_id'),
      // Use BookmarksGuidService.specialGUIDForId to get the special guid for the id,
      // otherwise, use the row result.
      guid = BookmarksGuidService.specialGUIDForId(localId) || row.getResultByName('b_guid');
  // See if we've already seen a record for this guid yet (this would happen if the item
  // has multiple annotations).
  oneResult = results[guid];
  if (!oneResult) {
    oneResult = {};
    oneResult.id = guid;
    oneResult.localId = localId;
    oneResult.localType = row.getResultByName('b_type');
    oneResult.bmkUri = row.getResultByName('p_url');
    oneResult.title = row.getResultByName('b_title');
    oneResult.localParentid = row.getResultByName('b_parent');
    oneResult.dateAdded = row.getResultByName('b_added');
    oneResult.lastModified = row.getResultByName('b_modified');
    oneResult.pos = row.getResultByName('b_position');
    oneResult.keyword = row.getResultByName('k_keyword');
    oneResult.annos = [];
  }
  let annoName = row.getResultByName('a_name');
  if (annoName) {
    let anno = { name: annoName, content: row.getResultByName('a_content') };
    oneResult.annos.push(anno);
  }
  // We shouldn't sync the records corresponding to the special Places records,
  // so don't include them in the results.
  //if (!BookmarksGuidService.isSpecialGUID(guid)) {
    // If this guid isn't special, then cache the id -> guid mapping with the BookmarksGuidService
  BookmarksGuidService.cacheGuidForLocalId(guid, localId);
  results[guid] = oneResult;
    // // if result's parent is the tags folder, then put it in the tag map
    // if (false && oneResult.localParent === kSpecialIds.tags) { // TODO fix this
    //   results.tagMap[guid] = oneResult;
    // } else { // otherwise put it in the general item map

    // }
  //}
};

// returns promise for all local bookmark items in JSON object format
function readLocalBookmarks() {
  var stmt = PlacesAdapter.createAsyncStatement(BOOKMARK_QUERY);
  // results param ends up as guid -> parsed item JSON object
  return PlacesAdapter.runAsyncQuery(stmt, processReadBookmarksQueryRow, {}).
  then(function (results) { // resolve local parent ids -> parent guids
    return group(Object.keys(results).map(function (guid) {
      let itemInfo = results[guid];
      return BookmarksGuidService.getGuidForLocalId(itemInfo.localParentid).
      then(function (parentGuid) {
        itemInfo.parentid = parentGuid;
        let bookmarksItem = BookmarksItem(itemInfo);
        BookmarksStore.setItemForId(bookmarksItem.id, bookmarksItem);
        return bookmarksItem;
      });
    })).
    then(function (bookmarkItems) {
      // filter out tag items
      return bookmarkItems.filter(
        function (item) { return !item.isTagItem(); }).map(
        function (item) { return item.toJSON(); }).concat(
        deletedGuids.map(function (guid) { return { id: guid, deleted: true }; } ));
    });
  }).then(null, function(error) {
    L.log("readLocalBookmarks error", error.message, error.stack);
  });
}

function topoSortFolders(folders) {
  var folderMap = {};
  var edges = [];
  folders.forEach(function (folder) {
    edges.push([ folder.parentid, folder.id ]);
    folderMap[folder.id] = folder;
  });
  return topoSort.tsort(edges).map(function (folderId) {
    return folderMap[folderId]
  }).filter(function (elt) { return elt != undefined; });
}

// TODO: be careful here of many updates to the same item for some reason
// if we are using delta sync
function applyItem(bookmarksItem) {
  // Cache item in the BookmarksStore
  BookmarksStore.setItemForId(bookmarksItem.id, bookmarksItem);
  // Don't process special guid records
  if (BookmarksGuidService.isSpecialGUID(bookmarksItem.id)) return resolve(null);
  return BookmarksItem.existsInPlaces(bookmarksItem.id).
  then(function (exists) {
    if (!exists && !bookmarksItem.deleted) {
      return bookmarksItem.createInPlaces();
    }
    else if (exists && bookmarksItem.deleted) {
      return bookmarksItem.deleteInPlaces();
    }
    else if (exists) {
      return bookmarksItem.updateInPlaces();
    }
  });
}

// Apply items in order
function applyItems(bookmarksItems) {
  let result = resolve(null);
  bookmarksItems.forEach(function (bookmarksItem) {
    result = result.then(function() { return applyItem(bookmarksItem); });
  });
  return result;
}

function updateLocalBookmarks(bookmarkItems) {
  // This will order the incoming items to update the folders first (in tree descending order)
  // and then update/add the bookmarks/separators/etc.
  let sortedFolders = topoSortFolders(bookmarkItems.filter(function (item) { return item.isFolder(); }));
  let notFolders = bookmarkItems.filter(function (item) { return !item.isFolder(); });
  return applyItems(sortedFolders.concat(notFolders)).
  then(function () {
    return ensureMobileQuery();
  });
}

function clearLocalBookmarks() {
  clearFolder(PlacesUtils.bookmarks.toolbarFolder);
  clearFolder(PlacesUtils.bookmarks.bookmarksMenuFolder);
  clearFolder(PlacesUtils.bookmarks.unfiledBookmarksFolder);
  clearFolder(PlacesUtils.bookmarks.tagsFolder);
  clearFolder(BookmarksGuidService.specialIdForGUID(BookmarksGuidService.specialGUIDs.mobile));
  BookmarksGuidService.clearCache();
  BookmarksStore.clear();
}

function clearFolder(folderId) {
  PlacesUtils.bookmarks.removeFolderChildren(folderId);
}

// This makes sure the special mobile query shows up under "All Bookmarks" in the UI
// so you can view your mobile bookmarks on desktop.
function ensureMobileQuery() {
  let find = function (val)
    PlacesUtils.annotations.getItemsWithAnnotation(ORGANIZERQUERY_ANNO, {}).filter(
      function (id) PlacesUtils.annotations.getItemAnnotation(id, ORGANIZERQUERY_ANNO) == val
    );

  // Don't continue if the Library isn't ready
  let all = find(ALLBOOKMARKS_ANNO);
  if (all.length == 0)
    return;

  let mobile = find(MOBILE_ANNO);
  let mobileLocalId = BookmarksGuidService.specialIdForGUID(BookmarksGuidService.specialGUIDs.mobile);
  let queryURI = Utils.makeURI("place:folder=" + mobileLocalId);
  let title = "Mobile";

  // Don't add OR remove the mobile bookmarks if there's nothing.
  if (PlacesUtils.bookmarks.getIdForItemAt(mobileLocalId, 0) === -1) {
    if (mobile.length != 0)
      PlacesUtils.bookmarks.removeItem(mobile[0]);
  }
  // Add the mobile bookmarks query if it doesn't exist
  else if (mobile.length == 0) {
    let query = PlacesUtils.bookmarks.insertBookmark(all[0], queryURI, -1, title);
    PlacesUtils.annotations.setItemAnnotation(query, ORGANIZERQUERY_ANNO, MOBILE_ANNO, 0,
                                PlacesUtils.annotations.EXPIRE_NEVER);
    PlacesUtils.annotations.setItemAnnotation(query, EXCLUDEBACKUP_ANNO, 1, 0,
                                PlacesUtils.annotations.EXPIRE_NEVER);
  }
  // Make sure the existing title is correct
  else if (PlacesUtils.bookmarks.getItemTitle(mobile[0]) != title) {
    PlacesUtils.bookmarks.setItemTitle(mobile[0], title);
  }
};

var tracking = false;
var dirty = false;
var deletedGuids = [];

function hasChanges() {
  return dirty;
}

function clearHasChanges() {
  dirty = false;
}


// An nsINavBookmarkObserver
var bookmarksObserver = {
  onBeginUpdateBatch: function() {},
  onEndUpdateBatch: function() {},
  onItemAdded: function (itemId, folder, index, itemType, uri, title, dateAdded, guid, parentGuid) {
    // ugly terrible hack to get around the fact that ALLBOOKMARKS may not be created yet
    // if the UNFILED_BOOKMARKS organizer query gets created, it's time to create the mobile organizer query
    // https://bugzilla.mozilla.org/show_bug.cgi?id=532936#c4
    if (uri && uri.spec === "place:folder=UNFILED_BOOKMARKS") {
      ensureMobileQuery();
    }
    if (tracking) {
      dirty = true;
    }
    //L.log("Item added", itemId, folder, index, itemType, uri.spec, title, dateAdded, guid, parentGuid);
  },
  onBeforeItemRemoved: function() {},
  onItemRemoved: function(itemId, parentId, index, type, uri, guid, parentGuid) {
    if (tracking) {
      dirty = true;
      deletedGuids.push(guid);
    }
    //L.log("Item removed", itemId, parentId, index, type, uri.spec, guid, parentGuid);
  },
  onItemChanged: function(aBookmarkId, aProperty, aIsAnnotationProperty, aValue, lastModified, itemType, parentId, guid, parentGuid) {
    //L.log("Item changed", aBookmarkId, aProperty, aIsAnnotationProperty, aValue, lastModified, itemType, parentId, guid, parentGuid);
    if (tracking) {
      dirty = true;
    }
  },
  onItemVisited: function(aBookmarkId, aVisitID, time) {},
  onItemMoved: function(itemId, oldParent, oldIndex, newParent, newIndex, itemType, guid, oldParentGuid, newParentGuid) {
    if (tracking) {
      dirty = true;
    }
    //L.log("Item moved", itemId, oldParent, oldIndex, newParent, newIndex, itemType, guid, oldParentGuid, newParentGuid);
  },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsINavBookmarkObserver])
};

PlacesUtils.bookmarks.addObserver(bookmarksObserver, false);

function startTracking() {
  tracking = true;
}

function stopTracking() {
  //PlacesUtils.bookmarks.removeObserver(bookmarksObserver);
  tracking = false;
}

module.exports = {
  updateLocalBookmarks: updateLocalBookmarks,
  readLocalBookmarks: readLocalBookmarks,
  clearLocalBookmarks: clearLocalBookmarks,
  startTracking: startTracking,
  stopTracking: stopTracking,
  hasChanges: hasChanges,
  clearHasChanges: clearHasChanges
};
