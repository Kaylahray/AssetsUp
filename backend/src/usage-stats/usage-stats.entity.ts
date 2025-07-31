import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UsageStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  department: string;

  @Column('float')
  usageHours: number;

  @Column()
  assetType: string;

  @Column()
  date: Date;
}
