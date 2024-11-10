import pool from './mysql-pool';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

type Article = {
  author: string;
  title: string;
  content: string;
  edit_time: number;
  pageId: number;
};

type Version = {
  author: string;
  edit_time: number;
  versionnr: number;
  type: string;
};

class WikiService {
  getArticles() {
    return new Promise<Article[]>((resolve, reject) => {
      pool.query(
        'SELECT author, title, content, `edit_time`, Articles.pageId FROM Articles, Versions WHERE Articles.pageId = Versions.pageId AND latest = 1',
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Article[]);
        },
      );
    });
  }
  getArticle(pageId: number) {
    return new Promise<Article | undefined>((resolve, reject) => {
      pool.query(
        'SELECT author, title, content, `edit_time`, Articles.pageId FROM Articles, Versions WHERE Articles.pageId = Versions.pageId AND latest = 1 AND Articles.pageId = ?',
        [pageId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Article);
        },
      );
    });
  }

  getVersion(pageId: number, version: number) {
    return new Promise<Article | undefined>((resolve, reject) => {
      pool.query(
        'SELECT author, title, content, `edit_time`, Articles.pageId FROM Articles, Versions WHERE Articles.pageId = Versions.pageId AND Articles.pageId = ? AND versionnr = ?',
        [pageId, version],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Article);
        },
      );
    });
  }

  viewArticle(pageId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'UPDATE `Articles` SET `views` = `views`+1 WHERE `pageId` = ?',
        [pageId],
        (error, results) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  versionHistory(pageId: number) {
    return new Promise<Version[]>((resolve, reject) => {
      pool.query(
        'SELECT author, edit_time, versionnr, type FROM Versions WHERE pageId = ?',
        [pageId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Version[]);
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
            'INSERT INTO `Versions` (`author`,`content`,`edit_time`,`latest`,`pageId`,`title`,`type`,`versionnr`) VALUES (?,?,?,1,?,?,"init",1)',
            [article.author, article.content, article.edit_time, id, article.title],
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

            resolve(results[0].versionnr as number);
          },
        );
      });
      version
        .then((version) => {
          pool.query(
            'UPDATE `Versions` SET `latest`=0 WHERE `pageId` = ?',
            [article.pageId],
            (error, results: ResultSetHeader) => {
              if (error) return reject(error);
            },
          );
          pool.query(
            'INSERT INTO `Versions` (`author`,`content`,`edit_time`,`latest`,`pageId`,`title`,`type`,`versionnr`) VALUES (?,?,?,1,?,?,"edit",?);',
            [
              article.author,
              article.content,
              article.edit_time,
              article.pageId,
              article.title,
              version + 1,
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
