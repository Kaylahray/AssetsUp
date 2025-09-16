// In-memory service for articles
import { Article } from './article.entity';

export class KnowledgeBaseService {
  private articles: Article[] = [];
  private nextId = 1;

  createArticle(category: string, title: string, content: string, tags: string[], author: string): Article {
    const article = new Article(this.nextId++, category, title, content, tags, author);
    this.articles.push(article);
    return article;
  }

  updateArticle(id: number, data: { category?: string; title?: string; content?: string; tags?: string[]; author?: string }): Article | undefined {
    const article = this.articles.find(a => a.id === id);
    if (!article) return undefined;
    if (data.category) article.category = data.category;
    if (data.title) article.title = data.title;
    if (data.content) article.content = data.content;
    if (data.tags) article.tags = data.tags;
    if (data.author) article.author = data.author;
    return article;
  }

  deleteArticle(id: number): boolean {
    const idx = this.articles.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.articles.splice(idx, 1);
    return true;
  }

  listArticles(): Article[] {
    return this.articles;
  }

  searchArticles(query: string): Article[] {
    const q = query.toLowerCase();
    return this.articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  filterArticles({ category, tag, author, from, to }: { category?: string; tag?: string; author?: string; from?: Date; to?: Date }): Article[] {
    return this.articles.filter(a =>
      (category ? a.category === category : true) &&
      (tag ? a.tags.includes(tag) : true) &&
      (author ? a.author === author : true) &&
      (from ? a.createdAt >= from : true) &&
      (to ? a.createdAt <= to : true)
    );
  }

  listCategories(): string[] {
    return Array.from(new Set(this.articles.map(a => a.category)));
  }

  listTags(): string[] {
    return Array.from(new Set(this.articles.flatMap(a => a.tags)));
  }

  listAuthors(): string[] {
    return Array.from(new Set(this.articles.map(a => a.author)));
  }
}
