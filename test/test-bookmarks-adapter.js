const { Cc, Ci, Cu, CC } = require("chrome");
const BookmarksAdapter = require('bookmarks-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const L = require('logger');

Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

const TEST_BOOKMARK_DATA =[
{"parentid":"menu","localType":2,"pos":3,"title":"Mozilla Firefox","children":["Mzmp5k9gUAAW","KXT2uBHvIIyk","YrG6Cu1rGTvk","GmuNI1NZ8hRe","R6bkPmTfUyEi"],"type":"folder","id":"S0cKErf89YfK","timestamp":1363214160099,"version":52},
{"parentid":"S0cKErf89YfK","localType":1,"pos":0,"title":"Help and Tutorials","bmkUri":"http://www.mozilla.com/en-US/firefox/help/","type":"bookmark","id":"Mzmp5k9gUAAW","timestamp":1363214160099,"version":52},
{"parentid":"S0cKErf89YfK","localType":1,"pos":1,"title":"Customize Firefox","bmkUri":"http://www.mozilla.com/en-US/firefox/customize/","type":"bookmark","id":"KXT2uBHvIIyk","timestamp":1363214160099,"version":52},
{"parentid":"S0cKErf89YfK","localType":1,"pos":3,"title":"Get Involved","bmkUri":"http://www.mozilla.com/en-US/firefox/community/","type":"bookmark","id":"GmuNI1NZ8hRe","timestamp":1363214160099,"version":52},
{"parentid":"S0cKErf89YfK","localType":1,"pos":4,"title":"About Us","bmkUri":"http://www.mozilla.com/en-US/about/","type":"bookmark","id":"R6bkPmTfUyEi","timestamp":1363214160099,"version":52},
{"parentid":"toolbar","localType":1,"pos":0,"title":"Most Visited","bmkUri":"place:sort=8&maxResults=10","queryId":"MostVisited","folderName":"Most Visited","type":"query","id":"1pzDy639sJ8D","timestamp":1363214160099,"version":52},
{"parentid":"menu","localType":1,"pos":0,"title":"Recently Bookmarked","bmkUri":"place:folder=BOOKMARKS_MENU&folder=UNFILED_BOOKMARKS&folder=TOOLBAR&queryType=1&sort=12&maxResults=10&excludeQueries=1","queryId":"RecentlyBookmarked","folderName":"Recently Bookmarked","type":"query","id":"x-MMaZ2iIm2E","timestamp":1363214160099,"version":52},
{"parentid":"menu","localType":1,"pos":1,"title":"Recent Tags","bmkUri":"place:type=6&sort=14&maxResults=10","queryId":"RecentTags","folderName":"Recent Tags","type":"query","id":"Rpt_3c8ALtPX","timestamp":1363214160099,"version":52},
{"parentid":"menu","localType":3,"pos":2,"type":"separator","id":"a8MBO_X-SG-l","timestamp":1363214160099,"version":52},
{"parentid":"toolbar","localType":1,"pos":1,"title":"Yahoo!","bmkUri":"http://www.yahoo.com/","keyword":"yahoo","type":"bookmark","id":"A3ghuMeT2pv1","timestamp":1363214160099,"version":52},
{"parentid":"toolbar","localType":1,"pos":2,"title":"Google","bmkUri":"https://www.google.com/","loadInSidebar":true,"type":"bookmark","id":"KDj8LPovbHgS","timestamp":1363214160099,"version":52},
{"parentid":"pWIOD4lM7iEx","localType":1,"pos":0,"title":"Hulu.comff","bmkUri":"http://www.hulu.com/","type":"bookmark","id":"oKiuvqke5BhO","timestamp":1363214160099,"version":52},
{"parentid":"toolbar","localType":1,"pos":3,"title":"CNN.com","bmkUri":"http://www.cnn.com/","type":"bookmark","id":"lC72BpPJGVpZ","timestamp":1363214160099,"version":52},
{"parentid":"toolbar","localType":1,"pos":4,"title":"Facebook","bmkUri":"https://www.facebook.com/","type":"bookmark","id":"ARzQFS-X6fEY","timestamp":1363214160099,"version":52},
{"parentid":"toolbar","localType":2,"pos":5,"title":"Lifehacker","feedUri":"http://feeds.gawker.com/lifehacker/full","siteUri":"http://lifehacker.com/","type":"livemark","id":"1ZLA1XdD0_mT","timestamp":1363214160099,"version":52},
{"parentid":"unfiled","localType":1,"pos":0,"title":"Bank of America | Home | Personal","bmkUri":"https://www.bankofamerica.com/","description":"Welcome to Bank of America, the nation's leading financial institution and home for all of your personal financial needs.","type":"bookmark","id":"4ZYFoWVc5qvD","timestamp":1363214160099,"version":52},
{"parentid":"toolbar","localType":2,"pos":6,"title":"testFolder","children":["oKiuvqke5BhO","1vrxrnNk3c3h"],"type":"folder","id":"pWIOD4lM7iEx","timestamp":1363214160099,"version":52},
{"parentid":"pWIOD4lM7iEx","localType":2,"pos":1,"title":"innerFolder","children":[],"type":"folder","id":"1vrxrnNk3c3h","timestamp":1363214160099,"version":52},
{"parentid":"tags","localType":2,"pos":0,"title":"tagBar","description":"dqweqweqweqwe","children":["OZVQ1YK8ZHx6"],"type":"folder","id":"Uvusw71z44gL","timestamp":1363214160099,"version":52},
{"parentid":"tags","localType":2,"pos":1,"title":"tagFoo1","children":["rarSfAbNk9aX"],"type":"folder","id":"BLSDxnCTXdYy","timestamp":1363214160099,"version":52},
{"parentid":"Uvusw71z44gL","localType":1,"pos":0,"bmkUri":"http://www.yahoo.com/","type":"bookmark","id":"OZVQ1YK8ZHx6","timestamp":1363214160099,"version":52},
{"parentid":"BLSDxnCTXdYy","localType":1,"pos":0,"bmkUri":"http://www.yahoo.com/","type":"bookmark","id":"rarSfAbNk9aX","timestamp":1363214160099,"version":52},
{"parentid":"tags","localType":2,"pos":2,"title":"tagBar2","children":["LsZ3D-4rhcVg"],"type":"folder","id":"2wX-3v6wakux","timestamp":1363214160099,"version":52},
{"parentid":"2wX-3v6wakux","localType":1,"pos":0,"bmkUri":"http://www.hulu.com/","type":"bookmark","id":"LsZ3D-4rhcVg","timestamp":1363214160099,"version":52},
{"parentid":"tags","localType":2,"pos":3,"title":"tagFoo2","children":["k_rNIiP1HGPC"],"type":"folder","id":"RU748sMQm6Xk","timestamp":1363214160099,"version":52},
{"parentid":"RU748sMQm6Xk","localType":1,"pos":0,"bmkUri":"https://www.google.com/","type":"bookmark","id":"k_rNIiP1HGPC","timestamp":1363214160099,"version":52},
{"parentid":"S0cKErf89YfK","localType":3,"pos":2,"type":"separator","id":"YrG6Cu1rGTvk","timestamp":1363214160099,"version":52},
{"localType":2,"pos":0,"title":"","children":["menu","toolbar","tags","unfiled"],"type":"folder","id":"places","timestamp":1363214160099,"version":52},
{"parentid":"places","localType":2,"pos":0,"title":"Bookmarks Menu","children":["x-MMaZ2iIm2E","Rpt_3c8ALtPX","a8MBO_X-SG-l","S0cKErf89YfK"],"type":"folder","id":"menu","timestamp":1363214160099,"version":52},
{"parentid":"places","localType":2,"pos":1,"title":"Bookmarks Toolbar","description":"Add bookmarks to this folder to see them displayed on the Bookmarks Toolbar","children":["1pzDy639sJ8D","A3ghuMeT2pv1","KDj8LPovbHgS","lC72BpPJGVpZ","ARzQFS-X6fEY","1ZLA1XdD0_mT","pWIOD4lM7iEx"],"type":"folder","id":"toolbar","timestamp":1363214160099,"version":52},
{"parentid":"places","localType":2,"pos":2,"title":"Tags","children":["Uvusw71z44gL","BLSDxnCTXdYy","2wX-3v6wakux","RU748sMQm6Xk"],"type":"folder","id":"tags","timestamp":1363214160099,"version":52},
{"parentid":"places","localType":2,"pos":3,"title":"Unsorted Bookmarks","children":["4ZYFoWVc5qvD"],"type":"folder","id":"unfiled","timestamp":1363214160099,"version":52}
];

function verifyBookmarksToolbar(assert) {
  var result = PlacesUtils.getFolderContents(PlacesUtils.bookmarks.toolbarFolder);
  var rootNode = result.root;
  var node;
  var query;
  node = rootNode.getChild(0);
  assert.ok(PlacesUtils.nodeIsQuery(node), "First toolbar item should be a query");
  query = node.QueryInterface(Ci.nsINavHistoryQueryResultNode);
  assert.equal(query.title, "Most Visited", "First toolbar item should have the correct title");
  assert.equal(query.uri, "place:sort=8&maxResults=10", "First toolbar item should have the correct uri");
  node = rootNode.getChild(1);
  assert.ok(PlacesUtils.nodeIsBookmark(node), "Second toolbar item should be a bookmark");
  assert.equal(node.title, "Yahoo!", "Second toolbar item should have the correct title");
  assert.equal(node.uri, "http://www.yahoo.com/", "Second toolbar item should have the correct uri");
  assert.equal(node.tags, "tagBar, tagFoo1", "Second toolbar item should have the correct tags");
  assert.equal(PlacesUtils.bookmarks.getKeywordForBookmark(node.itemId), "yahoo", "Second toolbar item should have the correct keyword");
  node = rootNode.getChild(2);
  assert.ok(PlacesUtils.nodeIsBookmark(node), "Third toolbar item should be a bookmark");
  assert.equal(node.title, "Google", "Third toolbar item should have the correct title");
  assert.equal(node.uri, "https://www.google.com/", "Third toolbar item should have the correct uri");
  assert.equal(node.tags, "tagFoo2", "Third toolbar item should have the correct tags");
  assert.ok(PlacesUtils.annotations.getItemAnnotation(node.itemId, "bookmarkProperties/loadInSidebar"), "Third toolbar item should have loadInSidebar set");
  node = rootNode.getChild(3);
  assert.ok(PlacesUtils.nodeIsBookmark(node), "Fourth toolbar item should be a bookmark");
  assert.equal(node.title, "CNN.com", "Fourth toolbar item should have the correct title");
  assert.equal(node.uri, "http://www.cnn.com/", "Fourth toolbar item should have the correct uri");
  assert.equal(node.tags, null, "Fourth toolbar item should have the correct tags");
  node = rootNode.getChild(4);
  assert.ok(PlacesUtils.nodeIsBookmark(node), "Fifth toolbar item should be a bookmark");
  assert.equal(node.title, "Facebook", "Fifth toolbar item should have the correct title");
  assert.equal(node.uri, "https://www.facebook.com/", "Fifth toolbar item should have the correct uri");
  assert.equal(node.tags, null, "Fifth toolbar item should have the correct tags");
  node = rootNode.getChild(5);
  assert.ok(PlacesUtils.nodeIsFolder(node) &&
            PlacesUtils.annotations
                       .itemHasAnnotation(node.itemId, PlacesUtils.LMANNO_FEEDURI) &&
            PlacesUtils.annotations
                       .itemHasAnnotation(node.itemId, PlacesUtils.LMANNO_SITEURI), "Sixth toolbar item should be a livemark");
  assert.equal(node.title, "Lifehacker", "Sixth toolbar item should have the correct title");
  let feedUri = PlacesUtils.annotations.getItemAnnotation(node.itemId, PlacesUtils.LMANNO_FEEDURI);
  let siteUri = PlacesUtils.annotations.getItemAnnotation(node.itemId, PlacesUtils.LMANNO_SITEURI);
  assert.equal(feedUri, "http://feeds.gawker.com/lifehacker/full", "Sixth toolbar item should have the correct feed uri");
  assert.equal(siteUri, "http://lifehacker.com/", "Sixth toolbar item should have the correct site uri");
  node = rootNode.getChild(6);
  assert.ok(PlacesUtils.nodeIsFolder(node), "Seventh toolbar item should be a folder");
  assert.equal(node.title, "testFolder", "Seventh toolbar item should have the correct title");
  folderResult1 = PlacesUtils.getFolderContents(node.itemId);
  node = folderResult1.root.getChild(0);
  assert.ok(PlacesUtils.nodeIsBookmark(node), "First child of seventh toolbar item should be a bookmark");
  assert.equal(node.title, "Hulu.comff", "First child of seventh toolbar item should have the correct title");
  assert.equal(node.uri, "http://www.hulu.com/", "First child of seventh toolbar item should have the correct uri");
  assert.equal(node.tags, "tagBar2", "First child of seventh toolbar item should have the correct tags");
  node = folderResult1.root.getChild(1);
  assert.ok(PlacesUtils.nodeIsFolder(node), "Second child of seventh toolbar item should be a folder");
  assert.equal(node.title, "innerFolder", "Second child of seventh toolbar item should have the correct title");
  let folderResult2 = PlacesUtils.getFolderContents(node.itemId);
  assert.ok(folderResult2.root.childCount === 0, "Second child of seventh toolbar item should have no children");
  folderResult2.root.containerOpen = false;
  folderResult1.root.containerOpen = false;
  rootNode.containerOpen = false;
}

function verifyBookmarksMenu(assert) {

}

function verifyBookmarksUnfiled(assert) {

}

exports['test update local bookmarks'] = function (assert, done) {
  let items = TEST_BOOKMARK_DATA.map(function (item) { return BookmarksItem(item); });
  BookmarksAdapter.clearLocalBookmarks();
  BookmarksAdapter.updateLocalBookmarks(items).
  then(function() {
    verifyBookmarksToolbar(assert);
    verifyBookmarksMenu(assert);
    verifyBookmarksUnfiled(assert);
    done();
  });
}

require("sdk/test").run(exports);