import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtOrApiKeyAuthGuard } from '../guards/jwt-or-api-key-auth.guard';
import { ApiKeyScopesGuard } from '../guards/api-key-scopes.guard';
import { ApiKeyScopes } from '../decorators/api-key-scopes.decorator';
import { ApiKeyScope } from '../entities/api-key.entity';

/**
 * Example of how to integrate API key authentication with existing controllers
 * This shows how to protect endpoints with both JWT and API key authentication
 * and enforce scope-based permissions for API keys
 */

@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtOrApiKeyAuthGuard, ApiKeyScopesGuard)
@ApiBearerAuth() // For JWT authentication
@ApiSecurity('api-key') // For API key authentication
export class AssetsControllerExample {
  constructor(private readonly assetsService: any) {}

  @Post()
  @ApiKeyScopes(ApiKeyScope.WRITE)
  @ApiOperation({
    summary: 'Create a new asset',
    description: 'Creates a new asset. Requires WRITE scope for API key authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asset created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - WRITE scope required',
  })
  create(@Body() createAssetDto: any) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @ApiKeyScopes(ApiKeyScope.READ)
  @ApiOperation({
    summary: 'Get all assets',
    description: 'Retrieves all assets. Requires READ scope for API key authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assets retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - READ scope required',
  })
  findAll(@Query() query: any) {
    return this.assetsService.findAll(query);
  }

  @Get(':id')
  @ApiKeyScopes(ApiKeyScope.READ)
  @ApiOperation({
    summary: 'Get asset by ID',
    description: 'Retrieves a specific asset. Requires READ scope for API key authentication.',
  })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @ApiKeyScopes(ApiKeyScope.WRITE)
  @ApiOperation({
    summary: 'Update asset',
    description: 'Updates an existing asset. Requires WRITE scope for API key authentication.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - WRITE scope required',
  })
  update(@Param('id') id: string, @Body() updateAssetDto: any) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @ApiKeyScopes(ApiKeyScope.ADMIN)
  @ApiOperation({
    summary: 'Delete asset',
    description: 'Deletes an asset. Requires ADMIN scope for API key authentication.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - ADMIN scope required',
  })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Post(':id/assign')
  @ApiKeyScopes(ApiKeyScope.WRITE)
  @ApiOperation({
    summary: 'Assign asset to user',
    description: 'Assigns an asset to a user. Requires WRITE scope for API key authentication.',
  })
  assign(@Param('id') id: string, @Body() assignDto: any) {
    return this.assetsService.assign(id, assignDto);
  }

  @Get(':id/history')
  @ApiKeyScopes(ApiKeyScope.READ)
  @ApiOperation({
    summary: 'Get asset history',
    description: 'Retrieves asset history. Requires READ scope for API key authentication.',
  })
  getHistory(@Param('id') id: string) {
    return this.assetsService.getHistory(id);
  }

  @Post('bulk-import')
  @ApiKeyScopes(ApiKeyScope.ADMIN)
  @ApiOperation({
    summary: 'Bulk import assets',
    description: 'Imports multiple assets. Requires ADMIN scope for API key authentication.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - ADMIN scope required',
  })
  bulkImport(@Body() importDto: any) {
    return this.assetsService.bulkImport(importDto);
  }
}

/**
 * Usage Examples:
 * 
 * 1. Using API Key with Authorization Header:
 *    curl -H "Authorization: Bearer ak_1234567890abcdef1234567890abcdef12345678" \
 *         http://localhost:3001/api/assets
 * 
 * 2. Using API Key with X-API-Key Header:
 *    curl -H "X-API-Key: ak_1234567890abcdef1234567890abcdef12345678" \
 *         http://localhost:3001/api/assets
 * 
 * 3. Using API Key with Query Parameter:
 *    curl "http://localhost:3001/api/assets?api_key=ak_1234567890abcdef1234567890abcdef12345678"
 * 
 * 4. Using JWT Token (existing method):
 *    curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
 *         http://localhost:3001/api/assets
 * 
 * Scope Requirements:
 * - GET endpoints: READ scope
 * - POST/PATCH endpoints: WRITE scope  
 * - DELETE/bulk operations: ADMIN scope
 * - ADMIN scope grants all permissions
 */
