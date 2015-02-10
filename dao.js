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
var nodeSchema = new mongoose.Schema({
    id:         { type: ObjectId, required: true},
    longitude:  { type: Number, required: true },
    latitude:   { type: Number, required: true },
    altitude:   { type: Number },
    accuracy:   { type: Number },
    tags:       { type: Object }
});

mongoose.model('Node', nodeSchema);
var Node = mongoose.model('Node', nodeSchema);

// Define a way schema
var waySchema = new mongoose.Schema({
    id:     { type: ObjectId, required: true },
    nodes:  { type: Object, required: true },
    ways:   { type: Object },
    tags :  { type: Object }
});

mongoose.model('Way', nodeSchema);
var Way = mongoose.model('Way', nodeSchema);

function Dao() {
    this.db = mongoose.connection;
}

Dao.prototype.connect = function(port, ip) {
    
    var url = 'mongodb://' + ip +':' + port + '/test';
    
    if(this.db.readyState !== 0) {
        return this;
    }
    
    mongoose.connect(url, function(err, res) {
        if(err) {
            console.error('Failed to connect to MongoDB database on url: ' + url + " with error: " + err);
        } else {
            console.log("connected to database: " + url);
        }
    });
}

Dao.prototype.disconnect = function() {
    mongoose.connection.db.executeDbCommand({
		dropDatabase: 1
	}, function(err, result) {
		console.error(err);
		console.log(result);
        console.log("disconnected from database");
		process.exit(0);
	});
}

// ===============Node CRUD methods===================== //

Dao.prototype.addNode = function(node, cb) {
    var _node = new Node({
       id: mongoose.Types.ObjectId(),
       longitude: node.lon,
       latitude: node.lat,
       altitude: node.alt,
       accuracy: node.acc,
       tags: node.tags
    });
    _node.save(function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Created: " + data);
            cb(data);
        }
    });
}

Dao.prototype.deleteNode = function(_id, cb) {
    Node.remove({ id: _id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Deleted: " + data);
            data.remove();
            cb(data);
        }
    });
}

Dao.prototype.updateNode = function(_id, update, cb) {
    var opts;
    Node.update({ id: _id }, update, opts, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Updated: " + data);
            cb(data);
        }
    });
}

Dao.prototype.findNode = function(_id, cb) {
    Node.find({ id: _id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Found: " + data);
            cb(data);
        }
    });
}

// ===============Way CRUD methods===================== //

Dao.prototype.addWay = function(way, cb) {
    var way = new Way({
       id: mongoose.Types.ObjectId(),
       nodes: way.nodes,
       ways: way.ways,
       tags: way.tags
    });
    way.save(function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Saved: " + data);
            cb(data);
        }
    });
}

Dao.prototype.deleteWay = function(_id, cb) {
    Way.remove({ id: _id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Deleted: " + data);
            data.remove();
            cb(data);
        }
    });
}

Dao.prototype.updateWay = function(_id, update, cb) {
    var opts;
    Way.update({ id: _id }, update, opts, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Updated: " + data);
            cb(data);
        }
    });
}

Dao.prototype.findWay = function(_id, cb) {
    Way.find({ id: _id }, function(err, data) {
        if(err) return console.error(err);
        else {
            console.log("Found: " + data);
            cb(data);
        }
    });
}

module.exports = Dao;