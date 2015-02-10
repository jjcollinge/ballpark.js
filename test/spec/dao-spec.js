/**
 * Test data access object
 */
 
// Dependencies
var Dao = require("../../dao");
var Way = require("../../way");
var Node = require("../../node");
    
describe("dao tests", function() {
    var dao = new Dao();
    var nodeId;
    var wayId;
    
    beforeEach(function(done) {
		dao.connect(27017, process.env.IP);
		done();
	});
	afterEach(function(done) {
		dao.disconnect();
		done();
	});
    describe("async tests", function() {
        it("creating a node", function() {
        var node = new Node(0, 0);
        dao.addNode(node, function(data) {
            expect(data).toBeDefined();
        });
        });
        it("updating a node", function() {
            var update =  { latitude: 1 };
            dao.updateNode(nodeId, update, function(data) {
                expect(data).toBeDefined();
            });
        });
        it("find a node", function() {
            dao.findNode(nodeId, function(data) {
                expect(data).toBeDefined();
            });
        });
        it("deleting a node", function() {
            dao.deleteNode(nodeId, function(data) {
                expect(data).toBeDefined();
            });
        });
        it("creating a way", function() {
            var node0 = new Node(0, 0);
            var node1 = new Node(0, 1);
            var way = new Way(node0, node1);
            dao.addWay(way, function(data) {
                expect(data).toBeDefined();
                wayId = data.id;
            });
        });
        it("updating a way", function() {
            var update =  {tags : { name : 'test' }};
            dao.updateWay(wayId, update, function(data) {
                expect(data).toBeDefined();
            });
        });
        it("find a way", function() {
            dao.findWay(wayId, function(data) {
                expect(data).toBeDefined();
            });
        });
        it("deleting a way", function() {
            dao.deleteWay(wayId, function(data) {
                expect(data).toBeDefined();
            })
        });
   })
});