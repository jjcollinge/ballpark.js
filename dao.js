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
    longitude:  { type: Number, required: true, validate: validateLongitude },
    latitude:   { type: Number, required: true, validate: validateLatitude },
    altitude:   { type: Number },
    accuracy:   { type: Number },
    heading:    { type: Number },
    speed:      { type: Number },
    tags:       { type: Object },
    created:    { type : Date, default: Date.now }
});

nodeSchema.path('altitude').validate(function(value) {
    if(value === undefined) return true;
    return (value > -10000 && value < 9000);
}, "Invalid alititude given, unless you're in space or the middle of the earth!");

nodeSchema.path('heading').validate(function(value) {
    if(value === undefined) return true;
    return (value >= 0 && value < 360);
}, "Invalid heading give, value should be a degrees between 0 and 360");

nodeSchema.path('accuracy').validate(function(value) {
    if(value === undefined) return true;
    return (value > 0 && value <= 10);
}, "Invalid accuracy given, please give a value between 1 and 10");

function validateLongitude(value) {
    return (value > -180 && value < 180);
}

function validateLatitude(value) {
    return (value > -90 && value < 90);
}

var Node = mongoose.model('Node', nodeSchema);

// Define a way schema
var waySchema = new Schema({
    nodes:  [{type: ObjectId,
              ref: 'Node'}],
    ways:   [{type: ObjectId,
              ref: 'Way'}],
    tags:  { type: Object },
    created:    { type : Date, default: Date.now }
});

var Way = mongoose.model('Way', waySchema);

var relationSchema = new Schema({
    elements: [ {
        element: { type: ObjectId, ref: 'Elements' },
        role: { type: String }
    }],
    tags:   { type: Object },
    created:    { type : Date, default: Date.now }
});

var Relation = mongoose.model('Relation', relationSchema);

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

Dao.prototype.createNode = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    
    switch(args.length) {
        case 2:
            var node = new Node({
               longitude: args[0],
               latitude: args[1],
               tags: {}
            });
            break;
        case 3:
            var node = new Node({
               longitude: args[0],
               latitude: args[1],
               altitude: args[2],
               tags: {}
            });
            break;
        case 4:
            var node = new Node({
               longitude: args[0],
               latitude: args[1],
               altitude: args[2],
               accuracy: args[3],
               tags: {}
            });
            break;
        default:
            return console.error("invalid number of arguments provided");
    }
    
    if(node.latitude < -90 || node.latitude > 90 || node.longitude < -180 || node.longitude > 180) {
        return console.error("invalid geo location provided");
    } else {
        callback(node);
    }
}

Dao.prototype.saveNode = function(node, callback) {
    node.save(function(err, results) {
       if(err) return console.error(err);
       callback(results);
    });
}

Dao.prototype.deleteNode = function(id, callback) {
    Node.remove({ _id: id }, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    })
}

Dao.prototype.updateNode = function(id, update, opts, callback) {
    Node.update({_id : id}, {$set: update}, opts, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.findNodeById = function(id, callback) {
    Node.findById(id, function(err, results) {
        if(err) return console.error(err);
        return callback(results);
    });
}

Dao.prototype.findNode = function(doc, callback) {
    Node.find(doc, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.findNodesWithinRadiusOf = function(src, radius, callback) {
    var minLon = src.longitude - radius;
    var maxLon = src.longitude + radius;
    var minLat = src.latitude - radius;
    var maxLat = src.latitude + radius;
    
    Node.find({ longitude: { $gt: minLon, $lt: maxLon },
                latitude: { $gt: minLat, $lt: maxLat }
    }, function(err, result) {
        callback(result);
    });
}

Dao.prototype.findNodesWithinBoundingBox = function(bottomLeft, topRight, callback) {
    var minLon = bottomLeft.longitude;
    var maxLon = topRight.longitude;
    var minLat = bottomLeft.latitude;
    var maxLat = topRight.latitude;
    
    Node.find({ longitude: { $gt: minLon, $lt: maxLon },
                latitude: { $gt: minLat, $lt: maxLat }
    }, function(err, result) {
        callback(result);
    });
}

Dao.prototype.clearAllNodes = function(callback) {
    Node.remove({}, function(err) { 
        if(err) return console.error(err);
        callback();
    });
}

Dao.prototype.createWay = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    
    var nodeArgs = [];
    var wayArgs = [];
    
    for(index in args) {
        if(args[index] instanceof Node) {
            nodeArgs.push(args[index]);
        } else if(args[index] instanceof Way){
            wayArgs.push(args[index]);
        } else {
            callback("an argument has an unsupported type: " + args[index].constructor);
        }
    }
    
    var way = new Way({
        nodes: nodeArgs,
        ways: wayArgs,
        tags: {}
    });
    callback(way);
}

Dao.prototype.saveWay = function(way, callback) {
    way.save(function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.deleteWay = function(id, callback) {
    Way.remove({ _id: id }, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.updateWay = function(id, update, opts, callback) {
    Way.update({_id : id}, {$set: update}, opts, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.findWayById = function(id, callback) {
    Way.find({ _id: id }, function(err, results) {
        if(err) return console.error(err);
        return callback(results);
    });
}

Dao.prototype.findWay = function(doc, callback) {
    Way.find(doc, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.findWaysWithinRadiusOf = function(src, radius, callback) {
    var minLon = src.longitude - radius;
    var maxLon = src.longitude + radius;
    var minLat = src.latitude - radius;
    var maxLat = src.latitude + radius;
    
    Way.find({ longitude: { $gt: minLon, $lt: maxLon },
                latitude: { $gt: minLat, $lt: maxLat }
    }, function(err, result) {
        callback(result);
    });
}

Dao.prototype.findWaysWithinBoundingBox = function(bottomLeft, topRight, callback) {
    var minLon = bottomLeft.longitude;
    var maxLon = topRight.longitude;
    var minLat = bottomLeft.latitude;
    var maxLat = topRight.latitude;
    
    Way.find({ longitude: { $gt: minLon, $lt: maxLon },
                latitude: { $gt: minLat, $lt: maxLat }
    }, function(err, result) {
        callback(result);
    });
}

Dao.prototype.clearAllWays = function(callback) {
    Way.remove({}, function(err) { 
        if(err) return console.error(err);
       callback();
    });
}

Dao.prototype.createRelation = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    
    var relation = new Relation({
        elements: [],
        tags: {}
    });
    
    for(index in args) {
        relation.elements.push(args[index]);
    }
    callback(relation);
}

Dao.prototype.saveRelation = function(relation, callback) {
    relation.save(function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.deleteRelation = function(id, callback) {
    Relation.remove({ _id: id }, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.updateRelation = function(id, update, opts, callback) {
    Relation.update({ _id : id }, {$set: update}, opts, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.findRelation = function(doc, callback) {
    Relation.find(doc, function(err, results) {
        if(err) return console.error(err);
        callback(results);
    });
}

Dao.prototype.findRelationById = function(id, callback) {
    Relation.find( { _id: id }, function(err, results) {
        if(err) return console.error(err);
        return callback(results);
    });
}

Dao.prototype.clearAllRelations = function(callback) {
    Relation.remove({}, function(err) { 
        if(err) return console.error(err);
       callback();
    });
}

module.exports = Dao;