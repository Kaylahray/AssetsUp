import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("inventory_items")
export class InventoryItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column({ length: 100, unique: true })
  sku: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "integer", default: 0 })
  currentStock: number

  @Column({ type: "integer", default: 10 })
  minimumThreshold: number

  @Column({ type: "integer", default: 5 })
  criticalThreshold: number

  @Column({ type: "integer", nullable: true })
  maximumStock: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  unitPrice: number

  @Column({ length: 50, nullable: true })
  unit: string

  @Column({ length: 255, nullable: true })
  supplier: string

  @Column({ length: 255, nullable: true })
  location: string

  @Column({ length: 255, nullable: true })
  category: string

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "date", nullable: true })
  lastRestockedDate: Date

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
