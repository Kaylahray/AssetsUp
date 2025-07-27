/\*

# Category Management Module

A comprehensive NestJS module for managing asset categories with hierarchical relationships.

## Features

- ✅ CRUD operations for categories
- ✅ Hierarchical parent-child relationships
- ✅ Unique category name constraints
- ✅ Comprehensive validation
- ✅ Full test coverage (unit & integration)
- ✅ OpenAPI/Swagger documentation
- ✅ TypeORM integration
- ✅ Circular reference prevention

## API Endpoints

### Categories

- `POST /categories` - Create a new category
- `GET /categories` - Get all categories
- `GET /categories/tree` - Get category tree structure
- `GET /categories/root` - Get root categories only
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

## Installation

1. Install dependencies:

```bash
npm install @nestjs/common @nestjs/core @nestjs/typeorm typeorm class-validator class-transformer
```

2. Import the CategoryModule in your app.module.ts:

```typescript
import { CategoryModule } from "./category/category.module";

@Module({
  imports: [CategoryModule],
})
export class AppModule {}
```

## Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Schema

The Category entity includes:

- `id`: UUID primary key
- `name`: Unique category name (max 100 chars)
- `description`: Optional text description
- `iconUrl`: Optional icon URL (max 500 chars)
- `parentId`: Optional parent category reference
- `createdAt`: Auto-generated creation timestamp
- `updatedAt`: Auto-generated update timestamp

## Usage Examples

### Create a root category

```typescript
POST /categories
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "iconUrl": "https://example.com/icons/electronics.png"
}
```

### Create a subcategory

```typescript
POST /categories
{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "parentId": "parent-category-uuid"
}
```

### Get category tree

```typescript
GET / categories / tree;
// Returns hierarchical structure with nested children
```

## Validation Rules

- Category names must be unique
- Category names are required and max 100 characters
- Description is optional and max 1000 characters
- Icon URL must be a valid URL format
- Cannot delete categories that have children
- Prevents circular references in parent-child relationships
  \*/
