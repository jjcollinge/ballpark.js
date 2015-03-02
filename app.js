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
            response.statusCode(501).send({ status_code : 501, description : 'unsupported HTTP method'});
        }
    }
    
    this.server.start(this.config['webserver_port'], this.config['webserver_address'], requestListener);
    console.log("started listening on server: " + "http://" + this.config['webserver_address'] + ':' + this.config['webserver_port']);
    callback();
}

App.prototype.setUpDaoConnection = function(callback) {
    this.dao.connect(this.config['database_port'], this.config['database_address'], function() {
        console.log("setup data access connection");
        callback();
    });
}

App.prototype.tearDownDaoConnection = function(callback) {
    this.dao.disconnect(function() {
        console.log("tore down data access connection");
        callback();
    });
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

App.prototype.getAllNodes = function(cb) {
    this.dao.findNode({}, function(result) {
        cb(result);
    });
}

App.prototype.getNode = function(id, cb) {
    if(id) {
        this.dao.findNodeById(id, function(result) {
           cb(result);
       })
   } else {
       cb({status_code: 404, description: 'undefined id provided'});
   }
}

App.prototype.addNode = function(node, cb) {
    this.dao.addNode(node, function(addedNode) {
        cb({status_code: 200, description: 'added node: ', payload: addedNode});
    });
}

App.prototype.updateNode = function(id, update, cb) {
   if(id) {
        this.dao.updateNode(id, update, function(num) {
            if(num > 0) {
                cb({status_code : 200, description : 'updated node'});
            } else {
                cb({status_code : 404, description : 'no node exists with that id to update'});
            }
        });
   } else { 
       cb({status_code: 404, description: 'undefined id provided'});
   }
}

App.prototype.removeNode = function(id, cb) {
    if(id) {
        this.dao.deleteNode(id, function(num) {
            if (num > 0) {
                cb({status_code : 200, description : 'removed node'});
            } else {
                cb({status_code: 404, description: 'no node exists with that id to delete'});
            }
        });
    } else {
        cb({status_code: 404, description: 'undefined id provided'});
    }
}

App.prototype.addWay = function(way, cb) {
    this.dao.addWay(way, function(addedWay) {
        cb({status_code: 200, description: 'added way: ', payload: addedWay});
    });
}

App.prototype.getAllWays = function(cb) {
    this.dao.findWay({}, function(result) {
        cb(result);
    });
}

App.prototype.getWay = function(id, cb) {
    if(id) {
        this.dao.findWayById(id, function(result) {
            cb(result[0]);
        })
    } else {
        cb({status_code: 404, description: 'undefined id given'});
    }
}

App.prototype.updateWay = function(id, update, cb) {
    if(id) {
        this.dao.updateWay(id, update, function(num) {
            if(num > 0) {
                cb({status_code : 200, description : 'updated way'});
            } else {
                cb({status_code: 404, description: 'no way exists with that id to update'});
            }
        });
    } else {
        cb({status_code: 404, description: 'undefined id given'});
    }
}

App.prototype.removeWay = function(id, cb) {
    if(id) {
        this.dao.deleteWay(id, function(num) {
           if(num > 0) {
               cb({status_code : 404, description : 'removed way'});
           } else {
               cb({status_code: 404, description: 'no way exists with that id to delete'});
           }
        });
    } else {
        cb({status_code: 404, description: 'undefined id given'});
    }
}

App.prototype.clearAllNodes = function(cb) {
    this.dao.clearAllNodes(cb);
}

App.prototype.clearAllWays = function(cb) {
    this.dao.clearAllWays(cb);
}

module.exports = App;
