const logoutRouter = require('express').Router();
const { logout } = require('../controllers/user');

logoutRouter.post('/', logout);

module.exports = logoutRouter;
