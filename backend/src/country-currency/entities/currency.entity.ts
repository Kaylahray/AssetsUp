import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Country } from "./country.entity"

@Entity("currencies")
export class Currency {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true, length: 3 })
  code: string // ISO 4217 currency code (e.g., 'USD', 'EUR')

  @Column({ length: 100 })
  name: string // e.g., 'US Dollar', 'Euro'

  @Column({ length: 10 })
  symbol: string // e.g., '$', '€', '£'

  @Column("decimal", { precision: 15, scale: 6, default: 1.0 })
  exchangeRateToUSD: number // Exchange rate relative to USD

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  exchangeRateUpdatedAt: Date

  @Column({ default: 2 })
  decimalPlaces: number // Number of decimal places for this currency

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  isBaseCurrency: boolean // Mark if this is the base currency for calculations

  @Column("uuid", { nullable: true })
  countryId: string

  @ManyToOne(
    () => Country,
    (country) => country.currencies,
  )
  @JoinColumn({ name: "countryId" })
  country: Country

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
