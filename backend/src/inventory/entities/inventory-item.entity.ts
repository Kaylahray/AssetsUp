import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum InventoryStatus {
  ACTIVE = 'active',
  DISPOSED = 'disposed',
}

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  sku: string;

  @Column({ type: 'int' })
  quantity: number;

  // Default threshold of 10 units
  @Column({ type: 'int', default: 10 })
  threshold: number;

  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.ACTIVE })
  status: InventoryStatus;
}