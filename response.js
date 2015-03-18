/**
 * response.js
 * ----------------------------
 * The response wraps the standard http
 * response object and allows the framework
 * to add additional behaviour & data.
 */

// Dependencies
var http = require("http");
var js2xmlparser = require("js2xmlparser");

/**
 * Ctor
 **/
function Response(res) {
    this.prototype = http.ServerResponse.prototype;
    this.response = res;
    // default response format
    this.response.statusCode = 200;
    this.format = 'json';
}

/**
 * Change/Set the response status code
 **/
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
    
    if(this.response.statusCode === undefined) this.response.statusCode = 500;
    if(body === null) return this.send({ status_code: 500, description: 'someting went wrong and your request cannot be handled'});
    if(message.status_code != null) this.response.statusCode = message.status_code;
    
    /**
     * Set the appropriate headers and parse the body into the correct format
     **/
    switch (typeof body) {
        case 'string':
            contentType = "text/html";
            break;
        case 'object':
            if(this.format === 'json') {
                contentType = "application/json";
                body = JSON.stringify(body, null, 2);
                break;
            } else if(this.format === 'xml') {
                console.log("generating xml");
                contentType = "application/xml";
                body = js2xmlparser(body.type, JSON.stringify(body));
                break;
            }
        default:
            // if an unsupported type return an error
            contentType = "application/json";
            this.response.statusCode = 500;
            body = JSON.stringify({ status_code: 500, description: 'unsupported content-type'}, null, 2);
    }
    
    // compile the response and send
    this.response.writeHead(this.response.statusCode, {"Content-Type": contentType });
    this.response.write(body);
    this.response.end();
}

module.exports = Response;