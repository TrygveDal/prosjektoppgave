import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api/v1';

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

class WikiService {
  /**
   * Get all articles.
   */
  getArticles() {
    return axios.get<Article[]>('/articles').then((response) => response.data);
  }

  getArticle(pageId: number) {
    return axios.get<Article>('/articles/' + pageId).then((response) => response.data);
  }

  getVersion(pageId: number, version: number) {
    return axios
      .get<Article>('/articles/' + pageId + '/version/' + version)
      .then((response) => response.data);
  }

  viewArticle(pageId: number) {
    return axios.post<void>('/articles/' + pageId + '/viewed').then((response) => response.data);
  }

  versionHistory(pageId: number) {
    return axios
      .get<Version[]>('/articles/' + pageId + '/versionhistory')
      .then((response) => response.data);
  }

  // Create new articles and update existing ones
  createArticle(article: Article) {
    article.edit_time = Date.now();
    return axios
      .post<{ id: number }>('/articles', { article })
      .then((response) => response.data.id);
  }
}

const wikiService = new WikiService();
export default wikiService;
