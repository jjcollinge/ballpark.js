/**
 * The ballpark js is the main entry
 * point for the system. This will act as
 * a facade to expose the middleware 
 * components to the client in a controlled
 * manner.
 */
 
// dependencies
var http = require("http");
var url = require("url");
var router = require("./router");


exports.start = function(handle, port) {
    
   if(port == undefined) {
        process.env.PORT? port = process.env.PORT: port = 3000;
    }
    
    var route = router.route;
    
    function start(req, res) {
        var url_parse = url.parse(req.url);
        route(handle, url_parse.pathname, url_parse.query, res);
    }
    
    // each time there is a request the function passed will be called
    return http.createServer(start).listen(port);
}

