import express from 'express';
import wikiRouter from './wiki-router';

/**
 * Express application.
 */
const app = express();

app.use(express.json());
app.use('/api/v1', wikiRouter);

export default app;
