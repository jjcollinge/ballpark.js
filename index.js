/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// dependencies
var ballpark = require('./ballpark');
var app = ballpark();

app.get("/", function(req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Called the root handle");
    res.end();
});

app.get("/test", function(req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"} );
    res.write("Called the test handle");
	res.end();
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