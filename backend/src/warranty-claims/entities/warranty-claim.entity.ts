import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { WarrantyClaimStatus } from '../enums/warranty-claim-status.enum';

@Entity('warranty_claims')
@Index(['status', 'claimDate'])
@Index(['assetId'])
@Index(['warrantyId'])
export class WarrantyClaim {
  @PrimaryGeneratedColumn('uuid')
  claimId: string;

  @Column({ type: 'uuid' })
  @Index()
  assetId: string;

  @Column({ type: 'uuid' })
  @Index()
  warrantyId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  claimDate: Date;

  @Column({
    type: 'enum',
    enum: WarrantyClaimStatus,
    default: WarrantyClaimStatus.SUBMITTED,
  })
  @Index()
  status: WarrantyClaimStatus;

  @Column({ type: 'json', nullable: true })
  supportingDocs: string[];

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ type: 'uuid', nullable: true })
  vendorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}