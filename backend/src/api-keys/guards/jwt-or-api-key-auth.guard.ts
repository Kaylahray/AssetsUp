import { Injectable, ExecutionContext } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class JwtOrApiKeyAuthGuard extends AuthGuard(["jwt", "api-key"]) {
  canActivate(context: ExecutionContext) {
    // This will try JWT first, then API key if JWT fails
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, throw the error
    if (err || !user) {
      throw err || new Error("Authentication failed")
    }
    return user
  }
}
