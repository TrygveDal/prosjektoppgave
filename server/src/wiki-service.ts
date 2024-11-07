import pool from './mysql-pool';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

type Article = {
  author: string;
  title: string;
  content: string;
  edit: number;
  pageId: number;
};

class WikiService {
  getArticles() {
    return new Promise<Article[]>((resolve, reject) => {
      pool.query(
        'SELECT author, title, content, `edit`, Articles.pageId FROM Articles, Versions WHERE Articles.pageId = Versions.pageId AND latest = 1',
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Article[]);
        },
      );
    });
  }
  createArticle(article: Article) {
    return new Promise<number>((resolve, reject) => {
      const articleId = new Promise<number>((resolve, reject) => {
        pool.query(
          'INSERT INTO `Articles`(`views`) VALUES (0)',
          (error, results: ResultSetHeader) => {
            if (error) return reject(error);

            resolve(results.insertId);
          },
        );
      });
      articleId
        .then((id) => {
          pool.query(
            'INSERT INTO `Versions` (`author`,`content`,`edit`,`latest`,`pageId`,`title`,`type`,`versionnr`) VALUES (?,?,?,1,?,?,"init",1)',
            [article.author, article.content, article.edit, id, article.title],
            (error, results: ResultSetHeader) => {
              if (error) return reject(error);

              resolve(id);
            },
          );
        })
        .catch((error) => reject(error));
    });
  }
  editArticle(article: Article) {
    return new Promise<number>((resolve, reject) => {
      const version = new Promise<number>((resolve, reject) => {
        pool.query(
          'SELECT `versionnr` FROM `Versions` WHERE `latest` = 1 AND pageId = ?',
          [article.pageId],
          (error, results: RowDataPacket[]) => {
            if (error) return reject(error);

            resolve((results[0].versionnr + 1) as number);
          },
        );
      });
      version
        .then((version) => {
          pool.query(
            'UPDATE `Versions` SET `latest`=0 WHERE `pageId` = ?;INSERT INTO `Versions` (`author`,`content`,`edit`,`latest`,`pageId`,`title`,`type`,`versionnr`) VALUES (?,?,?,1,?,?,"edit",?)',
            [
              article.pageId,
              article.author,
              article.content,
              article.edit,
              article.pageId,
              article.title,
              version,
            ],
            (error, results: ResultSetHeader) => {
              if (error) return reject(error);

              resolve(article.pageId);
            },
          );
        })
        .catch((error) => reject(error));
    });
  }
}

const wikiService = new WikiService();
export default wikiService;
