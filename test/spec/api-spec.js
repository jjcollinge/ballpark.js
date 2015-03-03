/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */

// Dependencies
var ballpark = require('../../ballpark');
var app = ballpark();
var request = require("request");

/**
 * Initialise the application and the RESTful API to test
 * ------------------------------------------------------
 * This included configuring the database and web server
 * addresses. Routes will be setup in a RESTful manner.
 **/

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
    var lon = req.params.longitude;
    var lat = req.params.latitude;
    var alt = req.params.altitude;
    var acc = req.params.accuracy;
    app.createNode(lon, lat, alt, acc, function(node) {
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
        app.saveNode(node, function(result) {
            resp.send(JSON.stringify(result));
        });
    });
});

app.put("/node", function(req, resp) {
    var id = req.params.id;
    var update = {
        longitude: req.params.longitude,
        latitude: req.params.latitude
    };
    var opts = {};
    app.updateNode(id, update, opts, function(result) {
        resp.send(result);
    });
});

app.delete("/node", function(req, resp) {
    var id = req.params.id;
    app.removeNode(id, function(result) {
        resp.send(result);
    })
});

app.get("/ways", function(req, resp) {
    app.getAllWays(function(result) {
        resp.send(result);
    });
});

app.get("/way", function(req, resp) {
    var id = req.params.id;
    app.getWay(id, function(result) {
        resp.send(result); 
    });
});

app.put("/way", function(req, resp) {
    var id = req.params.id;
    var tagz = req.params.tags;
    var update = {
        tags: tagz
    };
    app.updateWay(id, update, function(result) {
        resp.send(result);
    });
});

app.delete("/way", function(req, resp) {
    var id = req.params.id;
    app.removeWay(id, function(result) {
        resp.send(result);
    });
});

app.get("/relations", function(req, resp) {
    app.getAllRelations(function(result) {
        resp.send(result);
    });
});

app.get("/relation", function(req, resp) {
    var id = req.params.id;
    app.getRelation(id, function(result) {
        resp.send(result); 
    });
});

app.put("/relation", function(req, resp) {
    var id = req.params.id;
    var tagz = req.params.tags;
    var update = {
        tags: tagz
    };
    app.updateRelation(id, update, function(result) {
        resp.send(result);
    });
});

app.delete("/relation", function(req, resp) {
    var id = req.params.id;
    app.removeRelation(id, function(result) {
        resp.send(result);
    });
});

app.get("/hello", function(req, resp) {
    resp.send("Hello World");
});

/**
 * Now define the test specification to test the RESTful API.
 * Everything from here to the EOF should only relate to the
 * test specification.
 **/

var nodeId;
var wayId;
var relationId;
var counter = 0;

app.start(function() {
    // API Test goes below here now that the app has been set!
    describe("Test Api", function() {

        // Setup connection before each test case
        beforeEach(function(done) {
            counter++;
            console.log("beginning test: " + counter);
            app.setUp(function() {
                console.log("setup application");
                app.clearAllNodes(function() {
                    console.log("cleared all nodes");
                    app.createNode(5, 5, function(node) {
                        console.log("created node: " + node);
                        app.saveNode(node, function(result) {
                            nodeId = result.payload._id;
                            app.clearAllWays(function() {
                                console.log("cleared all ways");
                                app.createNode(99, 99, function(nodeA) {
                                   console.log("created node: " + nodeA);
                                   app.saveNode(nodeA, function() {
                                       app.createWay(node, nodeA, function(way) {
                                           console.log("created way: " + way);
                                           app.saveWay(way, function(result) {
                                               wayId = result.payload._id;
                                               app.clearAllRelations(function() {
                                                   console.log("cleared all relations");
                                                   app.createRelation({ element: nodeA._id, role: 'inner' }, { element: way._id, role: 'outter' }, function(relation) {
                                                       console.log("created relation: " + relation);
                                                       app.saveRelation(relation, function(result) {
                                                           relationId = result.payload._id;
                                                           done();
                                                       });
                                                   });
                                               });
                                           });
                                       });
                                   });
                                });
                            });
                        });
                    });
                });
            });
        }); // end before each

        // Tear down connection after each test case
        afterEach(function(done) {
            console.log("ending test: " + counter);
            app.tearDown(function() {
                console.log("shut down application");
                done();
            });
        }); // end after each

        //#1
        it("should return hello world", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/hello";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                expect(body).toBe("Hello World");
                done();
            });
        });

        //#2
        it("should get nodes", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/nodes";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#3
        it("should get a node", function(done) {
            // temporary hack to bypass async nodeid update
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node?id=" + nodeId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#4
        it("should update a node", function(done) {
            // temporary hack to bypass async nodeid update
            console.log("1");
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
            var body = new Object();
            body.latitude = 99;
            body.longitude = 99;
            body.id = nodeId;
            console.log("2");
            request({
                method: "PUT",
                uri: url,
                json: body
            }, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#5
        it("should delete a node", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
            var body = new Object();
            body.id = nodeId;
            request({
                method: "DELETE",
                uri: url,
                json: body
            }, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#6
        it("should handle undefined url", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/madeupurl";
            var body = new Object();
            request.get(url, body, function(err, res, body) {
                if (err) return console.error(err);
                var json = JSON.parse(body);
                expect(json.status_code).toBe(404);
                done();
            });
        });

        //#7
        it("should add a node", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
            request.post(url, {
                form: {
                    latitude: '150',
                    longitude: '175'
                }
            }, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#8
        it("should get ways", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/ways";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#9
        it("should get a way", function(done) {
            // temporary hack to bypass async nodeid update
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/way?id=" + wayId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#10
        it("should update a way", function(done) {
            // temporary hack to bypass async nodeid update
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/way";
            var body = new Object();
            body.tags = [];
            body.tags["name"] = "test";
            body.id = wayId;
            request({
                method: "PUT",
                uri: url,
                json: body
            }, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#11
        it("should delete a way", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/way";
            var body = new Object();
            body.id = wayId;
            request({
                method: "DELETE",
                uri: url,
                json: body
            }, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#12
        it("should get relations", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relations";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#13
        it("should get a relation", function(done) {
            // temporary hack to bypass async nodeid update
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relation?id=" + relationId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#14
        it("should update a relation", function(done) {
            // temporary hack to bypass async nodeid update
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relation";
            var body = new Object();
            body.tags = [];
            body.tags["name"] = "test";
            body.id = relationId;
            request({
                method: "PUT",
                uri: url,
                json: body
            }, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });

        //#15
        it("should delete a relation", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relation";
            var body = new Object();
            body.id = relationId;
            request({
                method: "DELETE",
                uri: url,
                json: body
            }, function(err, res, body) {
                if (err) return console.error(err);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
    });// end describe
});// end app start callback
