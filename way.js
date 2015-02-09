/**
 * Way represents at least 2 geographically points
 */
 
function Way(nodeA, nodeB) {
    
    // minimum of 2 nodes in a way
    if(arguments.length != 2) {
        throw new Error("atleast 2 nodes required to construct a way");
    }
    this.nodes = [];
    this.nodes.push(nodeA);
    this.nodes.push(nodeB);
    this.max = 2000;
}

Way.prototype.addNode = function(node) {
    if(this.nodes.length < this.max) {
        this.nodes.push(node);
    }
}

Way.prototype.removeNode = function(node) {
    var index = this.nodes.indexOf(node);
    if(index > -1) {
        this.nodes.splice(index, 1);
    }
}

Way.prototype.concat = function(way) {
    this.nodes.push(way.getNodes());
}

Way.prototype.getSize = function(){
    return this.nodes.length;
}

Way.prototype.getNodes = function() {
    return this.nodes;
}

module.exports = Way;