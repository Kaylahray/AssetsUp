import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Department } from '../../departments/entities/department.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  serialNumber: string;

  @Column({ type: 'date' })
  purchaseDate: Date;

  @Column({ type: 'date', nullable: true })
  warrantyEnd?: Date;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'assigned_department_id' })
  assignedDepartment?: Department;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  purchaseCost?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
