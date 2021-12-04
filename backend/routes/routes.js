const userController = require('../controllers/UserController');
const ImageController = require('../controllers/ImageController');
const router = app => {
  //route users
  app.post('/login', userController.login);
  app.post('/register', userController.register);
  app.post('/verify/token', userController.verifyToken);

  //route images
  app.get('/images/:id/:type', ImageController.list);
  app.get('/count/:id', ImageController.count);
  app.get('/countAtMonth/:id', ImageController.countAtMonth);
  app.post('/images/:id/convert/:type', ImageController.convert);
  app.post('/images/delete/:id', ImageController.delete);
}

module.exports = router;
