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

export enum TransferStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export enum TransferType {
  USER_TO_USER = "user_to_user",
  USER_TO_DEPARTMENT = "user_to_department",
  DEPARTMENT_TO_USER = "department_to_user",
  DEPARTMENT_TO_DEPARTMENT = "department_to_department",
  INITIAL_ASSIGNMENT = "initial_assignment",
}

@Entity("asset_transfers")
export class AssetTransfer {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => Asset, { onDelete: "CASCADE" })
  @JoinColumn({ name: "assetId" })
  asset: Asset

  @Column()
  assetId: string

  @Column({
    type: "enum",
    enum: TransferType,
    default: TransferType.USER_TO_USER,
  })
  transferType: TransferType

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "fromUserId" })
  fromUser: User

  @Column({ nullable: true })
  fromUserId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "toUserId" })
  toUser: User

  @Column({ nullable: true })
  toUserId: string

  @Column({ nullable: true })
  fromDepartment: string

  @Column({ nullable: true })
  toDepartment: string

  @Column({ type: "date" })
  transferDate: Date

  @Column({ nullable: true })
  dueDate: Date

  @Column({ nullable: true, type: "text" })
  reason: string

  @Column({
    type: "enum",
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "requestedById" })
  requestedBy: User

  @Column({ nullable: true })
  requestedById: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approvedById" })
  approvedBy: User

  @Column({ nullable: true })
  approvedById: string

  @Column({ nullable: true })
  onChainId: string

  @Column({ nullable: true, type: "text" })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
