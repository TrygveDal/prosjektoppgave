import express, { response } from 'express';
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
router.get('/articles/search/:query', (request, response) => {
  const query = request.params.query;
  wikiService
    .searchArticles(query)
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});
router.get('/search/titles/:query', (request, response) => {
  const query = request.params.query;
  wikiService
    .searchTitles(query)
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});
router.get('/articles/:article_id', (request, response) => {
  const article_id = Number(request.params.article_id);
  wikiService
    .getArticle(article_id)
    .then((article) => response.send(article))
    .catch((error) => response.status(500).send(error));
});
router.get('/articles/:article_id/version/:version_number', (request, response) => {
  const article_id = Number(request.params.article_id);
  const version_number = Number(request.params.version_number);
  wikiService
    .getVersion(article_id, version_number)
    .then((article) => response.send(article))
    .catch((error) => response.status(500).send(error));
});
router.get('/articles/:article_id/versionhistory', (request, response) => {
  const article_id = Number(request.params.article_id);
  wikiService
    .versionHistory(article_id)
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.get('/articles/:article_id/views', (request, response) => {
  const article_id = Number(request.params.article_id);
  wikiService
    .getViews(article_id)
    .then((views) => response.send({ views: views }))
    .catch((error) => response.status(500).send(error));
});

router.post('/articles/:article_id/viewed', (request, response) => {
  const article_id = Number(request.params.article_id);
  wikiService
    .viewArticle(article_id)
    .then(() => response.send())
    .catch((error) => response.status(500).send(error));
});

router.post('/articles', (request, response) => {
  const data = request.body;
  if (data.article && data.article.title && data.article.content && data.article.author)
    if (data.article.article_id && data.article.article_id != 0) {
      wikiService
        .editArticle(data.article)
        .then((article_id) => response.send({ article_id: article_id }))
        .catch((error) => response.status(500).send(error));
    } else {
      wikiService
        .createArticle(data.article)
        .then((article_id) => response.send({ article_id: article_id }))
        .catch((error) => response.status(500).send(error));
    }
  else response.status(400).send('Missing data');
});

router.post('/articles/:article_id/comments/new', (request, response) => {
  const data = request.body;
  if (data.comment && data.comment.content && data.comment.user && data.comment.article_id)
    if (data.comment.article_id != 0) {
      wikiService
        .addComment(data.comment)
        .then((id) => response.send({ comment_id: id }))
        .catch((error) => response.status(500).send(error));
    }
});

router.get('/articles/:article_id/comments', (request, response) => {
  const article_id = Number(request.params.article_id);
  wikiService
    .getComments(article_id)
    .then((rows) => {
      response.send(rows);
    })
    .catch((error) => response.status(500).send(error));
});
router.delete('/articles/:article_id/comments/:comment_id', (request, response) => {
  const comment_id = Number(request.params.comment_id);
  wikiService.deleteComment(comment_id).then((message) => response.send(message));
});
router.put('/articles/:article_id/comments/:comment_id', (request, response) => {
  const data = request.body;
  console.log(data);
  if (data.comment.content) wikiService.editComment(data.comment);
  console.log('from router');
});

router.delete('/articles/delete/:article_id', (request, response) => {
  const article_id = Number(request.params.article_id);
  wikiService
    .deleteArticle(article_id)
    .then((message) => response.send(message))
    .catch((error) => response.status(500).send(error));
});

// Tags
router.get('/tags', (_request, response) => {
  wikiService
    .getTags()
    .then((tags) => response.send(tags))
    .catch((error) => response.status(500).send(error));
});

router.get('/tags/:tag_id/count', (request, response) => {
  const tag_id = Number(request.params.tag_id);

  wikiService
    .getTagCount(tag_id)
    .then((count) => response.send({ tag_count: count }))
    .catch((error) => response.status(500).send(error));
});

router.get('/tags/search/:query', (request, response) => {
  const tag_idList = request.params.query;
  if (JSON.parse(tag_idList).length != 0) {
    wikiService
      .searchTag(tag_idList)
      .then((data) => response.send(data))
      .catch((error) => response.status(500).send(error));
  } else response.status(400).send('No tag selected');
});

router.post('/articles/tags', (request, response) => {
  const data = request.body;
  if (
    data.article_tags.article_id &&
    data.article_tags.tag_ids &&
    data.article_tags.article_id != 0 &&
    data.article_tags.tag_ids.length != 0
  ) {
    wikiService
      .addArticleTag(data.article_tags.article_id, data.article_tags.tag_ids)
      .then(() => response.send())
      .catch((error) => response.status(500).send(error.message));
  } else response.status(400).send('Missing data');
});

export default router;
