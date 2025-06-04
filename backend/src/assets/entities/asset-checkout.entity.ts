import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Asset } from "./asset.entity"
import { User } from "../../users/entities/user.entity"

export enum CheckoutStatus {
  ACTIVE = "active",
  RETURNED = "returned",
  OVERDUE = "overdue",
}

@Entity("asset_checkouts")
export class AssetCheckout {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  assetId: string

  @ManyToOne(
    () => Asset,
    (asset) => asset.checkouts,
  )
  @JoinColumn({ name: "assetId" })
  asset: Asset

  @Column({ type: "uuid" })
  checkedOutById: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "checkedOutById" })
  checkedOutBy: User

  @Column({ type: "timestamp" })
  checkoutDate: Date

  @Column({ type: "timestamp" })
  dueDate: Date

  @Column({ type: "timestamp", nullable: true })
  returnDate: Date | null

  @Column({ type: "uuid", nullable: true })
  checkedInById: string | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "checkedInById" })
  checkedInBy: User | null

  @Column({
    type: "enum",
    enum: CheckoutStatus,
    default: CheckoutStatus.ACTIVE,
  })
  status: CheckoutStatus

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "text", nullable: true })
  purpose: string

  @Column({ type: "boolean", default: false })
  notificationSent: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
