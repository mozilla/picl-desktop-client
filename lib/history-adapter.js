const {Cc, Ci, Cu} = require("chrome");
const { defer, resolve, promised } = require('sdk/core/promise');
const group = function (array) { return promised(Array).apply(null, array); };
const L = require('logger');
const PlacesAdapter = require('places-adapter');

const MAX_RESULTS = 1000;

const ALL_PLACES_QUERY =
      "SELECT guid, url " +
      "FROM moz_places " +
      "WHERE last_visit_date > :cutoff_date " +
      "ORDER BY frecency DESC " +
      "LIMIT " + MAX_RESULTS;

// TODO: do this in one query with a join?
const VISITS_QUERY =
      "SELECT visit_type type, visit_date date " +
      "FROM moz_historyvisits " +
      "WHERE place_id = (SELECT id FROM moz_places WHERE url = :url) " +
      "ORDER BY date DESC LIMIT 10";

function update(places) {

}

function processReadPlacesQueryRow(row, results) {
  var oneResult,
      guid = row.getResultByName('guid'),
      url = row.getResultByName('url');
  results[guid] = { histUri: url };
}

function read() {
  var stmt = PlacesAdapter.createAsyncStatement(ALL_PLACES_QUERY);
  var params = stmt.newBindingParamsArray();
  let bp = params.newBindingParams();
  // up to 30 days ago
  var thirtyDaysAgo = (Date.now() - 2592000000) * 1000;
  bp.bindByName('cutoff_date', thirtyDaysAgo);
  params.addParams(bp);
  stmt.bindParameters(params);
  return PlacesAdapter.runAsyncQuery(stmt, processReadPlacesQueryRow, {}).
  then(function (results) {
    // get visits for each places item or rewrite the above query into a join?
    return results;
  });
}

function clear() {

}

var tracking = false;
var dirty = false;
var deletedGuids = [];

function hasChanges() {
  return dirty;
}

function clearHasChanges() {
  dirty = false;
}

function getDeletedGuids() {
  return deletedGuids;
}

function startTracking() {
  tracking = true;
}

function stopTracking() {
  tracking = false;
}

function teardown() {

}

module.exports = {
  update: update,
  read: read,
  clear: clear,
  startTracking: startTracking,
  stopTracking: stopTracking,
  hasChanges: hasChanges,
  clearHasChanges: clearHasChanges,
  getDeletedGuids: getDeletedGuids,
  teardown: teardown
};
