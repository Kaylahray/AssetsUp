import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { InsurancePolicyStatus, InsuranceType, CoverageLevel, RenewalStatus } from '../insurance.enums';
import { PolicyDocument } from './policy-document.entity';

@Entity('insurance_policies')
export class InsurancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  policyNumber: string;

  @Column({ length: 255 })
  provider: string;

  @Column({ name: 'asset_id', nullable: true })
  assetId?: string;

  @Column({ name: 'asset_category', length: 100, nullable: true })
  assetCategory?: string;

  @Column({ type: 'timestamp' })
  coverageStart: Date;

  @Column({ type: 'timestamp' })
  coverageEnd: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  insuredValue: number;

  @Column({ type: 'text', nullable: true })
  termsUrl?: string;

  @Column({
    type: 'enum',
    enum: InsurancePolicyStatus,
    default: InsurancePolicyStatus.ACTIVE,
  })
  status: InsurancePolicyStatus;

  @Column({
    type: 'enum',
    enum: InsuranceType,
    default: InsuranceType.COMPREHENSIVE,
  })
  insuranceType: InsuranceType;

  @Column({
    type: 'enum',
    enum: CoverageLevel,
    default: CoverageLevel.STANDARD,
  })
  coverageLevel: CoverageLevel;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  premiumAmount?: number;

  @Column({ length: 50, nullable: true })
  paymentFrequency?: string; // monthly, quarterly, annually

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  deductible?: number;

  @Column({ type: 'text', nullable: true })
  coverageDetails?: string;

  @Column({ type: 'text', nullable: true })
  exclusions?: string;

  @Column({ length: 255, nullable: true })
  contactPerson?: string;

  @Column({ length: 20, nullable: true })
  contactPhone?: string;

  @Column({ length: 255, nullable: true })
  contactEmail?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastRenewalDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRenewalDate?: Date;

  @Column({ type: 'int', default: 30, comment: 'Days before expiry to send renewal reminder' })
  renewalReminderDays: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => PolicyDocument, (document) => document.insurancePolicy)
  documents: PolicyDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isExpired(): boolean {
    return new Date() > this.coverageEnd;
  }

  get isExpiringSoon(): boolean {
    const reminderDate = new Date(this.coverageEnd);
    reminderDate.setDate(reminderDate.getDate() - this.renewalReminderDays);
    return new Date() >= reminderDate && !this.isExpired;
  }

  get remainingCoverageDays(): number {
    if (this.isExpired) return 0;
    const now = new Date();
    const diffTime = this.coverageEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get coverageDurationDays(): number {
    const diffTime = this.coverageEnd.getTime() - this.coverageStart.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get renewalStatus(): RenewalStatus {
    if (this.status === InsurancePolicyStatus.CANCELLED) {
      return RenewalStatus.CANCELLED;
    }
    
    if (this.isExpired) {
      return RenewalStatus.OVERDUE;
    }
    
    if (this.isExpiringSoon) {
      return RenewalStatus.DUE_SOON;
    }
    
    if (this.lastRenewalDate && this.lastRenewalDate > this.coverageStart) {
      return RenewalStatus.RENEWED;
    }
    
    return RenewalStatus.NOT_DUE;
  }

  get coveragePercentageRemaining(): number {
    if (this.isExpired) return 0;
    const totalDays = this.coverageDurationDays;
    const remainingDays = this.remainingCoverageDays;
    return Math.round((remainingDays / totalDays) * 100);
  }
}
