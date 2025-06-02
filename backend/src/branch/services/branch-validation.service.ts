import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Branch } from "../entities/branch.entity"
import type { User } from "../../users/entities/user.entity"

@Injectable()
export class BranchValidationService {
  constructor(
    private readonly branchRepository: Repository<Branch>,
    private readonly userRepository: Repository<User>,
  ) {}

  async validateBranchCodeUniqueness(branchCode: string, excludeId?: string): Promise<void> {
    const existingBranch = await this.branchRepository.findOne({
      where: { branchCode },
    })

    if (existingBranch && (!excludeId || existingBranch.id !== excludeId)) {
      throw new ConflictException(`Branch code '${branchCode}' already exists`)
    }
  }

  async validateManagerExists(managerId: string): Promise<User> {
    const manager = await this.userRepository.findOne({
      where: { id: managerId },
    })

    if (!manager) {
      throw new NotFoundException(`Manager with ID '${managerId}' not found`)
    }

    return manager
  }

  async validateBranchExists(branchId: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    })

    if (!branch) {
      throw new NotFoundException(`Branch with ID '${branchId}' not found`)
    }

    return branch
  }

  async validateBranchIsActive(branchId: string): Promise<void> {
    const branch = await this.validateBranchExists(branchId)

    if (!branch.isActive) {
      throw new ConflictException(`Branch '${branch.name}' is not active`)
    }
  }
}
