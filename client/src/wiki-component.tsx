import * as React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Button, Form } from './widgets';
import { NavLink } from 'react-router-dom';
import wikiService from './wiki-service';
import { createHashHistory } from 'history';

const history = createHashHistory(); // Use history.push(...) to programmatically change path, for instance after successfully saving a student

type Article = {
  article_id: number;
  title: string;
  content: string;
  author: string;
  edit_time: number;
  version_number: number;
};
// version_type is either "created", or "edited"
type Version = {
  author: string;
  edit_time: number;
  version_number: number;
  version_type: string;
};

// comment type:
type Comment = {
  comment_id: number;
  article_id: number;
  user: string;
  content: string;
};

export class ArticleDetails extends Component<{
  match: { params: { article_id: number; version_number?: number } };
}> {
  article: Article = {
    article_id: 0,
    title: '',
    content: '',
    author: 'anon',
    edit_time: 0,
    version_number: 0,
  };
  views: number = 0;
  content_formatted: HTMLDivElement | null = null;

  render() {
    return (
      <>
        <Card title={this.article.title}>
          <div
            style={{ color: 'blue' }}
            onClick={() => {
              Alert.info('Version: ' + this.article.version_number + ' Views: ' + this.views);
            }}
          >
            Page statistics
          </div>
          {this.props.match.params.version_number ? (
            <Row>
              <Column>Viewing version {this.props.match.params.version_number}</Column>
            </Row>
          ) : (
            <></>
          )}
          <Row>
            <Card title="">
              <div ref={(e) => (this.content_formatted = e)}></div>
            </Card>
          </Row>
        </Card>
        <Button.Success
          onClick={() => history.push('/articles/' + this.props.match.params.article_id + '/edit')}
        >
          Edit
        </Button.Success>
        <CommentCreate article_id={this.props.match.params.article_id} />
        <VersionHistory article_id={this.props.match.params.article_id} />
      </>
    );
  }

  mounted() {
    if (this.props.match.params.version_number) {
      wikiService
        .getVersion(this.props.match.params.article_id, this.props.match.params.version_number)
        .then((article) => (this.article = article))
        .then((article) => {
          if (this.content_formatted != null) this.content_formatted.innerHTML = article.content;
        })
        .then(() => wikiService.getViews(this.article.article_id))
        .then((response) => (this.views = response.views))
        .catch((error) => Alert.danger('Error getting article: ' + error.message));
    } else {
      wikiService
        .getArticle(this.props.match.params.article_id)
        .then((article) => (this.article = article))
        .then((article) => {
          if (this.content_formatted != null) this.content_formatted.innerHTML = article.content;
        })
        .then(() => wikiService.viewArticle(this.article.article_id))
        .then(() => wikiService.getViews(this.article.article_id))
        .then((response) => (this.views = response.views))
        .catch((error) => Alert.danger('Error getting article: ' + error.message));
    }
  }
}

export class ArticleList extends Component<{ match: { params: { search_query?: string } } }> {
  articles: Article[] = [];

  render() {
    return (
      <>
        <Card title="Articles">
          {this.articles.length > 0 ? (
            <>
              <Row>
                <Column>Article</Column>
                <Column>Last edited by</Column>
                <Column>Last edit at</Column>
              </Row>
              {this.articles.map((article, i) => (
                <Row key={i}>
                  <Column>
                    <NavLink
                      to={'/articles/' + article.article_id}
                      style={{ color: 'inherit', textDecoration: 'inherit' }}
                    >
                      {article.title}
                    </NavLink>
                  </Column>

                  <Column>{article.author}</Column>
                  <Column>{new Date(article.edit_time).toLocaleString()}</Column>
                </Row>
              ))}
            </>
          ) : (
            <div>No articles found</div>
          )}
        </Card>
      </>
    );
  }

  mounted() {
    if (this.props.match.params.search_query) {
      wikiService
        .searchArticles(this.props.match.params.search_query)
        .then((articles) => {
          this.articles = articles;
        })
        .catch((error) => Alert.danger('Error getting articles: ' + error.message));
    } else {
      wikiService
        .getArticles()
        .then((articles) => {
          this.articles = articles;
        })
        .catch((error) => Alert.danger('Error getting articles: ' + error.message));
    }
  }
}

export class FormattedContent extends Component<{ content: string }> {
  temp: HTMLDivElement = document.createElement('div');

  render() {
    return <></>;
  }
  mounted() {
    this.temp.innerHTML = this.props.content;
    console.log(this.temp);
  }
}

export class VersionHistory extends Component<{ article_id: number }> {
  versions: Version[] = [];

  render() {
    return (
      <>
        <Card title="Version history:">
          {this.versions.map((version) => (
            <Row key={version.version_number}>
              <NavLink
                to={'/articles/' + this.props.article_id + '/version/' + version.version_number}
                style={{ color: 'inherit', textDecoration: 'inherit' }}
              >
                {version.version_type +
                  ' at: ' +
                  new Date(version.edit_time).toLocaleString() +
                  ' by: ' +
                  version.author +
                  ' version: ' +
                  version.version_number}
              </NavLink>
            </Row>
          ))}
        </Card>
      </>
    );
  }

