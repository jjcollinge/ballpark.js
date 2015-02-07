/**
 * Node represents a geographical point
 */
 
// Dependencies
var request = require("request");
 
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

Node.prototype.attachIP = function(ip, callback) {
    var url = 'http://freegeoip.net/json/' + ip;
    
    request(url, function(error, response, body) {
        if(error) return console.error(error);
        this.lon = body.longitude;
        this.lat = body.latitude;
        this.country = body.country_name;
        this.city = body.city;
        this.postcode = body.zip_code;
        this.timezone = body.time_zone;
        this.ip = body.ip;
        callback();
    });
}

Node.prototype.distanceInKMFrom = function(otherNode) {
    var R = 6371; // Radius of the earth in km
    var latDiff = convertDegreesToRadians(otherNode.lat - this.lat);  
    var lonDif = convertDegreesToRadians(otherNode.lon - this.lon); 
    
    var a = 
    Math.sin(latDiff/2) * Math.sin(latDiff/2) +
    Math.cos(convertDegreesToRadians(this.lat)) *
    Math.cos(convertDegreesToRadians(otherNode.lat)) * 
    Math.sin(lonDif/2) * Math.sin(lonDif/2); 
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function convertDegreesToRadians(deg) {
    return deg * (Math.PI/180);
}

module.exports = Node;