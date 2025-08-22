import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BarcodeType {
  QR = 'QR',
  CODE128 = 'CODE128',
}

@Entity('barcodes')
export class Barcode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referenceId: string; // assetId or any item reference

  @Column()
  code: string;

  @Column({ type: 'enum', enum: BarcodeType, default: BarcodeType.CODE128 })
  type: BarcodeType;

  @Column({ nullable: true })
  imagePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}