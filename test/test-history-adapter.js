const { Cc, Ci, Cu, CC } = require("chrome");
const HistoryAdapter = require('history-adapter');
const TEST_HISTORY_DATA = require('data').TEST_HISTORY_DATA;
const _ = require('underscore');
const L = require('logger');


exports['test read local history'] = function (assert, done) {
  HistoryAdapter.read().
  then(function (results) {
    L.log("History results", JSON.stringify(results));
    assert.ok(true);
    done();
  }).
  then(null, function (err) {
    L.log("Error", err);
  });
}

exports['test update local history'] = function (assert, done) {
  HistoryAdapter.update(TEST_HISTORY_DATA).
  then(function (results) {
    L.log("History update results", results);
    assert.ok(true);
    done();
  }).
  then(null, function (err) {
    L.log("Error in calling HistoryAdapter.update", err.message || err);
  });
}



require("sdk/test").run(exports);