import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column } from './widgets';
import { NavLink } from 'react-router-dom';
import wikiService from './wiki-service';

type Article = {
  author: string;
  title: string;
  content: string;
  edit_date: number;
  pageId: number;
};

export class ArticleList extends Component {
  articles: Article[] = [];

  render() {
    return (
      <>
        <Card title="Articles">
          {this.articles.map((article) => {
            <Row key={article.pageId}>
              <Column>{article.title}</Column>
              <Column>{article.author}</Column>
              <Column>{article.edit_date}</Column>
            </Row>;
          })}
        </Card>
      </>
    );
  }

  mounted() {
    wikiService.getArticles().then((articles) => {
      this.articles = articles;
      console.log(articles);
    });
  }
}
