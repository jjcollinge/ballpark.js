/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// Dependencies
var ballpark = require('./ballpark');
var app = ballpark();

app.configure({
    'HTTPAddress': process.env.IP,
    'HTTPPort': process.env.PORT,
    'DatabaseAddress': process.env.IP,
    'DatabasePort': '27017',
    'XMLSupport' : false,
    'JSONSupport': true
});

app.get("/", function(req, resp) {
    resp.send("called handle on path: /");
});

app.get("/test", function(req, resp) {
    resp.send("called handle on path: /test");
});

app.start(process.env.IP, process.env.PORT);