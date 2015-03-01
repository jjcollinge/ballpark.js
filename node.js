/**
 * Node represents a geographical point
 */
 
// Dependencies
var request = require("request");
var events = require('events');
 
function Node(lon, lat) {
    
    if(lon === undefined || lat === undefined) {
        throw new Error("longitude and latitude required to construct a node");
    } else if(lon < -180 || lon > 180 || lat < -180 || lon > 180) {
        throw new Error("illegal geo location given");
    }
    events.EventEmitter.call(this);
    this.lon = lon;
    this.lat = lat;
    this.tags = {};
}

Node.prototype.__proto__ = events.EventEmitter.prototype;

Node.prototype.addAltitude = function(alt) {
    this.alt = alt;    
}

Node.prototype.addAccuracy = function(acc) {
    this.acc = acc;
}

Node.prototype.addTag = function(key, value) {
    this.tags[key] = value;
}

Node.prototype.updateLocation = function(lon, lat, alt) {
    this.lon = lon;
    this.lat = lat;
    if(alt !== 'undefined')
        this.alt = alt;
    this.emit('update');
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

Node.prototype.distanceTo = function(otherNode) {
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

Node.prototype.on = function(name, cb) {
    this.hasOwnProperty(name)
}
module.exports = Node;