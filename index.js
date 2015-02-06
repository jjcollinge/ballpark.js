/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// dependencies
var ballpark = require('./ballpark');
var app = ballpark();

app.configure({
    'XMLSupport': true,
    'JSONSupport': true
});

app.get("/", function(req, resp) {
    resp.send("called handle on path: /");
});

app.get("/test", function(req, resp) {
    resp.send("called handle on path: /test");
});

app.connectToDatabase(process.env.IP, function() {
    var node = app.createNode(0, 54.3123, -3.1235, 233, 0);
    app.storeNode(node, function(result) {
        console.log('Stored');
        console.dir(result);
    });
    app.removeNode(node, function(result) {
        console.log('Removed');
        console.dir(result);
    });
    app.findNodeById(node.id, function(result) {
        console.log('Found')
        console.dir(result);
    });
});

app.start(process.env.PORT);