import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api/v1';

type Article = {
  article_id: number;
  title: string;
  content: string;
  author: string;
  edit_time: number;
  version_number: number;
};
//version_type is either "created" or "edited"
type Version = {
  author: string;
  edit_time: number;
  version_number: number;
  version_type: string;
};

//comment type:
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

class WikiService {
  /**
   * Get all articles.
   */
  getArticles() {
    return axios.get<Article[]>('/articles').then((response) => response.data);
  }

  searchArticles(query: string) {
    return axios.get<Article[]>('/articles/search/' + query).then((response) => response.data);
  }
  searchTitles(query: string) {
    return axios
      .get<{ article_id: number; title: string }[]>('/search/titles/' + query)
      .then((response) => response.data);
  }

  getArticle(article_id: number) {
    return axios.get<Article>('/articles/' + article_id).then((response) => response.data);
  }

  getVersion(article_id: number, version_number: number) {
    return axios
      .get<Article>('/articles/' + article_id + '/version/' + version_number)
      .then((response) => response.data);
  }

  viewArticle(article_id: number) {
    return axios
      .post<void>('/articles/' + article_id + '/viewed')
      .then((response) => response.data);
  }

  getViews(article_id: number) {
    return axios
      .get<{ views: number }>('/articles/' + article_id + '/views')
      .then((response) => response.data);
  }

  // Add comment:
  addComment(comment: Comment) {
    return axios
      .post<{
        comment_id: number;
      }>('/articles/' + comment.article_id + '/comments/new', { comment })
      .then((Response) => Response.data.comment_id);
  }

  // get comments:
  getComments(article_id: number) {
    return axios
      .get<Comment[]>('/articles/' + article_id + '/comments')
      .then((response) => response.data);
  }
  deleteComment(comment: Comment) {
    return axios
      .delete('/articles/' + comment.article_id + '/comments/' + comment.comment_id)
      .then((response) => response.data);
  }
  editComment(comment: Comment) {
    return axios
      .put('/articles/' + comment.article_id + '/comments/' + comment.comment_id, {
        comment,
      })
      .then(() => {});
  }

  versionHistory(article_id: number) {
    return axios
      .get<Version[]>('/articles/' + article_id + '/versionhistory')
      .then((response) => response.data);
  }

  // Create new articles and update existing ones
  createArticle(article: Article) {
    article.edit_time = Date.now();
    return axios
      .post<{ article_id: number }>('/articles', { article })
      .then((response) => response.data.article_id);
  }

  deleteArticle(article_id: number) {
    return axios.delete<void>('/articles/delete/' + article_id);
  }

  // tag
  getTags() {
    return axios.get<Tag[]>('/tags').then((response) => response.data);
  }

  getTagCount(tag_id: number) {
    return axios
      .get<{ tag_count: number }>('/tags/' + tag_id + '/count')
      .then((response) => response.data);
  }
}

const wikiService = new WikiService();
export default wikiService;
