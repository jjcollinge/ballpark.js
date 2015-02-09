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
       expect(way.getSize()).toBe(4);
    });
});