/**
 * The DAO wraps a MongoDB database and
 * allows the rest of the application to
 * perform persistent operations on their
 * data elements
 */

// Dependencies
var mongoose = require('mongoose');

var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

// Define a node schema
var nodeSchema = new Schema({
    longitude:  { type: Number, required: true },
    latitude:   { type: Number, required: true },
    altitude:   { type: Number },
    accuracy:   { type: Number },
    tags:       { type: Object }
});

mongoose.model('Node', nodeSchema);
var Node = mongoose.model('Node', nodeSchema);

// Define a way schema
var waySchema = new Schema({
    nodes:  [nodeSchema],
    ways:   [waySchema],
    tags :  { type: Object }
});

mongoose.model('Way', waySchema);
var Way = mongoose.model('Way', waySchema);

function Dao() {
    this.db = mongoose.connection;
}

Dao.prototype.connect = function(port, ip, cb) {
    
    var url = 'mongodb://' + ip +':' + port + '/test';
    
    this.db = mongoose.connect(url, function(err, res) {
        if(err) {
            console.error('Failed to connect to MongoDB database on url: ' + url + ' with error: ' + err);
        } else {
            console.log('connected to database: ' + url);
            cb();
        }
    });
    
    mongoose.connection.on('disconnected', function() {
        console.log("disconnected from database");
    })
}

Dao.prototype.disconnect = function(cb) {
    mongoose.disconnect(cb);
    
}

Dao.prototype.isConnected = function() {
    if(this.db.readyState !== 2) {
        return false;
    } 
    return true;
}

// ===============Node CRUD methods===================== //

Dao.prototype.addNode = function(node, cb) {
    var _node = new Node({
       longitude: node.lon,
       latitude: node.lat,
       altitude: node.alt,
       accuracy: node.acc,
       tags: node.tags
    });
    _node.save(function(err, data) {
        if(err) {
            return console.error(err);
        } else {
            console.log("Created: " + data);
            cb(data);
        }
    });
}

Dao.prototype.deleteNode = function(id, cb) {
    Node.remove({ _id: id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Deleted: " + data);
            cb(data);
        }
    });
}

Dao.prototype.updateNode = function(id, update, cb) {
    var opts = {};
    Node.update({_id : id}, {$set: update}, opts, function(err, node) {
        if(err) return console.error(err);
        cb(node);
    });
}

Dao.prototype.findNodeById = function(id, cb) {
    Node.find({ _id: id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Found: " + data);
            cb(data);
        }
    });
}

Dao.prototype.findNode = function(doc, cb) {
    Node.find(doc, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Found: " + data);
            cb(data);
        }
    });
}

Dao.prototype.clearAllNodes = function() {
    Node.remove({}, function(err) { 
        if(err) return console.error(err);
       console.log('nodes collection removed');
    });
}

// ===============Way CRUD methods===================== //

Dao.prototype.addWay = function(way, cb) {

    var _nodes = [];
    var _ways = [];
    
    // create the default way
    var theWay = new Way({
      nodes: [],
      ways: [],
      tags: way.tags
    });
    
    // for each node nested in the way
    for(var i = 0; i < way.nodes.length; i++) {
        _nodes[i] = new Node({
             longitude: way.nodes[i].lon,
             latitude: way.nodes[i].lat,
             altitude: way.nodes[i].alt,
             accuracy: way.nodes[i].acc,
             tags: way.nodes[i].tags
        });
        theWay.nodes.push(_nodes[i]);
    }

    // for each way nested in the way
    for(var i = 0; i < way.ways.length; i++) {
        _ways[i] = new Way({
             nodes: way.ways[i].nodes,
             ways: way.ways[i].ways,
             tags: way.ways[i].tags
        });
        theWay.ways.push(_ways[i]);
    }
    
    console.dir(theWay);
    
    // save the way
    theWay.save(function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Created: " + data);
            cb(data);
        }
    });
}

Dao.prototype.deleteWay = function(id, cb) {
    Way.remove({ _id: id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Deleted: " + data);
            cb(data);
        }
    });
}

Dao.prototype.updateWay = function(id, update, cb) {
    var opts = {};
    Way.update({_id : id}, {$set: update}, opts, function(err, data) {
        if(err) return console.error(err);
        console.log("Updated: " + data);
        cb(data);
    });
}

Dao.prototype.findWayById = function(id, cb) {
    Way.find({ _id: id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Found: " + data);
            cb(data);
        }
    });
}

Dao.prototype.clearAllWays = function() {
    Way.remove({}, function(err) { 
        if(err) return console.error(err);
       console.log('way collection removed'); 
    });
}

module.exports = Dao;