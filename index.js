/**
 * index.js
 * ----------------------------
 * A mock browser friendly interface
 * to domenstrate the framework.
 */

// Dependencies
var api = require("./api");
var request = require("request");

// initialise types
var app = api.app;
var Node = api.Node;
var Way = api.Way;
var Relation = api.Relation;

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
                        "<h2>Node Form</h2>" +
                        "<form action='/api/node' method='post' id='nodeCreationForm'>" +
                              "Latitude:<br><input type='text' name='lat' required><br>" +
                              "Longitude:<br><input type='text' name='lon' required><br>" +
                              "Altitude:<br><input type='text' name='altitude' required><br>" +
                              "Accuracy:<br><input type='text' name='accuracy' required><br>" +
                              "Heading:<br><input type='text' name='heading' required><br>" +
                              "Speed:<br><input type='text' name='speed' required><br>" +
                              "<br>" +
                              "<textarea name='tags' placeholder='Comma separated tags'></textarea><br>"  +
                              "<br>" +
                              "<input type='submit' value='Create'><br>" +
                        "</form>"+
                    "</div>"+
                "</body>"+
             "</html>");
})

/**
 * Start the web server
 **/
app.setUp(function() {
    console.log("initialised application");
    app.clearData(function() {
        app.start(function(url) {
            console.log("connected to server: " + url);
            generateData();
        });
    });
});

/**
 * Generate example data
 **/
function generateData() {
    for(var i = 1; i <= 5; i++) {
        var nId;
        var node = new Node({
            location: [(Math.random()*180), Math.random()*90],
        });
        node.save(function(err, n) {
            var way = new Way({
                nodes: [n._id]
            });
            nId = n._id;
            way.save(function(err, w) {
                console.log(nId);
                var relation = new Relation({
                    members: [{ _id: w._id, type: 'way', role: 'area' },
                              { _id: nId, type: 'node', role: 'point' }],
                });
                relation.save(function(err, r) {
                });
            });
        });
    }
}
