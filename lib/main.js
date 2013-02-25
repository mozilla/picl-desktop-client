const SyncMediator = require('sync-mediator');
const KeyServerClient = require('key-server-client');
const L = require('logger');

var client = new KeyServerClient();
var syncMediator;

client.getUser({
  email: 'test@mozilla.com'
}).then(function(result) {
  var user = { id: result.kA, token: result.kA };
  syncMediator = new SyncMediator(user);
});

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
