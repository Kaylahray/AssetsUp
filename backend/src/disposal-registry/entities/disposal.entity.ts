import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DisposalType {
  RESALE = 'resale',
  SCRAPPED = 'scrapped',
  DONATION = 'donation',
  RECYCLED = 'recycled',
  OTHER = 'other',
}

@Entity('disposal_records')
export class DisposalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DisposalType,
    default: DisposalType.OTHER,
  })
  disposalType: DisposalType;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'jsonb' })
  assetData: Record<string, any>;

  @Column({ type: 'uuid' })
  responsibleUserId: string;

  @Column({ type: 'timestamp' })
  disposalDate: Date;

  @Column({ type: 'text', nullable: true })
  additionalNotes?: string;

  @Column({ type: 'decimal', nullable: true })
  disposalValue?: number;

  @Column({ type: 'boolean', default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isSoftDeleted: boolean;
}
