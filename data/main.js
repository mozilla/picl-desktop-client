
/* this file is loaded by the control panel, in a resource: URL, so it runs
 in the usual web-content context. */

var sendToBackend;
var myDeviceInfo;

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
        var ul = $("div#tabs > ul");
        ul.empty();
        var devices = data;
        devices.forEach(function(deviceInfo) {
            var online = deviceInfo.timestamp
            var dul = $("#templates>.device-entry").clone();
            dul.find("span.device-name").text(deviceInfo.clientName);
            if (deviceInfo.clientName == myDeviceInfo.profileID)
                dul.addClass("my-device");
            if (online)
                dul.addClass("online");
            else
                dul.addClass("offline");
            ul.append(dul);
            var tul = dul.find("ul.device-tabs");
            var tabs = deviceInfo.tabs || [];
            tabs.forEach(function(tab) {
                var title = tab.title || "(no title)";
                var t = $("#templates>.tab-entry").clone();
                var url = tab.url || tab.urlHistory[0];
                t.find("a").attr("href", url).attr("target", "_blank");
                t.find("a").text(title);
                if (tab.icon)
                    t.find("img.tab-favicon").attr("src", tab.icon);
                else
                    t.find("img.tab-favicon").remove();
                tul.append(t);
            });
        });
    }
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
