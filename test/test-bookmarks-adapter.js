const { Cc, Ci, Cu, CC } = require("chrome");
const BookmarksAdapter = require('bookmarks-adapter');
const BookmarksItem = require('bookmarks-item').BookmarksItem;
const TEST_BOOKMARK_DATA = require('data').TEST_BOOKMARK_DATA;
const _ = require('underscore');
const L = require('logger');

Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

function verifyBookmark(assert, node, info) {
  assert.ok(PlacesUtils.nodeIsBookmark(node), info.initialMsg || "Item should be a bookmark");
  assert.equal(node.title, info.title, "Bookmark should have the correct title");
  assert.equal(node.uri, info.uri, "Bookmark should have the correct uri");
  if (info.tags !== undefined) {
    assert.equal(node.tags, info.tags, "Bookmark should have the correct tags");
  }
  if (info.keyword) {
    assert.equal(PlacesUtils.bookmarks.getKeywordForBookmark(node.itemId), info.keyword, "Bookmark should have the correct keyword");
  }
  if (info.loadInSidebar) {
    assert.ok(PlacesUtils.annotations.getItemAnnotation(node.itemId, "bookmarkProperties/loadInSidebar"), "Bookmark should have loadInSidebar set");
  }
  if (info.description) {
    assert.equal(PlacesUtils.annotations.getItemAnnotation(node.itemId, "bookmarkProperties/description"), info.description, "Bookmark should have the correct description");
  }
}

function verifyQuery(assert, node, info) {
  assert.ok(PlacesUtils.nodeIsQuery(node), info.initialMsg || "Item should be a query");
  query = node.QueryInterface(Ci.nsINavHistoryQueryResultNode);
  assert.equal(query.title, info.title, "Query should have the correct title");
  assert.ok(node.uri.indexOf("place:") == 0, "Query should have a query uri");
}

function verifyLivemark(assert, node, info) {
  assert.ok(PlacesUtils.nodeIsFolder(node) &&
            PlacesUtils.annotations
                       .itemHasAnnotation(node.itemId, PlacesUtils.LMANNO_FEEDURI) &&
            PlacesUtils.annotations
                       .itemHasAnnotation(node.itemId, PlacesUtils.LMANNO_SITEURI), info.initialMsg || "Item should be a livemark");
  assert.equal(node.title, info.title, "Livemark should have the correct title");
  let feedUri = PlacesUtils.annotations.getItemAnnotation(node.itemId, PlacesUtils.LMANNO_FEEDURI);
  let siteUri = PlacesUtils.annotations.getItemAnnotation(node.itemId, PlacesUtils.LMANNO_SITEURI);
  assert.equal(feedUri, info.feedUri, "Livemark should have the correct feed uri");
  assert.equal(siteUri, info.siteUri, "Livemark should have the correct site uri");
}

function verifyFolder(assert, node, info) {
  assert.ok(PlacesUtils.nodeIsFolder(node), info.initialMsg || "Item should be a folder");
  assert.equal(node.title, info.title, "Folder should have the correct title");
}

function verifySeparator(assert, node, info) {
  assert.ok(PlacesUtils.nodeIsSeparator(node), info.initialMsg || "Item should be a separator");
}

function verifyBookmarksToolbar(assert) {
  var result = PlacesUtils.getFolderContents(PlacesUtils.bookmarks.toolbarFolder);
  var rootNode = result.root;
  var node;
  node = rootNode.getChild(0);
  verifyQuery(assert, node, { initialMsg: "First toolbar item should be a query", title: "Most Visited" });
  node = rootNode.getChild(1);
  verifyBookmark(assert, node, { initialMsg: "Second toolbar item should be a bookmark", title: "Yahoo!", uri: "http://www.yahoo.com/", tags: "tagBar, tagFoo1", keyword: "yahoo" });
  node = rootNode.getChild(2);
  verifyBookmark(assert, node, { initialMsg: "Third toolbar item should be a bookmark", title: "Google", uri: "https://www.google.com/", tags: "tagFoo2", loadInSidebar: true });
  node = rootNode.getChild(3);
  verifyBookmark(assert, node, { initialMsg: "Fourth toolbar item should be a bookmark", title: "CNN.com", uri: "http://www.cnn.com/", tags: null });
  node = rootNode.getChild(4);
  verifyBookmark(assert, node, { initialMsg: "Fifth toolbar item should be a bookmark", title: "Facebook", uri: "https://www.facebook.com/", tags: null });
  node = rootNode.getChild(5);
  verifyLivemark(assert, node, { initialMsg: "Sixth toolbar item should be a livemark", title: "Lifehacker", feedUri: "http://feeds.gawker.com/lifehacker/full", siteUri: "http://lifehacker.com/"});
  node = rootNode.getChild(6);
  verifyFolder(assert, node, { initialMsg: "Seventh toolbar item should be a folder", title: "testFolder" });
  folderResult1 = PlacesUtils.getFolderContents(node.itemId);
  node = folderResult1.root.getChild(0);
  verifyBookmark(assert, node, { initialMsg: "First child of seventh toolbar item should be a bookmark", title: "Hulu.comff", uri: "http://www.hulu.com/", tags: "tagBar2" });
  node = folderResult1.root.getChild(1);
  verifyFolder(assert, node, { initialMsg: "Second child of seventh toolbar item should be a folder", title: "innerFolder" });
  let folderResult2 = PlacesUtils.getFolderContents(node.itemId);
  assert.ok(folderResult2.root.childCount === 0, "Second child of seventh toolbar item should have no children");
  folderResult2.root.containerOpen = false;
  folderResult1.root.containerOpen = false;
  rootNode.containerOpen = false;
}

