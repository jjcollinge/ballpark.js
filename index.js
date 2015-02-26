/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// Dependencies
var ballpark = require('./ballpark');
var app = ballpark();
var Dao = require("./dao");

var dao = new Dao();

dao.connect('27017', process.env.IP, function() {
    console.log("connected")
});

app.configure({
    'Address': process.env.IP,
    'Port': process.env.PORT,
    'XMLSupport' : false,
    'JSONSupport': true
});

app.get("/addNode", function(req, resp) {
    resp.send("<form>" +
              "Latitude:<br><input type='text' name='lat'><br>" +
              "Longitude:<br><input type='text' name='lon'><br>" +
              "<br>" +
              "<input type='submit' value='Submit'>" +
              "</form>");
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
           resp.send(result);
       })
   }
});

app.get("/ways", function(req, resp) {
   var allWays;
   dao.findWay({}, function(result) {
       allWays = result;
       resp.send(allWays);
   });
});

app.get("/test", function(req, resp) {
    resp.send("called get request handle on path: /test");
});

app.post("/test", function(req, resp) {
    resp.send("called post request handle on path: /test");
})

app.start(function(url) {
    console.log("Connected to server: " + url)
});