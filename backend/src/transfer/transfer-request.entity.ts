import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index
} from 'typeorm';
import { TransferStatus } from './enums/transfer-status.enum';

@Entity('transfer_requests')
export class TransferRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() // search by asset
  @Column({ type: 'varchar', length: 100 })
  assetId: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  requestedBy: string; // userId/email/name—free-form

  @Column({ type: 'varchar', length: 200 })
  fromLocation: string;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  toLocation: string;

  @Index()
  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.Initiated })
  status: TransferStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvalDate: Date | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}