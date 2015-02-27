/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// Dependencies
var ballpark = require('./ballpark');
var app = ballpark();
var Dao = require("./dao");
var Node = require("./node");

// Initialise
var dao = new Dao();

dao.connect('27017', process.env.IP, function() {
    console.log("connected");
    dao.clearAllNodes();
});

app.configure({
    'Address': process.env.IP,
    'Port': process.env.PORT,
    'XMLSupport' : false,
    'JSONSupport': true
});

app.get("/nodes", function(req, resp) {
    dao.findNode({}, function(result) {
        resp.send(result);
    });
});

app.get("/node", function(req, resp) {
   var id = req.params.id;
   if(id) {
       dao.findNodeById(id, function(result) {
           console.log(req.params);
           resp.send(result[0]);
       })
   }
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
    dao.addNode(node, function(n) {
        resp.send("added node:\n" + JSON.stringify(n));

    })
});

app.get("/ways", function(req, resp) {
   dao.findWay({}, function(result) {
       resp.send(result);
   });
});

app.get("/way", function(req, resp) {
   var id = req.params.id;
   if(id) {
       dao.findWayById(id, function(result) {
           resp.send(result[0]);
       })
   }
});

app.get("/", function(req, resp) {
    resp.send("<form action='/node' method='post' id='nodeForm'>" +
              "Latitude:<br><input type='text' name='lat' required><br>" +
              "Longitude:<br><input type='text' name='lon' required><br>" +
              "Altitude:<br><input type='text' name='alt'><br>" +
              "Accuracy:<br><input type='text' name='acc'><br>" +
              "<br>" +
              "<input type='submit' value='Submit'>" +
              "</form>" + 
              "<textarea name='tags' form='nodeForm'>Comma separated tags</textarea>" 
              );
});

app.post("/test", function(req, resp) {
    resp.send("called post request handle on path: /test");
})

app.start(function(url) {
    console.log("Connected to server: " + url)
});