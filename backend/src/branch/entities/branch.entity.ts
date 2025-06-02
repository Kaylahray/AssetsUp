import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Asset } from "../../assets/entities/asset.entity"
import { Inventory } from "../../inventory/entities/inventory.entity"
import { User } from "../../users/entities/user.entity"
import { Transaction } from "../../transactions/entities/transaction.entity"

@Entity("branches")
@Index(["branchCode"], { unique: true })
@Index(["city", "state"])
@Index(["isActive"])
export class Branch {
  @ApiProperty({ description: "Unique identifier for the branch" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "Branch name", maxLength: 100 })
  @Column({ length: 100 })
  @Index()
  name: string

  @ApiProperty({ description: "Branch address", maxLength: 255 })
  @Column({ length: 255 })
  address: string

  @ApiProperty({ description: "City", maxLength: 100 })
  @Column({ length: 100 })
  city: string

  @ApiProperty({ description: "State/Province", maxLength: 100 })
  @Column({ length: 100 })
  state: string

  @ApiProperty({ description: "Country", maxLength: 100 })
  @Column({ length: 100 })
  country: string

  @ApiProperty({ description: "Phone number", required: false })
  @Column({ length: 20, nullable: true })
  phone: string

  @ApiProperty({ description: "Email address", required: false })
  @Column({ length: 100, nullable: true })
  email: string

  @ApiProperty({ description: "Active status", default: true })
  @Column({ default: true })
  isActive: boolean

  @ApiProperty({ description: "Branch description", required: false })
  @Column({ type: "text", nullable: true })
  description: string

  @ApiProperty({ description: "Unique branch code", maxLength: 10 })
  @Column({ length: 10, unique: true })
  branchCode: string

  @ApiProperty({ description: "Latitude coordinate", required: false })
  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  latitude: number

  @ApiProperty({ description: "Longitude coordinate", required: false })
  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  longitude: number

  @ApiProperty({ description: "Branch manager ID", required: false })
  @Column({ type: "uuid", nullable: true })
  managerId: string

  @ApiProperty({ description: "Operating hours", required: false })
  @Column({ type: "json", nullable: true })
  operatingHours: {
    [key: string]: { open: string; close: string; closed?: boolean }
  }

  @ApiProperty({ description: "Branch timezone", required: false })
  @Column({ length: 50, nullable: true, default: "UTC" })
  timezone: string

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn()
  updatedAt: Date

  // Relationships
  @ApiProperty({ description: "Assets assigned to this branch", type: () => [Asset] })
  @OneToMany(
    () => Asset,
    (asset) => asset.branch,
    { cascade: true },
  )
  assets: Asset[]

  @ApiProperty({ description: "Inventories in this branch", type: () => [Inventory] })
  @OneToMany(
    () => Inventory,
    (inventory) => inventory.branch,
    { cascade: true },
  )
  inventories: Inventory[]

  @ApiProperty({ description: "Transactions from this branch", type: () => [Transaction] })
  @OneToMany(
    () => Transaction,
    (transaction) => transaction.branch,
  )
  transactions: Transaction[]

  @ApiProperty({ description: "Users assigned to this branch", type: () => [User] })
  @ManyToMany(
    () => User,
    (user) => user.branches,
  )
  @JoinTable({
    name: "user_branches",
    joinColumn: { name: "branch_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
  })
  users: User[]
}
