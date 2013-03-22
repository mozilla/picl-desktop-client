const L = require('logger');

var controlPages = [];

exports.sendToAll = function(name, data) {
    function sendToWorker(worker) {
        try {
            worker.port.emit("to-content", {name: name, data: data||{}});
        } catch(e) {
            // this happens when reloading a control-page. I think the
            // tab.onready triggers a sendToAll while the page is unavailable
            console.log("error while sending to-content", e);
        }
    }
    controlPages.forEach(sendToWorker);
};

const backend = require('tabs-adapter');

function addControlPage(worker) {
    controlPages.push(worker);
    function send(name, data) {
        //console.log("send", name, data);
        worker.port.emit("to-content", {name: name, data: data||{}});
    }
    worker.port.on("from-content", function (data) {
        //console.log("comms.from-content", JSON.stringify(data));
        backend.fromContent(send, data.name, data.data);
    });

    //XXX.sendToAllContent("hello content", {foo: "baz"});

    //worker.port.emit("to-content", {msg: "to-content message body here"});

    worker.on("detach", function() {
                  var index = controlPages.indexOf(worker);
                  if (index != -1)
                      controlPages.splice(index, 1);
                  //console.log("now "+controlPages.length+" workers");
                  });
    //console.log("control panel (#"+controlPages.length+") ready");
};

const pagemod = require("page-mod");
const data = require("self").data;
exports.setupComms = function() {
    pagemod.PageMod({ include: data.url("main.html"),
                      contentScriptFile: data.url("addon-comms.js"),
                      contentScriptWhen: "end",
                      onAttach: addControlPage
                    });
};

