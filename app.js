/**
 * The app is responsible for encapsulating all
 * the functionality of the middleware and offering
 * the client a single interface to use
 */

// dependencies
var Server = require('./server');
var url = require("url");
var router = require("./router");

// constructor
function App() {
    this.server = new Server();
    this.handles = {};
}

App.prototype.start = function(port) {
    
    var route = router.route;
    
    var _this = this;
    
    function handleRequest(req, res) {
        var url_parse = url.parse(req.url);
        var handle = _this.handles[url_parse.pathname];
        route(handle, url_parse.query, res);
    }
    
    this.server.start(port, handleRequest);
}

App.prototype.get = function(path, handle) {
    this.handles[path] = handle;
}

App.prototype.post = function(path, handle) {
    this.handles[path] = handle;
}

App.prototype.put = function(path, handle) {
    this.handles[path] = handle;
}

App.prototype.delete = function(path, handle) {
    this.handles[path] = handle;
}

module.exports = App;