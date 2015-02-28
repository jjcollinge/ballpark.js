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
   if(id != undefined) {
       dao.findNodeById(id, function(result) {
            resp.send(result);
       })
   }
});

app.post("/node", function(req, resp) {
    console.dir(req.params);
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
    if(typeof req.params.tags !== "undefined") {
        var tags = req.params.tags.split(',');
        for(i in tags) {
            var tag = tags[i].toString();
            var pair = tag.split('=');
            node.addTag(pair[0], pair[1]);
        }
    }
    dao.addNode(node, function(n) {
        resp.send("added node:\n" + JSON.stringify(n));
    });
});

app.put("/node", function(req, resp) {
   console.dir(req.params);
   var id = req.params.id;
   var lon = req.params.lon;
   var lat = req.params.lat;
   var update = { longitude: lon,
                  latitude: lat };
   if(id != undefined) {
       dao.updateNode(id, update, function(num) {
          if(num > 0)
            resp.send("updated node");
          else
            resp.send({ status_code : 404, description : 'No node exists with that id to update'});
       });
   }
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

var nodeId;
var counter = 0;

app.start(function(url) {
    console.log("Connected to server: " + url);
    // API Test goes below here now that the app has been set!
    describe("Test Api", function() {
        
        // Setup connection before each test case
        beforeEach(function(done) {
            counter++;
            console.log("Begining test: " + counter);
            runs(function () {
                dao.connect(27017, process.env.IP, function() {
                    dao.clearAllNodes(function() {
                        var testNode = new Node(22, 333);
                        dao.addNode(testNode, function(node) {
                            nodeId = node.id;
                            done()
                        });
                    });
                });
                
            });
        }); // end before each
        
        // Tear down connection after each test case
        afterEach(function(done) {
            console.log("Ending test: " + counter);
            runs(function() {
                dao.disconnect(function() {
                   done();
                });
            });
        }); // end after each
        
        it("should return hello world", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/hello";
            request.get(url, function(err, res, body) {
                if(err) return console.error(err);
                expect(body).toBe("Hello World");
                done();
            });
        });
        
        it("should get nodes", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/nodes";
            request.get(url, function(err, res, body) {
                if(err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        it("should get a node", function(done) {
            // temporary hack to bypass async nodeid update
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node?id=" + nodeId;
            request.get(url, function(err, res, body) {
              if(err) return console.error(err);
              expect(res.statusCode).toBe(200);
              done();
            });
        });
        
        it("should update a node", function(done) {
            // temporary hack to bypass async nodeid update
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
            var body = new Object();
            body.lat = 99;
            body.lon = 99;
            body.id = nodeId;
            request({
                method: "PUT",
                uri: url,
                json: body
            }, function(err, res, body) {
              if(err) return console.error(err);
              expect(res.statusCode).toBe(200);
              done();
          });
        });

        it("should handle undefined url", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/madeupurl";
            var body = new Object();
            request.get(url, body, function(err, res, body) {
                if(err) return console.error(err);
                var json = JSON.parse(body);
                expect(json.status_code).toBe(404);
                done();
            });
        });
        
        it("should add a node", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
            request.post(url, {form:{lat:'150', lon:'175'}}, function(err, res, body) {
                if(err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
           });
        });
    });
});