function verifyBookmarksMenu(assert) {
  var result = PlacesUtils.getFolderContents(PlacesUtils.bookmarks.bookmarksMenuFolder);
  var rootNode = result.root;
  var node;
  var folderResult1;
  node = rootNode.getChild(0);
  verifyQuery(assert, node, { initialMsg: "First menu item should be a query", title: "Recently Bookmarked" });
  node = rootNode.getChild(1);
  verifyQuery(assert, node, { initialMsg: "Second menu item should be a query", title: "Recent Tags" });
  node = rootNode.getChild(2);
  verifySeparator(assert, node, { initialMsg: "Third menu item should be a separator" });
  node = rootNode.getChild(3);
  verifyFolder(assert, node, { initialMsg: "Fourth menu item should be a folder", title: "Mozilla Firefox" });
  folderResult1 = PlacesUtils.getFolderContents(node.itemId);
  node = folderResult1.root.getChild(0);
  verifyBookmark(assert, node, { initialMsg: "First child of fourth menu item should be a bookmark", title: "Help and Tutorials", uri: "http://www.mozilla.com/en-US/firefox/help/", tags: null });
  node = folderResult1.root.getChild(1);
  verifyBookmark(assert, node, { initialMsg: "Second child of fourth menu item should be a bookmark", title: "Customize Firefox", uri: "http://www.mozilla.com/en-US/firefox/customize/", tags: null });
  node = folderResult1.root.getChild(2);
  verifySeparator(assert, node, { initialMsg: "Third child of fourth menu item should be a separator" });
  node = folderResult1.root.getChild(3);
  verifyBookmark(assert, node, { initialMsg: "Fourth child of fourth menu item should be a bookmark", title: "Get Involved", uri: "http://www.mozilla.com/en-US/firefox/community/", tags: null });
  node = folderResult1.root.getChild(4);
  verifyBookmark(assert, node, { initialMsg: "Second child of fourth menu item should be a bookmark", title: "About Us", uri: "http://www.mozilla.com/en-US/about/", tags: null });
  folderResult1.root.containerOpen = false;
  rootNode.containerOpen = false;
}

function verifyBookmarksUnfiled(assert) {
  var result = PlacesUtils.getFolderContents(PlacesUtils.bookmarks.unfiledBookmarksFolder);
  var rootNode = result.root;
  var node;
  node = rootNode.getChild(0);
  verifyBookmark(assert, node, { initialMsg: "First unfiled folder item should be a bookmark", title: "Bank of America | Home | Personal", uri: "https://www.bankofamerica.com/", tags: null, "description":"Welcome to Bank of America, the nation's leading financial institution and home for all of your personal financial needs." });
  rootNode.containerOpen = false;
}

function verifyReadBookmarks(assert, items, testItems) {
  assert.equal(items.length, testItems.length, "Number of read items should the same as the number of test items");
  let result = true;
  let canary = false;
  items.forEach(function (item) {
    let foundTestItem = null;
    testItems.forEach(function (testItem) {
      // places root is special so ignore it because the parentName and parentId are screwed up
      if (item.id !== "places" && item.id === testItem.id) {
        result = result && _.isEqual(testItem, item);
        canary = true;
        //L.log("IS EQ",testItem, item);
      }
    });
  });
  assert.ok(result && canary, "Read items are equivalent to the inserted test items");
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
  }).then(null, function(err) {
    assert.fail(err.message);
    done();
  });
}

exports['test read local bookmarks'] = function (assert, done) {
  BookmarksAdapter.clearLocalBookmarks();
  let items = TEST_BOOKMARK_DATA.map(function (item) { return BookmarksItem(item); });
  BookmarksAdapter.updateLocalBookmarks(items).
  then(BookmarksAdapter.readLocalBookmarks).
  then(function (items) {
    verifyReadBookmarks(assert, items, TEST_BOOKMARK_DATA);
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