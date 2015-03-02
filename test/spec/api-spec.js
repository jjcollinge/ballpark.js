/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */

// Dependencies
var ballpark = require('../../ballpark');
var app = ballpark();
var Node = require("../../node");
var Way = require("../../way");
var request = require("request");

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
        console.log(node);
        resp.send(node);
    });
});

app.post("/node", function(req, resp) {
    var lon = req.params.lon;
    var lat = req.params.lat;
    var alt = req.params.alt;
    var acc = req.params.acc;
    var node = new Node(lon, lat);
    if (alt) {
        node.addAltitude(alt);
    }
    if (acc) {
        node.addAccuracy(acc);
    }
    if (typeof req.params.tags !== "undefined") {
        var tags = req.params.tags.split(',');
        for (i in tags) {
            var tag = tags[i].toString();
            var pair = tag.split('=');
            node.addTag(pair[0], pair[1]);
        }
    }
    app.addNode(node, function(addedNode) {
        resp.send(JSON.stringify(addedNode));
    });
});

app.put("/node", function(req, resp) {
    var id = req.params.id;
    var lon = req.params.lon;
    var lat = req.params.lat;
    var update = {
        longitude: lon,
        latitude: lat
    };
    app.updateNode(id, update, function(num) {
        resp.send(num);
    });
});

app.delete("/node", function(req, resp) {
    var id = req.params.id;
    app.removeNode(id, function(num) {
        resp.send(num);
    })
});

app.get("/ways", function(req, resp) {
    app.getAllWays(function(ways) {
        resp.send(ways);
    });
});

app.get("/way", function(req, resp) {
    var id = req.params.id;
    app.getWay(id, function(way) {
        resp.send(way); 
    });
});

app.put("/way", function(req, resp) {
    var id = req.params.id;
    var tagz = req.params.tags;
    var update = {
        tags: tagz
    };
    app.updateWay(id, update, function(num) {
        resp.send(num);
    });
});

app.delete("/way", function(req, resp) {
    var id = req.params.id;
    app.removeWay(id, function(num) {
        resp.send(num);
    });
});

app.get("/hello", function(req, resp) {
    resp.send("Hello World");
});

var nodeId;
var wayId;
var counter = 0;

app.start(function() {
    // API Test goes below here now that the app has been set!
    describe("Test Api", function() {

        // Setup connection before each test case
        beforeEach(function(done) {
            counter++;
            console.log("Beginning test: " + counter);
            app.setUpDaoConnection(function() {
                app.clearAllNodes(function() {
                    var testNode = new Node(22, 333);
                    app.addNode(testNode, function(response) {
                        nodeId = response.payload._id;
                        app.clearAllWays(function() {
                            var testNodeA = new Node(99, 99);
                            var testWay = new Way(testNode, testNodeA);
                            app.addWay(testWay, function(response) {
                                wayId = response.payload._id;
                                done();
                            });
                        });
                    });
                });
            });
        }); // end before each

        // Tear down connection after each test case
        afterEach(function(done) {
            console.log("Ending test: " + counter);
            app.tearDownDaoConnection(function() {
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
                    lat: '150',
                    lon: '175'
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

    });
});
