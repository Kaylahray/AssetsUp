import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Branch } from "../entities/branch.entity"

@Injectable()
export class BranchOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(BranchOwnershipGuard.name)

  constructor(private branchRepository: Repository<Branch>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const branchId = request.params.id

    this.logger.log(`Checking branch ownership for user ${user.id} to branch ${branchId}`)

    // Admin users can manage all branches
    if (user.role === "admin") {
      this.logger.log(`Admin user ${user.id} granted ownership access to branch ${branchId}`)
      return true
    }

    // Check if user is the manager of this branch
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    })

    if (!branch) {
      this.logger.warn(`Branch ${branchId} not found`)
      throw new ForbiddenException("Branch not found")
    }

    if (branch.managerId !== user.id) {
      this.logger.warn(`User ${user.id} is not the manager of branch ${branchId}`)
      throw new ForbiddenException("Only branch managers can perform this action")
    }

    this.logger.log(`User ${user.id} granted ownership access to branch ${branchId}`)
    return true
  }
}
