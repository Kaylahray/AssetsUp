import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum MobileDeviceStatus {
  AVAILABLE = "available",
  ASSIGNED = "assigned",
  MAINTENANCE = "maintenance",
  DECOMMISSIONED = "decommissioned",
  LOST = "lost",
  STOLEN = "stolen",
}

export enum MobileDeviceType {
  PHONE = "phone",
  TABLET = "tablet",
  LAPTOP = "laptop",
  SMARTWATCH = "smartwatch",
}

export enum OperatingSystem {
  ANDROID = "android",
  IOS = "ios",
  WINDOWS = "windows",
  MACOS = "macos",
  LINUX = "linux",
}

@Entity("mobile_devices")
@Index(["imei"], { unique: true })
@Index(["serialNumber"], { unique: true })
export class MobileDevice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 50 })
  model: string;

  @Column({ type: "varchar", length: 50 })
  manufacturer: string;

  @Column({ type: "varchar", length: 15, unique: true })
  imei: string;

  @Column({ type: "varchar", length: 100, unique: true })
  serialNumber: string;

  @Column({
    type: "enum",
    enum: MobileDeviceType,
    default: MobileDeviceType.PHONE,
  })
  deviceType: MobileDeviceType;

  @Column({
    type: "enum",
    enum: OperatingSystem,
  })
  operatingSystem: OperatingSystem;

  @Column({ type: "varchar", length: 50 })
  osVersion: string;

  @Column({
    type: "enum",
    enum: MobileDeviceStatus,
    default: MobileDeviceStatus.AVAILABLE,
  })
  status: MobileDeviceStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  phoneNumber: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  simCardNumber: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  carrier: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  dataPlan: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: "varchar", length: 10, nullable: true })
  purchaseCurrency: string;

  @Column({ type: "date", nullable: true })
  purchaseDate: Date;

  @Column({ type: "date", nullable: true })
  warrantyExpiry: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  warrantyProvider: string;

  @Column({ type: "text", nullable: true })
  warrantyTerms: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  insuranceProvider: string;

  @Column({ type: "date", nullable: true })
  insuranceExpiry: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  insuranceValue: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  location: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  department: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "date", nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: "date", nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: "date", nullable: true })
  lastOsUpdate: Date;

  @Column({ type: "varchar", length: 50, nullable: true })
  currentOsVersion: string;

  @Column({ type: "boolean", default: false })
  isOsUpdateAvailable: boolean;

  @Column({ type: "varchar", length: 50, nullable: true })
  availableOsVersion: string;

  @Column({ type: "date", nullable: true })
  decommissionDate: Date;

  @Column({ type: "text", nullable: true })
  decommissionReason: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  decommissionedBy: string;

  // User assignment
  @Column({ type: "uuid", nullable: true })
  assignedUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "assignedUserId" })
  assignedUser: User;

  @Column({ type: "date", nullable: true })
  assignedDate: Date;

  @Column({ type: "date", nullable: true })
  returnDate: Date;

  @Column({ type: "text", nullable: true })
  assignmentNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 