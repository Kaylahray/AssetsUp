import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Currency } from "./currency.entity"

@Entity("countries")
export class Country {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true, length: 100 })
  name: string

  @Column({ unique: true, length: 2 })
  isoCode2: string // ISO 3166-1 alpha-2 (e.g., 'US', 'GB')

  @Column({ unique: true, length: 3 })
  isoCode3: string // ISO 3166-1 alpha-3 (e.g., 'USA', 'GBR')

  @Column({ unique: true, length: 3 })
  numericCode: string // ISO 3166-1 numeric (e.g., '840', '826')

  @Column({ length: 100 })
  region: string // e.g., 'North America', 'Europe'

  @Column({ length: 100 })
  subRegion: string // e.g., 'Northern America', 'Western Europe'

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => Currency,
    (currency) => currency.country,
  )
  currencies: Currency[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
