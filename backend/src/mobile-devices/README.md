# Mobile Devices Module

A comprehensive module for managing company-issued mobile devices (phones, tablets, laptops, smartwatches) with tracking for warranty, OS updates, and user assignments.

## Features

- **Device Registration**: Register new mobile devices with IMEI, serial number, and detailed specifications
- **User Assignment**: Assign devices to employees with assignment tracking
- **Warranty Tracking**: Monitor warranty expiration dates and provider information
- **OS Update Management**: Track OS versions and available updates
- **Device Lifecycle**: Complete lifecycle management from registration to decommissioning
- **Insurance Tracking**: Monitor insurance coverage and expiration
- **Advanced Filtering**: Search and filter devices by various criteria
- **Statistics**: Comprehensive device statistics and reporting
- **Role-based Access**: Secure access control with different permission levels

## Entity Structure

### MobileDevice Entity

The core entity includes the following key fields:

- **Basic Information**: name, description, model, manufacturer
- **Identification**: IMEI (unique), serial number (unique)
- **Device Type**: phone, tablet, laptop, smartwatch
- **Operating System**: android, ios, windows, macos, linux
- **Status**: available, assigned, maintenance, decommissioned, lost, stolen
- **User Assignment**: assigned user, assignment date, return date, notes
- **Warranty Information**: expiry date, provider, terms
- **Insurance Information**: provider, expiry date, value
- **OS Management**: current version, last update, available updates
- **Location**: physical location and department assignment

## API Endpoints

### Device Management

- `POST /mobile-devices` - Register a new device
- `GET /mobile-devices` - List devices with filtering and pagination
- `GET /mobile-devices/:id` - Get device by ID
- `GET /mobile-devices/imei/:imei` - Get device by IMEI
- `GET /mobile-devices/serial/:serialNumber` - Get device by serial number
- `PATCH /mobile-devices/:id` - Update device information
- `DELETE /mobile-devices/:id` - Remove device

### User Assignment

- `PATCH /mobile-devices/:id/assign` - Assign device to user
- `PATCH /mobile-devices/:id/unassign` - Unassign device from user
- `GET /mobile-devices/my-devices` - Get current user's assigned devices
- `GET /mobile-devices/by-user/:userId` - Get devices assigned to specific user

### OS Management

- `PATCH /mobile-devices/:id/os-update` - Update OS version
- `PATCH /mobile-devices/:id/mark-os-update-available` - Mark OS update as available
- `GET /mobile-devices/needing-os-update` - Get devices needing OS updates

### Device Lifecycle

- `PATCH /mobile-devices/:id/decommission` - Decommission device
- `GET /mobile-devices/by-status/:status` - Get devices by status

### Reporting & Analytics

- `GET /mobile-devices/statistics` - Get device statistics
- `GET /mobile-devices/expiring-warranty` - Get devices with expiring warranty
- `GET /mobile-devices/expiring-insurance` - Get devices with expiring insurance
- `GET /mobile-devices/by-department/:department` - Get devices by department

## Query Parameters

The main listing endpoint supports extensive filtering:

- `search` - Search in name, model, manufacturer, IMEI, serial number
- `status` - Filter by device status
- `deviceType` - Filter by device type (phone, tablet, laptop, smartwatch)
- `operatingSystem` - Filter by OS (android, ios, windows, macos, linux)
- `assignedUserId` - Filter by assigned user
- `department` - Filter by department
- `location` - Filter by location
- `manufacturer` - Filter by manufacturer
- `model` - Filter by model
- `warrantyExpiryBefore/After` - Filter by warranty expiry date range
- `insuranceExpiryBefore/After` - Filter by insurance expiry date range
- `page` - Page number for pagination
- `limit` - Items per page
- `sortBy` - Sort field
- `sortOrder` - Sort direction (ASC/DESC)

## Usage Examples

### Register a New Device

```typescript
const newDevice = {
  name: "iPhone 13 Pro",
  model: "iPhone 13 Pro",
  manufacturer: "Apple",
  imei: "123456789012345",
  serialNumber: "SN123456789",
  operatingSystem: "ios",
  osVersion: "15.0",
  deviceType: "phone",
  purchasePrice: 999.99,
  purchaseCurrency: "USD",
  purchaseDate: "2023-01-15",
  warrantyExpiry: "2025-01-15",
  warrantyProvider: "Apple Care",
  phoneNumber: "+1234567890",
  carrier: "Verizon",
  dataPlan: "Unlimited",
  location: "Main Office",
  department: "IT",
  notes: "Assigned to development team"
};
```

### Assign Device to User

```typescript
const assignment = {
  userId: "user-uuid",
  notes: "Assigned for mobile development work"
};
```

### Update OS Version

```typescript
const osUpdate = {
  osVersion: "15.1"
};
```

### Decommission Device

```typescript
const decommission = {
  reason: "End of life cycle - device replacement"
};
```

## Security & Permissions

The module implements role-based access control:

- **Admin**: Full access to all operations
- **Manager**: Can register, update, assign, and decommission devices
- **Employee**: Can view assigned devices and basic device information

## Database Schema

The module creates a `mobile_devices` table with:

- Unique indexes on IMEI and serial number
- Foreign key relationship to users table for assignments
- Comprehensive audit fields (created_at, updated_at)
- Enum fields for status, device type, and operating system

## Testing

The module includes comprehensive test coverage:

- **Unit Tests**: Service method testing with mocked repository
- **E2E Tests**: Complete API endpoint testing
- **Integration Tests**: Database integration testing

## Dependencies

- TypeORM for database operations
- Class-validator for DTO validation
- Class-transformer for data transformation
- NestJS guards for authentication and authorization

## Future Enhancements

- QR code generation for device identification
- Bulk import/export functionality
- Integration with MDM (Mobile Device Management) systems
- Automated OS update notifications
- Device health monitoring
- Integration with warranty claim systems 