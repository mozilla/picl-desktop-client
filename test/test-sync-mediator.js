const { Cc, Ci, Cu, CC } = require("chrome");
const BookmarksAdapter = require('bookmarks-adapter');
const PasswordsAdapter = require('passwords-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const { defer, resolve, promised } = require('sdk/core/promise');
const SyncMediator = require('sync-mediator');
const KeyServerClient = require("key-server-client");
const _ = require('underscore');
const L = require('logger');

Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

const TEST_BOOKMARK_DATA =
  [{"id":"places","parentName":"","localType":2,"pos":0,"title":"","children":["menu","toolbar","tags","unfiled"],"type":"folder"},{"id":"menu","parentid":"places","parentName":"","localType":2,"pos":0,"title":"Bookmarks Menu","children":["x-MMaZ2iIm2E","Rpt_3c8ALtPX","a8MBO_X-SG-l","S0cKErf89YfK"],"type":"folder"},{"id":"toolbar","parentid":"places","parentName":"","localType":2,"pos":1,"title":"Bookmarks Toolbar","description":"Add bookmarks to this folder to see them displayed on the Bookmarks Toolbar","children":["1pzDy639sJ8D","A3ghuMeT2pv1","KDj8LPovbHgS","lC72BpPJGVpZ","ARzQFS-X6fEY","1ZLA1XdD0_mT","pWIOD4lM7iEx"],"type":"folder"},{"id":"tags","parentid":"places","parentName":"","localType":2,"pos":2,"title":"Tags","children":["Uvusw71z44gL","RU748sMQm6Xk","BLSDxnCTXdYy","2wX-3v6wakux"],"type":"folder"},{"id":"unfiled","parentid":"places","parentName":"","localType":2,"pos":3,"title":"Unsorted Bookmarks","children":["4ZYFoWVc5qvD"],"type":"folder"},{"id":"RU748sMQm6Xk","parentid":"tags","parentName":"Tags","localType":2,"pos":1,"title":"tagFoo2","children":["k_rNIiP1HGPC"],"type":"folder"},{"id":"2wX-3v6wakux","parentid":"tags","parentName":"Tags","localType":2,"pos":3,"title":"tagBar2","children":["LsZ3D-4rhcVg"],"type":"folder"},{"id":"BLSDxnCTXdYy","parentid":"tags","parentName":"Tags","localType":2,"pos":2,"title":"tagFoo1","children":["rarSfAbNk9aX"],"type":"folder"},{"id":"Uvusw71z44gL","parentid":"tags","parentName":"Tags","localType":2,"pos":0,"title":"tagBar","description":"dqweqweqweqwe","children":["OZVQ1YK8ZHx6"],"type":"folder"},{"id":"pWIOD4lM7iEx","parentid":"toolbar","parentName":"Bookmarks Toolbar","localType":2,"pos":6,"title":"testFolder","children":["oKiuvqke5BhO","1vrxrnNk3c3h"],"type":"folder"},{"id":"1vrxrnNk3c3h","parentid":"pWIOD4lM7iEx","parentName":"testFolder","localType":2,"pos":1,"title":"innerFolder","children":[],"type":"folder"},{"id":"S0cKErf89YfK","parentid":"menu","parentName":"Bookmarks Menu","localType":2,"pos":3,"title":"Mozilla Firefox","children":["Mzmp5k9gUAAW","KXT2uBHvIIyk","YrG6Cu1rGTvk","GmuNI1NZ8hRe","R6bkPmTfUyEi"],"type":"folder"},{"id":"Mzmp5k9gUAAW","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","localType":1,"pos":0,"title":"Help and Tutorials","bmkUri":"http://www.mozilla.com/en-US/firefox/help/","type":"bookmark"},{"id":"KXT2uBHvIIyk","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","localType":1,"pos":1,"title":"Customize Firefox","bmkUri":"http://www.mozilla.com/en-US/firefox/customize/","type":"bookmark"},{"id":"GmuNI1NZ8hRe","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","localType":1,"pos":3,"title":"Get Involved","bmkUri":"http://www.mozilla.com/en-US/firefox/community/","type":"bookmark"},{"id":"R6bkPmTfUyEi","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","localType":1,"pos":4,"title":"About Us","bmkUri":"http://www.mozilla.com/en-US/about/","type":"bookmark"},{"id":"1pzDy639sJ8D","parentid":"toolbar","parentName":"Bookmarks Toolbar","localType":1,"pos":0,"title":"Most Visited","bmkUri":"place:sort=8&maxResults=10","queryId":"MostVisited","folderName":"Most Visited","type":"query"},{"id":"x-MMaZ2iIm2E","parentid":"menu","parentName":"Bookmarks Menu","localType":1,"pos":0,"title":"Recently Bookmarked","bmkUri":"place:folder=BOOKMARKS_MENU&folder=UNFILED_BOOKMARKS&folder=TOOLBAR&queryType=1&sort=12&maxResults=10&excludeQueries=1","queryId":"RecentlyBookmarked","folderName":"Recently Bookmarked","type":"query"},{"id":"Rpt_3c8ALtPX","parentid":"menu","parentName":"Bookmarks Menu","localType":1,"pos":1,"title":"Recent Tags","bmkUri":"place:type=6&sort=14&maxResults=10","queryId":"RecentTags","folderName":"Recent Tags","type":"query"},{"id":"a8MBO_X-SG-l","parentid":"menu","parentName":"Bookmarks Menu","localType":3,"pos":2,"type":"separator"},{"id":"A3ghuMeT2pv1","parentid":"toolbar","parentName":"Bookmarks Toolbar","localType":1,"pos":1,"title":"Yahoo!","bmkUri":"http://www.yahoo.com/","keyword":"yahoo","type":"bookmark","tags":"tagBar, tagFoo1"},{"id":"KDj8LPovbHgS","parentid":"toolbar","parentName":"Bookmarks Toolbar","localType":1,"pos":2,"title":"Google","bmkUri":"https://www.google.com/","loadInSidebar":true,"type":"bookmark","tags":"tagFoo2"},{"id":"oKiuvqke5BhO","parentid":"pWIOD4lM7iEx","parentName":"testFolder","localType":1,"pos":0,"title":"Hulu.comff","bmkUri":"http://www.hulu.com/","type":"bookmark","tags":"tagBar2"},{"id":"lC72BpPJGVpZ","parentid":"toolbar","parentName":"Bookmarks Toolbar","localType":1,"pos":3,"title":"CNN.com","bmkUri":"http://www.cnn.com/","type":"bookmark"},{"id":"ARzQFS-X6fEY","parentid":"toolbar","parentName":"Bookmarks Toolbar","localType":1,"pos":4,"title":"Facebook","bmkUri":"https://www.facebook.com/","type":"bookmark"},{"id":"1ZLA1XdD0_mT","parentid":"toolbar","parentName":"Bookmarks Toolbar","localType":2,"pos":5,"title":"Lifehacker","feedUri":"http://feeds.gawker.com/lifehacker/full","siteUri":"http://lifehacker.com/","type":"livemark"},{"id":"4ZYFoWVc5qvD","parentid":"unfiled","parentName":"Unsorted Bookmarks","localType":1,"pos":0,"title":"Bank of America | Home | Personal","bmkUri":"https://www.bankofamerica.com/","description":"Welcome to Bank of America, the nation's leading financial institution and home for all of your personal financial needs.","type":"bookmark"},{"id":"OZVQ1YK8ZHx6","parentid":"Uvusw71z44gL","parentName":"tagBar","localType":1,"pos":0,"bmkUri":"http://www.yahoo.com/","type":"bookmark","tags":"tagBar, tagFoo1"},{"id":"rarSfAbNk9aX","parentid":"BLSDxnCTXdYy","parentName":"tagFoo1","localType":1,"pos":0,"bmkUri":"http://www.yahoo.com/","type":"bookmark","tags":"tagBar, tagFoo1"},{"id":"LsZ3D-4rhcVg","parentid":"2wX-3v6wakux","parentName":"tagBar2","localType":1,"pos":0,"bmkUri":"http://www.hulu.com/","type":"bookmark","tags":"tagBar2"},{"id":"k_rNIiP1HGPC","parentid":"RU748sMQm6Xk","parentName":"tagFoo2","localType":1,"pos":0,"bmkUri":"https://www.google.com/","type":"bookmark","tags":"tagFoo2"},{"id":"YrG6Cu1rGTvk","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","localType":3,"pos":2,"type":"separator"}]

function generateTestEmail() {
  return "test+"+Math.floor((1+Math.random())*1000000)+"@test.com";
};

var client = new KeyServerClient();

function setupSyncMediator() {
  var deferred = defer();
  var email = generateTestEmail();
  function createUser(cb) {
    L.log("creating user");
    return client.createUser({
      email: email
    }).then(cb);
  }

  function getUser() {
    client.getUser({
      email: email
    }).then(function(result) {
      var user = { id: result.kA, token: result.kA };
      deferred.resolve(new SyncMediator(user));
    }, function(err) {
      L.log('error getting user, trying to create', err);
      // If the user doesn't exist, create and try again
      if (err.message == 'UnknownUser') {
        createUser(function() {
          getUser();
        });
      } else deferred.reject(err);
    });
  }
  getUser();
  return deferred.promise;
}


exports['test push and pull bookmarks'] = function (assert, done) {
  BookmarksAdapter.clearLocalBookmarks();
  PasswordsAdapter.clearLocalPasswords();
  let items = TEST_BOOKMARK_DATA.map(function (item) { return BookmarksItem(item); });
  let syncMediator;
  BookmarksAdapter.updateLocalBookmarks(items).
  then(setupSyncMediator).
  then(function (sm) {
    syncMediator = sm;
    return syncMediator.push();
  }).
  then(function () {
    return syncMediator.pull();
  }).
  then(function () {
    assert.ok(true, "SyncMediator can push bookmarks to server");
    done();
  }).then(null, function(err) {
    assert.fail(err.message);
    done();
  });
  // then(BookmarksAdapter.readLocalBookmarks).
  // then(function (items) {
  //   verifyReadBookmarks(items, TEST_UPDATE_BOOKMARK_DATA);
  //   assert.ok(true, "TODO");
  //   done();
  // });
}

require("sdk/test").run(exports);