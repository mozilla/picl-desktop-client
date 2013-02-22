var xhrequest = require('./xhrequest');

const DEFAULT_SERVER_URL = "http://127.0.0.1:8090";
const USER_PATH = "/user"

function handleError(error) {
  throw JSON.parse(error.text);
}

function KeyServerClient(options) {
  options = options || {};
  this.serverUrl = options.serverUrl || DEFAULT_SERVER_URL;
};

// POST /user
// Valid args include:
//   - email:string User's email (required)
KeyServerClient.prototype.createUser = function(args) {
  var content = {};
  args = args || {};
  if (args.email) content.email = args.email;
  return xhrequest(this.serverUrl+USER_PATH, { method: 'POST', content: content }).
  then(function (response) {
    return JSON.parse(response.text);
  }).
  then(null, function (err) {
    handleError(err);
  });
}

// GET /user/?email=<email>
// Valid args include:
//   - email:string User's email (required)
KeyServerClient.prototype.getUser = function(args) {
  var content = {};
  args = args || {};
  if (args.email) content.email = args.email;
  return xhrequest(this.serverUrl+USER_PATH+"/", { method: 'GET', content: content }).
  then(function (response) {
    return JSON.parse(response.text);
  }).
  then(null, function (err) {
    handleError(err);
  });
}

module.exports = KeyServerClient;