/**
 * The app is responsible for encapsulating all
 * the functionality of the middleware and offering
 * the client a single interface to use
 */

// Dependencies
var Server = require('./server');
var Response = require('./response');
var Dao = require('./dao');
var url = require("url");
var router = require("./router");
var querystring = require("querystring");

/**
 * Ctor
 **/
function App() {
    this.server = new Server();
    this.handles = {};
    this.dao = new Dao.Dao();
    this.config = {
        'webserver_address': process.env.IP,
        'webserver_port': process.env.PORT,
        'database_address': process.env.IP,
        'database_port': 27017,
        'api_root': '/api',
        'read_only': true
    };
    this.ready = false;
}

/**
 * Allow for a custom configuration to be set for the application
 **/
App.prototype.configure = function(configuration) {
    this.config = configuration;
}

/**
 * Starts the web server listening
 **/
App.prototype.start = function(callback) {
    
    var route = router.route;
    var _this = this;
    
    function requestListener(req, res) {
        
        var url_parse = url.parse(req.url, true);
        var handle;
        var response = new Response(res);
        req.params = [];
        
        // grab the associated handle if it exists
        handle = _this.handles[url_parse.pathname];
        if(typeof handle !== "undefined") {
            handle = _this.handles[url_parse.pathname][req.method.toLowerCase()];
        } else {
            return response.statusCode(404).send({ status_code : 404, description : 'resource at given url doesn\'t exist'});
        }

        if(_this.config['read_only']) {
            if(req.method.toLowerCase() !== 'get') {
                return response.statusCode(400).send({ status_code : 400, description : 'the API is read only and will only accept GET requests'});
            }
        }
        
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
            response.statusCode(501).send({ status_code : 501, description : 'unsupported HTTP method'});
        }
    }
    
    this.server.start(this.config['webserver_port'], this.config['webserver_address'], requestListener);
    callback();
}

/**
 * Setup any additional required components
 **/
App.prototype.setUp = function(callback) {
    this.dao.connect(this.config['database_port'], this.config['database_address'], function() {
        callback();
    });
}

/**
 * Tear down any additional required components
 **/
App.prototype.tearDown = function(callback) {
    this.dao.disconnect(function() {
        callback();
    });
}

/**
 * Extract HTTP POST data 
 **/
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

/**
 * Extract HTTP PUT data
 **/
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
    path = this.config.api_root + path;
    var currentHandle = this.handles[path];
    if(typeof currentHandle === "undefined") {
        currentHandle = {};
    }
    currentHandle[method] = handle;
    this.handles[path] = currentHandle;
}

/**
 * Create a route for a HTTP GET request on a given path
 **/
App.prototype.get = function(path, handle) {
    this.addHandle(path, 'get', handle);
}

/**
 * Create a route for a HTTP POST request on a given path
 **/
App.prototype.post = function(path, handle) {
    this.addHandle(path, 'post', handle);
}

/**
 * Create a route for a HTTP PUT request on a given path
 **/
App.prototype.put = function(path, handle) {
    this.addHandle(path, 'put', handle);
}

/**
 * Create a route for a HTTP DELETE request on a given path
 **/
App.prototype.delete = function(path, handle) {
    this.addHandle(path, 'delete', handle);
}

App.prototype.clearData = function(callback) {
    this.dao.clearData(callback);
}

App.prototype.isEmpty = function(obj, callback) {
    return Object.keys(obj).length;
}

module.exports = {
    App: App,
    Node: Dao.Node,
    Way: Dao.Way,
    Relation: Dao.Relation
};
