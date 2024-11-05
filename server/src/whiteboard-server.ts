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
        if (String(message) == 'viewing articlelist') {
          /*
          const res = new Promise<Article[]>((resolve, reject) => {
            // returnerer nyeste versjon av hver artikkel
            pool.query(
              'SELECT author, title, content, `edit`, Articles.pageId FROM Articles, Versions WHERE Articles.pageId = Versions.pageId AND latest = 1',
              (error, results: RowDataPacket[]) => {
                if (error) return reject(error);
                for (let i = 0; i < results.length; i++) {
                  results[i][3] = results[i][3].toDateString;
                }
                resolve(results as Article[]);
              },
            );
          });
          */
          const promise = new Promise<Article[]>((resolve, reject) => {
            // returnerer nyeste versjon av hver artikkel
            pool.query(
              'SELECT author, title, content, `edit`, Articles.pageId FROM Articles, Versions WHERE Articles.pageId = Versions.pageId AND latest = 1',
              (error, results: RowDataPacket[]) => {
                if (error) return reject(error);
                /*
            for (let i = 0; i < results.length; i++) {
              results[i][3] = results[i][3].toDateString;
            }
              */
                resolve(results as Article[]);
              },
            );
          });
          promise.then((res) => {
            connection.send(res);
          });
        } else {
          // Send the message to all current client connections
          server.clients.forEach((connection) => connection.send(message.toString()));
        }
      });
    });
  }
}
