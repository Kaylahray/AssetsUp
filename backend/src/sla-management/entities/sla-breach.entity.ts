import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SLABreachSeverity } from '../sla.enums';
import { SLARecord } from './sla-record.entity';

@Entity('sla_breaches')
export class SLABreach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sla_record_id' })
  slaRecordId: string;

  @ManyToOne(() => SLARecord, (slaRecord) => slaRecord.breaches)
  @JoinColumn({ name: 'sla_record_id' })
  slaRecord: SLARecord;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: SLABreachSeverity,
  })
  severity: SLABreachSeverity;

  @Column({ type: 'timestamp' })
  breachTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedTime?: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ type: 'int', nullable: true, comment: 'Time to resolve in hours' })
  resolutionTimeHours?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
