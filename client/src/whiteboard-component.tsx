import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Button, Form } from './widgets';
import { NavLink } from 'react-router-dom';
import wikiService from './wiki-service';
import { createHashHistory } from 'history';

const history = createHashHistory(); // Use history.push(...) to programmatically change path, for instance after successfully saving a student

type Article = {
  author: string;
  title: string;
  content: string;
  edit_time: number;
  pageId: number;
  version: number;
};

export class ArticleList extends Component {
  articles: Article[] = [];

  render() {
    return (
      <>
        <Card title="Articles">
          <Row>
            <Column>Article</Column>
            <Column>Last edited by</Column>
            <Column>Last edit at</Column>
          </Row>
          {this.articles.map((article) => (
            <Row key={article.pageId}>
              <Column>{article.title}</Column>
              <Column>{article.author}</Column>
              <Column>{new Date(article.edit_time).toUTCString()}</Column>
            </Row>
          ))}
        </Card>
      </>
    );
  }

  mounted() {
    wikiService
      .getArticles()
      .then((articles) => {
        this.articles = articles;
      })
      .catch((error) => Alert.danger('Error getting articles: ' + error.message));
  }
}

export class ArticleCreate extends Component {
  article: Article = {
    author: 'anon',
    title: '',
    content: '',
    edit_time: 0,
    pageId: 0,
    version: 0,
  };

  render() {
    return (
      <>
        <Card title="New article">
          <Row>
            <Column width={2}>
              <Form.Label>Title:</Form.Label>
            </Column>
            <Column>
              <Form.Input
                type="text"
                value={this.article.title}
                onChange={(event) => (this.article.title = event.currentTarget.value)}
              />
            </Column>
          </Row>
          <Row>
            <Column width={2}>
              <Form.Label>Content:</Form.Label>
            </Column>
            <Column>
              <Form.Textarea
                value={this.article.content}
                onChange={(e) => {
                  this.article.content = e.currentTarget.value;
                }}
                rows={10}
              />
            </Column>
          </Row>
        </Card>
        <Button.Success
          onClick={() => {
            wikiService
              .createArticle(this.article)
              .then(() => {
                this.article = {
                  author: 'anon',
                  title: '',
                  content: '',
                  edit_time: 0,
                  pageId: 0,
                  version: 0,
                };
              })
              .then(() => ArticleList.instance()?.mounted())
              .catch((error) => Alert.danger('Error creating article: ' + error.message));
          }}
        >
          Create
        </Button.Success>
      </>
    );
  }
}
