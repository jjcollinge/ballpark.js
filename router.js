/**
 * The Router is responsible for passing
 * the query parameters and the response
 * to the relevant handler function for
 * the given request
 */

exports.route = function(handle, req, resp) {

	if(typeof handle === "function") {
		return handle(req, resp);
	} else {
		resp.statusCode(404).send({ status_code : 404, description : 'A handle for request is not available'});
	}
}