import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum BranchStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("branches")
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  address: string;

  @Column("decimal", { precision: 10, scale: 6 })
  latitude: number;

  @Column("decimal", { precision: 10, scale: 6 })
  longitude: number;

  @Column()
  manager: string;

  @Column({
    type: "enum",
    enum: BranchStatus,
    default: BranchStatus.ACTIVE,
  })
  status: BranchStatus;
}
