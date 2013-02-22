var main = require("main");
var StorageServerClient = require("./storageserver-client");
var ssClient = new StorageServerClient();

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function generateTestToken() {
  var result = "";
  for (var i=0;i<16;i++) {
    result += s4();
  }
  return result;
};

function isEmptyObject(o) {
  return Object.keys(o).length === 0;
}

exports["test StorageServerClient.getCollectionInfo with new userId and valid token"] = function(assert, done) {
  var token = generateTestToken();
  ssClient.getCollectionInfo({ userId: token, token: token }).
  then(function (result) {
    assert.equal(result.version, 0, "Returns global version is intialized to 0");
    assert.ok(isEmptyObject(result.collections), "Returns empty collection set");
    done();
  }, function (err) {
    console.log("error "+err.text+" "+err.status);
    assert.fail();
    done();
  });
};

require("sdk/test").run(exports);
