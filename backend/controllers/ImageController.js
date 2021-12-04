const path = require('path');
const gltfPipeline = require("gltf-pipeline");
const fsExtra = require("fs-extra");
const decompress = require("decompress");
const db = require('../database');
const controller = require('./controller');
var imageFilePath = ""
var imageFolderPath = ""
var dateNowTime = ""

class ImageController {
	// convert image function
	async convert(req, res) {
		try {
			const imageController = new ImageController();
			const userId = req.params.id
			const pathUserDefault = `./images/user/${userId}/`
			let fileName = ""
			let file = ""
			let filePath = ""
			imageFilePath = ""
			imageFolderPath = ""
			if (req.params.type == 'glb') {
				imageController.catchFile(req, res).then(async data => {
					await imageController.handleZipFile(data, pathUserDefault)
					fileName = data.split(".")[0]
					file = data
				}).then(async () => {
					filePath = pathUserDefault + fileName + "/"
					await imageController.fromDir(filePath, '.gltf', res);
				}).then(() => {
					const options = {
						resourceDirectory: filePath
					};
					const gltfToGlb = gltfPipeline.gltfToGlb;
					if (!imageFilePath) {
						return controller.response(res, 400, { result: `Convert failed` })
					}
					const gltf = fsExtra.readJsonSync(`./${imageFilePath}`);
					gltfToGlb(gltf, options).then(async function (results) {
						const fileNameConverted = `./${imageFilePath.replace('.gltf', '.glb')}`
						fsExtra.writeFileSync(fileNameConverted, results.glb);
						const fileGlb = fileNameConverted.replace(/\\/g,'/')
						const fileGlbSplit = fileGlb.split("/")
						const fileGlbName = fileGlbSplit[fileGlbSplit.length - 1]
						const isSavedSuccuess = await imageController.save(
							file,
							fileGlb,
							userId,
							fileGlbName,
							'glb'
						)
						imageController.resetImagesPath()
						if (isSavedSuccuess) {
							return controller.response(res, 200, { result: `Convert successfully` })
						}
					});
				})
			} else {
				imageController.catchFile(req, res, true).then(async data => {
					filePath = pathUserDefault + dateNowTime + "/"
					await imageController.fromDir(filePath, '.glb', res);
					fileName = data.split(".")[0]
					file = data
				}).then(() => {
					setTimeout(() => {
						const glbToGltf = gltfPipeline.glbToGltf;
						const glb = fsExtra.readFileSync(`./${imageFilePath}`);
						glbToGltf(glb).then(async function (results) {
							const fileNameConverted = `./${imageFilePath.replace('.glb', '.gltf')}`
							fsExtra.writeJsonSync(fileNameConverted, results.gltf);
							let fileGltf = fileNameConverted.replace(/\\/g,'/')
							const isSavedSuccuess = await imageController.save(file, fileGltf, userId, fileName + '.gltf', 'gltf')
							imageController.resetImagesPath()
							if (isSavedSuccuess) {
								return controller.response(res, 200, { result: `Convert successfully` })
							}
						});
					}, 1500);
				})
			}
		} catch (error) {
			console.log("error", error)
			return controller.response(res, 400, { result: `Convert failed` })
		}
	}
  // count images of month
  countAtMonth (req, res) {
    const userId = req.params.id
    db.connectDB()
		.then((connection) => {
			connection.query(
        `SELECT COUNT(*) as count FROM images
        WHERE user_id = ${userId} AND MONTH(DATE) = MONTH(CURRENT_TIMESTAMP) AND YEAR(DATE) = YEAR(CURRENT_TIMESTAMP)`,
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

  // get count list images
  count(req, res) {
    const userId = req.params.id
    db.connectDB()
		.then((connection) => {
			connection.query(
				`SELECT COUNT(*) as count FROM images WHERE user_id = ${userId} AND is_deleted = 0`,
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
	// get list images
	list(req, res) {
		const userId = req.params.id;
		const type = req.params.type;
		db.connectDB()
		.then((connection) => {
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
	// save image info
	save(originalUrl, newUrl, userId, name, type) {
		return new Promise ((res, rej) => {
			db.connectDB()
			.then((connection) => {
				connection.query(
					`INSERT INTO images(user_id, original_url, new_url, name, type)
					VALUES(${userId}, '${originalUrl}', '${newUrl}', '${name}', '${type}')`,
					function (err, data, fields) {
						db.closeDB(connection);
						res(true);
					}
				);
			})
			.catch((error) => {
				console.log('Db not connected successfully', error);
				res(false);
			});
		})
	}

	// catch and handle zip file
	async catchFile(req, res, isGlb = false) {
		let path = ""
		if (!req.files) {
			return controller.response(res, 500, { result: `file is not found` })
		}
		const myFile = req.files.file;
		if(isGlb) {
			const dateNow = new Date().getTime() / 1000;
			dateNowTime = dateNow
			const folder =  `./images/user/${req.params.id}/`
			const folderGlb =  `./images/user/${req.params.id}/${dateNow}`
			path = `./images/user/${req.params.id}/${dateNow}/${myFile.name}`
			if (!fsExtra.existsSync(folder)) {
				fsExtra.mkdirSync(folder)
			}
			if (!fsExtra.existsSync(folderGlb)) {
				fsExtra.mkdirSync(folderGlb)
			}
		} else {
			path = `./images/user/${req.params.id}/${myFile.name}`
			const folder =  `./images/user/${req.params.id}`
			if (!fsExtra.existsSync(folder)) {
				fsExtra.mkdirSync(folder)
			}
		}
		myFile.mv(path, function (err) {
			if (err) {
				console.log(err)
				return res.status(500).send({ msg: "Error occured" });
			}
		});
		return await Promise.resolve(myFile.name)
	}

	// Find path of file
	async fromDir(pathUserDefault, filter, res) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
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
							resolve(filename);
						}
					};
				};
				if(!imageFilePath) {
					return res.status(400).send({ msg: "Convert failed" });
				}
			}, 300);
		});
	};

	// Reset imageFilePath and imageFolderPath
	resetImagesPath() {
		imageFilePath = ""
		imageFolderPath = ""
	};

	// handle zip file
	async handleZipFile(name, pathUserDefault) {
		return new Promise(async (resolve, reject) => {
			setTimeout(async () => {
				await decompress(`${pathUserDefault}/${name}`, `${pathUserDefault}/${name.split(".")[0]}`);
				resolve(true)
			}, 1500)
		})
	};
}

module.exports = new ImageController();
