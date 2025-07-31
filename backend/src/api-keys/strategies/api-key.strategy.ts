import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-custom"
import { ApiKeysService } from "../api-keys.service"

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, "api-key") {
  constructor(private readonly apiKeysService: ApiKeysService) {
    super()
  }

  async validate(req: any): Promise<any> {
    const apiKey = this.extractApiKeyFromRequest(req)
    
    if (!apiKey) {
      throw new UnauthorizedException("API key is required")
    }

    const validation = await this.apiKeysService.validateApiKey(apiKey)
    
    if (!validation.isValid || !validation.apiKey || !validation.user) {
      throw new UnauthorizedException("Invalid or expired API key")
    }

    // Return user info with API key context
    return {
      id: validation.user.id,
      email: validation.user.email,
      name: validation.user.name,
      role: validation.user.role,
      apiKey: validation.apiKey,
      authType: "api-key",
    }
  }

  private extractApiKeyFromRequest(req: any): string | null {
    // Check Authorization header with Bearer token
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      // Check if it's an API key (starts with ak_)
      if (token.startsWith("ak_")) {
        return token
      }
    }

    // Check X-API-Key header
    const apiKeyHeader = req.headers["x-api-key"]
    if (apiKeyHeader && typeof apiKeyHeader === "string") {
      return apiKeyHeader
    }

    // Check query parameter
    const apiKeyQuery = req.query["api_key"]
    if (apiKeyQuery && typeof apiKeyQuery === "string") {
      return apiKeyQuery
    }

    return null
  }
}
