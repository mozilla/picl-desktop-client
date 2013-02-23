var xhrequest = require('./xhrequest');
const { reject } = require('sdk/core/promise');
const L = require('./logger');

// server deployed on 23.20.0.206
const DEFAULT_SERVER_ROOT = "http://127.0.0.1:8080";
//const DEFAULT_SERVER_ROOT = "http://23.20.0.206";
const GET_INFO_COLLECTIONS_PATH_TEMPLATE = '/{{userId}}/info/collections';
const READ_COLLECTION_PATH_TEMPLATE = '/{{userId}}/storage/{{collection}}';
const UPDATE_COLLECTION_PATH_TEMPLATE = '/{{userId}}/storage/{{collection}}';

function handleError(error) {
  throw JSON.parse(error.text);
}

function StorageServerClient(options) {
  options = options || {};
  this.serverRoot = options.serverRoot || DEFAULT_SERVER_ROOT;
  this.userId = options.userId;
  this.token = options.token;
};

// GET /{{userid}}/info/collections'
// Valid args indclude:
//  - userId:string User's id (required)
//  - token:string User's authorization token (required)
StorageServerClient.prototype.getCollectionsInfo = function(args) {
  var content = {},
      path = GET_INFO_COLLECTIONS_PATH_TEMPLATE,
      headers = {};
  args = args || {};
  var userId = args.userId || this.userId;
  if (userId) reject("StorageServerClient.getCollectionInfo: missing userId");
  path = path.replace('{{userId}}', userId);
  headers.Authorization = args.token || this.token;
  return xhrequest(this.serverRoot+path, { method: 'GET', content: content, headers: headers }).
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
    console.log("FAIL" + e.message);
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
//  - userId:string User's id (required)
//  - token:string User's authorization token (required)
//  - collection:string The requested collection name (e.g., "bookmarks") (required)
//  - items:array An array of items to update in the collection.(required)
//      Each item must have an id:string property.
StorageServerClient.prototype.updateCollection = function(args) {
  var content,
      path = UPDATE_COLLECTION_PATH_TEMPLATE,
      headers = {};
  args = args || {};
  var userId = args.userId || this.userId;
  if (userId) reject("StorageServerClient.updateCollection: missing userId");
  path = path.replace('{{userId}}', userId);
  if (!args.collection) reject("StorageServerClient.updateCollection: missing collection in args");
  path = path.replace('{{userId}}', args.userId).replace('{{collection}}', args.collection);
  headers['Authorization'] = args.token || this.token;
  content = args.items.map(function (item) { return constructBSOFromItem(item); });
  return xhrequest(this.serverRoot+path, { method: 'POST', content: content, headers: headers }).
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
//  - userId:string User's id (required)
//  - token:string User's authorization token (required)
//  - collection:string The requested collection name (e.g., "bookmarks") (required)
//  - ids:array An array of requested ids in the collection (optional)
//  - newer:string A string indicating that only items newer than the given version
//      should be returned. (optional)
StorageServerClient.prototype.readCollection = function(args) {
  var content = {},
      path = READ_COLLECTION_PATH_TEMPLATE,
      headers = {};
  args = args || {};
  var userId = args.userId || this.userId;
  if (userId) reject("StorageServerClient.updateCollection: missing userId");
  path = path.replace('{{userId}}', userId);
  if (!args.collection) reject("StorageServerClient.updateCollection: missing collection in args");
  path = path.replace('{{userId}}', args.userId).replace('{{collection}}', args.collection);
  if (args.ids) content.ids = args.ids.join(",");
  headers['Authorization'] = args.token || this.token;
  if (args.newer) headers['X-If-Modified-Since-Version'] = args.newer;
  return xhrequest(this.serverRoot+path, { method: 'GET', content: content, headers: headers }).
  then(function (response) {
    if (response.status === 304) return { items: [] };
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