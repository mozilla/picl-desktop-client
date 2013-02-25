var keyserverClient = require('keyserver-client');

var client = new keyserverClient();

client.createUser({
  email: 'psawaya@mozilla.com'
}).then(function(result) {
  //console.log(JSON.stringify(result));
});

var menuitemPull = require("menuitems").Menuitem({
  id: "syncPull",
  menuid: "menu_ToolsPopup",
  label: "PICL Pull",
  onCommand: function() {
    console.log("clicked");
  },
  insertbefore: "menu_pageInfo"
});

var menuitemPush = require("menuitems").Menuitem({
  id: "syncPush",
  menuid: "menu_ToolsPopup",
  label: "PICL Push",
  onCommand: function() {
    console.log("clicked");
  },
  insertbefore: "menu_pageInfo"
});