  mounted() {
    wikiService
      .versionHistory(this.props.article_id)
      .then((versions) => {
        this.versions = versions;
      })
      .catch((error) => Alert.danger('Error getting versionhistory: ' + error.message));
  }
}

export class ArticleCreate extends Component {
  article: Article = {
    article_id: 0,
    title: '',
    content: '',
    author: 'anon',
    edit_time: 0,
    version_number: 0,
  };
  onSelectHyperlink = (article_id: number) => {
    if (article_id && article_id != 0) {
      this.article.content +=
        '<a href="/#/articles/' +
        article_id +
        '">' +
        prompt('text to display as hyperlink: ') +
        '</a>';
    }
    this.query = '';
  };

  query: string = '';

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
            <Column>
              <Popup trigger={<button> Link to article</button>}>
                <Form.Input
                  type="text"
                  value={this.query}
                  onChange={(event) => (this.query = event.currentTarget.value)}
                />
                {this.query && this.query.length > 0 ? (
                  <SearchList search_query={this.query} handleSelect={this.onSelectHyperlink} />
                ) : (
                  <></>
                )}
              </Popup>
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

export class ArticleEdit extends Component<{ match: { params: { article_id: number } } }> {
  article: Article = {
    article_id: 0,
    title: '',
    content: '',
    author: 'anon',
    edit_time: 0,
    version_number: 0,
  };

  onSelectHyperlink = (article_id: number) => {
    if (article_id && article_id != 0) {
      this.article.content +=
        '<HyperlinkArticle article_id=' +
        article_id +
        ' text=' +
        prompt('text to display as hyperlink: ') +
        ' />';
    }
    this.query = '';
  };

  query: string = '';

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
            <Column>
              <Popup trigger={<button> Link to article</button>}>
                <Form.Input
                  type="text"
                  value={this.query}
                  onChange={(event) => (this.query = event.currentTarget.value)}
                />
                {this.query && this.query.length > 0 ? (
                  <SearchList search_query={this.query} handleSelect={this.onSelectHyperlink} />
                ) : (
                  <></>
                )}
              </Popup>
            </Column>
          </Row>
        </Card>
        <Button.Success
          onClick={() => {
            const user = String(prompt('Username:'));
            this.article.author = user;
            wikiService
              .createArticle(this.article)
              .then((article_id) => history.push('/articles/' + article_id))
              .catch((error) => Alert.danger('Error creating article: ' + error.message));
          }}
        >
          Save
        </Button.Success>
        <Button.Danger
          onClick={() =>
            wikiService
              .deleteArticle(this.article.article_id)
              .then(() => history.push('/'))
              .catch((error) => Alert.danger('Error deleting article: ' + error.message))
          }
        >
          Delete
        </Button.Danger>
      </>
    );
  }

  mounted() {
    wikiService
      .getArticle(this.props.match.params.article_id)
      .then((article) => (this.article = article))
      .catch((error) => Alert.danger('Error getting article: ' + error.message));
  }
}

export class CommentCreate extends Component<{ article_id: number }> {
  comment: Comment = {
    comment_id: 0,
    article_id: 0,
    user: '',
    content: '',
  };

  render() {
    return (
      <div style={{ width: 70 + '%' }}>
        <Card title="Comment:">
          <Form.Textarea
            type="text"
            value={this.comment.content}
            onChange={(event) => {
              this.comment.content = event.currentTarget.value;
            }}
            rows={3}
          ></Form.Textarea>
        </Card>
        <Button.Success
          onClick={() => {
            const user = String(prompt('Username:'));
            this.comment.user = user;
            this.comment.article_id = this.props.article_id;
            wikiService
              .addComment(this.comment)
              .catch((error) => Alert.danger('Error adding comment: ' + error.message));
          }}
        >
          Add comment
        </Button.Success>
      </div>
    );
  }
}

export class SearchList extends Component<{
  search_query: string;
  handleSelect: (article_id: number) => void;
}> {
  articles: { article_id: number; title: string }[] = [];

  render() {
    return (
      <>
        {this.articles.length > 0 ? (
          <>
            {this.articles.map((article) => (
              <Button.Light
                onClick={() => this.props.handleSelect(article.article_id)}
                key={article.article_id}
              >
                {article.title}
              </Button.Light>
            ))}
          </>
        ) : (
          <></>
        )}
      </>
    );
  }

  mounted() {
    wikiService
      .searchTitles(this.props.search_query)
      .then((articles) => {
        this.articles = articles;
      })
      .catch((error) => Alert.danger('Error getting articles: ' + error.message));
  }
}

export class Login extends Component {
  render() {
    return (
      <div>
        <h1>Log in</h1>
      </div>
    );
  }
}
