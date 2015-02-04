/**
 * The server is responsible for handling
 * the http or https connection
 */

// dependencies
var http = require("http");

// constructor
var Server = function() {
}

Server.prototype.start = function(port, callback) {
    
    if(port == undefined) {
        process.env.PORT? port = process.env.PORT: port = 3000;
    }

    return http.createServer(callback).listen(port);
    console.log("Server started");
}

Server.prototype.stop = function() {
    
}

module.exports = Server;