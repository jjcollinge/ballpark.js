exports.route = function(handle, pathname, query, resp) {

	var handler = handle[pathname];
	
	if(typeof handler === "function") {
		return handler(query, resp);
	} else {
		resp.writeHead(200, {"Content-Type": "application/json"} );
        resp.write(JSON.stringify({ error_code : 404, description : 'A handle for request is not available'}));
    	resp.end();
	}
}