import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException, Logger } from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import type { Repository } from "typeorm"
import type { User } from "../../users/entities/user.entity"

@Injectable()
export class BranchGuard implements CanActivate {
  private readonly logger = new Logger(BranchGuard.name)

  constructor(
    private reflector: Reflector,
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const branchId = request.params.id

    this.logger.log(`Checking branch access for user ${user.id} to branch ${branchId}`)

    // Admin users can access all branches
    if (user.role === "admin") {
      this.logger.log(`Admin user ${user.id} granted access to branch ${branchId}`)
      return true
    }

    // Check if user has access to this branch
    const userWithBranches = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ["branches"],
    })

    if (!userWithBranches) {
      this.logger.warn(`User ${user.id} not found`)
      throw new ForbiddenException("User not found")
    }

    const hasAccess = userWithBranches.branches.some((branch) => branch.id === branchId)

    if (!hasAccess) {
      this.logger.warn(`User ${user.id} denied access to branch ${branchId}`)
      throw new ForbiddenException("Access denied to this branch")
    }

    this.logger.log(`User ${user.id} granted access to branch ${branchId}`)
    return true
  }
}
