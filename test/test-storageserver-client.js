var main = require("main");
var StorageServerClient = require("./storage-server-client");
var L = require("./logger");
var ssClient = new StorageServerClient();

const TEST_COLLECTION_NAME = "testCollection";
const TEST_VALUE_NAME = "Roly vs Isis";

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
    L.log("error", err);
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

exports["test StorageServerClient.updateCollection with new userId, valid token, and new item"] = function(assert, done) {
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


require("sdk/test").run(exports);
