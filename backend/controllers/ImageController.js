const db = require('../database');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const controller = require('./controller');

class UserController {

	// login function
	login(req, res) {
		const username = req.body.username;
		const password = crypto.createHash('sha256').update(String(req.body.password)).digest('base64');
		db.connectDB()
			.then((connection) => {
				connection.query(
					`SELECT * FROM users WHERE username = ${username} AND password = '${password}'`,
					function (err, data, fields) {
						db.closeDB(connection);
						if(data.length > 0) {
							return controller.response(res, 200, jwt.sign({
								_id: data.id
							}, 'token'))
						} else {
							return controller.response(res, 400, { result: `Login failed` })
						}
					}
				);
			})
			.catch((error) => {
				console.log('Db not connected successfully', error);
				return controller.response(res, 400, { result: `Unable to connect to Database` })
			});
	}

	// register user function
	register(req, res) {
		const username = req.body.username;
		const password = crypto.createHash('sha256').update(String(req.body.password)).digest('base64');
		db.connectDB()
			.then((connection) => {
				connection.query(
					`INSERT INTO users(username, password, name
						 VALUES('${username}', '${password}', '')`,
					function (err, data, fields) {
						db.closeDB(connection);
						return controller.response(res, 200, { result: `Save successfully` })
					}
				);
			})
			.catch((error) => {
				console.log('Db not connected successfully', error);
				return res
					.status(200)
					.json({ result: `Unable to connect to Database` });
			});
	}
}

module.exports = new UserController();
