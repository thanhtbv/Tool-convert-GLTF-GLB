require('dotenv').config();
const mysql = require('mysql');
module.exports.connectDB = () => {
	return new Promise((resolve, reject) => {
		const con = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			port: process.env.DB_PORT,
		});
		con.connect((err) => {
			if (err) {
				reject(err);
			}
			resolve(con);
		});
	});
};
module.exports.closeDB = (con) => {
	con.destroy();
};
