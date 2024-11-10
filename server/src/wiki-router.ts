import express from 'express';
import wikiService from './wiki-service';

/**
 * Express router containing wiki methods.
 */
const router = express.Router();

router.get('/articles', (_request, response) => {
  wikiService
    .getArticles()
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});
router.get('/articles/:pageId', (request, response) => {
  const pageId = Number(request.params.pageId);
  wikiService
    .getArticle(pageId)
    .then((article) => response.send(article))
    .catch((error) => response.status(500).send(error));
});

router.post('/articles', (request, response) => {
  const data = request.body;
  if (data.article && data.article.title && data.article.content && data.article.author)
    if (data.article.pageId && data.article.pageId != 0) {
      wikiService
        .editArticle(data.article)
        .then((id) => response.send({ id: id }))
        .catch((error) => response.status(500).send(error));
    } else {
      wikiService
        .createArticle(data.article)
        .then((id) => response.send({ id: id }))
        .catch((error) => response.status(500).send(error));
    }
  else response.status(400).send('Missing data');
});

export default router;
