import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { StockTransactionType } from "../dto/stock-transaction.dto"
import { InventoryItem } from "./inventory-item.entity"
import { User } from "../../users/entities/user.entity"

@Entity("stock_transactions")
export class StockTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  inventoryItemId: string

  @ManyToOne(
    () => InventoryItem,
    (item) => item.stockTransactions,
  )
  @JoinColumn({ name: "inventoryItemId" })
  inventoryItem: InventoryItem

  @Column({
    type: "enum",
    enum: StockTransactionType,
  })
  type: StockTransactionType

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantityBefore: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantityAfter: number

  @Column({ nullable: true })
  referenceNumber: string

  @Column({ nullable: true })
  requestedBy: string

  @Column({ type: "text", nullable: true })
  reason: string

  @Column({ nullable: true })
  performedById: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "performedById" })
  performedBy: User

  @Column({ nullable: true })
  onChainId: string

  @Column({ type: "timestamp", nullable: true })
  transactionDate: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
