/**
 * The server is responsible for handling
 * the http or https connection
 */

// Dependencies
var http = require("http");

var Server = function() {
}

Server.prototype.start = function(port, ip, callback) {
    
    if(port == undefined) {
        process.env.PORT? port = process.env.PORT: port = 3000;
    }
    if(ip == undefined) {
        return http.createServer(callback).listen(port, ip);
    }
    return http.createServer(callback).listen(port, function() {
        console.log('Connected to HTTP server on port: ' + port);
    });
}

Server.prototype.stop = function() {
    
}

module.exports = Server;