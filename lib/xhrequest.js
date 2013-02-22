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
//       with the request. (optional)
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
        headers: headers,
        contentType: 'application/x-www-form-urlencoded' // should be application/json but failing for some reason
      },
      dfd = defer();

  if (typeof content !== 'object') {
    dfd.reject("options.content must object");
    return dfd.promise;
  }

//  if (method === 'POST' || method === 'PUT') reqObj.contentType = 'application/json';

  //console.log("REQ", JSON.stringify(reqObj));

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
