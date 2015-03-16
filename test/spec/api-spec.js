/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */

// Dependencies
var ballpark = require('../../ballpark');
var namespace = ballpark();
var request = require("request");

/**
 * Initialise the application and the RESTful API to test
 * ------------------------------------------------------
 * This included configuring the database and web server
 * addresses. Routes will be setup in a RESTful manner.
 **/

var app = new namespace.App();
var Node = namespace.Node;
var Way = namespace.Way;
var Relation = namespace.Relation;

app.configure({
    'webserver_address': process.env.IP,
    'webserver_port': process.env.PORT,
    'database_address': process.env.IP,
    'database_port': 27017,
    'api_root': '/api'
});

app.get("/nodes", function(req, resp) {
    Node.getAll(function(nodes) {
       resp.send(nodes);
   });
});

app.get("/node", function(req, resp) {
    var id = req.params.id;
    try {
        Node.getById(id, function(node) {
            resp.send(node);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/node/xml", function(req, resp) {
    var id = req.params.id;
    try {
        Node.getById(id, function(node) {
            resp.format = 'xml';
            resp.send(node);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.post("/node", function(req, resp) {
    var _location = [Number(req.params['location[0]']), Number(req.params['location[1]'])];
    try {
        var newNode = new Node({
            location: _location
        });
        newNode.save(function(err, node) {
            if(err) throw err;
            resp.send({ status_code: 200, payload: 'created new node with id ' + node._id });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.put("/node", function(req, resp) {
    var id = req.params.id;
    var update = {
        location: req.params.location
    };
    var opts = {};
    try {
        Node.amend(id, update, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'updated ' + result + ' node(s)' });
            else
                resp.send({ status_code: 400, payload: 'no matching node with that id to update' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.delete("/node", function(req, resp) {
    var id = req.params.id;
    try {
       Node.delete(id, function(result) {
           resp.send(result);
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/nodes/count", function(req, resp) {
    var query = req.params;
    try {
       Node.count(query, function(err, count) {
           resp.send({ status_code: 200, payload: count });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});


app.get("/nodes/countWithTag", function(req, resp) {
    var query = req.params;
    try {
       Node.countWithTag(query, function(count) {
           resp.send({ status_code: 200, payload: count });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/nodes/near", function(req, resp) {
    var lon = Number(req.params.lon);
    var lat = Number(req.params.lat);
    var dis = Number(req.params.dis);
    try {
        Node.findNear(lon,
                      lat,
                      dis,
                      function(results) {
                          resp.send(results);
                      });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
})

// app.get("/ways", function(req, resp) {
  
// });

// app.get("/way", function(req, resp) {
    
// });

// app.put("/way", function(req, resp) {
    
// });

// app.delete("/way", function(req, resp) {
    
// });

// app.get("/ways/count", function(req, resp) {
   
// });

// app.get("/relations", function(req, resp) {
    
// });

// app.get("/relation", function(req, resp) {
    
// });

// app.put("/relation", function(req, resp) {
    
// });

// app.delete("/relation", function(req, resp) {
    
// });

// app.get("/relations/count", function(req, resp) {
   
// });

// app.get("/hello", function(req, resp) {
//     resp.send("Hello World");
// });

// /**
//  * Now define the test specification to test the RESTful API.
//  * Everything from here to the EOF should only relate to the
//  * test specification.
//  **/

var nodeId;
var wayId;
var relationId;
var counter = 0;

app.start(function() {
    describe("Test Api", function() {
        // Setup connection before each test case
        beforeEach(function(done) {
            counter++;
            console.log("beginning test: " + counter);
            app.setUp(function() {
                console.log("set up application");
                // Setup test data
                var node0 = new Node({
                    location:
                    [
                      84.600800037384033,
                      12.76758746952729
                    ],
                });
                nodeId = node0._id;
                node0.save(function(err) {
                    if(err) throw err;
                    var node1 = new Node({
                        location:
                        [
                          23.600800037384033,
                          46.76758746952729
                        ],
                        accuracy: 9,
                        tags: { name: 'road' }
                    });
                    node1.save(function(err) {
                        if(err) throw err;
                        var way0 = new Way({
                            nodes: [node0._id, node1._id]
                        });
                        wayId = way0._id;
                        way0.save(function(err) {
                            if(err) throw err;
                            var relation0 = new Relation({
                                elements: [{ element: wayId, role: 'inner' }, { element: nodeId, role: 'outter' }],
                                tags: {}
                            });
                            relation0.save(function(err) {
                                if(err) throw err;
                                done();
                            })
                        });
                    });
                });
            });
        }); // end before each

        // Tear down connection after each test case
        afterEach(function(done) {
            console.log("ending test: " + counter);
            app.clearData(function() {
                console.log("cleared data");
                app.tearDown(function() {
                    console.log("shut down application");
                    done();
                });
            });
        }); // end after each
        
        //#1
        it("should get nodes", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/nodes";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: " + body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#2
        it("should get a node by id", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/node?id=" + nodeId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: " + body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#3
        it("should give me an error for invalid id", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/node?id=" + "bob";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: " + body);
                expect(res.statusCode).toBe(500);
                done();
            });
        });
        
        //#4
        it("should give me an xml node representation", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/node/xml?id=" + nodeId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: " + body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#5
        it("should update a node", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/node";
            var body = new Object();
            body.location = 
            [
                0.600800037384033,
                0.76758746952729
            ]
            body.id = nodeId;
            request({
                method: "PUT",
                uri: url,
                json: body
            }, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#6
        it("should create a node", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/node";
            request.post(url, {
                form: {
                    location: 
                    [
                        5.600800037384033,
                        5.76758746952729
                    ]
                }
            }, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#7
        it("should get the node count", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/nodes/count";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                var json = JSON.parse(body);
                console.log("Reponse: ");
                console.dir(json);
                expect(json.payload).toBe(2);
                done();
            });
        });
        
        //#7
        it("should get the node count with associated tag", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/nodes/countWithTag?name=road";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                var json = JSON.parse(body);
                console.log("Reponse: ");
                console.dir(json);
                expect(json.payload).toBe(1);
                done();
            });
        });
        
        //#8
        it("should get nodes near the given point", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/nodes/near?lon=84.600800037384033&lat=12.76758746952729&dis=100";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
    });
});

// app.start(function() {
//     // API Test goes below here now that the app has been set!
//     describe("Test Api", function() {
//         // Setup connection before each test case
//         beforeEach(function(done) {
//             counter++;
//             console.log("beginning test: " + counter);
//             App.setUp(function() {
//                 console.log("set up application");
//                 done();
//             });
//         }); // end before each

//         // Tear down connection after each test case
//         afterEach(function(done) {
//             console.log("ending test: " + counter);
//             app.tearDown(function() {
//                 console.log("shut down application");
//                 done();
//             });
//         }); // end after each

//         //#1
//         it("should return hello world", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/hello";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(body).toBe("Hello World");
//                 done();
//             });
//         });

//         //#2
//         it("should get nodes", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/nodes";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#3
//         it("should get a node", function(done) {
//             // temporary hack to bypass async nodeid update
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node?id=" + nodeId;
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#4
//         it("should update a node", function(done) {
//             // temporary hack to bypass async nodeid update
//             console.log("1");
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
//             var body = new Object();
//             body.latitude = 20;
//             body.longitude = 20;
//             body.id = nodeId;
//             request({
//                 method: "PUT",
//                 uri: url,
//                 json: body
//             }, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#5
//         it("should delete a node", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
//             var body = new Object();
//             body.id = nodeId;
//             request({
//                 method: "DELETE",
//                 uri: url,
//                 json: body
//             }, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#6
//         it("should handle undefined url", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/madeupurl";
//             var body = new Object();
//             request.get(url, body, function(err, res, body) {
//                 if (err) return console.error(err);
//                 var json = JSON.parse(body);
//                 expect(json.status_code).toBe(404);
//                 done();
//             });
//         });

//         //#7
//         it("should add a node", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node";
//             request.post(url, {
//                 form: {
//                     latitude: 70,
//                     longitude: 175
//                 }
//             }, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#8
//         it("should get ways", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/ways";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#9
//         it("should get a way", function(done) {
//             // temporary hack to bypass async nodeid update
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/way?id=" + wayId;
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#10
//         it("should update a way", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/way";
//             var body = new Object();
//             body.tags = [];
//             body.tags["name"] = "test";
//             body.id = wayId;
//             request({
//                 method: "PUT",
//                 uri: url,
//                 json: body
//             }, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#11
//         it("should delete a way", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/way";
//             var body = new Object();
//             body.id = wayId;
//             request({
//                 method: "DELETE",
//                 uri: url,
//                 json: body
//             }, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });
        
//         //#12
//         it("should get relations", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relations";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#13
//         it("should get a relation", function(done) {
//             // temporary hack to bypass async nodeid update
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relation?id=" + relationId;
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#14
//         it("should update a relation", function(done) {
//             // temporary hack to bypass async nodeid update
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relation";
//             var body = new Object();
//             body.tags = [];
//             body.tags["name"] = "test";
//             body.id = relationId;
//             request({
//                 method: "PUT",
//                 uri: url,
//                 json: body
//             }, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });

//         //#15
//         it("should delete a relation", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relation";
//             var body = new Object();
//             body.id = relationId;
//             request({
//                 method: "DELETE",
//                 uri: url,
//                 json: body
//             }, function(err, res, body) {
//                 if (err) return console.error(err);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });
        
//         //#16
//         it("should display the count of nodes", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/nodes/count";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 var json = JSON.parse(body);
//                 console.log(json);
//                 expect(json.count).toBe(2);
//                 done();
//             });
//         });
        
//         //#17
//         it("should display the count of ways", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/ways/count";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 var json = JSON.parse(body);
//                 console.log(json);
//                 expect(json.count).toBe(1);
//                 done();
//             });
//         });
        
//         //#18
//         it("should display the count of relations", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/relations/count";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 var json = JSON.parse(body);
//                 console.log(json);
//                 expect(json.count).toBe(1);
//                 done();
//             });
//         });
        
//         //#19
//         it("get node in xml", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node/xml?id=" + nodeId;
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 console.log(body);
//                 expect(res.statusCode).toBe(200);
//                 done();
//             });
//         });
        
//         //#20
//         it("get node with bad id", function(done) {
//             var url = "http://" + process.env.IP + ":" + process.env.PORT + "/node?id=fred";
//             request.get(url, function(err, res, body) {
//                 if (err) return console.error(err);
//                 console.log(body);
//                 expect(res.statusCode).toBe(500);
//                 done();
//             });
//         });
        
//     });// end describe
// });// end app start callback
