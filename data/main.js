
/* this file is loaded by the control panel, in a resource: URL, so it runs
 in the usual web-content context. */

var sendToBackend;
var myDeviceInfo;

function getDeviceIconPathForDeviceType(type) {
    if (type === 'computer') {
        return "img/devices/computer.png";
    }
    else {
        return "img/devices/mobile.png";
    }
}

function msgFromBackend(name, data) {
    console.log("msgFromBackend", name, data);

    if (name == "device-info") {
        $("#my-device-name").text(data.profileID);
        myDeviceInfo = data;
        console.log("set device name");
    }

    if (name == "auth-success") {
        $("#sign-in").hide();
        $("#user").text(data.user.email); // also .id, .hash, .provider
        $("#logged-in").show();
    }

    if (name == "tabs") {
        var $tabContainer = $("div#tabs");
        $tabContainer.empty();
        var devices = data;
        devices.sort(function (a,b) {
            if (a.clientName == myDeviceInfo.profileID) return -1;
            if (b.clientName == myDeviceInfo.profileID) return 1;
            return b.timestamp - a.timestamp;
        });
        devices.forEach(function(deviceInfo) {
            var timestamp = deviceInfo.timestamp || new Date().getTime();
            var date = new Date(timestamp);
            var $deviceEntry = $("#templates>div.device-entry").clone();
            if (deviceInfo.clientName === myDeviceInfo.profileID) {
                $deviceEntry.find(".device-name").text("This computer");
                $deviceEntry.find(".last-synced-time").text('now');
                $deviceEntry.find(".device-icon").attr("src", getDeviceIconPathForDeviceType('computer'));
            }
            else {
                $deviceEntry.find(".device-name").text(deviceInfo.clientName);
                $deviceEntry.find(".last-synced-time").text(date.toLocaleString());
                $deviceEntry.find(".device-icon").attr("src", getDeviceIconPathForDeviceType(deviceInfo.deviceType));
            }

            var tabs = deviceInfo.tabs || [];
            // var tul = dul.find("ul.device-tabs");
            var $deviceTabs = $deviceEntry.find(".device-tabs");
            tabs = tabs.filter(function (tab) {
                return (tab.title !== "My Tabs" && tab.title !== "TabThing");
            });
            tabs.forEach(function(tab) {
                var title = tab.title;
                var $t = $("#templates>.tab-entry").clone();
                var url = tab.url || tab.urlHistory[0];
                $t.find("a").attr("href", url).attr("target", "_blank");
                $t.find("a").text(title || url);
                if (tab.icon && tab.icon.indexOf("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8") === -1) {
                    $t.find(".tab-favicon").attr("src", tab.icon);
                }
                else if (tab.thumbnail) {
                    $t.find(".tab-favicon").hide();
                    $t.find(".tab-thumbnail").show().attr("src", tab.thumbnail);
                }
                else {
                    $t.find(".tab-favicon").attr("src", "img/globe.ico");
                }
                $deviceTabs.append($t);
            });
            if (tabs.length > 0 || deviceInfo.clientName === myDeviceInfo.profileID) $tabContainer.append($deviceEntry);
        });
    }

    // if (name == "tabs") {
    //     var ul = $("div#tabs > ul");
    //     ul.empty();
    //     var devices = data;
    //     devices.forEach(function(deviceInfo) {
    //         var online = deviceInfo.timestamp
    //         var dul = $("#templates>.device-entry").clone();
    //         dul.find("span.device-name").text(deviceInfo.clientName);
    //         if (deviceInfo.clientName == myDeviceInfo.profileID)
    //             dul.addClass("my-device");
    //         if (online)
    //             dul.addClass("online");
    //         else
    //             dul.addClass("offline");
    //         ul.append(dul);
    //         var tul = dul.find("ul.device-tabs");
    //         var tabs = deviceInfo.tabs || [];
    //         tabs.forEach(function(tab) {
    //             var title = tab.title || "(no title)";
    //             var t = $("#templates>.tab-entry").clone();
    //             var url = tab.url || tab.urlHistory[0];
    //             t.find("a").attr("href", url).attr("target", "_blank");
    //             t.find("a").text(title);
    //             if (tab.icon)
    //                 t.find("img.tab-favicon").attr("src", tab.icon);
    //             else
    //                 t.find("img.tab-favicon").remove();
    //             tul.append(t);
    //         });
    //     });
    // }
    console.log("done");
}


function showError(text) {
    $("#error").show().text(text);
}



$(function() {
    console.log("page loaded");
    // we are running in a FF addon
    sendToBackend = function(name, data) {
        /* the addon injects code to catch our "from-content" messages
         and relay them to the backend. It also fires "to-content"
         events on the window when the backend wants to tell us
         something. */
        console.log(["to-backend(JP)", name, data||{}]);
        var e = new CustomEvent("from-content",
                                {detail: {name: name, data: data||{} }});
        window.dispatchEvent(e);
    };
    function backendListener(e) {
        var msg = JSON.parse(e.detail);
        try {
            msgFromBackend(msg.name, msg.data);
        } catch (e) {
            // apparently exceptions raised during event listener
            // functions aren't printed to the error console
            console.log("exception in msgFromBackend");
            console.log(e);
        }
    }
    window.addEventListener("to-content", backendListener);
    // we wait for the page to finish loading *and* the addon's page-mod
    // to finish wiring up its event listener before trying to talk to
    // the addon backend
    function commsReady(e) {
        sendToBackend("page-ready");
    }
    window.addEventListener("comms-ready", commsReady);

    // set up the UI
    $("#error").hide();
    $("#sign-in").show();
    $("#logged-in").hide();
    //$("#sign-in").on("click", doFBPersonaAuth);

});
