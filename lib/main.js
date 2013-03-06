const { Cc, Ci, Cu, CC } = require("chrome");
const SyncMediator = require('sync-mediator');
const KeyServerClient = require('key-server-client');
const L = require('logger');
const self = require('self');
const base64 = require("sdk/base64");
const placesAdapter = require('places-adapter');

Cu.import('resource://gre/modules/XPCOMUtils.jsm');

const addonOrigin = self.data.url("").split("/").slice(0,3).join("/");
const REQUEST_OPTIONS = { siteName: "PICL ROCKS 20x6" }

var client = new KeyServerClient();
var syncMediator;

//const TEST_EMAIL = 'test@mozilla.com';

function setupSyncMediator(email, callback) {
  function createUser(cb) {
    L.log("creating user");
    return client.createUser({
      email: email
    }).then(cb);
  }

  function getUser() {
    client.getUser({
      email: email
    }).then(function(result) {
      var user = { id: result.kA, token: result.kA };
      syncMediator = new SyncMediator(user);
      L.log('got user');
      if (callback) callback();
    }, function(err) {
      L.log('error getting user, trying to create', err);
      // If the user doesn't exist, create and try again
      if (err.message == 'UnknownUser') {
        createUser(function() {
          getUser();
        });
      }
    });
  }
  getUser();
}

var loginCallback;

var menuitemPull = require("menuitems").Menuitem({
  id: "syncPull",
  menuid: "menu_ToolsPopup",
  label: "PICL Pull",
  onCommand: function() {
    console.log("clicked pull");
    if (syncMediator) syncMediator.pull();
    else {
      loginCallback = this.onCommand;
      SignInToBrowserService.request(REQUEST_OPTIONS);
    }
  },
  insertbefore: "menu_pageInfo"
});

var menuitemPush = require("menuitems").Menuitem({
  id: "syncPush",
  menuid: "menu_ToolsPopup",
  label: "PICL Push",
  onCommand: function() {
    console.log("clicked push", syncMediator);
    if (syncMediator) syncMediator.push();
    else {
      loginCallback = this.onCommand;
      SignInToBrowserService.request(REQUEST_OPTIONS);
    }
  },
  insertbefore: "menu_pageInfo"
});

var menuitemPush = require("menuitems").Menuitem({
  id: "logout",
  menuid: "menu_ToolsPopup",
  label: "PICL Logout",
  onCommand: function() {
    syncMediator = null;
    SignInToBrowserService.logout();
  },
  insertbefore: "menu_pageInfo"
});


function decodeUrlSafeBase64(base64String) {
  if (!base64String) {
    return "";
  }
  var paddingChars =  (- base64String.length) % 4;
  if (paddingChars < 0) {
    paddingChars += 4;
  }
  var padding = "";
  for (var i=0;i<paddingChars;i++) {
    padding += "=";
  }
  return base64.decode(base64String.replace(/-/g,"+").replace(/_/g,"/") + padding);
}

function getEmailFromAssertion(assertion) {
  var parts = assertion.split('.'),
      header = parts[0],
      claim = parts[1],
      payload = parts[3];
  claim = JSON.parse(decodeUrlSafeBase64(claim));
  return claim.principal.email;
}

XPCOMUtils.defineLazyModuleGetter(this, 'SignInToBrowserService',
  'resource://gre/modules/identity/MinimalIdentity.jsm');

if (typeof SignInToBrowserService !== "undefined") {
  SignInToBrowserService.watch({
    onlogin: function(assertion) { setupSyncMediator(getEmailFromAssertion(assertion), loginCallback); },
    onready: function() { L.log("SIGNIN READY"); },
    onlogout: function() { L.log("onlogout"); },
    origin: addonOrigin
  });
}

placesAdapter.readAllBookmarks().
then(function(result) {
  L.log("result\n", result);
}).
then(null, function(error) {
  L.log("error", error);
});

