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
    var relationId = null;
    
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
    
    it("creating an animated node", function() {
        // test case vars
        var callback = false;
        var heading = null;
        dao.createNode(0, 0, function(node) {
            console.log("created node: " + node);
            node.heading = 200;
            node.speed = 10;
            node.tags['name'] = 'street';
            dao.saveNode(node, function(result) {
                console.log("saved node with id: " + result._id);
                heading = result.heading;
                callback = true;
            });
        });

        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(heading).toBe(200);
        });
    });// creating animated node test case
    
    it("updating a node", function() {
        // test case vars
        var callback = false;
        var num_updated = null;
        var update = { longitude: 1 };
        var opts = {};
        
        dao.updateNode(nodeId, update, opts, function(updated) {
            console.log("updated " + updated + " nodes");
            num_updated = updated;
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
        var result = null;
        
        dao.findNodeById(nodeId, function(found) {
            console.log("found nodes: " + found);
            result = found;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result).toBeDefined();
        });
    });// find node test case
    
    it("find a node by tag", function() {
        // test case vars
        var callback = false;
        var result = null;
        var tag = { tag: { name: "street"} }
        
        dao.findNode(nodeId, function(found) {
            console.log("found nodes: " + found);
            result = found;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result).toBeDefined();
        });
    });// find node test case
    
    it("remove a node", function() {
        // test case vars
        var callback = false;
        var num_del = null;
        
        dao.deleteNode(nodeId, function(deleted) {
            console.log("removed " + deleted + " nodes");
            num_del = deleted;
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
        dao.createNode(12, 15, function(node) {
            console.log("created new node: " + node);
            dao.findNodesWithinRadiusOf(node, 100, function(found) {
                console.log("found nodes " + found + " within radius");
                nodes = found;
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
    
    it("find node within bounding box", function() {
        // test case vars
        var callback = false;
        var nodes;
        dao.createNode(55, 55, function(bottomLeft) {
            console.log("created new node: " + bottomLeft);
            dao.createNode(50, 50, function(topRight) {
                console.log("created new node: " + topRight);
                dao.findNodesWithinBoundingBox(bottomLeft, topRight, function(found) {
                    console.log("found nodes " + found + " within radius");
                    nodes = found;
                    callback = true;
                });
            })
            
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
        
        dao.updateWay(wayId, update, opts, function(updated) {
            console.log("updated " + updated + "ways");
            num_updated = updated;
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
        var result = null;
        
        dao.findWayById(wayId, function(found) {
            console.log("found: " + found);
            result = found;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result).toBeDefined();
        });
    });// find node test case
    
    it("remove a way", function() {
        // test case vars
        var callback = false;
        var num_del = null;
        
        dao.deleteWay(wayId, function(deleted) {
            console.log("deleted " + deleted + " ways");
            num_del = deleted;
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
                        });
                    });
                });
            });
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result.nodes.length).toBe(1);
            expect(result.ways.length).toBe(1);
        });
    });// remove node test case
    
    it("create a new relation", function() {
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
                        dao.createRelation({ element: nodeA._id, role: 'inner' }, { element: wayA._id, role: 'outter' }, function(relation) {
                            console.log("created relation: " + relation);
                            dao.saveRelation(relation, function(save) {
                                console.log("saved relation: " + save);
                                result = relation;
                                relationId = save._id;
                                callback = true;
                            });
                        });
                    });
                });
            });
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result.elements.length).toBe(2);
        });
    });
    
    it("update a relation", function() {
        // test case vars
        var callback = false;
        var num_updated = null;
        var update = { tags: { name : 'test' }};
        var opts = {};
        
        dao.updateRelation(relationId, update, opts, function(updated) {
            console.log("updated " + updated + " relations");
            num_updated = updated;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(num_updated).toBe(1);
        });
    });
    
    it("find a relation by id", function() {
        // test case vars
        var callback = false;
        var result = null;
        
        dao.findRelationById(relationId, function(found) {
            console.log("found: " + found);
            result = found;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result).toBeDefined();
        });
    });// find node test case
        
    it("remove a relation", function() {
        // test case vars
        var callback = false;
        var num_del = null;
        
        dao.deleteRelation(relationId, function(deleted) {
            console.log("deleted " + deleted + " relations");
            num_del = deleted;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(num_del).toBe(1);
        });
    });// remove node test case
    
});// describe
