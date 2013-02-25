var _ = require('lib/underscore');
var PasswordsAdapter = require('passwords-adapter');

exports['test add and export Passwords'] = function(assert,done) {
  var passwordData =
    {
      url: "http://mozilla.com",
      loginurl: "http://mozilla.com/login",
      username: "mrtest",
      password: "testtest"
    };
  PasswordsAdapter.addPasswords([
    passwordData
  ]);

  PasswordsAdapter.exportLocalPasswords(function(passwords) {
    // There should only be one credential stored
    assert.ok(passwords.length == 1, "One credential was returned");
    var passwords = passwords[0];
    console.log('Passwords: ', JSON.stringify(passwords));
    var passwordsProperties = _.keys(passwordData);
    for (var x = 0; x < passwordsProperties.length; x++) {
      var propertyName = passwordsProprties[x];
      assert.equal(passwordsData[propertyName], firstPasswords[propertyName]);
    }
    done();
  });
}