import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Warranty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  assetName: string;

  @Column()
  warrantyDurationInDays: number;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column('text')
  terms: string;

  @CreateDateColumn()
  createdAt: Date;
}
