/**
 * dao.js
 * ----------------------------
 * A data access object which
 * wraps a MongoDB database and 
 * uses mongoose as the driver.
 * All data access, storage,
 * construction and deletion will
 * be handled here.
 */

// Dependencies
var mongoose = require('mongoose');
var async = require('async');

var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

/**
 * Schema definitions
 * ==================
 **/
 
/**
 * Node
 * Desc: represents a specific point on the earth's surface 
 * defined by its latitude and longitude.
 **/
var nodeSchema = new Schema({
    // longitude:  { type: Number, required: true, validate: validateLongitude },
    // latitude:   { type: Number, required: true, validate: validateLatitude },
    location: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d',     // create the geospatial index
        required: true
    },
    altitude:   { type: Number },
    accuracy:   { type: Number },
    heading:    { type: Number },
    speed:      { type: Number },
    tags:       { type: Object },
    created:    { type: Date, default: Date.now },
    updated:    { type: Date, default: Date.now },
    type:       { type: String, default: 'node' }
});

/* node data validation functions */

// altitude in metres: 0 = sea level
nodeSchema.path('altitude').validate(function(value) {
    if(value === undefined) return true;
    return (value > -10000 && value < 9000);
}, "Invalid alititude given, unless you're in space or the middle of the earth!");

// a top down angle indicating the nodes direction
nodeSchema.path('heading').validate(function(value) {
    // field is optional so allow undefined values
    if(value === undefined) return true;
    return (value >= 0 && value < 360);
}, "Invalid heading give, value should be a degrees between 0 and 360");

// a accuracy radius in metres
nodeSchema.path('accuracy').validate(function(value) {
    // field is optional so allow undefined values
    if(value === undefined) return true;
    return (value >= 0 && value <= 1000);
}, "Invalid accuracy given, please give a value between 1 and 10");

/**
 * NOTE: longitude and latitude will be validated by mongoose implicitly
 **/

// class methods

