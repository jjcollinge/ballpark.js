/**
 * Way represents at least 2 geographically points
 */
 
function Way(node0, node1) {
    
    // minimum of 2 nodes in a way
    if(arguments.length != 2) {
        throw new Error("atleast 2 nodes required to construct a way");
    }
    this.id;
    this.idAttribute;
    this.nodes = [];
    this.nodes.push(node0);
    this.nodes.push(node1);
    this.max = 2000;
    this.ways = [];
    this.tags = {}
}

Way.prototype.addWay = function(way) {
    this.ways.push(way);
}

Way.prototype.addTag = function(key, value) {
    this.tags[key] = value;
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

Way.prototype.size = function() {
    return this.nodes.length;
}

Way.prototype.has = function(node) {
    return (this.nodes.indexOf(node) > -1);
}

Way.prototype.concat = function(way) {
    var otherNodes = way.nodes;
    for(node in otherNodes) {
        this.nodes.push(node);
    }
}

Way.prototype.each = function(callback) {
    return this.nodes.forEach(callback);
}

Way.prototype.reduce = function(callback) {
    var result = this.nodes.reduce(callback);
    return result;
}

Way.prototype.map = function(callback) {
    return this.nodes.map(callback);
}

Way.prototype.filter = function(callback) {
    return this.nodes.filter(callback);
}

module.exports = Way;