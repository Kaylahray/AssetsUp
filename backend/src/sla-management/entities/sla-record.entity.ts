import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SLAStatus, SLAPriority, AssetCategory } from '../sla.enums';
import { Vendor } from '../../VendorSupplierModule/vendor.entity';
import { SLABreach } from './sla-breach.entity';

@Entity('sla_records')
export class SLARecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vendor_id' })
  vendorId: string;

  @ManyToOne(() => Vendor, { eager: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'text' })
  serviceDescription: string;

  @Column({ type: 'timestamp' })
  coverageStart: Date;

  @Column({ type: 'timestamp' })
  coverageEnd: Date;

  @Column({
    type: 'enum',
    enum: AssetCategory,
  })
  assetCategory: AssetCategory;

  @Column({ type: 'text' })
  breachPolicy: string;

  @Column({
    type: 'enum',
    enum: SLAStatus,
    default: SLAStatus.ACTIVE,
  })
  status: SLAStatus;

  @Column({
    type: 'enum',
    enum: SLAPriority,
    default: SLAPriority.MEDIUM,
  })
  priority: SLAPriority;

  @Column({ type: 'int', default: 24, comment: 'Response time in hours' })
  responseTimeHours: number;

  @Column({ type: 'int', default: 72, comment: 'Resolution time in hours' })
  resolutionTimeHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 99.9, comment: 'Uptime percentage' })
  uptimePercentage: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => SLABreach, (breach) => breach.slaRecord)
  breaches: SLABreach[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property to check if SLA is expired
  get isExpired(): boolean {
    return new Date() > this.coverageEnd;
  }

  // Computed property to check if SLA is expiring soon (within 30 days)
  get isExpiringSoon(): boolean {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.coverageEnd <= thirtyDaysFromNow && !this.isExpired;
  }
}
