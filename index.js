/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// dependencies
var ballpark = require('./ballpark');
var app = ballpark();

var handle = {
    "/" : function(query, resp) {
        resp.writeHead(200, {"Content-Type": "text/plain"} );
        resp.write("Called the handle");
    	resp.end();
    }
}

app.start(process.env.PORT, handle);