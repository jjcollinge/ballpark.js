/**
 * Test data access object
 */
 
// Dependencies
var Dao = require("../../dao");
var Way = require("../../way");
var Node = require("../../node");

describe("Testing dao for all models", function() {
    var dao = new Dao();
    dao.connect(27017, process.env.IP, function() {
            console.log("Successfully connected to database");
        });
    
    it("should insert a node into the database", function() {
        var node = new Node(0, 0);
        dao.storeNode(node, function(n) {
            console.log(n);
            expect(n).toBeDefined();
        });
    });
});
