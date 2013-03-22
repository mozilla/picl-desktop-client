
const { Cc, Ci } = require("chrome");
//const appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
const sysInfo = Cc["@mozilla.org/system-info;1"].getService(Ci.nsIPropertyBag2);
exports.hostname = sysInfo.get("host");


