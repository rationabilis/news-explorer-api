const Article = require('../models/article');
const ForbiddenError = require('../errors/forbidden-error');
const { forbiddenMessage } = require('../messages');

/* Возвращает все сохранённые пользователем статьи */
const getAllArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .then((articles) => res.send({ data: articles }))
    .catch(next);
};

/* Создаёт статью с переданными в теле keyword, title, text, date, source, link и image */
const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((article) => res.send({ data: article }))
    .catch(next);
};

/* Удаляет сохранённую статью  по _id */
const deleteArticle = (req, res, next) => {
  Article.findById(req.params.articleId).select('+owner')
    .then((article) => {
      const articleData = { data: article };
      if (JSON.stringify(articleData.data.owner) !== JSON.stringify(req.user._id)) {
        throw new ForbiddenError(forbiddenMessage);
      } else {
        Article.findByIdAndRemove(req.params.articleId)
          .then(() => res.send(articleData))
          .catch(next);
      }
    })
    .catch(next);
};

module.exports = { getAllArticles, createArticle, deleteArticle };
