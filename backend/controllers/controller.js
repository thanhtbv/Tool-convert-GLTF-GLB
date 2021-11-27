class Controller {
	response(res, status, data) {
		res.status(status).json(data);
	} 
}

module.exports = new Controller();
