import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { VendorType, VendorStatus } from "./vendor.enums";

@Entity("vendors")
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: "enum",
    enum: VendorType,
  })
  type: VendorType;

  @Column({ length: 255, nullable: true })
  contactPerson?: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, unique: true })
  taxId: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({
    type: "enum",
    enum: VendorStatus,
    default: VendorStatus.ACTIVE,
  })
  status: VendorStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
