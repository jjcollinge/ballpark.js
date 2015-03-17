/**
 * A mock API to demonstrate the framework
 **/

// Dependencies
var ballpark = require('./ballpark');
var namespace = ballpark();

/**
 * Initialise the application and the RESTful API to test
 * ------------------------------------------------------
 * This included configuring the database and web server
 * addresses. Routes will be setup in a RESTful manner.
 **/

var app = new namespace.App();
var Node = namespace.Node;
var Way = namespace.Way;
var Relation = namespace.Relation;

app.configure({
    'webserver_address': process.env.IP,
    'webserver_port': process.env.PORT,
    'database_address': process.env.IP,
    'database_port': 27017,
    'api_root': '/api'
});

app.get("/nodes", function(req, resp) {
    Node.getAll(function(nodes) {
       resp.send(nodes);
   });
});

app.get("/node", function(req, resp) {
    var id = req.params.id;
    try {
        Node.getById(id, function(node) {
            resp.send(node);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/node/xml", function(req, resp) {
    var id = req.params.id;
    try {
        Node.getById(id, function(node) {
            resp.format = 'xml';
            resp.send(node);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.post("/node", function(req, resp) {
    var _location = [Number(req.params['location[0]']), Number(req.params['location[1]'])];
    try {
        var newNode = new Node({
            location: _location
        });
        newNode.save(function(err, node) {
            if(err) throw err;
            resp.send({ status_code: 200, payload: 'created new node with id ' + node._id });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.put("/node/location", function(req, resp) {
    var id = req.params.id;
    var update = {
        location: req.params.location
    };
    var opts = {};
    try {
        Node.amend(id, update, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'updated ' + result + ' node(s)' });
            else
                resp.send({ status_code: 400, payload: 'no matching node with that id to update' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.delete("/node", function(req, resp) {
    var id = req.params.id;
    try {
       Node.delete(id, function(result) {
           if(result > 0)
                resp.send({ status_code: 200, payload: 'deleted ' + result + ' node(s)' });
            else
                resp.send({ status_code: 400, payload: 'no matching node with that id to delete' });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/nodes/count", function(req, resp) {
    var query = req.params;
    try {
       Node.count(query, function(err, count) {
           resp.send({ status_code: 200, payload: count });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});


app.get("/nodes/countWithTag", function(req, resp) {
    var query = req.params;
    try {
       Node.countWithTag(query, function(count) {
           resp.send({ status_code: 200, payload: count });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/nodes/near", function(req, resp) {
    var lon = Number(req.params.lon);
    var lat = Number(req.params.lat);
    var dis = Number(req.params.dis);
    try {
        Node.findNear(lon,
                      lat,
                      dis,
                      function(results) {
                          resp.send(results);
                      });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
})

app.get("/ways", function(req, resp) {
   Way.getAll(function(ways) {
       resp.send(ways);
   });
});

app.get("/way", function(req, resp) {
    var id = req.params.id;
    try {
        Way.getById(id, function(node) {
            resp.send(node);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.post("/way", function(req, resp) {
    try {
        var newWay = new newWay({
        });
        newWay.save(function(err, way) {
            if(err) throw err;
            resp.send({ status_code: 200, payload: 'created new way with id ' + way._id });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});


app.delete("/way", function(req, resp) {
    var id = req.params.id;
    try {
       Way.delete(id, function(result) {
           if(result > 0)
                resp.send({ status_code: 200, payload: 'deleted ' + result + ' way(s)' });
            else
                resp.send({ status_code: 400, payload: 'no matching way with that id to delete' });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/way/nodes", function(req, resp) {
    var id = req.params.id;
    try {
        Way.getNestedWays(id, function(results) {
            resp.send(results);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.put("/way/node", function(req, resp) {
    console.log("routed");
    var id = req.params.id;
    var nodeId = req.params.nodeId;
    var opts = {};
    try {
        Way.addNestedNode(id, nodeId, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'added ' + result + ' node(s) to way' });
            else
                resp.send({ status_code: 400, payload: 'no matching way with that id to update' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.delete("/way/node", function(req, resp) {
    var id = req.params.id;
    var nodeId = req.params.nodeId;
    var opts = {};
    try {
        Way.removeNestedNode(id, nodeId, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'remove ' + result + ' node(s) from way' });
            else
                resp.send({ status_code: 400, payload: 'no matching nested node with that id to remove' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/way/ways", function(req, resp) {
    var id = req.params.id;
    try {
        Way.getNestedWays(id, function(results) {
            resp.send(results);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.put("/way/way", function(req, resp) {
    var id = req.params.id;
    var wayId = req.params.wayId;
    var opts= {};
    try {
        Way.addNestedWay(id, wayId, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'added ' + result + ' way(s) to way' });
            else
                resp.send({ status_code: 400, payload: 'no matching way with that id to update' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.delete("/way/way", function(req, resp) {
    var id = req.params.id;
    var wayId = req.params.wayId;
    var opts = {};
    try {
        Way.removeNestedWay(id, wayId, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'remove ' + result + ' way(s) from way' });
            else
                resp.send({ status_code: 400, payload: 'no matching nested way with that id to remove' });
        })
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.put("/way/tags", function(req, resp) {
    var id = req.params.id;
    var tagz = req.params.tags;
    var update = {
        tags: tagz
    };
    var opts = {};
    try {
        Way.amend(id, update, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'updated ' + result + ' way(s)' });
            else
                resp.send({ status_code: 400, payload: 'no matching way with that id to update' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/ways/count", function(req, resp) {
    var query = req.params;
    try {
       Way.count(query, function(err, count) {
           resp.send({ status_code: 200, payload: count });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/ways/countWithTag", function(req, resp) {
    var query = req.params;
    try {
       Way.countWithTag(query, function(count) {
           resp.send({ status_code: 200, payload: count });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/waysWithNode", function(req, resp) {
    var nodeId = req.params.nodeId;
    try {
       Way.getAllContainingNode(nodeId, function(results) {
           resp.send({ status_code: 200, payload: results });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/summarise", function(req, resp) {
    var query = {};
    try {
       Node.count(query, function(err, nodeCount) {
           if(err) { console.error(err); throw err; }
           Way.count(query, function(err, wayCount) {
               if(err) { console.error(err); throw err; }
               Relation.count(query, function(err, relationCount) {
                   if(err) { console.error(err); throw err; }
                   var summary = {
                       'nodes': nodeCount,
                       'ways': wayCount,
                       'relations': relationCount
                   }
                   resp.send({ status_code: 200, payload: summary });
               });
           });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/speedlimits", function(req, resp) {
    try {
       Way.mapReducer(function() {
           emit(this.tags, 1);
       }, function(key, values) {
           return values.length;
       }, function(err, results) {
           if(err) { console.error(err); throw err; }
           console.log("here");
           resp.send({ status_code: 200, payload: results});
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/relations", function(req, resp) {
    Relation.getAll(function(ways) {
       resp.send(ways);
   });
});

app.get("/relation", function(req, resp) {
    var id = req.params.id;
    try {
        Relation.getById(id, function(node) {
            resp.send(node);
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.post("/relation", function(req, resp) {
    try {
        var newRelation = new Relation({
            tags: { name: 'district9' }
        });
        newRelation.save(function(err, relation) {
            if(err) throw err;
            resp.send({ status_code: 200, payload: 'created new relation with id ' + relation._id });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.delete("/relation", function(req, resp) {
    var id = req.params.id;
    try {
       Relation.delete(id, function(result) {
           if(result > 0)
                resp.send({ status_code: 200, payload: 'deleted ' + result + ' relation(s)' });
            else
                resp.send({ status_code: 400, payload: 'no matching relation with that id to delete' });
       });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.put("/relation/tags", function(req, resp) {
    var id = req.params.id;
    var tagz = req.params.tags;
    var update = {
        tags: tagz
    };
    var opts = {};
    try {
        Relation.amend(id, update, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'updated ' + result + ' relation(s)' });
            else
                resp.send({ status_code: 400, payload: 'no matching relation with that id to update' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.put("/relation/member", function(req, resp) {
    var id = req.params.id;
    var memberId = req.params.memberId;
    var opts= {};
    try {
        Relation.addMember(id, memberId, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'added ' + result + ' member(s) to relation' });
            else
                resp.send({ status_code: 400, payload: 'no matching relation with that id to update' });
        });
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.delete("/relation/member", function(req, resp) {
    var id = req.params.id;
    var memberId = req.params.memberId;
    var opts = {};
    try {
        Relation.removeMember(id, memberId, opts, function(result) {
            if(result > 0)
                resp.send({ status_code: 200, payload: 'remove ' + result + ' member(s) from relation' });
            else
                resp.send({ status_code: 400, payload: 'no matching relation with that id to remove' });
        })
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

app.get("/relation/members", function(req, resp) {
    var id = req.params.id;
    try {
        Relation.getMembers(id, function(results) {
            resp.send(results);
        })
    } catch(err) {
        resp.send({ status_code: 500, payload: err.message});
    }
});

module.exports = {
    app: app,
    namespace: namespace
}
