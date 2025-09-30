import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AssetSubcategory } from '../asset-subcategories/entities/asset-subcategory.entity';

@Entity('asset_categories')
export class AssetCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

    // Relationship with subcategories
    @OneToMany(() => AssetSubcategory, subcategory => subcategory.parentCategory)
    subcategories: AssetSubcategory[];
}
