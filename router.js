/**
 * router.js
 * ----------------------------
 * Responsile for invoking
 * the handle or returning an
 * error message.
 */

exports.route = function(handle, req, resp) {

	/**
	 * Currently only supports function type handles
	 **/
	if(typeof handle === "function") {
		return handle(req, resp);
	} else {
		// handle doesn't exist or is not supported so respond with a 404
		resp.statusCode(404).send({ status_code : 404, description : 'A handle for request is not available'});
	}
}