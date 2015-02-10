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
        var url_parse = url.parse(req.url);
        var handle = _this.handles[url_parse.pathname];
        var response = new Response(res);
        route(handle, url_parse.query, response);
    }
    
    this.server.start(this.config['Port'], this.config['Address'], requestListener);
    callback("http://" + this.config['Address'] + ':' + this.config['Port']);
}

App.prototype._method = function(path, handle) {
    this.handles[path] = handle;
}

App.prototype.get = function(path, handle) {
    this._method(path, handle);
}

App.prototype.post = function(path, handle) {
    this._method(path, handle);
}

App.prototype.put = function(path, handle) {
    this._method(path, handle);
}

App.prototype.delete = function(path, handle) {
    this._method(path, handle);
}

module.exports = App;
