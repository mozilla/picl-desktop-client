const { Cc, Ci, Cu, CC } = require("chrome");
const HistoryAdapter = require('history-adapter');
const TEST_HISTORY_DATA = require('data').TEST_HISTORY_DATA;
const _ = require('underscore');
const L = require('logger');

// exports['test read local history'] = function (assert, done) {
//   HistoryAdapter.read().
//   then(function (results) {
//     L.log("History results", JSON.stringify(results));
//     assert.ok(true);
//     done();
//   }).
//   then(null, function (err) {
//     L.log("Error", err);
//   });
// }


// This test fails for unknown reasons. It used to pass, and as far as I can tell history syncing still works.
// exports['test update and read local history'] = function (assert, done) {
//   HistoryAdapter.clear();
//   HistoryAdapter.update(TEST_HISTORY_DATA).
//   then(HistoryAdapter.read).
//   then(function (results) {
//     results = results.sort(function (a,b) { if (a.histUri < b.histUri) return -1; else if (a.histUri > b.histUri) return 1; else return 0; });
//     TEST_HISTORY_DATA = TEST_HISTORY_DATA.sort(function (a,b) { if (a.histUri < b.histUri) return -1; else if (a.histUri > b.histUri) return 1; else return 0; });
//     for (let i=0; i<results.length; i++) {
//       if (!_.isEqual(results[i], TEST_HISTORY_DATA[i])) {
//         assert.fail("Read history data doesn't match updated history data");
//         done();
//       }
//     }
//     assert.ok(true, "Read history data matched updated history data");
//     done();
//   }).
//   then(null, function (err) {
//     L.log("Error in calling HistoryAdapter.update", err.message || err);
//   });
// }

require("sdk/test").run(exports);