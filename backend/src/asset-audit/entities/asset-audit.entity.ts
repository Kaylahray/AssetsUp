import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum AuditStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum AssetCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  DAMAGED = "damaged",
  MISSING = "missing",
}

@Entity("asset_audits")
@Index(["assetId", "auditDate"])
@Index(["auditedBy"])
@Index(["status"])
export class AssetAudit {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  @Index()
  assetId: string

  @Column({ type: "timestamp" })
  auditDate: Date

  @Column()
  auditedBy: string

  @Column({
    type: "enum",
    enum: AuditStatus,
    default: AuditStatus.PENDING,
  })
  status: AuditStatus

  @Column({
    type: "enum",
    enum: AssetCondition,
    nullable: true,
  })
  condition: AssetCondition

  @Column({ type: "text", nullable: true })
  remarks: string

  @Column({ type: "json", nullable: true })
  findings: Record<string, any>

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  estimatedValue: number

  @Column({ nullable: true })
  location: string

  @Column({ default: false })
  requiresAction: boolean

  @Column({ type: "text", nullable: true })
  actionRequired: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
