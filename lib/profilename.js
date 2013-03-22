
const { Cc, Ci } = require("chrome");
const file = require("sdk/io/file");

let profdir = require("system").pathFor("ProfD");
let p = Cc["@mozilla.org/toolkit/profile-service;1"]
    .getService(Ci.nsIToolkitProfileService);

exports.profileName = "";

// from the old weave code, modules/engines/clients.js

let profiles = p.profiles;
while (profiles.hasMoreElements()) {
    let profile = profiles.getNext().QueryInterface(Ci.nsIToolkitProfile);
    if (profdir == profile.rootDir.path) {
        // Only bother adding the profile name if it's not "default"
        exports.profileName = profile.name; // maybe "default"
        break;
    }
}

exports.profileDir = file.basename(profdir);
