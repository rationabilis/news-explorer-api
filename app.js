require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const articlesRouter = require('./routes/articles');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const createUserRouter = require('./routes/create-user');
const NotFoundError = require('./errors/not-found-error');
const { notFoundMessage, serverErrorMessage } = require('./messages');


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
const { PORT, MONGODB } = process.env;
const app = express();
app.use(helmet());
app.use(limiter);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(MONGODB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});


app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.use('/signup', createUserRouter);
app.use('/signin', loginRouter);

app.use('/users', usersRouter);
app.use('/articles', articlesRouter);


app.use('/*', () => {
  throw new NotFoundError(notFoundMessage);
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? serverErrorMessage : message,
    });
});

app.listen(PORT);
