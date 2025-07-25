import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('insurance')
export class Insurance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  assetName: string;

  @Column()
  insurer: string;

  @Column()
  policyNumber: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column()
  coverageType: string;
} 