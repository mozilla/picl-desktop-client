const { Cc, Ci, Cu, CC } = require("chrome");
const HistoryAdapter = require('history-adapter');
const _ = require('underscore');
const L = require('logger');


exports['test read local history'] = function (assert, done) {
  HistoryAdapter.read().
  then(function (results) {
    L.log("History results", results);
    assert.ok(true);
    done();
  }).
  then(null, function (err) {
    L.log("Error", err);
  });
}

require("sdk/test").run(exports);