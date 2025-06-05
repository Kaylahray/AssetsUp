import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Asset } from "../../assets/entities/asset.entity"
import { Vendor } from "../../vendors/entities/vendor.entity"
import { User } from "../../users/entities/user.entity"

export enum MaintenanceType {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  INSPECTION = "inspection",
  EMERGENCY = "emergency",
  ROUTINE = "routine",
}

export enum MaintenanceStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

@Entity("maintenance")
export class Maintenance {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: MaintenanceType,
    default: MaintenanceType.PREVENTIVE,
  })
  type: MaintenanceType

  @Column({ type: "text" })
  description: string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  cost: number

  @Column({ type: "date" })
  startDate: Date

  @Column({ type: "date" })
  dueDate: Date

  @Column({ type: "date", nullable: true })
  completionDate: Date

  @Column({
    type: "enum",
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "int", default: 0 })
  estimatedHours: number

  @Column({ type: "int", nullable: true })
  actualHours: number

  // Relationships
  @ManyToOne(
    () => Asset,
    (asset) => asset.maintenanceRecords,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "assetId" })
  asset: Asset

  @Column({ type: "uuid" })
  assetId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "responsiblePersonId" })
  responsiblePerson: User

  @Column({ type: "uuid", nullable: true })
  responsiblePersonId: string

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: "vendorId" })
  vendor: Vendor

  @Column({ type: "uuid", nullable: true })
  vendorId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
