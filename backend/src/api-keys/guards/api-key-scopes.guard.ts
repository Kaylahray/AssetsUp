import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { ApiKeyScope } from "../entities/api-key.entity"

@Injectable()
export class ApiKeyScopesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<ApiKeyScope[]>("api-key-scopes", [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredScopes || requiredScopes.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    
    // If not authenticated via API key, allow (will be handled by other guards)
    if (!user || user.authType !== "api-key" || !user.apiKey) {
      return true
    }

    const userScopes = user.apiKey.scopes || []
    
    // Check if user has admin scope (grants all permissions)
    if (userScopes.includes(ApiKeyScope.ADMIN)) {
      return true
    }

    // Check if user has any of the required scopes
    const hasRequiredScope = requiredScopes.some(scope => userScopes.includes(scope))
    
    if (!hasRequiredScope) {
      throw new ForbiddenException(
        `Insufficient API key permissions. Required scopes: ${requiredScopes.join(", ")}`
      )
    }

    return true
  }
}
