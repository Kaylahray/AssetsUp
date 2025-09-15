// Mock controller for Knowledge Base (plain functions)
import { KnowledgeBaseService } from './knowledge-base.service';

const service = new KnowledgeBaseService();

// Simulate POST /articles
export function createArticleHandler(body: { category: string; title: string; content: string; tags: string[]; author: string }) {
  return service.createArticle(body.category, body.title, body.content, body.tags, body.author);
}

// Simulate GET /articles
export function listArticlesHandler() {
  return service.listArticles();
}

// Simulate GET /articles/search?q=...
export function searchArticlesHandler(query: string) {
  return service.searchArticles(query);
}

// Simulate GET /articles/filter?category=...&tag=...&author=...
export function filterArticlesHandler(filter: { category?: string; tag?: string; author?: string }) {
  return service.filterArticles(filter);
}
