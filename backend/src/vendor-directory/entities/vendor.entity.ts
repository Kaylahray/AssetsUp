import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum VendorCategory {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  SERVICES = 'services',
  SUPPLIES = 'supplies',
  MAINTENANCE = 'maintenance',
  CONSULTING = 'consulting',
  OTHER = 'other',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  registrationNumber: string;

  @Column({
    type: 'enum',
    enum: VendorCategory,
    default: VendorCategory.OTHER,
  })
  category: VendorCategory;

  @Column({ type: 'varchar', length: 255 })
  region: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  contactPerson: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalDetails?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxIdentificationNumber?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isSoftDeleted: boolean;
}
