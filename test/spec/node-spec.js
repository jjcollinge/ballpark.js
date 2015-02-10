/**
 * Test node data and process
 */

// Dependencies
var Node = require("../../node");

describe("constructing a node", function() {
   it("should throw if it doesn't provide 2 arguments", function() {
       expect(Node).toThrow();
   });
   it("should throw an expection for illegal geo location", function() {
       //expect(Node(-360, 360)).toThrow(); 
   });
});

describe("calculating distance between two nodes", function() {
    it("should calculate a distance of 157km", function() {
        var srcNode = new Node(0.0000, 0.0000);
        var desNode = new Node(1.0000, 1.0000);
        var distance = Math.floor(srcNode.distanceInKMFrom(desNode));
        expect((distance)).toBe(157);
    });
    it("should calculate a distance of 0km", function() {
        var srcNode = new Node(0.0000, 0.0000);
        var desNode = new Node(0.0000, 0.0000);
        var distance = Math.floor(srcNode.distanceInKMFrom(desNode));
        expect((distance)).toBe(0);
    });
});

describe("attaching an ip to a node", function() {
    it("should return my location", function() {
        var testNode = new Node(0, 0);
        testNode.attachIP("31.205.3.227", function() {
            expect(testNode.lat).toBe(Math.floor(53));
            expect(testNode.lon).toBe(Math.floor(-1));
        });
    });
    it("should return my city", function() {
        var testNode = new Node(0, 0);
        testNode.attachIP("31.205.3.227", function() {
            expect(testNode.city).toBe("Sheffield");
        });
    });
    it("should return my country", function() {
        var testNode = new Node(0, 0);
        testNode.attachIP("31.205.3.227", function() {
            expect(testNode.country).toBe("United Kingdom");
        });
    });
    it("should return my timezone", function() {
        var testNode = new Node(0, 0);
        testNode.attachIP("31.205.3.227", function() {
            expect(testNode.timezone).toBe("Europe/London");
        });
    });
    it("should return my ip", function() {
        var testNode = new Node(0, 0);
        testNode.attachIP("31.205.3.227", function() {
            expect(testNode.ip).toBe("31.205.3.227");            
        });

    });
});

describe("adding a tag to a node", function() {
   if("should attach a tag to the node", function() {
       var testNode = new Node(0, 0);
       testNode.addTag("name", "Surrey Street");
       expect(testNode.tags[name]).toBe("Surrey Street");
   });
});