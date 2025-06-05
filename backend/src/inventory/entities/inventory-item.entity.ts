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
import { StockTransaction } from "./stock-transaction.entity"
import { Branch } from "../../branches/entities/branch.entity"

@Entity("inventory_items")
export class InventoryItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  sku: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column()
  category: string

  @Column({ type: "int" })
  quantity: number

  @Column()
  unit: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  cost: number

  @Column({ type: "int" })
  reorderPoint: number

  @Column({ nullable: true })
  department: string

  @Column({ nullable: true })
  location: string

  @Column({ nullable: true })
  supplierId: string

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ nullable: true })
  onChainId: string

  @ManyToOne(
    () => Branch,
    (branch) => branch.inventoryItems,
    { nullable: true },
  )
  @JoinColumn({ name: "branchId" })
  branch: Branch

  @Column({ nullable: true })
  branchId: string

  @OneToMany(
    () => StockTransaction,
    (transaction) => transaction.inventoryItem,
  )
  transactions: StockTransaction[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
