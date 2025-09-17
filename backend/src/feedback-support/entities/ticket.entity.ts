import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketSource,
} from '../feedback-support.enums';
import { TicketAttachment } from './ticket-attachment.entity';

@Entity('tickets')
@Index(['userId', 'status'])
@Index(['priority', 'status'])
@Index(['category', 'status'])
@Index(['createdAt'])
@Index(['assignedTo', 'status'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  @Index()
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketCategory,
    default: TicketCategory.GENERAL_INQUIRY,
  })
  category: TicketCategory;

  @Column({
    type: 'enum',
    enum: TicketSource,
    default: TicketSource.WEB_PORTAL,
  })
  source: TicketSource;

  @Column({ name: 'assigned_to', nullable: true })
  @Index()
  assignedTo: string;

  @Column({ name: 'asset_id', nullable: true })
  @Index()
  assetId: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail: string;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy: string;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ name: 'closed_by', nullable: true })
  closedBy: string;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ name: 'first_response_at', type: 'timestamp', nullable: true })
  firstResponseAt: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'customer_satisfaction_rating', type: 'int', nullable: true })
  customerSatisfactionRating: number;

  @Column({ name: 'estimated_resolution_time', type: 'int', nullable: true })
  estimatedResolutionTime: number; // in hours

  @Column({ name: 'actual_resolution_time', type: 'int', nullable: true })
  actualResolutionTime: number; // in hours

  @OneToMany(() => TicketAttachment, (attachment) => attachment.ticket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  attachments: TicketAttachment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  get isOpen(): boolean {
    return this.status === TicketStatus.OPEN || this.status === TicketStatus.REOPENED;
  }

  get isClosed(): boolean {
    return this.status === TicketStatus.CLOSED;
  }

  get isResolved(): boolean {
    return this.status === TicketStatus.RESOLVED;
  }

  get isInProgress(): boolean {
    return this.status === TicketStatus.IN_PROGRESS;
  }

  get isPendingUser(): boolean {
    return this.status === TicketStatus.PENDING_USER;
  }

  get isHighPriority(): boolean {
    return this.priority === TicketPriority.HIGH || 
           this.priority === TicketPriority.URGENT || 
           this.priority === TicketPriority.CRITICAL;
  }

  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && !this.isClosed && !this.isResolved;
  }

  get ageInHours(): number {
    return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60));
  }

  get ageInDays(): number {
    return Math.floor(this.ageInHours / 24);
  }

  get timeToFirstResponse(): number | null {
    if (!this.firstResponseAt) return null;
    return Math.floor((this.firstResponseAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60));
  }

  get timeToResolution(): number | null {
    if (!this.resolvedAt) return null;
    return Math.floor((this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60));
  }

  get hasAttachments(): boolean {
    return this.attachments && this.attachments.length > 0;
  }

  get attachmentCount(): number {
    return this.attachments ? this.attachments.length : 0;
  }
}
