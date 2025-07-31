import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { ApiKeysService } from "./api-keys.service"
import { CreateApiKeyDto } from "./dto/create-api-key.dto"
import { UpdateApiKeyDto } from "./dto/update-api-key.dto"
import { RevokeApiKeyDto } from "./dto/revoke-api-key.dto"
import { QueryApiKeysDto } from "./dto/query-api-keys.dto"
import { ApiKeyResponseDto, CreateApiKeyResponseDto } from "./dto/api-key-response.dto"

@ApiTags("api-keys")
@Controller("api-keys")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: "Generate a new API key",
    description: "Creates a new API key with specified scopes and expiration",
  })
  @ApiResponse({
    status: 201,
    description: "API key created successfully",
    type: CreateApiKeyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async create(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @Request() req: any,
  ): Promise<CreateApiKeyResponseDto> {
    return this.apiKeysService.generateApiKey(createApiKeyDto, req.user.id)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: "List API keys",
    description: "Get all API keys for the authenticated user with optional filtering",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Filter by API key name (partial match)",
  })
  @ApiQuery({
    name: "scope",
    required: false,
    description: "Filter by scope",
    enum: ["read", "write", "admin"],
  })
  @ApiQuery({
    name: "revoked",
    required: false,
    description: "Filter by revoked status",
    type: Boolean,
  })
  @ApiQuery({
    name: "expired",
    required: false,
    description: "Filter by expired status",
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: "API keys retrieved successfully",
    type: [ApiKeyResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findAll(
    @Query() queryDto: QueryApiKeysDto,
    @Request() req: any,
  ): Promise<ApiKeyResponseDto[]> {
    return this.apiKeysService.findAllForUser(req.user.id, queryDto)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: "Get API key by ID",
    description: "Retrieve a specific API key by its ID",
  })
  @ApiParam({
    name: "id",
    description: "API key ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: 200,
    description: "API key retrieved successfully",
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "API key not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findOne(
    @Param("id") id: string,
    @Request() req: any,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.findOne(id, req.user.id)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: "Update API key",
    description: "Update an existing API key's properties",
  })
  @ApiParam({
    name: "id",
    description: "API key ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: 200,
    description: "API key updated successfully",
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or key is revoked",
  })
  @ApiResponse({
    status: 404,
    description: "API key not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async update(
    @Param("id") id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @Request() req: any,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.update(id, updateApiKeyDto, req.user.id)
  }

  @Post(":id/revoke")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: "Revoke API key",
    description: "Revoke an API key, making it unusable",
  })
  @ApiParam({
    name: "id",
    description: "API key ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: 200,
    description: "API key revoked successfully",
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "API key is already revoked",
  })
  @ApiResponse({
    status: 404,
    description: "API key not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async revoke(
    @Param("id") id: string,
    @Body() revokeDto: RevokeApiKeyDto,
    @Request() req: any,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.revoke(id, revokeDto, req.user.id, req.user.id)
  }

  @Post(":id/reactivate")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: "Reactivate API key",
    description: "Reactivate a previously revoked API key",
  })
  @ApiParam({
    name: "id",
    description: "API key ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: 200,
    description: "API key reactivated successfully",
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "API key is not revoked or is expired",
  })
  @ApiResponse({
    status: 404,
    description: "API key not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async reactivate(
    @Param("id") id: string,
    @Request() req: any,
  ): Promise<ApiKeyResponseDto> {
    return this.apiKeysService.reactivate(id, req.user.id)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: "Delete API key",
    description: "Permanently delete an API key",
  })
  @ApiParam({
    name: "id",
    description: "API key ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: 204,
    description: "API key deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "API key not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async remove(@Param("id") id: string, @Request() req: any): Promise<void> {
    return this.apiKeysService.remove(id, req.user.id)
  }
}
