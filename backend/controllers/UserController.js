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
				`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`,
				function (err, data) {
					db.closeDB(connection);
					if(data && data.length > 0) {
						return controller.response( res, 200,
							{ 
								result: {
									jwt: jwt.sign({_id: data.id}, 'token'),
									id: data[0].id
								}
							})
					} else {
						return controller.response(res, 400, { result: `Login failed` })
					}
				}
			);
		})
		.catch((error) => {
			console.log(error)
			return controller.response(res, 500, { result: `Unable to connect to Database` })
		});
	}

	// register user function
	register(req, res) {
		const username = req.body.username;
		const password = crypto.createHash('sha256').update(String(req.body.password)).digest('base64');
		db.connectDB()
		.then((connection) => {
			connection.query(
				`INSERT INTO users(username, password, name) VALUES('${username}', '${password}', '')`,
				function (err, data) {
					if(!data) {
						return controller.response(res, 400, { result: `Register user failed` })
					}
					db.closeDB(connection);
					return controller.response(res, 200, { result: {
						id: data.insertId
					} })
				}
			);
		})
		.catch((error) => {
			return controller.response(res, 500, { result: `Unable to connect to Database` })
		});
	}
	// register user function
	verifyToken(req, res) {
		try {
			jwt.verify(req.body.token, "token")
			return controller.response(res, 200, { result: "Login successfuly"}) 

		} catch (err) {
			return controller.response(res, 400, { result: `Login failed` })
		}
	}
}

module.exports = new UserController();
