// Dependencies
var api = require("./api");
var request = require("request");

// initialise types
var app = api.app;
var Node = api.namespace.Node;
var Way = api.namespace.Way;
var Relation = api.namespace.Relation;

/**
 * Define additional routes required for browser consumption
 * ---------------------------------------------------------
 * Default root url: /api/
 **/
 
app.get("/", function(req, resp) {
    resp.send("Hello World");
})

app.setUp(function() {
    console.log("initialised application");
    app.start(function(url) {
        console.log("connected to server: " + url);
    });
});
