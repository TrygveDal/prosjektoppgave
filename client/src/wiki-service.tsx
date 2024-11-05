import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api/v2';

type Article = {
  author: string;
  title: string;
  content: string;
  edit_date: number;
  pageId: number;
};

class WikiService {
  /**
   * Get all articles.
   */
  getAllArticles() {
    return axios.get<Article[]>('/articles').then((response) => response.data);
  }
}

const wikiService = new WikiService();
export default wikiService;
