import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  AUDIT = 'Audit',
  INSPECTION = 'Inspection',
  RENEWAL = 'Renewal',
  GENERAL = 'General',
}

@Entity('calendar_events') 
export class CalendarEvent {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: string; 

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({ type: 'timestamptz' })
  eventDate!: Date;

  @ApiProperty()
  @Column({ type: 'varchar' })
  resourceId!: string; // generic reference to any asset or resource

  @ApiProperty({ enum: EventType })
  @Column({ type: 'enum', enum: EventType })
  eventType!: EventType;

  @ApiProperty()
  @Column({ type: 'varchar' })
  createdBy!: string;

  @ApiProperty({ default: true })
  @Column({ type: 'boolean', default: true })
  visibility!: boolean;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  recurrenceRule?: string; // e.g., "FREQ=MONTHLY;COUNT=12"

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
