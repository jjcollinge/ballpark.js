/**
 * The Router is responsible for passing
 * the query parameters and the response
 * to the relevant handler function for
 * the given request
 */

exports.route = function(handle, query, res) {

	if(typeof handle === "function") {
		return handle(query, res);
	} else {
		res.writeHead(200, {"Content-Type": "application/json"} );
        res.write(JSON.stringify({ error_code : 404, description : 'A handle for request is not available'}));
    	res.end();
	}
}