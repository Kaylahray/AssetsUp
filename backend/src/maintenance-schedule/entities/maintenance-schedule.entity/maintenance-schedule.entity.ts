import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

@Entity()
export class MaintenanceSchedule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  assetId: string;

  @Column({ type: "timestamp" })
  scheduleDate: Date;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column({ default: "pending" }) // or use enum
  status: "pending" | "completed";
}
