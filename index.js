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
    resp.send("<html>"+
                "<head>"+
                "</head>"+
                "<body>"+
                    "<h1>Ballpark.js API</h1>"+
                    "<div id='nodeSection'>"+
                        "<form action='/api/node' method='post' id='nodeCreationForm'>" +
                              "Latitude:<br><input type='text' name='lat' required><br>" +
                              "Longitude:<br><input type='text' name='lon' required><br>" +
                              "<br>" +
                              "<textarea name='tags' placeholder='Comma separated tags'></textarea><br>"  +
                              "<input type='submit' value='Create'><br>" +
                        "</form>"+
                    "</div>"+
                "</body>"+
             "</html>");
})

app.setUp(function() {
    console.log("initialised application");
    app.start(function(url) {
        console.log("connected to server: " + url);
    });
});
