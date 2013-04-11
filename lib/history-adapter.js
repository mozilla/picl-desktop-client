const {Cc, Ci, Cu} = require("chrome");
const { defer, resolve, promised } = require('sdk/core/promise');
const group = function (array) { return promised(Array).apply(null, array); };
const L = require('logger');
const PlacesAdapter = require('places-adapter');
const ios = Cc["@mozilla.org/network/io-service;1"]
              .getService(Ci.nsIIOService);
const asyncHistory = Cc["@mozilla.org/browser/history;1"]
                        .getService(Ci.mozIAsyncHistory);

Cu.import("resource://gre/modules/PlacesUtils.jsm", this);
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

const MAX_RESULTS = 1000;

const ALL_PLACES_QUERY =
      "SELECT guid, url, id as localId, title " +
      "FROM moz_places " +
      "WHERE last_visit_date > :cutoff_date " +
      "ORDER BY frecency DESC " +
      "LIMIT " + MAX_RESULTS;
var ALL_PLACES_STMT = PlacesAdapter.createAsyncStatement(ALL_PLACES_QUERY);

const VISITS_QUERY =
      "SELECT visit_type type, visit_date date " +
      "FROM moz_historyvisits " +
      "WHERE place_id = (SELECT id FROM moz_places WHERE url = :url) " +
      "ORDER BY date DESC LIMIT 10";
var VISITS_STMT = PlacesAdapter.createAsyncStatement(VISITS_QUERY);

function HistoryItem(historyInfo) {
  let historyItem = Object.create(HistoryItem.prototype);
  Object.keys(historyInfo || {}).forEach(function(key) {
    historyItem[key] = historyInfo[key];
  });
  if (!historyItem.uri) historyItem.uri = historyItem.histUri;
  return historyItem;
}

HistoryItem.prototype.toJSON = function() {
  return {
    id: this.id,
    histUri: this.uri || "",
    title: this.title || "",
    visits: this.visits || []
  };
}

HistoryItem.prototype.toPlaceInfo = function() {
  let placeInfo = {},
      self = this;
  try {
    placeInfo.uri = ios.newURI(this.uri, null, null);
  } catch(e) {
    L.log("Error creating uri in toPlaceInfo", this.uri);
    return { visits: [] };
  }
  if (!placeInfo.uri) {
    throw "Invalid URI in history historyItem";
  }
  placeInfo.guid = this.id;
  placeInfo.title = this.title;
  placeInfo.visits = [];
  return getVisitsForUri(this.uri).
  then(function (localVisits) {
    let i, k;
    for (i = 0; i < localVisits.length; i++) {
      localVisits[i] = localVisits[i].date + "," + localVisits[i].type;
    }

    // Walk through the visits, make sure we have sound data, and eliminate
    // dupes. The latter is done by rewriting the array in-place.
    for (i = 0, k = 0; i < self.visits.length; i++) {
      let visit = self.visits[i];

      if (!visit.date || typeof visit.date != "number") {
        L.log("Encountered record with invalid visit date: " + visit.date);
        throw "Visit has no date!";
      }

      if (!visit.type || !(visit.type >= PlacesUtils.history.TRANSITION_LINK &&
                           visit.type <= PlacesUtils.history.TRANSITION_FRAMED_LINK)) {
        L.log("Encountered record with invalid visit type: " + visit.type);
        throw "Invalid visit type!";
      }

      // Dates need to be integers.
      let date = Math.round(visit.date);

      if (localVisits.indexOf(visit.date + "," + visit.type) != -1) {
        // Visit is a dupe, don't increment 'k' so the element will be
        // overwritten.
        continue;
      }
      placeInfo.visits[k] = { visitDate: visit.date, transitionType: visit.type };
      k += 1;
    }
    return placeInfo;
  });
}

function update(historyItems) {
  return group(historyItems.map(function (historyInfo) {
    //L.log("handling historyInfo", historyInfo);
    return HistoryItem(historyInfo).toPlaceInfo();
  })).
  then(function (placeInfos) {
    return placeInfos.filter(function (placeInfo) {
      return placeInfo.visits.length > 0;
    });
  }).
  then(function (placeInfos) {
    let deferred = defer(),
        failed = [];
    let updatePlacesCallback = {
      handleResult: function handleResult() {},
      handleError: function handleError(resultCode, placeInfo) {
        L.log("encountered an error in updatePlaces", placeInfo, resultCode);
        failed.push(placeInfo.guid);
      },
      handleCompletion: function () {
        if (failed.length > 0) deferred.reject(failed);
        else deferred.resolve();
      }
    };
    if (placeInfos.length > 0) {
      asyncHistory.updatePlaces(placeInfos, updatePlacesCallback);
    }
    else {
      deferred.resolve();
    }
    return deferred.promise;
  });
}

function processReadPlacesQueryRow(row, results) {
  var oneResult,
      guid = row.getResultByName('guid'),
      url = row.getResultByName('url'),
      localId = row.getResultByName('localId'),
      title = row.getResultByName('title');
  results.push(HistoryItem({ uri: url, localId: localId, id: guid, title: title }));
}

function getVisitsForUri(uri) {
  var stmt = VISITS_STMT;
  var params = stmt.newBindingParamsArray();
  let bp = params.newBindingParams();
  bp.bindByName('url', uri);
  params.addParams(bp);
  stmt.bindParameters(params);
  return PlacesAdapter.runAsyncQuery(stmt, function (row, results) {
    results.push({ date: row.getResultByName('date'), type: row.getResultByName('type') });
  }, []);
}

function read() {
  var stmt = ALL_PLACES_STMT;
  var params = stmt.newBindingParamsArray();
  let bp = params.newBindingParams();
  // up to 30 days ago
  var thirtyDaysAgo = (Date.now() - 2592000000) * 1000;
  bp.bindByName('cutoff_date', thirtyDaysAgo);
  params.addParams(bp);
  stmt.bindParameters(params);
  return PlacesAdapter.runAsyncQuery(stmt, processReadPlacesQueryRow, []).
  then(function (places) {
    return group(places.map(function (place) {
      return getVisitsForUri(place.uri).then(function (visits) { place.visits = visits; return place.toJSON(); });
    }));
  }).
  then(function (places) {
    return places.concat(deletedGuids.map(function (guid) { return { id: guid, deleted: true }; } ));
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
  PlacesUtils.history.removeObserver(historyObserver);
}

var historyObserver = {
  QueryInterface: XPCOMUtils.generateQI([
    Ci.nsINavHistoryObserver,
    Ci.nsISupportsWeakReference
  ]),

  onDeleteAffectsGUID: function (uri, guid, reason, source, increment) {
  },

  onDeleteVisits: function (uri, visitTime, guid, reason) {
  },

  onDeleteURI: function (uri, guid, reason) {
    if (tracking) {
      dirty = true;
      deletedGuids.push(guid);
    }
  },

  onVisit: function (uri, vid, time, session, referrer, trans, guid) {
    if (tracking) {
      dirty = true;
    }
  },

  onClearHistory: function () {
  },

  onBeginUpdateBatch: function () {},
  onEndUpdateBatch: function () {},
  onPageChanged: function () {},
  onTitleChanged: function () {},
  onBeforeDeleteURI: function () {},
};

PlacesUtils.history.addObserver(historyObserver, true);

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
