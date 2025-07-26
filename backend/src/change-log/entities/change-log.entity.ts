import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ChangeLogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity('change_logs')
@Index(['entityType', 'entityId'])
@Index(['userId'])
@Index(['createdAt'])
export class ChangeLog {
  @ApiProperty({ description: 'Unique identifier for the change log entry' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Type of entity that was changed (e.g., "User", "Asset", "Insurance")' })
  @Column()
  @Index()
  entityType: string;

  @ApiProperty({ description: 'ID of the entity that was changed' })
  @Column()
  entityId: string;

  @ApiProperty({ enum: ChangeLogAction, description: 'Type of action performed' })
  @Column({ type: 'enum', enum: ChangeLogAction })
  action: ChangeLogAction;

  @ApiProperty({ description: 'ID of the user who made the change' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Name of the user who made the change' })
  @Column()
  userName: string;

  @ApiProperty({ description: 'Values before the change (JSON)', required: false })
  @Column({ type: 'jsonb', nullable: true })
  oldValues?: Record<string, any>;

  @ApiProperty({ description: 'Values after the change (JSON)', required: false })
  @Column({ type: 'jsonb', nullable: true })
  newValues?: Record<string, any>;

  @ApiProperty({ description: 'List of fields that were changed', type: [String], required: false })
  @Column({ type: 'simple-array', nullable: true })
  changedFields?: string[];

  @ApiProperty({ description: 'Additional metadata about the change', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'IP address of the user who made the change', required: false })
  @Column({ nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent of the client that made the change', required: false })
  @Column({ nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'Timestamp when the change was made' })
  @CreateDateColumn()
  createdAt: Date;
}