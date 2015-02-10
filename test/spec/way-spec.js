/**
 * Test way data and process
 */
 
// Dependencies
var Way = require("../../way");
var Node = require("../../node");

describe("constructing a way", function() {
    it("should throw an expection", function() {
        expect(Way).toThrow();
    });
    it("should have a size of 4", function() {
       var node0 = new Node(0, 0);
       var node1 = new Node(0, 1);
       var node2 = new Node(1, 0);
       var node3 = new Node(1, 1);
       var way = new Way(node0, node1);
       way.addNode(node2);
       way.addNode(node3);
       expect(way.size()).toBe(4);
    });
});

describe("concaternating ways", function() {
    it("should concat the nodes in each way", function() {
        var node0 = new Node(1, 1);
        var node1 = new Node(0, 0);
        var way0 = new Way(node0, node1);
        
        var node2 = new Node(1, 1);
        var node3 = new Node(2, 2);
        var way1 = new Way(node2, node3);
        
        way0.concat(way1);
        expect(way0.size()).toBe(4);
        expect(way0.getNodes() === [node0, node1, node2, node3]);
    });
})

describe("checking a way has a node", function() {
    it("should contain this node and return true", function() {
        var node0 = new Node(0, 0);
        var node1 = new Node(1, 1);
        
        var way = new Way(node0, node1);
        expect(way.has(node0)).toBe(true);
    });
    it("should not contain this node and return false", function() {
        var node0 = new Node(0, 0);
        var node1 = new Node(1, 1);
        var node2 = new Node(3, 3);
        
        var way = new Way(node0, node1);
        expect(way.has(node2)).toBe(false);
    });
})

describe("iterating through a list of ways", function() {
    it("should iterate through each node in the way and invoke a callback", function() {
        var node0 = new Node(1, 1);
        var node1 = new Node(1, 1);
        var node3 = new Node(1, 1);
        
        var way = new Way(node0, node1);
        way.addNode(node3);
        way.each(function(node) {
            node.lon *= 2;
        });
        var nodes = way.getNodes();
        for(var i = 0; i < nodes.length; ++i) {
            expect(nodes[i].lon).toBe(2);
        }
    });
});