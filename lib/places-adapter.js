/*
* Aync adapter to Places DB
*/

const {Cc, Ci, Cu} = require("chrome");
const { defer } = require('sdk/core/promise');
const L = require('logger');

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

function getDB() {
  // the database
  let file = FileUtils.getFile("ProfD", ["places.sqlite"]);
  return Services.storage.openDatabase(file);
}

var db = getDB();

/**
 * Runs a db statement asynchronously.
 *
 * @param stmt
 *        A prepared statement created with createAsyncStatement
 * @param processRow
 *        A function of type function(row, results) {} that will process a row result
 *        of the query.
 * @param results
 *        An out-param to put the processed row results. The structure of this object is
 *        up to the caller and should be manipulated by processRow.
 * @returns a promise for results object after the query has finished.
 */
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

function createAsyncStatement(sql) {
  return db.createAsyncStatement(sql);
}


module.exports =  {
  runAsyncQuery: runAsyncQuery,
  createAsyncStatement: createAsyncStatement
};



