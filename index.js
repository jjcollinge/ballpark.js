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

app.start(process.env.PORT);