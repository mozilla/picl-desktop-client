var main = require("main");
var StorageServerClient = require("./storage-server-client");
var L = require("./logger");
var ssClient = new StorageServerClient();

const TEST_COLLECTION_NAME = "testCollection";
const TEST_VALUE_NAME = "Roly vs Isis";

const TEST_BOOKMARK_DATA =
[{"id":"places","parentName":"","title":"","children":["menu","toolbar","tags","unfiled"],"type":"folder"},{"id":"menu","parentid":"places","parentName":"","title":"Bookmarks Menu","children":["x-MMaZ2iIm2E","Rpt_3c8ALtPX","a8MBO_X-SG-l","S0cKErf89YfK"],"type":"folder"},{"id":"toolbar","parentid":"places","parentName":"","title":"Bookmarks Toolbar","description":"Add bookmarks to this folder to see them displayed on the Bookmarks Toolbar","children":["1pzDy639sJ8D","A3ghuMeT2pv1","KDj8LPovbHgS","lC72BpPJGVpZ","ARzQFS-X6fEY","1ZLA1XdD0_mT","pWIOD4lM7iEx"],"type":"folder"},{"id":"unfiled","parentid":"places","parentName":"","title":"Unsorted Bookmarks","children":["4ZYFoWVc5qvD"],"type":"folder"},{"id":"pWIOD4lM7iEx","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"testFolder","children":["oKiuvqke5BhO","1vrxrnNk3c3h"],"type":"folder"},{"id":"1vrxrnNk3c3h","parentid":"pWIOD4lM7iEx","parentName":"testFolder","title":"innerFolder","children":[],"type":"folder"},{"id":"S0cKErf89YfK","parentid":"menu","parentName":"Bookmarks Menu","title":"Mozilla Firefox","children":["Mzmp5k9gUAAW","KXT2uBHvIIyk","YrG6Cu1rGTvk","GmuNI1NZ8hRe","R6bkPmTfUyEi"],"type":"folder"},{"id":"Mzmp5k9gUAAW","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"Help and Tutorials","bmkUri":"http://www.mozilla.com/en-US/firefox/help/","type":"bookmark"},{"id":"KXT2uBHvIIyk","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"Customize Firefox","bmkUri":"http://www.mozilla.com/en-US/firefox/customize/","type":"bookmark"},{"id":"GmuNI1NZ8hRe","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"Get Involved","bmkUri":"http://www.mozilla.com/en-US/firefox/community/","type":"bookmark"},{"id":"R6bkPmTfUyEi","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"About Us","bmkUri":"http://www.mozilla.com/en-US/about/","type":"bookmark"},{"id":"1pzDy639sJ8D","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Most Visited","bmkUri":"place:sort=8&maxResults=10","queryId":"MostVisited","folderName":"Most Visited","type":"query"},{"id":"x-MMaZ2iIm2E","parentid":"menu","parentName":"Bookmarks Menu","title":"Recently Bookmarked","bmkUri":"place:folder=BOOKMARKS_MENU&folder=UNFILED_BOOKMARKS&folder=TOOLBAR&queryType=1&sort=12&maxResults=10&excludeQueries=1","queryId":"RecentlyBookmarked","folderName":"Recently Bookmarked","type":"query"},{"id":"Rpt_3c8ALtPX","parentid":"menu","parentName":"Bookmarks Menu","title":"Recent Tags","bmkUri":"place:type=6&sort=14&maxResults=10","queryId":"RecentTags","folderName":"Recent Tags","type":"query"},{"id":"a8MBO_X-SG-l","parentid":"menu","parentName":"Bookmarks Menu","type":"separator"},{"id":"A3ghuMeT2pv1","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Yahoo!","bmkUri":"http://www.yahoo.com/","keyword":"yahoo","type":"bookmark","tags":"tagBar, tagFoo1"},{"id":"KDj8LPovbHgS","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Google","bmkUri":"https://www.google.com/","loadInSidebar":true,"type":"bookmark","tags":"tagFoo2"},{"id":"oKiuvqke5BhO","parentid":"pWIOD4lM7iEx","parentName":"testFolder","title":"Hulu.comff","bmkUri":"http://www.hulu.com/","type":"bookmark","tags":"tagBar2"},{"id":"lC72BpPJGVpZ","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"CNN.com","bmkUri":"http://www.cnn.com/","type":"bookmark"},{"id":"ARzQFS-X6fEY","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Facebook","bmkUri":"https://www.facebook.com/","type":"bookmark"},{"id":"1ZLA1XdD0_mT","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Lifehacker","feedUri":"http://feeds.gawker.com/lifehacker/full","siteUri":"http://lifehacker.com/","type":"livemark"},{"id":"4ZYFoWVc5qvD","parentid":"unfiled","parentName":"Unsorted Bookmarks","title":"Bank of America | Home | Personal","bmkUri":"https://www.bankofamerica.com/","description":"Welcome to Bank of America, the nation's leading financial institution and home for all of your personal financial needs.","type":"bookmark"},{"id":"YrG6Cu1rGTvk","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","type":"separator"}];

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function generateRandomHex(length) {
  var result = "";
  for (var i=0;i<length;i++) {
    result += s4();
  }
  return result;
}

function generateTestToken() {
  return generateRandomHex(16);
};

function generateId() {
  return generateRandomHex(8);
}

function isEmptyObject(o) {
  return Object.keys(o).length === 0;
}

exports["test StorageServerClient works when userId and token are given in constructor"] = function(assert, done) {
  var token = generateTestToken();
  var ssClient = new StorageServerClient({ userId: token, token: token });
  ssClient.getCollectionsInfo().
  then(function (result) {
    assert.equal(result.version, 0, "Returns global version is intialized to 0");
    assert.ok(isEmptyObject(result.collections), "Returns empty collection set");
    done();
  }, function (err) {
    L.log("error", err.message);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.getCollectionsInfo with new userId and valid token"] = function(assert, done) {
  var token = generateTestToken();
  ssClient.getCollectionsInfo({ userId: token, token: token }).
  then(function (result) {
    assert.equal(result.version, 0, "Returns global version is intialized to 0");
    assert.ok(isEmptyObject(result.collections), "Returns empty collection set");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.getCollectionsInfo with no userId"] = function(assert, done) {
  var token = generateTestToken();
  ssClient.getCollectionsInfo({ token: token }).
  then(function (result) {
    L.log("shouldn't succeed:", result);
    assert.fail();
    done();
  }, function (err) {
    assert.ok(true, "Should fail");
    done();
  });
};

exports["test StorageServerClient.updateCollection with new userId, valid token, non-existent collection, and new item"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    assert.equal(result.version, 1, "Returns collection version == 1");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.updateCollection with new userId, valid token, non-existent collection, and a bunch of bookmarks"] = function(assert, done) {
  var token = generateTestToken();
  var testItems = {};
  ssClient.updateCollection({ userId: token, token: token, collection: "bookmarks", items: TEST_BOOKMARK_DATA }).
  then(function (result) {
    assert.equal(result.version, 1, "Returns collection version == 1");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};


exports["test StorageServerClient.updateCollection with new userId, valid token, existing collection, and new item"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    testItem = { id: generateId(), value: TEST_VALUE_NAME+"2" };
    return ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] });
  }).
  then(function (result) {
    assert.equal(result.version, 2, "Returns collection version == 2");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.updateCollection with new userId, valid token, existing collection, new item, and ifUnmodifiedSince equal to current version of collection"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    testItem = { id: generateId(), value: TEST_VALUE_NAME+"2" };
    return ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ], ifUnmodifiedSince: result.version });
  }).
  then(function (result) {
    assert.equal(result.version, 2, "Returns collection version == 2");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.updateCollection with new userId, valid token, existing collection, new item, and ifUnmodifiedSince equal to one less than current version of collection"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    testItem = { id: generateId(), value: TEST_VALUE_NAME+"2" };
    return ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] });
  }).
  then(function (result) {
    testItem = { id: generateId(), value: TEST_VALUE_NAME+"3" };
    return ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ], ifUnmodifiedSince: result.version-1 });
  }).
  then(function (result) {
    L.log("shouldn't succeed:", result);
    assert.fail();
    done();
  }, function (err) {
    assert.equal(err.code, 412, "HTTP status code should be 412");
    done();
  });
};

