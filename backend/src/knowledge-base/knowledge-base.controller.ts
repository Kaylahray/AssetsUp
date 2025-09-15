// Mock controller for Knowledge Base (plain functions)
import { KnowledgeBaseService } from './knowledge-base.service';

const service = new KnowledgeBaseService();

// Simulate POST /articles
export function createArticleHandler(body: { category: string; title: string; content: string; tags: string[]; author: string }) {
  return service.createArticle(body.category, body.title, body.content, body.tags, body.author);
}

// Simulate PATCH /articles/:id
export function updateArticleHandler(id: number, data: { category?: string; title?: string; content?: string; tags?: string[]; author?: string }) {
  return service.updateArticle(id, data);
}

// Simulate DELETE /articles/:id
export function deleteArticleHandler(id: number) {
  return service.deleteArticle(id);
}

// Simulate GET /articles
export function listArticlesHandler() {
  return service.listArticles();
}

// Simulate GET /articles/search?q=...
export function searchArticlesHandler(query: string) {
  return service.searchArticles(query);
}

// Simulate GET /articles/filter?category=...&tag=...&author=...&from=...&to=...
export function filterArticlesHandler(filter: { category?: string; tag?: string; author?: string; from?: Date; to?: Date }) {
  return service.filterArticles(filter);
}

// Simulate GET /articles/categories
export function listCategoriesHandler() {
  return service.listCategories();
}

// Simulate GET /articles/tags
export function listTagsHandler() {
  return service.listTags();
}

// Simulate GET /articles/authors
export function listAuthorsHandler() {
  return service.listAuthors();
}
