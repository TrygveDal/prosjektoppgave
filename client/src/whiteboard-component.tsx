import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column } from './widgets';
import { NavLink } from 'react-router-dom';
import wikiService from './wiki-service';

type Article = {
  author: string;
  title: string;
  content: string;
  edit_date: string;
  pageId: number;
};

export class ArticleList extends Component {
  articles: Article[] = [];
  connection: WebSocket | null = null;
  connected = false;

  render() {
    return (
      <>
        <Card title="Articles">
          {this.articles.map((article) => (
            <Row key={article.pageId}>
              <Column>
                <NavLink to={'/articles/' + article.pageId}>{article.title}</NavLink>
              </Column>
              <Column>{article.author}</Column>
              <Column>{article.edit_date}</Column>
            </Row>
          ))}
        </Card>
      </>
    );
  }

  mounted() {
    // Connect to the websocket server
    this.connection = new WebSocket('ws://localhost:3000/api/v1/whiteboard');

    this.connection.onmessage = (message) => {
      this.articles = JSON.parse(message.data);
    };

    // Called when the connection is ready
    this.connection.onopen = () => {
      this.connected = true;
      this.connection?.send('viewing articlelist');
    };

    // Called if connection is closed
    this.connection.onclose = (event) => {
      this.connected = false;
      Alert.danger('Connection closed with code ' + event.code + ' and reason: ' + event.reason);
    };

    // Called on connection error
    this.connection.onerror = () => {
      this.connected = false;
      Alert.danger('Connection error');
    };
    // Close websocket connection when component is no longer in use
  }
  beforeUnmount() {
    this.connection?.close();
  }
}
