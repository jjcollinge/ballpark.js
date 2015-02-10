/**
 * Test data access object
 */
 
// Dependencies
var Dao = require("../../dao");
var Way = require("../../way");
var Node = require("../../node");

var dao = new Dao();
dao.connect(27017, process.env.IP);

var id;
    
describe("dao tests", function(){
    
    it("creating a node", function(done) {
        var node = new Node(0, 0);
        var result;
        dao.addNode(node, function(data) {
            expect(data).toBeDefined();
            id = data.id;
            done();
        });
    });
    it("updating a node", function(done) {
        var update =  { latitude: 1};
        dao.updateNode(id, update, function(data) {
            expect(data).toBeDefined();
            done();
        });
    });
    it("find a node", function(done) {
       dao.findNode(id, function(data) {
            expect(data).toBeDefined();
            done();
       });
    });
    it("deleting a node", function(done) {
        dao.deleteNode(id, function(data) {
            expect(data).toBeDefined();
            done();
        });
    });
});