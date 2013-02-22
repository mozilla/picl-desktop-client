var xhrequest = require('./xhrequest');
const { reject } = require('sdk/core/promise');

const DEFAULT_SERVER_ROOT = "http://127.0.0.1:8080";
const GET_COLLECTION_INFO_PATH_TEMPLATE = '/{{userId}}/info/collections';

function handleError(error) {
  throw JSON.parse(error.text);
}

function StorageServerClient(options) {
  options = options || {};
  this.serverRoot = options.serverRoot || DEFAULT_SERVER_ROOT;
};

// GET /{userid}/info/collections'
// Valid args indclude:
//  - userId:string User's id (required)
//  - token:string User's authorization token (required)
StorageServerClient.prototype.getCollectionInfo = function(args) {
  var content = {},
      path = GET_COLLECTION_INFO_PATH_TEMPLATE,
      headers = {};
  args = args || {};
  if (!args.userId) reject("StorageServerClient.getCollectionInfo: missing userId in args");
  path = path.replace('{{userId}}', args.userId);
  headers.Authorization = args.token;
  return xhrequest(this.serverRoot+path, { method: 'GET', content: content, headers: headers }).
  then(function (response) {
    if (!response.json) throw "StorageServerClient.getColllectionInfo: Empty response";
    return response.json;
  }).
  then(null, function (err) {
    handleError(err);
  });
}


// POST /user
// Valid args include:
//   - email:string User's email (required)
StorageServerClient.prototype.createUser = function(args) {
  var content = {};
  args = args || {};
  // if (args.email) content.email = args.email;
  // return xhrequest(this.serverRoot+USER_PATH, { method: 'POST', content: content }).
  // then(function (response) {
  //   if (!response.json) throw "KeyServerClient.createUser: Empty response";
  //   return response.json;
  // }).
  // then(null, function (err) {
  //   handleError(err);
  // });
}

// GET /user/?email=<email>
// Valid args include:
//   - email:string User's email (required)
StorageServerClient.prototype.getUser = function(args) {
  var content = {};
  args = args || {};
  if (args.email) content.email = args.email;
  return xhrequest(this.serverRoot+USER_PATH+"/", { method: 'GET', content: content }).
  then(function (response) {
    if (!response.json) throw "KeyServerClient.getUser: Empty response";
    return response.json;
  }).
  then(null, function (err) {
    handleError(err);
  });
}

module.exports = StorageServerClient;