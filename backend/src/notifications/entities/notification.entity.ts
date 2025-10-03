import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  type: string; // 'asset_transfer', 'low_stock', 'maintenance_due'

  @Column('json', { nullable: true })
  metadata: Record<string, any>; // Additional data for the notification

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
