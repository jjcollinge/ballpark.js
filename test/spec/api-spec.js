/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// Dependencies
var ballpark = require('../../ballpark');
var app = ballpark();
var Dao = require("../../dao");
var Node = require("../../node");
var request = require("request");

// Initialise the app & api to test
var dao = new Dao();

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
    var tags = req.params.tags.split(',');
    for(i in tags) {
        var tag = tags[i].toString();
        var pair = tag.split('=');
        node.addTag(pair[0], pair[1]);
    }
    dao.addNode(node, function(n) {
        resp.send("added node:\n" + JSON.stringify(n));
    });
});

app.delete("/node", function(req, resp) {
    var id = req.params.id;
    if(id) {
        dao.deleteNode(id, function(node) {
            console.log("deleted node:\n" + JSON.stringify(node));
        });
    }
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

app.get("/hello", function(req, resp) {
    resp.send("Hello World");
});

app.start(function(url) {
    console.log("Connected to server: " + url)
    // API Test goes below here now that the app has been set!
    describe("Test Api", function() {
        
        // Setup connection before each test case
        beforeEach(function() {
            var connected = false;
            runs(function () {
                dao.connect(27017, process.env.IP, function() {
                    connected = true;
                });
            });
            waitsFor(function() {
                return connected;
            });
        });
        
        // Tear down connection after each test case
        afterEach(function() {
            var disconnected = false;
            runs(function() {
                dao.disconnect(function() {
                   disconnected = true; 
                });
            });
            waitsFor(function() {
                return disconnected;
            }) 
        });
        
        it("test hello get request", function() {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/hello";
            request.get(url, function(err, res, body) {
                if(err) return console.error(err);
                expect(body).toBe("Hello World");
            });
        });
        
        it("test get nodes", function() {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/nodes";
            request.get(url, function(err, res, body) {
                if(err) return console.error(err);
                expect(res.statusCode).toBe(200);
            });
        });
        
        it("test undefined post request", function() {
            var url = "http://" + process.env.IP + ":" + process.env.PORT;
            var body = new Object();
            request.post(url, body, function(err, res, body) {
                if(err) return console.error(err);
                var json = JSON.parse(body);
                expect(json.status_code).toBe(404);
            });
        });
    });
});


