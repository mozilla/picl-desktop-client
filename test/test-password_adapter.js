var _ = require('lib/underscore');
var PasswordAdapter = require('password_adapter').PasswordAdapter;

exports['test add and export passwords'] = function(assert,done) {
  var passwordData = 
    {
      url: "http://mozilla.com",
      loginurl: "http://mozilla.com/login",
      username: "mrtest",
      password: "testtest"
    };
  PasswordAdapter.addPasswords([
    passwordData
  ]);
    
  PasswordAdapter.exportLocalPasswords(function(passwords) {
    // There should only be one credential stored
    assert.ok(passwords.length == 1, "One credential was returned");
    var password = passwords[0];
    console.log('passwords: ', JSON.stringify(passwords));
    var passwordProperties = _.keys(passwordData);
    for (var x = 0; x < passwordProperties.length; x++) {
      var propertyName = passwordProprties[x];
      assert.equal(passwordData[propertyName], firstPassword[propertyName]);
    }
    done();
  });
}