import type http from 'http';
import type https from 'https';
import WebSocket from 'ws';
import pool from './mysql-pool';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

type Article = {
  author: string;
  title: string;
  content: string;
  edit_date: number;
  pageId: number;
};

/**
 * Whiteboard server
 */
export default class WhiteboardServer {
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
