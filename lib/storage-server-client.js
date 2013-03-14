var xhrequest = require('xhrequest');
const { reject } = require('sdk/core/promise');
const L = require('logger');

// server deployed on 23.20.0.206
//const DEFAULT_SERVER_ROOT = "http://127.0.0.1:8080";
const DEFAULT_SERVER_ROOT = "http://23.20.0.206";
const GET_INFO_COLLECTIONS_PATH_TEMPLATE = '/{{userId}}/info/collections';
const READ_COLLECTION_PATH_TEMPLATE = '/{{userId}}/storage/{{collection}}';
const UPDATE_COLLECTION_PATH_TEMPLATE = '/{{userId}}/storage/{{collection}}';

function handleError(error) {
  if (error.json) throw error.json;
  else throw { code: error.status, error: error.statusText, message: error.text };
}

function buildHeaders(args) {
  var headers = {};
  headers['Authorization'] = args.token;
  if (typeof(args.ifModifiedSince) !== 'undefined') headers['X-If-Modified-Since-Version'] = args.ifModifiedSince;
  if (typeof(args.ifUnmodifiedSince) !== 'undefined') headers['X-If-Unmodified-Since-Version'] = args.ifUnmodifiedSince;
  return headers;
}

function buildUrl(pathTemplate, args) {
  var path = pathTemplate;
  Object.keys(args).forEach(function (key) {
    path = path.replace('{{'+key+'}}', args[key]);
  });
  return this.serverRoot+path;
}

// should be called with a this context
function getUserId(args) {
  var userId = args.userId || this.userId;
  return userId;
}

function getToken(args) {
  return args.token || this.token;
}

function StorageServerClient(options) {
  options = options || {};
  this.serverRoot = options.serverRoot || DEFAULT_SERVER_ROOT;
  this.userId = options.userId;
  this.token = options.token;
};

// GET /{{userid}}/info/collections'
// Valid args indclude:
//  - userId:string User's id (optional if set in constructor)
//  - token:string User's authorization token (optional if set in constructor)
StorageServerClient.prototype.getCollectionsInfo = function(args) {
  var content = {},
      url,
      headers,
      userId;
  args = args || {};
  userId = getUserId.call(this, args);
  if (!userId) return reject("StorageServerClient.getCollectionsInfo: missing userId");
  headers = buildHeaders({ token: getToken.call(this, args) });
  url = buildUrl.call(this, GET_INFO_COLLECTIONS_PATH_TEMPLATE, { userId: userId });
  return xhrequest(url, { method: 'GET', content: content, headers: headers }).
  then(function (response) {
    if (!response.json) throw "StorageServerClient.getColllectionInfo: Empty response";
    return response.json;
  }).
  then(null, function (err) {
    handleError(err);
  });
};

function isMetaKey(key) {
  return key === 'id' || key === 'deleted'  || key === 'version' || key === 'timestamp';
}

function constructBSOFromItem(o) {
  var payload = {},
      bso = {};
  // TODO: this wont work
  if (typeof(o.id) !== 'string') throw new Error("constructBSOFromItem: item is missing id property");
  if (!o.deleted) {
    Object.keys(o).forEach(function(key) {
      if (!isMetaKey(key)) {
        payload[key] = o[key];
      }
    });
  }
  var bso = {
    id: o.id,
    payload: JSON.stringify(payload)
  };
  if (o.deleted) bso.deleted = true;
  return bso;
}

function constructItemFromBSO(o) {
  var item;
  try {
    item = JSON.parse(o.payload);
  } catch(e) {
    L.log("Failed to construct item from BSO", e.message);
    item = {};
  }
  if (o.deleted) item.deleted = true;
  item.id = o.id;
  item.timestamp = o.timestamp;
  item.version = o.version;
  return item;
}


// POST /{{userid}}/storage/{{collection}}'
// Valid args indclude:
//  - userId:string User's id (optional if set in constructor)
//  - token:string User's authorization token (optional if set in constructor)
//  - collection:string The requested collection name (e.g., "bookmarks") (required)
//  - items:array An array of items to update in the collection.(required)
//      Each item must have an id:string property.
//  - ifUnmodifiedSince:int An int indicating a collecton version such that if
//      the collection has been modified since this version, the update operation
//      should fail (it returns a 412 status code).
StorageServerClient.prototype.updateCollection = function(args) {
  var content,
      userId,
      headers,
      url;

  args = args || {};
  if (!args.collection) return reject("StorageServerClient.updateCollection: missing collection in args");
  userId = getUserId.call(this, args);
  if (!userId) return reject("StorageServerClient.updateCollection: missing userId");
  headers = buildHeaders({ token: getToken.call(this, args), ifUnmodifiedSince: args.ifUnmodifiedSince });
  url = buildUrl.call(this, UPDATE_COLLECTION_PATH_TEMPLATE, { userId: userId, collection: args.collection });
  content = args.items.map(function (item) { return constructBSOFromItem(item); });
  return xhrequest(url, { method: 'POST', content: content, headers: headers }).
  then(function (response) {
    if (!response.json) throw "StorageServerClient.updateCollection: Empty response";
    return response.json;
  }).
  then(null, function (err) {
    handleError(err);
  });
};

// GET /{{userid}}/storage/{{collection}}'
// Valid args indclude:
//  - userId:string User's id (optional if set in constructor)
//  - token:string User's authorization token (optional if set in constructor)
//  - collection:string The requested collection name (e.g., "bookmarks") (required)
//  - ids:array An array of requested ids in the collection (optional)
//  - newer:int An int indicating that only items newer than the given version
//      should be returned. (optional)
//  - ifModifiedSince:int An int indicating a collecton version if that if the
//      collection has not been modified since this version, then the data shouldn't
//      be returned.
StorageServerClient.prototype.readCollection = function(args) {
  var content = {},
      userId,
      headers,
      url;
  args = args || {};
  if (!args.collection) return reject("StorageServerClient.readCollection: missing collection in args");
  userId = getUserId.call(this, args);
  if (!userId) return reject("StorageServerClient.readCollection: missing userId");
  headers = buildHeaders({ token: getToken.call(this, args), ifModifiedSince: args.ifModifiedSince });
  url = buildUrl.call(this, READ_COLLECTION_PATH_TEMPLATE, { userId: userId, collection: args.collection });
  if (args.ids) content.ids = args.ids.join(",");
  if (typeof(args.newer) !== 'undefined') content.newer = args.newer;
  return xhrequest(url, { method: 'GET', content: content, headers: headers }).
  then(function (response) {
    if (response.status === 304) return { items: [], notModified: true };
    if (!response.json) throw "StorageServerClient.readCollection: Empty response";
    var json = JSON.parse(response.text);
    json.items = json.items.map(function (bso) { return constructItemFromBSO(bso); });
    return json;
  }).
  then(null, function (err) {
    handleError(err);
  });
};

module.exports = StorageServerClient;