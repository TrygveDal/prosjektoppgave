# Wiki

<!-- ABOUT THE PROJECT -->

## About The Project

This project is a wiki website that allows users to create, edit content directly in their browser.
The platform is designed to be feature-rich, enabling efficient management and navigation of
information. Key features include:

Page Management: Create, edit, and delete pages. Versioning: Automatically store and access version
history for pages. User Tracking: Record who made changes and when, by requiring a username. Content
Navigation: Easily link between pages and navigate the wiki. Search Functionality: Quickly search
for specific content. Tags: Add one or more tags to pages and view all unique tags with associated
page counts. Statistics: Display page statistics, including view counts and version history.
Comments: Enable users to add, edit, and delete comments on pages.

### Built With

- [![React][React.js]][React-url]
- [![Bootstrap][Bootstrap.com]][Bootstrap-url]
- [![Node.js][nodejs.org]][Node.js-url]
- [![MySQL][mysql.com]][MySQL-url]

## Getting Started

Create tables.

```sql
CREATE TABLE `Versions` (
  `article_id` INT NOT NULL ,
  `title` TEXT NOT NULL,
  `content` TEXT NOT NULL ,
  `author` TEXT NOT NULL,
  `version_type` TEXT NOT NULL ,
  `version_number` INT NOT NULL DEFAULT '1',
  `edit_time` BIGINT NOT NULL,
  `is_newest_version` BOOL NOT NULL
);

CREATE TABLE `Articles` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `views` INT NOT NULL ,
  PRIMARY KEY (`id`)
);

CREATE TABLE `Tags` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `tag` TEXT NOT NULL ,
  PRIMARY KEY (`id`)
  );

CREATE TABLE `Comments` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `article_id` INT NOT NULL ,
  `user` TEXT NOT NULL ,
  `content` TEXT NOT NULL,
  PRIMARY KEY (`comment_id`)
  );

CREATE TABLE `Articles_Tags` (
  `tag_id` INT NOT NULL ,
  `article_id` INT NOT NULL
  );
```

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

## Start server

Install dependencies and start server by using Terminal:

```sh
cd server
npm install
npm start
```

### Run server tests:

```sh
npm test
```

## Bundle client files to be served through server

Install dependencies and bundle client files:

```sh
cd client
npm install
npm start
```

<!-- CONTACT -->

## Authors

- Trygve Dalen: trygvda@stud.ntnu.no
- Mohammad Ali Aldakak: mohaaal@stud.ntnu.no
- Isak Kemi Kynsveen: isakkk@stud.ntnu.no
- Abdusemi Enver: abduseme@stud.ntnu.no

Project Link: https://github.com/TrygveDal/prosjektoppgave

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Resources we would like to give credit to.

- [w3schools](https://www.w3schools.com/js/default.asp)
-
-
