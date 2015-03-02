/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// Dependencies
var ballpark = require('./ballpark');
var app = ballpark();
var Node = require("./node");

app.configure({
    'webserver_address': process.env.IP,
    'webserver_port': process.env.PORT,
    'database_address': process.env.IP,
    'database_port': 27017
});

app.get("/nodes", function(req, resp) {
    app.getAllNodes(function(nodes) {
        resp.send(nodes);
    });
});

app.get("/node", function(req, resp) {
   var id = req.params.id;
   app.getNode(id, function(node) {
       resp.send(node);
   });
});

app.post("/node", function(req, resp) {
    var lon = req.params.lon;
    var lat = req.params.lat;
    var alt = req.params.alt;
    var acc = req.params.acc;
    var node = new Node(lon, lat);
    if(alt) {
        node.addAltitude(alt);
    }
    if(acc) {
        node.addAccuracy(acc);
    }
    var tags = req.params.tags.split(',');
    for(i in tags) {
        var tag = tags[i].toString();
        var pair = tag.split('=');
        node.addTag(pair[0], pair[1]);
    }
    app.addNode(node, function(response) {
       resp.send(response); 
    });
});

app.get("/ways", function(req, resp) {
    app.getAllWays(function(ways) {
       resp.send(ways);
    })
});

app.get("/way", function(req, resp) {
    var id = req.params.id;
    app.getWay(function(way) {
        resp.send(way);
    });
});

app.get("/", function(req, resp) {
    resp.send("<h1>Add Node</h1>\n" +
              "<form action='/node' method='post' id='nodeCreationForm'>" +
              "Latitude:<br><input type='text' name='lat' required><br>" +
              "Longitude:<br><input type='text' name='lon' required><br>" +
              "Altitude:<br><input type='text' name='alt'><br>" +
              "Accuracy:<br><input type='text' name='acc'><br>" +
              "<br>" +
              "<textarea name='tags' placeholder='Comma separated tags'></textarea><br>"  +
              "<input type='submit' value='Create'><br>" +
              "</form>"
              );
});

app.post("/test", function(req, resp) {
    resp.send("called post request handle on path: /test");
})

app.start(function(url) {
    console.log("Connected to server: " + url)
});