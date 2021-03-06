/**
 * server.js
 * ----------------------------
 * Responsible for encapsulating
 * the web server.
 */

// Dependencies
var http = require("http");

/**
 * Ctor
 **/
var Server = function() {
}

/**
 * Start the web server listening
 **/
Server.prototype.start = function(port, ip, callback) {
    
    if(typeof port === undefined) {
        process.env.PORT? port = process.env.PORT: port = 3000;
    }
    if(typeof ip === undefined) {
        process.env.IP? ip = process.env.IP: ip = '127.0.0.1';
    }
    this.server = http.createServer(callback).listen(port, function() {
        console.log('Connected to HTTP server on port: ' + port);
    });
    return this.server;
}

/**
 * Stop the web server listening
 **/
Server.prototype.stop = function(callback) {
    this.server.close(function() {
        console.log("stopped http server");
    });
}

module.exports = Server;