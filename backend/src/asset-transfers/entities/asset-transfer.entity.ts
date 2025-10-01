import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('asset_transfers')
export class AssetTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  assetId: string;

  @Column({ type: 'int', nullable: true })
  fromDepartmentId: number;

  @Column({ type: 'int' })
  toDepartmentId: number;

  @Column({ type: 'timestamp' })
  transferDate: Date;

  @Column({ type: 'varchar', length: 255 })
  initiatedBy: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}


