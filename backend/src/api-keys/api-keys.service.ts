import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as crypto from "crypto"
import * as bcrypt from "bcrypt"
import { ApiKey, ApiKeyScope } from "./entities/api-key.entity"
import { CreateApiKeyDto } from "./dto/create-api-key.dto"
import { UpdateApiKeyDto } from "./dto/update-api-key.dto"
import { RevokeApiKeyDto } from "./dto/revoke-api-key.dto"
import { QueryApiKeysDto } from "./dto/query-api-keys.dto"
import { ApiKeyResponseDto, CreateApiKeyResponseDto } from "./dto/api-key-response.dto"

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Generate a new API key
   */
  async generateApiKey(
    createApiKeyDto: CreateApiKeyDto,
    ownerId: string,
  ): Promise<CreateApiKeyResponseDto> {
    // Generate a secure random API key
    const rawKey = this.generateSecureKey()
    const keyHash = await this.hashKey(rawKey)

    // Validate expiration date
    if (createApiKeyDto.expirationDate) {
      const expirationDate = new Date(createApiKeyDto.expirationDate)
      if (expirationDate <= new Date()) {
        throw new BadRequestException("Expiration date must be in the future")
      }
    }

    // Create the API key entity
    const apiKey = this.apiKeyRepository.create({
      ...createApiKeyDto,
      keyHash,
      ownerId,
      expirationDate: createApiKeyDto.expirationDate
        ? new Date(createApiKeyDto.expirationDate)
        : null,
    })

    const savedApiKey = await this.apiKeyRepository.save(apiKey)

    // Return the response with the raw key (only time it's exposed)
    return {
      ...this.mapToResponseDto(savedApiKey),
      key: rawKey,
    }
  }

  /**
   * Get all API keys for a user
   */
  async findAllForUser(
    ownerId: string,
    queryDto: QueryApiKeysDto = {},
  ): Promise<ApiKeyResponseDto[]> {
    const queryBuilder = this.apiKeyRepository
      .createQueryBuilder("apiKey")
      .where("apiKey.ownerId = :ownerId", { ownerId })

    // Apply filters
    if (queryDto.name) {
      queryBuilder.andWhere("apiKey.name ILIKE :name", {
        name: `%${queryDto.name}%`,
      })
    }

    if (queryDto.scope) {
      queryBuilder.andWhere(":scope = ANY(apiKey.scopes)", {
        scope: queryDto.scope,
      })
    }

    if (queryDto.revoked !== undefined) {
      queryBuilder.andWhere("apiKey.revoked = :revoked", {
        revoked: queryDto.revoked,
      })
    }

    if (queryDto.expired !== undefined) {
      const now = new Date()
      if (queryDto.expired) {
        queryBuilder.andWhere(
          "apiKey.expirationDate IS NOT NULL AND apiKey.expirationDate < :now",
          { now },
        )
      } else {
        queryBuilder.andWhere(
          "apiKey.expirationDate IS NULL OR apiKey.expirationDate >= :now",
          { now },
        )
      }
    }

    queryBuilder.orderBy("apiKey.createdAt", "DESC")

    const apiKeys = await queryBuilder.getMany()
    return apiKeys.map(this.mapToResponseDto)
  }

  /**
   * Get a specific API key by ID
   */
  async findOne(id: string, ownerId: string): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, ownerId },
    })

    if (!apiKey) {
      throw new NotFoundException("API key not found")
    }

    return this.mapToResponseDto(apiKey)
  }

  /**
   * Update an API key
   */
  async update(
    id: string,
    updateApiKeyDto: UpdateApiKeyDto,
    ownerId: string,
  ): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, ownerId },
    })

    if (!apiKey) {
      throw new NotFoundException("API key not found")
    }

    if (apiKey.revoked) {
      throw new BadRequestException("Cannot update a revoked API key")
    }

    // Validate expiration date if provided
    if (updateApiKeyDto.expirationDate) {
      const expirationDate = new Date(updateApiKeyDto.expirationDate)
      if (expirationDate <= new Date()) {
        throw new BadRequestException("Expiration date must be in the future")
      }
      updateApiKeyDto.expirationDate = expirationDate.toISOString()
    }

    Object.assign(apiKey, updateApiKeyDto)
    const updatedApiKey = await this.apiKeyRepository.save(apiKey)

    return this.mapToResponseDto(updatedApiKey)
  }

  /**
   * Revoke an API key
   */
  async revoke(
    id: string,
    revokeDto: RevokeApiKeyDto,
    ownerId: string,
    revokedBy: string,
  ): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, ownerId },
    })

    if (!apiKey) {
      throw new NotFoundException("API key not found")
    }

    if (apiKey.revoked) {
      throw new BadRequestException("API key is already revoked")
    }

    apiKey.revoked = true
    apiKey.revokedAt = new Date()
    apiKey.revokedBy = revokedBy
    apiKey.revokedReason = revokeDto.reason

    const revokedApiKey = await this.apiKeyRepository.save(apiKey)
    return this.mapToResponseDto(revokedApiKey)
  }

  /**
   * Reactivate a revoked API key
   */
  async reactivate(id: string, ownerId: string): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, ownerId },
    })

    if (!apiKey) {
      throw new NotFoundException("API key not found")
    }

    if (!apiKey.revoked) {
      throw new BadRequestException("API key is not revoked")
    }

    // Check if the key is expired
    if (apiKey.expirationDate && apiKey.expirationDate < new Date()) {
      throw new BadRequestException("Cannot reactivate an expired API key")
    }

    apiKey.revoked = false
    apiKey.revokedAt = null
    apiKey.revokedBy = null
    apiKey.revokedReason = null

    const reactivatedApiKey = await this.apiKeyRepository.save(apiKey)
    return this.mapToResponseDto(reactivatedApiKey)
  }

  /**
   * Delete an API key permanently
   */
  async remove(id: string, ownerId: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, ownerId },
    })

    if (!apiKey) {
      throw new NotFoundException("API key not found")
    }

    await this.apiKeyRepository.remove(apiKey)
  }

  /**
   * Validate an API key and return the associated user info
   */
  async validateApiKey(rawKey: string): Promise<{
    isValid: boolean
    apiKey?: ApiKey
    user?: any
  }> {
    if (!rawKey || !rawKey.startsWith("ak_")) {
      return { isValid: false }
    }

    // Find all non-revoked API keys and check against the hash
    const apiKeys = await this.apiKeyRepository.find({
      where: { revoked: false },
      relations: ["owner"],
    })

    for (const apiKey of apiKeys) {
      const isMatch = await bcrypt.compare(rawKey, apiKey.keyHash)
      if (isMatch) {
        // Check if the key is expired
        if (apiKey.expirationDate && apiKey.expirationDate < new Date()) {
          return { isValid: false }
        }

        // Update usage statistics
        await this.updateUsageStats(apiKey.id)

        return {
          isValid: true,
          apiKey,
          user: apiKey.owner,
        }
      }
    }

    return { isValid: false }
  }

  /**
   * Check if an API key has the required scope
   */
  hasScope(apiKey: ApiKey, requiredScope: ApiKeyScope): boolean {
    return (
      apiKey.scopes.includes(ApiKeyScope.ADMIN) ||
      apiKey.scopes.includes(requiredScope)
    )
  }

  /**
   * Generate a secure API key
   */
  private generateSecureKey(): string {
    const randomBytes = crypto.randomBytes(32)
    const key = randomBytes.toString("hex")
    return `ak_${key}`
  }

  /**
   * Hash an API key for secure storage
   */
  private async hashKey(key: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(key, saltRounds)
  }

  /**
   * Update usage statistics for an API key
   */
  private async updateUsageStats(apiKeyId: string): Promise<void> {
    await this.apiKeyRepository.update(apiKeyId, {
      lastUsedAt: new Date(),
      usageCount: () => "usage_count + 1",
    })
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(apiKey: ApiKey): ApiKeyResponseDto {
    return {
      id: apiKey.id,
      name: apiKey.name,
      description: apiKey.description,
      ownerId: apiKey.ownerId,
      scopes: apiKey.scopes,
      expirationDate: apiKey.expirationDate,
      revoked: apiKey.revoked,
      revokedAt: apiKey.revokedAt,
      revokedReason: apiKey.revokedReason,
      lastUsedAt: apiKey.lastUsedAt,
      usageCount: apiKey.usageCount,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    }
  }
}