exports["test StorageServerClient.updateCollection with no userId"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    L.log("shouldn't succeed:", result);
    assert.fail();
    done();
  }, function (err) {
    assert.ok(true, "Should fail");
    done();
  });
};

exports["test StorageServerClient.readCollection with new userId, valid token, and a non-existent collection"] = function(assert, done) {
  var token = generateTestToken();
  ssClient.readCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME }).
  then(function (result) {
    L.log("shouldn't succeed:", result);
    assert.fail();
    done();
  }, function (err) {
    assert.equal(err.code, 404, "HTTP status code should be 404");
    done();
  });
};

exports["test StorageServerClient.readCollection with new userId, valid token, an existing collection, and no id list"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    return ssClient.readCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME });
  }).
  then(function (result) {
    var returnedItem = result.items[0];
    assert.ok(result.version > 0, "Should return a collection version");
    assert.equal(result.items.length, 1, "Should return one item");
    assert.ok(returnedItem.value === testItem.value && returnedItem.id === testItem.id, "The returned item should have the correct id and data");
    assert.ok(!returnedItem.deleted, "The returned item should not be deleted");
    assert.equal(returnedItem.version, result.version, "The returned item's version equal the collection's version");
    assert.ok(returnedItem.timestamp > 0, "The returned item should have a timestamp");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.readCollection with new userId, valid token, an existing collection, no id list, and ifModifiedSince with current version"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    return ssClient.readCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, ifModifiedSince: result.version });
  }).
  then(function (result) {
    assert.equal(result.items.length, 0, "Should return no items");
    assert.ok(result.notModified, "Should return notModified == true")
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.readCollection with new userId, valid token, an existing collection, no id list, and ifModifiedSince with one less than current version"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    testItem = { id: generateId(), value: TEST_VALUE_NAME+"2" };
    return ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] });
  }).
  then(function (result) {
    return ssClient.readCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, ifModifiedSince: result.version-1 });
  }).
  then(function (result) {
    assert.equal(result.items.length, 2, "Should return all items");
    assert.ok(!result.notModified, "Should not return notModified == true");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.readCollection with new userId, valid token, an existing collection, no id list, and newer with current version"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    return ssClient.readCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, newer: result.version });
  }).
  then(function (result) {
    assert.equal(result.items.length, 0, "Should return no items");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.readCollection with new userId, valid token, an existing collection, no id list, and newer with one less than current version"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  var testItem2 = { id: generateId(), value: TEST_VALUE_NAME+"2" };
  var latestVersion;
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem ] }).
  then(function (result) {
    return ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem2 ] });
  }).
  then(function (result) {
    latestVersion = result.version;
    return ssClient.readCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, newer: result.version-1 });
  }).
  then(function (result) {
    assert.equal(result.items.length, 1, "Should return one item");
    assert.equal(result.items[0].id, testItem2.id, "Item should have correct id");
    assert.equal(result.items[0].version, latestVersion, "Item should have latest version");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.readCollection with new userId, valid token, an existing collection, and an id list"] = function(assert, done) {
  var token = generateTestToken();
  var testItem1 = { id: generateId(), value: TEST_VALUE_NAME+" round 1" };
  var testItem2 = { id: generateId(), value: TEST_VALUE_NAME+" round 2" };
  ssClient.updateCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, items: [ testItem1, testItem2 ] }).
  then(function (result) {
    return ssClient.readCollection({ userId: token, token: token, collection: TEST_COLLECTION_NAME, ids: [ testItem1.id ] });
  }).
  then(function (result) {
    var returnedItem = result.items[0];
    assert.ok(result.version > 0, "Should return a collection version");
    assert.equal(result.items.length, 1, "Should return one item");
    assert.ok(returnedItem.value === testItem1.value && returnedItem.id === testItem1.id, "The returned item should have the correct id and data");
    assert.ok(!returnedItem.deleted, "The returned item should not be deleted");
    assert.equal(returnedItem.version, result.version, "The returned item's version equal the collection's version");
    assert.ok(returnedItem.timestamp > 0, "The returned item should have a timestamp");
    done();
  }, function (err) {
    L.log("error", err);
    assert.fail();
    done();
  });
};

exports["test StorageServerClient.readCollection with no userId"] = function(assert, done) {
  var token = generateTestToken();
  var testItem = { id: generateId(), value: TEST_VALUE_NAME };
  ssClient.readCollection({ token: token, collection: TEST_COLLECTION_NAME }).
  then(function (result) {
    L.log("shouldn't succeed:", result);
    asser.fail();
    done();
  }, function (err) {
    assert.ok(true, "Should fail");
    done();
  });
};

require("sdk/test").run(exports);