nodeSchema.statics.getAll = function(callback) {
    Node.find({}, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

nodeSchema.statics.getById = function(id, callback) {
    Node.findById(id, function(err, results) {
        if(err) throw err;
        return callback(results);
    });
}

nodeSchema.statics.query = function(query, callback) {
    Node.find(query, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

nodeSchema.statics.delete = function(id, callback) {
    Node.remove({ _id: id }, function(err, results) {
        if(err) throw err;
        callback(results);
    })
}

nodeSchema.statics.amend = function(id, update, options, callback) {
    update.updated = Date.now();
    Node.update({ _id: id }, { $set: update }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

nodeSchema.statics.countWithTag = function(tag, callback) {
    var query = { 'tags': tag }
    Node.count(query, function(err, count) {
        if(err) throw err;
        callback(count);
    });
}

nodeSchema.statics.findNear = function(lon, lat, dist, callback) {

    if(dist === undefined) dist = 100;

    // convert to radians
    dist = dist /= 6371;
    
    var coords = [];
    coords[0] = lon;
    coords[1] = lat;
    
    Node.find({
        location:
        {   
            $near: coords,
            $maxDistance: dist
        }
    }).exec(function(err, results) {
        if (err) throw err;
        callback(results);
    });
}

nodeSchema.statics.findNearWithDistance = function(lon, lat, dist, callback) {
    Node.collection.geoNear(lon, lat, {uniqueDocs:true, maxDistance: dist}, function(err, docs) {
        if(err) {console.error(err); throw err};
        callback(docs);
    });
}

nodeSchema.statics.mapReducer = function(map, reduce, callback) {
    var o = {};
    o.map = map;
    o.reduce = reduce;
    Node.mapReduce(o, function(err, results) {
        if(err) throw err;
        callback(err, results);
    });
}

nodeSchema.statics.findWhere = function(key, value, callback) {
    Node.find({})
        .where(key)
        .equals(value)
        .exec(callback);
}

nodeSchema.statics.findMax = function(property, callback) {
    Node.findOne({})
        .sort('-'+property)
        .exec(callback);
}

nodeSchema.statics.findMin = function(property, callback) {
    Node.findOne({})
        .sort(property)
        .exec(callback);
}

var Node = mongoose.model('Node', nodeSchema);

/**
 * Way
 * Desc: A way is an ordered list of nodes that define a polyline
 **/
var waySchema = new Schema({
    nodes:  [{type: ObjectId,
              ref: 'Node'}],
    ways:   [{type: ObjectId,
              ref: 'Way'}],
    tags:       { type: Object },
    created:    { type: Date, default: Date.now },
    type:       { type: String, default: 'way' }
});

waySchema.statics.getAll = function(callback) {
    Way.find({}, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.getById = function(id, callback) {
    Way.findById(id, function(err, results) {
        if(err) throw err;
        return callback(results);
    });
}

waySchema.statics.getAllContainingNode = function(nodeId, callback) {
    var query = { nodes: nodeId }
    Way.find(query, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.query = function(query, callback) {
    Way.find(query, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.delete = function(id, callback) {
    Way.remove({ _id: id }, function(err, results) {
        if(err) throw err;
        callback(results);
    })
}

waySchema.statics.amend = function(id, update, options, callback) {
    Way.update({ _id: id }, { $set: update }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.addNestedNode = function(id, nodeId, options, callback) {
    Way.update({ _id: id }, { $push : {nodes : nodeId} }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.addNestedWay = function(id, wayId, options, callback) {
    Way.update({ _id: id }, { $push : {nodes : wayId} }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.removeNestedNode = function(id, nodeId, options, callback) {
    Way.update({ _id: id }, { $pull : {nodes : nodeId} }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.removeNestedWay = function(id, wayId, options, callback) {
    Way.update({ _id: id }, { $pull : {ways : wayId} }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

waySchema.statics.countWithTag = function(tag, callback) {
    var query = { 'tags': tag }
    Way.count(query, function(err, count) {
        if(err) throw err;
        callback(count);
    });
}

waySchema.statics.mapReducer = function(map, reduce, callback) {
    var o = {};
    o.map = map;
    o.reduce = reduce;
    Way.mapReduce(o, function(err, results) {
        if(err) throw err;
        callback(err, results);
    });
}

waySchema.statics.getNestedNodes = function(id, callback) {
    Way.findOne({ _id: id })
    .populate({ path: 'nodes' })
    .exec(function(err, results) {
        if(err) throw err;
        callback(results.nodes);
    });
}

waySchema.statics.getNestedWays = function(id, callback) {
    Way.findOne({ _id: id })
    .lean()
    .populate({ path: 'ways' })
    .exec(function(err, results) {
        if(err) throw err;
        callback(results.ways);
    });
}

waySchema.statics.findWhere = function(key, value, callback) {
    Way.find({})
        .where(key)
        .equals(value)
        .exec(callback);
}

waySchema.statics.findMax = function(property, callback) {
    Way.findOne({})
        .sort('-'+property)
        .exec(callback);
}

waySchema.statics.findMin = function(property, callback) {
    Way.findOne({})
        .sort(property)
        .exec(callback);
}

var Way = mongoose.model('Way', waySchema);

/**
 * Relation
 * Desc: A relation is a multi-purpose data structure that documents 
 * a relationship between two or more data members (nodes, ways, 
 * and/or other relations)
 **/
var relationSchema = new Schema({
    members: [{
                _id:  {type: ObjectId, ref: 'members'},
                role: { type: String },
                type: { type: String }
             }],
    tags:       { type: Object },
    created:    { type: Date, default: Date.now },
    type:       { type: String, default: 'relation' }
});

relationSchema.statics.getAll = function(callback) {
    Relation.find({}, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

relationSchema.statics.getById = function(id, callback) {
    Relation.findById(id, function(err, results) {
        if(err) throw err;
        return callback(results);
    });
}

relationSchema.statics.query = function(query, callback) {
    Relation.find(query, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

relationSchema.statics.delete = function(id, callback) {
    Relation.remove({ _id: id }, function(err, results) {
        if(err) throw err;
        callback(results);
    })
}

relationSchema.statics.amend = function(id, update, options, callback) {
    Relation.update({ _id: id }, { $set: update }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

relationSchema.statics.addMember = function(id, member, options, callback) {
    Relation.update({ _id: id }, { $push : {members: member} }, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

relationSchema.statics.removeMember = function(id, memberId, options, callback) {
    Relation.update({ _id: id }, { $pull : {members: {_id: memberId }}}, options, function(err, results) {
        if(err) throw err;
        callback(results);
    });
}

relationSchema.statics.getMembers = function(id, callback) {
    Relation.find({ _id: id })
    .lean()
    .populate({ path: 'members' })
    .exec(function(err, docs) {
        if (err) throw err;
        
        var options = {
            path: 'members._id',
            model: 'Node'
        };

        Relation.populate(docs, options, function (err, results) {
            callback(results);
        });
    });
}

relationSchema.statics.findWhere = function(key, value, callback) {
    Relation.find({})
        .where(key)
        .equals(value)
        .exec(callback);
}

var Relation = mongoose.model('Relation', relationSchema);

/**
 * Define DAO methods
 * ==================
 **/

/**
 * Ctor
 **/
function Dao() {
    this.db = mongoose.connection;
}

/**
 * Connect to data storage medium
 **/
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

/**
 * Disconnect from data storage medium
 **/
Dao.prototype.disconnect = function(cb) {
    mongoose.disconnect(cb);
}

/**
 * Connection status check
 **/
Dao.prototype.isConnected = function() {
    if(this.db.readyState !== 2) {
        return false;
    } 
    return true;
}

/**
 * Clear all collections
 **/
Dao.prototype.clearData = function(callback) {
    Relation.remove({}, function() {
        Way.remove({}, function() {
            Node.remove({}, function() {
                callback();
            });
        });
    });
}

module.exports = {
    Node : Node,
    Way : Way,
    Relation: Relation,
    Dao: Dao
};