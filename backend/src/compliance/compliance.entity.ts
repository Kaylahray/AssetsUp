import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class ComplianceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({
    type: "enum",
    enum: ["PENDING", "COMPLETED", "OVERDUE"],
    default: "PENDING",
  })
  status: "PENDING" | "COMPLETED" | "OVERDUE";

  @Column({ nullable: true })
  notes: string;

  @Column({ type: "timestamp" })
  deadline: Date;

  @Column({ nullable: true })
  assetId: string;

  @Column({ nullable: true })
  assetTitle: string;

  @Column({ nullable: true })
  certificationUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
