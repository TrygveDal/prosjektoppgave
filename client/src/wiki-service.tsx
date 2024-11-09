import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api/v1';

type Article = {
  author: string;
  title: string;
  content: string;
  edit: number;
  pageId: number;
};

class WikiService {
  /**
   * Get all articles.
   */
  getArticles() {
    return axios.get<Article[]>('/articles').then((response) => response.data);
  }

  // Create new articles and update existing ones
  createArticle(article: Article) {
    article.edit = Date.now();
    return axios
      .post<{ id: number }>('/articles', { article })
      .then((response) => response.data.id);
  }
}

const wikiService = new WikiService();
export default wikiService;
