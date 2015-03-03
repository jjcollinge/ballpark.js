/**
 * Test data access object
 */
 
// Dependencies
var Dao = require("../../dao");
 
var dao = new Dao();

describe("Test node dao", function() {
    
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
 
    // test suite vars
    var nodeId = null;
    var wayId = null;
    
    it("creating a node", function() {
        // test case vars
        var callback = false;
        var data_longitude = null;
        dao.createNode(0, 0, function(node) {
            console.log("created node: " + node);
            node.tags['name'] = 'street';
            dao.saveNode(node, function(result) {
                console.log("saved node with id: " + result._id);
                data_longitude = result.longitude;
                nodeId = result._id;
                callback = true;
            });
        });

        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(data_longitude).toBe(0);
        });
    });// creating node test case
    
    it("updating a node", function() {
        // test case vars
        var callback = false;
        var num_updated = null;
        var update = { longitude: 1 };
        var opts = {};
        
        dao.updateNode(nodeId, update, opts, function(result) {
            console.log("updated " + result + " nodes");
            num_updated = result;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(num_updated).toBe(1);
        });
    });// updating node test case
    
    it("find a node by id", function() {
        // test case vars
        var callback = false;
        var found = null;
        
        dao.findNodeById(nodeId, function(result) {
            console.log("found nodes: " + result);
            found = result;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(found).toBeDefined();
        });
    });// find node test case
    
    it("find a node by tag", function() {
        // test case vars
        var callback = false;
        var found = null;
        var tag = { tag: { name: "street"} }
        
        dao.findNode(nodeId, function(result) {
            console.log("found nodes: " + result);
            found = result;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(found).toBeDefined();
        });
    });// find node test case
    
    it("remove a node", function() {
        // test case vars
        var callback = false;
        var num_del = null;
        
        dao.deleteNode(nodeId, function(result) {
            console.log("removed " + result + " nodes");
            num_del = result;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(num_del).toBe(1);
        });
    });// remove node test case
    
    it("find node within radius", function() {
        // test case vars
        var callback = false;
        var nodes;
        dao.createNode(100, 100, function(node) {
            console.log("created new node: " + node);
            dao.findNodesWithinRadiusOf(node, 2000, function(results) {
                console.log("found nodes " + results + " within radius");
                nodes = results;
                callback = true;
            });
        })

        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(nodes).toBeDefined();
        });
    })
    
    it("creating a way", function() {
        // test case vars
        var result = null;
        var callback = false;
        
        dao.createNode(0, 0, function(nodeA) {
            console.log("created node: " + nodeA);
            dao.createNode(1, 1, function(nodeB) {
               console.log("created node: " + nodeB);
               dao.createWay(nodeA, nodeB, function(way) {
                   console.log("created way: " + way);
                   way.tags["name"] = "test";
                   dao.saveWay(way, function(results) {
                       console.log("saved way: " + results);
                       wayId = results._id;
                       result = results.tags["name"];
                       callback = true;
                   })
               })
            });
        })

        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result).toBe("test");
        });
    });// remove node test case
    
     it("update a way", function() {
        // test case vars
        var callback = false;
        var num_updated = null;
        var update = { tags: { name : "road" } };
        var opts = {};
        
        dao.updateWay(wayId, update, opts, function(results) {
            console.log("updated " + results + "ways");
            num_updated = results;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(num_updated).toBe(1);
        });
    });// remove node test case
    
    it("find a way by id", function() {
        // test case vars
        var callback = false;
        var found = null;
        
        dao.findWayById(wayId, function(data) {
            console.log(data);
            found = data;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(found).toBeDefined();
        });
    });// find node test case
    
    it("remove a way", function() {
        // test case vars
        var callback = false;
        var num_del = null;
        
        dao.deleteWay(wayId, function(data) {
            console.log(data);
            num_del = data;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(num_del).toBe(1);
        });
    });// remove node test case
    
    it("add a nested way", function() {
        // test case vars
        
        var callback = false;
        var result = null;

        dao.createNode(0, 0, function(nodeA) {
            console.log("created node: " + nodeA);
            dao.createNode(1, 1, function(nodeB) {
                console.log("created node: " + nodeB);
                dao.createNode(2, 2, function(nodeC) {
                    console.log("created node: " + nodeC);
                    dao.createWay(nodeA, nodeB, function(wayA) {
                        console.log("created way: " + wayA);
                        dao.createWay(nodeC, wayA, function(wayB) {
                            console.log("created way: " + wayB);
                            result = wayB;
                            callback = true;
                        })
                    })
                })
            })
        })
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result.nodes.length).toBe(1);
            expect(result.ways.length).toBe(1);
        });
    });// remove node test case
    
});// describe
