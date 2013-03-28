
const tabs = require("tabs");
const L = require('logger');
const { defer, resolve, promised } = require('sdk/core/promise');

var shuttingDown = false;

require("sdk/system/unload").when(function(why) {
    console.log("unload", why);
    shuttingDown = true;
});

// CALL startWatchingTabs WHEN YOU ARE ABLE TO PUSH TO THE SERVER
var watchingTabs = false;
function startWatchingTabs() {
    if (watchingTabs)
        return;
    require("tabs").on("ready", myTabsWereModified);
    require("tabs").on("close", myTabsWereModified);
    myTabsWereModified();
}

var deviceInfo;
function setDeviceInfo(info) {
    console.log("setting deviceInfo", JSON.stringify(info));
    deviceInfo = info;
};

function buildDeviceInfo() {
    var s = require("sdk/system");
    var file = require("sdk/io/file");
    var info = {
        user: s.env.USER || s.env.USERNAME,
        app: s.name,
        host: require("./hostname").hostname,
        profileName: require("./profilename").profileName,
        profileDir: file.basename(s.pathFor("ProfD"))
    };
    info.profileID = (info.host+"-"+info.profileDir).replace(/[\.\$\[\]\#\/]/g, "");
    return info;
}

setDeviceInfo(buildDeviceInfo());

var cachedTabsInfo = {};
function constructTabsInfo() {
  var keys = Object.keys(cachedTabsInfo);
  var result = [];
  keys.forEach(function (key) {
    result.push(cachedTabsInfo[key]);
  });
  return result;
}

// {
//     id: i assume the client id (nalexander?),
//     tabs: [ array of tabs, with the following format
//         {
//             title: the page title of the tab,
//             lastUsed: integer in epoch time,
//             icon: url to an icon
//             urlHistory: array of urls
//         }
//     ],
//     clientName: name of client (ex: FxSync on Nexus 4)
// }

function myTabsWereModified() {
  dirty = true;
}

function update(tabsInfo) {
  //L.log("TabsAdapter.update", tabsInfo);
  tabsInfo.forEach(function (info) {
    cachedTabsInfo[info.id] = info;
  });
  require('comms').sendToAll("tabs", constructTabsInfo());
  return resolve(null);
}

function read() {
    if (shuttingDown)
        return;
    var data = [];
    for each (var tab in tabs) {
        if (tab.url != "about:blank" && tab.url != "about:newtab")
            data.push({url: tab.url,
                       urlHistory: [ tab.url ],
                       title: tab.title,
                       icon: tab.favicon,
                       lastUsed: 0,
                       thumbnail: tab.getThumbnail()
                      });
    }
    // PUSH TO SERVER HERE
    //L.log("calling db.set", data);
    var tabsInfo = { clientName: deviceInfo.profileID, tabs: data, id: deviceInfo.profileID, deviceType: 'computer' };
    update([tabsInfo]);
    return resolve(tabsInfo);
}

var storage = require("sdk/simple-storage").storage;
var authed;
var allTabs;

function fromContent(send, name, data) {
    //console.log("fromContent", name, data);
    if (name == "page-ready") {
        // THIS MEANS A FRONTEND PAGE IS READY, so send it current data
        if (deviceInfo)
            send("device-info", deviceInfo);
        if (authed)
            send("auth-success", authed);
        if (allTabs)
            send("tabs", allTabs);
    }
}

var tracking = false;
var dirty = false;
var deletedGuids = [];

function hasChanges() {
  return dirty;
}

function clearHasChanges() {
  dirty = false;
}

function getDeletedGuids() {
  return deletedGuids;
}

function startTracking() {
  tracking = true;
  startWatchingTabs();
}

function stopTracking() {
  tracking = false;
}

module.exports = {
  read: read,
  update: update,
  fromContent: fromContent,
  startTracking: startTracking,
  stopTracking: stopTracking,
  hasChanges: hasChanges,
  clearHasChanges: clearHasChanges,
  getDeletedGuids: getDeletedGuids
};

require("./comms").setupComms();
