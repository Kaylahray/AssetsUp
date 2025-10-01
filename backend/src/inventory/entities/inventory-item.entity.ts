import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum InventoryStatus {
  ACTIVE = 'active',
  DISPOSED = 'disposed',
}

@Entity()
export class InventoryItem {
  @ApiProperty({ description: 'Unique identifier for the inventory item', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the inventory item', example: 'Laptop Dell XPS 15' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Stock Keeping Unit identifier', example: 'SKU-LAP-DELL-XPS15' })
  @Column()
  sku: string;

  @ApiProperty({ description: 'Current quantity in stock', example: 25 })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ description: 'Low stock threshold', example: 10 })
  @Column({ type: 'int', default: 10 })
  threshold: number;

  @ApiProperty({ enum: InventoryStatus, example: InventoryStatus.ACTIVE })
  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.ACTIVE })
  status: InventoryStatus;
}