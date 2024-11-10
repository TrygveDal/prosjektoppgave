import type http from 'http';
import type https from 'https';
import WebSocket from 'ws';

type Article = {
  article_id: number;
  title: string;
  content: string;
  author: string;
  edit_time: number;
  version_number: number;
};

/**
 * Wiki server
 */
export default class WikiServer {
  /**
   * Constructs a WebSocket server that will respond to the given path on webServer.
   */
  constructor(webServer: http.Server | https.Server, path: string) {
    const server = new WebSocket.Server({ server: webServer, path: path + '/wiki' });

    server.on('connection', (connection, _request) => {
      connection.on('message', async (message) => {
        server.clients.forEach((connection) => connection.send(message.toString()));
      });
    });
  }
}
