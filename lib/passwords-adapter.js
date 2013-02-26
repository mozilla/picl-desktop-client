const { Cc, Ci, Cu, CC } = require("chrome");
const loginManager = Cc["@mozilla.org/login-manager;1"].
                     getService(Ci.nsILoginManager);
const LoginInfo = CC("@mozilla.org/login-manager/loginInfo;1",
                     Ci.nsILoginInfo, "init");
const L = require('logger');
const { URL: parseURL } = require("url");
const { uri: ADDON_URI } = require("self");

// Good reference on how sync handles passwords:
// https://github.com/mozilla/mozilla-central/blob/master/services/sync/modules/engines/passwords.js

//function filterMatchingLogins(loginInfo)
//  Object.keys(this).every(function(key) loginInfo[key] === this[key], this);

/**
 * Removes `user`, `password` and `path` fields from the given `url` if it's
 * 'http', 'https' or 'ftp'. All other URLs are returned unchanged.
 * @example
 * http://user:pass@www.site.com/foo/?bar=baz#bang -> http://www.site.com
 */
function normalizeURL(url) {
  let { scheme, host, port } = parseURL(url);
  // We normalize URL only if it's `http`, `https` or `ftp`. All other types of
  // URLs (`resource`, `chrome`, etc..) should not be normalized as they are
  // used with add-on associated credentials path.
  return scheme === "http" || scheme === "https" || scheme === "ftp" ?
         scheme + "://" + (host || "") + (port ? ":" + port : "") :
         url
}

function Login(passwordInfo) {
  let login = Object.create(Login.prototype);
  Object.keys(passwordInfo || {}).forEach(function(key) {
    if (key === 'url')
      login.hostname = normalizeURL(passwordInfo.url);
    else if (key === 'formSubmitURL')
      login.formSubmitURL = passwordInfo.formSubmitURL ?
                            normalizeURL(passwordInfo.formSubmitURL) : null;
    else if (key === 'realm')
      login.httpRealm = passwordInfo.realm;
    else
      login[key] = passwordInfo[key];
  });
  if (passwordInfo.QueryInterface) {
    let loginMeta = passwordInfo.QueryInterface(Ci.nsILoginMetaInfo);
    if (loginMeta) {
      this.id = loginMeta.guid;
      // TODO: do we want to sync these?
      // this.timeCreated = loginMeta.timeCreated || 0;
      // this.timeLastUsed = loginMeta.timeLastUsed || 0;
      // this.timePasswordChanged = loginMeta.timePasswordChanged || 0;
      // this.timesUsed = loginMeta.timesUsed || 0;
    }
  }
  return login;
}

Login.prototype.toJSON = function toJSON() {
  return {
    url: this.hostname || ADDON_URI,
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
  let { url, realm, formSubmitURL, username, password, usernameField,
        passwordField, id } = this.toJSON();

  let loginInfo = new LoginInfo(url, formSubmitURL, realm, username, password,
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
  passwords.forEach(function (password) {
    var login = Login(password),
        loginInfo = login.toLoginInfo(),
        propertyBag = login.getLoginMetaAsPropertyBag()
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
