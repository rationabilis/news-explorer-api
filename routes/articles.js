const { celebrate, Joi } = require('celebrate');
const articleRouter = require('express').Router();
const auth = require('../middlewares/auth');
const {
  getAllArticles, createArticle, deleteArticle,
} = require('../controllers/article');

articleRouter.get('/', auth, getAllArticles);

articleRouter.post('/',
  celebrate({
    body: Joi.object().keys({
      keyword: Joi.string().required(),
      title: Joi.string().required(),
      text: Joi.string().required(),
      date: Joi.string().required(),
      source: Joi.string().required(),
      link: Joi.string().required().uri(),
      image: Joi.string().required().uri(),
    }),
  }),
  auth, createArticle);

articleRouter.delete('   ',
  celebrate({
    params: Joi.object().keys({
      articleId: Joi.string().alphanum().length(24).required(),
    }),
  }),
  auth, deleteArticle);

module.exports = articleRouter;
