/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// Dependencies
var ballpark = require('./ballpark');
var app = ballpark();

app.configure({
    'webserver_address': process.env.IP,
    'webserver_port': process.env.PORT,
    'database_address': process.env.IP,
    'database_port': 27017
});

app.get("/nodes", function(req, resp) {
    console.log("get@nodes");
    app.getAllNodes(function(nodes) {
        resp.send(nodes);
    });
});

app.get("/node", function(req, resp) {
    console.log("get@node");
    var id = req.params.id;
    app.getNode(id, function(node) {
        resp.send(node);
    });
});

app.get("/node/xml", function(req, resp) {
    console.log("get@node/xml");
    var id = req.params.id;
    app.getNode(id, function(node) {
        resp.format = 'xml';
        resp.send(node);
    });
});

app.post("/node", function(req, resp) {
    console.log("post@node");
    var lon = req.params.longitude;
    var lat = req.params.latitude;
    var alt = req.params.altitude;
    var acc = req.params.accuracy;
    app.createNode(lon, lat, alt, acc, function(node) {
        console.log("created node: " + node);
        // parse tags
        if (typeof req.params.tags !== "undefined") {
            var tags = req.params.tags.split(',');
            for (i in tags) {
                var tag = tags[i].toString();
                var pair = tag.split('=');
                node.tags[pair[0]] = pair[1];
            }
        }
        
        // save node
        app.saveNode(node, function(save) {
            console.log("saved node: " + save);
            resp.send(save);
        });
    });
});

app.get("/ways", function(req, resp) {
    console.log("get@ways");
    app.getAllWays(function(result) {
        resp.send(result);
    });
});

app.get("/way", function(req, resp) {
    console.log("post@way");
    var id = req.params.id;
    app.getWay(id, function(result) {
        resp.send(result); 
    });
});

app.get("/relations", function(req, resp) {
    console.log("get@relations");
    app.getAllRelations(function(result) {
        resp.send(result);
    });
});

app.get("/relation", function(req, resp) {
    console.log("post@relation");
    var id = req.params.id;
    app.getRelation(id, function(result) {
        resp.send(result); 
    });
});

app.get("/hello", function(req, resp) {
    console.log("get@hello");
    resp.send("Hello World");
});

app.get("/", function(req, resp) {
    resp.send("<h1>Add Node</h1>\n" +
              "<form action='/node' method='post' id='nodeCreationForm'>" +
              "Latitude:<br><input type='text' name='latitude' required><br>" +
              "Longitude:<br><input type='text' name='longitude' required><br>" +
              "Altitude:<br><input type='text' name='altitude'><br>" +
              "Accuracy:<br><input type='text' name='accuracy'><br>" +
              "<br>" +
              "<textarea name='tags' placeholder='Comma separated tags'></textarea><br>"  +
              "<input type='submit' value='Create'><br>" +
              "</form>"
              );
});

app.post("/test", function(req, resp) {
    resp.send("called post request handle on path: /test");
})

app.setUp(function() {
    console.log("initialised application");
    app.start(function(url) {
        console.log("connected to server: " + url);
    });
});
