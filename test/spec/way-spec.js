/**
 * Test way data and process
 */
 
// Dependencies
var Way = require("../../way");
var Node = require("../../node");

describe("Test way data & process", function() {
    it("should throw an expection as constructor doesn't have required arguments", function() {
        expect(Way).toThrow();
    });
    it("should add x nodes to a way and then get the way size equal to x", function() {
       var node0 = new Node(0, 0);
       var node1 = new Node(0, 1);
       var node2 = new Node(1, 0);
       var node3 = new Node(1, 1);
       var way = new Way(node0, node1);
       way.addNode(node2);
       way.addNode(node3);
       expect(way.size()).toBe(4);
    });
    it("should concat or merge the nodes from 2 ways", function() {
        var node0 = new Node(1, 1);
        var node1 = new Node(0, 0);
        var way0 = new Way(node0, node1);
        
        var node2 = new Node(1, 1);
        var node3 = new Node(2, 2);
        var way1 = new Way(node2, node3);
        
        way0.concat(way1);
        expect(way0.size()).toBe(4);
        expect(way0.nodes === [node0, node1, node2, node3]);
    });
    it("should add a node to a way and check that way 'has' return true", function() {
        var node0 = new Node(0, 0);
        var node1 = new Node(1, 1);
        
        var way = new Way(node0, node1);
        expect(way.has(node0)).toBe(true);
    });
    it("should check for a missing node and ensure the 'has' method returns false", function() {
        var node0 = new Node(0, 0);
        var node1 = new Node(1, 1);
        var node2 = new Node(3, 3);
        
        var way = new Way(node0, node1);
        expect(way.has(node2)).toBe(false);
    });
    it("should iterate through each node in the way and invoke a callback on each", function() {
        var node0 = new Node(1, 1);
        var node1 = new Node(1, 1);
        var node3 = new Node(1, 1);
        
        var way = new Way(node0, node1);
        way.addNode(node3);
        way.each(function(node) {
            node.lon *= 2;
        });
        var nodes = way.nodes;
        for(var i = 0; i < nodes.length; ++i) {
            expect(nodes[i].lon).toBe(2);
        }
    });
    it("should iterate through each node in the way and invoke a callback on each. Returning a cummulative result", function() {
        var node0 = new Node(1, 1);
        var node1 = new Node(1, 1);
        var node3 = new Node(1, 1);
        
        var way = new Way(node0, node1);
        way.addNode(node3);
        var sum = way.reduce(function(a, b) {
            return { lon : a.lon + b.lon}; 
        });
        expect(sum.lon).toBe(3);
   });
});