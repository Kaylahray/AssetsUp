import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity'; // Assuming this path

@Entity('cargo')
export class Cargo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  shipmentId: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.cargoItems)
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number; // e.g., in kilograms

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // e.g., in USD

  @CreateDateColumn()
  createdAt: Date;
}