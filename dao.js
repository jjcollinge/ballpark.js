/**
 * The DAO wraps a MongoDB database and
 * allows the rest of the application to
 * perform persistent operations on their
 * data elements
 */

// Dependencies
var mongoose = require('mongoose');
var async = require('async');

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
    nodes:  [{type: Schema.Types.ObjectId, ref: 'Node'}],
    ways:   [{type: Schema.Types.ObjectId, ref: 'Way'}],
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
            console.log("Created Node: " + data);
            node._id = data._id;
            cb(node);
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
    Node.findById(id, function(err, data) {
        if(err) return console.error(err);
        console.log("Found: " + data);
        return cb(data);
    });
}

Dao.prototype.findNode = function(doc, cb) {
    Node.find(doc, function(err, data) {
        if(err) return console.error(err);
        console.log("Found: " + data);
        cb(data);
    });
}

Dao.prototype.clearAllNodes = function(cb) {
    Node.remove({}, function(err) { 
        if(err) return console.error(err);
        console.log('nodes collection removed');
        cb();
    });
}

// ===============Way CRUD methods===================== //

Dao.prototype.addWay = function(way, cb) {
    
    // create the default way
    var thisWay = new Way({
      nodes: [],
      ways: [],
      tags: way.tags
    });
    
    var that = this;

    var refNodes = async.each(way.nodes, function(_node, callback) {
        var id = _node._id;
        if(id === undefined) {
            that.addNode(_node, function(newNode) {
                _node._id = newNode._id;
                thisWay.ways.push(_node._id);
            });
        } else {
            thisWay.nodes.push(id);
        }
    });

    var refWays = async.each(way.ways, function(_way, callback) {
        var id = _way._id;
        if(id === undefined) {
            that.addWay(_way, function(newWay) {
                _way._id = newWay._id;
                thisWay.ways.push(_way._id);
            });
        } else {
            thisWay.ways.push(id);
        }
    });
    
    // save the way
   var saveWay = thisWay.save(function(err, data) {
        if(err) return console.error(err);
        else {
            way._id = data._id;
            cb(way);
        }
    });
    
    async.series([refNodes, refWays, saveWay], function(err, results) {
        console.log("done");
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
        console.log("Found: " + data);
        cb(data);
    });
}

Dao.prototype.findWay = function(doc, cb) {
    Way.find(doc, function(err, data) {
        if(err) return console.error(err);
        console.log("Found: " + data);
        cb(data);
    });
}

Dao.prototype.clearAllWays = function(cb) {
    Way.remove({}, function(err) { 
        if(err) return console.error(err);
       console.log('way collection removed');
       cb();
    });
}

// ===============Utility methods===================== //

// find nodes within bounding box in order of closest first
Dao.prototype.findNodesWithinRadiusOf = function(src, radius, cb) {
    var minLon = src.lon - radius;
    var maxLon = src.lon + radius;
    var minLat = src.lat - radius;
    var maxLat = src.lat + radius;
    
    Node.find({ longitude: { $gt: minLon, $lt: maxLon },
                latitude: { $gt: minLat, $lt: maxLat }
    }, function(err, data) {
        if(typeof data != undefined) {
            data.sort(function(a, b) {
            var disA = src.distanceTo(a);
            var disB = src.distanceTo(b);
            
            return disA - disB;
            });
        }
        cb(data);
    });
}

module.exports = Dao;