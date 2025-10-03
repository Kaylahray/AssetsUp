import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FileUpload } from '../../file-uploads/entities/file-upload.entity';
import { Asset } from 'src/assets/entities/assest.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  contactInfo: string;

  @Column({ nullable: true })
  address: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  // This should be uncommented when the Asset entity is created
  @OneToMany(() => Asset, (asset) => asset.supplier)
  assets: Asset[];

  @OneToMany(() => FileUpload, (fileUpload) => fileUpload.supplier)
  files: FileUpload[];
}
