import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Button, Form } from './widgets';
import { NavLink, useParams } from 'react-router-dom';
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

type Tag = {
  id: number;
  tag: string;
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
            <Card title="">{this.article.content}</Card>
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
        .then(() => wikiService.getViews(this.article.article_id))
        .then((response) => (this.views = response.views))
        .catch((error) => Alert.danger('Error getting article: ' + error.message));
    } else {
      wikiService
        .getArticle(this.props.match.params.article_id)
        .then((article) => (this.article = article))
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

export class ArticleEdit extends Component<{ match: { params: { article_id: number } } }> {
  article: Article = {
    article_id: 0,
    title: '',
    content: '',
    author: 'anon',
    edit_time: 0,
    version_number: 0,
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

export class Login extends Component {
  render() {
    return (
      <div>
        <h1>Log in</h1>
      </div>
    );
  }
}

export class TagList extends Component {
  tags: Tag[] = [];
  checked: number[] = [];
  articleCount: { [tagId: number]: number } = {};

  render() {
    return (
      <div>
        <Card title="Tags">
          <Row>
            {this.tags.map((tag) => (
              <Column key={tag.id} width={1}>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Form.Checkbox
                    onChange={() => {
                      this.checkBoxUpdate(tag.id);
                    }}
                    checked={this.checked.includes(tag.id)}
                    style={{ display: 'none' }}
                  ></Form.Checkbox>
                  <span
                    onClick={() => this.checkBoxUpdate(tag.id)}
                    style={{
                      display: 'inline-block',
                      border: '2px solid black',
                      padding: '4px 2px',
                      backgroundColor: this.checked.includes(tag.id)
                        ? 'rgb(0, 0, 0)'
                        : 'transparent',
                      cursor: 'pointer',
                      color: this.checked.includes(tag.id) ? 'white' : 'black',
                    }}
                  >
                    {tag.tag} ({this.articleCount[tag.id] || 0})
                  </span>
                </div>
              </Column>
            ))}
          </Row>
          <Row>
            <Column width={1}>
              <Button.Success
                onClick={() => {
                  this.tagSearch(this.checked);
                }}
              >
                Test
              </Button.Success>
            </Column>
          </Row>
        </Card>
      </div>
    );
  }

  mounted() {
    wikiService
      .getTags()
      .then((tags) => {
        this.tags = tags;

        this.tags.forEach((tag) => {
          wikiService.getTagCount(tag.id).then((count) => {
            this.articleCount[tag.id] = count.tag_count;
          });
        });
      })
      .catch((error) => Alert.danger('Error getting Tags: ' + error.message));
  }

  checkBoxUpdate(id: number) {
    if (this.checked.includes(id)) {
      this.checked = this.checked.filter((e) => e !== id);
    } else {
      this.checked.push(id);
    }
  }

  tagSearch(tags: number[]) {
    wikiService.searchTag(tags).then((out) =>
      // Må legge til visning av sider
      console.log(out),
    );
  }
}
