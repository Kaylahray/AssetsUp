import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { DisposalMethod } from "./disposal-method.enum";

@Entity({ name: "disposal_records" })
export class DisposalRecord {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar", length: 100 })
  assetId!: string; // only a reference id, no FK required

  @Column({ type: "enum", enum: DisposalMethod })
  disposalMethod!: DisposalMethod;

  @Column({ type: "date" })
  disposalDate!: string; // store as ISO date (YYYY-MM-DD)

  @Column({ type: "numeric", precision: 14, scale: 2, default: 0 })
  finalValue!: string; // keep numeric as string to avoid float drift

  @Column({ type: "varchar", length: 200, nullable: true })
  reason?: string | null;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deletedAt?: Date | null;
}
