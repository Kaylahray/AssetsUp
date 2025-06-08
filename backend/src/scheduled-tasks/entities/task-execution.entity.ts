import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { ScheduledTask } from "./scheduled-task.entity"

export enum ExecutionStatus {
  SUCCESS = "success",
  FAILED = "failed",
  RUNNING = "running",
}

@Entity("task_executions")
export class TaskExecution {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  taskId: string

  @Column({
    type: "enum",
    enum: ExecutionStatus,
  })
  status: ExecutionStatus

  @Column({ type: "timestamp" })
  startedAt: Date

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date

  @Column({ type: "text", nullable: true })
  output: string

  @Column({ type: "text", nullable: true })
  errorMessage: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(
    () => ScheduledTask,
    (task) => task.executions,
  )
  @JoinColumn({ name: "taskId" })
  task: ScheduledTask
}
