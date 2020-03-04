require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const articlesRouter = require('./routes/articles');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const createUserRouter = require('./routes/create-user');
const NotFoundError = require('./errors/not-found-error');
const { notFoundMessage, serverErrorMessage } = require('./messages');
const { MONGODEV } = require('./config');
const { RATELIMWIN, RATELIMMAX } = require('./constants');

/* const allowedCors = [
  'https://inscientia.ru',
  'http://inscientia.ru',
  'http://localhost:8080',
  'https://rationabilis.github.io',
]; */
const limiter = rateLimit({
  windowMs: RATELIMWIN,
  max: RATELIMMAX,
});
const { PORT = 3000, MONGODB = MONGODEV } = process.env;
const app = express();
/* app.use(cors()); */
/* app.use(cors(({
  credentials: true,
  origin: true,
}))); */
/* app.use((req, res, next) => {
  const { origin } = req.headers; */

/* res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); */
/* res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE'); */
/*   if (allowedCors.includes(origin)) {
    res.removeHeader('Access-Control-Allow-Origin');
    res.header('Access-Control-Allow-Origin', origin);
  }

  next();
}); */

app.use(cors({
  origin: [
    'https://inscientia.ru',
    'http://inscientia.ru',
    'http://localhost:8080',
    'https://rationabilis.github.io'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  preflightContinue: false,
}));

app.use(limiter);
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

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

app.use(auth);

app.use('/users', usersRouter);
app.use('/articles', articlesRouter);


app.use('/*', () => {
  throw new NotFoundError(notFoundMessage);
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? serverErrorMessage : message,
    });
  next();
});

app.listen(PORT);
