/**
 * The ballpark js is the main entry
 * point for the system. This will act as
 * a facade to expose the middleware 
 * components to the client in a controlled
 * manner.
 */
 
// dependencies
var App = require("./app");

exports = module.exports = createApplication;

function createApplication() {
    var app = new App();
    return app;
}
