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

  filterArticles({ category, tag, author }: { category?: string; tag?: string; author?: string }): Article[] {
    return this.articles.filter(a =>
      (category ? a.category === category : true) &&
      (tag ? a.tags.includes(tag) : true) &&
      (author ? a.author === author : true)
    );
  }
}
