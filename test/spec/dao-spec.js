/**
 * Test data access object
 */
 
// Dependencies
var Dao = require("../../dao");
var Way = require("../../way");
var Node = require("../../node");
 
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
        var node = new Node(0, 0);
        node.addTag("name", "street");
        
        dao.addNode(node, function(data) {
            data_longitude = data.lon;
            nodeId = data._id;
            callback = true;
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
        
        dao.updateNode(nodeId, update, function(data) {
            console.log(data);
            num_updated = data;
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
        
        dao.findNodeById(nodeId, function(data) {
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
    
    it("find a node by tag", function() {
        // test case vars
        var callback = false;
        var found = null;
        var tag = { tag: { name: "street"} }
        
        dao.findNode(nodeId, function(data) {
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
    
    it("remove a node", function() {
        // test case vars
        var callback = false;
        var num_del = null;
        
        dao.deleteNode(nodeId, function(data) {
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
    
    it("find node within radius", function() {
        // test case vars
        var callback = false;
        var testNode = new Node(3, 3);
        var nodes;
        
        dao.findNodesWithinRadiusOf(testNode, 2000, function(data) {
            nodes = data;
            callback = true;
        });
        
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
        var nodeA = new Node(0, 0);
        var nodeB = new Node(1, 1);
        var way = new Way(nodeA, nodeB);
        way.addTag("name", "test");
        
        dao.addWay(way, function(data) {
            console.log(data);
            wayId = data._id;
            result = data.tags["name"];
            callback = true;
        });
        
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
        
        dao.updateWay(wayId, update, function(data) {
            console.log(data);
            num_updated = data;
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
        var testNodeA = new Node(0, 0);
        var testNodeB = new Node(1, 1);
        var testWayA = new Way(testNodeA, testNodeB);
        var testNodeC = new Node(2, 2);
        var testWayB = new Way(testNodeB, testNodeC);
        testWayA.addWay(testWayB);
        
        dao.addWay(testWayA, function(data) {
            console.log(data);
            result = data;
            callback = true;
        });
        
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result.nodes.length).toBe(2);
            expect(result.ways.length).toBe(1);
        });
    });// remove node test case
    
});// describe
