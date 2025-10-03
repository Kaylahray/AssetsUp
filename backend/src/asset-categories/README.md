# Asset Categories Module

This module handles asset categories for the asset management system. Assets are grouped into categories such as IT Equipment, Vehicles, Furniture, etc.

## Database Schema

### asset_categories table
- `id` (Primary Key, Auto-generated)
- `name` (VARCHAR(255), Unique, Required)
- `description` (TEXT, Optional)
- `createdAt` (Timestamp, Auto-generated)
- `updatedAt` (Timestamp, Auto-updated)

## API Endpoints

### Create Asset Category
- **POST** `/asset-categories`
- **Body:**
  ```json
  {
    "name": "IT Equipment",
    "description": "Computers, laptops, servers, and other IT equipment"
  }
  ```

### Get All Asset Categories
- **GET** `/asset-categories`
- **Response:** Array of asset categories

### Get Asset Category by ID
- **GET** `/asset-categories/:id`
- **Response:** Single asset category

### Update Asset Category
- **PATCH** `/asset-categories/:id`
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description"
  }
  ```

### Delete Asset Category
- **DELETE** `/asset-categories/:id`
- **Response:** 204 No Content

## Error Handling

- **404 Not Found:** When trying to access a non-existent asset category
- **409 Conflict:** When trying to create/update with a duplicate name
- **400 Bad Request:** When validation fails

## Validation Rules

- `name`: Required, string, max 255 characters
- `description`: Optional, string

## Future Enhancements

- Relationship with assets table (one-to-many)
- Soft delete functionality
- Category hierarchy support
- Bulk operations
