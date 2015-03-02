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
    this.response.statusCode = 200; 
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
    var contentType;
    
    if(this.response.statusCode == undefined) this.response.statusCode = 404;
    
    switch (typeof body) {
        case 'string':
            contentType = "text/html";
            break
        case 'object':
            contentType = "application/json";
            body = JSON.stringify(message, null, 2);
            break;
        default:
            contentType = "application/json";
            this.response.statusCode = 501;
            body = JSON.stringify({ status_code : 501, description : 'unsupported content-type'}, null, 2);
    }
    
    this.response.writeHead(this.response.statusCode, {"Content-Type": contentType });
    this.response.write(body);
    this.response.end();
}

module.exports = Response;