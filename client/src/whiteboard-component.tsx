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

type Version = {
  author: string;
  edit_time: number;
  versionnr: number;
  type: string;
};

export class ArticleDetails extends Component<{
  match: { params: { pageId: number; versionnr?: number } };
}> {
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
        <Card title={this.article.title}>
          {this.props.match.params.versionnr ? (
            <Row>
              <Column>Viewing version {this.props.match.params.versionnr}</Column>
            </Row>
          ) : (
            <></>
          )}
          <Row>
            <Card title="">{this.article.content}</Card>
          </Row>
        </Card>
        <Button.Success
          onClick={() => history.push('/articles/' + this.props.match.params.pageId + '/edit')}
        >
          Edit
        </Button.Success>
        <VersionHistory pageId={this.props.match.params.pageId} />
      </>
    );
  }

  mounted() {
    if (this.props.match.params.versionnr) {
      wikiService
        .getVersion(this.props.match.params.pageId, this.props.match.params.versionnr)
        .then((article) => (this.article = article))
        .catch((error) => Alert.danger('Error getting article: ' + error.message));
    } else {
      wikiService
        .getArticle(this.props.match.params.pageId)
        .then((article) => (this.article = article))
        .then(() => wikiService.viewArticle(this.article.pageId))
        .catch((error) => Alert.danger('Error getting article: ' + error.message));
    }
  }
}

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
              <Column>
                <NavLink
                  to={'/articles/' + article.pageId}
                  style={{ color: 'inherit', textDecoration: 'inherit' }}
                >
                  {article.title}
                </NavLink>
              </Column>

              <Column>{article.author}</Column>
              <Column>{new Date(article.edit_time).toLocaleString()}</Column>
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

export class VersionHistory extends Component<{ pageId: number }> {
  versions: Version[] = [];

  render() {
    return (
      <>
        <Card title="Version history:">
          {this.versions.map((version) => (
            <Row key={version.versionnr}>
              <NavLink
                to={'/articles/' + this.props.pageId + '/version/' + version.versionnr}
                style={{ color: 'inherit', textDecoration: 'inherit' }}
              >
                {'type: ' +
                  version.type +
                  ' at: ' +
                  new Date(version.edit_time).toLocaleString() +
                  ' by: ' +
                  version.author +
                  ' version: ' +
                  version.versionnr}
              </NavLink>
            </Row>
          ))}
        </Card>
      </>
    );
  }

  mounted() {
    wikiService
      .versionHistory(this.props.pageId)
      .then((versions) => {
        this.versions = versions;
      })
      .catch((error) => Alert.danger('Error getting versionhistory: ' + error.message));
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
            const user = String(prompt('Username:'));
            this.article.author = user;
            wikiService
              .createArticle(this.article)
              .then(() => history.push('/'))
              .catch((error) => Alert.danger('Error creating article: ' + error.message));
          }}
        >
          Create
        </Button.Success>
      </>
    );
  }
}

export class ArticleEdit extends Component<{ match: { params: { pageId: number } } }> {
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
        <Card title="Edit article">
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
            const user = String(prompt('Username:'));
            this.article.author = user;
            wikiService
              .createArticle(this.article)
              .then((id) => history.push('/articles/' + id))
              .catch((error) => Alert.danger('Error creating article: ' + error.message));
          }}
        >
          Save
        </Button.Success>
      </>
    );
  }

  mounted() {
    wikiService
      .getArticle(this.props.match.params.pageId)
      .then((article) => (this.article = article))
      .catch((error) => Alert.danger('Error getting article: ' + error.message));
  }
}
