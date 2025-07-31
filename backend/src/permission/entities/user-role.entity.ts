import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: true })
export class UserRole {
  @ApiProperty({
    description: 'Unique identifier for the user-role assignment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the user assigned to this role',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'ID of the role assigned to the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  roleId: string;

  @ApiProperty({
    description: 'Role details',
    type: () => Role,
  })
  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ApiProperty({
    description: 'ID of the user who assigned this role',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @Column({ nullable: true })
  assignedBy?: string;

  @ApiProperty({
    description: 'Date when this role assignment expires',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Whether this role assignment is currently active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the role was assigned',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the assignment was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
