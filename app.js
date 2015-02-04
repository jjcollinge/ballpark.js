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
}

App.prototype.start = function(port, handle) {
    
    var route = router.route;
    
    function start(req, res) {
        var url_parse = url.parse(req.url);
        route(handle, url_parse.pathname, url_parse.query, res);
    }
    
    this.server.start(port, start);
}

module.exports = App;