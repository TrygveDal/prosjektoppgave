/**
 * Web server entry point used in `npm start`.
 */

import app from './app';
import express from 'express';
import path from 'path';
import http from 'http';
import WikiServer from './wiki-server';

// Serve client files
app.use(express.static(path.join(__dirname, '/../../client/public')));

const webServer = http.createServer(app);
new WikiServer(webServer, '/api/v1');

const port = 3000;
webServer.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
