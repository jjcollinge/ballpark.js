/**
 * The index represents a mocked client
 * connecting to the service. This is here
 * purely for debugging purposes.
 */
 
// Dependencies
var ballpark = require('./ballpark');
var app = ballpark();
var Dao = require("./dao");

var dao = new Dao();

dao.connect('27017', process.env.IP, function() {
    console.log("connected");
});

app.configure({
    'Address': process.env.IP,
    'Port': process.env.PORT,
    'XMLSupport' : false,
    'JSONSupport': true
});

app.get("/", function(req, resp) {
    resp.send("called handle on path: /");
});

app.get("/test", function(req, resp) {
    resp.send("called get request handle on path: /test");
});

app.post("/test", function(req, resp) {
    resp.send("called post request handle on path: /test");
})

app.start(function(url) {
    console.log("Connected to server: " + url)
});