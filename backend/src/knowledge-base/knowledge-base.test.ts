// Test for Knowledge Base Module (no dependencies)


import {
  createArticleHandler,
  updateArticleHandler,
  deleteArticleHandler,
  listArticlesHandler,
  searchArticlesHandler,
  filterArticlesHandler,
  listCategoriesHandler,
  listTagsHandler,
  listAuthorsHandler
} from './knowledge-base.controller';

// Create articles with different content types and tags
const a1 = createArticleHandler({
  category: 'FAQ',
  title: 'How to register an asset?',
  content: 'To register an asset, go to the **Assets** page and click _Register_.', // markdown
  tags: ['registration', 'assets'],
  author: 'admin1'
});
const a2 = createArticleHandler({
  category: 'Guide',
  title: 'Asset Disposal Process',
  content: '<p>Follow these steps to dispose of an asset...</p>', // HTML
  tags: ['disposal', 'assets'],
  author: 'admin2'
});
const a3 = createArticleHandler({
  category: 'FAQ',
  title: 'How to transfer an asset?',
  content: 'Use the transfer form and select the target department.',
  tags: ['transfer', 'assets'],
  author: 'admin1'
});
const a4 = createArticleHandler({
  category: 'How-To',
  title: 'Asset Maintenance',
  content: 'Schedule regular maintenance for your assets.',
  tags: ['maintenance', 'assets', 'how-to'],
  author: 'admin3'
});

// List all articles
console.log('All articles:', listArticlesHandler());

// Update an article
const updated = updateArticleHandler(a1.id, { title: 'How to register a new asset?', tags: ['registration', 'assets', 'new'] });
console.log('Updated article:', updated);

// Delete an article
const deleted = deleteArticleHandler(a2.id);
console.log('Deleted article result (should be true):', deleted);
console.log('All articles after delete:', listArticlesHandler());

// Search tests
console.log('Search "register":', searchArticlesHandler('register'));
console.log('Search "disposal":', searchArticlesHandler('disposal'));
console.log('Search "maintenance":', searchArticlesHandler('maintenance'));
console.log('Search "assets":', searchArticlesHandler('assets'));
console.log('Search "nonexistent":', searchArticlesHandler('nonexistent'));

// Filter tests
console.log('Filter by category FAQ:', filterArticlesHandler({ category: 'FAQ' }));
console.log('Filter by tag "assets":', filterArticlesHandler({ tag: 'assets' }));
console.log('Filter by author "admin2":', filterArticlesHandler({ author: 'admin2' }));
console.log('Filter by category "Guide" and tag "disposal":', filterArticlesHandler({ category: 'Guide', tag: 'disposal' }));
console.log('Filter by category "How-To" and tag "how-to":', filterArticlesHandler({ category: 'How-To', tag: 'how-to' }));
console.log('Filter by category "FAQ" and author "admin1":', filterArticlesHandler({ category: 'FAQ', author: 'admin1' }));
console.log('Filter by tag "transfer" and author "admin1":', filterArticlesHandler({ tag: 'transfer', author: 'admin1' }));

// Date range filter
const now = new Date();
const future = new Date(now.getTime() + 1000 * 60 * 60 * 24); // +1 day
console.log('Filter by from now:', filterArticlesHandler({ from: now })); // Should be empty
console.log('Filter by to now:', filterArticlesHandler({ to: now })); // Should include all
console.log('Filter by from now to future:', filterArticlesHandler({ from: now, to: future })); // Should be empty

// Edge cases
console.log('Filter by category "Unknown":', filterArticlesHandler({ category: 'Unknown' }));
console.log('Filter by tag "missing":', filterArticlesHandler({ tag: 'missing' }));
console.log('Filter by author "ghost":', filterArticlesHandler({ author: 'ghost' }));
console.log('Update non-existent article:', updateArticleHandler(9999, { title: 'Nope' }));
console.log('Delete non-existent article:', deleteArticleHandler(9999));

// Search with empty string (should return all)
console.log('Search with empty string:', searchArticlesHandler(''));

// List unique categories, tags, authors
console.log('Unique categories:', listCategoriesHandler());
console.log('Unique tags:', listTagsHandler());
console.log('Unique authors:', listAuthorsHandler());
