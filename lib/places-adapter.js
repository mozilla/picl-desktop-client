/*
* Aync adapter to Places DB
*/

const {Cc, Ci, Cu} = require("chrome");
const { defer } = require('sdk/core/promise');
const L = require('logger');

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm", this);


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
    " keyword.keyword AS k_keyword,";

const BOOKMARK_QUERY_TRAILER =
    "FROM (((moz_bookmarks AS bookmark " +
    " LEFT OUTER JOIN moz_keywords AS keyword "+
    " ON keyword.id = bookmark.keyword_id) " +
    " LEFT OUTER JOIN moz_places AS places " +
    " ON places.id = bookmark.fk) " +
    " LEFT OUTER JOIN moz_favicons AS favicon " +
    " ON places.favicon_id = favicon.id) " +
    // Bookmark folders don't have a places entry.
    "WHERE (places.hidden IS NULL " +
    " OR places.hidden <> 1) " +
    FILTER_BLACKLISTED_BOOKMARKS +
    // This gives us a better chance of adding a folder before
    // adding its contents and hence avoiding extra iterations below.
    "ORDER BY bookmark.id";

const SIMPLE_BOOKMARK_QUERY_SELECT =
   "SELECT " +
    " bookmark.guid AS b_guid," +
    " bookmark.id AS b_id," +
    " bookmark.title AS b_title," +
    " bookmark.type AS b_type," +
    " bookmark.parent AS b_parent," +
    " bookmark.dateAdded AS b_added," +
    " bookmark.lastModified AS b_modified," +
    " bookmark.position AS b_position" +
    " FROM moz_bookmarks AS bookmark";

// TODO: description, tags

const BOOKMARK_QUERY_GUID =
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


    // // Helper constants. They enumerate the different types of bookmarks we
    // // have to deal with, and we should have as many types as BrowserContract
    // // knows about, though the actual values don't necessarily match up. We do
    // // the translation between both values elsewhere.
    // // The first 3 correspond to real types that exist in places, and match
    // // values with the places types.
    // private static final int PLACES_TYPE_BOOKMARK = 1;
    // private static final int PLACES_TYPE_FOLDER = 2;
    // private static final int PLACES_TYPE_SEPARATOR = 3;
    // // These aren't used in the type field in places, but we use them
    // // internally because we need to distinguish them from the above types.
    // private static final int PLACES_TYPE_LIVEMARK = 4;
    // private static final int PLACES_TYPE_QUERY = 5;

function readAllBookmarks() {
  const bms = PlacesUtils.bookmarks;
  var processRow = function(row) {
    let oneResult = {},
        type = row.getResultByName('b_type'),
        itemId = row.getResultByName('b_id');
    if (SPECIAL_FOLDER_IDS.indexOf(itemId) > -1) return null;
    oneResult.id = itemId;
    switch (type) {
      case (bms.TYPE_FOLDER):
        if (PlacesUtils.annotations
                       .itemHasAnnotation(itemId, PlacesUtils.LMANNO_FEEDURI)) {
          oneResult.recordType = "livemark";
        }
        else oneResult.recordType = "folder";
        break;
      case (bms.TYPE_BOOKMARK):
        let bmkUri = bms.getBookmarkURI(itemId).spec;
        oneResult.url = bmkUri;
        if (bmkUri.indexOf("place:") == 0) oneResult.recordType = "query";
        else oneResult.recordType = "bookmark";
        break;
      case (bms.TYPE_SEPARATOR):
        oneResult.recordType = "separator";
        break;
      default:
        break;
    }
    //url = PlacesUtils.bookmarks.getBookmarkURI(oneResult.id).spec;
    oneResult.guid =  row.getResultByName('b_guid');
    oneResult.title = row.getResultByName('b_title');
    oneResult.type = row.getResultByName('b_type');
    oneResult.parent = row.getResultByName('b_parent');
    oneResult.dateAdded = row.getResultByName('b_added');
    oneResult.lastModified = row.getResultByName('b_modified');
    oneResult.position = row.getResultByName('b_position');
    L.log("creating", oneResult);
    return oneResult;
  };
  return runAsyncQuery(SIMPLE_BOOKMARK_QUERY_SELECT, processRow);
}

        //oneResult.keyword = row.getResultByName('k_keyword');

    // "SELECT places.url AS p_url," +
    // " bookmark.guid AS b_guid," +
    // " bookmark.id AS b_id," +
    // " bookmark.title AS b_title," +
    // " bookmark.type AS b_type," +
    // " bookmark.parent AS b_parent," +
    // " bookmark.dateAdded AS b_added," +
    // " bookmark.lastModified AS b_modified," +
    // " bookmark.position AS b_position," +
    // " keyword.keyword AS k_keyword,";

        // L.log("oneResult", oneResult);
        // for (var i=0; i<row.numEntries; i++) {
        //   L.log("kv", row.getResultByIndex(i));
        //   oneResult.push(row.getResultByIndex(i));
        // }


function runAsyncQuery(sql, processRow) {
  var deferred = defer();
  var results = [];
  var stmt = db.createAsyncStatement(sql);
  stmt.executeAsync({
    handleResult: function(aResultSet) {
      for (let row = aResultSet.getNextRow();
           row;
           row = aResultSet.getNextRow()) {
        let result = processRow(row);
        if (result) results.push(result);
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

exports.DB_REASON_FINISHED = Ci.mozIStorageStatementCallback.REASON_FINISHED;
exports.readAllBookmarks = readAllBookmarks;


