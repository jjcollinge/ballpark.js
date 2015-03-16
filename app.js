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
    this.dao = new Dao();
    this.handles = {};
    this.config = {
        'webserver_address': process.env.IP,
        'webserver_port': process.env.PORT,
        'database_address': process.env.IP,
        'database_port': 27017
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
            response.statusCode(404).send({ status_code : 404, description : 'resource at given url doesn\'t exist'});
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
    console.log("started listening on server: " + "http://" + this.config['webserver_address'] + ':' + this.config['webserver_port']);
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

/**
 * Create a Node object
 **/
App.prototype.createNode = function() {
    var args = Array.prototype.slice.call(arguments);
    this.dao.createNode.apply(null, args);
}

/**
 * Get all available nodes
 **/
App.prototype.getAllNodes = function(callback) {
    this.dao.findNode({}, function(result) {
        callback(result);
    });
}

/**
 * Get a node by id
 **/
App.prototype.getNode = function(id, callback) {
    try {
        this.dao.findNodeById(id, function(result) {
           callback(result);
        });
    } catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Save a node
 **/
App.prototype.saveNode = function(node, callback) {
    this.dao.saveNode(node, function(savedNode) {
        callback({status_code: 200, description: 'stored node', payload: savedNode});
    });
}

/**
 * Update a node
 **/ 
App.prototype.updateNode = function(id, update, opts, callback) {
    try {
        this.dao.updateNode(id, update, opts, function(num) {
            if(num > 0) {
                callback({status_code: 200, description: 'updated node'});
            } else {
                callback({status_code: 404, description: 'no node exists with that id to update'});
            }
        });
    } catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Remove a node
 **/ 
App.prototype.removeNode = function(id, callback) {
    try {
        this.dao.deleteNode(id, function(num) {
            if (num > 0) {
                callback({status_code: 200, description: 'removed node'});
            } else {
                callback({status_code: 404, description: 'no node exists with that id to delete'});
            }
        });
    } catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Get the total number of nodes
 **/ 
App.prototype.getNodeCount = function(callback) {
    var sum = 0;
    this.dao.each("Node", {}, {},
        function(val) {
            return sum += 1;
        }, function(results) {
            // ignore results...
            callback({status_code: 200, count: sum});
        });
}

/**
 * Get the total number of ways
 **/
App.prototype.getWayCount = function(callback) {
    var sum = 0;
    this.dao.each("Way", {}, {},
        function(val) {
            return sum += 1;
        }, function(results) {
            callback({status_code: 200, count: sum});
        });
}

/**
 * Get the total number of relations
 **/
App.prototype.getRelationCount = function(callback) {
    var sum = 0;
    this.dao.each("Relation", {}, {},
        function(val) {
            return sum += 1;
        }, function(results) {
            callback({status_code: 200, count: sum});
        });
}

/**
 * Create a way object
 **/
App.prototype.createWay = function() {
    var args = Array.prototype.slice.call(arguments);
    this.dao.createWay.apply(null, args);
}

/**
 * Save a way
 **/
App.prototype.saveWay = function(way, callback) {
    this.dao.saveWay(way, function(savedWay) {
        callback({status_code: 200, description: 'stored way', payload: savedWay});
    });
}

/**
 * Get all available ways
 **/
App.prototype.getAllWays = function(callback) {
    this.dao.findWay({}, function(result) {
        callback(result);
    });
}

/**
 * Get a way by id
 **/
App.prototype.getWay = function(id, callback) {
    try {
        this.dao.findWayById(id, function(results) {
            callback(results[0]);
        });
    } catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Update an existing way
 **/
App.prototype.updateWay = function(id, update, opts, callback) {
    try {
        this.dao.updateWay(id, update, opts, function(num) {
            if(num > 0) {
                callback({status_code: 200, description: 'updated way'});
            } else {
                callback({status_code: 404, description: 'no way exists with that id to update'});
            }
        });
    }  catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Remove a way
 **/
App.prototype.removeWay = function(id, callback) {
    try {
        this.dao.deleteWay(id, function(num) {
           if(num > 0) {
               callback({status_code: 200, description: 'removed way'});
           } else {
               callback({status_code: 404, description: 'no way exists with that id to delete'});
           }
        });
    }  catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Create a relation object
 **/
App.prototype.createRelation = function() {
    var args = Array.prototype.slice.call(arguments);
    this.dao.createRelation.apply(null, args);
}

/**
 * Save a relation
 **/
App.prototype.saveRelation = function(relation, callback) {
    this.dao.saveRelation(relation, function(savedRelation) {
        callback({status_code: 200, description: 'stored relation', payload: savedRelation});
    });
}

/**
 * Get all available relations
 **/
App.prototype.getAllRelations = function(callback) {
    this.dao.findRelation({}, function(result) {
        callback(result);
    });
}

/**
 * Get a relation by id
 **/
App.prototype.getRelation = function(id, callback) {
    try {
        this.dao.findRelationById(id, function(results) {
            callback(results[0]);
        });
    } catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Update an existing relation
 **/
App.prototype.updateRelation = function(id, update, opts, callback) {
    try {
        this.dao.updateRelation(id, update, opts, function(num) {
            if(num > 0) {
                callback({status_code: 200, description: 'updated relation'});
            } else {
                callback({status_code: 404, description: 'no relation exists with that id to update'});
            }
        });
    } catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Remove a relation
 **/
App.prototype.removeRelation = function(id, callback) {
    try {
        this.dao.deleteRelation(id, function(num) {
           if(num > 0) {
               callback({status_code: 200, description: 'removed relation'});
           } else {
               callback({status_code: 404, description: 'no relation exists with that id to delete'});
           }
        });
    } catch(e) {
        callback({status_code: 500, description: 'invalid id given'});
    }
}

/**
 * Clear all saved nodes
 **/
App.prototype.clearAllNodes = function(callback) {
    this.dao.clearAllNodes(callback);
}

/**
 * Clear all saved ways
 **/
App.prototype.clearAllWays = function(callback) {
    this.dao.clearAllWays(callback);
}

/**
 * Clear all saved relations
 **/
App.prototype.clearAllRelations = function(callback) {
    this.dao.clearAllRelations(callback);
}

/**
 * Find nodes within a radius of a given node
 **/
App.prototype.findNodesWithinRadiusOf = function(node, radius, callback) {
    this.dao.findNodesWithinRadiusOf(node, radius, callback);
}

/**
 * Find nodes within a given bounding box
 **/
App.prototype.findNodesWithinBoundingBox = function(bottomLeftNode, topRightNode, callback) {
    this.dao.findNodesWithinBoundingBox(bottomLeftNode, topRightNode, callback);
}

/**
 * Find nodes within a given bounding box
 **/
App.prototype.findNodesWithinBoundingBox = function(bottomLeftLongitude, bottomLeftLatitude, topRightLongitude, topRightLatitude, callback) {
    this.dao.createNode(bottomLeftLongitude, bottomLeftLatitude, function(bottomLeftNode) {
        this.dao.createNode(topRightLongitude, topRightLatitude, function(topRightNode) {
            this.dao.findNodesWithinBoundingBox(bottomLeftNode, topRightNode, callback);
        });
    });
}

/**
 * Find ways within a radius of a given way
 **/
App.prototype.findWaysWithinRadiusOf = function(node, radius, callback) {
    this.dao.findWaysWithinRadiusOf(node, radius, callback);
}

/**
 * Find ways within a given bounding box
 **/
App.prototype.findWaysWithinBoundingBox = function(bottomLeftNode, topRightNode, callback) {
    this.dao.findWaysWithinBoundingBox(bottomLeftNode, topRightNode, callback);
}

module.exports = App;
