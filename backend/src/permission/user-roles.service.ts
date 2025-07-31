import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { Role } from './entities/role.entity';
import { AssignRoleDto, BulkAssignRoleDto, UpdateRoleAssignmentDto } from './dto/assign-role.dto';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * Assign a role to a user
   */
  async assignRole(
    assignRoleDto: AssignRoleDto,
    assignedBy: string,
  ): Promise<UserRole> {
    const { userId, roleId, expiresAt } = assignRoleDto;

    // Check if role exists and is active
    const role = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found or inactive');
    }

    // Check if user already has this role
    const existingAssignment = await this.userRoleRepository.findOne({
      where: { userId, roleId, isActive: true },
    });

    if (existingAssignment) {
      throw new ConflictException('User already has this role assigned');
    }

    // Validate expiration date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      throw new BadRequestException('Expiration date must be in the future');
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
      assignedBy,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return this.userRoleRepository.save(userRole);
  }

  /**
   * Assign a role to multiple users
   */
  async bulkAssignRole(
    bulkAssignDto: BulkAssignRoleDto,
    assignedBy: string,
  ): Promise<UserRole[]> {
    const { userIds, roleId, expiresAt } = bulkAssignDto;

    // Check if role exists and is active
    const role = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found or inactive');
    }

    // Check for existing assignments
    const existingAssignments = await this.userRoleRepository.find({
      where: {
        userId: In(userIds),
        roleId,
        isActive: true,
      },
    });

    if (existingAssignments.length > 0) {
      const existingUserIds = existingAssignments.map(assignment => assignment.userId);
      throw new ConflictException(
        `Some users already have this role assigned: ${existingUserIds.join(', ')}`
      );
    }

    // Validate expiration date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      throw new BadRequestException('Expiration date must be in the future');
    }

    const userRoles = userIds.map(userId =>
      this.userRoleRepository.create({
        userId,
        roleId,
        assignedBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
    );

    return this.userRoleRepository.save(userRoles);
  }

  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId, isActive: true },
    });

    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.userRoleRepository.remove(userRole);
  }

  /**
   * Update a role assignment
   */
  async updateRoleAssignment(
    assignmentId: string,
    updateDto: UpdateRoleAssignmentDto,
  ): Promise<UserRole> {
    const assignment = await this.userRoleRepository.findOne({
      where: { id: assignmentId },
      relations: ['role'],
    });

    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }

    // Validate expiration date if provided
    if (updateDto.expiresAt && new Date(updateDto.expiresAt) <= new Date()) {
      throw new BadRequestException('Expiration date must be in the future');
    }

    Object.assign(assignment, {
      ...updateDto,
      expiresAt: updateDto.expiresAt ? new Date(updateDto.expiresAt) : assignment.expiresAt,
    });

    return this.userRoleRepository.save(assignment);
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['role', 'role.permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all users with a specific role
   */
  async getUsersWithRole(roleId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { roleId, isActive: true },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all role assignments with optional filtering
   */
  async getAllAssignments(filters?: {
    userId?: string;
    roleId?: string;
    isActive?: boolean;
    includeExpired?: boolean;
  }): Promise<UserRole[]> {
    const queryBuilder = this.userRoleRepository
      .createQueryBuilder('userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    if (filters?.userId) {
      queryBuilder.andWhere('userRole.userId = :userId', { userId: filters.userId });
    }

    if (filters?.roleId) {
      queryBuilder.andWhere('userRole.roleId = :roleId', { roleId: filters.roleId });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('userRole.isActive = :isActive', { isActive: filters.isActive });
    }

    if (!filters?.includeExpired) {
      queryBuilder.andWhere(
        '(userRole.expiresAt IS NULL OR userRole.expiresAt > :now)',
        { now: new Date() }
      );
    }

    return queryBuilder
      .orderBy('userRole.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Check if a user has a specific role
   */
  async userHasRole(userId: string, roleId: string): Promise<boolean> {
    const assignment = await this.userRoleRepository.findOne({
      where: { userId, roleId, isActive: true },
    });

    if (!assignment) {
      return false;
    }

    // Check if assignment is expired
    if (assignment.expiresAt && assignment.expiresAt <= new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Get user permissions from all assigned roles
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      // Skip expired assignments
      if (userRole.expiresAt && userRole.expiresAt <= new Date()) {
        continue;
      }

      if (userRole.role?.permissions) {
        userRole.role.permissions.forEach(permission => {
          if (permission.isActive) {
            permissions.add(permission.name);
          }
        });
      }
    }

    return Array.from(permissions);
  }

  /**
   * Clean up expired role assignments
   */
  async cleanupExpiredAssignments(): Promise<number> {
    const expiredAssignments = await this.userRoleRepository.find({
      where: {
        isActive: true,
      },
    });

    const now = new Date();
    const toDeactivate = expiredAssignments.filter(
      assignment => assignment.expiresAt && assignment.expiresAt <= now
    );

    if (toDeactivate.length > 0) {
      await this.userRoleRepository.update(
        { id: In(toDeactivate.map(a => a.id)) },
        { isActive: false }
      );
    }

    return toDeactivate.length;
  }
}
