const { Cc, Ci, Cu, CC } = require("chrome");
var BookmarksAdapter = require('bookmarks-adapter');
const L = require('logger');

const TEST_BOOKMARK_DATA = {
  bookmarkIndex: 1,
  title: 'Test bookmark',
  uri: 'https://testy.com/test',
  id: '{d4e2a1f6-6ea0-40ee-bff5-da57982f21cf}'
};

exports['test update and read local bookmarks'] = function (assert, done) {
  BookmarksAdapter.clearLocalBookmarks();
  BookmarksAdapter.updateLocalBookmarks([ TEST_BOOKMARK_DATA ]);
  var bookmarks = BookmarksAdapter.readLocalBookmarks();
  assert.equal(bookmarks.length, 1, "Should have created a single bookmark");
  assert.equal(bookmarks[0].id, TEST_BOOKMARK_DATA.id, "Should create a bookmark with the correct id");
  assert.equal(bookmarks[0].title, TEST_BOOKMARK_DATA.title, "Should create a bookmark with the correct title");
  assert.equal(bookmarks[0].uri, TEST_BOOKMARK_DATA.uri, "Should create a bookmark with the correct uri");
  assert.equal(bookmarks[0].bookmarkIndex, TEST_BOOKMARK_DATA.bookmarkIndex, "Should create a bookmark with the correct index");
  done();
}

require("sdk/test").run(exports);