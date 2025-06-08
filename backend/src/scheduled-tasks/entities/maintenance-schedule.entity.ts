import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum MaintenanceType {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  PREDICTIVE = "predictive",
}

export enum MaintenancePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

@Entity("maintenance_schedules")
export class MaintenanceSchedule {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  assetId: string

  @Column({ length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: MaintenanceType,
  })
  type: MaintenanceType

  @Column({
    type: "enum",
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  priority: MaintenancePriority

  @Column({ type: "date" })
  scheduledDate: Date

  @Column({ type: "date", nullable: true })
  completedDate: Date

  @Column({ length: 255, nullable: true })
  assignedTo: string

  @Column({ type: "integer", default: 240 }) // minutes
  estimatedDuration: number

  @Column({ type: "integer", default: 7 }) // days before due date
  reminderDaysBefore: number

  @Column({ default: false })
  isCompleted: boolean

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "jsonb", nullable: true })
  checklist: string[]

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
