import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Asset } from '../../assets/entities/assest.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export enum FileCategory {
  PURCHASE_RECEIPT = 'purchase_receipt',
  CONTRACT = 'contract',
  MANUAL = 'manual',
  OTHER = 'other',
}

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({
    type: 'enum',
    enum: FileCategory,
    default: FileCategory.OTHER,
  })
  category: FileCategory;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Asset, (asset) => asset.files, { nullable: true })
  asset: Asset;

  @Column({ nullable: true })
  assetId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.files, { nullable: true })
  supplier: Supplier;

  @Column({ nullable: true })
  supplierId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
