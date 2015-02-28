/**
 * The app is responsible for encapsulating all
 * the functionality of the middleware and offering
 * the client a single interface to use
 */

// Dependencies
var Server = require('./server');
var Response = require('./response');
var url = require("url");
var router = require("./router");
var querystring = require("querystring");

function App() {
    this.server = new Server();
    this.handles = {};
    this.config = {
        'Address': '127.0.0.1',
        'Port': '8080',
        'XMLSupport' : false,
        'JSONSupport': true
    }
}

App.prototype.configure = function(configuration) {
    this.config = configuration;
}

App.prototype.start = function(callback) {
    
    var route = router.route;
    var _this = this;
    
    function requestListener(req, res) {
        
        var decodedParams = '';
        var url_parse = url.parse(req.url, true);
        var handle;
        var response = new Response(res);
        req.params = [];
        
        // grab the associated handle if it exists
        handle = _this.handles[url_parse.pathname];
        if(typeof handle !== "undefined") {
                handle = _this.handles[url_parse.pathname][req.method.toLowerCase()];
        } // should fail now

        // handle params
        if(req.method === 'GET') {
            // parse get parameters from url
            req.params = url_parse.query;
            route(handle, req, response);
        } else if(req.method === 'POST') {
            // parse post parameters from body
            parsePost(req, function(params) {
                req.params = params;
                route(handle, req, response);
            });
        } else if(req.method === 'PUT') {
             // parse put parameters from body
            parsePut(req, function(params) {
                req.params = params;
                route(handle, req, response);
            });
        } else if(req.method === 'DELETE') {
            // parse delete parameters from body
            parsePut(req, function(params) {
                req.params = params;
                route(handle, req, response);
            });
        } else {
            response.statusCode(501).send({ status_code : 501, description : 'Un supported HTTP method'});
        }
    }
    
    this.server.start(this.config['Port'], this.config['Address'], requestListener);
    callback("http://" + this.config['Address'] + ':' + this.config['Port']);
}

function parsePost(req, callback) {
    var data = '';
    req.on('data', function(chunk) {
        data += chunk.toString();                
    });
    req.on('end', function(){
        var post = querystring.parse(data);
        callback(post);
    });
}

function parsePut(req, callback) {
    var data = '';
    req.on('data', function(chunk) {
        data += chunk.toString();                
    });
    req.on('end', function() {
        callback(JSON.parse(data));
    });
}

/**
 * This function will create/modify an individual handle.
 * It can facilitate multiple HTTP methods for a single
 * path.
 **/
App.prototype.addHandle= function(path, method, handle) {
     var currentHandle = this.handles[path];
    if(typeof currentHandle === "undefined") {
        currentHandle = {};
    }
    currentHandle[method] = handle;
    this.handles[path] = currentHandle;
}

App.prototype.get = function(path, handle) {
    this.addHandle(path, 'get', handle);
}

App.prototype.post = function(path, handle) {
    this.addHandle(path, 'post', handle);
}

App.prototype.put = function(path, handle) {
    this.addHandle(path, 'put', handle);
}

App.prototype.delete = function(path, handle) {
    this.addHandle(path, 'delete', handle);
}

module.exports = App;
