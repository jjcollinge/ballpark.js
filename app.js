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
        var url_parse = url.parse(req.url);
        var handle;
        var response = new Response(res);
        
        if(req.method === 'POST') {
            // get post data from body
            var body = '';
            req.on('data', function(chunk) {
                body += chunk.toString();                
            });
            req.on('end', function(){
                decodedParams = querystring.parse(body);
            });
        } else if(req.method === 'GET') {
            // get get query params
            decodedParams = url_parse.query;
        }
        
        handle = _this.handles[url_parse.pathname];
        if(typeof handle !== "undefined") {
                handle = _this.handles[url_parse.pathname][req.method.toLowerCase()];
        }
        route(handle, decodedParams, response);
    }
    
    this.server.start(this.config['Port'], this.config['Address'], requestListener);
    callback("http://" + this.config['Address'] + ':' + this.config['Port']);
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
