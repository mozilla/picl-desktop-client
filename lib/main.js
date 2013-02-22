var keyserverClient = require('keyserver-client');

var client = new keyserverClient();

client.createUser({
  email: 'psawaya@mozilla.com'
}).then(function(result) {
  console.log(JSON.stringify(result));
});
