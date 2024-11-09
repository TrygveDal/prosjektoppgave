# Wiki

## Setup database connections

`server/config.ts`:

```ts
process.env.MYSQL_HOST = 'mysql.stud.ntnu.no';
process.env.MYSQL_USER = 'username_todo';
process.env.MYSQL_PASSWORD = 'username_todo';
process.env.MYSQL_DATABASE = 'username_todo_dev';
```

`server/test/config.ts`:

```ts
process.env.MYSQL_HOST = 'mysql.stud.ntnu.no';
process.env.MYSQL_USER = 'username_todo';
process.env.MYSQL_PASSWORD = 'username_todo';
process.env.MYSQL_DATABASE = 'username_todo_test';
```

edit er returverdi av Date.now(), altså millisekunder etter 1. januar 1970

```sql
CREATE TABLE `Versions` (
  `pageId` INT NOT NULL ,
  `content` TEXT ,
  `title` TEXT NOT NULL ,
  `type` TEXT NOT NULL,
  `versionnr` INT NOT NULL ,
  `author` TEXT NOT NULL,
  `edit_time` BIGINT NOT NULL,
  `latest` BOOL NOT NULL
);

CREATE TABLE `Articles` (
  `pageId` INT NOT NULL AUTO_INCREMENT ,
  `views` INT NOT NULL ,
  PRIMARY KEY (`pageId`)
);
```

## Start server

Install dependencies and start server:

```sh
cd server
npm install
npm start
```

### Run server tests:

```sh
npm test
```

Compared to the previous example project, the only additional dependency is
[ws](https://www.npmjs.com/package/ws).

## Bundle client files to be served through server

Install dependencies and bundle client files:

```sh
cd client
npm install
npm start
```
