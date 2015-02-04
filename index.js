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

app.start(process.env.PORT);