/**
 * Way represents at least 2 geographically points
 */
 
function Way() {
    this.nodes = {};
}

Way.prototype.addNode = function(node) {
    this.nodes.append(node);
}
