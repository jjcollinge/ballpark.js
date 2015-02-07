/**
 * The response wraps the standard http
 * response object and allows the framework
 * to add additional behaviour & data.
 */

// Dependencies
var http = require("http");

function Response(res) {
    this.prototype = http.ServerResponse.prototype;
    this.response = res;
}

Response.prototype.statusCode = function(code) {
    this.response.statusCode = code;
    return this;
}

/**
 * Parse the message into the appropriate format
 * set the necessary headers and send the message
 * in the require representation.
 */
Response.prototype.send = function(message) {
    
    var body = message;
    var status_code;
    
    if(this.response.statusCode == undefined) this.response.statusCode = 404;

    var contentType = "text/plain";

    console.log(typeof message);

    switch (typeof message) {
        case 'string':
            contentType = "text/html";
            break
        case 'object':
            contentType = "application/json";
            message = JSON.stringify(message, null, 2);
            break;
    }
    
    this.response.writeHead(this.response.statusCode, {"Content-Type": contentType });
    this.response.write(message);
    this.response.end();
}

module.exports = Response;