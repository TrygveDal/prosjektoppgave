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
}

const wikiService = new WikiService();
export default wikiService;
