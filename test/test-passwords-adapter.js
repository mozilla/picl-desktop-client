const { Cc, Ci, Cu, CC } = require("chrome");
var PasswordsAdapter = require('passwords-adapter');
const loginManager = Cc["@mozilla.org/login-manager;1"].
                     getService(Ci.nsILoginManager);
const L = require('logger');

const TEST_PASSWORD_DATA = {
  hostname: "http://www.mozilla.com",
  formSubmitURL: "http://login.mozilla.com",
  username: "mrtest",
  password: "testtest",
  usernameField: "un",
  passwordField: "pw",
  id: "{d4e1a1f6-5ea0-40ee-bff5-da57982f21cf}"
};

exports['test update and read local passwords'] = function (assert, done) {
  loginManager.removeAllLogins();
  PasswordsAdapter.updateLocalPasswords([
    TEST_PASSWORD_DATA
  ]);

  let prop = Cc["@mozilla.org/hash-property-bag;1"].
      createInstance(Ci.nsIWritablePropertyBag2);
  prop.setPropertyAsAUTF8String("guid", TEST_PASSWORD_DATA.id);

  let logins = loginManager.searchLogins({}, prop);
  let login = logins[0];

  assert.equal(logins.length, 1, "Should have created a single login");
  assert.equal(login.hostname, TEST_PASSWORD_DATA.hostname, "Should create the login with correct URL");
  assert.equal(login.formSubmitURL, TEST_PASSWORD_DATA.formSubmitURL, "Should create the login with correct formSubmitURL");
  assert.equal(login.username, TEST_PASSWORD_DATA.username, "Should create the login with correct username");
  assert.equal(login.password, TEST_PASSWORD_DATA.password, "Should create the login with correct password");
  assert.equal(login.usernameField, TEST_PASSWORD_DATA.usernameField, "Should create the login with correct usernameField");
  assert.equal(login.passwordField, TEST_PASSWORD_DATA.passwordField, "Should create the login with correct passwordField");
  login.QueryInterface(Ci.nsILoginMetaInfo);
  assert.equal(login.guid, TEST_PASSWORD_DATA.id, "Should create the login with correct id");
  done();
};

require("sdk/test").run(exports);
