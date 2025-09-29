import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  INSPECTION = 'inspection',
  REPLACEMENT = 'replacement',
  SERVICE = 'service',
  OTHER = 'other',
}

@Entity('asset_maintenance')
@Index(['assetId', 'scheduledDate'])
export class AssetMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  assetId: string;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date | null;

  @Column({ type: 'enum', enum: MaintenanceType })
  maintenanceType: MaintenanceType;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}