/**
 * The app is responsible for encapsulating all
 * the functionality of the middleware and offering
 * the client a single interface to use
 */

// Dependencies
var Server = require('./server');
var Response = require('./response');
var Dao = require("./dao");
var url = require("url");
var router = require("./router");

function App() {
    this.server = new Server();
    this.dao = new Dao();
    this.handles = {};
    this.config = {
        'HTTPAddress': '127.0.0.1',
        'HTTPPort': '8080',
        'DatabaseAddress': '127.0.0.1',
        'DatabasePort': '27017',
        'XMLSupport' : false,
        'JSONSupport': true
    }
}

App.prototype.configure = function(configuration) {
    this.config = configuration;
}

App.prototype.start = function() {
    
    this.dao.connect(this.config['DatabasePort'], this.config['DatabaseAddress'], function(url) {
        console.log('Connected to database: '+ url);
    });
    
    var route = router.route;
    
    var _this = this;
    
    function requestListener(req, res) {
        var url_parse = url.parse(req.url);
        var handle = _this.handles[url_parse.pathname];
        var response = new Response(res);
        route(handle, url_parse.query, response);
    }
    
    this.server.start(this.config['HTTPPort'], this.config['HTTPAddress'], requestListener);
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

App.prototype.createNode = function(id, lon, lat, alt, acc) {
    return this.dao.createNode(id, lon, lat, alt, acc);
}

App.prototype.findNodeById = function(id, callback) {
    return this.dao.findNodeById(id, callback);
}

App.prototype.removeNode = function(node, callback) {
    return this.dao.removeNode(node, callback);
}

App.prototype.storeNode = function(node, callback) {
    return this.dao.storeNode(node, callback);
}

module.exports = App;
