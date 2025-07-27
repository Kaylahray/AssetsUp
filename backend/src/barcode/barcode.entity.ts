import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('barcodes')
export class Barcode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar' })
  format: 'png' | 'svg';

  @Column({ type: 'bytea' })
  image: Buffer;

  @CreateDateColumn()
  createdAt: Date;
}
