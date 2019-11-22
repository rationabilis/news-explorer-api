const { NODE_ENV, JWT_SECRET, DEV_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const { badRequestMessage, notFoundMessage } = require('../messages');

/* Возвращает информацию о пользователе (email и имя) */
const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(notFoundMessage);
      } else res.send({ user: user.name, email: user.email });
    })
    .catch(next);
};

/* Создаёт пользователя */
const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      if (!user) { throw new BadRequestError(badRequestMessage); }
      return res.send({ user: user.name, email: user.email });
    })
    .catch(next);
};

/* Аутентификация пользователя */
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : DEV_SECRET, { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .end();
    })
    .catch(next);
};

module.exports = { getUser, createUser, login };
