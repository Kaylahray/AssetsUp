import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity("starknet_transactions")
@Index(["entityId", "entityType"])
@Index(["userId"])
@Index(["status"])
export class StarknetTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  @Index()
  transactionHash: string

  @Column()
  operation: string

  @Column()
  entityId: string

  @Column()
  entityType: string

  @Column()
  userId: string

  @Column()
  status: string

  @Column("jsonb", { nullable: true })
  receipt: any

  @Column({ nullable: true })
  errorMessage: string

  @Column({ type: "bigint", nullable: true })
  gasUsed: number

  @Column({ type: "timestamp" })
  submittedAt: Date

  @Column({ type: "timestamp", nullable: true })
  confirmedAt: Date

  @Column({ type: "timestamp", nullable: true })
  finalizedAt: Date

  @Column({ type: "timestamp", nullable: true })
  failedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
