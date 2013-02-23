var Request = require('request').Request;
const { defer } = require('sdk/core/promise');

// Makes a xhr request to <url> with an  <options> hash. Returns a
// promise that is resolved on 2xx and 3xx status codes and rejected on
// 4xx and 5xx status codes.
// Parameters:
//   - url:string URL to request
// Valid options:
//   - method:string One of 'GET', 'POST', or 'PUT' (required)
//   - content:object An unordered collection of name/value pairs to send
//       with the request, a string, or an array that will be turned in JSON (optional)
//   - headers:object An unordered collection of name/value pairs representing
//       the headers to send with the request. (optional)
var Xhrequest = function(url, options) {
  options = options || {};
  var method = options.method,
      content = options.content || {},
      headers = options.headers || {},
      reqObj = {
        url: url,
        content: content,
        headers: headers
      },
      dfd = defer();

  // if PUT or POST turn body into JSON string
  if (method === 'PUT' || method === 'POST') {
    if (typeof(content) === 'array' || typeof(content) === 'object') {
      reqObj.content = JSON.stringify(content);
    }
    reqObj.contentType = 'application/json';
  }

  reqObj.onComplete = function(response) {
    if (response.status >= 200 && response.status < 400) {
      dfd.resolve(response);
    } else {
      dfd.reject(response);
    }
  };

  var request = Request(reqObj);
  switch (method) {
    case 'PUT': request.put(); break;
    case 'POST': request.post(); break;
    case 'GET':  request.get(); break;
    default:  dfd.reject("Xhrequest: unknown method: "+method); break;
  }
  return dfd.promise;
};

module.exports = Xhrequest;
