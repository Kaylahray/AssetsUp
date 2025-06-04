import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"

@Entity("scheduled_reports")
export class ScheduledReport {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  userId: string

  @ManyToOne(() => User)
  user: User

  @Column()
  reportType: string

  @Column()
  schedule: string // daily, weekly, monthly, quarterly, yearly, or cron expression

  @Column("jsonb")
  config: any

  @Column("simple-array")
  recipients: string[]

  @Column({ type: "timestamp", nullable: true })
  lastRunDate: Date

  @Column({ type: "timestamp" })
  nextRunDate: Date

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
