/**
 * Provides generic utility funtions
 * to other parts of the application
 */

// Dependencies
var request = require("request");

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
 
module.exports.calculateDistanceInKm = function(srcNode, desNode) {
    
    var R = 6371; // Radius of the earth in km
    var latDiff = deg2rad(desNode.lat - srcNode.lat);  
    var lonDif = deg2rad(desNode.lon - srcNode.lon); 
    
    var a = 
    Math.sin(latDiff/2) * Math.sin(latDiff/2) +
    Math.cos(deg2rad(srcNode.lat)) * Math.cos(deg2rad(desNode.lat)) * 
    Math.sin(lonDif/2) * Math.sin(lonDif/2); 
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

module.exports.getCurrentLocation = function(ip, callback) {
    var url = 'http://freegeoip.net/json/' + ip;
    request(url, function(error, response, body) {
        if(error) return console.error(error);
        callback(body);
    });
}