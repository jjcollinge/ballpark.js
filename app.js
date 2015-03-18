/**
 * app.js
 * ----------------------------
 * Encapsulates all the framework
 * data independant functionality
 * such as; routing, configuration
 * and request handling.
 */

// Dependencies
var Server = require('./server');
var Response = require('./response');
var ns = require('./dao');
var url = require("url");
var router = require("./router");
var querystring = require("querystring");
   
/**
 * Wrap class in closure
 **/
var App = (function() { 
    
    var instance;
    
    /**
     * Private: Ctor
     **/
    function init() {
        
        var server = new Server();
        var handles = {};
        var dao = new ns.Dao();
        var config = {
                'webserver_address': process.env.IP,
                'webserver_port': process.env.PORT,
                'database_address': process.env.IP,
                'database_port': 27017,
                'api_root': '/api',
                'read_only': true
            };
        var ready = false;

        /**
         * Private: Extract HTTP POST data 
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
         * Private: Extract HTTP PUT data
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
         * Private: This function creates/modifies an individual handle.
         * It can facilitate multiple HTTP methods for a single
         * path.
         * 
         * NOTE: it would be better to define resource path which
         * will then append the properties to dynamically create
         * uris. For example:
         *          /api/node is the resource path,
         *          /location is the property path,
         * 
         * final path:  /api/node/location
         * 
         * route = {
         *        resource: 'api/node',
         *        properties: {
         *            location: {
         *                  get: [Function],
         *                  put: [Function],
         *                  delete: [Function],
         *                  post: [Function]
         *            }
         *            ...
         *       }
         *   }
         *   
         * However, this is not within the scope of this project
         * 
         **/
        function addHandle(path, method, handle) {
            path = config.api_root + path;
            var currentHandle = handles[path];
            if(typeof currentHandle === "undefined") {
                currentHandle = {};
            }
            currentHandle[method] = handle;
            handles[path] = currentHandle;
        }
    
    /**
     * Define classes public interface
     **/
    return {
        
        /**
         * Public: Allow for a custom configuration to be set for the application
         **/
        configure: function(configuration) {
            config = configuration;
        },
        
        /**
         * Public: Starts the web server listening
         **/
        start: function(callback) {
            
            var route = router.route;
            
            /**
             * Request listener defines the entry point routine for any HTTP requests
             **/
            function requestListener(req, res) {
                
                var url_parse = url.parse(req.url, true);
                var handle;
                var response = new Response(res);
                req.params = [];
                
                /**
                 * Grab the handle for the request pathname and method
                 **/ 
                handle = handles[url_parse.pathname];
                if(typeof handle !== "undefined") {
                    handle = handles[url_parse.pathname][req.method.toLowerCase()];
                } else {
                    // no handle exists so return error message
                    return response.statusCode(404).send({ status_code : 404, description : 'resource at given url doesn\'t exist'});
                }
                
                /**
                 * Test configuration flags here
                 **/
                if(config['read_only']) {
                    if(req.method.toLowerCase() !== 'get') {
                        return response.statusCode(400).send({ status_code : 400, description : 'the API is read only and will only accept GET requests'});
                    }
                }
                
                /**
                 * Parse parameters and invoke the route
                 **/ 
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
            
            /**
             * Public: Start the web server
             **/
            server.start(config['webserver_port'], config['webserver_address'], requestListener);
            callback();
            },
            
            /**
             * Public: Setup any additional required components
             **/
            setUp: function(callback) {
                dao.connect(config['database_port'], config['database_address'], function() {
                    callback();
                });
            },
            
            /**
             * Public: Tear down any additional required components
             **/
            tearDown: function(callback) {
                dao.disconnect(function() {
                    callback();
                });
            },
            
            /**
             * Public: Create a route for a HTTP GET request on a given path
             **/
            get: function(path, handle) {
                addHandle(path, 'get', handle);
            },
            
            /**
             * Public: Create a route for a HTTP POST request on a given path
             **/
            post: function(path, handle) {
                addHandle(path, 'post', handle);
            },
            
            /**
             * Public: Create a route for a HTTP PUT request on a given path
             **/
            put: function(path, handle) {
                addHandle(path, 'put', handle);
            },
            
            /**
             * Public: Create a route for a HTTP DELETE request on a given path
             **/
            delete: function(path, handle) {
                addHandle(path, 'delete', handle);
            },
            
            /**
             * Public: Clear all the data
             **/
            clearData: function(callback) {
                dao.clearData(callback);
            },
            
            /**
             * Public: Check if object is an empty object
             **/
            isEmpty: function(obj, callback) {
                return Object.keys(obj).length;
            }
        };
    };
    return {
        
        /**
         * Singleton access
         **/
        getInstance: function() {
            if(!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();

module.exports = App;
