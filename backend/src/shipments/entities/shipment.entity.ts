import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Cargo } from '../../cargo/entities/cargo.entity'; // Assuming this path

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ... other shipment fields like trackingNumber, origin, destination, etc.

  // --- ADD THIS RELATIONSHIP ---
  @OneToMany(() => Cargo, (cargo) => cargo.shipment)
  cargoItems: Cargo[];
}