/* eslint-disable func-names */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const UnauthorizedError = require('../errors/unauthorized-error');
const { unauthorizedMessage } = require('../messages');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Не соответствует формату электронной почты',
    },
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: [2, 'От 2 до 30 символов'],
    maxlength: [30, 'От 2 до 30 символов'],
    required: true,
  },
});

userSchema.statics.findUserByCredentials = function (email, password, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError(unauthorizedMessage));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError(unauthorizedMessage));
          }

          return user;
        });
    })
    .catch(next);
};

module.exports = mongoose.model('user', userSchema);
