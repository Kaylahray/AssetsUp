import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

export enum ApprovalActionType {
  DISPOSAL = "disposal",
  TRANSFER = "transfer",
  ONBOARDING = "onboarding",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

@Entity("approval_requests")
export class ApprovalRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: ApprovalActionType,
  })
  actionType: ApprovalActionType

  @Column()
  resourceId: string

  @Column()
  resourceType: string

  @Column()
  requestedBy: string

  @Column({
    type: "enum",
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus

  @Column({ nullable: true })
  reviewedBy?: string

  @Column({ nullable: true })
  decisionDate?: Date

  @Column({ type: "text", nullable: true })
  comments?: string

  @Column({ type: "text", nullable: true })
  requestReason?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
