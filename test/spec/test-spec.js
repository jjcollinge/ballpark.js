var app = require("../../app");
var util = require("../../utility");
var Node = require("../../node");

describe("calculate distance", function() {
    it("should return zero for two identical points", function() {
        var srcNode = Node(23.1234, -1.2312, 100, 0);
        var desNode = Node(23.1234, -1.2312, 100, 0);
        var distance = util.calculateDistance(srcNode, desNode);
        expect(distance).toBe(0);
    });
});