const userController = require('../controllers/UserController');
const router = app => {
    //route users
    app.post('/login', userController.login);
    app.post('/register', userController.register);

    //route images
    app.get('/images/:id', userController.login);
}

module.exports = router;