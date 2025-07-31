import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

export enum ApiKeyScope {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

@Entity("api_keys")
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  keyHash: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  ownerId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ownerId" })
  owner: User

  @Column({ type: "enum", enum: ApiKeyScope, array: true })
  scopes: ApiKeyScope[]

  @Column({ type: "timestamp", nullable: true })
  expirationDate: Date

  @Column({ default: false })
  revoked: boolean

  @Column({ type: "timestamp", nullable: true })
  revokedAt: Date

  @Column({ nullable: true })
  revokedBy: string

  @Column({ nullable: true })
  revokedReason: string

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date

  @Column({ default: 0 })
  usageCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
