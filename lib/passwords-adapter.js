const {Cc,Ci,Cu} = require("chrome");

var passwords = require('passwords');

var _ = require('lib/underscore');

var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

var PasswordFormats = {
  PICLToLoginManager: function(PICLPassword) {
    // Prepare a password object from the server for entry into
    // jetpack's passwords.store
    return {
      url: PICLPassword.loginurl || '',
      formSubmitURL: PICLPassword.loginurl || PICLPassword.url || '',
      username: PICLPassword.username || '',
      password: PICLPassword.password || ''
    }
  },
  loginManagerToPICL: function(loginManagerPassword) {
    var loginMeta = loginManagerPassword.QueryInterface(Ci.nsILoginMetaInfo);
    return {
      guid: loginMeta.guid,
      url: loginManagerPassword.url,
      loginurl: loginManagerPassword.formSubmitURL || '',
      username: loginManagerPassword.username || '',
      password: loginManagerPassword.password || '',
      // TODO: Be mindful of timezones
      lastModified: loginMeta.timePasswordChanged || (Date.now())
    };
  }
}

var PasswordsAdapter = (function() {
  function addPasswords(remotePasswords) {
    _.each(remotePasswords, function(remotePassword) {
      var formattedLogin = PasswordFormats.PICLToLoginManager(remotePassword);

      // TODO: Add passwords without jetpack passwords module
      passwords.store(formattedLogin);
    });
  }

  function exportLocalPasswords() {
    var credentials = loginManager.getAllLogins();
    var formattedLogins = credentials.map(PasswordFormats.loginManagerToPICL);
    return formattedLogins;
  }
  return {
    addPasswords: addPasswords,
    exportLocalPasswords: exportLocalPasswords,
  };
})();

module.exports = PasswordsAdapter;