/*
* Aync adapter to Places DB
*/

const {Cc, Ci, Cu} = require("chrome");
const { defer } = require('sdk/core/promise');
const L = require('logger');

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

const DESCRIPTION_ANNO     = "bookmarkProperties/description";
const SIDEBAR_ANNO         = "bookmarkProperties/loadInSidebar";

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

const INTERESTING_ANNOS = ["'bookmarkProperties/description'",
                           "'bookmarkProperties/loadInSidebar'",
                           "'Places/SmartBookmark'",
                           "'livemark/feedURI'",
                           "'livemark/siteURI'"];

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
    " WHERE anno.name IS NULL OR anno.name IN ("+INTERESTING_ANNOS.join(',')+") " +
    "ORDER BY bookmark.id";

const BOOKMARK_QUERY =
    BOOKMARK_QUERY_SELECT +
    //" favicon.data AS f_data," +
    " favicon.mime_type AS f_mime_type," +
    " favicon.url AS f_url," +
    " favicon.guid AS f_guid " +
    BOOKMARK_QUERY_TRAILER;

const SPECIAL_FOLDER_IDS =
   [ PlacesUtils.bookmarks.bookmarksMenuFolder, // 2
     PlacesUtils.bookmarks.placesRoot, // 1
     PlacesUtils.bookmarks.tagsFolder, // 4
     PlacesUtils.bookmarks.toolbarFolder, // 3
     PlacesUtils.bookmarks.unfiledBookmarksFolder ]; // 5

var db = getDB();

function getDB() {
  // the database
  let file = FileUtils.getFile("ProfD", ["places.sqlite"]);
  return Services.storage.openDatabase(file);
}

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

function readRawAllBookmarks() {
  const bms = PlacesUtils.bookmarks;
  var processRow = function(row, results) {
    var oneResult,
        id = row.getResultByName('b_id'),
        guid = kSpecialIds.specialGUIDForId(id) || row.getResultByName('b_guid');
    oneResult = results.itemMap[guid];
    if (!oneResult) {
      oneResult = {};
      //if (SPECIAL_FOLDER_IDS.indexOf(itemId) > -1) return null;
      oneResult.id = id;
      oneResult.type = row.getResultByName('b_type');
      oneResult.url = row.getResultByName('p_url');
      oneResult.title = row.getResultByName('b_title');
      oneResult.parent = row.getResultByName('b_parent');
      oneResult.dateAdded = row.getResultByName('b_added');
      oneResult.lastModified = row.getResultByName('b_modified');
      oneResult.position = row.getResultByName('b_position');
      oneResult.keyword = row.getResultByName('k_keyword');
      oneResult.annos = [];
    }
    let annoName = row.getResultByName('a_name');
    if (annoName) {
      let anno = { name: annoName, content: row.getResultByName('a_content') };
      oneResult.annos.push(anno);
    }
    if (!kSpecialIds.isSpecialGUID(guid)) {
      results.itemMap[guid] = oneResult;
      results.idToGUIDMap[oneResult.id] = guid;
    }
  };
  var stmt = db.createAsyncStatement(BOOKMARK_QUERY);
  return runAsyncQuery(stmt, processRow, { itemMap: {}, idToGUIDMap: {} });
}

function isLivemark(item) {
  return getAnnoForItem(PlacesUtils.LMANNO_FEEDURI, item) !== null;
}

function getAnnoForItem(annoName, item) {
  var anno = item.annos.filter(function (anno) { return anno.name === annoName; })[0];
  if (anno) return anno.content;
  else return null;
}

function getDescription(item) {
  return getAnnoForItem(DESCRIPTION_ANNO, item);
}

function getLoadInSidebar(item) {
  return getAnnoForItem(SIDEBAR_ANNO, item) !== null;
}

function getFeedUri(item) {
  return getAnnoForItem(PlacesUtils.LMANNO_FEEDURI, item);
}

function getSiteUri(item) {
  return getAnnoForItem(PlacesUtils.LMANNO_SITEURI, item);
}


function getPrettyTypeForNativeType(item) {
  switch (item.type) {
    case (PlacesUtils.bookmarks.TYPE_FOLDER):
      if (isLivemark(item)) return "livemark";
      else return "folder";
    case (PlacesUtils.bookmarks.TYPE_BOOKMARK):
      if (item.url.indexOf("place:") == 0) return "query";
      else return "bookmark";
    case (PlacesUtils.bookmarks.TYPE_SEPARATOR):
      return "separator";
    default:
      return "unknown";
  }
}

function readAllBookmarks() {
  return readRawAllBookmarks().
  then(function (results) {
    let idToGUIDMap = results.idToGUIDMap,
        itemMap = results.itemMap;
    var items = [];
    Object.keys(itemMap).forEach(function (guid) {
      let item = itemMap[guid],
          localId = item.id,
          description = getDescription(item),
          loadInSidebar = getLoadInSidebar(item);
      item.id = guid;
      item.parent = kSpecialIds.specialGUIDForId(item.parent) || idToGUIDMap[item.parent];
      if (description) item.description = description;
      if (loadInSidebar) item.loadInSidebar = true;
      if (isLivemark(item)) {
        item.feedUrl = getFeedUri(item);
        item.siteUrl = getSiteUri(item);
      }
      item.prettyType = getPrettyTypeForNativeType(item);
      delete item.annos;
      items.push(item);
    });
    L.log("items", items);
    return items;
  }).then(null, function(error) {
    L.log("error", error.message);
  });
}

function runAsyncQuery(stmt, processRow, results) {
  var deferred = defer();
  stmt.executeAsync({
    handleResult: function(aResultSet) {
      for (let row = aResultSet.getNextRow();
           row;
           row = aResultSet.getNextRow()) {
        processRow(row, results);
      }
    },

    handleError: function(aError) {
      deferred.reject(aError);
    },

    handleCompletion: function(aReason) {
      if (aReason != Ci.mozIStorageStatementCallback.REASON_FINISHED)
        deferred.reject(aReason);
      else
        deferred.resolve(results);
    }
  });
  return deferred.promise;
}

exports.readAllBookmarks = readAllBookmarks;


