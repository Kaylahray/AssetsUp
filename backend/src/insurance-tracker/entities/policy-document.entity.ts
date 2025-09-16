import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InsurancePolicy } from './insurance-policy.entity';

@Entity('policy_documents')
export class PolicyDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'insurance_policy_id' })
  insurancePolicyId: string;

  @ManyToOne(() => InsurancePolicy, (policy) => policy.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'insurance_policy_id' })
  insurancePolicy: InsurancePolicy;

  @Column({ length: 255 })
  fileName: string;

  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ type: 'int' })
  fileSize: number;

  @Column({ type: 'text' })
  filePath: string;

  @Column({ length: 100, nullable: true })
  documentType?: string; // policy, certificate, amendment, claim_form, etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  uploadedAt: Date;

  @Column({ length: 255, nullable: true })
  uploadedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fileUrl(): string {
    return `/uploads/insurance/${this.fileName}`;
  }

  get fileSizeFormatted(): string {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
