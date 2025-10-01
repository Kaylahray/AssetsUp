import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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
  //   @OneToMany(() => Asset, (asset) => asset.supplier)
  //   assets: Asset[];
}
