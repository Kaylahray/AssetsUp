import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Permission } from './permission.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum DefaultRole {
  ADMIN = 'Admin',
  ASSET_MANAGER = 'Asset Manager',
  DEPARTMENT_HEAD = 'Department Head',
  EMPLOYEE = 'Employee',
}

@Entity('roles')
export class Role {
  @ApiProperty({
    description: 'Unique identifier for the role',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the role',
    example: 'Asset Manager',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Manages all asset-related operations',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Whether this is a default system role that cannot be deleted',
    example: false,
  })
  @Column({ default: false })
  isDefault: boolean;

  @ApiProperty({
    description: 'Whether the role is currently active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    type: () => [Permission],
    description: 'Permissions assigned to this role',
  })
  @ManyToMany(() => Permission, (perm) => perm.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ApiProperty({
    description: 'Date when the role was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the role was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}