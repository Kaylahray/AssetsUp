import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum IncidentResolutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  severity?: string;

  @CreateDateColumn()
  date: Date;

  @Column({
    type: 'enum',
    enum: IncidentResolutionStatus,
    default: IncidentResolutionStatus.PENDING,
  })
  resolutionStatus: IncidentResolutionStatus;

  @Column({ nullable: true })
  asset?: string;

  @Column({ nullable: true })
  department?: string;
} 