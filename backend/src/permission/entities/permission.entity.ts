import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionResource {
  ASSETS = 'assets',
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  AUDIT_LOGS = 'audit_logs',
  NOTIFICATIONS = 'notifications',
}

@Entity('permissions')
export class Permission {
  @ApiProperty({
    description: 'Unique identifier for the permission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the permission',
    example: 'assets:read',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Description of what this permission allows',
    example: 'Allows reading asset information',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Resource this permission applies to',
    example: 'assets',
    enum: PermissionResource,
  })
  @Column({
    type: 'enum',
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @ApiProperty({
    description: 'Action this permission allows',
    example: 'read',
    enum: PermissionAction,
  })
  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @ApiProperty({
    description: 'Additional scopes or conditions for this permission',
    example: ['own', 'department'],
    type: [String],
    required: false,
  })
  @Column('simple-array', { nullable: true })
  scopes?: string[];

  @ApiProperty({
    description: 'Whether this permission is currently active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ApiProperty({
    description: 'Date when the permission was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the permission was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}