import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum AssetStatus {
  ACTIVE = 'active',
  UNDER_MAINTENANCE = 'under_maintenance',
  IN_TRANSFER = 'in_transfer',
  DISPOSED = 'disposed',
}

@Entity('status_history')
@Index(['assetId'])
@Index(['changeDate'])
export class StatusHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the asset (mock reference, no FK)' })
  @Column()
  assetId: string;

  @ApiProperty({ enum: AssetStatus })
  @Column({ type: 'enum', enum: AssetStatus })
  previousStatus: AssetStatus;

  @ApiProperty({ enum: AssetStatus })
  @Column({ type: 'enum', enum: AssetStatus })
  newStatus: AssetStatus;

  @ApiProperty({ description: 'When the status changed' })
  @CreateDateColumn()
  changeDate: Date;

  @ApiProperty({ description: 'User identifier who made the change' })
  @Column()
  changedBy: string;
}
