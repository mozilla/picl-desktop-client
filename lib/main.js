const { Cc, Ci, Cu, CC } = require("chrome");
const SyncMediator = require('sync-mediator');
const KeyServerClient = require('key-server-client');
const L = require('logger');
const self = require('self');
const system = require('sdk/system');
const base64 = require("sdk/base64");

// Tabs requires
const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

Cu.import('resource://gre/modules/XPCOMUtils.jsm');

Cu.import('resource://gre/modules/identity/MinimalIdentity.jsm');

const addonOrigin = self.data.url("").split("/").slice(0,3).join("/");

const ORIGIN = 'https://firefox.com';

var testEmail = system.staticArgs.email || 'test0321GO@mozilla.com';//test+demo1@mozilla.com';

var client = new KeyServerClient();
var syncMediator;

function setupSyncMediator(args, callback) {
  var assertion, email;
  if (args.assertion) assertion = args.assertion;
  else if (args.email) email = args.email;

  function createUser(cb) {
    L.log("creating user");//, assertion, email);
    return client.createUser({
      assertion: assertion,
      email: email
    }).then(cb);
  }

  function getUser() {
    L.log("Trying to get user", getEmailFromAssertion(assertion));
    client.getUser({
      assertion: assertion,
      email: email
    }).then(function(result) {
      var user = { id: result.kA, token: result.kA };
      syncMediator = new SyncMediator(user);
      L.log("created SyncMediator");//, assertion, email, result.kA);
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

if (typeof(IdentityService) !== "undefined" && typeof(IdentityService.getIdentity) === 'function') {

  var menuitemLogin = require("menuitems").Menuitem({
    id: "browserLogin",
    menuid: "menu_ToolsPopup",
    label: "Persona Login",
    onCommand: function() {
      tabs.open('chrome://browser/content/browser-id-signIn.html');
    },
    insertbefore: "menu_pageInfo"
  });

  var menuitemLogout = require("menuitems").Menuitem({
    id: "browserLogout",
    menuid: "menu_ToolsPopup",
    label: "Persona Logout",
    onCommand: function() {
      IdentityService.signOut();
      if (!syncMediator) return;
      else {
        syncMediator.stopPolling();
        syncMediator = null;
      }
    },
    insertbefore: "menu_pageInfo"
  });
}

var menuitemStart = require("menuitems").Menuitem({
  id: "syncStart",
  menuid: "menu_ToolsPopup",
  label: "PICL Start",
  onCommand: function() {
    if (syncMediator) {
      syncMediator.startPolling();
    }
    else {
      loginCallback = function () {
        L.log("SyncMediator ready");
        tabs.open(data.url("main.html"));
        syncMediator.startPolling();
      };
      if (typeof(IdentityService) !== "undefined" && typeof(IdentityService.getIdentity) === 'function') {
        IdentityService.getIdentity({ origin: ORIGIN },
          function (assertion) {
            //L.log("assertion", assertion);
            if (assertion) {
              let email = getEmailFromAssertion(assertion);
              //L.log("Logging in as", email);
              setupSyncMediator({ assertion: assertion }, loginCallback);
            }
            else {
              L.log("YOU GOTTA LOG IN FIRST");
            }
          });
      } else {
        setupSyncMediator({ email: testEmail }, loginCallback);
      }
    }
  },
  insertbefore: "menu_pageInfo"
});

var menuitemStop = require("menuitems").Menuitem({
  id: "syncStop",
  menuid: "menu_ToolsPopup",
  label: "PICL Stop",
  onCommand: function() {
    if (!syncMediator) return;
    else {
      syncMediator.stopPolling();
    }
  },
  insertbefore: "menu_pageInfo"
});


var menuitemTabsUI = require("menuitems").Menuitem({
  id: "tabsUI",
  menuid: "menu_ToolsPopup",
  label: "PICL Tabs",
  onCommand: function() {
    if (!syncMediator) {
      console.log("Do PICL start first");
    }
    else {
      tabs.open(data.url("main.html"));
    }
  },
  insertbefore: "menu_pageInfo"
});

var menuitemClear = require("menuitems").Menuitem({
  id: "clear",
  menuid: "menu_ToolsPopup",
  label: "PICL Clear",
  onCommand: function() {
    if (syncMediator) syncMediator.clear();
  },
  insertbefore: "menu_pageInfo"
});


// This is for signing in to the browser and handling assertions

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
  return claim.principal.email || claim.principal['unverified-email'];
}

// // Tabs specific stuff

// widgets.Widget({
//   id: "show-tabthing",
//   label: "Show Tabs From Other Computers",
//   contentURL: data.url("icons/tab-new-6.png"),
//   onClick: function() {
//     tabs.open(data.url("main.html"));
//   }
// });


