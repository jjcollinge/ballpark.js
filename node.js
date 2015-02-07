/**
 * Node represents a geographical point
 */
 
function Node(lon, lat) {
    this.lon = lon;
    this.lat = lat;
}

Node.prototype.addAltitude = function(alt) {
    this.alt = alt;    
}

Node.prototype.addAccuracy = function(acc) {
    this.acc = acc;
}

module.exports = Node;