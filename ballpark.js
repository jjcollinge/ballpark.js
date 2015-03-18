/**
 * ballpark.js
 * ----------------------------
 * Main entry point for the framework.
 * Packages singletons and model into
 * a single export for use by the 
 * developer
 */
 
// Dependencies
var app = require("./app");
var dao = require("./dao");

exports = module.exports = createApplication;

function createApplication() {
    return {
        app: app.getInstance(),
        Node: dao.Node,
        Way: dao.Way,
        Relation: dao.Relation
    };
}