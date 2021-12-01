const path = require('path');
const gltfPipeline = require("gltf-pipeline");
const fsExtra = require("fs-extra");
const decompress = require("decompress");
const db = require('../database');
const controller = require('./controller');

var imageFilePath = ""
var imageFolderPath = ""

class ImageController {
	// get list images
	list(req, res) {
		const userId = req.params.id;
		const type = req.params.type;
		db.connectDB()
		.then((connection) => {
			console.log(`SELECT * FROM images WHERE user_id = ${userId} AND type = '${type}' AND is_deleted = 0`)
			connection.query(
				`SELECT * FROM images WHERE user_id = ${userId} AND type = '${type}' AND is_deleted = 0`,
				function (err, data) {
					db.closeDB(connection);
					return controller.response( res, 200, { result: data })
				}
			);
		})
		.catch((error) => {
			return controller.response(res, 500, { result: `Unable to connect to Database` })
		});
	}
	// delete image by id
	delete(req, res) {
		const imageId = req.params.id;
		db.connectDB()
		.then((connection) => {
			connection.query(
				`UPDATE images SET is_deleted = 1 WHERE id = ${imageId}`,
				function (err, data) {
					db.closeDB(connection);
					return controller.response( res, 200, { result: 'Delete image successfully'  })
				}
			);
		})
		.catch((error) => {
			return controller.response(res, 500, { result: `Unable to connect to Database` })
		});
	}
	// convert image function
	async convert(req, res) {
		try {
			const imageController = new ImageController();
			const userId = req.params.id
			const pathUserDefault = `./images/user/${userId}/`
			if (req.params.type == 'glb') {
				imageController.catchFile(req, res, pathUserDefault).then(async data => {
					await imageController.handleZipFile(data, pathUserDefault)
				}).then(async () => {
					await imageController.fromDir(pathUserDefault, '.gltf');
				}).then(() => {
					const options = {
						resourceDirectory: imageFolderPath ? `./${imageFolderPath}/` : pathUserDefault
					};
					const gltfToGlb = gltfPipeline.gltfToGlb;
					const gltf = fsExtra.readJsonSync(`./${imageFilePath}`);
					gltfToGlb(gltf, options).then(function (results) {
						const fileNameConverted = `./${imageFilePath.replace('.gltf', '.glb')}`
						fsExtra.writeFileSync(fileNameConverted, results.glb);
						imageController.save(imageFilePath, fileNameConverted, userId, 'glb')
						imageController.resetImagesPath()
						return controller.response(res, 200, { result: `Convert successfully` })
					});
				})
			} else {
				// imageController.catchFile(req, res, pathUserDefault).then(async data => {
				// 	await imageController.fromDir(pathUserDefault, '.glb');
				// }).then(async fromDirData => {
				// 	const options = {
				// 		resourceDirectory: imageFolderPath ? `./${imageFolderPath}/` : pathUserDefault
				// 	};
				// 	console.log(imageFilePath)
				// 	const glbToGltf = gltfPipeline.glbToGltf;
				// 	const glb = fsExtra.readFileSync(`./${imageFilePath}`);
				// 	glbToGltf(glb, options).then(function (results) {
				// 		const fileNameConverted = `./${imageFilePath.replace('.glb', '.gltf')}`
				// 		fsExtra.writeJsonSync(fileNameConverted, results.gltf);
				// 		imageController.save(imageFilePath, fileNameConverted, userId, 'gltf')
				// 		imageController.resetImagesPath()
				// 		return controller.response(res, 200, { result: `Convert successfully` })
				// 	});

				// })
			}
		} catch (error) {
			console.log("error", error)
			return controller.response(res, 400, { result: `Convert failed` })
		}
	}

	// save image info
	save(originalUrl, newUrl, userId, type) {
		db.connectDB()
		.then((connection) => {
			connection.query(
				`INSERT INTO images(user_id, original_url, new_url, type)
				VALUES(${userId}, '${originalUrl}', '${newUrl}', '${type}')`,
				function (err, data, fields) {
					db.closeDB(connection);
					return;
				}
			);
		})
		.catch((error) => {
			console.log('Db not connected successfully', error);
			return;
		});
	}

	// catch zip file
	async catchFile(req, res) {
		if (!req.files) {
			return res.status(500).send({ msg: "file is not found" })
		}
		const myFile = req.files.file;
		const path = `./images/user/${req.params.id}/${myFile.name}`
		const folder =  `./images/user/${req.params.id}`
		if (!fsExtra.existsSync(folder)) {
			fsExtra.mkdirSync(folder)
		}

		myFile.mv(path, function (err) {
			if (err) {
				console.log(err)
				return res.status(500).send({ msg: "Error occured" });
			}
		});
		console.log("1111")
		return await Promise.resolve(myFile.name)
	}

	// Find path of file
	async fromDir(pathUserDefault, filter) {
		console.log("2222")
		if (!fsExtra.existsSync(pathUserDefault)) {
			return;
		}

		var files = fsExtra.readdirSync(pathUserDefault);
		for (var i = 0; i < files.length; i++) {
			var filename = path.join(pathUserDefault, files[i]);
			var stat = fsExtra.lstatSync(filename);
			if (stat.isDirectory()) {
				if (!imageFolderPath) {
					imageFolderPath = filename;
				}
				new ImageController().fromDir(filename, filter);
			}
			else if (filename.indexOf(filter) >= 0) {
				if (!imageFilePath) {
					imageFilePath = filename;
					return imageFilePath;
				}
			};
		};
		return await Promise.resolve(true)
	};

	// Reset imageFilePath and imageFolderPath
	resetImagesPath() {
		imageFilePath = ""
		imageFolderPath = ""
	};

	// handle zip file
	async handleZipFile(name, pathUserDefault) {
		console.log("1,555")
		await decompress(`${pathUserDefault}/${name}`, `${pathUserDefault}/${name.split(".")[0]}`);
		return await Promise.resolve(true);
	};
}

module.exports = new ImageController();
