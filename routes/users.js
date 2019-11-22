const usersRouter = require('express').Router();
const auth = require('../middlewares/auth');
const { getUser } = require('../controllers/user');

usersRouter.get('/me', auth, getUser);

module.exports = usersRouter;
