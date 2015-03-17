/**
 * Test data access object
 */
 
// Dependencies
var namespace = require("../../dao");
 
var dao = new namespace.Dao();
var Node = namespace.Node;
var Way = namespace.Way;
var Relation = namespace.Relation;

// test suite vars
var nodeId = null;
var wayId = null;
var relationId = null;
var counter = 0;

describe("Test node dao", function() {
    
    // Setup connection before each test case
    beforeEach(function() {
        var connected = false;
        runs(function () {
            console.log('beginning test ' + ++counter);
            dao.connect(27017, process.env.IP, function() {
                console.log('connected dao');
                var testNode = new Node({
                    location:
                    [
                        -23.600800037384033,
                        -78.76758746952729
                    ]
                });
                testNode.save(function() {
                    nodeId = testNode._id;
                   var testWay = new Way({
                       nodes: [nodeId]
                   });
                   testWay.save(function() {
                       wayId = testWay._id;
                       var testRelation = new Relation({
                            members: [{ _id: wayId, type: 'way', role: 'inner' }, { _id: nodeId, type: 'node', role: 'outter' }],
                            tags: { postal_code: 'S2' }
                       });
                       testRelation.save(function() {
                           relationId = testRelation._id;
                           connected = true;
                       });
                   });
                });
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
            console.log('ending test ' + counter);
            dao.clearData(function() {
                console.log('cleared data');
                dao.disconnect(function() {
                    console.log('disconnected dao');
                    disconnected = true;
                });
            });
                
        });
        waitsFor(function() {
            return disconnected;
        });
    });
    
    //#1
    it("creating a node", function() {
        // test case vars
        var callback = false;
        var longitude = null;
        var result = null;
        var node = new Node({
            location:
                    [
                        5.600800037384033,
                        5.76758746952729
                    ]
        });
        node.save(function(err, savedNode) {
            result = savedNode.location[0];
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBe(5.600800037384033);
        });
    });
    
    //#2
    it("creating an animated node", function() {
        // test case vars
        var callback = false;
        var result = null;
        var node = new Node({
            location:
                    [
                        -3.600800037384033,
                        6.76758746952729
                    ],
            heading: 21,
            speed: 30,
            tags: {
                name: 'street'
            }
        });
        node.save(function(err, saveNode) {
            result = saveNode.heading;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBe(21);
        });
    });
    
    //#3
    it("updating a node", function() {
        // test case vars
        var callback = false;
        var result = null;
        var update = { 
            location:
            [
                -3.600800037384033,
                6.76758746952729
            ]
        };
        var opts = {};
        Node.amend(nodeId, update, opts, function(numUpdated) {
            result = numUpdated;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBe(1);
        });
    });
    
    //#4
    it("find a node by id", function() {
        // test case vars
        var callback = false;
        var result = null;
        Node.getById(nodeId, function(cursor) {
            result = cursor;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBeDefined();
        });
    });
    
    //#5
    it("find a node by tag", function() {
        // test case vars
        var callback = false;
        var result = null;
        var query = { tag: { name: 'street' } };
        Node.query(query, function(cursor) {
            result = cursor;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBeDefined();
        });
    });
    
    //#6
    it("remove a node", function() {
        // test case vars
        var callback = false;
        var result = null;
        Node.delete(nodeId, function(numDeleted) {
            result = numDeleted;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        
        runs(function() {
            expect(result).toBe(1);
        });
    });
    
    //#7
    it("creating a way", function() {
        // test case vars
        var result = null;
        var callback = false;
        var way = new Way({
            nodes: [nodeId]
        });
        way.save(function(savedNode) {
            result = savedNode;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBeDefined();
        });
    });
    
    //#8
    it("update a way", function() {
        // test case vars
        var callback = false;
        var result = null;
        var update = { 
            tags: {
                name: 'river'
            }
        };
        var opts = {};
        Way.amend(wayId, update, opts, function(numUpdated) {
            result = numUpdated;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBe(1);
        });
    });
    
    it("find a way by id", function() {
        // test case vars
        var callback = false;
        var result = null;
        Way.getById(nodeId, function(cursor) {
            result = cursor;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBeDefined();
        });
    });
    
    it("remove a way", function() {
        // test case vars
        var callback = false;
        var result = null;
        Way.delete(wayId, function(numDeleted) {
            result = numDeleted;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBe(1);
        });
    });
    
    it("create a new relation", function() {
        // test case vars
        var result = null;
        var callback = false;
        var relation = new Relation({
            members: [{
                _id: nodeId,
                role: 'outter',
                type: 'node'
            }]
        });
        relation.save(function(savedRelation) {
            result = savedRelation;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBeDefined();
        });
    });
    
    it("update a relation", function() {
        // test case vars
        var callback = false;
        var result = null;
        var update = { 
            tags: {
                postal_code: 'RD'
            }
        };
        var opts = {};
        Relation.amend(relationId, update, opts, function(numUpdated) {
            result = numUpdated;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBe(1);
        });
    });
    
    it("find a relation by id", function() {
        // test case vars
        var callback = false;
        var result = null;
        Relation.getById(nodeId, function(cursor) {
            result = cursor;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBeDefined();
        });
    });
        
    it("remove a relation", function() {
        // test case vars
        var callback = false;
        var result = null;
        Relation.delete(relationId, function(numDeleted) {
            result = numDeleted;
            callback = true;
        });
        waitsFor(function() {
            return callback;
        }, "callback should have been invoked");
        runs(function() {
            expect(result).toBe(1);
        });
    });
    
});