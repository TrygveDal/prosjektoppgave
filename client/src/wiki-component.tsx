import * as React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Button, Form, CommentWidget } from './widgets';
import { NavLink } from 'react-router-dom';
import wikiService from './wiki-service';
import { createHashHistory } from 'history';
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';

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
  content_formatted: HTMLDivElement | null = null;

  render() {
    const shareUrl = 'localhost:3000/#/articles/this.props.match.params.article_id';
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
          Edit article
        </Button.Success>
        <h6>Share article: </h6>
        <FacebookShareButton url={shareUrl}>
          <FacebookIcon size={30} round={true} />
        </FacebookShareButton>
        <WhatsappShareButton url={shareUrl}>
          <WhatsappIcon size={30} round={true} />
        </WhatsappShareButton>
        <TwitterShareButton url={shareUrl}>
          <TwitterIcon size={30} round={true} />
        </TwitterShareButton>
        <div></div>
        <Comments article_id={this.article.article_id} />
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
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Last edited by</th>
                    <th>Last edit at</th>
                  </tr>
                </thead>
                <tbody>
                  {this.articles.map((article, i) => (
                    <tr key={i}>
                      <td>
                        <nav className="stroke">
                          {' '}
                          <a href={`#/articles/${article.article_id}`} className="nav-link">
                            {article.title}
                          </a>
                        </nav>
                      </td>
                      <td>{article.author}</td>
                      <td>{new Date(article.edit_time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

  tags: Tag[] = [];
  checked: number[] = [];

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
              <Popup trigger={<button>Link to article</button>}>
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
            <Column>
              <Card title="Tags">
                {this.tags.map((tag) => (
                  <Row key={tag.id}>
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
                      {tag.tag}
                    </span>
                  </Row>
                ))}
              </Card>
            </Column>
          </Row>
        </Card>
        <Button.Success
          onClick={() => {
            const user = String(prompt('Username:'));
            this.article.author = user;
            wikiService
              .createArticle(this.article)
              .then((article_id) => {
                if (this.checked.length > 0) {
                  let article_tags = { article_id: article_id, tag_ids: this.checked };
                  wikiService.addArticleTags(article_tags);
                }
              })
              .then(() => history.push('/'))
              .catch((error) => Alert.danger('Error creating article: ' + error.message));
          }}
        >
          Create
        </Button.Success>
      </>
    );
  }

  mounted() {
    wikiService
      .getTags()
      .then((tags) => {
        this.tags = tags;
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
}
export class Comments extends Component<{ article_id: number }> {
  comments: Comment[] = [];
  comment: Comment = {
    comment_id: 0,
    article_id: 0,
    user: '',
    content: '',
  };
  render() {
    return (
      <>
        <Card title="Comments">
          {this.comments.map((comment, i) => (
            <Row key={i}>
              <CommentWidget
                comment={comment.content}
                addedBy={comment.user}
                edit_onClick={() => {
                  const newContent = prompt('Write your comment:', comment.content);
                  if (newContent != null && newContent != '') {
                    comment.content = newContent;
                    wikiService.editComment(comment);
                  }
                }}
                delete_onClick={() => {
                  wikiService.deleteComment(comment).then((message) => {
                    alert(message);
                    this.mounted();
                  });
                }}
              ></CommentWidget>
            </Row>
          ))}
        </Card>

        <form className="needs-validation" id="customValidateClass" noValidate>
          <Card title="">
            <div>
              <label htmlFor="validate01">Textarea</label>
              <textarea
                className="form-control"
                id="validate01"
                value={this.comment.content}
                onChange={(event) => {
                  this.comment.content = event.currentTarget.value;
                }}
                required
              ></textarea>
              <div className="valid-feedback">valid</div>
              <div className="invalid-feedback">invalid</div>
            </div>
            <button
              className="btn btn-primary"
              id="leggTilCommentBtn"
              onClick={() => {
                'use strict';

                const form: HTMLFormElement = document.getElementById(
                  'customValidateClass',
                ) as HTMLFormElement;

                if (!form.checkValidity()) {
                  form.classList.add('was-validated');
                  return false;
                }

                const user = prompt('Username:');
                if (user && user != null && user.length > 0) {
                  this.comment.user = user;
                  this.comment.article_id = this.props.article_id;
                  console.log(this.comment);

                  wikiService
                    .addComment(this.comment)
                    .then(() => {
                      this.comment.content = '';
                      this.mounted();
                    })
                    .catch((error) => Alert.danger('Error adding comment: ' + error.message));
                }
              }}
            >
              Post comment
            </button>
          </Card>
        </form>
      </>
    );
  }
  mounted() {
    wikiService
      .getComments(this.props.article_id)
      .then((comments) => (this.comments = comments))
      .catch((error) => Alert.danger('Error getting comments: ' + error.message));
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
              .then(() => {
                Alert.success('Successfully deleted article');
                history.push('/');
              })
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

export class TagList extends Component {
  tags: Tag[] = [];
  checked: number[] = [];
  articleCount: { [tagId: number]: number } = {};
  articles: Article[] = [];

  render() {
    return (
      <div>
        <Card title="Tags">
          <Card title="">
            <Row>
              <div className="d-flex flex-row ">
                {this.tags.map((tag) => (
                  <div className="p-2">
                    <Column key={tag.id} right={false}>
                      <div className="testststst">
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

                            border: this.checked.includes(tag.id)
                              ? '2px solid blue'
                              : '2px solid black',
                            borderRadius: '10px',
                            padding: '4px 2px',
                            backgroundColor: this.checked.includes(tag.id)
                              ? 'rgb(220, 220, 220)'
                              : 'transparent',
                            cursor: 'pointer',
                            color: 'black',
                          }}
                        >
                          {tag.tag} ({this.articleCount[tag.id] || 0})
                        </span>
                      </div>
                    </Column>
                  </div>
                ))}
              </div>
            </Row>
          </Card>
          <Row>
            <div className="d-flex flex-row" style={{ paddingTop: '2px' }}>
              <div className="p-3">
                <Button.Success
                  onClick={() => {
                    this.tagSearch(this.checked);
                  }}
                >
                  Search
                </Button.Success>
              </div>
              <div className="p-3">
                <Popup
                  trigger={
                    <button
                      style={{
                        display: 'inline-block',
                        border: '2px solid black',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      New tag
                    </button>
                  }
                >
                  <TagCreate />
                </Popup>
              </div>
              <div className="p-3">
                <Popup
                  trigger={
                    <button
                      style={{
                        display: 'inline-block',
                        border: '2px solid black',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete tag
                    </button>
                  }
                >
                  <TagDelete />
                </Popup>
              </div>
            </div>
          </Row>
        </Card>
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
    wikiService.searchTag(tags).then((out) => {
      if (this.articles.length !== 0) this.articles = [];

      out.forEach((e) => {
        wikiService.getArticle(e.article_id).then((response) => {
          this.articles.push(response);
        });
      });
    });
  }
}
export class TagCreate extends Component {
  tag: string = '';
  render() {
    return (
      <>
        <Card title="New tag">
          <Row>
            <Column>
              <Form.Input
                type="text"
                value={this.tag}
                onChange={(event) => (this.tag = event.currentTarget.value)}
              />
            </Column>
          </Row>
        </Card>
        <Button.Success
          onClick={() => {
            wikiService
              .createTag(this.tag)
              .then(() => window.location.reload())
              .catch((error) => Alert.danger('Error creating tag: ' + error.message));
          }}
        >
          Create
        </Button.Success>
      </>
    );
  }
}

export class TagDelete extends Component {
  tags: Tag[] = [];

  render() {
    return (
      <>
        {this.tags.map((tag) => (
          <Row key={tag.id}>
            <Button.Light
              onClick={() => {
                wikiService
                  .deleteTag(tag.id)
                  .then(() => {
                    window.location.reload();
                  })
                  .catch((error) => Alert.danger('Error deleting tag: ' + error.message));
              }}
            >
              {tag.tag}
            </Button.Light>
          </Row>
        ))}
      </>
    );
  }
  mounted() {
    wikiService
      .getTags()
      .then((tags) => (this.tags = tags))
      .catch((error) => Alert.danger('Error getting Tags: ' + error.message));
  }
}
