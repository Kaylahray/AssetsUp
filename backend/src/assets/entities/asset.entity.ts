import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { MaintenanceRecord } from "../../maintenance/entities/maintenance-record.entity"
import { AssetTransfer } from "./asset-transfer.entity"
import { AssetCheckout } from "./asset-checkout.entity"
import { Branch } from "../../branches/entities/branch.entity"

export enum AssetCondition {
  NEW = "new",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
}

export enum AssetStatus {
  AVAILABLE = "available",
  ASSIGNED = "assigned",
  MAINTENANCE = "maintenance",
  RETIRED = "retired",
  CHECKED_OUT = "checked_out",
}

@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  type: string

  @Column({ unique: true })
  serialNumber: string

  @Column()
  category: string

  @Column({
    type: "enum",
    enum: AssetCondition,
    default: AssetCondition.NEW,
  })
  condition: AssetCondition

  @Column()
  location: string

  @Column()
  department: string

  @Column({ type: "date" })
  purchaseDate: Date

  @Column({ type: "decimal", precision: 10, scale: 2 })
  purchasePrice: number

  @Column({ type: "date", nullable: true })
  warrantyExpiration: Date

  @ManyToOne(
    () => User,
    (user) => user.assignedAssets,
    { nullable: true },
  )
  @JoinColumn({ name: "assignedToId" })
  assignedTo: User

  @Column({ nullable: true })
  assignedToId: string

  @Column({
    type: "enum",
    enum: AssetStatus,
    default: AssetStatus.AVAILABLE,
  })
  status: AssetStatus

  @Column({ type: "text", nullable: true })
  notes: string

  @Column("text", { array: true, nullable: true })
  images: string[]

  @Column("text", { array: true, nullable: true })
  documents: string[]

  @Column({ nullable: true })
  qrCode: string

  @Column({ nullable: true })
  assetTag: string

  @Column({ nullable: true })
  onChainId: string

  @ManyToOne(
    () => Branch,
    (branch) => branch.assets,
    { nullable: true },
  )
  @JoinColumn({ name: "branchId" })
  branch: Branch

  @Column({ nullable: true })
  branchId: string

  @OneToMany(
    () => MaintenanceRecord,
    (record) => record.asset,
  )
  maintenanceRecords: MaintenanceRecord[]

  @OneToMany(
    () => AssetTransfer,
    (transfer) => transfer.asset,
  )
  transfers: AssetTransfer[]

  @OneToMany(
    () => AssetCheckout,
    (checkout) => checkout.asset,
  )
  checkouts: AssetCheckout[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
