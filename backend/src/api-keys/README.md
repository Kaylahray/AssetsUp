# API Key Management Module

A comprehensive NestJS module for managing API keys with scoped permissions, secure storage, and lifecycle management.

## Features

- ✅ Secure API key generation with cryptographic randomness
- ✅ Hash-based secure storage (bcrypt with salt rounds)
- ✅ Scoped permissions (READ, WRITE, ADMIN)
- ✅ Key expiration and automatic validation
- ✅ Revocation and reactivation capabilities
- ✅ Usage tracking and statistics
- ✅ Multiple authentication methods (Bearer token, X-API-Key header, query parameter)
- ✅ Comprehensive validation and error handling
- ✅ Full test coverage
- ✅ OpenAPI/Swagger documentation
- ✅ TypeORM integration

## API Endpoints

### API Key Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/api-keys` | Generate a new API key | ADMIN, ASSET_MANAGER |
| GET | `/api-keys` | List user's API keys | ADMIN, ASSET_MANAGER |
| GET | `/api-keys/:id` | Get specific API key | ADMIN, ASSET_MANAGER |
| PATCH | `/api-keys/:id` | Update API key | ADMIN, ASSET_MANAGER |
| POST | `/api-keys/:id/revoke` | Revoke API key | ADMIN, ASSET_MANAGER |
| POST | `/api-keys/:id/reactivate` | Reactivate API key | ADMIN, ASSET_MANAGER |
| DELETE | `/api-keys/:id` | Delete API key | ADMIN, ASSET_MANAGER |

## API Key Scopes

- **READ**: Read-only access to resources
- **WRITE**: Read and write access to resources
- **ADMIN**: Full administrative access (includes all permissions)

## Authentication Methods

The API key can be provided in three ways:

1. **Authorization Header** (Recommended):
   ```
   Authorization: Bearer ak_1234567890abcdef1234567890abcdef12345678
   ```

2. **X-API-Key Header**:
   ```
   X-API-Key: ak_1234567890abcdef1234567890abcdef12345678
   ```

3. **Query Parameter**:
   ```
   GET /api/assets?api_key=ak_1234567890abcdef1234567890abcdef12345678
   ```

## Usage Examples

### Generate API Key

```typescript
POST /api-keys
{
  "name": "Production API Key",
  "description": "API key for production environment access",
  "scopes": ["read", "write"],
  "expirationDate": "2024-12-31T23:59:59.999Z"
}
```

### Using API Key for Authentication

```typescript
// Using with axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': 'Bearer ak_1234567890abcdef1234567890abcdef12345678'
  }
});

// Or using X-API-Key header
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'X-API-Key': 'ak_1234567890abcdef1234567890abcdef12345678'
  }
});
```

### Protecting Endpoints with API Key Scopes

```typescript
import { ApiKeyScopes } from '../api-keys/decorators/api-key-scopes.decorator';
import { ApiKeyScopesGuard } from '../api-keys/guards/api-key-scopes.guard';
import { JwtOrApiKeyAuthGuard } from '../api-keys/guards/jwt-or-api-key-auth.guard';

@Controller('assets')
@UseGuards(JwtOrApiKeyAuthGuard, ApiKeyScopesGuard)
export class AssetsController {
  
  @Get()
  @ApiKeyScopes(ApiKeyScope.READ)
  findAll() {
    // This endpoint requires READ scope
  }

  @Post()
  @ApiKeyScopes(ApiKeyScope.WRITE)
  create() {
    // This endpoint requires WRITE scope
  }

  @Delete(':id')
  @ApiKeyScopes(ApiKeyScope.ADMIN)
  remove() {
    // This endpoint requires ADMIN scope
  }
}
```

## Security Features

### Secure Key Generation
- Uses Node.js `crypto.randomBytes(32)` for cryptographic randomness
- Keys are prefixed with `ak_` for easy identification
- 64-character hexadecimal string provides 256 bits of entropy

### Secure Storage
- API keys are hashed using bcrypt with 12 salt rounds
- Only hashed values are stored in the database
- Raw keys are never logged or persisted

### Validation
- Automatic expiration checking
- Revocation status validation
- Scope-based permission enforcement
- Usage tracking and statistics

### Rate Limiting
- Built-in usage tracking
- Configurable rate limiting per API key (future enhancement)

## Database Schema

The ApiKey entity includes:

- `id`: UUID primary key
- `keyHash`: Bcrypt hash of the API key
- `name`: Human-readable name for the key
- `description`: Optional description
- `ownerId`: Reference to the user who owns the key
- `scopes`: Array of permission scopes
- `expirationDate`: Optional expiration timestamp
- `revoked`: Boolean revocation status
- `revokedAt`: Timestamp when revoked
- `revokedBy`: User ID who revoked the key
- `revokedReason`: Optional reason for revocation
- `lastUsedAt`: Timestamp of last usage
- `usageCount`: Number of times the key has been used
- `createdAt`: Auto-generated creation timestamp
- `updatedAt`: Auto-generated update timestamp

## Integration

### Module Import

```typescript
import { ApiKeysModule } from './api-keys/api-keys.module';

@Module({
  imports: [
    // ... other modules
    ApiKeysModule,
  ],
})
export class AppModule {}
```

### Service Injection

```typescript
import { ApiKeysService } from './api-keys/api-keys.service';

@Injectable()
export class SomeService {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async validateKey(rawKey: string) {
    return this.apiKeysService.validateApiKey(rawKey);
  }
}
```

## Error Handling

The module provides comprehensive error handling:

- `400 Bad Request`: Invalid input data, expired dates, revoked keys
- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: Insufficient permissions/scopes
- `404 Not Found`: API key not found

## Testing

Run the test suite:

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Best Practices

1. **Key Rotation**: Regularly rotate API keys
2. **Minimal Scopes**: Grant only necessary permissions
3. **Expiration**: Set appropriate expiration dates
4. **Monitoring**: Monitor usage patterns and revoke suspicious keys
5. **Secure Storage**: Never log or expose raw API keys
6. **Environment Variables**: Store API keys in environment variables, not code

## Future Enhancements

- Rate limiting per API key
- IP address restrictions
- Webhook notifications for key events
- Bulk key management operations
- Key usage analytics dashboard
