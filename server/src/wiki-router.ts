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

export default router;
