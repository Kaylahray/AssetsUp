import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum AssetStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  RETIRED = "retired",
}

@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column({ length: 100, unique: true })
  assetCode: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus

  @Column({ type: "date", nullable: true })
  dueDate: Date

  @Column({ type: "date", nullable: true })
  lastMaintenanceDate: Date

  @Column({ type: "date", nullable: true })
  nextMaintenanceDate: Date

  @Column({ length: 255, nullable: true })
  assignedTo: string

  @Column({ length: 255, nullable: true })
  location: string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  value: number

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
