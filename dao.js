/**
 * The DAO wraps a MongoDB database and
 * allows the rest of the application to
 * perform persistent operations on their
 * data elements
 */

// Dependencies
var mongoose = require('mongoose');

function DAO() {
    this.db = mongoose.connection;
    this.models = {};
}

DAO.prototype.connect = function(port, ip, callback) {
    
    var url = 'mongodb://' + ip +':' + port + '/test';

    var _this = this;
    
    mongoose.connect(url, function(err, res) {
        if(err) {
            console.error('Failed to connect to MongoDB database on url: ' + url + " with error: " + err);
        } else {
            
             // Define a node schema
            var nodeSchema = new mongoose.Schema({
                id: { type: Number },
                longitude: { type: Number },
                latitude: { type: Number },
                altitude: { type: Number },
                accuracy: { type: Number },
                tags: { type: Object }
            });
            
            // Define a way schema
            var waySchema = new mongoose.Schema({
                id: { type: Number},
                visible: { type: Boolean},
                tags : { type: Object }
            });
            
            // Static helper functions
            
            // Compile schemas into models
            _this.models['Node'] = mongoose.model('Node', nodeSchema);
            _this.models['Way'] = mongoose.model('Way', waySchema);
            
            callback(url);
        }
    });
}

DAO.prototype.getModel = function(model) {
    return this.models[model];
}

DAO.prototype.storeNode = function(node, callback) {
    node.save(function(err, node) {
        if(err) return console.error(err);
    });
    callback(node);
}

DAO.prototype.findNodeById = function(_id, callback) {
    var model = this.models['Node'];
    model.find({ id: _id }, function(err, matches) {
       if(err) return console.error(err);
       callback(matches);
    });
}

DAO.prototype.removeNode = function(node, callback) {
    var model = this.models['Node'];
    model.remove({ id: node.id }, function(err, matches) {
           if(err) return console.error(err);
           callback(matches);
    });
}

module.exports = DAO;