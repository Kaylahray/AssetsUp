# Departments Module

This module handles departments for the asset management system. Departments represent organizational units within companies and can contain multiple users and assets.

## Database Schema

### departments table
- `id` (Primary Key, Auto-generated)
- `name` (VARCHAR(255), Required)
- `companyId` (INT, Required, Foreign Key to companies table)
- `description` (TEXT, Optional)
- `createdAt` (Timestamp, Auto-generated)
- `updatedAt` (Timestamp, Auto-updated)

## API Endpoints

### Create Department
- **POST** `/departments`
- **Body:**
  ```json
  {
    "name": "Engineering",
    "companyId": 1,
    "description": "Software development department"
  }
  ```

### Get All Departments
- **GET** `/departments`
- **Query Parameters:**
  - `companyId` (optional) - Filter departments by company
- **Response:** Array of departments

### Get Departments by Company
- **GET** `/departments?companyId=1`
- **Response:** Array of departments for the specified company

### Get Department by ID
- **GET** `/departments/:id`
- **Response:** Single department

### Get Department Statistics
- **GET** `/departments/:id/stats`
- **Response:**
  ```json
  {
    "userCount": 15,
    "assetCount": 25
  }
  ```

### Update Department
- **PATCH** `/departments/:id`
- **Body:**
  ```json
  {
    "name": "Updated Department Name",
    "companyId": 2,
    "description": "Updated description"
  }
  ```

### Delete Department
- **DELETE** `/departments/:id`
- **Response:** 204 No Content

## Error Handling

- **404 Not Found:** When trying to access a non-existent department
- **409 Conflict:** When trying to create/update with duplicate name in same company
- **409 Conflict:** When trying to reference a non-existent company
- **400 Bad Request:** When validation fails

## Validation Rules

- `name`: Required, string, max 255 characters
- `companyId`: Required, integer
- `description`: Optional, string

## Relationships

- **Many-to-One** with Company (when Company entity is created)
- **One-to-Many** with Users (when User entity is created)
- **One-to-Many** with Assets (when Asset entity is created)

## Future Enhancements

- Department hierarchy support (parent-child relationships)
- Department managers assignment
- Budget tracking per department
- Soft delete functionality
- Bulk operations
