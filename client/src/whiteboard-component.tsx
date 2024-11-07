import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column } from './widgets';
import { NavLink } from 'react-router-dom';
import wikiService from './wiki-service';

type Article = {
  author: string;
  title: string;
  content: string;
  edit: number;
  pageId: number;
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
              <Column>{new Date(article.edit).toUTCString()}</Column>
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
        console.log(articles);
      })
      .catch((error) => Alert.danger('Error getting articles: ' + error.message));
  }
}
