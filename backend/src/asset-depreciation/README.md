# Asset Depreciation Module

This module implements asset depreciation functionality using straight-line depreciation method to help companies estimate the current value of their assets.

## Features

- **Straight-line Depreciation**: Calculates depreciation using the formula: `(Purchase Price - Salvage Value) / Useful Life Years`
- **Automatic Calculation**: Current depreciated values are calculated automatically based on time elapsed
- **Comprehensive API**: Full CRUD operations plus specialized endpoints for depreciation data
- **Validation**: Input validation for purchase dates, salvage values, and useful life
- **Filtering**: Advanced filtering options for retrieving assets by depreciation status, method, and value ranges

## API Endpoints

### Basic CRUD Operations

- `POST /asset-depreciation` - Create a new asset depreciation record
- `GET /asset-depreciation` - Get all asset depreciation records with optional filters
- `GET /asset-depreciation/:id` - Get a specific asset by ID
- `PATCH /asset-depreciation/:id` - Update an asset depreciation record
- `DELETE /asset-depreciation/:id` - Delete an asset depreciation record

### Specialized Depreciation Endpoints

- `GET /asset-depreciation/current-values` - Get current depreciated values for all assets
- `GET /asset-depreciation/:id/current-value` - Get current depreciated value for a specific asset
- `GET /asset-depreciation/summary` - Get depreciation summary statistics
- `GET /asset-depreciation/fully-depreciated` - Get all fully depreciated assets
- `GET /asset-depreciation/nearing-end-of-life?threshold=1` - Get assets nearing end of useful life
- `GET /asset-depreciation/:id/projected-value?date=2025-12-31` - Get projected value at a future date

## Data Transfer Objects (DTOs)

### CreateAssetDepreciationDto
```typescript
{
  assetName: string;           // Required, max 255 chars
  description?: string;        // Optional description
  purchasePrice: number;       // Required, positive number with max 2 decimal places
  purchaseDate: string;        // Required, ISO date string (YYYY-MM-DD)
  usefulLifeYears: number;     // Required, 1-100 years
  depreciationMethod?: DepreciationMethod; // Optional, defaults to STRAIGHT_LINE
  salvageValue?: number;       // Optional, must be less than purchase price
}
```

### UpdateAssetDepreciationDto
All fields are optional versions of CreateAssetDepreciationDto fields.

### DepreciatedValueResponseDto
```typescript
{
  id: number;
  assetName: string;
  description?: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  salvageValue?: number;
  currentDepreciatedValue: number;    // Calculated field
  annualDepreciation: number;         // Calculated field
  totalDepreciationToDate: number;    // Calculated field
  remainingUsefulLife: number;        // Calculated field
  isFullyDepreciated: boolean;        // Calculated field
  createdAt: Date;
  updatedAt: Date;
}
```

## Entity Methods

The `AssetDepreciation` entity provides several calculation methods:

- `getCurrentDepreciatedValue()`: Returns current value after depreciation
- `getAnnualDepreciation()`: Returns annual depreciation amount
- `getTotalDepreciationToDate()`: Returns total depreciation to current date
- `getRemainingUsefulLife()`: Returns remaining years of useful life
- `isFullyDepreciated()`: Returns true if asset is fully depreciated

## Usage Examples

### Creating an Asset
```typescript
POST /asset-depreciation
{
  "assetName": "Dell Laptop",
  "description": "Development laptop for engineering team",
  "purchasePrice": 15000,
  "purchaseDate": "2023-01-01",
  "usefulLifeYears": 5,
  "salvageValue": 2000
}
```

### Getting Current Depreciated Value
```typescript
GET /asset-depreciation/1/current-value

Response:
{
  "id": 1,
  "assetName": "Dell Laptop",
  "purchasePrice": 15000,
  "currentDepreciatedValue": 12400,
  "annualDepreciation": 2600,
  "totalDepreciationToDate": 2600,
  "remainingUsefulLife": 4,
  "isFullyDepreciated": false,
  // ... other fields
}
```

### Getting Assets with Filters
```typescript
GET /asset-depreciation?isFullyDepreciated=false&minValue=10000&maxValue=50000
```

### Getting Summary Statistics
```typescript
GET /asset-depreciation/summary

Response:
{
  "totalAssets": 10,
  "totalPurchaseValue": 150000,
  "totalCurrentValue": 85000,
  "totalDepreciation": 65000,
  "fullyDepreciatedAssets": 2,
  "averageAge": 2.5
}
```

## Validation Rules

- Purchase date cannot be in the future
- Salvage value must be less than purchase price
- Useful life must be between 1 and 100 years
- Purchase price must be positive
- Asset names must be unique (database constraint)

## Depreciation Formula

The straight-line depreciation uses this formula:

```
Annual Depreciation = (Purchase Price - Salvage Value) / Useful Life Years
Current Value = Purchase Price - (Annual Depreciation × Years Elapsed)
```

The current value will never go below the salvage value, ensuring realistic depreciation calculations.

## Testing

Run tests with:
```bash
npm test -- asset-depreciation.service.spec.ts
```

The test suite covers:
- CRUD operations with validation
- Depreciation calculations
- Edge cases (fully depreciated assets, zero salvage value)
- Error handling and exceptions
- Service business logic
