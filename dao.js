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
        index: '2d',      // create the geospatial index
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

// node data validation functions
nodeSchema.path('altitude').validate(function(value) {
    if(value === undefined) return true;
    return (value > -10000 && value < 9000);
}, "Invalid alititude given, unless you're in space or the middle of the earth!");

nodeSchema.path('heading').validate(function(value) {
    // field is optional so allow undefined values
    if(value === undefined) return true;
    return (value >= 0 && value < 360);
}, "Invalid heading give, value should be a degrees between 0 and 360");

nodeSchema.path('accuracy').validate(function(value) {
    // field is optional so allow undefined values
    if(value === undefined) return true;
    return (value > 0 && value <= 10);
}, "Invalid accuracy given, please give a value between 1 and 10");

// function validateLongitude(value) {
//     return (value > -180 && value < 180);
// }

// function validateLatitude(value) {
//     return (value > -90 && value < 90);
// }

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
    created:    { type : Date, default: Date.now },
    type:       { type: String, default: 'node' }
});

var Way = mongoose.model('Way', waySchema);


/**
 * Relation
 * Desc: A relation is a multi-purpose data structure that documents 
 * a relationship between two or more data elements (nodes, ways, 
 * and/or other relations)
 **/
var relationSchema = new Schema({
    elements: [ {
        element: { type: ObjectId, ref: 'Elements' },
        role: { type: String }
    }],
    tags:       { type: Object },
    created:    { type : Date, default: Date.now },
    type:       { type: String, default: 'node' }
});

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