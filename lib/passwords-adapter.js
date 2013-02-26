const { Cc, Ci, Cu, CC } = require("chrome");
const loginManager = Cc["@mozilla.org/login-manager;1"].
                     getService(Ci.nsILoginManager);
const LoginInfo = CC("@mozilla.org/login-manager/loginInfo;1",
                     Ci.nsILoginInfo, "init");
const L = require('logger');

// Good reference on how sync handles passwords:
// https://github.com/mozilla/mozilla-central/blob/master/services/sync/modules/engines/passwords.js

//function filterMatchingLogins(loginInfo)
//  Object.keys(this).every(function(key) loginInfo[key] === this[key], this);

// TODO: this has only been tested with web page passwords
function Login(passwordInfo) {
  let login = Object.create(Login.prototype);
  Object.keys(passwordInfo || {}).forEach(function(key) {
    login[key] = passwordInfo[key];
  });
  if (passwordInfo.QueryInterface) {
    passwordInfo.QueryInterface(Ci.nsILoginMetaInfo);
    login.id = passwordInfo.guid;
    // TODO: do we want to sync these?
    // login.timeCreated = loginInfo.timeCreated || 0;
    // login.timeLastUsed = loginInfo.timeLastUsed || 0;
    // login.timePasswordChanged = loginInfo.timePasswordChanged || 0;
    // login.timesUsed = loginInfo.timesUsed || 0;
  }
  return login;
}

Login.prototype.toJSON = function toJSON() {
  return {
    hostname: this.hostname || null,
    realm: this.httpRealm || null,
    formSubmitURL: this.formSubmitURL || null,
    username: this.username || null,
    password: this.password || null,
    usernameField: this.usernameField || '',
    passwordField: this.passwordField || '',
    id: this.id || '' // TODO: one if this is missing
    // TODO: do we want to sync these?
    // timeCreated: this.timeCreated || 0,
    // timeLastUsed: this.timeLastUsed || 0,
    // timePasswordChanged: this.timePasswordChanged || 0,
    // timesUsed: this.timesUsed || 0
  };
};

Login.prototype.toLoginInfo = function toLoginInfo() {
  let { hostname, realm, formSubmitURL, username, password, usernameField,
        passwordField, id } = this.toJSON();

  let loginInfo = new LoginInfo(hostname, formSubmitURL, realm, username, password,
                       usernameField, passwordField);
  loginInfo.QueryInterface(Ci.nsILoginMetaInfo);
  loginInfo.guid = id;
  return loginInfo;
};

Login.prototype.getLoginMetaAsPropertyBag = function() {
  let { id, timeCreated, timeLastUsed,
          timePasswordChanged, timesUsed } = this.toJSON();

  var props = Cc["@mozilla.org/hash-property-bag;1"].createInstance(Ci.nsIWritablePropertyBag);
  props.setProperty('guid', id);
  props.setProperty('timeCreated', timeCreated || 0);
  props.setProperty('timeLastUsed', timeLastUsed || 0);
  props.setProperty('timePasswordChanged', timePasswordChanged || 0);
  props.setProperty('timesUsed', timesUsed || 0);
  return props;
}

function loginToJSON(value) Login(value).toJSON()

// Public interface
function updateLocalPasswords(passwords) {
  passwords.forEach(function (passwordInfo) {
    var login = Login(passwordInfo),
        loginInfo = login.toLoginInfo();
    loginManager.addLogin(loginInfo);
  });
}

function readLocalPasswords() {
  return loginManager.getAllLogins()
//                       .filter(filterMatchingLogins, Login(options))
                     .map(loginToJSON);
}

module.exports.updateLocalPasswords = updateLocalPasswords;
module.exports.readLocalPasswords = readLocalPasswords;
