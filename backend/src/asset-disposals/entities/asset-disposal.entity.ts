import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DisposalMethod {
  SALE = 'sale',
  DONATION = 'donation',
  SCRAP = 'scrap',
  OTHER = 'other',
}

@Entity('asset_disposals')
@Index(['assetId', 'disposalDate'])
export class AssetDisposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  assetId: string;

  @Column({ type: 'timestamp' })
  disposalDate: Date;

  @Column({ type: 'enum', enum: DisposalMethod })
  method: DisposalMethod;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column()
  approvedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}