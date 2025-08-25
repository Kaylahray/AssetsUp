import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum MaintenanceFrequency {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMI_ANNUALLY = "semi-annually",
  ANNUALLY = "annually",
  CUSTOM = "custom",
}

export enum ScheduleStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  COMPLETED = "completed",
  OVERDUE = "overdue",
}

@Entity("maintenance_schedules")
export class MaintenanceSchedule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "asset_id", nullable: true })
  assetId: string;

  @Column({ name: "asset_name", nullable: true })
  assetName: string;

  @Column({
    type: "enum",
    enum: MaintenanceFrequency,
    default: MaintenanceFrequency.MONTHLY,
  })
  frequency: MaintenanceFrequency;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column({ type: "timestamp" })
  scheduleDate: Date;

  @Column({ name: "custom_interval_days", nullable: true })
  customIntervalDays: number;

  @Column({ name: "next_maintenance_date", type: "timestamp" })
  nextMaintenanceDate: Date;

  @Column({ name: "last_maintenance_date", type: "timestamp", nullable: true })
  lastMaintenanceDate: Date;

  @Column({
    type: "enum",
    enum: ScheduleStatus,
    default: ScheduleStatus.ACTIVE,
  })
  status: ScheduleStatus;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ name: "maintenance_description", nullable: true })
  maintenanceDescription: string;

  @Column({
    name: "estimated_duration_hours",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  estimatedDurationHours: number;

  @Column({ name: "priority_level", type: "int", default: 1 })
  priorityLevel: number; // 1 = Low, 2 = Medium, 3 = High, 4 = Critical

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
