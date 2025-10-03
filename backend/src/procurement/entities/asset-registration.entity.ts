import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ProcurementRequest } from './procurement-request.entity';

export enum AssetStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

@Entity('asset_registrations')
export class AssetRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  assetId: string;

  @Column({ type: 'varchar', length: 255 })
  assetName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  serialNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cost: number | null;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.PENDING })
  status: AssetStatus;

  @Column({ type: 'varchar', length: 255 })
  assignedTo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => ProcurementRequest, (pr) => pr.assetRegistration)
  procurementRequest: ProcurementRequest;

  /**
   * Generate a unique asset ID based on prefix and ID
   */
  generateAssetId(): string {
    const prefix = 'AST';
    const paddedId = this.id.toString().padStart(6, '0');
    return `${prefix}-${paddedId}`;
  }
}
