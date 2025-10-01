import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AssetRegistration } from './asset-registration.entity';

export enum ProcurementStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('procurement_requests')
@Index(['status'])
@Index(['requestedBy'])
export class ProcurementRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  itemName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 255 })
  requestedBy: string;

  @Column({ type: 'enum', enum: ProcurementStatus, default: ProcurementStatus.PENDING })
  status: ProcurementStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  decidedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  decidedBy: string | null;

  @OneToOne(() => AssetRegistration, (ar) => ar.procurementRequest, { nullable: true })
  @JoinColumn({ name: 'assetRegistrationId' })
  assetRegistration?: AssetRegistration | null;

  @Column({ type: 'int', nullable: true, unique: true })
  assetRegistrationId?: number | null;
}

