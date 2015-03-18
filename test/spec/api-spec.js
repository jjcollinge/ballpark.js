/**
 * api-spec.js
 * ----------------------------
 * A test suite for testing the
 * established api example
 */

// Dependencies
var api = require("../../api");
var request = require("request");

// initialise types
var app = api.app;
var Node = api.Node;
var Way = api.Way;
var Relation = api.Relation;

/**
 * Define the test specification to test the RESTful API.
 * Everything from here to the EOF should only relate to the
 * test specification.
 **/

// global vars for tests
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
                        tags: { name: 'hotel' }
                    });
                    node1.save(function(err) {
                        if(err) throw err;
                        var way0 = new Way({
                            nodes: [node0._id, node1._id],
                            tags: { 'speed_limit': 30 }
                        });
                        wayId = way0._id;
                        way0.save(function(err) {
                            if(err) throw err;
                            var relation0 = new Relation({
                                members: [{ _id: wayId, type: 'way', role: 'inner' }, { _id: nodeId, type: 'node', role: 'outter' }],
                                tags: {}
                            });
                            relationId = relation0._id;
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
        it("should update a node's location", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/node/location";
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
        
        //#8
        it("should get the node count with associated tag", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/nodes/countWithTag?name=hotel";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                var json = JSON.parse(body);
                console.log("Reponse: ");
                console.dir(json);
                expect(json.payload).toBe(1);
                done();
            });
        });
        
        //#9
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
        
        //#10
        it("should get ways", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/ways";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#11
        it("should get way by id", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/ways?id=" + wayId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#12
        it("should add a node to way", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/way/node";
            var testNode = new Node({
                location: 
                [
                    -1.600800037384033,
                    -12.76758746952729
                ]
            });
            testNode.save(function() {
                var body = new Object();
                body.id = wayId;
                body.nodeId = testNode._id
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
        });
        
        //#13
        it("should remove a node from way", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/way/node";
            var body = new Object();
            body.id = wayId;
            body.nodeId = nodeId;
            request({
                method: "DELETE",
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
        
        //#14
        it("should add a way to a way", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/way/way";
            var body = new Object();
            body.id = wayId;
            body.wayId = wayId;
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
        
        //#15
        it("should remove a way from a way", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/way/way";
            var body = new Object();
            body.id = wayId;
            body.wayId = wayId;
            request({
                method: "DELETE",
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
        
        //#16
        it("should update a ways tags", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/way/tags";
            var body = new Object();
            body.tags = { name: 'main street' };
            body.id = wayId;
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
        
        //#17
        it("should get the way count", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/ways/count";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                var json = JSON.parse(body);
                console.log("Reponse: ");
                console.dir(json);
                expect(json.payload).toBe(1);
                done();
            });
        });
        
        //#18
        it("should get the way count with associated tag", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/ways/countWithTag?name=road";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                var json = JSON.parse(body);
                console.log("Reponse: ");
                console.dir(json);
                expect(json.payload).toBe(0);
                done();
            });
        });
        
        //#19
        it("should get all ways containing given node", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/waysWithNode?nodeId=" + nodeId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#20
        it("should get an api summary", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/summarise";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#21
        it("should get speed limit map", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/speedlimits";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#22
        it("should get relations", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relations";
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#23
        it("should get relation by id", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relation?id=" + relationId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#24
        it("should create a relation", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relation";
            request.post(url, {
                form: {
                    members: {
                        _id: wayId,
                        type: 'way',
                        role: 'area'
                    }
                }
            }, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#25
        it("should delete a relation", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relation";
            var body = new Object();
            body.id = relationId;
            request({
                method: "DELETE",
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
        
        //#26
        it("should update a relation's tags", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relation/tags";
            var body = new Object();
            body.tags = { postal_code : 'D9' };
            body.id = relationId;
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
        
        //#27
        it("should add a member to the relation", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relation/member";
            var body = new Object();
            body.id = relationId;
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
        
        //#28
        it("should remove a member from a relation", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relation/member";
            var body = new Object();
            body.id = relationId;
            body.memberId = nodeId;
            request({
                method: "DELETE",
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
        
        //#29
        it("should get all members from a relation", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/relation/members?id=" + relationId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#30
        it("should get nested nodes from way", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/way/nodes?id=" + wayId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //#31
        it("should get nested ways from way", function(done) {
            var url = "http://" + process.env.IP + ":" + process.env.PORT + "/api/way/ways?id=" + wayId;
            request.get(url, function(err, res, body) {
                if (err) return console.error(err);
                console.log("Reponse: ");
                console.dir(body);
                expect(res.statusCode).toBe(200);
                done();
            });
        });
        
        //X-X-X
    });
});
