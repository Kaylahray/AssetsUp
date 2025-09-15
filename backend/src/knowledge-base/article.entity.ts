// Entity for knowledge base articles
export class Article {
  id: number;
  category: string;
  title: string;
  content: string; // markdown or HTML
  tags: string[];
  author: string;
  createdAt: Date;

  constructor(id: number, category: string, title: string, content: string, tags: string[], author: string) {
    this.id = id;
    this.category = category;
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.author = author;
    this.createdAt = new Date();
  }
}
