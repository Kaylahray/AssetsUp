import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { TaskExecution } from "./task-execution.entity"

export enum TaskType {
  OVERDUE_ASSET_DETECTION = "overdue_asset_detection",
  MAINTENANCE_REMINDER = "maintenance_reminder",
  LOW_STOCK_DETECTION = "low_stock_detection",
  CUSTOM = "custom",
}

export enum TaskStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PAUSED = "paused",
}

@Entity("scheduled_tasks")
export class ScheduledTask {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: TaskType,
  })
  type: TaskType

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.ACTIVE,
  })
  status: TaskStatus

  @Column({ length: 100 })
  cronExpression: string

  @Column({ type: "jsonb", nullable: true })
  configuration: Record<string, any>

  @Column({ type: "timestamp", nullable: true })
  lastExecutedAt: Date

  @Column({ type: "timestamp", nullable: true })
  nextExecutionAt: Date

  @Column({ default: 0 })
  executionCount: number

  @Column({ default: 0 })
  failureCount: number

  @Column({ default: true })
  isEnabled: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => TaskExecution,
    (execution) => execution.task,
  )
  executions: TaskExecution[]
}
