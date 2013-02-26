const SyncMediator = require('sync-mediator');
const KeyServerClient = require('key-server-client');
const L = require('logger');

var client = new KeyServerClient();
var syncMediator;

const TEST_EMAIL = 'test@mozilla.com';

function setupSyncMediator() {
  function createUser(cb) {
    return client.createUser({
      email: TEST_EMAIL
    }).then(cb);
  }

  function getUser() {
    client.getUser({
      email: 'test@mozilla.com'
    }).then(function(result) {
      var user = { id: result.kA, token: result.kA };
      syncMediator = new SyncMediator(user);
      L.log('got user');
    }, function(err) {
      L.log('error getting user, trying to create', err.message);
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

setupSyncMediator();

var menuitemPull = require("menuitems").Menuitem({
  id: "syncPull",
  menuid: "menu_ToolsPopup",
  label: "PICL Pull",
  onCommand: function() {
    console.log("clicked pull");
    if (syncMediator) syncMediator.pull();
    else L.log("Sync mediator not ready");
  },
  insertbefore: "menu_pageInfo"
});

var menuitemPush = require("menuitems").Menuitem({
  id: "syncPush",
  menuid: "menu_ToolsPopup",
  label: "PICL Push",
  onCommand: function() {
    console.log("clicked push");
    if (syncMediator) syncMediator.push();
    else L.log("Sync mediator not ready");
  },
  insertbefore: "menu_pageInfo"
});
