import { SetMetadata } from "@nestjs/common"
import { ApiKeyScope } from "../entities/api-key.entity"

export const ApiKeyScopes = (...scopes: ApiKeyScope[]) => SetMetadata("api-key-scopes", scopes)
