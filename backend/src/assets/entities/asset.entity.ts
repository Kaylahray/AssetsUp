import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Maintenance } from "../../maintenance/entities/maintenance.entity"

@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  serialNumber: string

  @Column({ nullable: true })
  location: string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  purchasePrice: number

  @Column({ type: "date", nullable: true })
  purchaseDate: Date

  @OneToMany(
    () => Maintenance,
    (maintenance) => maintenance.asset,
  )
  maintenanceRecords: Maintenance[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
